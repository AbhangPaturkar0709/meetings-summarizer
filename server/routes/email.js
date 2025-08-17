const express = require('express');
const nodemailer = require('nodemailer');
const router = express.Router();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: Number(process.env.SMTP_PORT) === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

router.post('/send', async (req, res) => {
  try {
    const { to, subject, body } = req.body;
    if (!to || !body) return res.status(400).json({ ok: false, error: 'to and body required' });

    const mailOptions = {
      from: process.env.FROM_EMAIL || process.env.SMTP_USER,
      to,
      subject: subject || 'Shared summary',
      text: body,
    };

    const info = await transporter.sendMail(mailOptions);
    res.json({ ok: true, info });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

module.exports = router;
