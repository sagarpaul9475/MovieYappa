import joblib
import numpy as np
import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity


vectorizer = joblib.load('tfidf_vectorizer.joblib')
svd = joblib.load('svd_pca.joblib')
knn = joblib.load('knn_model.joblib')
movies = pd.read_csv('movies_index.csv')


def get_similar_movies(title, top_n=5):
    idxs = movies[movies['title'].str.lower() == title.lower()].index
    if len(idxs)==0:
        idxs = movies[movies['title'].str.lower().str.contains(title.lower())].index
    if len(idxs)==0:
        return []
    idx = idxs[0]
    content = movies.loc[idx, 'content']
    v = vectorizer.transform([content])
    v_red = svd.transform(v)
    distances, indices = knn.kneighbors(v_red, n_neighbors=top_n+1)
    recs = []
    for i in indices[0]:
        if i==idx:
            continue
        recs.append({
            'title': movies.loc[i,'title'],
            'poster_path': movies.loc[i,'poster_path']
        })
        if len(recs)==top_n:
            break
    return recs
if __name__=='__main__':
    for q in ['The Dark Knight Rises', 'Toy Story', 'Pulp Fiction']:
        print('\nQuery:', q)
print(get_similar_movies(q))