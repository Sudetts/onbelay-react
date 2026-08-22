import { useState } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../AuthContext';
import { comprimiImmagine } from '../utils/comprimiImmagine';

const OPZIONI_CATEGORIA = [
  { value: 'attacco', label: 'Attacco della via' },
  { value: 'tiro', label: 'Un tiro / parete' },
  { value: 'sosta', label: 'Una sosta' },
  { value: 'calata', label: 'Calata / discesa' },
  { value: 'avvicinamento', label: 'Avvicinamento' },
  { value: 'panorama', label: 'Vista panoramica' },
  { value: 'altro', label: 'Altro dettaglio utile' },
];

function AggiungiFotoVia({ viaId, onFotoAggiunta }) {
  const { utente } = useAuth();
  const [file, setFile] = useState(null);
  const [categoria, setCategoria] = useState('');
  const [didascalia, setDidascalia] = useState('');
  const [invio, setInvio] = useState(false);
  const [errore, setErrore] = useState('');
  const [chiaveInput, setChiaveInput] = useState(0);

  async function handleSubmit(e) {
    e.preventDefault();
    setErrore('');

    if (!file) {
      setErrore('Seleziona una foto.');
      return;
    }
    if (!categoria) {
      setErrore('Indica cosa mostra la foto.');
      return;
    }
    if (didascalia.trim().length < 5) {
      setErrore('Scrivi una didascalia di almeno 5 caratteri (es. "Attacco a sinistra del masso").');
      return;
    }

    setInvio(true);

    try {
      const fileCompresso = await comprimiImmagine(file);
      const nomeFile = `${utente.id}/${Date.now()}-${fileCompresso.name}`;

      const { error: erroreUpload } = await supabase.storage
        .from('foto-vie')
        .upload(nomeFile, fileCompresso);
      if (erroreUpload) throw new Error(erroreUpload.message);

      const { data: pubblico } = supabase.storage.from('foto-vie').getPublicUrl(nomeFile);

      const { data: nuovaFoto, error: erroreInsert } = await supabase
        .from('foto_via')
        .insert({
          via_id: viaId,
          utente_id: utente.id,
          url: pubblico.publicUrl,
          didascalia: didascalia.trim(),
          categoria,
        })
        .select('*, profili(nome, cognome)')
        .single();

      if (erroreInsert) throw new Error(erroreInsert.message);

      setFile(null);
      setCategoria('');
      setDidascalia('');
      setChiaveInput((k) => k + 1); // resetta il campo file
      onFotoAggiunta(nuovaFoto);
    } catch (err) {
      setErrore(err.message);
    }

    setInvio(false);
  }

  if (!utente) return null;

  return (
    <form onSubmit={handleSubmit} className="form form-aggiungi-foto">
      <label>
        Foto (attacco, soste, fix, tiri...) *
        <input
          key={chiaveInput}
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files[0])}
          required
        />
      </label>

      <select
        value={categoria}
        onChange={(e) => setCategoria(e.target.value)}
        className={categoria === '' ? 'campo-vuoto' : ''}
        required
      >
        <option value="" disabled hidden>Cosa mostra la foto? *</option>
        {OPZIONI_CATEGORIA.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>

      <textarea
        placeholder='Didascalia * (es. "Attacco a sinistra del masso, bollo rosso")'
        value={didascalia}
        onChange={(e) => setDidascalia(e.target.value)}
        rows={2}
        maxLength={200}
        required
        minLength={5}
      />

      {errore && <p className="errore">{errore}</p>}

      <button type="submit" disabled={invio}>
        {invio ? 'Caricamento in corso...' : 'Aggiungi foto'}
      </button>
    </form>
  );
}

export default AggiungiFotoVia;