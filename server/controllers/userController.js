const Hospital = require('../models/Hospital');
const User = require('../models/User');

// @GET /api/user/resources — Live hospital resource tiles
const getResources = async (req, res) => {
  try {
    const hospitals = await Hospital.find({}, 'hospitalName city resources');
    
    const totals = hospitals.reduce((acc, h) => {
      acc.totalBeds += h.resources.availableBeds || 0;
      acc.icuBeds += h.resources.availableIcuBeds || 0;
      acc.ambulances += h.resources.availableAmbulances || 0;
      acc.doctors += h.resources.availableDoctors || 0;
      return acc;
    }, { totalBeds: 0, icuBeds: 0, ambulances: 0, doctors: 0 });

    res.json({ totals, hospitals });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// @GET /api/user/profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @PUT /api/user/profile
const updateProfile = async (req, res) => {
  try {
    const { name, phone, address, bloodGroup } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, phone, address, bloodGroup },
      { new: true, runValidators: true }
    ).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @POST /api/user/feedback
const submitFeedback = async (req, res) => {
  try {
    const { rating, message, category } = req.body;
    if (!rating || !message) {
      return res.status(400).json({ message: 'Rating and message required' });
    }
    // In production: save to Feedback model
    console.log('Feedback from', req.user.name, ':', { rating, message, category });
    res.json({ message: 'Feedback submitted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @GET /api/user/appointments
const getAppointments = async (req, res) => {
  try {
    // Placeholder — will connect to real data in later steps
    res.json({ appointments: [] });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getResources, getProfile, updateProfile, submitFeedback, getAppointments };