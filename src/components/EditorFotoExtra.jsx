import { useState } from 'react';
import { OPZIONI_CATEGORIA } from '../utils/categorieFoto';

let contatoreIdLocale = 0;

function EditorFotoExtra({ fotoExtra, onChange }) {
  function aggiungiFoto() {
    contatoreIdLocale += 1;
    onChange([
      ...fotoExtra,
      { idLocale: contatoreIdLocale, file: null, anteprima: null, categoria: '', didascalia: '' },
    ]);
  }

  function rimuoviFoto(idLocale) {
    onChange(fotoExtra.filter((f) => f.idLocale !== idLocale));
  }

  function aggiornaCampo(idLocale, campo, valore) {
    onChange(fotoExtra.map((f) => (f.idLocale === idLocale ? { ...f, [campo]: valore } : f)));
  }

  function gestisciFile(idLocale, file) {
    if (!file) return;
    const anteprima = URL.createObjectURL(file);
    onChange(fotoExtra.map((f) => (f.idLocale === idLocale ? { ...f, file, anteprima } : f)));
  }

  return (
    <div className="editor-foto-extra">
      {fotoExtra.map((f) => (
        <div className="scheda-foto-extra" key={f.idLocale}>
          <div className="scheda-foto-extra-riga">
            {f.anteprima ? (
              <img src={f.anteprima} alt="Anteprima" className="anteprima-foto-extra" />
            ) : (
                            <label className="input-file-foto-extra">
                <span className="icona-piu-foto-extra">+</span>
                <span>Aggiungi foto</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => gestisciFile(f.idLocale, e.target.files[0])}
                />
              </label>
            )}

            <div className="scheda-foto-extra-campi">
              <select
                value={f.categoria}
                onChange={(e) => aggiornaCampo(f.idLocale, 'categoria', e.target.value)}
                className={f.categoria === '' ? 'campo-vuoto' : ''}
              >
                <option value="" disabled hidden>Cosa mostra la foto?</option>
                {OPZIONI_CATEGORIA.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              <textarea
                placeholder='Didascalia (es. "Attacco a sinistra del masso")'
                value={f.didascalia}
                onChange={(e) => aggiornaCampo(f.idLocale, 'didascalia', e.target.value)}
                rows={2}
                maxLength={200}
              />
            </div>

            <button type="button" className="link-button" onClick={() => rimuoviFoto(f.idLocale)}>
              Rimuovi
            </button>
          </div>
        </div>
      ))}

      <button type="button" onClick={aggiungiFoto} className="btn-aggiungi-tiro">
        + Aggiungi foto (facoltativo)
      </button>
    </div>
  );
}

// Ogni riga aggiunta deve essere completa; il blocco nel suo insieme resta facoltativo (0 righe = ok).
export function fotoExtraSonoValide(fotoExtra) {
  return fotoExtra.every((f) => f.file && f.categoria && f.didascalia.trim().length >= 5);
}

export default EditorFotoExtra;