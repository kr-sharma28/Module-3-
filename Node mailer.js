require('dotenv').config();
let express = require('express');
let nodemailer = require('nodemailer');

let app = express();
let port = 3000;

// Nodemailer configuration
let transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// /sendmail route to trigger email sending
app.get('/sendmail', async (req, res) => {
  let mailOptions = {
    from: process.env.SMTP_USER, // sender address
    to: 'venugopal.burli@masaischool.com, vijeetha.venkat@masaischool.com, your-email@gmail.com', // list of receivers
    subject: 'Testing Email', // Subject line
    html: '<p>This is Testing Email Sent By Empower Web Engineering Student, Please Do not worry and reply.</p>', // HTML body content
  };

  try {
    // Send email using Nodemailer transporter
    await transporter.sendMail(mailOptions);
    res.status(200).send('Email sent successfully');
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).send('Error sending email');
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
