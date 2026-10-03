const mongoose = require('mongoose');

/**
 * Recommendation Schema
 * Stores a single prediction session: soil inputs, ML result, fertilizer plan.
 * References the Farmer schema via farmer_id (1 Farmer : N Recommendations).
 * 
 * In MongoDB, SoilInput and FertilizerPlan are EMBEDDED sub-documents (no separate collection).
 * On the ER diagram they appear as separate entities with 1:1 relationships to Recommendation.
 */

/* --- Embedded Sub-document: Soil Inputs --- */

const SoilInputSchema = new mongoose.Schema({
  N:           { type: Number, required: true },   // Nitrogen (kg/ha)
  P:           { type: Number, required: true },   // Phosphorus (kg/ha)
  K:           { type: Number, required: true },   // Potassium (kg/ha)
  ph:          { type: Number, required: true },   // Soil pH (4.0–10.0)
  temperature: { type: Number, default: 28 },      // °C
  humidity:    { type: Number, default: 70 },      // %
  rainfall:    { type: Number, default: 850 }      // mm/year
}, { _id: false });

/* --- Embedded Sub-document: Fertilizer Plan --- */
const FertilizerPlanSchema = new mongoose.Schema({
  urea_kg:    { type: Number, default: 15 },       // Urea (46% N) — kg/acre
  dap_kg:     { type: Number, default: 10 },       // DAP (18:46:0) — kg/acre
  mop_kg:     { type: Number, default: 10 },       // MOP (60% K2O) — kg/acre
  organic_ton:{ type: Number, default: 2.0 },      // Organic compost — ton/acre
  remarks:    { type: String, default: '' }
}, { _id: false });

/* --- Main Recommendation Schema --- */
const RecommendationSchema = new mongoose.Schema({
  farmer_id:      { type: mongoose.Schema.Types.ObjectId, ref: 'Farmer', default: null },
  farmer_name:    { type: String, default: 'Farmer Guest' },   // Denormalized for quick display
  farmer_village: { type: String, default: '' },
  village:        { type: String, default: '' },
  tehsil:         { type: String, default: 'Indore' },
  land_area:      { type: Number, default: null },             // Farmer's land size in acres
  contact_no:     { type: String, default: '' },               // Optional phone number

  // Embedded soil snapshot at time of recommendation
  soil_inputs: { type: SoilInputSchema, required: true },

  // ML Prediction output
  primary_crop:      { type: String, required: true },
  confidence:        { type: Number, required: true },   // % (0–100)
  alternative_crops: [String],                           // 2nd, 3rd choice crops

  // Embedded fertilizer prescription
  fertilizer_plan: { type: FertilizerPlanSchema, required: true },

  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Recommendation', RecommendationSchema);
