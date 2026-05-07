const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Send login credentials email to a newly created hierarchy member.
 */
const sendCredentialsEmail = async ({ email, fullName, level, password }) => {
  const mailOptions = {
    from: `"${process.env.SMTP_FROM_NAME || "Matru Krupa"}" <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}>`,
    to: email,
    subject: "Your Matru Krupa Admin Login Credentials",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 12px; overflow: hidden;">
        <div style="background: #0f172a; color: #fff; padding: 24px 28px; text-align: center;">
          <h1 style="margin: 0; font-size: 22px; font-weight: 800;">Matru Krupa</h1>
          <p style="margin: 4px 0 0; font-size: 12px; letter-spacing: 2px; text-transform: uppercase; color: #94a3b8;">Admin Panel</p>
        </div>
        <div style="padding: 28px;">
          <p style="font-size: 15px; color: #333;">Hello <strong>${fullName}</strong>,</p>
          <p style="font-size: 14px; color: #555; line-height: 1.6;">
            Your <strong>${level}</strong> account has been created on the Matru Krupa Admin Panel. Below are your login credentials:
          </p>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 20px; margin: 20px 0;">
            <p style="margin: 0 0 10px; font-size: 14px;"><strong>Email:</strong> ${email}</p>
            <p style="margin: 0; font-size: 14px;"><strong>Password:</strong> ${password}</p>
          </div>
          <p style="font-size: 13px; color: #64748b; line-height: 1.5;">
            Please use the <strong>"District / Taluk / Promoter"</strong> option on the login page to sign in.
          </p>
          <p style="font-size: 13px; color: #64748b; margin-top: 24px;">
            Regards,<br /><strong>Matru Krupa Team</strong>
          </p>
        </div>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = { sendCredentialsEmail };
