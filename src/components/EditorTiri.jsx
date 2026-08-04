import { useState } from 'react';

function EditorTiri({ tiri, onChange }) {
  function aggiungiTiro() {
    const nuovoTiro = {
      descrizione: '',
      difficoltaMax: '',
      lunghezza: '',
      gradoMedio: '',
      sosta: '',
      chiodatura: '',
    };
    onChange([...tiri, nuovoTiro]);
  }

  function rimuoviTiro(indice) {
    const nuoviTiri = tiri.filter((_, i) => i !== indice);
    onChange(nuoviTiri);
  }

  function aggiornaCampo(indice, campo, valore) {
    const nuoviTiri = tiri.map((tiro, i) =>
      i === indice ? { ...tiro, [campo]: valore } : tiro
    );
    onChange(nuoviTiri);
  }

  return (
    <div className="editor-tiri">
      {tiri.map((tiro, indice) => (
        <div className="scheda-tiro" key={indice}>
          <div className="scheda-tiro-header">
            <h3>Tiro {indice + 1}</h3>
            <button
              type="button"
              onClick={() => rimuoviTiro(indice)}
              className="link-button"
            >
              Rimuovi
            </button>
          </div>

          <textarea
            placeholder="Descrizione del tiro"
            value={tiro.descrizione}
            onChange={(e) => aggiornaCampo(indice, 'descrizione', e.target.value)}
            rows={2}
            required
          />

          <div className="riga-campi-tiro">
            <input
              type="text"
              placeholder="Difficoltà massima"
              value={tiro.difficoltaMax}
              onChange={(e) => aggiornaCampo(indice, 'difficoltaMax', e.target.value)}
              required
            />
            <input
              type="number"
              placeholder="Lunghezza (m)"
              value={tiro.lunghezza}
              onChange={(e) => aggiornaCampo(indice, 'lunghezza', e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="Grado medio (facoltativo)"
              value={tiro.gradoMedio}
              onChange={(e) => aggiornaCampo(indice, 'gradoMedio', e.target.value)}
            />
          </div>

          <div className="riga-campi-tiro">
            <input
              type="text"
              placeholder="Sosta (facoltativo)"
              value={tiro.sosta}
              onChange={(e) => aggiornaCampo(indice, 'sosta', e.target.value)}
            />
            <input
              type="text"
              placeholder="Chiodatura (facoltativo)"
              value={tiro.chiodatura}
              onChange={(e) => aggiornaCampo(indice, 'chiodatura', e.target.value)}
            />
          </div>
        </div>
      ))}

      <button type="button" onClick={aggiungiTiro} className="btn-aggiungi-tiro">
        + Aggiungi tiro
      </button>
    </div>
  );
}

export default EditorTiri;