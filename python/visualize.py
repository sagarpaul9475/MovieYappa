import joblib
import matplotlib.pyplot as plt
import seaborn as sns
import pandas as pd
from sklearn.decomposition import TruncatedSVD




movies = pd.read_csv('movies_index.csv')
X_tfidf = joblib.load('tfidf_vectorizer.joblib').transform(movies['content'])
svd2 = TruncatedSVD(n_components=2, random_state=42)
X_2d = svd2.fit_transform(X_tfidf)




plt.figure(figsize=(12,8))
plt.scatter(X_2d[:,0], X_2d[:,1], s=8, alpha=0.6)
plt.title('Movies visualized in 2D (TruncatedSVD)')
plt.xlabel('component 1')
plt.ylabel('component 2')
plt.show()