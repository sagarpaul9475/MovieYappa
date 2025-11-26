# Movie Recommender (demo) - MERN-ready package
  --------------------------------------------

#  Files included:
  - server.js               Express backend
  - package.json
  - movies.json             sample metadata (10 movies)
  - X_reduced.npy           demo reduced vectors (10 x 10)
  - Dockerfile
  - postman_collection.json
  - MovieSearch.jsx         React component for frontend

#  Quick start (backend):
  1. cd to project folder
  2. npm install
  3. npm run dev   (or `npm start`)
  4. Open GET http://localhost:5000/recommend?title=Inception

#  Notes:
  - This demo uses random vectors for X_reduced.npy and a tiny movies.json
    Replace movies.json and X_reduced.npy with your real artifacts exported
    from the Python pipeline for accurate recommendations.
# Checkout:
  - Live-link: https://movieyappa-6.onrender.com

