import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useAuth } from '../AuthContext';

function ProponiModifica() {
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

  const [caricamento, setCaricamento] = useState(true);
  const [invio, setInvio] = useState(false);
  const [errore, setErrore] = useState('');
  const [inviato, setInviato] = useState(false);

  useEffect(() => {
    async function caricaVia() {
      const { data, error } = await supabase.from('vie').select('*').eq('id', id).single();

      if (!error) {
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
    setInvio(true);

    try {
      const urlAvvFoto = nuovaAvvicinamentoFoto ? await caricaFile(nuovaAvvicinamentoFoto, 'foto-vie') : avvicinamentoFotoUrl;
      const urlAvvGpx = nuovaAvvicinamentoGpx ? await caricaFile(nuovaAvvicinamentoGpx, 'gpx-vie') : avvicinamentoGpxUrl;
      const urlDiagramma = nuovoDiagramma ? await caricaFile(nuovoDiagramma, 'foto-vie') : diagrammaUrl;
      const urlAllFoto = nuovaAllontanamentoFoto ? await caricaFile(nuovaAllontanamentoFoto, 'foto-vie') : allontanamentoFotoUrl;
      const urlAllGpx = nuovaAllontanamentoGpx ? await caricaFile(nuovaAllontanamentoGpx, 'gpx-vie') : allontanamentoGpxUrl;

      const { error } = await supabase.from('modifiche_proposte').insert({
        via_id: id,
        proponente_id: utente.id,
        nome,
        zona,
        difficolta,
        avvicinamento_descrizione: avvicinamentoDescrizione,
        avvicinamento_foto_url: urlAvvFoto,
        avvicinamento_gpx_url: urlAvvGpx,
        descrizione_via: descrizioneVia,
        diagramma_url: urlDiagramma,
        allontanamento_descrizione: allontanamentoDescrizione,
        allontanamento_foto_url: urlAllFoto,
        allontanamento_gpx_url: urlAllGpx,
      });

      if (error) throw new Error(error.message);

      setInvio(false);
      setInviato(true);
    } catch (err) {
      setErrore(err.message);
      setInvio(false);
    }
  }
  if (caricamento) {
    return <p>Caricamento in corso...</p>;
  }

  if (!utente) {
    return (
      <div className="app dettaglio">
        <p>Devi accedere per proporre una modifica.</p>
        <Link to="/login">Vai al login</Link>
      </div>
    );
  }

  if (inviato) {
    return (
      <div className="app dettaglio">
        <p className="messaggio-successo">
          La tua proposta di modifica è stata inviata ed è in attesa di revisione. Grazie per il contributo!
        </p>
        <Link to={`/via/${id}`}>← Torna alla via</Link>
      </div>
    );
  }

  return (
    <div className="app dettaglio">
      <Link to={`/via/${id}`}>← Annulla</Link>
      <h1>Proponi una modifica</h1>
      <p className="link-piccolo">Le modifiche proposte verranno revisionate prima di essere pubblicate.</p>

      <form onSubmit={handleSubmit} className="form">
        <input type="text" placeholder="Nome via" value={nome} onChange={(e) => setNome(e.target.value)} required />
        <input type="text" placeholder="Zona" value={zona} onChange={(e) => setZona(e.target.value)} required />
        <input type="text" placeholder="Difficoltà" value={difficolta} onChange={(e) => setDifficolta(e.target.value)} required />

        <h2 className="titolo-sezione">Avvicinamento</h2>
        <textarea placeholder="Descrizione avvicinamento" value={avvicinamentoDescrizione} onChange={(e) => setAvvicinamentoDescrizione(e.target.value)} rows={4} required />
        <label>
          {avvicinamentoFotoUrl ? 'Sostituisci foto avvicinamento' : 'Foto avvicinamento'}
          <input type="file" accept="image/*" onChange={(e) => setNuovaAvvicinamentoFoto(e.target.files[0])} />
        </label>
        <label>
          {avvicinamentoGpxUrl ? 'Sostituisci traccia GPX avvicinamento' : 'Traccia GPX avvicinamento'}
          <input type="file" accept=".gpx" onChange={(e) => setNuovaAvvicinamentoGpx(e.target.files[0])} />
        </label>

        <h2 className="titolo-sezione">Via</h2>
        <textarea placeholder="Descrizione dei tiri" value={descrizioneVia} onChange={(e) => setDescrizioneVia(e.target.value)} rows={6} required />
        <label>
          {diagrammaUrl ? 'Sostituisci topo della via' : 'Topo della via'}
          <input type="file" accept="image/*" onChange={(e) => setNuovoDiagramma(e.target.files[0])} />
        </label>

        <h2 className="titolo-sezione">Allontanamento</h2>
        <textarea placeholder="Descrizione allontanamento" value={allontanamentoDescrizione} onChange={(e) => setAllontanamentoDescrizione(e.target.value)} rows={4} required />
        <label>
          {allontanamentoFotoUrl ? 'Sostituisci foto allontanamento' : 'Foto allontanamento'}
          <input type="file" accept="image/*" onChange={(e) => setNuovaAllontanamentoFoto(e.target.files[0])} />
        </label>
        <label>
          {allontanamentoGpxUrl ? 'Sostituisci traccia GPX allontanamento' : 'Traccia GPX allontanamento'}
          <input type="file" accept=".gpx" onChange={(e) => setNuovaAllontanamentoGpx(e.target.files[0])} />
        </label>

        {errore && <p className="errore">{errore}</p>}

        <button type="submit" disabled={invio}>
          {invio ? 'Invio in corso...' : 'Invia proposta'}
        </button>
      </form>
    </div>
  );
}

export default ProponiModifica;