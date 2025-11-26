require("dotenv").config();

const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const cosine = require("cosine-similarity");

const app = express();
app.get("/", (req, res) => {
  res.status(200).send("Backend is live!");
});

app.use(cors());

const PORT = 5000;

// --------------------------------------------
// Paths to Python Files
// --------------------------------------------
const MOVIES_PATH = path.join(__dirname, "../python/movies.json");
const NPY_PATH = path.join(__dirname, "../python/X_reduced.npy");

// --------------------------------------------
// Load Movies JSON
// --------------------------------------------
const movies = JSON.parse(fs.readFileSync(MOVIES_PATH, "utf8"));
console.log(`✔ Loaded ${movies.length} movies`);

// --------------------------------------------
// Custom NPY Loader
// --------------------------------------------
function loadNpy(filePath) {
  const buffer = fs.readFileSync(filePath);

  // Check header
  if (buffer.toString("binary", 0, 6) !== "\x93NUMPY") {
    throw new Error("Invalid NPY header");
  }

  const major = buffer[6];
  const headerLen = major === 1
    ? buffer.readUInt16LE(8)
    : buffer.readUInt32LE(8);

  const offset = major === 1 ? 10 : 12;

  const headerStr = buffer.toString("latin1", offset, offset + headerLen).trim();
  const dtype = headerStr.match(/'descr': '([^']+)'/)[1];
  const shape = headerStr
    .match(/'shape': \(([^)]+)\)/)[1]
    .split(",")
    .map(x => parseInt(x))
    .filter(x => !isNaN(x));

  const [rows, cols] = shape;

  let TypedArray;
  if (dtype === "<f8") TypedArray = Float64Array;
  else if (dtype === "<f4") TypedArray = Float32Array;
  else throw new Error("Unsupported dtype: " + dtype);

  const dataOffset = offset + headerLen;
  const flat = new TypedArray(buffer.slice(dataOffset).buffer);

  const matrix = [];
  for (let i = 0; i < rows; i++) {
    matrix.push([...flat.slice(i * cols, (i + 1) * cols)]);
  }

  return matrix;
}

// --------------------------------------------
// Load embeddings
// --------------------------------------------
let X_reduced = [];

try {
  console.log("📥 Loading embedding matrix...");
  X_reduced = loadNpy(NPY_PATH);
  console.log(`✔ Loaded ${X_reduced.length} vectors`);
} catch (err) {
  console.error("❌ NPY Load Error:", err);
}

// --------------------------------------------
// TMDB Title-based Poster Fetching
// --------------------------------------------
const TMDB_KEY = process.env.TMDB_API_KEY;
const TMDB_SEARCH = "https://api.themoviedb.org/3/search/movie";
const IMG_BASE = "https://image.tmdb.org/t/p/w500";

// Cache to avoid repeated API calls
const posterCache = {};

async function fetchPosterByTitle(title) {
  if (!title) return null;

  // Use cache
  if (posterCache[title]) return posterCache[title];

  try {
    const url = `${TMDB_SEARCH}?api_key=${TMDB_KEY}&query=${encodeURIComponent(title)}`;
    const res = await fetch(url);
    const data = await res.json();

    if (!data.results || data.results.length === 0) return null;

    const posterPath = data.results[0].poster_path;
    if (!posterPath) return null;

    const fullURL = IMG_BASE + posterPath;
    posterCache[title] = fullURL;

    return fullURL;
  } catch (err) {
    console.error("TMDB Fetch Error:", err);
    return null;
  }
}

// --------------------------------------------
// Cosine Similarity KNN (Async because posters)
// --------------------------------------------
async function topNSimilar(index, n = 5) {
  const targetVec = X_reduced[index];

  const scores = X_reduced.map((vec, idx) => ({
    idx,
    score: cosine(targetVec, vec),
  }));

  const best = scores
    .sort((a, b) => b.score - a.score)
    .filter(s => s.idx !== index)
    .slice(0, n);

  const results = [];

  for (const item of best) {
    const movie = movies[item.idx];
    const poster = await fetchPosterByTitle(movie.title);

    results.push({
      title: movie.title,
      poster_url: poster,
    });
  }

  return results;
}

// --------------------------------------------
// API Route
// --------------------------------------------
app.get("/recommend", async (req, res) => {
  const title = req.query.title;

  if (!title) return res.status(400).json({ error: "Missing title" });

  const index = movies.findIndex(
    m => m.title.toLowerCase() === title.toLowerCase()
  );

  if (index === -1)
    return res.status(404).json({ error: "Movie not found" });

  const recommendations = await topNSimilar(index, 5);

  res.json({
    query: movies[index].title,
    results: recommendations,
  });
});

// --------------------------------------------
app.listen(PORT, () => {
  console.log(`🚀 MovieYappa backend running on http://localhost:${PORT}`);
});
