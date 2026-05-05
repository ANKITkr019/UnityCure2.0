const router = require('express').Router();
const { getResources, getProfile, updateProfile, submitFeedback, getAppointments } = require('../controllers/userController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

router.use(protect);
router.use(restrictTo('user'));

router.get('/resources', getResources);
router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.post('/feedback', submitFeedback);
router.get('/appointments', getAppointments);
const { getNearbyHospitals } = require('../controllers/hospitalController');
router.get('/nearby-hospitals', getNearbyHospitals);
module.exports = router;