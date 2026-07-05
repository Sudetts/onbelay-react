import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';

function ViaDettaglio() {
  const { id } = useParams();
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

  return (
    <div className="app dettaglio">
      <Link to="/">← Torna alla lista</Link>
      <h1>{via.nome}</h1>
      <p>Zona: {via.zona}</p>
      <p>Difficoltà: {via.difficolta}</p>
      <h2>Relazione</h2>
      <p>{via.relazione}</p>
    </div>
  );
}

export default ViaDettaglio;