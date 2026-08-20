import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { supabase } from './supabaseClient';
import { useAuth } from './AuthContext';
import ViaDettaglio from './pages/ViaDettaglio';
import Registrati from './pages/Registrati';
import Login from './pages/Login';
import NuovaVia from './pages/NuovaVia';
import ModificaVia from './pages/ModificaVia';
import Profilo from './pages/Profilo';
import PasswordDimenticata from './pages/PasswordDimenticata';
import ReimpostaPassword from './pages/ReimpostaPassword';
import ProponiModifica from './pages/ProponiModifica';
import Amministrazione from './pages/Amministrazione';
import Privacy from './pages/Privacy';
import Termini from './pages/Termini';
import BannerCookie from './components/BannerCookie';
import Footer from './components/Footer';
import SicurezzaAccount from './pages/SicurezzaAccount';
import MappaVie from './components/MappaVie';
import MenuMultiSelezione from './components/MenuMultiSelezione';
import FiltroRange from './components/FiltroRange';
import './App.css';


function Intestazione() {
  const { utente, logout } = useAuth();
  const [crediti, setCrediti] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(null);

  useEffect(() => {
    if (!utente) return;

supabase
      .from('profili')
      .select('crediti, is_admin, avatar_url')
      .eq('id', utente.id)
      .single()
      .then(({ data }) => {
        setCrediti(data?.crediti);
        setIsAdmin(data?.is_admin || false);
        setAvatarUrl(data?.avatar_url || null);
      });
  }, [utente]);

  return (
    <header className="header header-immagine">
      <h1>Onbelay</h1>
      <p>Vie lunghe di arrampicata: relazioni, foto e tracce GPX</p>

{!utente && (
        <Link to="/login" className="mini-profilo">
          <div className="mini-avatar mini-avatar-ospite">O</div>
          <span className="mini-nome">Login/Registrati</span>
        </Link>
      )}

      {utente && (
        <Link to="/profilo" className="mini-profilo">
          {avatarUrl ? (
            <img src={avatarUrl} alt="Il tuo profilo" className="mini-avatar" />
          ) : (
            <div className="mini-avatar mini-avatar-segnaposto">
              {(utente.user_metadata?.nome || utente.email)?.[0]?.toUpperCase()}
            </div>
          )}
          <span className="mini-nome">Ciao {utente.user_metadata?.nome || utente.email}</span>
        </Link>
      )}
    </header>
  );
}

function formattaOre(oreDecimali) {
  const ore = Math.floor(oreDecimali);
  const min = Math.round((oreDecimali - ore) * 60);
  if (ore === 0) return `${min}min`;
  if (min === 0) return `${ore}h`;
  return `${ore}h${min}min`;
}
function ListaVie() {
  const [vie, setVie] = useState([]);
  const [caricamento, setCaricamento] = useState(true);
  const [filtroZona, setFiltroZona] = useState([]);
  const [filtroDifficolta, setFiltroDifficolta] = useState([]);
  const [ricerca, setRicerca] = useState('');
  const [filtroRoccia, setFiltroRoccia] = useState([]);
  const [filtroCorda, setFiltroCorda] = useState([]);
  const [filtroEsposizione, setFiltroEsposizione] = useState([]);
  const [filtroRitirata, setFiltroRitirata] = useState([]);
  const [filtroMesi, setFiltroMesi] = useState([]);
  const [filtroQuotaMin, setFiltroQuotaMin] = useState(0);
  const [filtroQuotaMax, setFiltroQuotaMax] = useState(4500);
  const [filtroCordaMin, setFiltroCordaMin] = useState(30);
  const [filtroCordaMax, setFiltroCordaMax] = useState(80);
    const [filtroAvvicinamentoMin, setFiltroAvvicinamentoMin] = useState(0);
  const [filtroAvvicinamentoMax, setFiltroAvvicinamentoMax] = useState(7);
  const [filtroViaMin, setFiltroViaMin] = useState(0);
  const [filtroViaMax, setFiltroViaMax] = useState(20);
    const [filtroRientroMin, setFiltroRientroMin] = useState(0);
  const [filtroRientroMax, setFiltroRientroMax] = useState(7);
    const [filtriAvanzatiAperti, setFiltriAvanzatiAperti] = useState(false);
  const [filtriAgganciati, setFiltriAgganciati] = useState(false);
  

  useEffect(() => {
    async function caricaVie() {
      const { data, error } = await supabase.from('vie').select('*').eq('stato', 'approvata').eq('richiesta_eliminazione', false);
      if (error) {
        console.error('Errore nel caricamento:', error);
      } else {
        setVie(data);
      }
      setCaricamento(false);
    }
    caricaVie();
  }, []);

      const sentinellaRef = useRef(null);

    useEffect(() => {
    if (!sentinellaRef.current) return;

    const osservatore = new IntersectionObserver(
      ([voce]) => setFiltriAgganciati(!voce.isIntersecting),
      { threshold: 0 }
    );

    osservatore.observe(sentinellaRef.current);
    return () => osservatore.disconnect();
  }, [caricamento]);
  if (caricamento) {
    return <p>Caricamento vie in corso...</p>;
  }

  const zoneDisponibili = [...new Set(vie.map((via) => via.zona))];
  const difficoltaDisponibili = [...new Set(vie.map((via) => via.difficolta))];
  const rocciaDisponibili = [...new Set(vie.map((via) => via.tipo_roccia).filter(Boolean))];
  const cordaDisponibili = [...new Set(vie.map((via) => via.tipo_corda).filter(Boolean))];
  const esposizioneDisponibili = [...new Set(
    vie.flatMap((via) => (via.esposizione ? via.esposizione.split(', ') : []))
  )];
    const mesiDisponibili = [...new Set(
    vie.flatMap((via) => (via.mesi_consigliati ? via.mesi_consigliati.split(', ') : []))
  )];

    const vieFiltrate = vie.filter((via) => {
  const passaZona = filtroZona.length === 0 || filtroZona.includes(via.zona);
  const passaDifficolta = filtroDifficolta.length === 0 || filtroDifficolta.includes(via.difficolta);
  const passaRicerca = via.nome.toLowerCase().includes(ricerca.toLowerCase());
  const passaRoccia = filtroRoccia.length === 0 || filtroRoccia.includes(via.tipo_roccia);
  const passaCorda = filtroCorda.length === 0 || filtroCorda.includes(via.tipo_corda);
  const passaEsposizione = filtroEsposizione.length === 0 || (
    via.esposizione && filtroEsposizione.some((e) => via.esposizione.split(', ').includes(e))
  );
    const passaRitirata = filtroRitirata.length === 0 || (
    filtroRitirata.includes(via.possibilita_ritirata ? 'Sì' : 'No')
  );
    const passaMesi = filtroMesi.length === 0 || (
    via.mesi_consigliati && filtroMesi.some((m) => via.mesi_consigliati.split(', ').includes(m))
  );
    const passaQuota = !via.quota_inizio || (via.quota_inizio >= filtroQuotaMin && via.quota_inizio <= filtroQuotaMax);
    const passaLunghezzaCorda = !via.lunghezza_corda || (via.lunghezza_corda >= filtroCordaMin && via.lunghezza_corda <= filtroCordaMax);
    const passaAvvicinamento = !via.tempo_avvicinamento || (via.tempo_avvicinamento >= filtroAvvicinamentoMin * 60 && via.tempo_avvicinamento <= filtroAvvicinamentoMax * 60);
  const passaVia = !via.tempo_via || (via.tempo_via >= filtroViaMin * 60 && via.tempo_via <= filtroViaMax * 60);
  const passaRientro = !via.tempo_rientro || (via.tempo_rientro >= filtroRientroMin * 60 && via.tempo_rientro <= filtroRientroMax * 60);
  return passaZona && passaDifficolta && passaRicerca && passaRoccia && passaCorda && passaEsposizione && passaRitirata && passaMesi && passaQuota && passaLunghezzaCorda && passaAvvicinamento && passaVia && passaRientro;
});

  return (
    <div className="app">
      <Intestazione />

      <main className="main">
        <h2>Dove vuoi scalare?</h2>

                        <MappaVie vie={vieFiltrate} />

<div ref={sentinellaRef} style={{ height: '1px' }} />

<div className={`barra-filtri-sticky${filtriAgganciati ? ' agganciata' : ''}`}>
<div className="gruppo-filtri">
    <input
    type="text"
    placeholder="Nome via ..."
    value={ricerca}
    onChange={(e) => setRicerca(e.target.value)}
    className="campo-ricerca"
  />
  <MenuMultiSelezione
    etichetta="Zona"
    opzioni={zoneDisponibili}
    selezionati={filtroZona}
    onCambia={setFiltroZona}
  />
    <MenuMultiSelezione
    etichetta="Difficoltà"
    opzioni={difficoltaDisponibili}
    selezionati={filtroDifficolta}
    onCambia={setFiltroDifficolta}
  />
        <MenuMultiSelezione
    etichetta="Mesi"
    opzioni={mesiDisponibili}
    selezionati={filtroMesi}
    onCambia={setFiltroMesi}
  />
            <button
    type="button"
    className="bottone-filtri-avanzati"
    onClick={() => setFiltriAvanzatiAperti((a) => !a)}
  >
    Avanzati
    <svg className={`icona-freccia-filtri${filtriAvanzatiAperti ? ' aperta' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9l6 6 6-6" />
    </svg>
  </button>
</div>

<div className={`gruppo-filtri gruppo-filtri-avanzati${filtriAvanzatiAperti ? ' aperto' : ''}`}>
  <FiltroRange
    etichetta="Quota"
    min={0}
    max={4500}
    valoreMin={filtroQuotaMin}
    valoreMax={filtroQuotaMax}
    onCambia={(nuovoMin, nuovoMax) => {
      setFiltroQuotaMin(nuovoMin);
      setFiltroQuotaMax(nuovoMax);
    }}
    formatta={(v) => `${v}m`}
  />
  <MenuMultiSelezione
    etichetta="Tipo roccia"
    opzioni={rocciaDisponibili}
    selezionati={filtroRoccia}
    onCambia={setFiltroRoccia}
  />
  <MenuMultiSelezione
    etichetta="Tipo corda"
    opzioni={cordaDisponibili}
    selezionati={filtroCorda}
    onCambia={setFiltroCorda}
  />
    <MenuMultiSelezione
    etichetta="Ritirata possibile"
    opzioni={['Sì', 'No']}
    selezionati={filtroRitirata}
    onCambia={setFiltroRitirata}
  />
  <MenuMultiSelezione
    etichetta="Esposizione"
    opzioni={esposizioneDisponibili}
    selezionati={filtroEsposizione}
    onCambia={setFiltroEsposizione}
  />
  <FiltroRange
    etichetta="Lunghezza corda"
    min={30}
    max={80}
    valoreMin={filtroCordaMin}
    valoreMax={filtroCordaMax}
    onCambia={(nuovoMin, nuovoMax) => {
      setFiltroCordaMin(nuovoMin);
      setFiltroCordaMax(nuovoMax);
    }}
    formatta={(v) => `${v}m`}
  />
  <FiltroRange
    etichetta="Avvicinamento"
    min={0}
    max={7}
    step={0.25}
    valoreMin={filtroAvvicinamentoMin}
    valoreMax={filtroAvvicinamentoMax}
    onCambia={(nuovoMin, nuovoMax) => {
      setFiltroAvvicinamentoMin(nuovoMin);
      setFiltroAvvicinamentoMax(nuovoMax);
    }}
    formatta={formattaOre}
  />
  <FiltroRange
    etichetta="Sulla via"
    min={0}
    max={20}
    step={0.25}
    valoreMin={filtroViaMin}
    valoreMax={filtroViaMax}
    onCambia={(nuovoMin, nuovoMax) => {
      setFiltroViaMin(nuovoMin);
      setFiltroViaMax(nuovoMax);
    }}
    formatta={formattaOre}
  />
  <FiltroRange
    etichetta="Allontanamento"
    min={0}
    max={7}
    step={0.25}
    valoreMin={filtroRientroMin}
    valoreMax={filtroRientroMax}
    onCambia={(nuovoMin, nuovoMax) => {
      setFiltroRientroMin(nuovoMin);
      setFiltroRientroMax(nuovoMax);
    }}
    formatta={formattaOre}
  />
</div>
</div>

{filtroZona.length === 0 && filtroDifficolta.length === 0 && ricerca === '' ? null : vieFiltrate.length === 0 ? (
          <p className="nessun-risultato">Nessuna via corrisponde ai filtri scelti.</p>
        ) : (
          <div className="grid">
            {vieFiltrate.map((via) => (
              <Link to={`/via/${via.id}`} className="card" key={via.id}>
                <h3>{via.nome}</h3>
                <p>Zona: {via.zona}</p>
                <p>Difficoltà: {via.difficolta}</p>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function VerificaMfaObbligatoria() {
  const { verificaLivelloSicurezza, logout } = useAuth();
  const [codice, setCodice] = useState('');
  const [errore, setErrore] = useState('');
  const [caricamento, setCaricamento] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setErrore('');
    setCaricamento(true);

    const { data: fattori } = await supabase.auth.mfa.listFactors();
    const factorId = fattori.totp[0].id;

    const { data: challenge, error: erroreChallenge } = await supabase.auth.mfa.challenge({
      factorId,
    });

    if (erroreChallenge) {
      setErrore(erroreChallenge.message);
      setCaricamento(false);
      return;
    }

    const { error: erroreVerifica } = await supabase.auth.mfa.verify({
      factorId,
      challengeId: challenge.id,
      code: codice,
    });

    if (erroreVerifica) {
      setErrore('Codice non valido, riprova.');
      setCaricamento(false);
      return;
    }

    await verificaLivelloSicurezza();
    window.location.href = '/';
  }

  return (
    <div className="app dettaglio">
      <h1>Verifica in due passaggi</h1>
      <p>Inserisci il codice a 6 cifre generato dalla tua app authenticator.</p>

      <form onSubmit={handleSubmit} className="form">
        <input
          type="text"
          placeholder="123456"
          value={codice}
          onChange={(e) => setCodice(e.target.value)}
          maxLength={6}
          required
          autoFocus
        />

        {errore && <p className="errore">{errore}</p>}

        <button type="submit" disabled={caricamento}>
          {caricamento ? 'Verifica in corso...' : 'Verifica'}
        </button>
      </form>

      <button onClick={logout} className="link-button" style={{ marginTop: '15px' }}>
        Esci e accedi con un altro account
      </button>
    </div>
  );
}

function App() {
  const { mfaNonVerificato, caricamento } = useAuth();

  if (caricamento) {
    return <p>Caricamento in corso...</p>;
  }

  if (mfaNonVerificato) {
    return (
      <BrowserRouter>
        <VerificaMfaObbligatoria />
      </BrowserRouter>
    );
  }

return (
    <BrowserRouter>
      <div className="pagina">
        <Routes>
          <Route path="/" element={<ListaVie />} />
          <Route path="/via/:id" element={<ViaDettaglio />} />
          <Route path="/registrati" element={<Registrati />} />
          <Route path="/login" element={<Login />} />
          <Route path="/nuova-via" element={<NuovaVia />} />
          <Route path="/via/:id/modifica" element={<ModificaVia />} />
          <Route path="/profilo" element={<Profilo />} />
          <Route path="/password-dimenticata" element={<PasswordDimenticata />} />
          <Route path="/reimposta-password" element={<ReimpostaPassword />} />
          <Route path="/via/:id/proponi-modifica" element={<ProponiModifica />} />
          <Route path="/pannello-controllo-onbelay" element={<Amministrazione />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/termini" element={<Termini />} />
          <Route path="/sicurezza-account" element={<SicurezzaAccount />} />
        </Routes>
        <Footer />
        <BannerCookie />
      </div>
    </BrowserRouter>
  );
}

export default App;