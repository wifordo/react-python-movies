import { useState, useEffect } from "react";

export default function MovieForm(props) {
    const [title, setTitle] = useState(props.initialData?.title || '');
    const [year, setYear] = useState(props.initialData?.year || '');
    const [actors, setActors] = useState(props.initialData?.actors || '');
    const [director, setDirector] = useState(props.initialData?.director || '');
    const [description, setDescription] = useState(props.initialData?.description || '');

    useEffect(() => {
        if (props.initialData) {
            setTitle(props.initialData.title);
            setYear(props.initialData.year);
            setActors(props.initialData.actors);
            setDirector(props.initialData.director);
            setDescription(props.initialData.description);
        }
    }, [props.initialData]);

    function handleSubmit(event) {
        event.preventDefault();
        if (title.length < 3) {
            return alert('Tytuł jest za krótki');
        }

        props.onMovieSubmit({ title, year, director, description, actors });

        if (!props.initialData) {
            setTitle('');
            setYear('');
            setActors('');
            setDirector('');
            setDescription('');
        }
    }

   return (
        <form onSubmit={handleSubmit}>
            <h2>{props.initialData ? "Edytuj film" : "Dodaj film"}</h2>
            <div>
                <label>Tytuł</label>
                <input type="text" value={title} onChange={(event) => setTitle(event.target.value)}/>
            </div>
            <div>
                <label>Rok</label>
                <input type="text" value={year} onChange={(event) => setYear(event.target.value)}/>
            </div>
            <div>
                 <label>Aktorzy (po przecinku)</label>
                 <input type="text" value={actors} onChange={(event) => setActors(event.target.value)}/>
            </div>
            <div>
                <label>Reżyser</label>
                <input type="text" value={director} onChange={(event) => setDirector(event.target.value)}/>
            </div>
             <div>
                <label>Opis</label>
                <textarea value={description} onChange={(event) => setDescription(event.target.value)}/>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button type="submit" style={{ flex: 1, marginBottom: 0 }}>
                    {props.buttonLabel || 'Zatwierdź'}
                </button>

                {/* Zmieniony warunek: teraz przycisk pojawi się zawsze, gdy onCancel jest dostępne */}
                {props.onCancel && (
                    <button
                        type="button"
                        className="button-outline"
                        onClick={props.onCancel}
                        style={{ flex: 1, marginBottom: 0, color: '#d33', borderColor: '#d33' }}
                    >
                        Anuluj
                    </button>
                )}
            </div>
        </form>
    );
}