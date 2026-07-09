import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useAuth } from '../AuthContext';

function NuovaVia() {
  const { utente } = useAuth();
  const [nome, setNome] = useState('');
  const [zona, setZona] = useState('');
  const [difficolta, setDifficolta] = useState('');
  const [relazione, setRelazione] = useState('');
  const [fotoFile, setFotoFile] = useState(null);
  const [gpxFile, setGpxFile] = useState(null);
  const [errore, setErrore] = useState('');
  const [caricamento, setCaricamento] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setErrore('');
    setCaricamento(true);

    let fotoUrl = null;
    let gpxUrl = null;

    // Se l'utente ha scelto una foto, caricala su Storage
    if (fotoFile) {
      const nomeFile = `${utente.id}/${Date.now()}-${fotoFile.name}`;
      const { error: erroreFoto } = await supabase.storage
        .from('foto-vie')
        .upload(nomeFile, fotoFile);

      if (erroreFoto) {
        setErrore('Errore caricamento foto: ' + erroreFoto.message);
        setCaricamento(false);
        return;
      }

      // Recupera il link pubblico del file appena caricato
      const { data: urlData } = supabase.storage
        .from('foto-vie')
        .getPublicUrl(nomeFile);
      fotoUrl = urlData.publicUrl;
    }

    // Stessa cosa per il GPX, se presente
    if (gpxFile) {
      const nomeFile = `${utente.id}/${Date.now()}-${gpxFile.name}`;
      const { error: erroreGpx } = await supabase.storage
        .from('gpx-vie')
        .upload(nomeFile, gpxFile);

      if (erroreGpx) {
        setErrore('Errore caricamento GPX: ' + erroreGpx.message);
        setCaricamento(false);
        return;
      }

      const { data: urlData } = supabase.storage
        .from('gpx-vie')
        .getPublicUrl(nomeFile);
      gpxUrl = urlData.publicUrl;
    }

    // Ora salviamo la via nel database, con i link ai file (se presenti)
    const { error } = await supabase.from('vie').insert({
      nome,
      zona,
      difficolta,
      relazione,
      autore_id: utente.id,
      foto_url: fotoUrl,
      gpx_url: gpxUrl,
    });

    if (error) {
      setErrore(error.message);
      setCaricamento(false);
      return;
    }

    setCaricamento(false);
    navigate('/');
  }

  if (!utente) {
    return (
      <div className="app dettaglio">
        <p>Devi accedere per aggiungere una via.</p>
        <Link to="/login">Vai al login</Link>
      </div>
    );
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

        <label>
          Foto (opzionale)
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFotoFile(e.target.files[0])}
          />
        </label>

        <label>
          Traccia GPX (opzionale)
          <input
            type="file"
            accept=".gpx"
            onChange={(e) => setGpxFile(e.target.files[0])}
          />
        </label>

        {errore && <p className="errore">{errore}</p>}

        <button type="submit" disabled={caricamento}>
          {caricamento ? 'Salvataggio in corso...' : 'Aggiungi via'}
        </button>
      </form>
    </div>
  );
}

export default NuovaVia;