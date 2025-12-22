const { Resend } = require('resend');
require('dotenv').config();

const resend = new Resend(process.env.RESEND_API_KEY);

module.exports = async (to, link) => {
  try {
    await resend.emails.send({
      from: process.env.EMAIL_FROM,
      to,
      subject: 'Verifikasi Email Akun REST API',
      html: `
        <div style="font-family:Arial">
          <h2>Verifikasi Email</h2>
          <p>Terima kasih telah mendaftar.</p>
          <p>Klik tombol di bawah untuk verifikasi email:</p>
          <a href="${link}" style="
            display:inline-block;
            padding:10px 15px;
            background:#2563eb;
            color:white;
            text-decoration:none;
            border-radius:5px;
          ">
            Verifikasi Email
          </a>
          <p style="margin-top:20px;color:#666">
            Jika bukan kamu, abaikan email ini.
          </p>
        </div>
      `
    });
  } catch (err) {
    console.error('Send email error:', err);
  }
};