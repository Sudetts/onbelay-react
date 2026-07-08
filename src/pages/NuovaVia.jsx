import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';

function NuovaVia() {
  const [nome, setNome] = useState('');
  const [zona, setZona] = useState('');
  const [difficolta, setDifficolta] = useState('');
  const [relazione, setRelazione] = useState('');
  const [errore, setErrore] = useState('');
  const [caricamento, setCaricamento] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setErrore('');
    setCaricamento(true);

    const { error } = await supabase.from('vie').insert({
      nome,
      zona,
      difficolta,
      relazione,
    });

    if (error) {
      setErrore(error.message);
      setCaricamento(false);
      return;
    }

    setCaricamento(false);
    navigate('/'); // torna alla homepage, dove dovremmo vedere la nuova via
  }

  return (
    <div className="app dettaglio">
      <Link to="/">← Torna alla lista</Link>
      <h1>Aggiungi una via</h1>

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
          placeholder="Difficoltà (es. 6a)"
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

        <button type="submit" disabled={caricamento}>
          {caricamento ? 'Salvataggio in corso...' : 'Aggiungi via'}
        </button>
      </form>
    </div>
  );
}

export default NuovaVia;