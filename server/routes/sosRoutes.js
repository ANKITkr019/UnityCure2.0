const router = require('express').Router();
const {
  sendSOS, getActiveAlerts,
  acknowledgeAlert, resolveAlert, getMyAlerts
} = require('../controllers/sosController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

// Send SOS — works for both logged in and anonymous
router.post('/send', (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return protect(req, res, next);
  }
  next();
}, sendSOS);

// User routes
router.get('/my-alerts', protect, getMyAlerts);

// Hospital routes
router.get('/active', protect, restrictTo('hospital'), getActiveAlerts);
router.put('/:id/acknowledge', protect, restrictTo('hospital'), acknowledgeAlert);
router.put('/:id/resolve', protect, restrictTo('hospital'), resolveAlert);

module.exports = router;