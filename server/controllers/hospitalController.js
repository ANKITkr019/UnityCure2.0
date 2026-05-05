const Hospital = require('../models/Hospital');

// @GET /api/hospital/profile
const getProfile = async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.user._id).select('-password');
    res.json(hospital);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @PUT /api/hospital/resources
const updateResources = async (req, res) => {
  try {
    const { totalBeds, availableBeds, icuBeds, availableIcuBeds, ambulances, availableAmbulances, doctors, availableDoctors } = req.body;

    const hospital = await Hospital.findByIdAndUpdate(
      req.user._id,
      {
        resources: {
          totalBeds, availableBeds,
          icuBeds, availableIcuBeds,
          ambulances, availableAmbulances,
          doctors, availableDoctors,
        }
      },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({ message: 'Resources updated', hospital });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// @GET /api/hospital/stats
const getStats = async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.user._id).select('resources hospitalName');
    const r = hospital.resources;

    const occupancyRate = r.totalBeds > 0
      ? Math.round(((r.totalBeds - r.availableBeds) / r.totalBeds) * 100)
      : 0;

    const icuOccupancy = r.icuBeds > 0
      ? Math.round(((r.icuBeds - r.availableIcuBeds) / r.icuBeds) * 100)
      : 0;

    res.json({
      resources: r,
      stats: {
        occupancyRate,
        icuOccupancy,
        ambulanceAvailability: r.ambulances > 0
          ? Math.round((r.availableAmbulances / r.ambulances) * 100)
          : 0,
        doctorAvailability: r.doctors > 0
          ? Math.round((r.availableDoctors / r.doctors) * 100)
          : 0,
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @POST /api/hospital/emergency-alert
const sendEmergencyAlert = async (req, res) => {
  try {
    const { type, message, severity } = req.body;
    if (!type || !message) {
      return res.status(400).json({ message: 'Type and message required' });
    }
    // In production: push to socket or notification system
    console.log('EMERGENCY ALERT from', req.user.hospitalName, ':', { type, message, severity });
    res.json({ message: 'Alert sent successfully', alert: { type, message, severity, timestamp: new Date() } });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @GET /api/hospital/transfer-requests
const getTransferRequests = async (req, res) => {
  try {
    // Placeholder — in production connect to a Transfer model
    res.json({ requests: [] });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
// @PUT /api/hospital/location
const updateLocation = async (req, res) => {
  try {
    const { lat, lng, address } = req.body;
    if (!lat || !lng) return res.status(400).json({ message: 'lat and lng required' });

    const hospital = await Hospital.findByIdAndUpdate(
      req.user._id,
      {
        location: {
          type: 'Point',
          coordinates: [parseFloat(lng), parseFloat(lat)],
          address: address || '',
        }
      },
      { new: true }
    ).select('-password');

    res.json({ message: 'Location updated', hospital });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// @GET /api/hospital/nearby?lat=xx&lng=yy&radius=10000
const getNearbyHospitals = async (req, res) => {
  try {
    const { lat, lng, radius = 20000 } = req.query; // radius in meters

    let hospitals;

    if (lat && lng) {
      // Geo query — find within radius
      hospitals = await Hospital.find({
        location: {
          $near: {
            $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
            $maxDistance: parseInt(radius),
          }
        }
      }).select('-password');
    } else {
      // Fallback — return all hospitals
      hospitals = await Hospital.find({}).select('-password');
    }

    const result = hospitals.map(h => ({
      id: h._id,
      name: h.hospitalName,
      city: h.city,
      address: h.address,
      phone: h.phone,
      location: h.location,
      resources: h.resources,
    }));

    res.json({ hospitals: result, count: result.length });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
module.exports = {
  getProfile, updateResources, getStats,
  sendEmergencyAlert, getTransferRequests,
  updateLocation, getNearbyHospitals,
};