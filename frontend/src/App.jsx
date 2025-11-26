import { useState } from "react";

const API_URL = "https://movieyappa-4.onrender.com/recommend";

export default function App() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const searchMovie = async () => {
    if (!query.trim()) {
      alert("Please enter a movie name");
      return;
    }

    setLoading(true);
    setResults([]);

    try {
      const response = await fetch(`${API_URL}?title=${encodeURIComponent(query)}`);
      const data = await response.json();

      if (!response.ok) {
        setResults([]);
        alert(data.error || "Movie not found");
      } else {
        setResults(data.results);
      }
    } catch (err) {
      alert("Backend not reachable. Start your Node server!");
    }

    setLoading(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") searchMovie();
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white px-6 py-10">
      
      {/* HEADER */}
      <h1 className="text-5xl font-extrabold text-center text-red-500 drop-shadow-md mb-10">
        🎬 MovieYappa
      </h1>

      {/* SEARCH BAR */}
      <div className="max-w-3xl mx-auto flex gap-3">
        <input
          type="text"
          placeholder="Search for a movie..."
          value={query}
          onKeyDown={handleKeyPress}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 px-5 py-4 rounded-lg 
                     text-white bg-gray-800 border border-gray-700
                     focus:border-red-500 focus:outline-none transition"
        />

        <button
          onClick={searchMovie}
          className="bg-red-600 hover:bg-red-700 px-6 py-4 rounded-lg 
                     font-semibold transition text-white"
        >
          Search
        </button>
      </div>

      {/* LOADING STATE */}
      {loading && (
        <p className="text-center mt-10 text-xl animate-pulse text-gray-300">
          Loading recommendations...
        </p>
      )}

      {/* SKELETON LOADING */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 mt-10 max-w-5xl mx-auto">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-gray-800 rounded-xl p-3 animate-pulse">
              <div className="w-full h-80 bg-gray-700 rounded-lg"></div>
              <div className="h-5 bg-gray-700 rounded mt-3 w-3/4 mx-auto"></div>
            </div>
          ))}
        </div>
      )}

      {/* NO RESULTS */}
      {!loading && results.length === 0 && query.trim() && (
        <p className="text-center text-gray-400 mt-10 text-lg">
          No recommendations found. Try another movie.
        </p>
      )}

      {/* RESULTS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 mt-10 max-w-5xl mx-auto">
        {results.map((movie, index) => (
          <div
            key={index}
            className="bg-gray-900 rounded-xl p-3 shadow-xl 
                       hover:scale-105 hover:shadow-2xl 
                       transform transition duration-300"
          >
            {movie.poster_url ? (
              <img
                src={movie.poster_url}
                alt={movie.title}
                className="w-full h-80 object-cover rounded-lg opacity-0 animate-fadeIn"
              />
            ) : (
              <div className="w-full h-80 bg-gray-700 rounded-lg flex items-center justify-center text-gray-300">
                No Image Available
              </div>
            )}

            <h2 className="mt-4 text-center text-xl font-semibold">
              {movie.title}
            </h2>
          </div>
        ))}
      </div>

      {/* ANIMATION STYLES */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-in-out forwards;
        }
      `}</style>
    </div>
  );
}
