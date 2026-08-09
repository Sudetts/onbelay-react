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
      mappaRef.current = L.map(contenitoreRef.current);

      const confiniItalia = L.latLngBounds([36.5, 6.0], [47.3, 18.6]);
      mappaRef.current.fitBounds(confiniItalia);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(mappaRef.current);
    }

    const gruppoMarker = L.markerClusterGroup();

    const vieConCoordinate = vie.filter((via) => via.latitudine && via.longitudine);

    // Raggruppa le vie che condividono (più o meno) la stessa posizione,
    // così sulla mappa compare un solo punto anche se ci sono molte vie vicine
    const puntiPerPosizione = {};
    vieConCoordinate.forEach((via) => {
      const chiave = `${via.latitudine.toFixed(4)},${via.longitudine.toFixed(4)}`;
      if (!puntiPerPosizione[chiave]) {
        puntiPerPosizione[chiave] = {
          latitudine: via.latitudine,
          longitudine: via.longitudine,
          vie: [],
        };
      }
      puntiPerPosizione[chiave].vie.push(via);
    });

    Object.values(puntiPerPosizione).forEach((punto) => {
      const marker = L.marker([punto.latitudine, punto.longitudine]);
      const titolo = punto.vie[0].zona || 'Vie in questo punto';
      const listaVie = punto.vie
        .map(
          (via) =>
            `<a href="#" class="popup-link" data-via-id="${via.id}">${via.nome}</a> · ${via.difficolta}`
        )
        .join('<br>');
      marker.bindPopup(`
        <strong>${titolo}</strong><br>
        ${listaVie}
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