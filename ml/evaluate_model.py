import pandas as pd
import joblib

from sklearn.model_selection import StratifiedKFold, cross_val_score
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix
)

import matplotlib.pyplot as plt


# ============================================================
# CROP WISE - MODEL EVALUATION
# ============================================================

DATASET_PATH = "data/raw/Crop_recommendation.csv"
MODEL_PATH = "models/crop_recommendation_model.pkl"


print("\n" + "=" * 70)
print("🌾 CROP WISE - MODEL EVALUATION")
print("=" * 70)


# ------------------------------------------------------------
# 1. Load dataset
# ------------------------------------------------------------

df = pd.read_csv(DATASET_PATH)

print(f"\nDataset loaded: {df.shape[0]} rows")


# ------------------------------------------------------------
# 2. Load our saved model
# ------------------------------------------------------------

model_package = joblib.load(MODEL_PATH)

model = model_package["model"]
features = model_package["features"]
model_name = model_package["model_name"]

print(f"Model loaded: {model_name}")

print("\nFeatures:")
for feature in features:
    print(f"  - {feature}")


# ------------------------------------------------------------
# 3. Prepare data
# ------------------------------------------------------------

X = df[features]
y = df["label"]


# ------------------------------------------------------------
# 4. Hold-out test evaluation
# ------------------------------------------------------------

# Use the same split settings used during training.
from sklearn.model_selection import train_test_split

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.20,
    random_state=42,
    stratify=y
)


# Train the loaded model on the training portion
model.fit(X_train, y_train)

predictions = model.predict(X_test)


# ------------------------------------------------------------
# 5. Accuracy
# ------------------------------------------------------------

accuracy = accuracy_score(y_test, predictions)

print("\n" + "=" * 70)
print("📊 TEST SET PERFORMANCE")
print("=" * 70)

print(f"\nAccuracy: {accuracy * 100:.2f}%")


# ------------------------------------------------------------
# 6. Classification report
# ------------------------------------------------------------

print("\n" + "=" * 70)
print("📋 PRECISION / RECALL / F1-SCORE")
print("=" * 70)

print(
    classification_report(
        y_test,
        predictions
    )
)


# ------------------------------------------------------------
# 7. Confusion matrix
# ------------------------------------------------------------

labels = sorted(y.unique())

cm = confusion_matrix(
    y_test,
    predictions,
    labels=labels
)

print("\n" + "=" * 70)
print("🔍 CONFUSION MATRIX")
print("=" * 70)

print("\nCrop order:")
print(labels)

print("\nMatrix:")
print(cm)


# ------------------------------------------------------------
# 8. Cross-validation
# ------------------------------------------------------------

print("\n" + "=" * 70)
print("🔄 5-FOLD CROSS-VALIDATION")
print("=" * 70)

cv = StratifiedKFold(
    n_splits=5,
    shuffle=True,
    random_state=42
)

cv_scores = cross_val_score(
    model,
    X,
    y,
    cv=cv,
    scoring="accuracy",
    n_jobs=-1
)

print("\nFold accuracies:")

for i, score in enumerate(cv_scores, start=1):
    print(f"Fold {i}: {score * 100:.2f}%")

print(
    f"\nMean CV Accuracy: "
    f"{cv_scores.mean() * 100:.2f}%"
)

print(
    f"CV Standard Deviation: "
    f"{cv_scores.std() * 100:.2f}%"
)


# ------------------------------------------------------------
# 9. Feature importance
# ------------------------------------------------------------

print("\n" + "=" * 70)
print("🌱 FEATURE IMPORTANCE")
print("=" * 70)

if hasattr(model, "feature_importances_"):

    importance_data = pd.DataFrame({
        "Feature": features,
        "Importance": model.feature_importances_
    })

    importance_data = importance_data.sort_values(
        by="Importance",
        ascending=False
    )

    for _, row in importance_data.iterrows():
        print(
            f"{row['Feature']:<15} "
            f"{row['Importance']:.4f}"
        )

else:
    print("Feature importance is not available for this model.")


# ------------------------------------------------------------
# 10. Save evaluation summary
# ------------------------------------------------------------

evaluation_summary = {
    "model": model_name,
    "test_accuracy": accuracy,
    "cross_validation_mean": cv_scores.mean(),
    "cross_validation_std": cv_scores.std()
}

joblib.dump(
    evaluation_summary,
    "models/evaluation_summary.pkl"
)


print("\n" + "=" * 70)
print("✅ MODEL EVALUATION COMPLETED")
print("=" * 70)




