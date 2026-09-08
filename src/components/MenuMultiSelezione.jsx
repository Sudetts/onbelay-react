import { useState, useRef, useEffect } from 'react';

function MenuMultiSelezione({ etichetta, opzioni, selezionati, onCambia, mostraSelezionaTutto = true, obbligatorio = true }) {
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

  const tuttoSelezionato = opzioni.length > 0 && opzioni.every((o) => selezionati.includes(o));

function toggleTutti() {
  if (tuttoSelezionato) {
    onCambia([]);
  } else {
    onCambia([...opzioni]);
  }
}

  function toggleOpzione(valore) {
    if (selezionati.includes(valore)) {
      onCambia(selezionati.filter((v) => v !== valore));
    } else {
      onCambia([...selezionati, valore]);
    }
  }

    const testoBottone =
    selezionati.length === 0
      ? etichetta
      : `${etichetta} (${selezionati.length})`;

  return (
    <div className="menu-multi-selezione" ref={contenitoreRef}>
                  <button
        type="button"
                className={`${
          selezionati.length > 0
            ? 'bottone-menu-multi attivo'
            : obbligatorio
              ? 'bottone-menu-multi campo-vuoto'
              : 'bottone-menu-multi vuoto-facoltativo'
        }${aperto ? ' aperto' : ''}`}
        onClick={() => setAperto((a) => !a)}
      >
                <span>{testoBottone}</span>
        <svg className="freccia-menu-multi" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

                <div className={`tendina-menu-multi${aperto ? ' tendina-aperta' : ''}`}>
          {mostraSelezionaTutto && opzioni.length > 0 && (
            <button type="button" className="voce-seleziona-tutto" onClick={toggleTutti}>
              {tuttoSelezionato ? 'Deseleziona tutto' : 'Seleziona tutto'}
            </button>
          )}
          {opzioni.map((opzione) => (
            <div
              key={opzione}
              className={selezionati.includes(opzione) ? 'voce-menu-multi selezionata' : 'voce-menu-multi'}
              onClick={() => toggleOpzione(opzione)}
            >
              <span>{opzione}</span>
              {selezionati.includes(opzione) && <span className="spunta-menu-multi">✓</span>}
            </div>
          ))}
        </div>
    </div>
  );
}

export default MenuMultiSelezione;