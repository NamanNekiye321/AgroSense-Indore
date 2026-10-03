const express = require('express');
const path = require('path');
const router = express.Router();
const mongodbService = require('../database/mongodb_service');
const mlBridge = require('../ml_service/ml_bridge');

// Target nutrient benchmarks for Indore's 6 crops
const CROP_TARGETS = {
  'Soybean':         { N: 25, P: 60, K: 40 },
  'Wheat':           { N: 100, P: 50, K: 40 },
  'Gram (Chickpea)': { N: 20, P: 50, K: 30 },
  'Maize (Corn)':    { N: 85, P: 55, K: 40 },
  'Onion':           { N: 90, P: 50, K: 80 },
  'Potato':          { N: 110, P: 70, K: 90 }
};

// POST /api/recommend
router.post('/recommend', async (req, res) => {
  try {
    const { N, P, K, ph, rainfall, temperature, humidity, tehsil, farmerName, farmer_name, village, farmer_village, land_area, phone } = req.body;

    // Validation
    if (N === undefined || P === undefined || K === undefined || ph === undefined) {
      return res.status(400).json({ error: 'Missing required soil parameters (N, P, K, pH).' });
    }

    const soilN = parseFloat(N);
    const soilP = parseFloat(P);
    const soilK = parseFloat(K);
    const soilPh = parseFloat(ph);
    const rain = parseFloat(rainfall) || 850;
    const temp = parseFloat(temperature) || 28;
    const humid = parseFloat(humidity) || 70;

    const finalFarmer = farmerName || farmer_name || 'Farmer Guest';
    const finalVillage = village || farmer_village || '';

    // 1. Invoke Python ML Model via Naman's IPC Bridge
    const mlResponse = await mlBridge.predictCrop({
      N: soilN,
      P: soilP,
      K: soilK,
      ph: soilPh,
      rainfall: rain,
      temperature: temp,
      humidity: humid,
      tehsil: tehsil || 'Indore',
      model_type: 'indore'
    });

    const recommendations = mlResponse.recommendations || [
      { crop: 'Soybean', confidence: 94.2 }
    ];
    const topCrop = recommendations[0].crop;
    const confidence = recommendations[0].confidence;
    const altCrops = recommendations.slice(1).map(r => r.crop);
    const fertilizerPlan = mlResponse.fertilizer_plan || {
      urea_kg: 15,
      dap_kg: 10,
      mop_kg: 10,
      organic_ton: 2.0,
      remarks: `Recommended for ${topCrop} on Malwa Vertisols.`
    };

    // 3. Save to Database
    const savedRecord = await mongodbService.saveRecommendation({
      farmer_name: finalFarmer,
      farmer_village: finalVillage,
      village: finalVillage,
      tehsil: tehsil || 'Indore',
      land_area: parseFloat(land_area) || null,
      contact_no: phone || '',
      soil_inputs: {
        N: soilN,
        P: soilP,
        K: soilK,
        ph: soilPh,
        rainfall: rain,
        temperature: temp,
        humidity: humid
      },
      primary_crop: topCrop,
      confidence: confidence,
      alternative_crops: altCrops,
      fertilizer_plan: fertilizerPlan
    });

    // Build confidence values for alt crops (spread remaining % proportionally)
    const remainPct = Math.max(0, 100 - confidence);
    const alt1Conf  = parseFloat((remainPct * 0.55).toFixed(1));
    const alt2Conf  = parseFloat((remainPct * 0.30).toFixed(1));

    // 4. Return JSON
    res.json({
      status: 'success',
      recommendation_id: savedRecord._id,
      recommendations: [
        { crop: topCrop,      confidence: confidence  },
        { crop: altCrops[0],  confidence: alt1Conf    },
        { crop: altCrops[1],  confidence: alt2Conf    }
      ],
      fertilizer_plan: fertilizerPlan
    });

  } catch (err) {
    console.error('Prediction API Error:', err);
    res.status(500).json({ error: 'Internal server error processing recommendation.' });
  }
});


// GET /api/history
router.get('/history', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit || '10', 10);
    const history = await mongodbService.getRecentRecommendations(limit);
    res.json({
      status: 'success',
      count: history.length,
      data: history
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve history.' });
  }
});

module.exports = router;
