
const nodemailer = require("nodemailer");

const sendEmail = async ({ to, subject, text, html }) => {
  const emailUser = process.env.EMAIL_USER?.trim();
  const emailPassword = process.env.EMAIL_APP_PASSWORD?.replace(/\s/g, "");

  if (!emailUser || !emailPassword) {
    throw new Error(
      "Email delivery is not configured. Set EMAIL_USER and EMAIL_APP_PASSWORD."
    );
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: emailUser,
      pass: emailPassword,
    },
  });

  return transporter.sendMail({
    from: `"GHAR TAK" <${emailUser}>`,
    to,
    subject,
    text,
    html,
  });
};

module.exports = { sendEmail };
