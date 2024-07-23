const nodemailer = require("nodemailer");

async function paymentNotification(email, transactionId) {
  try {
    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "jundihn@gmail.com",
        pass: process.env.NODEMAILER_PASSWORD,
      },
    });

    let mailOptions = {
      from: "jundihn@gmail.com",
      to: email,
      subject: "Payment Notification",
      text: `Payment for Transaction ID ${transactionId} has been successfully`,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.log(error);
  }
}

module.exports = { paymentNotification };
