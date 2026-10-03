"""
STEP 1: Download Real Climate Data from NASA POWER API (2019-2023)
==================================================================
Downloads daily Temperature (T2M), Humidity (RH2M), and Rainfall (PRECTOTCORR)
for 5 tehsils of Indore district, removes -999 missing values, and calculates
seasonal averages for Kharif, Rabi, and Zaid.
"""

import time
import requests
import pandas as pd

# Coordinates for Indore district administrative tehsils
TEHSILS = {
    "Indore": {"lat": 22.7196, "lon": 75.8577},
    "Sanwer": {"lat": 22.9781, "lon": 75.8239},
    "Depalpur": {"lat": 22.8483, "lon": 75.5492},
    "Mhow": {"lat": 22.5539, "lon": 75.7644},
    "Hatod": {"lat": 22.7969, "lon": 75.7289}
}

# Standard agricultural seasons in Madhya Pradesh (Malwa Zone X)
def classify_season(month):
    if month in [6, 7, 8, 9, 10]:
        return "Kharif"   # Monsoon / Rainy Season
    elif month in [11, 12, 1, 2, 3]:
        return "Rabi"     # Winter Crop Season
    else:
        return "Zaid"     # Summer Crop Season (April - May)

all_seasonal_records = []

print("Starting NASA POWER API download (2019-2023)...")

for tehsil_name, coords in TEHSILS.items():
    print(f"Fetching data for: {tehsil_name} (Lat: {coords['lat']}, Lon: {coords['lon']})...")
    
    url = (
        f"https://power.larc.nasa.gov/api/temporal/daily/point?"
        f"parameters=T2M,RH2M,PRECTOTCORR&community=AG&"
        f"longitude={coords['lon']}&latitude={coords['lat']}&"
        f"start=20190101&end=20231231&format=JSON"
    )
    
    success = False
    retries = 3
    data = None
    
    for attempt in range(retries):
        try:
            response = requests.get(url, timeout=30)
            if response.status_code == 200:
                data = response.json()
                success = True
                break
            else:
                print(f"  Attempt {attempt+1} failed with status code {response.status_code}. Retrying...")
                time.sleep(2)
        except Exception as err:
            print(f"  Attempt {attempt+1} error: {err}. Retrying...")
            time.sleep(2)
            
    if not success or not data or "properties" not in data:
        print(f"❌ Failed to fetch climate for {tehsil_name}")
        continue
        
    params = data["properties"]["parameter"]
    dates = list(params["T2M"].keys())
    
    rows = []
    for d in dates:
        t = params["T2M"].get(d, -999)
        h = params["RH2M"].get(d, -999)
        r = params["PRECTOTCORR"].get(d, -999)
        
        # Filter out NASA -999 missing data flags
        if t <= -900 or h <= -900 or r <= -900:
            continue
            
        month = int(d[4:6])
        year = int(d[0:4])
        rows.append({
            "date": d,
            "year": year,
            "month": month,
            "season": classify_season(month),
            "temperature": t,
            "humidity": h,
            "rainfall": r
        })
        
    df_tehsil = pd.DataFrame(rows)
    print(f"  Downloaded {len(df_tehsil)} daily observations.")
    
    # Calculate seasonal statistics
    for season_name in ["Kharif", "Rabi", "Zaid"]:
        df_season = df_tehsil[df_tehsil["season"] == season_name]
        
        avg_temp = round(df_season["temperature"].mean(), 2)
        avg_humidity = round(df_season["humidity"].mean(), 2)
        # Average seasonal total rainfall per year (sum of rain / 5 years)
        avg_rainfall = round(df_season["rainfall"].sum() / 5.0, 2)
        
        all_seasonal_records.append({
            "tehsil": tehsil_name,
            "season": season_name,
            "temperature_avg_c": avg_temp,
            "humidity_avg_pct": avg_humidity,
            "rainfall_seasonal_total_mm": avg_rainfall
        })

climate_df = pd.DataFrame(all_seasonal_records)
out_path = "data/climate_by_tehsil_season.csv"
climate_df.to_csv(out_path, index=False)
print(f"\n✅ Saved seasonal climate averages to {out_path}")
print(climate_df.to_string(index=False))
