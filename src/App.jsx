import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import vie from './data/vie';
import ViaDettaglio from './pages/ViaDettaglio';
import './App.css';

function ListaVie() {
  return (
    <div className="app">
      <header className="header">
        <h1>Onbelay</h1>
        <p>Vie lunghe di arrampicata: relazioni, foto e tracce GPX</p>
      </header>

      <main className="main">
        <h2>Vie in evidenza</h2>
        <div className="grid">
          {vie.map((via) => (
            <Link to={`/via/${via.id}`} className="card" key={via.id}>
              <h3>{via.nome}</h3>
              <p>Zona: {via.zona}</p>
              <p>Difficoltà: {via.difficolta}</p>
            </Link>
          ))}
        </div>
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
      </Routes>
    </BrowserRouter>
  );
}

export default App;