import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.decomposition import TruncatedSVD
from sklearn.neighbors import NearestNeighbors
from sklearn.metrics.pairwise import cosine_similarity
import joblib


movies = pd.read_csv('movies_content.csv')


# TF-IDF vectorizer
vectorizer = TfidfVectorizer(min_df=3, max_df=0.8, ngram_range=(1,2))
X_tfidf = vectorizer.fit_transform(movies['content'])
print('TF-IDF shape:', X_tfidf.shape)


# Dimensionality reduction - use TruncatedSVD as PCA for sparse data
n_components = 50 # you can vary (50-200)
svd = TruncatedSVD(n_components=n_components, random_state=42)
X_reduced = svd.fit_transform(X_tfidf)
print('Reduced shape:', X_reduced.shape)


# Fit NearestNeighbors with cosine metric
# cosine with NearestNeighbors uses metric='cosine' (note: sklearn cosine returns distance=1-cosine_similarity)
knn = NearestNeighbors(n_neighbors=6, metric='cosine')
knn.fit(X_reduced)


# Save artifacts
joblib.dump(vectorizer, 'tfidf_vectorizer.joblib')
joblib.dump(svd, 'svd_pca.joblib')
joblib.dump(knn, 'knn_model.joblib')
movies.to_csv('movies_index.csv', index=False)
print('Saved models and index')