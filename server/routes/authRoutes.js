const express = require('express');
const router = express.Router();

//Test connection
/* router.use((req, res, next) => {
  console.log('AUTH ROUTES HIT:', req.method, req.originalUrl);
  next();
});
 */
const {
  register,
  login,
  me,
  logout,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const {authRateLimit} = require('../middleware/authRateLimit');
router.post('/register', authRateLimit(10, 60 * 60 * 1000), register);
router.post('/login', authRateLimit(30), login);
router.get('/me', protect, me);
router.patch('/me', protect, require('../controllers/accountController').update);
router.post('/logout', logout);

const security = require('../controllers/accountSecurityController');
router.get('/security', protect, security.status);
router.post('/forgot-password', authRateLimit(5, 15 * 60 * 1000), security.forgot);
router.post('/reset-password', authRateLimit(10, 15 * 60 * 1000), security.reset);
router.post('/verify-email', authRateLimit(10, 15 * 60 * 1000), security.verify);
router.post('/verification-email', protect, authRateLimit(5, 15 * 60 * 1000), security.requestVerification);
router.post('/change-password', protect, authRateLimit(5, 15 * 60 * 1000), security.change);
module.exports = router;
