import { useState, useEffect } from 'react';

function SelettoreResidenza({ valoreAttuale, onCambia }) {
  const [ricerca, setRicerca] = useState(valoreAttuale?.nome || '');
  const [risultati, setRisultati] = useState([]);
  const [cercando, setCercando] = useState(false);

  useEffect(() => {
    if (ricerca.trim().length < 3 || ricerca === valoreAttuale?.nome) {
      setRisultati([]);
      return;
    }
    const timeoutId = setTimeout(async () => {
      setCercando(true);
      try {
        const risposta = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(ricerca)}&limit=5`
        );
        const dati = await risposta.json();
        setRisultati(dati);
      } catch {
        // silenzioso: se la ricerca fallisce, l'utente può semplicemente riprovare
      }
      setCercando(false);
    }, 300);
    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ricerca]);

  function seleziona(risultato) {
    setRicerca(risultato.display_name);
    setRisultati([]);
    onCambia({
      lat: parseFloat(risultato.lat),
      lng: parseFloat(risultato.lon),
      nome: risultato.display_name,
    });
  }

  return (
    <div className="selettore-residenza">
      <input
        type="text"
        placeholder="Cerca la tua città (es. Bergamo)"
        value={ricerca}
        onChange={(e) => setRicerca(e.target.value)}
      />
      {cercando && <p className="link-piccolo">Ricerca in corso...</p>}
      {risultati.length > 0 && (
        <ul className="risultati-ricerca">
          {risultati.map((r) => (
            <li key={r.place_id} onClick={() => seleziona(r)}>
              {r.display_name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default SelettoreResidenza;