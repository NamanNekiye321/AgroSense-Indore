const mongoose = require('mongoose');

/**
 * Farmer Schema
 * Stores the farmer's profile. One farmer can have many Recommendations (1:N).
 */
const FarmerSchema = new mongoose.Schema({
  name:    { type: String, required: true, trim: true },
  phone:   { type: String, default: null },
  village: { type: String, default: null },
  tehsil:  { type: String, required: true },
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Farmer', FarmerSchema);
