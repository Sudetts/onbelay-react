import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useAuth } from '../AuthContext';
import DifferenzeModifica from '../components/DifferenzeModifica';

function Amministrazione() {
  const { utente } = useAuth();
  const [isAdmin, setIsAdmin] = useState(null);
  const [vieInAttesa, setVieInAttesa] = useState([]);
  const [vieDaEliminare, setVieDaEliminare] = useState([]);
  const [modificheInAttesa, setModificheInAttesa] = useState([]);
  const [modificheEspanse, setModificheEspanse] = useState(new Set());
  const [caricamento, setCaricamento] = useState(true);

  useEffect(() => {
    async function verificaECarica() {
      if (!utente) {
        setCaricamento(false);
        return;
      }

      const { data: profilo } = await supabase
        .from('profili')
        .select('is_admin')
        .eq('id', utente.id)
        .single();

      if (!profilo?.is_admin) {
        setIsAdmin(false);
        setCaricamento(false);
        return;
      }

      setIsAdmin(true);

      const { data: vie } = await supabase
        .from('vie')
        .select('*')
        .eq('stato', 'in_attesa');
      setVieInAttesa(vie || []);

      const { data: daEliminare } = await supabase
        .from('vie')
        .select('*')
        .eq('richiesta_eliminazione', true);
      setVieDaEliminare(daEliminare || []);

      const { data: modifiche } = await supabase
        .from('modifiche_proposte')
        .select('*, vie(*)')
        .eq('stato', 'in_attesa');
      setModificheInAttesa(modifiche || []);

      setCaricamento(false);
    }

    verificaECarica();
  }, [utente]);

  async function approvaVia(id) {
    await supabase.from('vie').update({ stato: 'approvata' }).eq('id', id);
    setVieInAttesa((prev) => prev.filter((v) => v.id !== id));
  }

  async function rifiutaVia(id) {
    await supabase.from('vie').update({ stato: 'rifiutata' }).eq('id', id);
    setVieInAttesa((prev) => prev.filter((v) => v.id !== id));
  }

async function confermaEliminazione(id) {
    const conferma = window.confirm('Questa azione è irreversibile. Eliminare definitivamente questa via?');
    if (!conferma) return;

    await supabase.from('vie').delete().eq('id', id);
    setVieDaEliminare((prev) => prev.filter((v) => v.id !== id));
  }

  async function annullaEliminazione(id) {
    await supabase.from('vie').update({ richiesta_eliminazione: false }).eq('id', id);
    setVieDaEliminare((prev) => prev.filter((v) => v.id !== id));
  }

  async function approvaModifica(modifica) {
    const { error: erroreVia } = await supabase
      .from('vie')
      .update({
        nome: modifica.nome,
        zona: modifica.zona,
        difficolta: modifica.difficolta,
        latitudine: modifica.latitudine,
        longitudine: modifica.longitudine,
        nazione: modifica.nazione,
        regione: modifica.regione,
        provincia: modifica.provincia,
        sviluppo_totale: modifica.sviluppo_totale,
        quota_inizio: modifica.quota_inizio,
        tempo_avvicinamento: modifica.tempo_avvicinamento,
        tempo_via: modifica.tempo_via,
        tempo_rientro: modifica.tempo_rientro,
        tipo_roccia: modifica.tipo_roccia,
        qualita_roccia: modifica.qualita_roccia,
        impegno: modifica.impegno,
        tipo_corda: modifica.tipo_corda,
        lunghezza_corda: modifica.lunghezza_corda,
        protezioni_mobili: modifica.protezioni_mobili,
        tipo_protezioni_mobili: modifica.tipo_protezioni_mobili,
        rinvii_consigliati: modifica.rinvii_consigliati,
        anno_apertura: modifica.anno_apertura,
        apritori: modifica.apritori,
        permessi: modifica.permessi,
        parcheggio: modifica.parcheggio,
        punto_appoggio: modifica.punto_appoggio,
        copertura_cellulare: modifica.copertura_cellulare,
        possibilita_ritirata: modifica.possibilita_ritirata,
        pericoli_oggettivi: modifica.pericoli_oggettivi,
        esposizione: modifica.esposizione,
        mesi_consigliati: modifica.mesi_consigliati,
        avvicinamento_descrizione: modifica.avvicinamento_descrizione,
        avvicinamento_foto_url: modifica.avvicinamento_foto_url,
        avvicinamento_gpx_url: modifica.avvicinamento_gpx_url,
        descrizione_via: modifica.descrizione_via,
        diagramma_url: modifica.diagramma_url,
        allontanamento_descrizione: modifica.allontanamento_descrizione,
        allontanamento_foto_url: modifica.allontanamento_foto_url,
        allontanamento_gpx_url: modifica.allontanamento_gpx_url,
        tiri: modifica.tiri,
        numero_tiri: modifica.tiri ? modifica.tiri.length : 0,
      })
      .eq('id', modifica.via_id);

    if (erroreVia) {
      alert('Errore durante l\'applicazione della modifica: ' + erroreVia.message);
      return;
    }

    await supabase.from('modifiche_proposte').update({ stato: 'approvata' }).eq('id', modifica.id);
    setModificheInAttesa((prev) => prev.filter((m) => m.id !== modifica.id));
  }

  function toggleDifferenze(id) {
    setModificheEspanse((prev) => {
      const nuovoSet = new Set(prev);
      if (nuovoSet.has(id)) {
        nuovoSet.delete(id);
      } else {
        nuovoSet.add(id);
      }
      return nuovoSet;
    });
  }

  async function rifiutaModifica(id) {
    await supabase.from('modifiche_proposte').update({ stato: 'rifiutata' }).eq('id', id);
    setModificheInAttesa((prev) => prev.filter((m) => m.id !== id));
  }

  if (caricamento) {
    return <p>Caricamento in corso...</p>;
  }

  if (!utente || !isAdmin) {
    return (
      <div className="app dettaglio">
        <p>Pagina non trovata.</p>
        <Link to="/">Torna alla home</Link>
      </div>
    );
  }

  return (
    <div className="app dettaglio">
      <Link to="/">← Torna alla lista</Link>
      <h1>Pannello di amministrazione</h1>

      <h2>Vie in attesa ({vieInAttesa.length})</h2>
      {vieInAttesa.length === 0 ? (
        <p>Nessuna via in attesa.</p>
      ) : (
        vieInAttesa.map((via) => (
          <div className="scheda-admin" key={via.id}>
          <h3>{via.nome}</h3>
          <p>Zona: {via.zona} · Difficoltà: {via.difficolta}</p>
          <p className="link-piccolo">{via.tiri?.length || 0} tiri inseriti</p>
            <p><Link to={`/via/${via.id}`}>Vedi dettagli completi →</Link></p>
            <div className="azioni-admin">
              <button onClick={() => approvaVia(via.id)} className="btn-approva">Approva</button>
              <button onClick={() => rifiutaVia(via.id)} className="btn-rifiuta">Rifiuta</button>
            </div>
          </div>
        ))
      )}

<h2>Vie in attesa di eliminazione ({vieDaEliminare.length})</h2>
      {vieDaEliminare.length === 0 ? (
        <p>Nessuna via in attesa di eliminazione.</p>
      ) : (
        vieDaEliminare.map((via) => (
          <div className="scheda-admin" key={via.id}>
            <h3>{via.nome}</h3>
            <p>Zona: {via.zona} · Difficoltà: {via.difficolta}</p>
            <p><Link to={`/via/${via.id}`}>Vedi dettagli completi →</Link></p>
            <div className="azioni-admin">
              <button onClick={() => confermaEliminazione(via.id)} className="btn-rifiuta">Elimina definitivamente</button>
              <button onClick={() => annullaEliminazione(via.id)} className="btn-approva">Annulla, mantieni la via</button>
            </div>
          </div>
        ))
      )}

      <h2>Modifiche in attesa ({modificheInAttesa.length})</h2>
      {modificheInAttesa.length === 0 ? (
        <p>Nessuna modifica in attesa.</p>
      ) : (
        modificheInAttesa.map((modifica) => (
          <div className="scheda-admin" key={modifica.id}>
            <h3>Modifica a: {modifica.vie?.nome}</h3>
            <p><Link to={`/via/${modifica.via_id}`}>Vedi via originale →</Link></p>

            <button
              type="button"
              className="link-button bottone-differenze"
              onClick={() => toggleDifferenze(modifica.id)}
            >
              {modificheEspanse.has(modifica.id) ? 'Nascondi confronto' : 'Confronta le due versioni'}
            </button>

            {modificheEspanse.has(modifica.id) && (
              <DifferenzeModifica via={modifica.vie} modifica={modifica} />
            )}

            <div className="azioni-admin">
              <button onClick={() => approvaModifica(modifica)} className="btn-approva">Approva</button>
              <button onClick={() => rifiutaModifica(modifica.id)} className="btn-rifiuta">Rifiuta</button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default Amministrazione;