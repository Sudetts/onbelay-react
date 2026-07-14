import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useAuth } from '../AuthContext';

function Profilo() {
  const { utente } = useAuth();
  const [profilo, setProfilo] = useState(null);
  const [vieUtente, setVieUtente] = useState([]);
  const [caricamento, setCaricamento] = useState(true);
  const [proposteUtente, setProposteUtente] = useState([]);
  const [diarioUtente, setDiarioUtente] = useState([]);

  useEffect(() => {
    if (!utente) return;

    async function caricaDati() {
      // Carica i dati del profilo (nome, cognome, città)
      const { data: datiProfilo, error: erroreProfilo } = await supabase
        .from('profili')
        .select('*')
        .eq('id', utente.id)
        .single();

      if (erroreProfilo) {
        console.error('Errore nel caricamento del profilo:', erroreProfilo);
      } else {
        setProfilo(datiProfilo);
      }

// Carica le vie inserite da questo utente
      const { data: vie, error: erroreVie } = await supabase
        .from('vie')
        .select('*')
        .eq('autore_id', utente.id);

      if (erroreVie) {
        console.error('Errore nel caricamento delle vie:', erroreVie);
      } else {
        setVieUtente(vie);
      }

// Carica le proposte di modifica fatte da questo utente, ancora in attesa
      const { data: proposte, error: erroreProposte } = await supabase
        .from('modifiche_proposte')
        .select('*, vie(nome)')
        .eq('proponente_id', utente.id)
        .eq('stato', 'in_attesa');

      if (erroreProposte) {
        console.error('Errore nel caricamento delle proposte:', erroreProposte);
      } else {
        setProposteUtente(proposte);
      }

      // Carica il diario delle vie fatte, in ordine cronologico (più recenti prima)
      const { data: diario, error: erroreDiario } = await supabase
        .from('diario')
        .select('*, vie(nome, zona, difficolta)')
        .eq('utente_id', utente.id)
        .order('data_salita', { ascending: false });

      if (erroreDiario) {
        console.error('Errore nel caricamento del diario:', erroreDiario);
      } else {
        setDiarioUtente(diario);
      }

      setCaricamento(false);
    }

    caricaDati();
  }, [utente]);

  if (!utente) {
    return (
      <div className="app dettaglio">
        <p>Devi accedere per vedere il tuo profilo.</p>
        <Link to="/login">Vai al login</Link>
      </div>
    );
  }

  if (caricamento) {
    return <p>Caricamento in corso...</p>;
  }

  return (
    <div className="app dettaglio">
      <Link to="/">← Torna alla lista</Link>
      <h1>Il mio profilo</h1>

      {profilo && (
        <div className="scheda-profilo">
          <p><strong>Nome:</strong> {profilo.nome}</p>
          <p><strong>Cognome:</strong> {profilo.cognome}</p>
          <p><strong>Città:</strong> {profilo.citta}</p>
          <p><strong>Email:</strong> {utente.email}</p>
        </div>
      )}

      <h2>Le mie vie ({vieUtente.length})</h2>

      {vieUtente.length === 0 ? (
        <p>Non hai ancora inserito nessuna via.</p>
      ) : (
        <div className="grid">
          {vieUtente.map((via) => (
            <Link to={`/via/${via.id}`} className="card" key={via.id}>
            <h3>{via.nome}</h3>
            <p>Zona: {via.zona}</p>
            <p>Difficoltà: {via.difficolta}</p>
          {via.stato === 'in_attesa' && <p className="badge-attesa">In attesa di approvazione</p>}
          {via.stato === 'rifiutata' && <p className="badge-rifiutata">Rifiutata</p>}
        </Link>
      ))}
        </div>
      )}
      {proposteUtente.length > 0 && (
        <>
          <h2>Le mie modifiche in attesa di approvazione</h2>
          <div className="grid">
            {proposteUtente.map((proposta) => (
              <Link to={`/via/${proposta.via_id}`} className="card" key={proposta.id}>
                <h3>{proposta.vie?.nome}</h3>
                <p className="badge-attesa">In attesa approvazione modifica</p>
              </Link>
            ))}
          </div>
        </>
      )}
      {diarioUtente.length > 0 && (
        <>
          <h2>Il mio diario ({diarioUtente.length})</h2>
          <div className="lista-diario">
            {diarioUtente.map((voce) => (
              <Link to={`/via/${voce.via_id}`} className="voce-diario" key={voce.id}>
                <span className="data-diario">
                  {new Date(voce.data_salita).toLocaleDateString('it-IT')}
                </span>
                <span className="nome-diario">{voce.vie?.nome}</span>
                <span className="dettagli-diario">{voce.vie?.zona} · {voce.vie?.difficolta}</span>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default Profilo;