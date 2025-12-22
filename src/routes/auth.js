const router = require('express').Router();
const auth = require('../controllers/authController');

router.post('/register', auth.register);
router.get('/verify/:token', auth.verifyEmail);
router.post('/login', auth.login);
router.post('/resend', auth.resendVerification);

module.exports = router;