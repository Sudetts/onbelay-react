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

      {via.foto_url && (
        <img src={via.foto_url} alt={via.nome} className="foto-via" />
      )}

      <h2>Relazione</h2>
      <p>{via.relazione}</p>

      {via.gpx_url && (
        <div>
          <h2>Avvicinamento</h2>
          <MappaGpx gpxUrl={via.gpx_url} />
          <p>
            <a href={via.gpx_url} download>Scarica traccia GPX</a>
          </p>
        </div>
      )}

      {eAutore && (
        <div className="azioni-autore">
          <Link to={`/via/${via.id}/modifica`}>Modifica</Link>
          <button onClick={handleElimina} className="link-button">Elimina</button>
        </div>
      )}
    </div>
  );
}

export default ViaDettaglio;