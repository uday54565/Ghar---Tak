
const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async ({ to, subject, text, html }) => {
  const { data, error } = await resend.emails.send({
    from: "GHAR TAK <onboarding@resend.dev>",
    to: [to],
    subject,
    text,
    html,
  });

  if (error) {
    console.error("OTP email sending failed:", error);
    throw new Error(error.message || "Failed to send email");
  }

  console.log("Email sent successfully:", data?.id);
  return data;
};

module.exports = { sendEmail };
