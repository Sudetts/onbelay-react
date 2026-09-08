import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useAuth } from '../AuthContext';
import MenuMultiSelezione from '../components/MenuMultiSelezione';

function DettagliProfilo() {
  const { utente } = useAuth();
  const contenitoreRicercaRef = useRef(null);
  const ignoraRicercaRef = useRef(false);

  const [caricamento, setCaricamento] = useState(true);
  const [ricerca, setRicerca] = useState('');
  const [risultati, setRisultati] = useState([]);
  const [cercando, setCercando] = useState(false);
  const [posizioneSelezionata, setPosizioneSelezionata] = useState(null);
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
        .select('genere, anno_nascita, stile_preferito, residenza_nome, residenza_citta, residenza_provincia, residenza_regione')
        .eq('id', utente.id)
        .single();

      if (!error && data) {
        setGenere(data.genere || '');
        setAnnoNascita(data.anno_nascita ?? '');
        setStilePreferito(data.stile_preferito ? data.stile_preferito.split(', ').filter(Boolean) : []);

        if (data.residenza_nome) {
          ignoraRicercaRef.current = true;
          setRicerca(data.residenza_nome);
        }

        if (data.residenza_citta || data.residenza_provincia || data.residenza_regione) {
          setPosizioneSelezionata({
            nome: data.residenza_nome || '',
            citta: data.residenza_citta || '',
            provincia: data.residenza_provincia || '',
            regione: data.residenza_regione || '',
          });
        }
      }
      setCaricamento(false);
    }

    caricaProfilo();
  }, [utente]);

  useEffect(() => {
    function gestisciClickFuori(e) {
      if (contenitoreRicercaRef.current && !contenitoreRicercaRef.current.contains(e.target)) {
        setRisultati([]);
      }
    }
    document.addEventListener('mousedown', gestisciClickFuori);
    return () => document.removeEventListener('mousedown', gestisciClickFuori);
  }, []);

  useEffect(() => {
    if (ignoraRicercaRef.current) {
      ignoraRicercaRef.current = false;
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
          `https://photon.komoot.io/api/?q=${encodeURIComponent(ricerca)}&limit=8&lang=it`
        );
        const dati = await risposta.json();
        const soloItalia = (dati.features || [])
          .filter((f) => f.properties.countrycode === 'IT')
          .slice(0, 5);
        setRisultati(soloItalia);
      } catch (err) {
        console.error('Errore nella ricerca:', err);
      }
      setCercando(false);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [ricerca]);

  function etichettaRisultato(risultato) {
    const p = risultato.properties;
    return [p.name, p.county, p.state].filter(Boolean).join(', ');
  }

  function selezionaRisultato(risultato) {
    const p = risultato.properties;
    const nomeVisualizzato = etichettaRisultato(risultato);

    setPosizioneSelezionata({
      nome: nomeVisualizzato,
      citta: p.city || p.name || '',
      provincia: p.county || '',
      regione: p.state || '',
    });
    ignoraRicercaRef.current = true;
    setRicerca(nomeVisualizzato);
    setRisultati([]);
  }

  function gestisciClickInput() {
    if (risultati.length > 0) {
      setRisultati([]);
    }
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
      aggiornamento.residenza_nome = posizioneSelezionata.nome;
      aggiornamento.residenza_citta = posizioneSelezionata.citta || null;
      aggiornamento.residenza_provincia = posizioneSelezionata.provincia || null;
      aggiornamento.residenza_regione = posizioneSelezionata.regione || null;
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
        <div className="ricerca-citta" ref={contenitoreRicercaRef}>
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
              onClick={gestisciClickInput}
              className="input-residenza"
            />
          </label>

          {cercando && <p className="link-piccolo">Ricerca in corso...</p>}

          {risultati.length > 0 && (
            <ul className="risultati-ricerca">
              {risultati.map((risultato, indice) => (
                <li key={risultato.properties.osm_id || indice} onClick={() => selezionaRisultato(risultato)}>
                  {etichettaRisultato(risultato)}
                </li>
              ))}
            </ul>
          )}
        </div>

        {posizioneSelezionata && (posizioneSelezionata.provincia || posizioneSelezionata.regione) && (
          <p className="link-piccolo">
            {posizioneSelezionata.citta && <>Città: {posizioneSelezionata.citta} · </>}
            {posizioneSelezionata.provincia && <>Provincia: {posizioneSelezionata.provincia} · </>}
            {posizioneSelezionata.regione && <>Regione: {posizioneSelezionata.regione}</>}
          </p>
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