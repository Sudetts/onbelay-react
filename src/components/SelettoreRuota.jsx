import { useRef, useEffect, useState } from 'react';

const ALTEZZA_VOCE = 40;
const VOCI_VISIBILI = 5;
const ALTEZZA_RUOTA = ALTEZZA_VOCE * VOCI_VISIBILI;

function SelettoreRuota({ valori, valoreSelezionato, onCambia }) {
  const contenitoreRef = useRef(null);
  const timeoutRef = useRef(null);
  const [indiceCentrale, setIndiceCentrale] = useState(() => {
    const i = valori.indexOf(valoreSelezionato);
    return i >= 0 ? i : 0;
  });

  useEffect(() => {
    const i = valori.indexOf(valoreSelezionato);
    if (i >= 0 && contenitoreRef.current) {
      contenitoreRef.current.scrollTop = i * ALTEZZA_VOCE;
      setIndiceCentrale(i);
    }
  }, []);

  function gestisciScroll() {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      const scrollTop = contenitoreRef.current.scrollTop;
      const indice = Math.round(scrollTop / ALTEZZA_VOCE);
      const indiceLimitato = Math.max(0, Math.min(indice, valori.length - 1));
      contenitoreRef.current.scrollTo({ top: indiceLimitato * ALTEZZA_VOCE, behavior: 'smooth' });
      setIndiceCentrale(indiceLimitato);
      onCambia(valori[indiceLimitato]);
    }, 120);
  }

  const paddingVerticale = (ALTEZZA_RUOTA - ALTEZZA_VOCE) / 2;

  return (
    <div className="contenitore-ruota" style={{ height: ALTEZZA_RUOTA }}>
      <div className="linee-ruota" style={{ height: ALTEZZA_VOCE, top: paddingVerticale }} />
      <div
        className="lista-ruota"
        ref={contenitoreRef}
        onScroll={gestisciScroll}
        style={{ paddingTop: paddingVerticale, paddingBottom: paddingVerticale }}
      >
        {valori.map((v, i) => (
          <div
            key={v}
            className={`voce-ruota${i === indiceCentrale ? ' voce-ruota-attiva' : ''}`}
            style={{ height: ALTEZZA_VOCE }}
            onClick={() => contenitoreRef.current.scrollTo({ top: i * ALTEZZA_VOCE, behavior: 'smooth' })}
          >
            {v}
          </div>
        ))}
      </div>
    </div>
  );
}

export default SelettoreRuota;