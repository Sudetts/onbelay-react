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

  const [avvicinamentoDescrizione, setAvvicinamentoDescrizione] = useState('');
  const [avvicinamentoFotoUrl, setAvvicinamentoFotoUrl] = useState(null);
  const [avvicinamentoGpxUrl, setAvvicinamentoGpxUrl] = useState(null);
  const [nuovaAvvicinamentoFoto, setNuovaAvvicinamentoFoto] = useState(null);
  const [nuovaAvvicinamentoGpx, setNuovaAvvicinamentoGpx] = useState(null);

  const [descrizioneVia, setDescrizioneVia] = useState('');
  const [diagrammaUrl, setDiagrammaUrl] = useState(null);
  const [nuovoDiagramma, setNuovoDiagramma] = useState(null);

  const [allontanamentoDescrizione, setAllontanamentoDescrizione] = useState('');
  const [allontanamentoFotoUrl, setAllontanamentoFotoUrl] = useState(null);
  const [allontanamentoGpxUrl, setAllontanamentoGpxUrl] = useState(null);
  const [nuovaAllontanamentoFoto, setNuovaAllontanamentoFoto] = useState(null);
  const [nuovaAllontanamentoGpx, setNuovaAllontanamentoGpx] = useState(null);

  const [autoreId, setAutoreId] = useState(null);
  const [caricamento, setCaricamento] = useState(true);
  const [salvataggio, setSalvataggio] = useState(false);
  const [errore, setErrore] = useState('');

  useEffect(() => {
    async function caricaVia() {
      const { data, error } = await supabase.from('vie').select('*').eq('id', id).single();

      if (error) {
        setErrore(error.message);
      } else {
        setNome(data.nome);
        setZona(data.zona);
        setDifficolta(data.difficolta);
        setAvvicinamentoDescrizione(data.avvicinamento_descrizione || '');
        setAvvicinamentoFotoUrl(data.avvicinamento_foto_url);
        setAvvicinamentoGpxUrl(data.avvicinamento_gpx_url);
        setDescrizioneVia(data.descrizione_via || '');
        setDiagrammaUrl(data.diagramma_url);
        setAllontanamentoDescrizione(data.allontanamento_descrizione || '');
        setAllontanamentoFotoUrl(data.allontanamento_foto_url);
        setAllontanamentoGpxUrl(data.allontanamento_gpx_url);
        setAutoreId(data.autore_id);
      }
      setCaricamento(false);
    }

    caricaVia();
  }, [id]);

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
    setSalvataggio(true);

    try {
      const nuovoAvvicinamentoFotoUrl = nuovaAvvicinamentoFoto
        ? await caricaFile(nuovaAvvicinamentoFoto, 'foto-vie')
        : avvicinamentoFotoUrl;
      const nuovoAvvicinamentoGpxUrl = nuovaAvvicinamentoGpx
        ? await caricaFile(nuovaAvvicinamentoGpx, 'gpx-vie')
        : avvicinamentoGpxUrl;
      const nuovoDiagrammaUrl = nuovoDiagramma
        ? await caricaFile(nuovoDiagramma, 'foto-vie')
        : diagrammaUrl;
      const nuovoAllontanamentoFotoUrl = nuovaAllontanamentoFoto
        ? await caricaFile(nuovaAllontanamentoFoto, 'foto-vie')
        : allontanamentoFotoUrl;
      const nuovoAllontanamentoGpxUrl = nuovaAllontanamentoGpx
        ? await caricaFile(nuovaAllontanamentoGpx, 'gpx-vie')
        : allontanamentoGpxUrl;

      const { error } = await supabase
        .from('vie')
        .update({
          nome,
          zona,
          difficolta,
          avvicinamento_descrizione: avvicinamentoDescrizione,
          avvicinamento_foto_url: nuovoAvvicinamentoFotoUrl,
          avvicinamento_gpx_url: nuovoAvvicinamentoGpxUrl,
          descrizione_via: descrizioneVia,
          diagramma_url: nuovoDiagrammaUrl,
          allontanamento_descrizione: allontanamentoDescrizione,
          allontanamento_foto_url: nuovoAllontanamentoFotoUrl,
          allontanamento_gpx_url: nuovoAllontanamentoGpxUrl,
        })
        .eq('id', id);

      if (error) throw new Error(error.message);

      navigate(`/via/${id}`);
    } catch (err) {
      setErrore(err.message);
      setSalvataggio(false);
    }
  }
  if (caricamento) {
    return <p>Caricamento in corso...</p>;
  }

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

        <h2 className="titolo-sezione">Avvicinamento</h2>
        <textarea
          placeholder="Descrizione avvicinamento"
          value={avvicinamentoDescrizione}
          onChange={(e) => setAvvicinamentoDescrizione(e.target.value)}
          rows={4}
          required
        />
        <label>
          {avvicinamentoFotoUrl ? 'Sostituisci foto avvicinamento' : 'Foto avvicinamento'}
          <input type="file" accept="image/*" onChange={(e) => setNuovaAvvicinamentoFoto(e.target.files[0])} />
        </label>
        <label>
          {avvicinamentoGpxUrl ? 'Sostituisci traccia GPX avvicinamento' : 'Traccia GPX avvicinamento'}
          <input type="file" accept=".gpx" onChange={(e) => setNuovaAvvicinamentoGpx(e.target.files[0])} />
        </label>

        <h2 className="titolo-sezione">Via</h2>
        <textarea
          placeholder="Descrizione dei tiri"
          value={descrizioneVia}
          onChange={(e) => setDescrizioneVia(e.target.value)}
          rows={6}
          required
        />
        <label>
          {diagrammaUrl ? 'Sostituisci topo della via' : 'Topo della via'}
          <input type="file" accept="image/*" onChange={(e) => setNuovoDiagramma(e.target.files[0])} />
        </label>

        <h2 className="titolo-sezione">Allontanamento</h2>
        <textarea
          placeholder="Descrizione allontanamento"
          value={allontanamentoDescrizione}
          onChange={(e) => setAllontanamentoDescrizione(e.target.value)}
          rows={4}
          required
        />
        <label>
          {allontanamentoFotoUrl ? 'Sostituisci foto allontanamento' : 'Foto allontanamento'}
          <input type="file" accept="image/*" onChange={(e) => setNuovaAllontanamentoFoto(e.target.files[0])} />
        </label>
        <label>
          {allontanamentoGpxUrl ? 'Sostituisci traccia GPX allontanamento' : 'Traccia GPX allontanamento'}
          <input type="file" accept=".gpx" onChange={(e) => setNuovaAllontanamentoGpx(e.target.files[0])} />
        </label>

        {errore && <p className="errore">{errore}</p>}

        <button type="submit" disabled={salvataggio}>
          {salvataggio ? 'Salvataggio in corso...' : 'Salva modifiche'}
        </button>
      </form>
    </div>
  );
}

export default ModificaVia;