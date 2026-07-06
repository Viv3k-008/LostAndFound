const nodemailer = require("nodemailer");

const sendEmail = async (to, subject, message) => {
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;

  const credentialsConfigured =
    emailUser &&
    emailPass &&
    !emailUser.includes("your_email@gmail.com") &&
    !emailPass.includes("your_gmail_app_password");

  if (!credentialsConfigured) {
    console.warn("Email not configured; skipping notification email.");
    return false;
  }

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: emailUser,
        pass: emailPass, // use a Gmail App Password, not your real password
      },
    });

    await transporter.sendMail({
      from: `"Lost & Found" <${emailUser}>`,
      to,
      subject,
      text: message,
    });

    return true;
  } catch (error) {
    if (error.code === "EAUTH" || error.responseCode === 535) {
      console.warn("Email authentication failed; skipping notification email.");
      return false;
    }

    throw error;
  }
};

module.exports = sendEmail;
