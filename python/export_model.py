import numpy as np
import pandas as pd
import joblib

# Load saved artifacts
vectorizer = joblib.load("tfidf_vectorizer.joblib")
svd = joblib.load("svd_pca.joblib")
movies = pd.read_csv("movies_index.csv")

# Recompute X_reduced CLEANLY
print("Recomputing X_reduced...")
X_tfidf = vectorizer.transform(movies["content"])
X_reduced = svd.transform(X_tfidf)

# FORCE correct dtype and safe write
X_reduced = X_reduced.astype(np.float64)

np.save("X_reduced.npy", X_reduced)
movies.to_json("movies.json", orient="records")

print("✔ Export fixed!")
print("✔ X_reduced.npy (float64) regenerated cleanly.")
