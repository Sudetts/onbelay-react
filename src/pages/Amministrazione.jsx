import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useAuth } from '../AuthContext';

function Amministrazione() {
  const { utente } = useAuth();
  const [isAdmin, setIsAdmin] = useState(null);
  const [vieInAttesa, setVieInAttesa] = useState([]);
  const [modificheInAttesa, setModificheInAttesa] = useState([]);
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

      const { data: modifiche } = await supabase
        .from('modifiche_proposte')
        .select('*, vie(nome)')
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

  async function approvaModifica(id) {
    await supabase.from('modifiche_proposte').update({ stato: 'approvata' }).eq('id', id);
    setModificheInAttesa((prev) => prev.filter((m) => m.id !== id));
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
            <p><Link to={`/via/${via.id}`}>Vedi dettagli completi →</Link></p>
            <div className="azioni-admin">
              <button onClick={() => approvaVia(via.id)} className="btn-approva">Approva</button>
              <button onClick={() => rifiutaVia(via.id)} className="btn-rifiuta">Rifiuta</button>
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
            <p>Nuova zona: {modifica.zona} · Nuova difficoltà: {modifica.difficolta}</p>
            <p><Link to={`/via/${modifica.via_id}`}>Vedi via originale →</Link></p>
            <div className="azioni-admin">
              <button onClick={() => approvaModifica(modifica.id)} className="btn-approva">Approva</button>
              <button onClick={() => rifiutaModifica(modifica.id)} className="btn-rifiuta">Rifiuta</button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default Amministrazione;