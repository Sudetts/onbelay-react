import { useState, useRef, useEffect } from 'react';

function MenuMultiSelezione({ etichetta, opzioni, selezionati, onCambia, mostraSelezionaTutto = true }) {
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
        className={selezionati.length > 0 ? 'bottone-menu-multi attivo' : 'bottone-menu-multi campo-vuoto'}
        onClick={() => setAperto((a) => !a)}
      >
        {testoBottone} ▾
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