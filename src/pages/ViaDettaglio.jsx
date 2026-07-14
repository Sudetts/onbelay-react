import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useAuth } from '../AuthContext';
import MappaGpx from '../components/MappaGpx';

function ViaDettaglio() {
  const { id } = useParams();
  const { utente } = useAuth();
  const navigate = useNavigate();
  const [via, setVia] = useState(null);
  const [caricamento, setCaricamento] = useState(true);
  const [dataSalita, setDataSalita] = useState('');
  const [salvataggioDiario, setSalvataggioDiario] = useState(false);
  const [erroreDiario, setErroreDiario] = useState('');
  const [salitaRegistrata, setSalitaRegistrata] = useState(false);

  useEffect(() => {
    async function caricaVia() {
      const { data, error } = await supabase
        .from('vie')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Errore nel caricamento:', error);
      } else {
        setVia(data);
      }
      setCaricamento(false);
    }

    caricaVia();
  }, [id]);

  async function handleElimina() {
    const conferma = window.confirm('Sei sicuro di voler eliminare questa via?');
    if (!conferma) return;

    const { error } = await supabase.from('vie').delete().eq('id', id);

    if (error) {
      alert('Errore durante l\'eliminazione: ' + error.message);
      return;
    }

    navigate('/');
  }

async function handleSegnaFatta(e) {
    e.preventDefault();
    setErroreDiario('');
    setSalvataggioDiario(true);

    const { error } = await supabase.from('diario').insert({
      utente_id: utente.id,
      via_id: id,
      data_salita: dataSalita,
    });

    if (error) {
      setErroreDiario(error.message);
      setSalvataggioDiario(false);
      return;
    }

    setSalvataggioDiario(false);
    setSalitaRegistrata(true);
  }

  if (caricamento) {
    return <p>Caricamento in corso...</p>;
  }

  if (!via) {
    return (
      <div className="app dettaglio">
        <p>Via non trovata.</p>
        <Link to="/">Torna alla lista</Link>
      </div>
    );
  }

  const eAutore = utente && utente.id === via.autore_id;

  return (
    <div className="app dettaglio">
      <Link to="/">← Torna alla lista</Link>
      <h1>{via.nome}</h1>
      <p>Zona: {via.zona}</p>
      <p>Difficoltà: {via.difficolta}</p>
      {via.ultimo_aggiornamento && (
        <p className="link-piccolo">Aggiornato in data {new Date(via.ultimo_aggiornamento).toLocaleDateString('it-IT')}</p>
      )}

      {via.avvicinamento_descrizione && (
        <>
          <h2>Avvicinamento</h2>
          <p>{via.avvicinamento_descrizione}</p>
          {via.avvicinamento_foto_url && (
            <img src={via.avvicinamento_foto_url} alt="Avvicinamento" className="foto-via" />
          )}
          {via.avvicinamento_gpx_url && (
            <>
              <MappaGpx gpxUrl={via.avvicinamento_gpx_url} />
              <p><a href={via.avvicinamento_gpx_url} download>Scarica traccia GPX avvicinamento</a></p>
            </>
          )}
        </>
      )}

      {via.descrizione_via && (
        <>
          <h2>Via</h2>
          <p>{via.descrizione_via}</p>
          {via.diagramma_url && (
            <img src={via.diagramma_url} alt="Topo della via" className="foto-via" />
          )}
        </>
      )}

      {via.allontanamento_descrizione && (
        <>
          <h2>Allontanamento</h2>
          <p>{via.allontanamento_descrizione}</p>
          {via.allontanamento_foto_url && (
            <img src={via.allontanamento_foto_url} alt="Allontanamento" className="foto-via" />
          )}
          {via.allontanamento_gpx_url && (
            <>
              <MappaGpx gpxUrl={via.allontanamento_gpx_url} />
              <p><a href={via.allontanamento_gpx_url} download>Scarica traccia GPX allontanamento</a></p>
            </>
          )}
        </>
      )}

{utente && (
        <div className="box-diario">
          <h2>Hai fatto questa via?</h2>
          {salitaRegistrata ? (
            <p className="messaggio-successo">Salita registrata nel tuo diario!</p>
          ) : (
            <form onSubmit={handleSegnaFatta} className="form form-inline">
              <input
                type="date"
                value={dataSalita}
                onChange={(e) => setDataSalita(e.target.value)}
                required
              />
              {erroreDiario && <p className="errore">{erroreDiario}</p>}
              <button type="submit" disabled={salvataggioDiario}>
                {salvataggioDiario ? 'Salvataggio...' : 'Segna come fatta'}
              </button>
            </form>
          )}
        </div>
      )}

      {utente && (
        <div className="azioni-autore">
          <Link to={`/via/${via.id}/proponi-modifica`}>Proponi una modifica</Link>
          {eAutore && (
            <button onClick={handleElimina} className="link-button">Elimina</button>
          )}
        </div>
      )}
    </div>
  );
}

export default ViaDettaglio;