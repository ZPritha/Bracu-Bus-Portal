const mongoose = require('mongoose');
require('dotenv').config();
const Stoppage = require('./models/Stoppage');

mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS: 45000,
  family: 4
})
  .then(async () => {
    console.log('Connected');
    const stoppages = await Stoppage.find({});
    console.log(`Found ${stoppages.length} stoppages`);

    for (const stoppage of stoppages) {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(stoppage.stoppage_name + ', Dhaka, Bangladesh')}&format=json&limit=1`,
          { headers: { 'User-Agent': 'BracuBusApp/1.0' } }
        );
        const data = await res.json();

        if (data.length > 0) {
          await Stoppage.findByIdAndUpdate(stoppage._id, {
            lat: parseFloat(data[0].lat),
            lng: parseFloat(data[0].lon)
          });
          console.log(`✅ ${stoppage.stoppage_name} → ${data[0].lat}, ${data[0].lon}`);
        } else {
          console.log(`❌ Not found: ${stoppage.stoppage_name}`);
        }

        await new Promise(r => setTimeout(r, 1100));
      } catch (err) {
        console.log(`❌ Error for ${stoppage.stoppage_name}:`, err.message);
      }
    }

    console.log('✅ All done!');
    mongoose.disconnect();
  })
  .catch(err => console.log('❌ Error:', err));