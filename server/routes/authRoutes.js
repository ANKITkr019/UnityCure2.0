const router = require('express').Router();
const { registerUser, registerHospital, login, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register/user', registerUser);
router.post('/register/hospital', registerHospital);
router.post('/login', login);
router.get('/me', protect, getMe);

module.exports = router;