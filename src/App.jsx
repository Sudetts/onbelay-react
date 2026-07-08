import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { supabase } from './supabaseClient';
import ViaDettaglio from './pages/ViaDettaglio';
import './App.css';
import Registrati from './pages/Registrati';
import NuovaVia from './pages/NuovaVia';

function ListaVie() {
  const [vie, setVie] = useState([]);
  const [caricamento, setCaricamento] = useState(true);
  const [filtroZona, setFiltroZona] = useState('');
  const [filtroDifficolta, setFiltroDifficolta] = useState('');

  useEffect(() => {
    async function caricaVie() {
      const { data, error } = await supabase.from('vie').select('*');

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

  // Estrae le zone e difficoltà uniche presenti nei dati, per popolare i menu a tendina
  const zoneDisponibili = [...new Set(vie.map((via) => via.zona))];
  const difficoltaDisponibili = [...new Set(vie.map((via) => via.difficolta))];

  // Applica i filtri scelti dall'utente
  const vieFiltrate = vie.filter((via) => {
    const passaZona = filtroZona === '' || via.zona === filtroZona;
    const passaDifficolta = filtroDifficolta === '' || via.difficolta === filtroDifficolta;
    return passaZona && passaDifficolta;
  });

  return (
    <div className="app">
      <header className="header">
        <h1>Onbelay</h1>
        <p>Vie lunghe di arrampicata: relazioni, foto e tracce GPX</p>
        <Link to="/registrati">Registrati</Link>
        <Link to="/nuova-via">Aggiungi via</Link>
      </header>

      <main className="main">
        <h2>Vie in evidenza</h2>

        <div className="filtri">
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
        <Route path="/nuova-via" element={<NuovaVia />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;