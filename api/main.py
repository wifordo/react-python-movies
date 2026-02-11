from fastapi import FastAPI, Body
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
from typing import Any
import sqlite3

# Inicjalizacja modelu AI (najlżejszy dostepny)
model = SentenceTransformer('all-MiniLM-L6-v2')

class Movie(BaseModel):
    title: str
    year: str
    actors: str
    director: str
    description: str
app = FastAPI()

app.mount("/static", StaticFiles(directory="../ui/build/static", check_dir=False), name="static")

@app.get("/")
def serve_react_app():
   return FileResponse("../ui/build/index.html")

@app.get('/movies')
def get_movies():  # put application's code here
    db = sqlite3.connect('movies.db')
    cursor = db.cursor()
    movies = cursor.execute('SELECT * FROM movies')

    output = []
    for movie in movies:
         movie = {'id': movie[0], 'title': movie[1], 'year': movie[2], 'actors': movie[3], 'director': movie[4] if len(movie) > 4 else "",
         'description': movie[5] if len(movie) > 5 else ""}
         output.append(movie)
    return output

@app.get('/movies/{movie_id}')
def get_single_movie(movie_id:int):  # put application's code here
    db = sqlite3.connect('movies.db')
    cursor = db.cursor()
    movie = cursor.execute(f"SELECT * FROM movies WHERE id={movie_id}").fetchone()
    if movie is None:
        return {'message': "Movie not found"}
    return {'title': movie[1], 'year': movie[2], 'actors': movie[3]}

@app.post("/movies")
def add_movie(movie: Movie):
    db = sqlite3.connect('movies.db')
    cursor = db.cursor()
    cursor.execute(f"INSERT INTO movies (title, year, actors, director, description) VALUES ('{movie.title}', '{movie.year}', '{movie.actors}', '{movie.director}', '{movie.description}')")
    db.commit()
    db.close()
    new_id = cursor.lastrowid
    return {"message": f"Movie with id = {cursor.lastrowid} added successfully",
            "id": new_id,
            "title": movie.title,
            "year": movie.year,
            "actors": movie.actors,
            "director": movie.director,
            "description": movie.description
            }
    # movie = models.Movie.create(**movie.dict())
    # return movie

@app.put("/movies/{movie_id}")
def update_movie(movie_id:int, movie: Movie): # Movie zamiast dict
    db = sqlite3.connect('movies.db')
    cursor = db.cursor()
    cursor.execute(
        "UPDATE movies SET title = ?, year = ?, actors = ?, director = ?, description = ? WHERE id = ?",
        (movie.title, movie.year, movie.actors, movie.director, movie.description, movie_id)
    )
    db.commit()
    db.close()
    if cursor.rowcount == 0:
        return {"message": f"Movie with id = {movie_id} not found"}
    return {
        "id": movie_id,
        "title": movie.title,
        "year": movie.year,
        "actors": movie.actors,
        "director": movie.director,
        "description": movie.description
    }

@app.delete("/movies/{movie_id}")
def delete_movie(movie_id:int):
    db = sqlite3.connect('movies.db')
    cursor = db.cursor()
    cursor.execute("DELETE FROM movies WHERE id = ?", (movie_id,))
    db.commit()
    db.close()
    if cursor.rowcount == 0:
        return {"message": f"Movie with id = {movie_id} not found"}
    return {"message": f"Movie with id = {movie_id} deleted successfully"}

@app.delete("/movies")
def delete_movies(movie_id:int):
    db = sqlite3.connect('movies.db')
    cursor = db.cursor()
    cursor.execute("DELETE FROM movies")
    db.commit()
    db.close()
    return {"message": f"Deleted {cursor.rowcount} movies"}


@app.get("/search_semantic")
async def semantic_search(q: str):
    #Pobierz aktualną listę filmów z SQLite
    db = sqlite3.connect('movies.db')
    cursor = db.cursor()
    rows = cursor.execute('SELECT id, title, year, actors, director, description FROM movies').fetchall()
    db.close()

    if not rows:
        return []

    # Mapowanie- Dzielenie na elementy pomaga w wydajności szukania
    movies_list = []
    for r in rows:
        movies_list.append({
            "id": r[0], "title": r[1], "year": r[2],
            "actors": r[3], "director": r[4], "description": r[5]
        })

    # Przygotowanie tekstów do analizy (Tytuł + Opis)
    texts = [f"{m['title']} {m['description']}" for m in movies_list]

    # Generowanie wektorów (embeddings)
    movie_embeddings = model.encode(texts)
    query_embedding = model.encode([q])

    # Obliczanie podobieństwa cosinusowego
    similarities = cosine_similarity(query_embedding, movie_embeddings)[0]

    # Łączenie wyników i filtrowanie
    results = []
    for i, score in enumerate(similarities):
        if score > 0.32:  # Próg podobieństwa -- Jakby za słabo filtrował wyniki to zwiekszyć
            results.append({**movies_list[i], "score": float(score)})

    # Sortowanie od najlepszego dopasowania
    return sorted(results, key=lambda x: x['score'], reverse=True)

# if __name__ == '__main__':
#     app.run()
