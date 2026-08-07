import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errore, setErrore] = useState('');
  const [caricamento, setCaricamento] = useState(false);
  const [captchaToken, setCaptchaToken] = useState('');
  const [richiedeMfa, setRichiedeMfa] = useState(false);
  const [codiceMfa, setCodiceMfa] = useState('');
  const [erroreMfa, setErroreMfa] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
  if (window.turnstile) {
    window.turnstile.render('#turnstile-widget-login', {
      sitekey: '0x4AAAAAAEBx6Buicj5YPu_-',
      callback: (token) => setCaptchaToken(token),
    });
  }
}, []);

async function handleSubmit(e) {
    e.preventDefault();
    setErrore('');
    setCaricamento(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
      options: {
        captchaToken,
      },
    });

    if (error) {
      if (error.message.includes('Email not confirmed')) {
        setErrore('Devi prima confermare la tua email. Controlla la tua casella di posta.');
      } else {
        setErrore(error.message);
      }
      setCaricamento(false);
      return;
    }

    // Controlla se questo account ha un secondo fattore attivo
    const { data: fattori } = await supabase.auth.mfa.listFactors();
    const haMfa = fattori?.totp?.length > 0;

    if (haMfa) {
      setRichiedeMfa(true);
      setCaricamento(false);
      return;
    }

    setCaricamento(false);
    navigate('/');
  }

  async function handleVerificaMfa(e) {
    e.preventDefault();
    setErroreMfa('');
    setCaricamento(true);

    const { data: fattori } = await supabase.auth.mfa.listFactors();
    const factorId = fattori.totp[0].id;

    const { data: challenge, error: erroreChallenge } = await supabase.auth.mfa.challenge({
      factorId,
    });

    if (erroreChallenge) {
      setErroreMfa(erroreChallenge.message);
      setCaricamento(false);
      return;
    }

    const { error: erroreVerifica } = await supabase.auth.mfa.verify({
      factorId,
      challengeId: challenge.id,
      code: codiceMfa,
    });

    if (erroreVerifica) {
      setErroreMfa('Codice non valido, riprova.');
      setCaricamento(false);
      return;
    }

    setCaricamento(false);
    navigate('/');
  }

if (richiedeMfa) {
    return (
      <div className="app dettaglio pannello-scuro">
        <h1>Verifica in due passaggi</h1>
        <p>Inserisci il codice a 6 cifre generato dalla tua app authenticator.</p>

        <form onSubmit={handleVerificaMfa} className="form">
          <input
            type="text"
            placeholder="123456"
            value={codiceMfa}
            onChange={(e) => setCodiceMfa(e.target.value)}
            maxLength={6}
            required
            autoFocus
          />

          {erroreMfa && <p className="errore">{erroreMfa}</p>}

          <button type="submit" disabled={caricamento}>
            {caricamento ? 'Verifica in corso...' : 'Verifica'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="app dettaglio pannello-scuro">
      <Link to="/" className="link-home">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9.5 12 3l9 6.5" />
          <path d="M5 9v11a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V9" />
        </svg>
        HOME
      </Link>
      <h1>Accedi</h1>

      <form onSubmit={handleSubmit} className="form">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <Link to="/password-dimenticata" className="link-piccolo">Password dimenticata?</Link>
        <div id="turnstile-widget-login"></div>
        {errore && <p className="errore">{errore}</p>}

        <button type="submit" disabled={caricamento}>
          {caricamento ? 'Accesso in corso...' : 'Accedi'}
        </button>
      </form>

      <p className="link-piccolo" style={{ marginTop: '15px' }}>
        Non sei registrato? <Link to="/registrati">Registrati</Link>
      </p>
    </div>
  );
}

export default Login;