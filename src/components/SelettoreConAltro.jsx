import { useState, useRef, useEffect } from 'react';

function SelettoreConAltro({ placeholder, opzioni, valore, onCambia, obbligatorio = false, mostraAltro = true }) {
  const [aperto, setAperto] = useState(false);
  const [modalitaAltro, setModalitaAltro] = useState(false);
  const contenitoreRef = useRef(null);

  useEffect(() => {
    function gestisciClickFuori(e) {
      if (contenitoreRef.current && !contenitoreRef.current.contains(e.target)) {
        chiudiTendina();
      }
    }
    document.addEventListener('mousedown', gestisciClickFuori);
    return () => document.removeEventListener('mousedown', gestisciClickFuori);
  }, []);

  const valoriFissi = opzioni.map((o) => o.value);
  const eValoreLibero = valore !== '' && !valoriFissi.includes(valore);

  function chiudiTendina() {
    setAperto(false);
    setModalitaAltro(false);
  }

  function toggleTendina() {
    if (aperto) {
      chiudiTendina();
    } else {
      setAperto(true);
      if (eValoreLibero) setModalitaAltro(true);
    }
  }

  function selezionaOpzione(valoreOpzione) {
    onCambia(valoreOpzione);
    chiudiTendina();
  }

  function attivaAltro() {
    setModalitaAltro(true);
    onCambia('');
  }

  const inModalitaAltro = modalitaAltro || eValoreLibero;

  return (
    <div className="selettore-con-altro" ref={contenitoreRef}>
      <button
        type="button"
        className={
          valore
            ? 'bottone-selettore-altro'
            : `bottone-selettore-altro campo-vuoto${obbligatorio ? ' obbligatorio' : ''}`
        }
        onClick={toggleTendina}
      >
        {valore || placeholder} ▾
      </button>

      {aperto && (
        <div className="tendina-selettore-altro">
          {opzioni.map((opzione) => (
            <div
              key={opzione.value}
              className="voce-selettore-altro"
              onClick={() => selezionaOpzione(opzione.value)}
            >
              {opzione.label}
            </div>
          ))}

          {mostraAltro && (
            inModalitaAltro ? (
              <input
                type="text"
                autoFocus
                placeholder="Specifica..."
                value={valore}
                onChange={(e) => onCambia(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    chiudiTendina();
                  }
                }}
                className="input-voce-altro"
              />
            ) : (
              <div
                className="voce-selettore-altro voce-altro"
                onClick={attivaAltro}
              >
                Altro (specifica)
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}

export default SelettoreConAltro;