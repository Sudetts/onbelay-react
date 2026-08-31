import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

function generaGpx(punti, nomeTraccia) {
  const trkpts = punti
    .map((p) => `      <trkpt lat="${p.lat}" lon="${p.lng}"></trkpt>`)
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="Onbelay" xmlns="http://www.topografix.com/GPX/1/1">
  <trk>
    <name>${nomeTraccia}</name>
    <trkseg>
${trkpts}
    </trkseg>
  </trk>
</gpx>`;
}

function DisegnaTracciaGpx({ titolo, nomeFile, centroIniziale, onConferma, onAnnulla }) {
  const mappaRef = useRef(null);
  const contenitoreRef = useRef(null);
  const lineaRef = useRef(null);
  const markerLayerRef = useRef(null);
  const [punti, setPunti] = useState([]);

  useEffect(() => {
    if (!contenitoreRef.current || mappaRef.current) return;

    const posizione = centroIniziale || [45.5, 10.5];
    const zoom = centroIniziale ? 14 : 6;

    mappaRef.current = L.map(contenitoreRef.current).setView(posizione, zoom);

    L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
      attribution: 'Map data: &copy; OpenStreetMap contributors, SRTM | Map style: &copy; OpenTopoMap',
      maxZoom: 17,
    }).addTo(mappaRef.current);

    lineaRef.current = L.polyline([], { color: '#8C3320', weight: 4 }).addTo(mappaRef.current);
    markerLayerRef.current = L.layerGroup().addTo(mappaRef.current);

    mappaRef.current.on('click', (e) => {
      setPunti((prev) => [...prev, { lat: e.latlng.lat, lng: e.latlng.lng }]);
    });

    setTimeout(() => mappaRef.current.invalidateSize(), 100);

    return () => {
      mappaRef.current.remove();
      mappaRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!mappaRef.current) return;

    const latlngs = punti.map((p) => [p.lat, p.lng]);
    lineaRef.current.setLatLngs(latlngs);

    markerLayerRef.current.clearLayers();
    punti.forEach((p, indice) => {
      L.circleMarker([p.lat, p.lng], {
        radius: 5,
        color: '#8C3320',
        fillColor: '#fff',
        fillOpacity: 1,
        weight: 2,
      })
        .bindTooltip(String(indice + 1))
        .addTo(markerLayerRef.current);
    });
  }, [punti]);

  function annullaUltimoPunto() {
    setPunti((prev) => prev.slice(0, -1));
  }

  function cancellaTutto() {
    setPunti([]);
  }

  function confermaTraccia() {
    if (punti.length < 2) return;
    const xml = generaGpx(punti, nomeFile);
    const blob = new Blob([xml], { type: 'application/gpx+xml' });
    const file = new File([blob], `${nomeFile}.gpx`, { type: 'application/gpx+xml' });
    onConferma(file);
  }

  const lunghezzaKm = (() => {
    if (punti.length < 2) return 0;
    let metri = 0;
    for (let i = 1; i < punti.length; i++) {
      metri += L.latLng(punti[i - 1].lat, punti[i - 1].lng).distanceTo(
        L.latLng(punti[i].lat, punti[i].lng)
      );
    }
    return (metri / 1000).toFixed(2);
  })();

  return (
    <div className="overlay-popup" onClick={onAnnulla}>
      <div className="finestra-popup finestra-popup-mappa" onClick={(e) => e.stopPropagation()}>
        <h3>{titolo}</h3>
        <p className="link-piccolo">
          Clicca sulla mappa per aggiungere punti al tracciato, nell'ordine in cui vanno percorsi.
          {punti.length > 0 && ` ${punti.length} punti · ${lunghezzaKm} km`}
        </p>

        <div ref={contenitoreRef} className="mappa-disegno-gpx" />

        <div className="azioni-disegno-gpx">
          <button type="button" onClick={annullaUltimoPunto} disabled={punti.length === 0} className="btn-popup-annulla">
            Annulla ultimo punto
          </button>
          <button type="button" onClick={cancellaTutto} disabled={punti.length === 0} className="btn-popup-annulla">
            Cancella tutto
          </button>
        </div>

        <div className="azioni-popup">
          <button type="button" onClick={onAnnulla} className="btn-popup-annulla">
            Annulla
          </button>
          <button
            type="button"
            onClick={confermaTraccia}
            className="btn-popup-conferma"
            disabled={punti.length < 2}
          >
            Usa questo tracciato
          </button>
        </div>
      </div>
    </div>
  );
}

export default DisegnaTracciaGpx;