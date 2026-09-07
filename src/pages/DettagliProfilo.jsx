import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useAuth } from '../AuthContext';
import MenuMultiSelezione from '../components/MenuMultiSelezione';

function DettagliProfilo() {
  const { utente } = useAuth();

  const [caricamento, setCaricamento] = useState(true);
  const [ricerca, setRicerca] = useState('');
  const [risultati, setRisultati] = useState([]);
  const [cercando, setCercando] = useState(false);
  const [posizioneSelezionata, setPosizioneSelezionata] = useState(null);
  const [ignoraRicerca, setIgnoraRicerca] = useState(false);
  const [salvataggio, setSalvataggio] = useState(false);
  const [errore, setErrore] = useState('');
  const [messaggio, setMessaggio] = useState('');

  const [genere, setGenere] = useState('');
  const [annoNascita, setAnnoNascita] = useState('');
  const [stilePreferito, setStilePreferito] = useState([]);

  useEffect(() => {
    if (!utente) return;

    async function caricaProfilo() {
      const { data, error } = await supabase
        .from('profili')
        .select('genere, anno_nascita, stile_preferito, residenza_nome')
        .eq('id', utente.id)
        .single();

      if (!error && data) {
        setGenere(data.genere || '');
        setAnnoNascita(data.anno_nascita ?? '');
        setStilePreferito(data.stile_preferito ? data.stile_preferito.split(', ').filter(Boolean) : []);
        setRicerca(data.residenza_nome || '');
      }
      setCaricamento(false);
    }

    caricaProfilo();
  }, [utente]);

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
    setMessaggio('');
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
      .eq('id', utente.id);

    if (error) {
      setErrore(error.message);
      setSalvataggio(false);
      return;
    }

    setMessaggio('Dati salvati, grazie!');
    setSalvataggio(false);
  }

  if (!utente) {
    return (
      <div className="app dettaglio pannello-scuro">
        <p>Devi accedere per completare il tuo profilo.</p>
        <Link to="/login">Vai al login</Link>
      </div>
    );
  }

  if (caricamento) {
    return <p className="messaggio-caricamento">Caricamento in corso...</p>;
  }

  return (
    <div className="app dettaglio pannello-scuro">
      <Link to="/profilo" className="link-home">
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="4" />
    <path d="M4 20c0-4.4 3.6-8 8-8s8 3.6 8 8" />
  </svg>
  PROFILO
</Link>
      <h1>Completa il tuo profilo</h1>
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
            obbligatorio={false}
          />
        </label>

        {errore && <p className="errore">{errore}</p>}
        {messaggio && <p className="messaggio-successo">{messaggio}</p>}

        <button type="submit" disabled={salvataggio}>
          {salvataggio ? 'Salvataggio...' : 'Salva'}
        </button>
      </form>
    </div>
  );
}

export default DettagliProfilo;