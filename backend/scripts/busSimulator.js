/**
 * busSimulator.js
 * ───────────────────────────────────────────────────────────────────────────
 * Simulates real-time bus movement based on schedule pickup/departure times.
 *
 * Schedule logic per trip:
 *   5:00 PM – 6:30 AM  → Bus stays at BRACU
 *   6:30 AM onwards    → Bus departs BRACU, reaches stop 1 at its 1st pickup time
 *   At each stop: bus arrives at pickup time, departs at departure time
 *   After last stop: bus returns to BRACU
 *   1:00 PM            → Bus stays at BRACU until 2nd trip begins
 *   2nd trip: same process using second_pickup_time / second_departure_time
 *   5:00 PM            → Bus back at BRACU for the night
 *
 * Run: node scripts/busSimulator.js
 * Keep running alongside your server.
 * ───────────────────────────────────────────────────────────────────────────
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');

// ── Models ──────────────────────────────────────────────────────────────────
const Bus         = require('../models/Bus');
const BusLocation = require('../models/BusLocation');
const Schedule    = require('../models/Schedule');
const Stoppage    = require('../models/Stoppage');

// ── BRACU coordinates ────────────────────────────────────────────────────────
const BRACU = { lat: 23.7807, lng: 90.4394 };

// ── Known bus data (from your DB) ────────────────────────────────────────────
// Bus → Route mapping (bus_id : route_id)
const BUS_ROUTE_MAP = [
  { bus_id: '69e9df83c12c2a3609dc0a72', route_id: '69b4161c6462598db3bd3215', bus_number: 'B01' }, // Route 01
  { bus_id: '69e9df83c12c2a3609dc0a73', route_id: '69b4161c6462598db3bd3217', bus_number: 'B02' }, // Route 03
  { bus_id: '69e9df83c12c2a3609dc0a74', route_id: '69b4161c6462598db3bd3216', bus_number: 'B03' }, // Route 02
  { bus_id: '69e9df83c12c2a3609dc0a75', route_id: '69e69439a7c0e332f95d4b77', bus_number: 'B04' }, // Route 04
  { bus_id: '69ed1013c5f94aa8efc5506e', route_id: '69ed1013c5f94aa8efc5506d', bus_number: 'B06' }, // Route 06
];

// ── Helpers ──────────────────────────────────────────────────────────────────

// Convert "HH:MM AM/PM" or "HH:MM" → total minutes since midnight
function timeToMinutes(str) {
  if (!str) return null;
  const clean = str.trim().toUpperCase();
  const [timePart, period] = clean.split(' ');
  let [h, m] = timePart.split(':').map(Number);
  if (period === 'PM' && h !== 12) h += 12;
  if (period === 'AM' && h === 12) h = 0;
  return h * 60 + m;
}

// Current time in minutes since midnight (local time)
function nowMinutes() {
  const n = new Date();
  return n.getHours() * 60 + n.getMinutes() + n.getSeconds() / 60;
}

// Linear interpolate between two coords
function lerp(a, b, t) {
  return { lat: a.lat + (b.lat - a.lat) * t, lng: a.lng + (b.lng - a.lng) * t };
}

// ── Core: compute bus position for a given route ─────────────────────────────
async function computeBusPosition(routeId) {
  // Load all schedules for this route, ordered by stoppage_order
  const schedules = await Schedule.find({ route_id: routeId })
    .populate({ path: 'stoppage_id', model: 'Stoppage' })
    .lean();

  if (!schedules.length) return null;

  // Sort by stoppage_order
  schedules.sort((a, b) =>
    (a.stoppage_id?.stoppage_order || 0) - (b.stoppage_id?.stoppage_order || 0)
  );

  // Build stop list: each entry has { name, lat, lng, pickup1, depart1, pickup2, depart2 }
  const stops = schedules.map(s => {
    const st = s.stoppage_id;
    return {
      name:    st?.stoppage_name || 'Unknown',
      lat:     st?.lat  || null,
      lng:     st?.lng  || null,
      pickup1: timeToMinutes(s.first_pickup_time),
      depart1: timeToMinutes(s.first_departure_time),
      pickup2: timeToMinutes(s.second_pickup_time),
      depart2: timeToMinutes(s.second_departure_time),
    };
  }).filter(s => s.lat && s.lng); // only stops with coordinates

  if (!stops.length) return null;

  const now = nowMinutes();

  // ── Time boundaries ──────────────────────────────────────────────────────
  // Night: 17:00 (1020) – 06:30 (390 next day, treat as 0–390)
  // We treat 00:00–06:30 and 17:00–24:00 as "at BRACU"
  const NIGHT_START = 17 * 60;       // 5:00 PM = 1020 min
  const NIGHT_END   = 6 * 60 + 30;  // 6:30 AM = 390 min
  const MIDDAY_HOLD = 13 * 60;      // 1:00 PM = 780 min (back at BRACU after trip 1)

  // ── At BRACU periods ─────────────────────────────────────────────────────
  // 1. 17:00 → midnight (1020–1440)
  // 2. midnight → 06:30 (0–390)
  // 3. After trip 1 ends → 13:00 (midday hold)
  if (now >= NIGHT_START || now < NIGHT_END) {
    return { ...BRACU, status: 'At BRACU (Night)' };
  }

  // ── Trip 1: 06:30 → ~13:00 ───────────────────────────────────────────────
  // Bus departs BRACU at 06:30, reaches stop[0] at stop[0].pickup1
  // Then stop by stop until last stop, then returns to BRACU

  const trip1Start = NIGHT_END; // 390 = 6:30 AM
  const trip1FirstPickup = stops[0].pickup1;
  const trip1LastDepart  = stops[stops.length - 1].depart1;

  // Between 06:30 and first stop pickup → bus travelling from BRACU to stop[0]
  if (now >= trip1Start && now < trip1FirstPickup) {
    const t = (now - trip1Start) / (trip1FirstPickup - trip1Start);
    const pos = lerp(BRACU, { lat: stops[0].lat, lng: stops[0].lng }, Math.min(t, 1));
    return { ...pos, status: `Heading to ${stops[0].name}` };
  }

  // Travelling between stops in trip 1
  for (let i = 0; i < stops.length; i++) {
    const s = stops[i];
    // At this stop (between pickup and departure)
    if (now >= s.pickup1 && now < s.depart1) {
      return { lat: s.lat, lng: s.lng, status: `At ${s.name}` };
    }
    // Travelling to next stop
    if (i < stops.length - 1) {
      const next = stops[i + 1];
      if (now >= s.depart1 && now < next.pickup1) {
        const t = (now - s.depart1) / (next.pickup1 - s.depart1);
        const pos = lerp({ lat: s.lat, lng: s.lng }, { lat: next.lat, lng: next.lng }, Math.min(t, 1));
        return { ...pos, status: `Heading to ${next.name}` };
      }
    }
  }

  // After last stop depart1 → heading back to BRACU
  if (now >= trip1LastDepart && now < MIDDAY_HOLD) {
    const t = (now - trip1LastDepart) / (MIDDAY_HOLD - trip1LastDepart);
    const lastStop = stops[stops.length - 1];
    const pos = lerp({ lat: lastStop.lat, lng: lastStop.lng }, BRACU, Math.min(t, 1));
    return { ...pos, status: 'Returning to BRACU' };
  }

  // Midday hold at BRACU: 13:00 until trip 2 first pickup
  const trip2FirstPickup = stops[0].pickup2;
  if (now >= MIDDAY_HOLD && now < trip2FirstPickup) {
    return { ...BRACU, status: 'At BRACU (Midday)' };
  }

  // ── Trip 2 ───────────────────────────────────────────────────────────────
  // BRACU → stop[0] at pickup2
  if (now >= MIDDAY_HOLD && now < trip2FirstPickup) {
    const t = (now - MIDDAY_HOLD) / (trip2FirstPickup - MIDDAY_HOLD);
    const pos = lerp(BRACU, { lat: stops[0].lat, lng: stops[0].lng }, Math.min(t, 1));
    return { ...pos, status: `Heading to ${stops[0].name} (Trip 2)` };
  }

  for (let i = 0; i < stops.length; i++) {
    const s = stops[i];
    if (now >= s.pickup2 && now < s.depart2) {
      return { lat: s.lat, lng: s.lng, status: `At ${s.name} (Trip 2)` };
    }
    if (i < stops.length - 1) {
      const next = stops[i + 1];
      if (now >= s.depart2 && now < next.pickup2) {
        const t = (now - s.depart2) / (next.pickup2 - s.depart2);
        const pos = lerp({ lat: s.lat, lng: s.lng }, { lat: next.lat, lng: next.lng }, Math.min(t, 1));
        return { ...pos, status: `Heading to ${next.name} (Trip 2)` };
      }
    }
  }

  // After trip 2 last stop → back to BRACU by 5PM
  const trip2LastDepart = stops[stops.length - 1].depart2;
  if (now >= trip2LastDepart) {
    const t = Math.min((now - trip2LastDepart) / (NIGHT_START - trip2LastDepart), 1);
    const lastStop = stops[stops.length - 1];
    const pos = lerp({ lat: lastStop.lat, lng: lastStop.lng }, BRACU, t);
    return { ...pos, status: 'Returning to BRACU (End of Day)' };
  }

  // Fallback
  return { ...BRACU, status: 'At BRACU' };
}

// ── Update BusLocation in DB ─────────────────────────────────────────────────
async function updateAllBuses() {
  for (const entry of BUS_ROUTE_MAP) {
    try {
      const pos = await computeBusPosition(entry.route_id);
      if (!pos) {
        console.log(`[${entry.bus_number}] No schedule/coordinates found, skipping.`);
        continue;
      }

      await BusLocation.findOneAndUpdate(
        { bus_id: entry.bus_id },
        {
          bus_id:       entry.bus_id,
          route_id:     entry.route_id,
          latitude:     pos.lat,
          longitude:    pos.lng,
          speed:        pos.status.includes('Heading') ? 40 : 0,
          last_updated: new Date()
        },
        { upsert: true, returnDocument: 'after' }
      );

      const t = new Date().toLocaleTimeString();
      console.log(`[${t}] ${entry.bus_number} → ${pos.status} (${pos.lat.toFixed(4)}, ${pos.lng.toFixed(4)})`);
    } catch (err) {
      console.error(`[${entry.bus_number}] Error:`, err.message);
    }
  }
}

// ── Export for use inside server.js ──────────────────────────────────────────
async function startSimulator() {
  console.log('🚌 Bus Simulator starting...');
  // Wait for mongoose to already be connected (server.js connects first)
  const waitForConnection = () => new Promise((resolve) => {
    if (mongoose.connection.readyState === 1) return resolve();
    mongoose.connection.once('connected', resolve);
  });
  await waitForConnection();
  console.log('✅ Bus Simulator connected');
  await updateAllBuses();
  setInterval(updateAllBuses, 30 * 1000);
  console.log('🔄 Bus Simulator running every 30 seconds');
}

// If run directly: node scripts/busSimulator.js
if (require.main === module) {
  mongoose.connect(process.env.MONGO_URI, { family: 4 })
    .then(startSimulator)
    .catch(err => { console.error('Fatal:', err.message); process.exit(1); });
}

module.exports = { startSimulator };
