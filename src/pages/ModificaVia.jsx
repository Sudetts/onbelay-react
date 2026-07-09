import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useAuth } from '../AuthContext';

function ModificaVia() {
  const { id } = useParams();
  const { utente } = useAuth();
  const navigate = useNavigate();

  const [nome, setNome] = useState('');
  const [zona, setZona] = useState('');
  const [difficolta, setDifficolta] = useState('');
  const [relazione, setRelazione] = useState('');
  const [autoreId, setAutoreId] = useState(null);
  const [caricamento, setCaricamento] = useState(true);
  const [salvataggio, setSalvataggio] = useState(false);
  const [errore, setErrore] = useState('');

  useEffect(() => {
    async function caricaVia() {
      const { data, error } = await supabase
        .from('vie')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        setErrore(error.message);
      } else {
        setNome(data.nome);
        setZona(data.zona);
        setDifficolta(data.difficolta);
        setRelazione(data.relazione);
        setAutoreId(data.autore_id);
      }
      setCaricamento(false);
    }

    caricaVia();
  }, [id]);

  async function handleSubmit(e) {
    e.preventDefault();
    setSalvataggio(true);
    setErrore('');

    const { error } = await supabase
      .from('vie')
      .update({ nome, zona, difficolta, relazione })
      .eq('id', id);

    if (error) {
      setErrore(error.message);
      setSalvataggio(false);
      return;
    }

    navigate(`/via/${id}`);
  }

  if (caricamento) {
    return <p>Caricamento in corso...</p>;
  }

  // Protezione: solo l'autore può accedere a questa pagina
  if (!utente || utente.id !== autoreId) {
    return (
      <div className="app dettaglio">
        <p>Non hai i permessi per modificare questa via.</p>
        <Link to="/">Torna alla lista</Link>
      </div>
    );
  }

  return (
    <div className="app dettaglio">
      <Link to={`/via/${id}`}>← Annulla</Link>
      <h1>Modifica via</h1>

      <form onSubmit={handleSubmit} className="form">
        <input
          type="text"
          placeholder="Nome via"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Zona"
          value={zona}
          onChange={(e) => setZona(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Difficoltà"
          value={difficolta}
          onChange={(e) => setDifficolta(e.target.value)}
          required
        />
        <textarea
          placeholder="Relazione"
          value={relazione}
          onChange={(e) => setRelazione(e.target.value)}
          rows={5}
          required
        />

        {errore && <p className="errore">{errore}</p>}

        <button type="submit" disabled={salvataggio}>
          {salvataggio ? 'Salvataggio in corso...' : 'Salva modifiche'}
        </button>
      </form>
    </div>
  );
}

export default ModificaVia;