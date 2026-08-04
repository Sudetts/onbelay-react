import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

function SelettorePosizione({ latitudine, longitudine, onChange }) {
  const mappaRef = useRef(null);
  const markerRef = useRef(null);
  const contenitoreRef = useRef(null);
  const [ricerca, setRicerca] = useState('');
  const [risultatiRicerca, setRisultatiRicerca] = useState([]);
  const [cercando, setCercando] = useState(false);

  useEffect(() => {
    if (!contenitoreRef.current || mappaRef.current) return;

    const posizioneIniziale = latitudine && longitudine ? [latitudine, longitudine] : [42.5, 12.5];
    const zoomIniziale = latitudine && longitudine ? 13 : 6;

    mappaRef.current = L.map(contenitoreRef.current).setView(posizioneIniziale, zoomIniziale);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(mappaRef.current);

    if (latitudine && longitudine) {
      markerRef.current = L.marker([latitudine, longitudine]).addTo(mappaRef.current);
    }

    mappaRef.current.on('click', (e) => {
      const { lat, lng } = e.latlng;
      posizionaMarker(lat, lng);
      onChange(lat, lng);
    });

    return () => {
      mappaRef.current.remove();
      mappaRef.current = null;
    };
  }, []);

  function posizionaMarker(lat, lng) {
    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lng]);
    } else {
      markerRef.current = L.marker([lat, lng]).addTo(mappaRef.current);
    }
  }

async function cercaLuogo(e) {
    if (e) e.preventDefault();
    if (!ricerca.trim()) return;

    setCercando(true);
    setRisultatiRicerca([]);

    try {
      const risposta = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(ricerca)}&limit=5`
      );
      const dati = await risposta.json();
      setRisultatiRicerca(dati);
    } catch (err) {
      console.error('Errore nella ricerca:', err);
    }

    setCercando(false);
  }

  function selezionaRisultato(risultato) {
    const lat = parseFloat(risultato.lat);
    const lng = parseFloat(risultato.lon);
    mappaRef.current.setView([lat, lng], 13);
    setRisultatiRicerca([]);
    setRicerca(risultato.display_name);
  }

  return (
    <div className="selettore-posizione">
<div className="ricerca-posizione">
        <input
          type="text"
          placeholder="Cerca un luogo (es. Arco, Trento)"
          value={ricerca}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              cercaLuogo();
            }
          }}
          onChange={(e) => setRicerca(e.target.value)}
        />
        <button type="button" onClick={() => cercaLuogo()} disabled={cercando}>
          {cercando ? 'Cerco...' : 'Cerca'}
        </button>
      </div>

      {risultatiRicerca.length > 0 && (
        <ul className="risultati-ricerca">
          {risultatiRicerca.map((risultato) => (
            <li key={risultato.place_id} onClick={() => selezionaRisultato(risultato)}>
              {risultato.display_name}
            </li>
          ))}
        </ul>
      )}

      <p className="link-piccolo">Clicca sulla mappa nel punto esatto della via.</p>
      <div ref={contenitoreRef} className="mappa-selettore" />

      {latitudine && longitudine && (
        <p className="link-piccolo">
          Coordinate selezionate: {latitudine.toFixed(5)}, {longitudine.toFixed(5)}
        </p>
      )}
    </div>
  );
}

export default SelettorePosizione;