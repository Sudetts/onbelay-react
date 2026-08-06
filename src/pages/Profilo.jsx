import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useAuth } from '../AuthContext';
import { comprimiImmagine } from '../utils/comprimiImmagine';
import Cropper from 'react-easy-crop';

function Profilo() {
  const { utente, logout } = useAuth();
  const navigate = useNavigate();
  const [profilo, setProfilo] = useState(null);
  const [vieUtente, setVieUtente] = useState([]);
  const [caricamento, setCaricamento] = useState(true);
  const [proposteUtente, setProposteUtente] = useState([]);
  const [diarioUtente, setDiarioUtente] = useState([]);
  const [caricamentoAvatar, setCaricamentoAvatar] = useState(false);
  const [erroreAvatar, setErroreAvatar] = useState('');
  const [immagineOriginale, setImmagineOriginale] = useState(null);
  const [nomeFileOriginale, setNomeFileOriginale] = useState('');
  const [ritaglio, setRitaglio] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [areaRitagliata, setAreaRitagliata] = useState(null);
  const inputFileRef = useRef(null);
  useEffect(() => {
    if (!utente) return;

    async function caricaDati() {
      // Carica i dati del profilo (nome, cognome, città)
      const { data: datiProfilo, error: erroreProfilo } = await supabase
        .from('profili')
        .select('*')
        .eq('id', utente.id)
        .single();

      if (erroreProfilo) {
        console.error('Errore nel caricamento del profilo:', erroreProfilo);
      } else {
        setProfilo(datiProfilo);
      }

// Carica le vie inserite da questo utente
      const { data: vie, error: erroreVie } = await supabase
        .from('vie')
        .select('*')
        .eq('autore_id', utente.id);

      if (erroreVie) {
        console.error('Errore nel caricamento delle vie:', erroreVie);
      } else {
        setVieUtente(vie);
      }

// Carica le proposte di modifica fatte da questo utente, ancora in attesa
      const { data: proposte, error: erroreProposte } = await supabase
        .from('modifiche_proposte')
        .select('*, vie(nome)')
        .eq('proponente_id', utente.id)
        .eq('stato', 'in_attesa');

      if (erroreProposte) {
        console.error('Errore nel caricamento delle proposte:', erroreProposte);
      } else {
        setProposteUtente(proposte);
      }

      // Carica il diario delle vie fatte, in ordine cronologico (più recenti prima)
      const { data: diario, error: erroreDiario } = await supabase
        .from('diario')
        .select('*, vie(nome, zona, difficolta)')
        .eq('utente_id', utente.id)
        .order('data_salita', { ascending: false });

      if (erroreDiario) {
        console.error('Errore nel caricamento del diario:', erroreDiario);
      } else {
        setDiarioUtente(diario);
      }

      setCaricamento(false);
    }

    caricaDati();
  }, [utente]);

 function handleSelezionaFile(e) {
  const file = e.target.files[0];
  if (!file) return;

  setErroreAvatar('');
  setNomeFileOriginale(file.name);

  const lettore = new FileReader();
  lettore.onload = () => setImmagineOriginale(lettore.result);
  lettore.readAsDataURL(file);
}

function onRitaglioCompletato(_areaVisibile, areaInPixel) {
  setAreaRitagliata(areaInPixel);
}

function annullaRitaglio() {
  setImmagineOriginale(null);
  setAreaRitagliata(null);
  setZoom(1);
  setRitaglio({ x: 0, y: 0 });
}

async function confermaRitaglioECarica() {
  setErroreAvatar('');
  setCaricamentoAvatar(true);

  try {
    // Disegniamo solo la porzione scelta dall'utente su un canvas
    const immagine = new Image();
    immagine.src = immagineOriginale;
    await new Promise((resolve) => { immagine.onload = resolve; });

    const canvas = document.createElement('canvas');
    canvas.width = areaRitagliata.width;
    canvas.height = areaRitagliata.height;
    const contesto = canvas.getContext('2d');
    contesto.drawImage(
      immagine,
      areaRitagliata.x, areaRitagliata.y, areaRitagliata.width, areaRitagliata.height,
      0, 0, areaRitagliata.width, areaRitagliata.height
    );

    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.9));
    const fileRitagliato = new File([blob], nomeFileOriginale, { type: 'image/jpeg' });

    const fileCompresso = await comprimiImmagine(fileRitagliato);
    const nomeFile = `${utente.id}/${Date.now()}-${fileCompresso.name}`;

    const { error: erroreUpload } = await supabase.storage
      .from('avatar-utenti')
      .upload(nomeFile, fileCompresso);

    if (erroreUpload) throw new Error(erroreUpload.message);

    const { data } = supabase.storage.from('avatar-utenti').getPublicUrl(nomeFile);

    const { error: erroreUpdate } = await supabase
      .from('profili')
      .update({ avatar_url: data.publicUrl })
      .eq('id', utente.id);

    if (erroreUpdate) throw new Error(erroreUpdate.message);

    setProfilo((prev) => ({ ...prev, avatar_url: data.publicUrl }));
    annullaRitaglio();
  } catch (err) {
    setErroreAvatar(err.message);
  }

  setCaricamentoAvatar(false);
}

  if (!utente) {
    return (
      <div className="app dettaglio">
        <p>Devi accedere per vedere il tuo profilo.</p>
        <Link to="/login">Vai al login</Link>
      </div>
    );
  }

  if (caricamento) {
    return <p>Caricamento in corso...</p>;
  }

  return (
    <div className="app dettaglio pagina-profilo">
<Link to="/" className="link-home">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9.5 12 3l9 6.5" />
          <path d="M5 9v11a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V9" />
        </svg>
        HOME
      </Link>
      <h1>Il mio profilo</h1>

      <div className="profilo-colonne">
        <div className="colonna-sinistra">
          {profilo && (
            <div className="scheda-profilo">
              <div className="blocco-avatar">
                <div className="contenitore-avatar">
                  {profilo.avatar_url ? (
                    <img src={profilo.avatar_url} alt="Immagine profilo" className="avatar-utente avatar-utente-grande" />
                  ) : (
                    <div className="avatar-utente avatar-utente-grande avatar-segnaposto">
                      {profilo.nome?.[0]?.toUpperCase()}
                    </div>
                  )}

                  <button
                    type="button"
                    className="bottone-modifica-avatar"
                    onClick={() => inputFileRef.current?.click()}
                    disabled={caricamentoAvatar}
                    aria-label="Cambia immagine profilo"
                    title="Cambia immagine profilo"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 20h9" />
                      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
                    </svg>
                  </button>

                  <input
                    type="file"
                    accept="image/*"
                    ref={inputFileRef}
                    onChange={handleSelezionaFile}
                    disabled={caricamentoAvatar}
                    style={{ display: 'none' }}
                  />
                </div>

                {caricamentoAvatar && <p className="link-piccolo">Caricamento in corso...</p>}
                {erroreAvatar && <p className="errore">{erroreAvatar}</p>}
              </div>

              {immagineOriginale && (
                <div className="overlay-ritaglio">
                  <div className="finestra-ritaglio">
                    <h3>Posiziona la tua foto</h3>
                    <div className="area-cropper">
                      <Cropper
                        image={immagineOriginale}
                        crop={ritaglio}
                        zoom={zoom}
                        aspect={1}
                        cropShape="round"
                        showGrid={false}
                        onCropChange={setRitaglio}
                        onZoomChange={setZoom}
                        onCropComplete={onRitaglioCompletato}
                      />
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={3}
                      step={0.1}
                      value={zoom}
                      onChange={(e) => setZoom(Number(e.target.value))}
                      className="slider-zoom"
                    />
                    {erroreAvatar && <p className="errore">{erroreAvatar}</p>}
                    <div className="azioni-ritaglio">
                      <button type="button" onClick={annullaRitaglio} disabled={caricamentoAvatar}>
                        Annulla
                      </button>
                      <button type="button" onClick={confermaRitaglioECarica} disabled={caricamentoAvatar}>
                        {caricamentoAvatar ? 'Caricamento...' : 'Conferma'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <p><strong>Nome:</strong> {profilo.nome}</p>
              <p><strong>Cognome:</strong> {profilo.cognome}</p>
              <p><strong>Città:</strong> {profilo.citta}</p>
              <p><strong>Email:</strong> {utente.email}</p>
            </div>
          )}
        </div>

<div className="colonna-destra">
          <div className="azioni-profilo">
            <Link to="/nuova-via" className="azione-profilo-voce">Aggiungi via</Link>

            {profilo?.crediti !== undefined && (
              <div className="azione-profilo-voce blocco-crediti">
                Crediti
                <svg className="icona-moneta" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="9.5" stroke="currentColor" strokeWidth="1.5" />
                  <circle cx="12" cy="12" r="6.8" stroke="currentColor" strokeWidth="1" opacity="0.6" />
                  <text x="12" y="16" textAnchor="middle" fontSize="9" fontWeight="700" fill="currentColor" fontFamily="var(--font-tecnico)">€</text>
                </svg>
                {profilo.crediti}
              </div>
            )}

            {profilo?.is_admin && (
              <Link to="/pannello-controllo-onbelay" className="azione-profilo-voce link-admin">Admin</Link>
            )}

            {profilo?.is_admin && (
              <Link to="/sicurezza-account" className="azione-profilo-voce">Gestisci sicurezza account (autenticazione a due fattori)</Link>
            )}

           <button
  onClick={async () => {
    await logout();
    navigate('/');
  }}
  className="azione-profilo-voce link-button"
>
  Logout
</button>
          </div>
        </div>
      </div>

<h2>Il mio diario ({diarioUtente.length})</h2>
      {diarioUtente.length === 0 ? (
        <p>Non hai ancora registrato nessuna salita.</p>
      ) : (
        <div className="lista-diario">
{diarioUtente.map((voce) => (
              <Link to={`/via/${voce.via_id}`} className="voce-diario" key={voce.id}>
                <span className="data-diario">
                  {new Date(voce.data_salita).toLocaleDateString('it-IT')}
                </span>
                <span className="separatore-diario">·</span>
                <span className="nome-diario">{voce.vie?.nome}</span>
                <span className="separatore-diario">·</span>
                <span className="dettagli-diario">{voce.vie?.zona} · {voce.vie?.difficolta}</span>
              </Link>
            ))}
        </div>
      )}

      <h2>Le mie vie ({vieUtente.length})</h2>
      {vieUtente.length === 0 ? (
        <p>Non hai ancora inserito nessuna via.</p>
      ) : (
        <div className="grid">
          {vieUtente.map((via) => (
            <Link to={`/via/${via.id}`} className="card" key={via.id}>
            <h3>{via.nome}</h3>
            <p>Zona: {via.zona}</p>
            <p>Difficoltà: {via.difficolta}</p>
          {via.stato === 'in_attesa' && <p className="badge-attesa">In attesa di approvazione</p>}
          {via.stato === 'rifiutata' && <p className="badge-rifiutata">Rifiutata</p>}
        </Link>
      ))}
        </div>
      )}

      {proposteUtente.length > 0 && (
        <>
          <h2>Le mie modifiche in attesa di approvazione</h2>
          <div className="grid">
            {proposteUtente.map((proposta) => (
              <Link to={`/via/${proposta.via_id}`} className="card" key={proposta.id}>
                <h3>{proposta.vie?.nome}</h3>
                <p className="badge-attesa">In attesa approvazione modifica</p>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default Profilo;