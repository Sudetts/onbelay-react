import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

function SelettorePosizione({ latitudine, longitudine, onChange }) {
  const mappaRef = useRef(null);
  const markerRef = useRef(null);
  const contenitoreRef = useRef(null);
  const ignoraRicercaRef = useRef(false);
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
      recuperaLocalita(lat, lng);
    });

    mappaRef.current.on('movestart', () => {
      setRisultatiRicerca([]);
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
    setRisultatiRicerca([]);
  }

  async function recuperaLocalita(lat, lng) {
    try {
      const risposta = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10&addressdetails=1`
      );
      const dati = await risposta.json();
      const indirizzo = dati.address || {};

      onChange(lat, lng, {
        nazione: indirizzo.country || '',
        regione: indirizzo.state || '',
        provincia: indirizzo.county || indirizzo.province || indirizzo.state_district || '',
      });
    } catch (err) {
      console.error('Errore nel recupero della località:', err);
      onChange(lat, lng, null);
    }
  }

async function cercaLuogo(testoRicerca) {
    setCercando(true);
    setRisultatiRicerca([]);

    try {
      const risposta = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(testoRicerca)}&limit=5`
      );
      const dati = await risposta.json();
      setRisultatiRicerca(dati);
    } catch (err) {
      console.error('Errore nella ricerca:', err);
    }

    setCercando(false);
  }

  useEffect(() => {
    if (ignoraRicercaRef.current) {
      ignoraRicercaRef.current = false;
      return;
    }

    if (ricerca.trim().length < 3) {
      setRisultatiRicerca([]);
      return;
    }

    const timeoutId = setTimeout(() => {
      cercaLuogo(ricerca);
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [ricerca]);

  function selezionaRisultato(risultato) {
    const lat = parseFloat(risultato.lat);
    const lng = parseFloat(risultato.lon);
    mappaRef.current.setView([lat, lng], 13);
    posizionaMarker(lat, lng);
    ignoraRicercaRef.current = true;
    setRisultatiRicerca([]);
    setRicerca(risultato.display_name);
    recuperaLocalita(lat, lng);
  }

  return (
    <div className="selettore-posizione">
      <div className="contenitore-mappa-selettore">
        <div className="ricerca-posizione ricerca-posizione-overlay">
          <input
            type="text"
            placeholder="Cerca un luogo (es. Arco, Trento)"
            value={ricerca}
            onChange={(e) => setRicerca(e.target.value)}
          />
        </div>

        {risultatiRicerca.length > 0 && (
          <ul className="risultati-ricerca risultati-ricerca-overlay">
            {risultatiRicerca.map((risultato) => (
              <li key={risultato.place_id} onClick={() => selezionaRisultato(risultato)}>
                {risultato.display_name}
              </li>
            ))}
          </ul>
        )}

        <div ref={contenitoreRef} className="mappa-selettore" />
      </div>

      </div>
  );
}

export default SelettorePosizione;