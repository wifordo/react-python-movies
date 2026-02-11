import MovieListItem from "./MovieListItem";

export default function MoviesList(props) {
    // Zabezpieczenie przed błędem undefined
    if (!props.movies) return <div className="loader"></div>;

    return (
        <div>
            <h2>Filmy</h2>
            <ul className="movies-list">
                {props.movies.map((movie, index) => (
                    <li
                        key={movie.id}
                        className="movies-list-item"
                        style={{ animationDelay: `${index * 0.05}s` }} // Efekt fali
                    >
                        <MovieListItem
                            movie={movie}
                            onDelete={() => props.onDeleteMovie(movie)}
                            onEdit={() => props.onEditMovie(movie)}
                        />
                    </li>
                ))}
            </ul>
        </div>
    );
}