import { useState, useRef, useEffect } from 'react';

function FiltroRange({ etichetta, min, max, step = 1, valoreMin, valoreMax, onCambia, formatta }) {
  const [aperto, setAperto] = useState(false);
  const [modificaMin, setModificaMin] = useState(false);
  const [modificaMax, setModificaMax] = useState(false);
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

  const attivo = valoreMin !== min || valoreMax !== max;
  const formattatore = formatta || ((v) => v);

  function aggiornaMin(nuovoValore) {
    const numero = Math.min(parseFloat(nuovoValore) || 0, valoreMax);
    onCambia(numero, valoreMax);
  }

  function aggiornaMax(nuovoValore) {
    const numero = Math.max(parseFloat(nuovoValore) || 0, valoreMin);
    onCambia(valoreMin, numero);
  }

  return (
    <div className="menu-multi-selezione" ref={contenitoreRef}>
      <button
        type="button"
                className={attivo ? 'bottone-menu-multi bottone-filtro-range attivo' : 'bottone-menu-multi bottone-filtro-range'}
        onClick={() => setAperto((a) => !a)}
      >
        {etichetta}{attivo ? ` (${formattatore(valoreMin)} - ${formattatore(valoreMax)})` : ''} ▾
      </button>

      <div className={`tendina-filtro-range${aperto ? ' tendina-aperta' : ''}`}>
        <div className="valori-filtro-range">
          <input
            type={modificaMin ? 'number' : 'text'}
            inputMode="numeric"
            className="input-valore-range"
            min={min}
            max={max}
            value={modificaMin ? valoreMin : formattatore(valoreMin)}
            onFocus={() => setModificaMin(true)}
            onBlur={() => setModificaMin(false)}
            onChange={(e) => aggiornaMin(e.target.value)}
          />
          <input
            type={modificaMax ? 'number' : 'text'}
            inputMode="numeric"
            className="input-valore-range"
            min={min}
            max={max}
            value={modificaMax ? valoreMax : formattatore(valoreMax)}
            onFocus={() => setModificaMax(true)}
            onBlur={() => setModificaMax(false)}
            onChange={(e) => aggiornaMax(e.target.value)}
          />
        </div>
        <div
          className="doppio-slider"
          style={{
            '--percento-min': `${((valoreMin - min) / (max - min)) * 100}%`,
            '--percento-max': `${((valoreMax - min) / (max - min)) * 100}%`,
          }}
        >
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={valoreMin}
            onChange={(e) => aggiornaMin(e.target.value)}
          />
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={valoreMax}
            onChange={(e) => aggiornaMax(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}

export default FiltroRange;