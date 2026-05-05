const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Hospital = require('../models/Hospital');

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Not authorized, no token' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user or hospital to request
    if (decoded.role === 'user') {
      req.user = await User.findById(decoded.id).select('-password');
    } else if (decoded.role === 'hospital') {
      req.user = await Hospital.findById(decoded.id).select('-password');
    }

    if (!req.user) {
      return res.status(401).json({ message: 'User not found' });
    }

    req.user.role = decoded.role;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token invalid or expired' });
  }
};

// Role-based access
const restrictTo = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ message: 'Access denied for your role' });
  }
  next();
};

module.exports = { protect, restrictTo };