import { Link } from 'react-router-dom';

function Contattaci() {
  return (
    <div className="app dettaglio pannello-scuro">
      <Link to="/" className="link-home">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9.5 12 3l9 6.5" />
          <path d="M5 9v11a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V9" />
        </svg>
        HOME
      </Link>
      <h1>Contattaci</h1>

      <p>
        Hai domande, suggerimenti o hai trovato un problema sul sito? Scrivici pure,
        rispondiamo il prima possibile.
      </p>

      <p>
        <a href="mailto:info@onbelay.it" className="link-piccolo" style={{ fontSize: '1.1rem' }}>
          info@onbelay.it
        </a>
      </p>
    </div>
  );
}

export default Contattaci;