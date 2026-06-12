const nodemailer = require("nodemailer");

const sendEmail = (options) => {
  const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: `"LMS Platform" <${process.env.EMAIL_FROM}>`,
    to: options.to,
    subject: options.subject,
    html: options.html,
  };

  return new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, (err, info) => {
      if (err) reject(err);
      else resolve(info);
    });
  });
};

module.exports = sendEmail;
