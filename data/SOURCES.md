# Data Sources & References: AgroSense Indore

This document provides a verified accounting of all external sources, government standards, and APIs utilized to build the semi-synthetic agro-climatic dataset for Indore district.

---

### 1. NASA POWER API (Prediction Of Worldwide Energy Resources)
* **What was taken:** 5 years (2019–2023) of daily temperature at 2 meters (`T2M`), relative humidity at 2 meters (`RH2M`), and precipitation (`PRECTOTCORR`) for all 5 tehsils of Indore district.
* **Geographical Coordinates:**
  * Indore: `22.7196° N, 75.8577° E`
  * Sanwer: `22.9781° N, 75.8239° E`
  * Depalpur: `22.8483° N, 75.5492° E`
  * Mhow: `22.5539° N, 75.7644° E`
  * Hatod: `22.7969° N, 75.7289° E`
* **Status:** **VERIFIED**
* **Access URL:** [https://power.larc.nasa.gov/](https://power.larc.nasa.gov/) (Public API, no key required).

---

### 2. Soil Health Card (SHC) Portal - Ministry of Agriculture & Farmers Welfare, Govt. of India
* **What was taken:** Indore district macro-nutrient ratings and soil characteristic baselines for Medium-to-Deep Black Soils (Vertisols). Confirmed baseline pH between 7.2 and 8.2 (neutral to moderately alkaline).
* **Status:** **VERIFIED (District Level)**
* **Note:** Individual farmer Soil Health Cards are private and not bulk-downloadable via public API. Tehsil-level sub-division is **NOT VERIFIED AS RAW CSV** (district-wide profile is applied across all tehsils).
* **Access URL:** [https://soilhealth.dac.gov.in/](https://soilhealth.dac.gov.in/)

---

### 3. ICAR - Indian Institute of Soybean Research (ICAR-IISR), Indore
* **What was taken:** Agronomic baselines for Soybean in Malwa Agro-Climatic Zone X. Specifically, Table-1 sowing recommendations, 95–105 day maturity cycles, and recommended NPKS ratio (25:60:40:20 kg/ha).
* **Location:** Khandwa Road, Indore, Madhya Pradesh.
* **Status:** **VERIFIED**
* **Access URL:** [https://iisrindore.icar.gov.in/](https://iisrindore.icar.gov.in/)

---

### 4. Rajmata Vijayaraje Scindia Krishi Vishwavidyalaya (RVSKVV) & College of Agriculture, Indore
* **What was taken:** *Package of Practices for Field Crops of Malwa Plateau* (NPK fertilizer recommendations and crop requirements for Malvi/Sharbati Wheat, Gram/Chickpea, Maize, Onion, and Potato).
* **Status:** **VERIFIED**
* **Access URL:** [http://www.rvskvv.net/](http://www.rvskvv.net/)

---

### 5. Directorate of Farmer Welfare and Agriculture Development, Govt. of Madhya Pradesh
* **What was taken:** Administrative tehsil listings (Sanwer, Indore, Depalpur, Mhow, Hatod) and district agricultural statistical abstracts.
* **Status:** **VERIFIED**
* **Access URL:** [http://mpkrishi.mp.gov.in/](http://mpkrishi.mp.gov.in/)

---

### 6. APY Portal - Directorate of Economics and Statistics (DES), Ministry of Agriculture
* **What was taken:** Historical district cropping patterns indicating Soybean as the primary Kharif crop, and Wheat & Gram as primary Rabi crops in Indore district.
* **Status:** **VERIFIED**
* **Access URL:** [https://apy.dac.gov.in/](https://apy.dac.gov.in/)
