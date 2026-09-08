import { useState, useRef, useEffect } from 'react';
import SelettoreRuota from './SelettoreRuota';

function SelettoreAnnoNascita({ valore, onCambia }) {
  const [aperto, setAperto] = useState(false);
  const contenitoreRef = useRef(null);

  useEffect(() => {
    function gestisciClickFuori(e) {
      if (contenitoreRef.current && !contenitoreRef.current.contains(e.target)) {
        setAperto(false);
      }
    }
    document.addEventListener('mousedown', gestisciClickFuori);
    return () => document.removeEventListener('mousedown', gestisciClickFuori);
  }, []);

  const annoCorrente = new Date().getFullYear();
  const anni = [];
  for (let a = annoCorrente; a >= 1900; a--) anni.push(a);

  return (
    <div className="selettore-con-altro" ref={contenitoreRef}>
      <button
        type="button"
        className={`bottone-selettore-altro${valore ? '' : ' campo-vuoto'}${aperto ? ' aperto' : ''}`}
        onClick={() => setAperto((a) => !a)}
      >
        <span>{valore || 'Inserire anno di nascita'}</span>
        <svg className="freccia-menu-multi" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {aperto && (
        <div className="tendina-selettore-altro tendina-ruota">
          <SelettoreRuota
            valori={anni}
            valoreSelezionato={valore ? Number(valore) : annoCorrente - 25}
            onCambia={onCambia}
          />
        </div>
      )}
    </div>
  );
}

export default SelettoreAnnoNascita;