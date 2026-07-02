import { useParams, Link } from 'react-router-dom';
import vie from '../data/vie';

function ViaDettaglio() {
  const { id } = useParams();
  const via = vie.find((v) => v.id === Number(id));

  if (!via) {
    return (
      <div className="app">
        <p>Via non trovata.</p>
        <Link to="/">Torna alla lista</Link>
      </div>
    );
  }

  return (
    <div className="app dettaglio">
      <Link to="/">← Torna alla lista</Link>
      <h1>{via.nome}</h1>
      <p>Zona: {via.zona}</p>
      <p>Difficoltà: {via.difficolta}</p>
      <h2>Relazione</h2>
      <p>{via.relazione}</p>
    </div>
  );
}

export default ViaDettaglio;