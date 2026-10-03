# AgroSense Indore - Semi-Synthetic Dataset

This directory contains the dataset and generation scripts for the AgroSense Indore AI crop advisory system.

## How We Built Our Data (5 Short Steps)

1. **Step 1: Download Real Climate Data (NASA POWER API)**
   We pulled 5 years (2019–2023) of daily temperature, relative humidity, and precipitation for all 5 tehsils of Indore from NASA's public satellite API (`ml/step1_download_climate.py`) and calculated seasonal averages for Kharif and Rabi.

2. **Step 2: Define Indore District Soil Profile**
   We established physical boundary ranges for Medium-to-Deep Black Cotton Soil (Vertisol) from Government Soil Health Card norms and ICAR reports (pH 6.8–8.2, Available N 15–110 kg/ha, P 15–85 kg/ha, K 20–100 kg/ha) in `data/soil_profile.csv`.

3. **Step 3: Define Agricultural Crop Rules**
   We codified standard ICAR-IISR and RVSKVV agricultural rules for Indore's 6 main crops (Soybean, Maize, Wheat, Gram, Onion, Potato) based on season, pH tolerance, and nutrient demand in `data/crop_rules.csv`.

4. **Step 4: Generate Soil & Match Suitable Crops**
   In `ml/build_dataset.py`, we generated random soil test values independently from the district profile, combined them with real seasonal weather for each tehsil, and labeled each row using the agronomic rules.

5. **Step 5: Balanced Dataset Export**
   The generator produces exactly 1,500 balanced rows (250 rows $\times$ 6 crops) saved to `data/raw/indore_crop_dataset.csv` for training machine learning classifiers.

---

## 3-Sentence Spoken Explanation for Examiners / Faculty

1. *"First, our weather features (temperature, humidity, rainfall) are 100% real satellite data downloaded from NASA POWER across 5 years for Indore's 5 tehsils."*
2. *"Second, our soil test numbers (N, P, K, pH) are statistically drawn from the official Madhya Pradesh Soil Health Card ranges for Indore black cotton soil, completely independent of the crop."*
3. *"Third, each soil profile is labeled with its most suitable crop using verified ICAR agricultural rules, giving our Random Forest model a realistic regional dataset to learn from."*
