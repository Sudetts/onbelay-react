import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet-gpx';
import 'leaflet/dist/leaflet.css';

function MappaGpx({ gpxUrl }) {
  const mappaRef = useRef(null);
  const contenitoreRef = useRef(null);

  useEffect(() => {
    if (!gpxUrl || !contenitoreRef.current) return;

    // Crea la mappa una sola volta
    if (!mappaRef.current) {
      mappaRef.current = L.map(contenitoreRef.current).setView([45.5, 10.5], 6);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(mappaRef.current);
    }

    // Carica e disegna la traccia GPX
    const traccia = new L.GPX(gpxUrl, {
      async: true,
      marker_options: {
        startIconUrl: null,
        endIconUrl: null,
        shadowUrl: null,
      },
    })
      .on('loaded', (e) => {
        mappaRef.current.fitBounds(e.target.getBounds());
      })
      .addTo(mappaRef.current);

    // Pulizia: quando il componente sparisce, rimuovi la mappa
    return () => {
      if (mappaRef.current) {
        mappaRef.current.remove();
        mappaRef.current = null;
      }
    };
  }, [gpxUrl]);

  return <div ref={contenitoreRef} className="mappa-gpx" />;
}

export default MappaGpx;