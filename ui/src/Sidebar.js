import React from 'react';

// Dodajemy: totalMovies, selectedActor, onActorClick
export default function Sidebar({ actors, totalMovies, selectedActor, onActorClick }) {
    return (
        <aside className="sidebar" style={{
            position: 'sticky',
            top: '20px',
            alignSelf: 'flex-start',
            minWidth: '220px'
        }}>
         <div className="ad-banner" style={{ border: '1px solid #eee', padding: '15px', background: '#fafafa', borderRadius: '8px', textAlign: 'center' }}>
                <span style={{ fontSize: '0.6em', color: '#aaa', textTransform: 'uppercase' }}>reklama</span>
                <img src="https://fracz.github.io/supla-noc-informatyka-1.1/resources/images/001_supla-server.svg" alt="Supla Logo" style={{ width: '60px', margin: '10px auto', display: 'block' }} />
                <h6 style={{ fontSize: '1.2rem', marginBottom: '10px' }}>Supla.org</h6>
                <a href="https://www.supla.org" target="_blank" rel="noreferrer" className="button button-outline" style={{ width: '100%', height: '30px', lineHeight: '30px', fontSize: '0.8rem' }}>Sprawdź</a>
            </div>
            {/*Statystyki */}
            <div style={{ marginBottom: '20px', padding: '10px', background: '#9b4dca', color: 'white', borderRadius: '8px', textAlign: 'center' }}>
                <small>W bazie jest:</small>
                <h2 style={{ margin: 0, color: 'white' }}>{totalMovies} filmów</h2>
            </div>

            <div className="actors-section" style={{ marginBottom: '30px' }}>
                <h4 style={{ borderBottom: '2px solid #9b4dca', paddingBottom: '5px' }}>
                    Aktorzy w systemie
                </h4>

                {/* Przycisk czyszczenia filtru */}
                {selectedActor && (
                    <button
                        className="button button-clear"
                        onClick={() => onActorClick(null)}
                        style={{ fontSize: '0.6em', height: '20px', lineHeight: '20px', marginBottom: '10px', padding: 0 }}
                    >
                        ❌ Wyczyść filtr ({selectedActor})
                    </button>
                )}

                {actors && actors.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {actors.map(actor => (
                            <div
                                key={actor.name}
                                // Reakcja na kliknęcie
                                onClick={() => onActorClick(actor.name)}
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    // Zmiana koloru jeśli wybrany
                                    background: selectedActor === actor.name ? '#e1d5e7' : '#f4f4f4',
                                    padding: '4px 10px',
                                    borderRadius: '5px',
                                    border: selectedActor === actor.name ? '2px solid #9b4dca' : '1px solid #ddd',
                                    fontSize: '0.85em',
                                    cursor: 'pointer' // Kursor rączki
                                }}>
                                <span style={{ fontWeight: selectedActor === actor.name ? 'bold' : '500' }}>
                                    👤 {actor.name}
                                </span>
                                <span style={{
                                    background: '#9b4dca',
                                    color: 'white',
                                    borderRadius: '10px',
                                    padding: '0 6px',
                                    fontSize: '0.8em',
                                    fontWeight: 'bold'
                                }}>
                                    {actor.count}
                                </span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p style={{ fontSize: '0.8em' }}>Brak aktorów.</p>
                )}
            </div>
        </aside>
    );
}