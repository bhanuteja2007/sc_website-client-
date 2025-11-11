// server.js
const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// =======================
// MySQL Database Connection
// =======================
const db = mysql.createConnection({
  host: 'mysql-3f0a3f60-modembhanu2007-72fd.e.aivencloud.com',
  user: 'avnadmin',
  password: 'AVNS_5xisajeeHwTT5OIohYR',
  database: 'supercomputers_db',
  port: 19006,
  ssl: {
    rejectUnauthorized: true
  }
});

db.connect(err => {
  if (err) {
    console.error('❌ DB Connection Failed:', err);
  } else {
    console.log('✅ Connected to MySQL Database');
  }
});

// =======================
// ROUTES
// =======================

// Health check (root URL)
app.get('/', (req, res) => {
  res.send('✅ API is running successfully on Render!');
});

// ----- BOOKING FORM -----
app.post('/api/book', (req, res) => {
  const { device_type, date_slot, description, contact_phone } = req.body;

  if (!device_type || !date_slot || !contact_phone) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }

  const sql = `
    INSERT INTO bookings (device_type, date_slot, description, contact_phone)
    VALUES (?, ?, ?, ?)
  `;
  db.query(sql, [device_type, date_slot, description, contact_phone], (err) => {
    if (err) {
      console.error('Booking Insert Error:', err);
      return res.status(500).json({ success: false, message: 'Database error', error: err });
    }
    res.json({ success: true, message: 'Booking saved successfully!' });
  });
});

// ----- CARD TO CASH FORM -----
app.post('/api/card2cash', (req, res) => {
  const { brand, amount, name, phone } = req.body;
  if (!brand || !amount || !name || !phone) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }

  const sql = 'INSERT INTO card2cash_requests (brand, amount, name, phone) VALUES (?, ?, ?, ?)';
  db.query(sql, [brand, amount, name, phone], (err) => {
    if (err) {
      console.error('Card2Cash Error:', err);
      return res.status(500).json({ success: false, message: 'Database error', error: err });
    }
    res.json({ success: true, message: 'Card-to-Cash request saved successfully!' });
  });
});

// Alias route for frontend
app.post('/api/c2c', (req, res) => {
  const { c2c_brand, c2c_amount, c2c_name, c2c_phone } = req.body;
  if (!c2c_brand || !c2c_amount || !c2c_name || !c2c_phone) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }

  const sql = 'INSERT INTO card2cash_requests (brand, amount, name, phone) VALUES (?, ?, ?, ?)';
  db.query(sql, [c2c_brand, c2c_amount, c2c_name, c2c_phone], (err) => {
    if (err) {
      console.error('Card2Cash (/api/c2c) Error:', err);
      return res.status(500).json({ success: false, message: 'Database error', error: err });
    }
    res.json({ success: true, message: 'Card-to-Cash request saved successfully!' });
  });
});

// ----- CONTACT FORM -----
app.post('/api/contact', (req, res) => {
  const c_name = req.body.c_name || req.body.name;
  const c_email = req.body.c_email || req.body.email;
  const c_phone = req.body.c_phone || req.body.phone;
  const c_subject = req.body.c_subject || req.body.subject;
  const c_message = req.body.c_message || req.body.message;

  if (!c_name || !c_email || !c_message) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }

  const sql = `
    INSERT INTO contact_messages (name, email, phone, subject, message)
    VALUES (?, ?, ?, ?, ?)
  `;
  db.query(sql, [c_name, c_email, c_phone, c_subject, c_message], (err) => {
    if (err) {
      console.error('Contact Insert Error:', err);
      return res.status(500).json({ success: false, message: 'Database error', error: err });
    }
    res.json({ success: true, message: 'Message sent successfully!' });
  });
});

// ----- CSC DIGITAL SEVA BOOKINGS -----
app.post('/api/csc', (req, res) => {
  const { service, date, name, phone, notes } = req.body;
  if (!service || !date || !name || !phone) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }

  const sql = `
    INSERT INTO csc_bookings (service, date, name, phone, notes)
    VALUES (?, ?, ?, ?, ?)
  `;
  db.query(sql, [service, date, name, phone, notes], (err) => {
    if (err) {
      console.error('CSC Booking Error:', err);
      return res.status(500).json({ success: false, message: 'Database error', error: err });
    }
    res.json({ success: true, message: 'CSC booking saved successfully!' });
  });
});

// ----- TRACK TICKET -----
app.get('/api/track', (req, res) => {
  const { phone } = req.query;
  if (!phone) {
    return res.status(400).json({ success: false, message: 'Phone number is required' });
  }

  const sql = `
    SELECT * FROM bookings WHERE contact_phone = ?
    ORDER BY id DESC LIMIT 1
  `;
  db.query(sql, [phone], (err, results) => {
    if (err) {
      console.error('Track Query Error:', err);
      return res.status(500).json({ success: false, message: 'Database error', error: err });
    }
    if (results.length === 0) {
      return res.json({ success: false, message: 'No booking found for this number.' });
    }

    res.json({ success: true, booking: results[0] });
  });
});

// =======================
// SERVER START
// =======================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
