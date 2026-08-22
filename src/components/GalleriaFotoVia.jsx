import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../AuthContext';
import Popup from './Popup';

const ETICHETTE_CATEGORIA = {
  attacco: 'Attacco',
  tiro: 'Tiro/parete',
  sosta: 'Sosta',
  calata: 'Calata/discesa',
  avvicinamento: 'Avvicinamento',
  panorama: 'Vista panoramica',
  altro: 'Altro',
};

function GalleriaFotoVia({ foto, onFotoEliminata, isAdmin }) {
  const { utente } = useAuth();
  const [fotoDaEliminare, setFotoDaEliminare] = useState(null);

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
            <img src={f.url} alt={f.didascalia} className="foto-galleria" />
            <figcaption>
              <span className="badge-categoria-foto">
                {ETICHETTE_CATEGORIA[f.categoria] || f.categoria}
              </span>
              <p className="didascalia-foto">{f.didascalia}</p>
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
    </div>
  );
}

export default GalleriaFotoVia;