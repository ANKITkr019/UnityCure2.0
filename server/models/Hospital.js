const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const hospitalSchema = new mongoose.Schema({
  hospitalName: {
    type: String,
    required: [true, 'Hospital name is required'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6,
  },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  pincode: { type: String, required: true },
  registrationNumber: {
    type: String,
    required: [true, 'Registration number is required'],
    unique: true,
  },
  role: { type: String, default: 'hospital' },
  location: {
    type: { type: String, default: 'Point' },
    coordinates: { type: [Number], default: [0, 0] }, // [lng, lat]
    address: { type: String, default: '' },
  },
  resources: {
    totalBeds: { type: Number, default: 0 },
    availableBeds: { type: Number, default: 0 },
    icuBeds: { type: Number, default: 0 },
    availableIcuBeds: { type: Number, default: 0 },
    ambulances: { type: Number, default: 0 },
    availableAmbulances: { type: Number, default: 0 },
    doctors: { type: Number, default: 0 },
    availableDoctors: { type: Number, default: 0 },
  },
}, { timestamps: true });

hospitalSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

hospitalSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};
// Geospatial index for nearby queries
hospitalSchema.index({ location: '2dsphere' });
module.exports = mongoose.model('Hospital', hospitalSchema);