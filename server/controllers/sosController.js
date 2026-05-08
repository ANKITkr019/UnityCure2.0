const SOSAlert = require('../models/SOSAlert');
const Hospital = require('../models/Hospital');

// @POST /api/sos/send
const sendSOS = async (req, res) => {
  try {
    const { lat, lng, address, message, userName, phone } = req.body;

    if (!lat || !lng) {
      return res.status(400).json({ message: 'Location is required for SOS' });
    }

    // Create SOS alert
    const alert = await SOSAlert.create({
      userId: req.user?._id || null,
      userName: userName || req.user?.name || 'Anonymous',
      phone: phone || req.user?.phone || '',
      location: { lat, lng, address: address || 'Unknown' },
      message: message || 'Emergency! Need immediate help.',
    });

    // Find nearby hospitals (within 20km)
    let nearbyHospitals = [];
    try {
      nearbyHospitals = await Hospital.find({
        location: {
          $near: {
            $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
            $maxDistance: 20000,
          }
        }
      }).select('hospitalName email phone city location').limit(5);
    } catch {
      // Fallback if no geo index — get all hospitals
      nearbyHospitals = await Hospital.find({}).select('hospitalName email phone city').limit(5);
    }

    // Emit socket event to all connected hospitals
    if (req.app.get('io')) {
      req.app.get('io').emit('sos-alert', {
        alertId: alert._id,
        userName: alert.userName,
        phone: alert.phone,
        location: alert.location,
        message: alert.message,
        timestamp: alert.createdAt,
        nearbyHospitals: nearbyHospitals.length,
      });
    }

    res.status(201).json({
      message: 'SOS alert sent successfully',
      alertId: alert._id,
      notifiedHospitals: nearbyHospitals.length,
      nearbyHospitals: nearbyHospitals.map(h => ({
        name: h.hospitalName,
        city: h.city,
        phone: h.phone,
      })),
    });
  } catch (err) {
    console.error('SOS ERROR:', err.message);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// @GET /api/sos/active — Hospital sees active alerts
const getActiveAlerts = async (req, res) => {
  try {
    const alerts = await SOSAlert.find({ status: 'active' })
      .sort({ createdAt: -1 })
      .limit(20);
    res.json({ alerts });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @PUT /api/sos/:id/acknowledge
const acknowledgeAlert = async (req, res) => {
  try {
    const alert = await SOSAlert.findByIdAndUpdate(
      req.params.id,
      {
        status: 'acknowledged',
        acknowledgedBy: req.user._id,
      },
      { new: true }
    );
    if (!alert) return res.status(404).json({ message: 'Alert not found' });

    if (req.app.get('io')) {
      req.app.get('io').emit('sos-acknowledged', {
        alertId: alert._id,
        hospitalName: req.user.hospitalName,
      });
    }

    res.json({ message: 'Alert acknowledged', alert });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @PUT /api/sos/:id/resolve
const resolveAlert = async (req, res) => {
  try {
    const alert = await SOSAlert.findByIdAndUpdate(
      req.params.id,
      { status: 'resolved', resolvedAt: new Date() },
      { new: true }
    );
    if (!alert) return res.status(404).json({ message: 'Alert not found' });
    res.json({ message: 'Alert resolved', alert });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @GET /api/sos/my-alerts — User sees their own alerts
const getMyAlerts = async (req, res) => {
  try {
    const alerts = await SOSAlert.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(10);
    res.json({ alerts });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { sendSOS, getActiveAlerts, acknowledgeAlert, resolveAlert, getMyAlerts };