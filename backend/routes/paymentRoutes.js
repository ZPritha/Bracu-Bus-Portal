const express = require('express');
const router = express.Router();
const SSLCommerzPayment = require('sslcommerz-lts');
const Booking = require('../models/Booking');
const Student = require('../models/Student');

const store_id = process.env.SSLCOMMERZ_STORE_ID;
const store_passwd = process.env.SSLCOMMERZ_STORE_PASSWORD;
const is_live = process.env.SSLCOMMERZ_IS_LIVE === 'true';
const paymentApiBaseUrl = process.env.PAYMENT_API_BASE_URL || 'http://localhost:9255';
const frontendBaseUrl = process.env.FRONTEND_BASE_URL || 'http://localhost:5500';

// POST - initiate payment
router.post('/initiate', async (req, res) => {
  try {
    const {
      studentId, name, email,
      plan_name, plan_fare,
      plan_route_id, plan_route_name,
      plan_stoppage_id, plan_stoppage_name,
      plan_expires_at, amount
    } = req.body;

    const tran_id = 'BRACU_' + Date.now();

    // Save plan info to student
    await Student.findOneAndUpdate(
      { studentId },
      {
        plan_name, plan_fare,
        plan_route_id, plan_route_name,
        plan_stoppage_id, plan_stoppage_name,
        plan_expires_at
      }
    );

    const data = {
      total_amount: amount,
      currency: 'BDT',
      tran_id,
      success_url: `${paymentApiBaseUrl}/api/payment/success`,
      fail_url:    `${paymentApiBaseUrl}/api/payment/fail`,
      cancel_url:  `${paymentApiBaseUrl}/api/payment/cancel`,
      ipn_url:     `${paymentApiBaseUrl}/api/payment/ipn`,
      shipping_method: 'NO',
      product_name: `Bracu Bus - ${plan_name}`,
      product_category: 'Transportation',
      product_profile: 'general',
      cus_name: name,
      cus_email: email || 'student@g.bracu.ac.bd',
      cus_add1: 'BRAC University, Dhaka',
      cus_city: 'Dhaka',
      cus_country: 'Bangladesh',
      cus_phone: '01700000000',
      value_a: studentId,
      value_b: plan_name,
      value_c: plan_fare.toString(),
      value_d: tran_id
    };

    const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live);
    const apiResponse = await sslcz.init(data);

    if (apiResponse?.GatewayPageURL) {
      res.json({ 
        url: apiResponse.GatewayPageURL, 
        tran_id 
      });
    } else {
      res.status(500).json({ error: 'Failed to get payment URL' });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
});

// POST - success (called by SSLCommerz)
router.post('/success', async (req, res) => {
  try {
    const {
      val_id,
      tran_id,
      value_a: studentId,
      value_b: plan_name,
      value_c: plan_fare
    } = req.body;

    // Validate payment with SSLCommerz
    const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live);
    const validation = await sslcz.validate({ val_id });

    if (validation?.status === 'VALID' || validation?.status === 'VALIDATED') {
      const student = await Student.findOne({ studentId });

      await Booking.findOneAndUpdate(
        { tran_id },
        {
          tran_id,
          travel_date: new Date(),
          user_id: studentId,
          plan_name,
          plan_fare: Number(plan_fare),
          plan_route_id: student?.plan_route_id,
          plan_route_name: student?.plan_route_name,
          plan_stoppage_id: student?.plan_stoppage_id,
          plan_stoppage_name: student?.plan_stoppage_name,
          payment_method: 'sslcommerz',
          status: 'confirmed'
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      console.log('✅ Booking saved for:', studentId);

      return res.redirect(
        `${frontendBaseUrl}/Student/dashboard1.html?payment=success&plan=${encodeURIComponent(plan_name)}&tran_id=${encodeURIComponent(tran_id)}&studentId=${encodeURIComponent(studentId)}`
      );
    }

    res.redirect(
      `${frontendBaseUrl}/Student/dashboard1.html?payment=fail&tran_id=${encodeURIComponent(tran_id || '')}&studentId=${encodeURIComponent(studentId || '')}`
    );
  } catch (err) {
    console.log('Success error:', err);
    res.redirect(
      `${frontendBaseUrl}/Student/dashboard1.html?payment=fail&tran_id=${encodeURIComponent(req.body?.tran_id || '')}&studentId=${encodeURIComponent(req.body?.value_a || '')}`
    );
  }
});

// POST - fail
router.post('/fail', async (req, res) => {
  const tran_id = req.body?.tran_id || req.body?.value_d || '';
  const studentId = req.body?.value_a || '';
  res.redirect(
    `${frontendBaseUrl}/Student/dashboard1.html?payment=fail&tran_id=${encodeURIComponent(tran_id)}&studentId=${encodeURIComponent(studentId)}`
  );
});

// POST - cancel
router.post('/cancel', async (req, res) => {
  const tran_id = req.body?.tran_id || req.body?.value_d || '';
  const studentId = req.body?.value_a || '';
  res.redirect(
    `${frontendBaseUrl}/Student/dashboard1.html?payment=cancel&tran_id=${encodeURIComponent(tran_id)}&studentId=${encodeURIComponent(studentId)}`
  );
});

// POST - IPN
router.post('/ipn', async (req, res) => {
  res.status(200).json({ message: 'IPN received' });
});

// GET - verify payment from frontend (KEY ENDPOINT)
router.get('/verify/:tran_id', async (req, res) => {
  try {
    const { tran_id } = req.params;
    const { studentId } = req.query;

    const query = {
      tran_id,
      payment_method: 'sslcommerz',
      status: 'confirmed'
    };
    if (studentId) query.user_id = studentId;

    const booking = await Booking.findOne(query).sort({ createdAt: -1 });

    if (booking) {
      return res.json({ success: true, booking });
    }

    // Fallback for old records that don't have tran_id
    if (studentId) {
      const fallbackBooking = await Booking.findOne({
        user_id: studentId,
        payment_method: 'sslcommerz',
        status: 'confirmed'
      }).sort({ createdAt: -1 });

      if (fallbackBooking) {
        return res.json({ success: true, booking: fallbackBooking });
      }
    }

    res.json({ success: false });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;