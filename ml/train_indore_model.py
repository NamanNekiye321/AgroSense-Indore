"""
================================================================================
CROPWISE INDORE - AI MODEL TRAINING & BENCHMARKING PIPELINE
================================================================================
Module: Model Training, Cross-Validation & Serialization for Indore Region
Authored by: Kuldeep (ML Data Preprocessing & Training Lead)
Collaborator: Naman (Database & Agronomic Systems Lead)
================================================================================
"""

import os
import joblib
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split, cross_val_score, StratifiedKFold
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.ensemble import RandomForestClassifier, ExtraTreesClassifier, GradientBoostingClassifier
from sklearn.tree import DecisionTreeClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, classification_report, f1_score

# Paths
INDORE_DATA_PATH = "data/raw/indore_crop_dataset.csv"
MODEL_DIR = "models"
os.makedirs(MODEL_DIR, exist_ok=True)

FEATURE_COLS = ["N", "P", "K", "temperature", "humidity", "ph", "rainfall"]

def train_indore_model():
    print("\n" + "=" * 65)
    print("🌾 CROPWISE INDORE - MACHINE LEARNING TRAINING PIPELINE")
    print("   Malwa Plateau Agro-Climatic Zone (Indore District)")
    print("=" * 65)

    if not os.path.exists(INDORE_DATA_PATH):
        from indore_dataset_generator import generate_indore_crop_dataset
        generate_indore_crop_dataset()

    df = pd.read_csv(INDORE_DATA_PATH)
    print(f"\n[ML Pipeline] Loaded dataset from {INDORE_DATA_PATH}")
    print(f"  Total samples: {len(df)}")
    print(f"  Classes ({len(df['crop'].unique())}): {list(df['crop'].unique())}")

    X = df[FEATURE_COLS]
    y = df["crop"]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )

    candidate_models = {
        "Random Forest": RandomForestClassifier(
            n_estimators=200, max_depth=14, random_state=42, n_jobs=-1
        ),
        "Extra Trees": ExtraTreesClassifier(
            n_estimators=200, max_depth=14, random_state=42, n_jobs=-1
        ),
        "Gradient Boosting": GradientBoostingClassifier(
            n_estimators=120, learning_rate=0.1, max_depth=4, random_state=42
        ),
        "Decision Tree": DecisionTreeClassifier(
            max_depth=10, random_state=42
        ),
        "Logistic Regression": Pipeline([
            ("scaler", StandardScaler()),
            ("clf", LogisticRegression(max_iter=1500, random_state=42))
        ])
    }

    print("\n" + "-" * 65)
    print("📊 BENCHMARKING MULTI-CLASS CLASSIFIERS (5-Fold Stratified CV)")
    print("-" * 65)

    results = {}

    for name, clf in candidate_models.items():
        cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
        cv_scores = cross_val_score(clf, X_train, y_train, cv=cv, scoring="accuracy")

        clf.fit(X_train, y_train)
        y_pred = clf.predict(X_test)

        acc = accuracy_score(y_test, y_pred)
        f1 = f1_score(y_test, y_pred, average="weighted")

        results[name] = {
            "model": clf,
            "accuracy": acc,
            "f1_score": f1,
            "cv_mean": cv_scores.mean(),
            "cv_std": cv_scores.std()
        }

        print(f"-> {name:<20} | Test Acc: {acc*100:6.2f}% | F1: {f1:6.4f} | 5-Fold CV: {cv_scores.mean()*100:6.2f}% (+/- {cv_scores.std()*100:4.2f}%)")

    best_name = max(results, key=lambda k: results[k]["accuracy"])
    best_entry = results[best_name]
    best_model = best_entry["model"]

    print("\n" + "=" * 65)
    print(f"🏆 CHAMPION MODEL SELECTED: {best_name}")
    print(f"   Accuracy: {best_entry['accuracy']*100:.2f}% | F1-Score: {best_entry['f1_score']:.4f}")
    print("=" * 65)

    # Detailed report
    y_pred_best = best_model.predict(X_test)
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred_best))

    # Save package
    save_path = os.path.join(MODEL_DIR, "indore_crop_model.pkl")
    
    model_artifact = {
        "model": best_model,
        "features": FEATURE_COLS,
        "classes": list(best_model.classes_),
        "model_name": best_name,
        "accuracy": best_entry["accuracy"],
        "f1_score": best_entry["f1_score"],
        "district": "Indore",
        "zone": "Malwa Plateau (Zone X)",
        "crops": list(best_model.classes_),
        "trained_by": "Kuldeep & Naman (ML Engineering Lead)"
    }

    joblib.dump(model_artifact, save_path)
    print(f"💾 Serialized Indore model saved to: {save_path}")

    # Also save as jharkhand_crop_model.pkl fallback or crop_recommendation_model.pkl if desired
    # so old pointers also resolve seamlessly
    return model_artifact

if __name__ == "__main__":
    train_indore_model()



























