export default function MovieListItem(props) {
    const googleSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(props.movie.title + " film")}`;

    return (
        <div style={{ marginBottom: '25px', paddingBottom: '10px', borderBottom: '1px solid #eee' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>

                {/* Tytuł */}
                <div style={{ marginBottom: '5px' }}>
                    <a
                        href={googleSearchUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                            fontSize: '2.0rem',     /* */
                            fontWeight: 'bold',
                            textDecoration: 'none',
                            color: 'inherit',
                            lineHeight: '1.2'
                        }}
                    >
                        {props.movie.title} <span style={{ fontSize: '1.4rem' }}>🔗</span>
                    </a>
                </div>

                {/* Informacje dodatkowe takie jek rok reżyser */}
                <div style={{ fontSize: '1.4rem', color: '#606c76' }}>
                    <strong>{props.movie.year}</strong> — directed by <strong>{props.movie.director}</strong> with <em>{props.movie.actors}</em>
                </div>
            {/* Opis filmu */}
            {props.movie.description && (
                <blockquote style={{ marginTop: '15px', fontSize: '1.3rem', fontStyle: 'italic' }}>
                    {props.movie.description}
                </blockquote>
            )}

            </div>
{/* Przyciski akcji */}
                <div style={{ marginTop: '15px', display: 'flex', gap: '8px' }}>
                    <button
                        onClick={props.onEdit}
                        className="button button-outline"
                        style={{ height: '2.2rem', lineHeight: '2.2rem', padding: '0 1rem', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.1rem', marginBottom: '0' }}
                    >
                        Edit
                    </button>
                    <button
                        onClick={props.onDelete}
                        className="button button-outline"
                        style={{ height: '2.2rem', lineHeight: '2.2rem', padding: '0 1rem', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.1rem', marginBottom: '0', color: '#d33', borderColor: '#d33'}}
                    >
                        Delete
                    </button>
                </div>
        </div>
    );
}