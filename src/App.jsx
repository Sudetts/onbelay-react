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
import './App.css';


function Intestazione() {
  const { utente, logout } = useAuth();
  const [crediti, setCrediti] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!utente) return;

    supabase
      .from('profili')
      .select('crediti, is_admin')
      .eq('id', utente.id)
      .single()
      .then(({ data }) => {
        setCrediti(data?.crediti);
        setIsAdmin(data?.is_admin || false);
      });
  }, [utente]);

  return (
    <header className="header header-immagine">
      <h1>Onbelay</h1>
      <p>Vie lunghe di arrampicata: relazioni, foto e tracce GPX</p>

      <nav className="nav">
        {utente ? (
          <>
            <span>Ciao, {utente.user_metadata?.nome || utente.email}</span>
              {crediti !== null && <span className="crediti-badge">🪙 {crediti}</span>}
            <Link to="/profilo">Profilo</Link>
            <Link to="/nuova-via">Aggiungi via</Link>
              {isAdmin && <Link to="/pannello-controllo-onbelay" className="link-admin">⚙️ Admin</Link>}
            <button onClick={logout} className="link-button">Esci</button>
          </>
        ) : (
          <>
            <Link to="/login">Accedi</Link>
            <Link to="/registrati">Registrati</Link>
          </>
        )}
      </nav>
    </header>
  );
}

function ListaVie() {
  const [vie, setVie] = useState([]);
  const [caricamento, setCaricamento] = useState(true);
  const [filtroZona, setFiltroZona] = useState('');
  const [filtroDifficolta, setFiltroDifficolta] = useState('');
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
  const passaZona = filtroZona === '' || via.zona === filtroZona;
  const passaDifficolta = filtroDifficolta === '' || via.difficolta === filtroDifficolta;
  const passaRicerca = via.nome.toLowerCase().includes(ricerca.toLowerCase());
  return passaZona && passaDifficolta && passaRicerca;
});

  return (
    <div className="app">
      <Intestazione />

      <main className="main">
        <h2>Vie in evidenza</h2>

<div className="filtri">
  <input
    type="text"
    placeholder="Cerca per nome via..."
    value={ricerca}
    onChange={(e) => setRicerca(e.target.value)}
    className="campo-ricerca"
  />

          <select value={filtroZona} onChange={(e) => setFiltroZona(e.target.value)}>
            <option value="">Tutte le zone</option>
            {zoneDisponibili.map((zona) => (
              <option key={zona} value={zona}>{zona}</option>
            ))}
          </select>

          <select value={filtroDifficolta} onChange={(e) => setFiltroDifficolta(e.target.value)}>
            <option value="">Tutte le difficoltà</option>
            {difficoltaDisponibili.map((difficolta) => (
              <option key={difficolta} value={difficolta}>{difficolta}</option>
            ))}
          </select>
        </div>

        {vieFiltrate.length === 0 ? (
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

function App() {
  return (
    <BrowserRouter>
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
      </Routes>
      <Footer />
      <BannerCookie />
    </BrowserRouter>
  );
}

export default App;