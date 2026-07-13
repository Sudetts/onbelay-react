import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useAuth } from '../AuthContext';

function NuovaVia() {
  const { utente } = useAuth();
  const [nome, setNome] = useState('');
  const [zona, setZona] = useState('');
  const [difficolta, setDifficolta] = useState('');

  const [avvicinamentoDescrizione, setAvvicinamentoDescrizione] = useState('');
  const [avvicinamentoFoto, setAvvicinamentoFoto] = useState(null);
  const [avvicinamentoGpx, setAvvicinamentoGpx] = useState(null);

  const [descrizioneVia, setDescrizioneVia] = useState('');
  const [diagrammaFile, setDiagrammaFile] = useState(null);

  const [allontanamentoDescrizione, setAllontanamentoDescrizione] = useState('');
  const [allontanamentoFoto, setAllontanamentoFoto] = useState(null);
  const [allontanamentoGpx, setAllontanamentoGpx] = useState(null);

  const [errore, setErrore] = useState('');
  const [caricamento, setCaricamento] = useState(false);
  const navigate = useNavigate();

  async function caricaFile(file, bucket) {
    if (!file) return null;
    const nomeFile = `${utente.id}/${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from(bucket).upload(nomeFile, file);
    if (error) throw new Error(error.message);
    const { data } = supabase.storage.from(bucket).getPublicUrl(nomeFile);
    return data.publicUrl;
  }

async function handleSubmit(e) {
    e.preventDefault();
    setErrore('');

    if (!avvicinamentoFoto && !avvicinamentoGpx) {
      setErrore('Per l\'avvicinamento serve almeno una foto o una traccia GPX.');
      return;
    }

    if (!allontanamentoFoto && !allontanamentoGpx) {
      setErrore('Per l\'allontanamento serve almeno una foto o una traccia GPX.');
      return;
    }

    setCaricamento(true);

    try {
      const avvicinamentoFotoUrl = await caricaFile(avvicinamentoFoto, 'foto-vie');
      const avvicinamentoGpxUrl = await caricaFile(avvicinamentoGpx, 'gpx-vie');
      const diagrammaUrl = await caricaFile(diagrammaFile, 'foto-vie');
      const allontanamentoFotoUrl = await caricaFile(allontanamentoFoto, 'foto-vie');
      const allontanamentoGpxUrl = await caricaFile(allontanamentoGpx, 'gpx-vie');

      const { error } = await supabase.from('vie').insert({
        nome,
        zona,
        difficolta,
        autore_id: utente.id,
        avvicinamento_descrizione: avvicinamentoDescrizione,
        avvicinamento_foto_url: avvicinamentoFotoUrl,
        avvicinamento_gpx_url: avvicinamentoGpxUrl,
        descrizione_via: descrizioneVia,
        diagramma_url: diagrammaUrl,
        allontanamento_descrizione: allontanamentoDescrizione,
        allontanamento_foto_url: allontanamentoFotoUrl,
        allontanamento_gpx_url: allontanamentoGpxUrl,
      });

      if (error) throw new Error(error.message);

      setCaricamento(false);
      navigate('/');
    } catch (err) {
      setErrore(err.message);
      setCaricamento(false);
    }
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
          placeholder="Difficoltà (es. 6a, oppure D+/TD in scala alpinistica)"
          value={difficolta}
          onChange={(e) => setDifficolta(e.target.value)}
          required
        />

        <h2 className="titolo-sezione">Avvicinamento</h2>
        <textarea
          placeholder="Descrivi come raggiungere l'attacco della via"
          value={avvicinamentoDescrizione}
          onChange={(e) => setAvvicinamentoDescrizione(e.target.value)}
          rows={4}
          required
        />
        <label>
          Foto avvicinamento (opzionale)
          <input type="file" accept="image/*" onChange={(e) => setAvvicinamentoFoto(e.target.files[0])} />
        </label>
        <label>
          Traccia GPX avvicinamento (opzionale)
          <input type="file" accept=".gpx" onChange={(e) => setAvvicinamentoGpx(e.target.files[0])} />
        </label>

        <h2 className="titolo-sezione">Via</h2>
        <textarea
          placeholder="Descrivi i tiri della via (lunghezza, difficoltà, soste...)"
          value={descrizioneVia}
          onChange={(e) => setDescrizioneVia(e.target.value)}
          rows={6}
          required
        />
        <label>
          Topo della via (immagine, obbligatoria)
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setDiagrammaFile(e.target.files[0])}
            required
          />
        </label>

        <h2 className="titolo-sezione">Allontanamento</h2>
        <textarea
          placeholder="Descrivi come tornare dalla via (calate, sentiero...)"
          value={allontanamentoDescrizione}
          onChange={(e) => setAllontanamentoDescrizione(e.target.value)}
          rows={4}
          required
        />
        <label>
          Foto allontanamento (opzionale)
          <input type="file" accept="image/*" onChange={(e) => setAllontanamentoFoto(e.target.files[0])} />
        </label>
        <label>
          Traccia GPX allontanamento (opzionale)
          <input type="file" accept=".gpx" onChange={(e) => setAllontanamentoGpx(e.target.files[0])} />
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