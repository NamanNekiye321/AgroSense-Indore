"""
================================================================================
AgroSense INDORE - AI-BASED PRECISION CROP RECOMMENDATION SYSTEM
Malwa Plateau Agro-Climatic Zone (Zone X), Madhya Pradesh
================================================================================
Module: Indore District Agro-Climatic Dataset Synthesizer & Validator
Academic & Field Reference Authorities:
  1. ICAR - National Soybean Research Institute (ICAR-IISR), Khandwa Road, Indore
     (Reference: Table-1 Zone-Wise Sowing Time, Seed Rate & NPKS 25:60:40:20 kg/ha)
  2. Soil Health Card Scheme (soilhealth.dac.gov.in) - Indore District Soil Baselines
     (Medium to Deep Black Cotton Soil / Vertisol, pH 7.2 - 8.2)
  3. Rajmata Vijayaraje Scindia Krishi Vishwavidyalaya (RVSKVV) Gwalior &
     College of Agriculture, Indore (Package of Practices for Malwa Region)
  4. Directorate of Farmer Welfare and Agriculture Development, Govt. of MP
================================================================================
"""

import os
import numpy as np
import pandas as pd

# Set random seed for scientific reproducibility
np.random.seed(42)

# Ensure output directories exist
os.makedirs("data/raw", exist_ok=True)
os.makedirs("data/processed", exist_ok=True)

# -----------------------------------------------------------------------------
# 1. INDORE DISTRICT TEHSILS & AGRO-CLIMATIC BASELINES
# Soil: Medium to Deep Black Cotton Soil (Vertisol / Kali Mitti)
# Climate: Malwa Plateau Semi-Arid Sub-Tropical (850 - 950 mm rainfall)
# -----------------------------------------------------------------------------
INDORE_TEHSILS = {
    "Indore (Central)": {
        "zone": "Malwa Plateau (Zone X)",
        "soil": "Medium Deep Black Cotton Soil",
        "temp": (14, 38), "humidity": (35, 80), "ph": (7.2, 8.0), "rain": (850, 950)
    },
    "Sanwer": {
        "zone": "Malwa Plateau (Zone X)",
        "soil": "Deep Black Cotton Soil",
        "temp": (13, 38), "humidity": (35, 82), "ph": (7.3, 8.2), "rain": (840, 960)
    },
    "Depalpur": {
        "zone": "Malwa Plateau (Zone X)",
        "soil": "Clayey Heavy Black Soil",
        "temp": (13, 37), "humidity": (38, 85), "ph": (7.4, 8.2), "rain": (860, 980)
    },
    "Mhow (Dr. Ambedkar Nagar)": {
        "zone": "Malwa Plateau (Zone X)",
        "soil": "Black Loamy Plateau Soil",
        "temp": (12, 36), "humidity": (40, 82), "ph": (7.0, 7.9), "rain": (880, 1000)
    },
    "Hatod": {
        "zone": "Malwa Plateau (Zone X)",
        "soil": "Medium Black Soil",
        "temp": (13, 38), "humidity": (36, 82), "ph": (7.2, 8.1), "rain": (840, 950)
    }
}

# -----------------------------------------------------------------------------
# 2. THE 6 PRIMARY ECONOMIC CROPS OF INDORE (MALWA REGION)
# Sourced from ICAR-IISR Indore, RVSKVV, and Soil Health Card Baselines
# -----------------------------------------------------------------------------
INDORE_CROP_AGRONOMY = {
    "Soybean": {
        # ICAR-IISR Table-1: Central Zone (MP) NPKS 25:60:40:20 kg/ha
        "N": (18, 32), "P": (50, 75), "K": (30, 52),
        "temp": (22, 35), "humidity": (60, 88), "ph": (6.8, 7.9), "rainfall": (650, 950),
        "season": "Kharif", "duration_days": 100, "yield_q_ha": 22, "hindi": "सोयाबीन"
    },
    "Wheat": {
        # Famous Sharbati / Malvi Durum Wheat of Malwa
        "N": (85, 125), "P": (45, 65), "K": (30, 50),
        "temp": (12, 25), "humidity": (35, 65), "ph": (7.0, 8.2), "rainfall": (300, 500),
        "season": "Rabi", "duration_days": 120, "yield_q_ha": 45, "hindi": "गेहूं (शरबती / मालवी)"
    },
    "Gram (Chickpea)": {
        # Major pulse of Depalpur and Sanwer (Desi & Dollar Chana)
        "N": (15, 30), "P": (40, 65), "K": (25, 45),
        "temp": (12, 28), "humidity": (30, 60), "ph": (7.0, 8.2), "rainfall": (250, 550),
        "season": "Rabi", "duration_days": 110, "yield_q_ha": 20, "hindi": "चना (डॉलर / देशी)"
    },
    "Maize (Corn)": {
        # Prominent cereal crop in Malwa
        "N": (70, 110), "P": (40, 65), "K": (30, 50),
        "temp": (20, 34), "humidity": (50, 80), "ph": (6.5, 7.8), "rainfall": (600, 950),
        "season": "Kharif", "duration_days": 95, "yield_q_ha": 40, "hindi": "मक्का"
    },
    "Onion": {
        # High cash-crop traded in Indore Choithram Mandi; high potash requirement
        "N": (75, 115), "P": (40, 65), "K": (60, 100),
        "temp": (15, 30), "humidity": (45, 75), "ph": (6.8, 8.0), "rainfall": (400, 750),
        "season": "Rabi / Late Kharif", "duration_days": 110, "yield_q_ha": 240, "hindi": "प्याज"
    },
    "Potato": {
        # Mhow & Indore chips-grade potatoes
        "N": (90, 135), "P": (55, 85), "K": (70, 115),
        "temp": (14, 25), "humidity": (50, 80), "ph": (6.2, 7.5), "rainfall": (350, 650),
        "season": "Rabi", "duration_days": 90, "yield_q_ha": 250, "hindi": "आलू"
    }
}


def generate_indore_crop_dataset(samples_per_crop=250):
    """
    Synthesizes and statistically enriches the localized agro-climatic dataset
    for Indore district across its 5 tehsils and 6 primary crops.
    Applies Gaussian noise around ICAR/RVSKVV agronomic benchmark centers.
    """
    records = []
    tehsil_names = list(INDORE_TEHSILS.keys())
    
    for crop_name, agro in INDORE_CROP_AGRONOMY.items():
        for _ in range(samples_per_crop):
            tehsil = np.random.choice(tehsil_names)
            teh_data = INDORE_TEHSILS[tehsil]
            
            # 1. N-P-K Nutrients with Gaussian sampling around crop requirements
            n = np.random.uniform(agro["N"][0], agro["N"][1]) + np.random.normal(0, 2.5)
            p = np.random.uniform(agro["P"][0], agro["P"][1]) + np.random.normal(0, 2.0)
            k = np.random.uniform(agro["K"][0], agro["K"][1]) + np.random.normal(0, 2.5)
            
            # Bound soil nutrients to realistic agronomic limits
            n = max(10.0, min(160.0, n))
            p = max(10.0, min(110.0, p))
            k = max(15.0, min(140.0, k))
            
            # 2. Temperature & Humidity bounded by crop season and Indore climate
            t_min = max(agro["temp"][0], teh_data["temp"][0])
            t_max = min(agro["temp"][1], teh_data["temp"][1])
            temp = np.random.uniform(t_min, max(t_min + 2, t_max)) + np.random.normal(0, 0.8)
            
            h_min = max(agro["humidity"][0], teh_data["humidity"][0] - 5)
            h_max = min(agro["humidity"][1], teh_data["humidity"][1] + 5)
            humidity = np.random.uniform(h_min, max(h_min + 5, h_max)) + np.random.normal(0, 2.0)
            humidity = max(25.0, min(95.0, humidity))
            
            # 3. Soil pH reflecting Malwa Black Cotton Soil (pH 7.0 - 8.2)
            ph_min = max(agro["ph"][0], teh_data["ph"][0] - 0.2)
            ph_max = min(agro["ph"][1], teh_data["ph"][1] + 0.2)
            ph = np.random.uniform(ph_min, max(ph_min + 0.3, ph_max)) + np.random.normal(0, 0.1)
            ph = max(6.0, min(8.6, ph))
            
            # 4. Rainfall in mm
            r_min = max(agro["rainfall"][0] * 0.85, teh_data["rain"][0] * 0.4)
            r_max = min(agro["rainfall"][1] * 1.15, teh_data["rain"][1] * 1.25)
            rainfall = np.random.uniform(r_min, max(r_min + 40, r_max)) + np.random.normal(0, 20.0)
            rainfall = max(180.0, min(1200.0, rainfall))
            
            records.append({
                "district": "Indore",
                "tehsil": tehsil,
                "agro_climatic_zone": teh_data["zone"],
                "soil_type": teh_data["soil"],
                "N": round(n, 2),
                "P": round(p, 2),
                "K": round(k, 2),
                "temperature": round(temp, 2),
                "humidity": round(humidity, 2),
                "ph": round(ph, 2),
                "rainfall": round(rainfall, 2),
                "season": agro["season"],
                "crop": crop_name
            })
            
    df = pd.DataFrame(records)
    # Shuffle dataset
    df = df.sample(frac=1.0, random_state=42).reset_index(drop=True)
    
    csv_path = "data/raw/indore_crop_dataset.csv"
    df.to_csv(csv_path, index=False)
    print(f"✅ Generated Indore Dataset: {csv_path}")
    print(f"   Total Samples: {len(df)} across {len(INDORE_CROP_AGRONOMY)} Indore crops.")
    print(f"   Crops: {', '.join(list(INDORE_CROP_AGRONOMY.keys()))}")
    return df

if __name__ == "__main__":
    generate_indore_crop_dataset(samples_per_crop=250)

















































