import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import MenuMultiSelezione from './MenuMultiSelezione';

function SelettoreResidenza({ utenteId, datiIniziali, onSalvato, onAnnulla }) {
  const [ricerca, setRicerca] = useState(datiIniziali?.residenzaNome || '');
  const [risultati, setRisultati] = useState([]);
  const [cercando, setCercando] = useState(false);
  const [posizioneSelezionata, setPosizioneSelezionata] = useState(null);
  const [ignoraRicerca, setIgnoraRicerca] = useState(false);
  const [salvataggio, setSalvataggio] = useState(false);
  const [errore, setErrore] = useState('');

  const [genere, setGenere] = useState(datiIniziali?.genere || '');
  const [annoNascita, setAnnoNascita] = useState(datiIniziali?.annoNascita ?? '');
  const [stilePreferito, setStilePreferito] = useState(datiIniziali?.stilePreferito || []);

  useEffect(() => {
    if (ignoraRicerca) {
      setIgnoraRicerca(false);
      return;
    }
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
  }, [ricerca, ignoraRicerca]);

  function selezionaRisultato(risultato) {
    const lat = parseFloat(risultato.lat);
    const lng = parseFloat(risultato.lon);
    const nome = risultato.display_name;
    setPosizioneSelezionata({ lat, lng, nome });
    setIgnoraRicerca(true);
    setRicerca(nome);
    setRisultati([]);
  }

  async function salvaTutto(e) {
    e.preventDefault();
    setErrore('');
    setSalvataggio(true);

    const aggiornamento = {
      genere: genere || null,
      anno_nascita: annoNascita || null,
      stile_preferito: stilePreferito.join(', '),
    };

    if (posizioneSelezionata) {
      aggiornamento.residenza_lat = posizioneSelezionata.lat;
      aggiornamento.residenza_lng = posizioneSelezionata.lng;
      aggiornamento.residenza_nome = posizioneSelezionata.nome;
    }

    const { error } = await supabase
      .from('profili')
      .update(aggiornamento)
      .eq('id', utenteId);

    if (error) {
      setErrore(error.message);
      setSalvataggio(false);
      return;
    }

    onSalvato({
      genere: aggiornamento.genere,
      annoNascita: aggiornamento.anno_nascita,
      stilePreferito,
      residenza: posizioneSelezionata,
    });
  }

  return (
    <div className="overlay-popup" onClick={onAnnulla}>
      <div className="finestra-popup finestra-popup-larga" onClick={(e) => e.stopPropagation()}>
        <h3>Facci sapere chi sei</h3>
        <p className="link-piccolo">
          Nessuno di questi dati è obbligatorio. Ci aiutano a capire meglio la community e, per la
          località, a mostrarti la mappa già centrata vicino a casa tua.
        </p>

        <form onSubmit={salvaTutto} className="form">
          <label>
            La tua città
            <input
              type="text"
              placeholder="Es. Trento, Bergamo, Torino..."
              value={ricerca}
              onChange={(e) => {
                setRicerca(e.target.value);
                setPosizioneSelezionata(null);
              }}
              className="input-residenza"
            />
          </label>

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

          <label>
            Genere
            <select value={genere} onChange={(e) => setGenere(e.target.value)}>
              <option value="">Preferisco non specificarlo</option>
              <option value="femmina">Femmina</option>
              <option value="maschio">Maschio</option>
              <option value="altro">Altro</option>
            </select>
          </label>

          <label>
            Anno di nascita
            <input
              type="number"
              placeholder="Es. 1990"
              value={annoNascita}
              onChange={(e) => setAnnoNascita(e.target.value)}
              min={1900}
              max={new Date().getFullYear()}
            />
          </label>

          <label>
            Cosa preferisci scalare
            <MenuMultiSelezione
              etichetta="Stile preferito"
              opzioni={['Falesia', 'Vie lunghe', 'Boulder', 'Alpinismo']}
              selezionati={stilePreferito}
              onCambia={setStilePreferito}
            />
          </label>

          {errore && <p className="errore">{errore}</p>}

          <div className="azioni-popup">
            <button type="button" onClick={onAnnulla} className="btn-popup-annulla" disabled={salvataggio}>
              Annulla
            </button>
            <button type="submit" className="btn-popup-conferma" disabled={salvataggio}>
              {salvataggio ? 'Salvataggio...' : 'Salva'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SelettoreResidenza;