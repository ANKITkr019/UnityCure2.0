const router = require('express').Router();
const {
  getProfile, updateResources, getStats,
  sendEmergencyAlert, getTransferRequests,
  updateLocation, getNearbyHospitals,
} = require('../controllers/hospitalController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

// ✅ Public route — BEFORE protect middleware
router.get('/nearby', getNearbyHospitals);

// Protected routes
router.use(protect);
router.use(restrictTo('hospital'));

router.get('/profile', getProfile);
router.get('/stats', getStats);
router.put('/resources', updateResources);
router.post('/emergency-alert', sendEmergencyAlert);
router.get('/transfer-requests', getTransferRequests);
router.put('/location', updateLocation);  // ✅ Add this here

module.exports = router;