const OPZIONI_MINUTI = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];
const OPZIONI_ORE = Array.from({ length: 13 }, (_, i) => i); // 0-12

function SelettoreDurata({ etichetta, minutiTotali, onCambia, obbligatorio = false }) {
  const ore = minutiTotali !== null && minutiTotali !== undefined ? Math.floor(minutiTotali / 60) : '';
  const minuti = minutiTotali !== null && minutiTotali !== undefined ? minutiTotali % 60 : '';

  function aggiornaOre(nuovoValoreOre) {
    const oreNumero = nuovoValoreOre === '' ? 0 : parseInt(nuovoValoreOre, 10);
    const minutiAttuali = minuti === '' ? 0 : minuti;
    onCambia(oreNumero * 60 + minutiAttuali);
  }

  function aggiornaMinuti(nuovoValoreMinuti) {
    const minutiNumero = nuovoValoreMinuti === '' ? 0 : parseInt(nuovoValoreMinuti, 10);
    const oreAttuali = ore === '' ? 0 : ore;
    onCambia(oreAttuali * 60 + minutiNumero);
  }

  return (
    <div className="selettore-durata">
      <label className="etichetta-durata">
        {etichetta}{obbligatorio && '*'}
      </label>
      <div className="banner-durata">
        <select
          value={ore}
          onChange={(e) => aggiornaOre(e.target.value)}
          required={obbligatorio}
        >
          <option value="" disabled hidden>00</option>
          {OPZIONI_ORE.map((h) => (
            <option key={h} value={h}>{String(h).padStart(2, '0')}</option>
          ))}
        </select>
        <span>:</span>
        <select
          value={minuti}
          onChange={(e) => aggiornaMinuti(e.target.value)}
          required={obbligatorio}
        >
          <option value="" disabled hidden>00</option>
          {OPZIONI_MINUTI.map((m) => (
            <option key={m} value={m}>{String(m).padStart(2, '0')}</option>
          ))}
        </select>
      </div>
    </div>
  );
}

export default SelettoreDurata;