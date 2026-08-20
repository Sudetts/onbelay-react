import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useAuth } from '../AuthContext';

function SicurezzaAccount() {
  const { utente } = useAuth();
  const [fattori, setFattori] = useState([]);
  const [qrCode, setQrCode] = useState(null);
  const [factorId, setFactorId] = useState(null);
  const [codice, setCodice] = useState('');
  const [errore, setErrore] = useState('');
  const [messaggio, setMessaggio] = useState('');
  const [caricamento, setCaricamento] = useState(true);

  useEffect(() => {
    caricaFattori();
  }, []);

  async function caricaFattori() {
    const { data, error } = await supabase.auth.mfa.listFactors();
    if (!error) {
      setFattori(data.totp || []);
    }
    setCaricamento(false);
  }

  async function iniziaCollegamento() {
    setErrore('');
    const { data, error } = await supabase.auth.mfa.enroll({ factorType: 'totp' });

    if (error) {
      setErrore(error.message);
      return;
    }

    setQrCode(data.totp.qr_code);
    setFactorId(data.id);
  }

  async function confermaCollegamento(e) {
    e.preventDefault();
    setErrore('');

    const { data: challenge, error: erroreChallenge } = await supabase.auth.mfa.challenge({
      factorId,
    });

    if (erroreChallenge) {
      setErrore(erroreChallenge.message);
      return;
    }

    const { error: erroreVerifica } = await supabase.auth.mfa.verify({
      factorId,
      challengeId: challenge.id,
      code: codice,
    });

    if (erroreVerifica) {
      setErrore('Codice non valido, riprova.');
      return;
    }

    setMessaggio('Autenticazione a due fattori attivata con successo!');
    setQrCode(null);
    setFactorId(null);
    setCodice('');
    caricaFattori();
  }

  async function rimuoviFattore(id) {
    const conferma = window.confirm('Sei sicuro di voler disattivare l\'autenticazione a due fattori?');
    if (!conferma) return;

    const { error } = await supabase.auth.mfa.unenroll({ factorId: id });
    if (error) {
      setErrore(error.message);
      return;
    }

    setMessaggio('Autenticazione a due fattori disattivata.');
    caricaFattori();
  }

  if (!utente) {
        return (
      <div className="app dettaglio pannello-scuro">
        <p>Devi accedere per gestire la sicurezza del tuo account.</p>
        <Link to="/login">Vai al login</Link>
      </div>
    );
  }

    if (caricamento) {
    return <p className="messaggio-caricamento">Caricamento in corso...</p>;
  }

  return (
    <div className="app dettaglio">
      <Link to="/profilo">← Torna al profilo</Link>
      <h1>Sicurezza account</h1>

      {messaggio && <p className="messaggio-successo">{messaggio}</p>}
      {errore && <p className="errore">{errore}</p>}

      <h2>Autenticazione a due fattori</h2>

      {fattori.length > 0 ? (
        <div className="scheda-admin">
          <p>✅ Autenticazione a due fattori attiva.</p>
          {fattori.map((fattore) => (
            <button
              key={fattore.id}
              onClick={() => rimuoviFattore(fattore.id)}
              className="link-button"
            >
              Disattiva
            </button>
          ))}
        </div>
      ) : qrCode ? (
        <div className="scheda-admin">
          <p>1. Scansiona questo codice con la tua app authenticator (es. Google Authenticator):</p>
          <img src={qrCode} alt="QR Code per autenticazione a due fattori" className="qr-code" />
          <p>2. Inserisci il codice a 6 cifre mostrato dall'app:</p>
          <form onSubmit={confermaCollegamento} className="form form-inline">
            <input
              type="text"
              placeholder="123456"
              value={codice}
              onChange={(e) => setCodice(e.target.value)}
              maxLength={6}
              required
            />
            <button type="submit">Conferma</button>
          </form>
        </div>
      ) : (
        <div className="scheda-admin">
          <p>Non hai ancora attivato l'autenticazione a due fattori.</p>
          <button onClick={iniziaCollegamento} className="btn-approva">
            Attiva autenticazione a due fattori
          </button>
        </div>
      )}
    </div>
  );
}

export default SicurezzaAccount;