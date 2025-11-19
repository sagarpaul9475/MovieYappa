import pandas as pd
from ast import literal_eval

# ------------------------------
# Safe JSON parser
# ------------------------------
def safe_load(x):
    try:
        return literal_eval(x)
    except:
        return []

# ------------------------------
# Extract list of names
# ------------------------------
def extract_names(column):
    items = safe_load(column)
    if isinstance(items, list):
        return [d.get("name", "") for d in items if isinstance(d, dict)]
    return []

# ------------------------------
# Extract director
# ------------------------------
def extract_director(crew_column):
    crew = safe_load(crew_column)
    if isinstance(crew, list):
        for person in crew:
            if isinstance(person, dict) and person.get("job") == "Director":
                return person.get("name", "")
    return ""

# ------------------------------
# Load datasets
# ------------------------------
movies = pd.read_csv("tmdb_5000_movies.csv")
credits = pd.read_csv("tmdb_5000_credits.csv")

# Merge on title
movies = movies.merge(credits, on="title")

# Fill missing overview
movies["overview"] = movies["overview"].fillna("")

# Remove duplicates
movies = movies.drop_duplicates(subset=["title"])

# Extract text fields
movies["genres"] = movies["genres"].apply(extract_names)
movies["keywords"] = movies["keywords"].apply(extract_names)
movies["cast"] = movies["cast"].apply(lambda x: extract_names(x)[:3])
movies["director"] = movies["crew"].apply(extract_director)

# Convert list → string
movies["genres_str"] = movies["genres"].apply(lambda lst: " ".join([g.replace(" ", "_") for g in lst]))
movies["keywords_str"] = movies["keywords"].apply(lambda lst: " ".join([k.replace(" ", "_") for k in lst]))
movies["cast_str"] = movies["cast"].apply(lambda lst: " ".join([c.replace(" ", "_") for c in lst]))
movies["director_str"] = movies["director"].apply(lambda x: x.replace(" ", "_"))

# Combined content
movies["content"] = (
    movies["overview"] + " " +
    movies["genres_str"] + " " +
    movies["keywords_str"] + " " +
    movies["cast_str"] + " " +
    movies["director_str"]
).str.lower()

# Your movies.csv does NOT contain poster_path
movies["poster_path"] = ""

# Final small dataset
movies_small = movies[["movie_id", "title", "content", "poster_path"]]

movies_small.to_csv("movies_content.csv", index=False)

print("✔ data_prep.py executed successfully!")
print("✔ movies_content.csv created with", len(movies_small), "rows")
