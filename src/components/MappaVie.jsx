import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet.markercluster';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';

function MappaVie({ vie }) {
  const mappaRef = useRef(null);
  const contenitoreRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!contenitoreRef.current) return;

if (!mappaRef.current) {
      mappaRef.current = L.map(contenitoreRef.current).setView([42.5, 12.5], 6);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(mappaRef.current);
    }

    const gruppoMarker = L.markerClusterGroup();

    const vieConCoordinate = vie.filter((via) => via.latitudine && via.longitudine);

vieConCoordinate.forEach((via) => {
      const marker = L.marker([via.latitudine, via.longitudine]);
      marker.bindPopup(`
        <strong>${via.nome}</strong><br>
        ${via.zona} · ${via.difficolta}<br>
        <a href="#" class="popup-link" data-via-id="${via.id}">Vedi dettagli →</a>
      `);
      gruppoMarker.addLayer(marker);
    });

    mappaRef.current.addLayer(gruppoMarker);

    function gestisciClickPopup(e) {
      const link = e.target.closest('.popup-link');
      if (link) {
        e.preventDefault();
        const viaId = link.getAttribute('data-via-id');
        navigate(`/via/${viaId}`);
      }
    }

    contenitoreRef.current.addEventListener('click', gestisciClickPopup);;

return () => {
      mappaRef.current.removeLayer(gruppoMarker);
      contenitoreRef.current?.removeEventListener('click', gestisciClickPopup);
    };
  }, [vie]);

  return <div ref={contenitoreRef} className="mappa-vie" />;
}

export default MappaVie;