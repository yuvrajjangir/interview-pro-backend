const Razorpay = require("razorpay");
const crypto = require("crypto");
const pool = require('../config/db');
const dotenv = require('dotenv');
const transporter = require('../utils/mailer');
dotenv.config();

const razorpay = new Razorpay({
  key_id: process.env.KEY_ID,
  key_secret: process.env.KEY_SECRET,
});

exports.createOrder = async (req, res) => {
  const { amount } = req.body;

  try {
    const options = {
      amount: amount,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);
    res.status(200).json(order);
  } catch (error) {
    console.error("Error creating Razorpay order:", error);
    res.status(500).json({ error: "Failed to create Razorpay order", details: error });
  }
};

exports.verifyPayment = async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    session_id,
    amount,
  } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !session_id || !amount) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const generated_signature = crypto
    .createHmac("sha256", process.env.KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  if (generated_signature !== razorpay_signature) {
    return res.status(400).json({ error: "Invalid payment signature" });
  }

  try {
    const paymentQuery = `
      INSERT INTO payments (transaction_id, session_id, amount)
      VALUES ($1, $2, $3)
      RETURNING *;
    `;
    const values = [razorpay_payment_id, session_id, amount];
    const result = await pool.query(paymentQuery, values);

    const bookingRes = await pool.query('SELECT * FROM bookings WHERE session_id = $1', [session_id]);
    const booking = bookingRes.rows[0];

    if (!booking) {
      return res.status(404).json({ error: "Booking not found for session" });
    }

    const adminEmails = process.env.ADMIN_EMAIL.split(',');

    const adminMailOptions = {
      from: process.env.EMAIL_USER,
      to: adminEmails,
      subject: 'Payment Received - Session Confirmed',
      text: `
A payment has been received for a session.

Name: ${booking.name}
Email: ${booking.email}
Phone: ${booking.phone_number}
Domain: ${booking.domain}
Experience: ${booking.experience}
Bio: ${booking.bio}
Resume Link: ${booking.resume_link}
Amount: ₹${amount /2}
Payment ID: ${razorpay_payment_id}
      `,
    };

    const userMailOptions = {
      from: process.env.EMAIL_USER,
      to: booking.email,
      subject: 'Payment Successful - Session Confirmed',
      text: `
Hi ${booking.name},

Your payment of ₹${amount /2} was successful.

Here are your booking details:
Domain: ${booking.domain}
Experience: ${booking.experience}
Phone: ${booking.phone_number}
Bio: ${booking.bio}
Resume Link: ${booking.resume_link}

Payment ID: ${razorpay_payment_id}

Thank you for booking with Inviewo!

Regards,  
Inviewo Team
      `,
    };

    await Promise.all([
      transporter.sendMail(adminMailOptions),
      transporter.sendMail(userMailOptions),
    ]);

    return res.status(200).json({ success: true, payment: result.rows[0] });

  } catch (error) {
    console.error("Payment verification error:", error);
    return res.status(500).json({ error: "Internal server error", details: error });
  }
};
