import { supabase } from '../supabaseClient';
import { comprimiImmagine } from './comprimiImmagine';

export async function caricaFotoExtra(fotoExtra, viaId, utenteId, opzioni = {}) {
  const { stato = 'approvata', propostaId = null } = opzioni;

  for (const f of fotoExtra) {
    if (!f.file) continue;

    const fileCompresso = await comprimiImmagine(f.file);
    const nomeFile = `${utenteId}/${Date.now()}-${fileCompresso.name}`;

    const { error: erroreUpload } = await supabase.storage
      .from('foto-vie')
      .upload(nomeFile, fileCompresso);
    if (erroreUpload) throw new Error(erroreUpload.message);

    const { data: pubblico } = supabase.storage.from('foto-vie').getPublicUrl(nomeFile);

    const { error: erroreInsert } = await supabase.from('foto_via').insert({
      via_id: viaId,
      utente_id: utenteId,
      url: pubblico.publicUrl,
      didascalia: f.didascalia.trim(),
      categoria: f.categoria,
      stato,
      modifica_proposta_id: propostaId,
    });
    if (erroreInsert) throw new Error(erroreInsert.message);
  }
}