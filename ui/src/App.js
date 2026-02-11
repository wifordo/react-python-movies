import './App.css';
import { useEffect, useState } from "react";
import "milligram";
import MovieForm from "./MovieForm";
import MoviesList from "./MoviesList";
import Sidebar from "./Sidebar";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
    const [movies, setMovies] = useState([]);
    const [addingMovie, setAddingMovie] = useState(false);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [editingMovie, setEditingMovie] = useState(null);
    const [selectedActor, setSelectedActor] = useState(null);
    const [darkMode, setDarkMode] = useState(false);
    const [sortBy, setSortBy] = useState("year-desc");
    const [isAISearch, setIsAISearch] = useState(false);

    useEffect(() => {
    if (darkMode) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }

        // Logika ładowania danych
        setLoading(true);
        fetch('/movies')
            .then(response => {
                if (!response.ok) throw new Error();
                return response.json();
            })
            .then(data => setMovies(data))
            .catch(() => toast.error("Nie udało się pobrać filmów."))
            .finally(() => setLoading(false));

    }, [darkMode]);

    // Logika filtrowania filmów na bieżąco
const filteredMovies = movies.filter(movie => {
    const matchesSearch = movie.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesActor = selectedActor
        ? movie.actors?.split(',').map(a => a.trim()).includes(selectedActor)
        : true;
    return matchesSearch && matchesActor;
});

// Sortowanie filmów od najnowszych
const sortedMovies = [...filteredMovies].sort((a, b) => {
    if (sortBy === "year-desc") {
        return parseInt(b.year) - parseInt(a.year);
    } else if (sortBy === "year-asc") {
        return parseInt(a.year) - parseInt(b.year);
    } else if (sortBy === "title-asc") {
        return a.title.localeCompare(b.title);
    }
    return 0;
});

    async function handleAddMovie(movie) {
        try {
            const response = await fetch('/movies', {
                method: 'POST',
                body: JSON.stringify(movie),
                headers: { 'Content-Type': 'application/json' }
            });
            if (response.ok) {
                const movieFromServer = await response.json();
                setMovies([...movies, movieFromServer]);
                setAddingMovie(false);
                toast.success("Dodano film!");
            } else {
                toast.error("Błąd podczas dodawania.");
            }
        } catch (e) {
            toast.error("Błąd połączenia.");
        }
    }

    async function handleDeleteMovie(movie) {
        if (window.confirm(`Czy na pewno chcesz usunąć film "${movie.title}"?`)) {
            const response = await fetch(`/movies/${movie.id}`, {
                method: 'DELETE',
            });
            if (response.ok) {
                setMovies(movies.filter(m => m.id !== movie.id));
                toast.success("Film usunięty.");
            } else {
                toast.error("Błąd podczas usuwania.");
            }
        }
    }

async function handleUpdateMovie(updatedData) {
    try {
        const response = await fetch(`/movies/${editingMovie.id}`, {
            method: 'PUT',
            body: JSON.stringify(updatedData),
            headers: { 'Content-Type': 'application/json' }
        });

        const savedMovie = await response.json();

        if (response.ok) {
            setMovies(movies.map(m => m.id === editingMovie.id ? savedMovie : m));
            setEditingMovie(null);
            toast.success("Zmiany zapisane!");
        }
    } catch (e) {
        console.error("Błąd:", e);
        toast.error("Błąd podczas aktualizacji.");
    }
}

async function handleSemanticSearch() {
    if (!searchTerm) {
        // Jeśli pole jest puste, wróć do normalnej listy
        const response = await fetch('/movies');
        const data = await response.json();
        setMovies(data);
        return;
    }

    setLoading(true);
    try {
        const response = await fetch(`/search_semantic?q=${encodeURIComponent(searchTerm)}`);
        const data = await response.json();
        setMovies(data); // Wyświetlamy tylko wyniki od AI
        toast.info(`AI Search: Znaleziono ${data.length} pasujących filmów`);
    } catch (e) {
        toast.error("Błąd wyszukiwania inteligentnego.");
    } finally {
        setLoading(false);
    }
}

// Funkcja do wyszukiwania AI
async function handleAISearch() {
    if (!searchTerm) {
        setIsAISearch(false);
        return;
    }
    setLoading(true);
    try {
        const response = await fetch(`/search_semantic?q=${encodeURIComponent(searchTerm)}`);
        const data = await response.json();
        setMovies(data);
        setIsAISearch(true);
    } catch (e) {
        toast.error("Błąd wyszukiwania AI");
    } finally {
        setLoading(false);
    }
}

function handleStrictSearch() {
    setIsAISearch(false);
}

// Przygotowanie danych do listy aktorów
const actorCounts = movies.reduce((acc, movie) => {
    if (movie.actors) {
        const movieActors = movie.actors.split(',').map(a => a.trim()).filter(a => a !== "");
        movieActors.forEach(actor => {
            acc[actor] = (acc[actor] || 0) + 1;
        });
    }
    return acc;
}, {});

const sortedActors = Object.keys(actorCounts)
    .map(name => ({
        name: name,
        count: actorCounts[name]
    }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));

  const handleClearSearch = () => {
    setSearchTerm("");
    setIsAISearch(false);
    // Pobieramy pełną listę filmów ponownie gdy use wyczyści pole wyszukiwania
    fetch('/movies')
        .then(res => res.json())
        .then(data => setMovies(data))
        .catch(() => toast.error("Nie udało się odświeżyć listy."));
};

return (
    <div className="container">
        <ToastContainer position="top-right" autoClose={3000} />

        {/* MODAL (Dodawanie lub Edycja) */}
        {(addingMovie || editingMovie) && (
            <div
                onClick={() => { setAddingMovie(false); setEditingMovie(null); }} // ZAMYKA PO KLIKNIĘCIU W TŁO
                style={{
                    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                    backgroundColor: 'rgba(0, 0, 0, 0.8)', display: 'flex',
                    justifyContent: 'center', alignItems: 'center', zIndex: 9999,
                    backdropFilter: 'blur(4px)', padding: '20px'
                }}
            >
                <div
                    onClick={(e) => e.stopPropagation()} // TO BLOKUJE ZAMYKANIE, GDY KLIKASZ WEWNĄTRZ FORMULARZA
                    style={{
                        backgroundColor: darkMode ? '#2d2d2d' : '#fff', padding: '30px',
                        borderRadius: '12px', maxWidth: '600px', width: '100%',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.5)', maxHeight: '90vh', overflowY: 'auto'
                    }}
                >
                    <MovieForm
                        onMovieSubmit={addingMovie ? handleAddMovie : handleUpdateMovie}
                        onCancel={() => { setAddingMovie(false); setEditingMovie(null); }}
                        buttonLabel={addingMovie ? "Dodaj film" : "Zapisz zmiany"}
                        initialData={editingMovie}
                    />
                </div>
            </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h1>Moje ulubione filmy</h1>
            <button className="button-outline" onClick={() => setDarkMode(!darkMode)}>
                {darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
            </button>
        </div>

        <div className="main-wrapper">
            <div className="movies-content">

                {/* Panel wyszukiwania z przyciskiem czyszczenia */}
                <div style={{ marginBottom: '20px' }}>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                        <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
                            <input
                                type="text"
                                placeholder="Wpisz frazę..."
                                value={searchTerm}
                                style={{ width: '100%', paddingRight: '40px', marginBottom: 0 }}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setIsAISearch(false);
                                    if (e.target.value === "") handleClearSearch();
                                }}
                                onKeyDown={(e) => e.key === 'Enter' && handleStrictSearch()}
                            />
                            {searchTerm && (
                                <button
                                    onClick={handleClearSearch}
                                    style={{
                                        position: 'absolute',
                                        right: '10px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        background: 'none',
                                        border: 'none',
                                        color: darkMode ? '#ccc' : '#666',
                                        fontSize: '1.8rem',
                                        cursor: 'pointer',
                                        padding: '0 5px',
                                        lineHeight: 1
                                    }}
                                >
                                    ✕
                                </button>
                            )}
                        </div>
                        <button onClick={handleStrictSearch} className="button-outline" style={{ marginBottom: 0 }}>
                            Szukaj ścisłe
                        </button>
                        <button onClick={handleAISearch} style={{ marginBottom: 0 }}>
                            Szukaj AI 🤖
                        </button>
                        <button
                            onClick={() => setAddingMovie(true)}
                            style={{ marginBottom: 0, backgroundColor: '#28a745', borderColor: '#28a745' }}
                        >
                            Dodaj film
                        </button>
                    </div>
                </div>

                {loading && <div className="loader"></div>}

                {!loading && (
                    <>
                        {/* Wybór sortowania */}
                        {(isAISearch ? movies : sortedMovies).length > 0 && (
                            <div style={{ marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <label style={{ margin: 0 }}>Sortuj według:</label>
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    style={{ width: 'auto', marginBottom: 0 }}
                                >
                                    <option value="year-desc">Roku (od najnowszych)</option>
                                    <option value="year-asc">Roku (od najstarszych)</option>
                                    <option value="title-asc">Tytułu (A-Z)</option>
                                </select>
                            </div>
                        )}

                        {/* Logika listy */}
                        {(isAISearch ? movies : sortedMovies).length === 0 ? (
                            <p>Nie znaleziono filmów dla: "{searchTerm}"</p>
                        ) : (
                            <MoviesList
                                movies={isAISearch ? movies : sortedMovies}
                                onDeleteMovie={handleDeleteMovie}
                                onEditMovie={setEditingMovie}
                            />
                        )}
                    </>
                )}
            </div>

            <Sidebar
                actors={sortedActors}
                totalMovies={movies.length}
                selectedActor={selectedActor}
                onActorClick={setSelectedActor}
            />
        </div>
    </div>
);
}

export default App;