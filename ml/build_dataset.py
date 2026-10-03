"""
================================================================================
AGROSENSE INDORE - SEMI-SYNTHETIC DATASET GENERATOR (build_dataset.py)
================================================================================
Purpose:
  Build a clean, transparent, semi-synthetic dataset where:
  1. Climate is anchored in REAL NASA POWER 5-year averages for each tehsil.
  2. Soil (N, P, K, pH) is drawn from INDORE DISTRICT BLACK SOIL PROFILES
     (independent of crop).
  3. Crop labels are assigned by SIMPLE AGRONOMIC RULES (Season + Soil suitability).
  4. Seed is fixed (42) for scientific reproducibility.
================================================================================
"""

import os
import random
import numpy as np
import pandas as pd

# Set fixed random seed for full reproducibility
SEED = 42
random.seed(SEED)
np.random.seed(SEED)

# -----------------------------------------------------------------------------
# 1. LOAD VERIFIED BENCHMARKS
# -----------------------------------------------------------------------------

CLIMATE_PATH = "data/climate_by_tehsil_season.csv"
SOIL_PATH = "data/soil_profile.csv"

# Load NASA 5-year climate table
climate_df = pd.read_csv(CLIMATE_PATH)

# Load Indore district soil profile
soil_df = pd.read_csv(SOIL_PATH)
soil_dict = soil_df.set_index("parameter").to_dict("index")

# Extract district soil bounds for Indore black soil (Vertisols)
N_MIN, N_MAX = float(soil_dict["N"]["min_val"]), float(soil_dict["N"]["max_val"])
P_MIN, P_MAX = float(soil_dict["P"]["min_val"]), float(soil_dict["P"]["max_val"])
K_MIN, K_MAX = float(soil_dict["K"]["min_val"]), float(soil_dict["K"]["max_val"])
PH_MIN, PH_MAX = float(soil_dict["ph"]["min_val"]), float(soil_dict["ph"]["max_val"])

TEHSILS = ["Indore", "Sanwer", "Depalpur", "Mhow", "Hatod"]
SEASONS = ["Kharif", "Rabi"]  # The 6 primary economic crops grow in Kharif and Rabi

TARGET_CROPS = ["Soybean", "Maize (Corn)", "Wheat", "Gram (Chickpea)", "Onion", "Potato"]
TARGET_PER_CROP = 250


# -----------------------------------------------------------------------------
# 2. SIMPLE AGRONOMIC ASSIGNMENT RULE
# -----------------------------------------------------------------------------
def get_suitable_crops(season, n, p, k, ph, temp, rain):
    """
    Assigns candidate crops based on real-world agronomy:
    - Step A: Season filter (Kharif vs Rabi)
    - Step B: pH filter (crop tolerance)
    - Step C: Nutrient preference (Legumes prefer low N, Tubers prefer high K, Cereals prefer high N)
    """
    candidates = []

    # ------------------ KHARIF CROPS (Monsoon) ------------------
    if season == "Kharif":
        # Soybean: Legume (nitrogen-fixing). Prefers moderate N (<60), good P (>=40), pH 6.8-8.0
        if 6.8 <= ph <= 8.0 and n <= 60 and p >= 40:
            candidates.append("Soybean")

        # Maize (Corn): Cereal feeder. Prefers higher N (>=45), moderate P, pH 6.5-7.8
        if 6.5 <= ph <= 7.9 and n >= 45:
            candidates.append("Maize (Corn)")

    # ------------------ RABI CROPS (Winter) ------------------
    elif season == "Rabi":
        # Wheat: Heavy cereal feeder. Needs high N (>=60), moderate P, pH 7.0-8.2
        if 7.0 <= ph <= 8.2 and n >= 55 and p >= 35:
            candidates.append("Wheat")

        # Gram (Chickpea): Legume pulse. Prefers lower soil N (<50), moderate P, pH 7.0-8.2
        if 7.0 <= ph <= 8.2 and n <= 50 and p >= 35:
            candidates.append("Gram (Chickpea)")

        # Onion: Commercial bulb. High potash feeder (K >= 50), pH 6.8-8.0
        if 6.8 <= ph <= 8.0 and k >= 50:
            candidates.append("Onion")

        # Potato: Tuber crop. High phosphorus & potassium (P >= 45, K >= 50), pH 6.2-7.7
        if 6.5 <= ph <= 7.8 and p >= 45 and k >= 50:
            candidates.append("Potato")

    return candidates


# -----------------------------------------------------------------------------
# 3. BUILD THE SEMI-SYNTHETIC DATASET
# -----------------------------------------------------------------------------
def build_indore_dataset():
    crop_counts = {crop: 0 for crop in TARGET_CROPS}
    records = []
    
    # Pre-index climate lookup by (tehsil, season)
    climate_lookup = {}
    for _, row in climate_df.iterrows():
        key = (row["tehsil"], row["season"])
        climate_lookup[key] = {
            "temp": row["temperature_avg_c"],
            "humidity": row["humidity_avg_pct"],
            "rainfall": row["rainfall_seasonal_total_mm"]
        }

    iteration = 0
    max_iterations = 100000

    while any(count < TARGET_PER_CROP for count in crop_counts.values()) and iteration < max_iterations:
        iteration += 1

        # 1. Randomly choose tehsil and agricultural season
        tehsil = random.choice(TEHSILS)
        season = random.choice(SEASONS)

        # 2. Get real NASA baseline climate for this tehsil & season + small natural variance
        base_climate = climate_lookup[(tehsil, season)]
        
        # Add small realistic sensor/weather variation (+/- 1.5°C temp, +/- 3% humidity)
        temp = round(base_climate["temp"] + np.random.normal(0, 1.2), 2)
        humidity = round(np.clip(base_climate["humidity"] + np.random.normal(0, 3.0), 20.0, 95.0), 2)
        
        # Rainfall variation (monsoon has larger std dev than dry winter)
        if season == "Kharif":
            rain = round(np.clip(base_climate["rainfall"] + np.random.normal(0, 45.0), 650.0, 1300.0), 2)
        else:
            rain = round(np.clip(base_climate["rainfall"] + np.random.normal(0, 8.0), 10.0, 80.0), 2)

        # 3. Draw Soil N, P, K, pH from Indore district black soil profile (independent of crop!)
        n = round(np.random.uniform(N_MIN, N_MAX) + np.random.normal(0, 2.0), 2)
        p = round(np.random.uniform(P_MIN, P_MAX) + np.random.normal(0, 2.0), 2)
        k = round(np.random.uniform(K_MIN, K_MAX) + np.random.normal(0, 2.0), 2)
        ph = round(np.random.uniform(PH_MIN, PH_MAX) + np.random.normal(0, 0.05), 2)

        # Bound to physical soil limits
        n = float(np.clip(n, N_MIN, N_MAX))
        p = float(np.clip(p, P_MIN, P_MAX))
        k = float(np.clip(k, K_MIN, K_MAX))
        ph = float(np.clip(ph, PH_MIN, PH_MAX))

        # 4. Assign crop by applying agronomy rules
        suitable = get_suitable_crops(season, n, p, k, ph, temp, rain)
        if not suitable:
            continue

        # Filter suitable crops that still need samples to reach 250
        needy_crops = [c for c in suitable if crop_counts[c] < TARGET_PER_CROP]
        if not needy_crops:
            # If all suitable crops are full, pick randomly among suitable to maintain natural distribution
            continue
            
        chosen_crop = random.choice(needy_crops)
        crop_counts[chosen_crop] += 1

        records.append({
            "district": "Indore",
            "tehsil": tehsil,
            "season": season,
            "N": n,
            "P": p,
            "K": k,
            "temperature": temp,
            "humidity": humidity,
            "ph": ph,
            "rainfall": rain,
            "crop": chosen_crop
        })

    df = pd.DataFrame(records)
    # Shuffle all rows
    df = df.sample(frac=1.0, random_state=SEED).reset_index(drop=True)

    out_csv = "data/raw/indore_crop_dataset.csv"
    df.to_csv(out_csv, index=False)
    
    print("\n" + "=" * 60)
    print("✅ SEMI-SYNTHETIC INDORE DATASET GENERATION COMPLETE")
    print("=" * 60)
    print(f"Total Rows Generated: {len(df)}")
    print(f"Output File: {out_csv}")
    print("\nClass Balance (Crops):")
    for crop, count in crop_counts.items():
        print(f"  • {crop:<22}: {count} rows")
    print("\nTehsil Distribution:")
    print(df["tehsil"].value_counts().to_string())
    print("\nSeason Distribution:")
    print(df["season"].value_counts().to_string())
    
    return df

if __name__ == "__main__":
    build_indore_dataset()
