import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useAuth } from '../AuthContext';
import { comprimiImmagine } from '../utils/comprimiImmagine';
import EditorTiri from '../components/EditorTiri';
import SelettorePosizione from '../components/SelettorePosizione';
import MenuMultiSelezione from '../components/MenuMultiSelezione';
import SelettoreConAltro from '../components/SelettoreConAltro';

const OPZIONI_ESPOSIZIONE = ['Nord', 'Nord-Est', 'Est', 'Sud-Est', 'Sud', 'Sud-Ovest', 'Ovest', 'Nord-Ovest'];
const OPZIONI_MESI = ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'];
const OPZIONI_TIPO_ROCCIA = ['Calcare', 'Granito', 'Dolomia', 'Gneiss', 'Arenaria', 'Porfido', 'Basalto', 'Serpentino'];
const OPZIONI_QUALITA_ROCCIA = ['Ottima', 'Buona', 'Discreta', 'Scarsa'];
const OPZIONI_TIPO_CORDA = ['Singola', 'Doppia', 'Mezze corde'];
const OPZIONI_COPERTURA_CELLULARE = ['Buona', 'Parziale', 'Assente', 'Non verificata'];
const OPZIONI_IMPEGNO = [
  { value: 'F', label: 'F - Facile' },
  { value: 'PD', label: 'PD - Poco difficile' },
  { value: 'AD', label: 'AD - Abbastanza difficile' },
  { value: 'D', label: 'D - Difficile' },
  { value: 'TD', label: 'TD - Molto difficile' },
  { value: 'ED', label: 'ED - Estremamente difficile' },
  { value: 'EX', label: 'EX - Eccezionalmente difficile' },
];


function NuovaVia() {
  const { utente } = useAuth();
  const [nome, setNome] = useState('');
  const [zona, setZona] = useState('');
  const [difficolta, setDifficolta] = useState('');

  const [svilupploTotale, setSviluppoTotale] = useState('');
  const [quotaInizio, setQuotaInizio] = useState('');
  const [tempoAvvicinamento, setTempoAvvicinamento] = useState('');
  const [tempoVia, setTempoVia] = useState('');
  const [tempoRientro, setTempoRientro] = useState('');
  const [tipoRoccia, setTipoRoccia] = useState('');
  const [qualitaRoccia, setQualitaRoccia] = useState('');

  const [impegno, setImpegno] = useState('');

  const [tipoCorda, setTipoCorda] = useState('');
  const [lunghezzaCorda, setLunghezzaCorda] = useState('');
  const [protezioniMobili, setProtezioniMobili] = useState('');
  const [tipoProtezioniMobili, setTipoProtezioniMobili] = useState('');
  const [rinviiConsigliati, setRinviiConsigliati] = useState('');

  const [annoApertura, setAnnoApertura] = useState('');
  const [apritori, setApritori] = useState('');

  const [permessi, setPermessi] = useState('');
  const [parcheggio, setParcheggio] = useState('');
  const [puntoAppoggio, setPuntoAppoggio] = useState('');

  const [coperturaCellulare, setCoperturaCellulare] = useState('');
  const [possibilitaRitirata, setPossibilitaRitirata] = useState('');
  const [pericoliOggettivi, setPericoliOggettivi] = useState('');

  const [esposizioneSelezionata, setEsposizioneSelezionata] = useState([]);
  const [mesiSelezionati, setMesiSelezionati] = useState([]);

  const [avvicinamentoDescrizione, setAvvicinamentoDescrizione] = useState('');
  const [avvicinamentoFoto, setAvvicinamentoFoto] = useState(null);
  const [avvicinamentoGpx, setAvvicinamentoGpx] = useState(null);

  const [descrizioneVia, setDescrizioneVia] = useState('');
  const [diagrammaFile, setDiagrammaFile] = useState(null);

  const [allontanamentoDescrizione, setAllontanamentoDescrizione] = useState('');
  const [allontanamentoFoto, setAllontanamentoFoto] = useState(null);
  const [allontanamentoGpx, setAllontanamentoGpx] = useState(null);

  const [errore, setErrore] = useState('');
  const [caricamento, setCaricamento] = useState(false);
  const navigate = useNavigate();

  const [latitudine, setLatitudine] = useState(null);
  const [longitudine, setLongitudine] = useState(null);
  const [nazione, setNazione] = useState('Italia');
  const [regione, setRegione] = useState('');
  const [provincia, setProvincia] = useState('');

  const [tiri, setTiri] = useState([]);

async function caricaFile(file, bucket) {
  if (!file) return null;
  const fileFinale = await comprimiImmagine(file);
  const nomeFile = `${utente.id}/${Date.now()}-${fileFinale.name}`;
  const { error } = await supabase.storage.from(bucket).upload(nomeFile, fileFinale);
  if (error) throw new Error(error.message);
  const { data } = supabase.storage.from(bucket).getPublicUrl(nomeFile);
  return data.publicUrl;
}

async function handleSubmit(e) {
    e.preventDefault();
    setErrore('');

if (esposizioneSelezionata.length === 0) {
      setErrore('Seleziona almeno un\'esposizione.');
      return;
    }

if (mesiSelezionati.length === 0) {
      setErrore('Seleziona almeno un mese consigliato.');
      return;
    }

if (!tipoRoccia) {
      setErrore('Seleziona il tipo di roccia.');
      return;
    }

    if (!tipoCorda) {
      setErrore('Seleziona il tipo di corda.');
      return;
    }

//    if (!avvicinamentoFoto && !avvicinamentoGpx) {
//     setErrore('Per l\'avvicinamento serve almeno una foto o una traccia GPX.');
//      return;
//    }

//    if (!allontanamentoFoto && !allontanamentoGpx) {
//      setErrore('Per l\'allontanamento serve almeno una foto o una traccia GPX.');
//      return;
//    }

    setCaricamento(true);

    try {
      const avvicinamentoFotoUrl = await caricaFile(avvicinamentoFoto, 'foto-vie');
      const avvicinamentoGpxUrl = await caricaFile(avvicinamentoGpx, 'gpx-vie');
      const diagrammaUrl = await caricaFile(diagrammaFile, 'foto-vie');
      const allontanamentoFotoUrl = await caricaFile(allontanamentoFoto, 'foto-vie');
      const allontanamentoGpxUrl = await caricaFile(allontanamentoGpx, 'gpx-vie');

      const { error } = await supabase.from('vie').insert({
        nome,
        zona,
        difficolta,
        autore_id: utente.id,
        latitudine,
        longitudine,
        nazione,
        regione,
        provincia,
        sviluppo_totale: svilupploTotale || null,
        quota_inizio: quotaInizio || null,
        tempo_avvicinamento: tempoAvvicinamento,
        tempo_via: tempoVia,
        tempo_rientro: tempoRientro,
        tipo_roccia: tipoRoccia,
        qualita_roccia: qualitaRoccia,
        impegno,
        tipo_corda: tipoCorda,
        lunghezza_corda: lunghezzaCorda || null,
        protezioni_mobili: protezioniMobili === '' ? null : protezioniMobili === 'si',
        tipo_protezioni_mobili: tipoProtezioniMobili || null,
        rinvii_consigliati: rinviiConsigliati || null,
        anno_apertura: annoApertura || null,
        apritori,
        permessi,
        parcheggio,
        punto_appoggio: puntoAppoggio,
        copertura_cellulare: coperturaCellulare,
        possibilita_ritirata: possibilitaRitirata === '' ? null : possibilitaRitirata === 'si',
        pericoli_oggettivi: pericoliOggettivi,
        esposizione: esposizioneSelezionata.join(', '),
        mesi_consigliati: mesiSelezionati.join(', '),
        tiri,
        numero_tiri: tiri.length,
        avvicinamento_descrizione: avvicinamentoDescrizione,
        avvicinamento_foto_url: avvicinamentoFotoUrl,
        avvicinamento_gpx_url: avvicinamentoGpxUrl,
        descrizione_via: descrizioneVia,
        diagramma_url: diagrammaUrl,
        allontanamento_descrizione: allontanamentoDescrizione,
        allontanamento_foto_url: allontanamentoFotoUrl,
        allontanamento_gpx_url: allontanamentoGpxUrl,
      });

      if (error) throw new Error(error.message);

      setCaricamento(false);
      navigate('/');
    } catch (err) {
      setErrore(err.message);
      setCaricamento(false);
    }
  }
  if (!utente) {
    return (
      <div className="app dettaglio">
        <p>Devi accedere per aggiungere una via.</p>
        <Link to="/login">Vai al login</Link>
      </div>
    );
  }

return (<div className="app dettaglio pannello-scuro dettaglio-largo">
    
      <Link to="/profilo" className="link-home">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="8" r="4" />
          <path d="M4 20c0-4.4 3.6-8 8-8s8 3.6 8 8" />
        </svg>
        PROFILO
      </Link>
      <h1>Aggiungi una via</h1>
      <p className="legenda-obbligatori"><strong>*</strong> campi obbligatori</p>

      <form onSubmit={handleSubmit} className="form">
        <input
          type="text"
          placeholder="Nome via *"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          required
          minLength={3}
          maxLength={60}
        />

        <h2 className="titolo-sezione">Posizione via</h2>
        <SelettorePosizione
          latitudine={latitudine}
          longitudine={longitudine}
          onChange={(lat, lng, localita) => {
            setLatitudine(lat);
            setLongitudine(lng);
            if (localita) {
              if (localita.nazione) setNazione(localita.nazione);
              if (localita.regione) setRegione(localita.regione);
              if (localita.provincia) setProvincia(localita.provincia);
            }
          }}
        />

        <input
          type="text"
          placeholder="Nazione *"
          value={nazione}
          onChange={(e) => setNazione(e.target.value)}
          required
          maxLength={60}
        />
        <input
          type="text"
          placeholder="Regione *"
          value={regione}
          onChange={(e) => setRegione(e.target.value)}
          required
          maxLength={60}
        />
        <input
          type="text"
          placeholder="Provincia *"
          value={provincia}
          onChange={(e) => setProvincia(e.target.value)}
          required
          maxLength={60}
        />

        <input
          type="text"
          placeholder="Zona (es. Dolomiti, Alpi Apuane) - opzionale"
          value={zona}
          onChange={(e) => setZona(e.target.value)}
          maxLength={60}
        />

        <h2 className="titolo-sezione">Caratteristiche del terreno</h2>
        <input type="number" placeholder="Quota inizio via (m) *" value={quotaInizio} onChange={(e) => setQuotaInizio(e.target.value)} required />
        <SelettoreConAltro
          placeholder="Tipo di roccia *"
          opzioni={OPZIONI_TIPO_ROCCIA.map((v) => ({ value: v, label: v }))}
          valore={tipoRoccia}
          onCambia={setTipoRoccia}
          obbligatorio
        />
        <input type="number" placeholder="Sviluppo totale (m)" value={svilupploTotale} onChange={(e) => setSviluppoTotale(e.target.value)} />
        <SelettoreConAltro
          placeholder="Qualità della roccia (facoltativo)"
          opzioni={OPZIONI_QUALITA_ROCCIA.map((v) => ({ value: v, label: v }))}
          valore={qualitaRoccia}
          onCambia={setQualitaRoccia}
        />

        <h2 className="titolo-sezione">Tempistiche</h2>
        <input type="text" placeholder="Tempo avvicinamento (es. 45 min) *" value={tempoAvvicinamento} onChange={(e) => setTempoAvvicinamento(e.target.value)} required />
        <input type="text" placeholder="Tempo rientro (es. 30 min) *" value={tempoRientro} onChange={(e) => setTempoRientro(e.target.value)} required />
        <input type="text" placeholder="Tempo sulla via (es. 3-4 ore)" value={tempoVia} onChange={(e) => setTempoVia(e.target.value)} />

        <h2 className="titolo-sezione">Difficoltà e impegno</h2>
        <input
          type="text"
          placeholder="Difficoltà (es. 6a, oppure D+/TD in scala alpinistica) *"
          value={difficolta}
          onChange={(e) => setDifficolta(e.target.value)}
          required
          maxLength={15}
        />
        <SelettoreConAltro
          placeholder="Impegno (facoltativo)"
          opzioni={OPZIONI_IMPEGNO}
          valore={impegno}
          onCambia={setImpegno}
        />

        <h2 className="titolo-sezione">Materiale consigliato</h2>
        <SelettoreConAltro
          placeholder="Tipo corda *"
          opzioni={OPZIONI_TIPO_CORDA.map((v) => ({ value: v, label: v }))}
          valore={tipoCorda}
          onCambia={setTipoCorda}
          obbligatorio
          mostraAltro={false}
        />
        <input type="number" placeholder="Lunghezza corda consigliata (m) *" value={lunghezzaCorda} onChange={(e) => setLunghezzaCorda(e.target.value)} required />
        <select
          value={protezioniMobili}
          onChange={(e) => setProtezioniMobili(e.target.value)}
          className={protezioniMobili === '' ? 'campo-vuoto' : ''}
        >
          <option value="" disabled hidden>Indica se servono protezioni mobili oppure non necessarie</option>
          <option value="no">Non necessarie</option>
          <option value="si">Servono protezioni mobili</option>
        </select>

        {protezioniMobili === 'si' && (
          <input
            type="text"
            placeholder="Quali protezioni mobili servono (es. friend fino a #3, nut piccoli)"
            value={tipoProtezioniMobili}
            onChange={(e) => setTipoProtezioniMobili(e.target.value)}
          />
        )}
        <input type="number" placeholder="Numero di rinvii consigliati" value={rinviiConsigliati} onChange={(e) => setRinviiConsigliati(e.target.value)} />

        <h2 className="titolo-sezione">Accesso e parcheggio</h2>
        <input type="text" placeholder="Permessi/autorizzazioni necessarie *" value={permessi} onChange={(e) => setPermessi(e.target.value)} required />
        <input type="text" placeholder="Parcheggio (gratuito/a pagamento, capienza)" value={parcheggio} onChange={(e) => setParcheggio(e.target.value)} />
        <input type="text" placeholder="Punto d'appoggio più vicino" value={puntoAppoggio} onChange={(e) => setPuntoAppoggio(e.target.value)} />

        <h2 className="titolo-sezione">Sicurezza</h2>
        <select
          value={possibilitaRitirata}
          onChange={(e) => setPossibilitaRitirata(e.target.value)}
          className={possibilitaRitirata === '' ? 'campo-vuoto' : ''}
          required
        >
          <option value="" disabled hidden>Indica se è possibile ritirarsi a metà via *</option>
          <option value="no">Non è possibile ritirarsi a metà via</option>
          <option value="si">È possibile ritirarsi a metà via</option>
        </select>
        <SelettoreConAltro
          placeholder="Copertura cellulare (facoltativo)"
          opzioni={OPZIONI_COPERTURA_CELLULARE.map((v) => ({ value: v, label: v }))}
          valore={coperturaCellulare}
          onCambia={setCoperturaCellulare}
        />
        <textarea placeholder="Pericoli oggettivi" value={pericoliOggettivi} onChange={(e) => setPericoliOggettivi(e.target.value)} rows={3} maxLength={1000} />

        <h2 className="titolo-sezione">Esposizione e stagionalità</h2>
        <MenuMultiSelezione
          etichetta="Esposizione *"
          opzioni={OPZIONI_ESPOSIZIONE}
          selezionati={esposizioneSelezionata}
          onCambia={setEsposizioneSelezionata}
        />
        <MenuMultiSelezione
          etichetta="Mesi consigliati *"
          opzioni={OPZIONI_MESI}
          selezionati={mesiSelezionati}
          onCambia={setMesiSelezionati}
          mostraSelezionaTutto={false}
        />

        <h2 className="titolo-sezione">Avvicinamento</h2>
        <textarea
          placeholder="Descrivi come raggiungere l'attacco della via"
          value={avvicinamentoDescrizione}
          onChange={(e) => setAvvicinamentoDescrizione(e.target.value)}
          rows={4}
          required
          minLength={10}
          maxLength={3000}
        />
        <label>
          Foto avvicinamento (opzionale)
          <input type="file" accept="image/*" onChange={(e) => setAvvicinamentoFoto(e.target.files[0])} />
        </label>
        <label>
          Traccia GPX avvicinamento (opzionale)
          <input type="file" accept=".gpx" onChange={(e) => setAvvicinamentoGpx(e.target.files[0])} />
        </label>

     <h2 className="titolo-sezione">Via</h2>
     <textarea
      placeholder="Descrizione generale della via (opzionale, oltre ai singoli tiri)"
      value={descrizioneVia}
      onChange={(e) => setDescrizioneVia(e.target.value)}
      rows={3}
      maxLength={3000}
     />

<EditorTiri tiri={tiri} onChange={setTiri} />

        <label>
          Topo della via (immagine, facoltativa)
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setDiagrammaFile(e.target.files[0])}
          />
        </label>

        <h2 className="titolo-sezione">Allontanamento</h2>
        <textarea
          placeholder="Descrivi come tornare dalla via (calate, sentiero...)"
          value={allontanamentoDescrizione}
          onChange={(e) => setAllontanamentoDescrizione(e.target.value)}
          rows={4}
          required
          minLength={10}
          maxLength={3000}
        />
        <label>
          Foto allontanamento (opzionale)
          <input type="file" accept="image/*" onChange={(e) => setAllontanamentoFoto(e.target.files[0])} />
        </label>
        <label>
          Traccia GPX allontanamento (opzionale)
          <input type="file" accept=".gpx" onChange={(e) => setAllontanamentoGpx(e.target.files[0])} />
        </label>

        <h2 className="titolo-sezione">Storia della via</h2>
        <input type="number" placeholder="Anno di apertura" value={annoApertura} onChange={(e) => setAnnoApertura(e.target.value)} />
        <input type="text" placeholder="Apritori" value={apritori} onChange={(e) => setApritori(e.target.value)} maxLength={200} />

        {errore && <p className="errore">{errore}</p>}

        <button type="submit" disabled={caricamento}>
          {caricamento ? 'Salvataggio in corso...' : 'Aggiungi via'}
        </button>
      </form>
    </div>
  );
}

export default NuovaVia;