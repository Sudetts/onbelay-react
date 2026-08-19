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
        <input
          type="number"
          min="0"
          placeholder="0"
          value={ore}
          onChange={(e) => aggiornaOre(e.target.value)}
          required={obbligatorio}
        />
        <span>h</span>
        <input
          type="number"
          min="0"
          max="59"
          placeholder="0"
          value={minuti}
          onChange={(e) => aggiornaMinuti(e.target.value)}
          required={obbligatorio}
        />
        <span>min</span>
      </div>
    </div>
  );
}

export default SelettoreDurata;