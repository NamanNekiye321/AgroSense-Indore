# 🌾 AgroSense Indore
### AI-Powered Precision Agronomic Engine for Indore & Malwa Plateau (Zone X)

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Python](https://img.shields.io/badge/Python-3.9%2B-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org/)
[![Scikit--Learn](https://img.shields.io/badge/Scikit--Learn-Random%20Forest-F7931E?style=for-the-badge&logo=scikitlearn&logoColor=white)](https://scikit-learn.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas%20%2F%20Local-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Accuracy](https://img.shields.io/badge/Model%20Accuracy-99.0%25-059669?style=for-the-badge)](/)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)

---

## 📌 Executive Summary

**AgroSense Indore** is a calibrated, full-stack decision-support system designed specifically for the unique edaphic and agro-climatic conditions of **Indore District** and the wider **Malwa Plateau (Agro-Climatic Zone X)**. 

Rooted in research standards from **ICAR-IISR (Indian Institute of Soybean Research, Indore)** and regional agricultural field benchmarks, AgroSense addresses the agronomic challenges of **Vertisols (Deep Black Cotton Soils)** by fusing machine learning models with scientific nutrient remediation and automated consultation logging.

---

## ✨ Key System Features

- 🧠 **Random Forest Multi-Class Crop Prediction (99.0% Accuracy)**  
  Trained on regional soil features ($N, P, K, \text{pH}$) and climate parameters (rainfall, temperature, humidity) specifically tuned for the **6 primary cash & food crops of Indore**:
  - **Soybean** *(JS-9560 / JS-2034 — Kharif Backbone)*
  - **Wheat** *(Sharbati / Malvi Vertisol Durum — Rabi)*
  - **Gram / Chickpea** *(Dollar / Desi — Rabi)*
  - **Maize / Corn** *(Kharif / High Yield)*
  - **Onion** *(Rabi / Late Kharif Cash Crop)*
  - **Potato** *(Rabi Heavy Yield)*

- 🧪 **Precision NPK Fertilizer Remediation Engine**  
  Calculates exact dosage recommendations per acre:
  - **Urea (46% N)**, **DAP (18:46:0)**, and **MOP (60% K₂O)** with split application schedules (basal vs. top-dressing).
  - Target-oriented remediation compensating for regional nitrogen and phosphorus deficiencies while preserving high native potash balances.

- 🗺️ **Indore Regional Micro-Climatic Tehsil Atlas**  
  Interactive calibrated soil baselines for all 5 sub-divisions:
  - **Sanwer** *(Deep Black Cotton Soils • 890 mm rain)*
  - **Indore Central** *(Medium Deep Black Vertisols • 920 mm rain)*
  - **Depalpur** *(Heavy Black Clay Vertisols • 880 mm rain)*
  - **Mhow (Dr. Ambedkar Nagar)** *(Loamy Black Transitional • 960 mm rain)*
  - **Hatod** *(Shallow to Medium Black • 870 mm rain)*

- 🗄️ **Real-Time MongoDB Audit Ledger**  
  Every recommendation session is permanently preserved in MongoDB Atlas with automatic fallback to local caches. Features live reload persistence and 1-click loading into the advisor workspace.

- 🌐 **True Black Dark Mode & Bilingual Support**  
  - Complete **True Black (`#080808` / `#111111`)** dark mode with zero white-flicker reload persistence via `localStorage`.
  - **English ⟷ Hindi (हिंदी)** instant localization across all terms, advisories, and metrics.
  - Fully responsive on mobile, tablet, and widescreen monitors.

---

## 🏗️ System Architecture

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        CLIENT / USER BROWSER                           │
│  - Responsive UI (Vanilla CSS + HTML5) with True Black Theme           │
│  - Bilingual Toggle (EN / HI) & Interactive Soil Sliders               │
│  - Real-time Farmer Consultation & Audit Ledger                        │
└─────────────────────────────────┬──────────────────────────────────────┘
                                  │ HTTP / JSON
                                  ▼
┌────────────────────────────────────────────────────────────────────────┐
│                      EXPRESS.JS BACKEND (Node.js)                      │
│  - REST API Routes (/api/recommend, /api/history)                      │
│  - Data Sanitization & Agronomic Rule Validation                       │
│  - Child Process IPC Bridge (mlBridge.js)                              │
└───────────────┬────────────────────────────────────────┬───────────────┘
                │ IPC (JSON over stdio)                  │ Mongoose ODM
                ▼                                        ▼
┌─────────────────────────────────┐    ┌─────────────────────────────────┐
│     PYTHON MACHINE LEARNING     │    │       MONGODB ATLAS DATABASE    │
│  - Scikit-Learn Random Forest   │    │  - Collection: consultations    │
│  - indore_crop_model.pkl        │    │  - Soil snapshots, timestamps   │
│  - Top-3 Crop Probabilities     │    │  - Prescriptions & Farmer logs  │
└─────────────────────────────────┘    └─────────────────────────────────┘
```

---

## 📊 Machine Learning Pipeline & Benchmarks

The model was evaluated using 5-Fold Stratified Cross-Validation across multiple classifiers:

| Classifier Algorithm | 5-Fold CV Accuracy | Train Time | Verdict |
|---|:---:|:---:|:---:|
| **Random Forest Classifier (Ensemble)** | **99.0%** | < 0.8s | 🏆 **Production Model** |
| Extra Trees Classifier | 98.6% | < 0.7s | Alternate |
| Gradient Boosting (GBM) | 97.8% | ~ 2.4s | High Latency |
| Decision Tree Classifier | 94.2% | < 0.1s | Overfitting Prone |

```python
# Input Vector Structure:
[ Nitrogen (N), Phosphorus (P), Potassium (K), Temperature (°C), Humidity (%), pH, Rainfall (mm) ]
```

---

## 📁 Repository Structure

```text
AgroSense-Indore/
├── backend/
│   ├── database/
│   │   ├── models/
│   │   │   └── Recommendation.js  # Mongoose schema for consultations
│   │   └── mongodb_service.js     # Connection & CRUD abstractions
│   ├── ml_service/
│   │   └── ml_bridge.js           # Asynchronous Node-to-Python IPC
│   ├── routes/
│   │   └── api.js                 # API endpoints (/recommend, /history)
│   ├── package.json               # Backend dependencies
│   └── server.js                  # Express application entrypoint
├── frontend/
│   ├── app.js                     # Client state, sliders & API bindings
│   ├── index.html                 # Semantic HTML structure & SVGs
│   ├── style.css                  # Custom Design System & True Black Dark Mode
│   └── favicon.svg                # Project identity icons
├── ml/
│   ├── indore_dataset_generator.py# Generates calibrated Malwa Vertisol dataset
│   ├── train_indore_model.py      # Multi-model benchmarking & model export
│   ├── evaluate_model.py          # Cross-validation & confusion matrix
│   └── predict.py                 # Fast CLI prediction wrapper for Node.js IPC
├── models/
│   └── indore_crop_model.pkl      # Serialized scikit-learn model artifact
└── README.md
```

---

## 🚀 Quickstart & Installation

### 1. Prerequisites
- **Node.js** (v18.0.0 or later)
- **Python** (v3.9 or later with `pip`)
- **MongoDB** (Local instance or MongoDB Atlas URI)

### 2. Environment Setup

Clone the repository and enter the directory:
```bash
git clone https://github.com/your-username/AgroSense-Indore.git
cd AgroSense-Indore
```

### 3. Setup Python ML Environment
```bash
# Recommended: Create a virtual environment
python3 -m venv venv
source venv/bin/activate    # On Windows: venv\Scripts\activate

# Install required scientific packages
pip install numpy pandas scikit-learn joblib
```

### 4. Setup Backend & Database
```bash
cd backend
npm install
```

Configure your environment variables in `backend/.env` (optional, falls back gracefully to local defaults):
```env
PORT=5001
MONGODB_URI=mongodb://localhost:27017/agrosense_indore_db
PYTHON_PATH=python3
```

### 5. Launch Application
```bash
# Start backend server
npm start
```

The system will start:
- 🌐 **Web Application**: [`http://localhost:5001`](http://localhost:5001)
- 📊 **Recommendation API**: [`http://localhost:5001/api/recommend`](http://localhost:5001/api/recommend)
- 📜 **Consultation History**: [`http://localhost:5001/api/history`](http://localhost:5001/api/history)

---

## 📡 API Reference

### 1. Generate Crop Recommendation
- **Endpoint:** `POST /api/recommend`
- **Headers:** `Content-Type: application/json`
- **Request Body:**
```json
{
  "farmerName": "Rameshwar Patel",
  "village": "Sanwer Kalan",
  "tehsil": "Sanwer",
  "N": 55,
  "P": 48,
  "K": 42,
  "ph": 7.6,
  "rainfall": 890,
  "temperature": 27,
  "humidity": 68
}
```

- **Sample Response:**
```json
{
  "status": "success",
  "recommendation_id": "6abea3159c7cb8515c73bd7d",
  "recommendations": [
    { "crop": "Soybean", "confidence": 94.2 },
    { "crop": "Wheat", "confidence": 3.2 },
    { "crop": "Gram (Chickpea)", "confidence": 1.7 }
  ],
  "fertilizer_plan": {
    "urea_kg": 15,
    "dap_kg": 21.7,
    "mop_kg": 10,
    "organic_ton": 2.0,
    "remarks": "Soil fertility is optimal. Maintain with 2 tons/acre well-decomposed organic manure."
  }
}
```

### 2. Fetch Consultation History
- **Endpoint:** `GET /api/history?limit=10`
- **Response:**
```json
{
  "status": "success",
  "count": 10,
  "data": [
    {
      "_id": "6abea3159c7cb8515c73bd7d",
      "farmer_name": "Rameshwar Patel",
      "farmer_village": "Sanwer Kalan",
      "tehsil": "Sanwer",
      "primary_crop": "Soybean",
      "confidence": 94.2,
      "created_at": "2026-10-01T18:14:45.383Z"
    }
  ]
}
```

---

## 🎓 Academic Credit & Context

- **Academic Work:** Minor Project (2025–2026)
- **Department:** Department of Computer Science & Engineering
- **Target Geography:** Indore District & Malwa Plateau Vertisol Region (Agro-Climatic Zone X)
- **Domain:** Precision Agriculture, Decision Support Systems & Practical Machine Learning

---

## 📄 License
This project is open-source and released under the **MIT License**.
