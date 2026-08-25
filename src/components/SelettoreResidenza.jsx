import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

function SelettoreResidenza({ utenteId, onSalvato, onAnnulla }) {
  const [ricerca, setRicerca] = useState('');
  const [risultati, setRisultati] = useState([]);
  const [cercando, setCercando] = useState(false);
  const [salvataggio, setSalvataggio] = useState(false);
  const [errore, setErrore] = useState('');

  useEffect(() => {
    if (ricerca.trim().length < 3) {
      setRisultati([]);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setCercando(true);
      try {
        const risposta = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(ricerca)}&limit=5`
        );
        const dati = await risposta.json();
        setRisultati(dati);
      } catch (err) {
        console.error('Errore nella ricerca:', err);
      }
      setCercando(false);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [ricerca]);

  async function selezionaRisultato(risultato) {
    setErrore('');
    setSalvataggio(true);

    const lat = parseFloat(risultato.lat);
    const lng = parseFloat(risultato.lon);
    const nome = risultato.display_name;

    const { error } = await supabase
      .from('profili')
      .update({ residenza_lat: lat, residenza_lng: lng, residenza_nome: nome })
      .eq('id', utenteId);

    if (error) {
      setErrore(error.message);
      setSalvataggio(false);
      return;
    }

    onSalvato({ lat, lng, nome });
  }

  return (
    <div className="overlay-popup" onClick={onAnnulla}>
      <div className="finestra-popup" onClick={(e) => e.stopPropagation()}>
        <h3>Facci sapere chi sei</h3>
        <p>
          Cerca la tua città: la useremo solo per mostrarti la mappa iniziale già centrata vicino a te.
        </p>

        <input
          type="text"
          placeholder="Es. Trento, Bergamo, Torino..."
          value={ricerca}
          onChange={(e) => setRicerca(e.target.value)}
          className="input-residenza"
          autoFocus
        />

        {cercando && <p className="link-piccolo">Ricerca in corso...</p>}

        {risultati.length > 0 && (
          <ul className="risultati-ricerca">
            {risultati.map((risultato) => (
              <li key={risultato.place_id} onClick={() => selezionaRisultato(risultato)}>
                {risultato.display_name}
              </li>
            ))}
          </ul>
        )}

        {errore && <p className="errore">{errore}</p>}

        <div className="azioni-popup">
          <button type="button" onClick={onAnnulla} className="btn-popup-annulla" disabled={salvataggio}>
            Annulla
          </button>
        </div>
      </div>
    </div>
  );
}

export default SelettoreResidenza;