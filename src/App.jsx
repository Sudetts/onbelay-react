import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
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
        <nav className="nav">
          <Link to="/login">Accedi</Link>
          <Link to="/registrati">Registrati</Link>
        </nav>
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

function ListaVie() {
  const [vie, setVie] = useState([]);
  const [caricamento, setCaricamento] = useState(true);
  const [filtroZona, setFiltroZona] = useState([]);
  const [filtroDifficolta, setFiltroDifficolta] = useState([]);
  const [ricerca, setRicerca] = useState('');
  

  useEffect(() => {
    async function caricaVie() {
      const { data, error } = await supabase.from('vie').select('*').eq('stato', 'approvata');
      if (error) {
        console.error('Errore nel caricamento:', error);
      } else {
        setVie(data);
      }
      setCaricamento(false);
    }
    caricaVie();
  }, []);

  if (caricamento) {
    return <p>Caricamento vie in corso...</p>;
  }

  const zoneDisponibili = [...new Set(vie.map((via) => via.zona))];
  const difficoltaDisponibili = [...new Set(vie.map((via) => via.difficolta))];

  const vieFiltrate = vie.filter((via) => {
  const passaZona = filtroZona.length === 0 || filtroZona.includes(via.zona);
  const passaDifficolta = filtroDifficolta.length === 0 || filtroDifficolta.includes(via.difficolta);
  const passaRicerca = via.nome.toLowerCase().includes(ricerca.toLowerCase());
  return passaZona && passaDifficolta && passaRicerca;
});

  return (
    <div className="app">
      <Intestazione />

      <main className="main">
        <h2>Dove vuoi scalare?</h2>

        <MappaVie vie={vieFiltrate} />

<div className="filtri">
  <input
    type="text"
    placeholder="Cerca per nome via..."
    value={ricerca}
    onChange={(e) => setRicerca(e.target.value)}
    className="campo-ricerca"
  />
</div>

<div className="gruppo-filtri">
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
</div>

{filtroZona.length === 0 && filtroDifficolta.length === 0 && ricerca === '' ? null : vieFiltrate.length === 0 ? (
          <p>Nessuna via corrisponde ai filtri scelti.</p>
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
    setCaricamento(false);
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