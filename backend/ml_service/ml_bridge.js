/**
 * ============================================================================
 * AGROSENSE INDORE - AI Precision Crop & Fertilizer Advisory System
 * Department of Farmers Welfare & Agriculture Development, Govt. of MP
 * ============================================================================
 * MODULE: Node.js to Python Machine Learning IPC Bridge
 * AUTHOR: Naman (Database Engineering & ML Integration Lead)
 * DESCRIPTION:
 *   High-speed child-process spawn execution bridge communicating between
 *   Express REST API routes and the Python Scikit-Learn prediction engine.
 *   Handles streaming serialization, error isolation, timeout safeguards,
 *   and confidence metric normalization.
 * ============================================================================
 */

const { spawn } = require('child_process');
const path = require('path');

const SCRIPT_PATH = path.join(__dirname, 'predictor_service.py');

/**
 * Executes ML model prediction for given soil and environmental parameters
 * Authored by: Naman (ML Integration Lead)
 * 
 * @param {Object} inputFeatures - {N, P, K, temperature, humidity, ph, rainfall, tehsil, model_type}
 * @returns {Promise<Object>} Formatted recommendation output and fertilizer schedule
 */
function predictCrop(inputFeatures) {
  return new Promise((resolve, reject) => {
    const pythonExecutable = process.env.PYTHON_PATH || 'python3';
    const payload = JSON.stringify(inputFeatures);

    const pyProcess = spawn(pythonExecutable, [SCRIPT_PATH, payload]);

    let outputData = '';
    let errorData = '';

    pyProcess.stdout.on('data', (chunk) => {
      outputData += chunk.toString();
    });

    pyProcess.stderr.on('data', (chunk) => {
      errorData += chunk.toString();
    });

    // Timeout watchdog (5 seconds safeguard)
    const timeout = setTimeout(() => {
      pyProcess.kill();
      console.warn('[Naman - ML Bridge] Python inference timed out after 5000ms. Returning agronomic heuristic fallback.');
      resolve(getAgronomicFallback(inputFeatures));
    }, 5000);

    pyProcess.on('close', (code) => {
      clearTimeout(timeout);
      if (code === 0 && outputData.trim()) {
        try {
          const parsed = JSON.parse(outputData);
          resolve(parsed);
        } catch (parseErr) {
          console.error('[Naman - ML Bridge] JSON parse failed on ML output:', parseErr.message);
          resolve(getAgronomicFallback(inputFeatures));
        }

      } else {
        if (errorData) {
          console.warn('[Naman - ML Bridge] Python stderr:', errorData.trim());
        }
        resolve(getAgronomicFallback(inputFeatures));
      }
    });

    pyProcess.on('error', (spawnErr) => {
      clearTimeout(timeout);
      console.warn('[Naman - ML Bridge] Failed to spawn Python process:', spawnErr.message);
      resolve(getAgronomicFallback(inputFeatures));
    });
  });
}

/**
 * Agronomic Expert Rule Heuristic Fallback Engine
 * Authored by: Naman (ML Integration Lead)
 */
function getAgronomicFallback(params) {
  const n = parseFloat(params.N) || 25;
  const p = parseFloat(params.P) || 60;
  const k = parseFloat(params.K) || 40;
  const rain = parseFloat(params.rainfall) || 880;
  const ph = parseFloat(params.ph) || 7.2;

  let recommendations = [];
  if (rain >= 650 && n <= 40) {
    recommendations = [
      { crop: 'Soybean', confidence: 95.2, duration: '100 days', season: 'Kharif', msp_inr: 4892 },
      { crop: 'Maize (Corn)', confidence: 3.5, duration: '95 days', season: 'Kharif / Rabi', msp_inr: 2225 },
      { crop: 'Gram (Chickpea)', confidence: 1.3, duration: '110 days', season: 'Rabi', msp_inr: 5650 }
    ];
  } else if (k >= 65) {
    recommendations = [
      { crop: 'Onion', confidence: 91.4, duration: '110 days', season: 'Rabi / Late Kharif', msp_inr: 1800 },
      { crop: 'Potato', confidence: 6.2, duration: '90 days', season: 'Rabi', msp_inr: 1500 },
      { crop: 'Wheat', confidence: 2.4, duration: '120 days', season: 'Rabi', msp_inr: 2425 }
    ];
    
  } else if (rain <= 550 && n >= 75) {
    recommendations = [
      { crop: 'Wheat', confidence: 93.8, duration: '120 days', season: 'Rabi', msp_inr: 2425 },
      { crop: 'Gram (Chickpea)', confidence: 4.1, duration: '110 days', season: 'Rabi', msp_inr: 5650 },
      { crop: 'Onion', confidence: 2.1, duration: '110 days', season: 'Rabi / Late Kharif', msp_inr: 1800 }
    ];
  } else {
    recommendations = [
      { crop: 'Gram (Chickpea)', confidence: 92.0, duration: '110 days', season: 'Rabi', msp_inr: 5650 },
      { crop: 'Wheat', confidence: 5.5, duration: '120 days', season: 'Rabi', msp_inr: 2425 },
      { crop: 'Soybean', confidence: 2.5, duration: '100 days', season: 'Kharif', msp_inr: 4892 }
    ];
  }

  return {
    status: 'success',
    model_used: 'Indore Agronomic Expert System (Fallback)',
    integrated_by: 'Naman (Database Engineering & ML Integration Lead)',
    recommendations,
    fertilizer_plan: {
      nitrogen_status: n < 30 ? 'Deficient' : (n > 90 ? 'Excess' : 'Optimal'),
      phosphorus_status: p < 35 ? 'Deficient' : (p > 75 ? 'Excess' : 'Optimal'),
      potassium_status: k < 30 ? 'Deficient' : (k > 70 ? 'Excess' : 'Optimal'),
      urea_kg: n < 30 ? 25.0 : 15.0,
      dap_kg: p < 35 ? 35.0 : 15.0,
      mop_kg: k < 30 ? 20.0 : 10.0,
      organic_manure_ton: 2.0,
      remarks: 'Malwa Black Soil: Balanced basal dose with 2 tons organic manure.'
    }
  };
}

module.exports = {
  predictCrop
};
