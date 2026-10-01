import sys
import json
import os
import joblib
import pandas as pd
import numpy as np

def run_prediction():
    try:
        # Read JSON string passed as command line argument
        if len(sys.argv) > 1:
            data = json.loads(sys.argv[1])
        else:
            data = json.loads(sys.stdin.read())

        # Features order
        features = [
            float(data.get("N", 40)),
            float(data.get("P", 55)),
            float(data.get("K", 40)),
            float(data.get("temperature", 28)),
            float(data.get("humidity", 70)),
            float(data.get("ph", 7.4)),
            float(data.get("rainfall", 850))
        ]

        feature_cols = ["N", "P", "K", "temperature", "humidity", "ph", "rainfall"]
        df_input = pd.DataFrame([features], columns=feature_cols)

        # Path to trained model
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        model_path = os.path.join(base_dir, "models", "indore_crop_model.pkl")

        if not os.path.exists(model_path):
            raise FileNotFoundError(f"Model not found at {model_path}")

        pkg = joblib.load(model_path)
        model = pkg["model"]

        # Calculate prediction probabilities
        probs = model.predict_proba(df_input)[0]
        classes = model.classes_

        # Sort top 3 crops
        top_idx = np.argsort(probs)[::-1][:3]
        results = []
        for idx in top_idx:
            results.append({
                "crop": str(classes[idx]),
                "confidence": round(float(probs[idx]) * 100, 1)
            })

        print(json.dumps({
            "status": "success",
            "source": "Scikit-Learn Random Forest Model (indore_crop_model.pkl)",
            "predictions": results
        }))

    except Exception as e:
        print(json.dumps({
            "status": "error",
            "message": str(e)
        }))

if __name__ == "__main__":
    run_prediction()
