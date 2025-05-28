const pool = require('../config/db');
const dotenv = require('dotenv');
dotenv.config();

const postBooking = async (req, res) => {
  const { name, email, phone_number, domain, experience, bio, resume_link } = req.body;

  try {
    const result = await pool.query(
      'INSERT INTO bookings (name, email, phone_number, domain, experience, bio, resume_link) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [name, email, phone_number, domain, experience, bio, resume_link]
    );

    const booking = result.rows[0];

    res.status(201).json({ message: "Booking data added", booking });
  } catch (error) {
    res.status(401).json({ error });
  }
};

const getBooking = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM bookings WHERE session_id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error });
  }
};

const updateBooking = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  const fields = Object.keys(updates);
  const values = Object.values(updates);

  if (fields.length === 0) {
    return res.status(400).json({ message: "No fields to update" });
  }

  const setClause = fields.map((field, index) => `${field} = $${index + 1}`).join(', ');

  try {
    const result = await pool.query(
      `UPDATE bookings SET ${setClause} WHERE session_id = $${fields.length + 1} RETURNING *`,
      [...values, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    res.status(200).json({ message: 'Profile updated', booking: result.rows[0] });
  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

module.exports = { postBooking, getBooking, updateBooking };
