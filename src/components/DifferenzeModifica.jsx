const SEZIONI = [
  {
    titolo: null,
    campi: [
      { chiave: 'nome', etichetta: 'Nome via' },
      { chiave: 'zona', etichetta: 'Zona' },
      { chiave: 'difficolta', etichetta: 'Difficoltà' },
    ],
  },
  {
    titolo: 'Posizione',
    campi: [
      { chiave: 'nazione', etichetta: 'Nazione' },
      { chiave: 'regione', etichetta: 'Regione' },
      { chiave: 'provincia', etichetta: 'Provincia' },
    ],
  },
  {
    titolo: 'Caratteristiche del terreno',
    campi: [
      { chiave: 'quota_inizio', etichetta: 'Quota inizio via (m)' },
      { chiave: 'tipo_roccia', etichetta: 'Tipo di roccia' },
      { chiave: 'sviluppo_totale', etichetta: 'Sviluppo totale (m)' },
      { chiave: 'qualita_roccia', etichetta: 'Qualità della roccia' },
    ],
  },
  {
    titolo: 'Tempistiche',
    campi: [
      { chiave: 'tempo_avvicinamento', etichetta: 'Tempo avvicinamento' },
      { chiave: 'tempo_rientro', etichetta: 'Tempo rientro' },
      { chiave: 'tempo_via', etichetta: 'Tempo sulla via' },
    ],
  },
  {
    titolo: 'Impegno',
    campi: [{ chiave: 'impegno', etichetta: 'Impegno' }],
  },
  {
    titolo: 'Materiale consigliato',
    campi: [
      { chiave: 'tipo_corda', etichetta: 'Tipo corda' },
      { chiave: 'lunghezza_corda', etichetta: 'Lunghezza corda (m)' },
      { chiave: 'protezioni_mobili', etichetta: 'Protezioni mobili', tipo: 'booleano' },
      { chiave: 'tipo_protezioni_mobili', etichetta: 'Quali protezioni' },
      { chiave: 'rinvii_consigliati', etichetta: 'Rinvii consigliati' },
    ],
  },
  {
    titolo: 'Accesso e parcheggio',
    campi: [
      { chiave: 'permessi', etichetta: 'Permessi' },
      { chiave: 'parcheggio', etichetta: 'Parcheggio' },
      { chiave: 'punto_appoggio', etichetta: "Punto d'appoggio" },
    ],
  },
  {
    titolo: 'Sicurezza',
    campi: [
      { chiave: 'possibilita_ritirata', etichetta: 'Possibilità di ritirata', tipo: 'booleano' },
      { chiave: 'copertura_cellulare', etichetta: 'Copertura cellulare' },
      { chiave: 'pericoli_oggettivi', etichetta: 'Pericoli oggettivi' },
    ],
  },
  {
    titolo: 'Esposizione e stagionalità',
    campi: [
      { chiave: 'esposizione', etichetta: 'Esposizione' },
      { chiave: 'mesi_consigliati', etichetta: 'Mesi consigliati' },
    ],
  },
  {
    titolo: 'Storia della via',
    campi: [
      { chiave: 'anno_apertura', etichetta: 'Anno di apertura' },
      { chiave: 'apritori', etichetta: 'Apritori' },
    ],
  },
];

const CAMPI_TIRO = [
  { chiave: 'gradoMedio', etichetta: 'Grado tiro' },
  { chiave: 'difficoltaMax', etichetta: 'Grado obbligato' },
  { chiave: 'lunghezza', etichetta: 'Lunghezza' },
  { chiave: 'descrizione', etichetta: 'Descrizione' },
  { chiave: 'sosta', etichetta: 'Sosta' },
  { chiave: 'chiodatura', etichetta: 'Chiodatura' },
];

function formatta(valore, tipo) {
  if (valore === null || valore === undefined || valore === '') return '—';
  if (tipo === 'booleano') return valore ? 'Sì' : 'No';
  return String(valore);
}

function sonoDiversi(a, b) {
  return String(a ?? '') !== String(b ?? '');
}

function Campo({ via, modifica, chiave, etichetta, tipo, fonte }) {
  const cambiato = sonoDiversi(via[chiave], modifica[chiave]);
  const valore = fonte === 'via' ? via[chiave] : modifica[chiave];
  const classe = cambiato ? (fonte === 'via' ? 'campo-rimosso' : 'campo-aggiunto') : '';

  return (
    <p className={classe}>
      <strong>{etichetta}:</strong> {formatta(valore, tipo)}
    </p>
  );
}

function Media({ via, modifica, chiave, etichetta, fonte }) {
  const cambiato = sonoDiversi(via[chiave], modifica[chiave]);
  const url = fonte === 'via' ? via[chiave] : modifica[chiave];

  if (!url) {
    return cambiato ? <p className="link-piccolo">{etichetta}: (nessuno)</p> : null;
  }

  const classe = cambiato ? `media-confronto ${fonte === 'via' ? 'media-rimossa' : 'media-aggiunta'}` : 'media-confronto';

  return (
    <div>
      <p className="link-piccolo">{etichetta}{cambiato ? (fonte === 'via' ? ' (sostituita)' : ' (nuova)') : ''}</p>
      {chiave.includes('gpx') ? (
        <p className={classe}>Traccia GPX presente</p>
      ) : (
        <img src={url} alt={etichetta} className={`foto-via ${classe}`} />
      )}
    </div>
  );
}

function Tiri({ tiriVia, tiriModifica, fonte }) {
  const max = Math.max(tiriVia.length, tiriModifica.length);
  const righe = [];

  for (let i = 0; i < max; i++) {
    const tiroVia = tiriVia[i];
    const tiroModifica = tiriModifica[i];

    if (fonte === 'via') {
      if (!tiroVia) continue;
      if (!tiroModifica) {
        righe.push(
          <div className="tiro-confronto tiro-rimosso" key={i}>
            <strong>Tiro {i + 1} (rimosso)</strong>
          </div>
        );
        continue;
      }
      righe.push(
        <div className="tiro-confronto" key={i}>
          <strong>Tiro {i + 1}</strong>
          {CAMPI_TIRO.map((campo) => {
            const cambiato = sonoDiversi(tiroVia[campo.chiave], tiroModifica[campo.chiave]);
            return (
              <p key={campo.chiave} className={cambiato ? 'campo-rimosso' : ''}>
                {campo.etichetta}: {formatta(tiroVia[campo.chiave])}
              </p>
            );
          })}
        </div>
      );
    } else {
      if (!tiroModifica) continue;
      if (!tiroVia) {
        righe.push(
          <div className="tiro-confronto tiro-aggiunto" key={i}>
            <strong>Tiro {i + 1} (nuovo)</strong>
            {CAMPI_TIRO.map((campo) => (
              <p key={campo.chiave}>{campo.etichetta}: {formatta(tiroModifica[campo.chiave])}</p>
            ))}
          </div>
        );
        continue;
      }
      righe.push(
        <div className="tiro-confronto" key={i}>
          <strong>Tiro {i + 1}</strong>
          {CAMPI_TIRO.map((campo) => {
            const cambiato = sonoDiversi(tiroVia[campo.chiave], tiroModifica[campo.chiave]);
            return (
              <p key={campo.chiave} className={cambiato ? 'campo-aggiunto' : ''}>
                {campo.etichetta}: {formatta(tiroModifica[campo.chiave])}
              </p>
            );
          })}
        </div>
      );
    }
  }

  return righe.length > 0 ? righe : <p className="link-piccolo">Nessun tiro</p>;
}

function Colonna({ via, modifica, fonte }) {
  const tiriVia = via.tiri || [];
  const tiriModifica = modifica.tiri || [];

  return (
    <div className="colonna-confronto">
      <h3>{fonte === 'via' ? 'Via attuale' : 'Proposta'}</h3>

      {SEZIONI.map((sezione, indice) => (
        <div key={indice}>
          {sezione.titolo && <h4 className="titolo-sezione-confronto">{sezione.titolo}</h4>}
          {sezione.campi.map((campo) => (
            <Campo key={campo.chiave} via={via} modifica={modifica} fonte={fonte} {...campo} />
          ))}
        </div>
      ))}

      <h4 className="titolo-sezione-confronto">Avvicinamento</h4>
      <Campo via={via} modifica={modifica} fonte={fonte} chiave="avvicinamento_descrizione" etichetta="Descrizione" />
      <Media via={via} modifica={modifica} fonte={fonte} chiave="avvicinamento_foto_url" etichetta="Foto avvicinamento" />
      <Media via={via} modifica={modifica} fonte={fonte} chiave="avvicinamento_gpx_url" etichetta="GPX avvicinamento" />

      <h4 className="titolo-sezione-confronto">Via</h4>
      <Campo via={via} modifica={modifica} fonte={fonte} chiave="descrizione_via" etichetta="Descrizione" />
      <Media via={via} modifica={modifica} fonte={fonte} chiave="diagramma_url" etichetta="Topo della via" />
      <Tiri tiriVia={tiriVia} tiriModifica={tiriModifica} fonte={fonte} />

      <h4 className="titolo-sezione-confronto">Allontanamento</h4>
      <Campo via={via} modifica={modifica} fonte={fonte} chiave="allontanamento_descrizione" etichetta="Descrizione" />
      <Media via={via} modifica={modifica} fonte={fonte} chiave="allontanamento_foto_url" etichetta="Foto allontanamento" />
      <Media via={via} modifica={modifica} fonte={fonte} chiave="allontanamento_gpx_url" etichetta="GPX allontanamento" />
    </div>
  );
}

function DifferenzeModifica({ via, modifica }) {
  if (!via) {
    return <p className="link-piccolo">Impossibile confrontare: via originale non trovata.</p>;
  }

  return (
    <div className="confronto-modifica">
      <Colonna via={via} modifica={modifica} fonte="via" />
      <Colonna via={via} modifica={modifica} fonte="modifica" />
    </div>
  );
}

export default DifferenzeModifica;