import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useAuth } from '../AuthContext';
import MappaGpx from '../components/MappaGpx';

function ViaDettaglio() {
  const { id } = useParams();
  const { utente } = useAuth();
  const navigate = useNavigate();
  const [via, setVia] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [sbloccata, setSbloccata] = useState(false);
  const [crediti, setCrediti] = useState(null);
  const [erroreSblocco, setErroreSblocco] = useState('');
  const [sbloccoInCorso, setSbloccoInCorso] = useState(false);
  const [caricamento, setCaricamento] = useState(true);
  const [dataSalita, setDataSalita] = useState('');
  const [salvataggioDiario, setSalvataggioDiario] = useState(false);
  const [erroreDiario, setErroreDiario] = useState('');
  const [salitaRegistrata, setSalitaRegistrata] = useState(false);

useEffect(() => {
    async function caricaVia() {
      const { data, error } = await supabase
        .from('vie')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Errore nel caricamento:', error);
        setCaricamento(false);
        return;
      }

      setVia(data);

if (utente) {
        const { data: profiloData } = await supabase
          .from('profili')
          .select('crediti, is_admin')
          .eq('id', utente.id)
          .single();

        setCrediti(profiloData?.crediti ?? 0);
        setIsAdmin(profiloData?.is_admin || false);

        if (utente.id === data.autore_id || profiloData?.is_admin) {
          setSbloccata(true);
        } else {
          const { data: sblocco } = await supabase
            .from('sblocchi')
            .select('id')
            .eq('utente_id', utente.id)
            .eq('via_id', id)
            .maybeSingle();
          setSbloccata(!!sblocco);
        }
      }

      setCaricamento(false);
    }

    caricaVia();
  }, [id, utente]);

async function handleElimina() {
    const conferma = window.confirm('Vuoi inviare questa via in eliminazione? Dovrai confermarla dal pannello di amministrazione prima che venga cancellata definitivamente.');
    if (!conferma) return;

    const { error } = await supabase.from('vie').update({ richiesta_eliminazione: true }).eq('id', id);

    if (error) {
      alert('Errore durante la richiesta di eliminazione: ' + error.message);
      return;
    }

    navigate('/');
  }

async function handleSblocca() {
    const conferma = window.confirm('Vuoi sbloccare questa via spendendo 1 credito?');
    if (!conferma) return;

    setErroreSblocco('');
    setSbloccoInCorso(true);

    const { error } = await supabase.rpc('sblocca_via', { p_via_id: id });

    if (error) {
      setErroreSblocco(error.message);
      setSbloccoInCorso(false);
      return;
    }

    setSbloccata(true);
    setCrediti((c) => c - 1);
    setSbloccoInCorso(false);
  }

  async function handleSegnaFatta(e) {
    e.preventDefault();
    setErroreDiario('');
    setSalvataggioDiario(true);

    const { error } = await supabase.from('diario').insert({
      utente_id: utente.id,
      via_id: id,
      data_salita: dataSalita,
    });

    if (error) {
      setErroreDiario(error.message);
      setSalvataggioDiario(false);
      return;
    }

    setSalvataggioDiario(false);
    setSalitaRegistrata(true);
  }

  if (caricamento) {
    return <p>Caricamento in corso...</p>;
  }

  if (!via) {
    return (
      <div className="app dettaglio">
        <p>Via non trovata.</p>
        <Link to="/">Torna alla lista</Link>
      </div>
    );
  }

  if (via.richiesta_eliminazione && !isAdmin) {
    return (
      <div className="app dettaglio">
        <p>Via non trovata.</p>
        <Link to="/">Torna alla lista</Link>
      </div>
    );
  }

  const eAutore = utente && utente.id === via.autore_id;

  return (
        <div className="app dettaglio pannello-scuro pagina-via">
      <Link to="/" className="link-home">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9.5 12 3l9 6.5" />
          <path d="M5 9v11a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V9" />
        </svg>
        HOME
      </Link>
      <h1>{via.nome}</h1>
            <p>Zona: {via.zona}</p>
      <p>
        Difficoltà: {via.difficolta}
        {via.impegno && ` · Impegno: ${via.impegno}`}
      </p>

      {(via.nazione || via.regione || via.provincia) && (
        <p>
          Posizione: {[via.provincia, via.regione, via.nazione].filter(Boolean).join(', ')}
        </p>
      )}

{sbloccata ? (
        <>
                            <h2>Caratteristiche del terreno</h2>
          <p className="dati-compatti">
            {via.quota_inizio && <span>Quota: {via.quota_inizio} m</span>}
            {via.tipo_roccia && <span>Roccia: {via.tipo_roccia}</span>}
            {via.sviluppo_totale && <span>Sviluppo: {via.sviluppo_totale} m</span>}
            {via.qualita_roccia && <span>Qualità: {via.qualita_roccia}</span>}
          </p>

                    <h2>Tempistiche</h2>
          <p className="dati-compatti">
            {via.tempo_avvicinamento && <span>Avvicinamento: {via.tempo_avvicinamento}</span>}
            {via.tempo_via && <span>Sulla via: {via.tempo_via}</span>}
            {via.tempo_rientro && <span>Rientro: {via.tempo_rientro}</span>}
          </p>
                    <h2>Materiale consigliato</h2>
          <p className="dati-compatti">
            {via.tipo_corda && <span>Corda: {via.tipo_corda}</span>}
            {via.lunghezza_corda && <span>Lunghezza corda: {via.lunghezza_corda} m</span>}
            {via.rinvii_consigliati && <span>Rinvii: {via.rinvii_consigliati}</span>}
          </p>
          {via.protezioni_mobili !== null && via.protezioni_mobili !== undefined && (
            <p>Protezioni mobili: {via.protezioni_mobili ? 'Necessarie' : 'Non necessarie'}</p>
          )}
          {via.tipo_protezioni_mobili && <p>Quali protezioni: {via.tipo_protezioni_mobili}</p>}

          <h2>Accesso e parcheggio</h2>
          {via.permessi && <p>Permessi/autorizzazioni: {via.permessi}</p>}
          {via.parcheggio && <p>Parcheggio: {via.parcheggio}</p>}
          {via.punto_appoggio && <p>Punto d'appoggio più vicino: {via.punto_appoggio}</p>}

          <h2>Sicurezza</h2>
          {via.possibilita_ritirata !== null && via.possibilita_ritirata !== undefined && (
            <p>Possibilità di ritirata a metà via: {via.possibilita_ritirata ? 'Sì' : 'No'}</p>
          )}
          {via.copertura_cellulare && <p>Copertura cellulare: {via.copertura_cellulare}</p>}
          {via.pericoli_oggettivi && <p>Pericoli oggettivi: {via.pericoli_oggettivi}</p>}

          {(via.esposizione || via.mesi_consigliati) && (
            <>
              <h2>Esposizione e stagionalità</h2>
              {via.esposizione && <p>Esposizione: {via.esposizione}</p>}
              {via.mesi_consigliati && <p>Mesi consigliati: {via.mesi_consigliati}</p>}
            </>
          )}

          {via.avvicinamento_descrizione && (
            <>
              <h2>Avvicinamento</h2>
              <p>{via.avvicinamento_descrizione}</p>
              {via.avvicinamento_foto_url && (
                <img src={via.avvicinamento_foto_url} alt="Avvicinamento" className="foto-via" />
              )}
              {via.avvicinamento_gpx_url && (
                <>
                  <MappaGpx gpxUrl={via.avvicinamento_gpx_url} />
                  <p><a href={via.avvicinamento_gpx_url} download className="link-gpx">Scarica traccia GPX avvicinamento</a></p>
                </>
              )}
            </>
          )}

    {(via.descrizione_via || (via.tiri && via.tiri.length > 0)) && (
        <>
          <h2>Via</h2>
          {via.descrizione_via && <p>{via.descrizione_via}</p>}

          {via.tiri && via.tiri.length > 0 && (
            <div className="lista-tiri-vista">
              {via.tiri.map((tiro, indice) => (
                <div className="scheda-tiro-vista" key={indice}>
                  <h3>Tiro {indice + 1} — {tiro.difficoltaMax} · {tiro.lunghezza}m</h3>
                  <p>{tiro.descrizione}</p>
                  <p className="dettagli-tiro">
                    {tiro.gradoMedio && <span>Grado medio: {tiro.gradoMedio}</span>}
                    {tiro.sosta && <span>Sosta: {tiro.sosta}</span>}
                    {tiro.chiodatura && <span>Chiodatura: {tiro.chiodatura}</span>}
                  </p>
                </div>
              ))}
            </div>
          )}

          {via.diagramma_url && (
            <img src={via.diagramma_url} alt="Topo della via" className="foto-via" />
          )}
        </>
      )}    
                    {via.allontanamento_descrizione && (
            <>
              <h2>Allontanamento</h2>
              <p>{via.allontanamento_descrizione}</p>
              {via.allontanamento_foto_url && (
                <img src={via.allontanamento_foto_url} alt="Allontanamento" className="foto-via" />
              )}
              {via.allontanamento_gpx_url && (
                <>
                  <MappaGpx gpxUrl={via.allontanamento_gpx_url} />
                  <p><a href={via.allontanamento_gpx_url} download className="link-gpx">Scarica traccia GPX allontanamento</a></p>
                </>
              )}
            </>
          )}

                    {via.ultimo_aggiornamento && (
                      <p className="link-piccolo">Aggiornato in data {new Date(via.ultimo_aggiornamento).toLocaleDateString('it-IT')}</p>
                    )}
                    {(via.anno_apertura || via.apritori) && (
            <>
              <h2>Storia della via</h2>
              <p className="dati-compatti">
                {via.anno_apertura && <span>Apertura: {via.anno_apertura}</span>}
                {via.apritori && <span>Apritori: {via.apritori}</span>}
              </p>
            </>
          )}
        </>
      ) : (
        <>
          <h2>Relazione bloccata</h2>
          <p>Avvicinamento, descrizione della via e allontanamento sono visibili solo dopo lo sblocco.</p>

          {!utente ? (
            <p><Link to="/login">Accedi</Link> per sbloccare questa via.</p>
          ) : (
            <>
              <p>Hai <strong>{crediti}</strong> {crediti === 1 ? 'credito' : 'crediti'} disponibili.</p>
              {erroreSblocco && <p className="errore">{erroreSblocco}</p>}
              <button
                onClick={handleSblocca}
                disabled={sbloccoInCorso || crediti < 1}
                className="btn-sblocca"
              >
                {sbloccoInCorso ? 'Sblocco in corso...' : 'Sblocca relazione (-1 credito)'}
              </button>
              {crediti < 1 && <p className="link-piccolo">Non hai crediti sufficienti. Carica una via o proponi una modifica per guadagnarne.</p>}
            </>
          )}
        </>
      )}

{utente && (
        <>
          <h2>Hai fatto questa via?</h2>
          {salitaRegistrata ? (
            <p className="messaggio-successo">Salita registrata nel tuo diario!</p>
          ) : (
            <form onSubmit={handleSegnaFatta} className="form form-inline">
              <input
                type="date"
                value={dataSalita}
                onChange={(e) => setDataSalita(e.target.value)}
                required
              />
              {erroreDiario && <p className="errore">{erroreDiario}</p>}
              <button type="submit" disabled={salvataggioDiario} className="btn-diario">
                {salvataggioDiario ? 'Salvataggio...' : 'Segna come fatta'}
              </button>
            </form>
          )}
        </>
      )}

      {utente && (
        <div className="azioni-autore">
          {eAutore && via.stato === 'in_attesa' ? (
            <Link to={`/via/${via.id}/modifica`} className="link-button">Modifica via</Link>
          ) : (
            <Link to={`/via/${via.id}/proponi-modifica`} className="link-button">Aggiorna/Modifica via</Link>
          )}
          {isAdmin && (
            <button onClick={handleElimina} className="link-button">Elimina</button>
          )}
        </div>
      )}
    </div>
  );
}

export default ViaDettaglio;