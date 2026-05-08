const mongoose = require('mongoose');

const sosAlertSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  userName: { type: String, default: 'Anonymous' },
  phone: { type: String, default: '' },
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    address: { type: String, default: 'Unknown location' },
  },
  message: { type: String, default: 'Emergency! Need immediate help.' },
  status: {
    type: String,
    enum: ['active', 'acknowledged', 'resolved'],
    default: 'active',
  },
  acknowledgedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital', default: null },
  resolvedAt: { type: Date, default: null },
}, { timestamps: true });

module.exports = mongoose.model('SOSAlert', sosAlertSchema);