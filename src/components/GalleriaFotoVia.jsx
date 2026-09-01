import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../AuthContext';
import Popup from './Popup';
import { ETICHETTE_CATEGORIA } from '../utils/categorieFoto';

function GalleriaFotoVia({ foto, onFotoEliminata, isAdmin }) {
  const { utente } = useAuth();
  const [fotoDaEliminare, setFotoDaEliminare] = useState(null);
  const [fotoIngrandita, setFotoIngrandita] = useState(null);
  const [zoomAttivo, setZoomAttivo] = useState(false);

  function chiudiLightbox() {
    setFotoIngrandita(null);
    setZoomAttivo(false);
  }

  async function eliminaFoto(id) {
    setFotoDaEliminare(null);
    await supabase.from('foto_via').delete().eq('id', id);
    onFotoEliminata(id);
  }

  if (foto.length === 0) {
    return <p className="link-piccolo">Nessuna foto caricata dalla community per questa via.</p>;
  }

  return (
    <div className="griglia-galleria-foto">
      {foto.map((f) => {
        const puoEliminare = utente && (utente.id === f.utente_id || isAdmin);
        return (
                    <figure className="scheda-foto-galleria" key={f.id}>
            <img
              src={f.url}
              alt={f.didascalia}
              className="foto-galleria foto-galleria-cliccabile"
              onClick={() => setFotoIngrandita(f.url)}
            />
            <figcaption>
              <span className="badge-categoria-foto">
                {ETICHETTE_CATEGORIA[f.categoria] || f.categoria}
              </span>
                            <p className="didascalia-foto">{f.didascalia}</p>
              {f.stato === 'in_attesa' && <span className="badge-attesa">In attesa di approvazione</span>}
              {f.stato === 'rifiutata' && <span className="badge-rifiutata">Rifiutata</span>}
              <p className="meta-foto-galleria">
                Caricata da {f.profili?.nome || 'un utente'} il{' '}
                {new Date(f.creato_il).toLocaleDateString('it-IT')}
              </p>
              {puoEliminare && (
                <button
                  type="button"
                  className="link-button"
                  onClick={() => setFotoDaEliminare(f.id)}
                >
                  Elimina
                </button>
              )}
            </figcaption>
          </figure>
        );
      })}

            {fotoDaEliminare && (
        <Popup
          titolo="Elimina foto"
          messaggio="Vuoi eliminare definitivamente questa foto?"
          testoConferma="Elimina"
          pericoloso
          onConferma={() => eliminaFoto(fotoDaEliminare)}
          onAnnulla={() => setFotoDaEliminare(null)}
        />
      )}

      {fotoIngrandita && (
        <div className="overlay-lightbox" onClick={chiudiLightbox}>
          <button type="button" className="btn-chiudi-lightbox" onClick={chiudiLightbox} aria-label="Chiudi">
            ×
          </button>
          <img
            src={fotoIngrandita}
            alt="Foto ingrandita"
            className={`immagine-lightbox${zoomAttivo ? ' zoom-attivo' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              setZoomAttivo((z) => !z);
            }}
          />
        </div>
      )}
    </div>
  );
}

export default GalleriaFotoVia;