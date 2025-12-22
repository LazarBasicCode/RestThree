const supabase = require('../supabase');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');

exports.register = async (req, res) => {
  const { username, email, password, confirmPassword } = req.body;

  if (password !== confirmPassword) {
    return res.status(400).json({ message: 'Password tidak sama' });
  }

  const hashed = await bcrypt.hash(password, 10);

  const { data: user, error } = await supabase
    .from('users')
    .insert([{ username, email, password: hashed }])
    .select()
    .single();

  if (error) {
    return res.status(400).json({ message: error.message });
  }

  const token = crypto.randomBytes(32).toString('hex');

  await supabase.from('email_tokens').insert([{
    user_id: user.id,
    token,
    expires_at: new Date(Date.now() + 1000 * 60 * 60) // 1 jam
  }]);

  const link = `${process.env.BASE_URL}/api/auth/verify/${token}`;

  await sendEmail(
    email,
    'Verifikasi Email',
    `Klik link berikut untuk verifikasi: ${link}`
  );

  res.json({ message: 'Register berhasil, cek email untuk verifikasi' });
};

exports.verifyEmail = async (req, res) => {
  const { token } = req.params;

  const { data } = await supabase
    .from('email_tokens')
    .select('*')
    .eq('token', token)
    .gt('expires_at', new Date())
    .single();

  if (!data) {
    return res.status(400).json({ message: 'Token tidak valid / expired' });
  }

  await supabase
    .from('users')
    .update({ is_verified: true })
    .eq('id', data.user_id);

  await supabase
    .from('email_tokens')
    .delete()
    .eq('id', data.id);

  res.json({ message: 'Email berhasil diverifikasi' });
};

exports.login = async (req, res) => {
  const { identifier, password } = req.body;

  const { data: user } = await supabase
    .from('users')
    .select('*')
    .or(`email.eq.${identifier},username.eq.${identifier}`)
    .single();

  if (!user) {
    return res.status(401).json({ message: 'User tidak ditemukan' });
  }

  if (!user.is_verified) {
    return res.status(403).json({ message: 'Email belum diverifikasi' });
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    return res.status(401).json({ message: 'Password salah' });
  }

  const token = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );

  res.json({
    token,
    user: {
      username: user.username,
      email: user.email,
      role: user.role
    }
  });
};

exports.resendVerification = async (req, res) => {
  const { email } = req.body;

  const { data: user } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();

  if (!user) {
    return res.status(404).json({ message: 'User tidak ditemukan' });
  }

  if (user.is_verified) {
    return res.json({ message: 'Email sudah diverifikasi' });
  }

  const token = crypto.randomBytes(32).toString('hex');

  await supabase.from('email_tokens').insert([{
    user_id: user.id,
    token,
    expires_at: new Date(Date.now() + 1000 * 60 * 60)
  }]);

  const link = `${process.env.BASE_URL}/api/auth/verify/${token}`;

  await sendEmail(
    email,
    'Verifikasi Ulang Email',
    `Klik link: ${link}`
  );

  res.json({ message: 'Email verifikasi dikirim ulang' });
};