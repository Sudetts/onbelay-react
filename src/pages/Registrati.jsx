import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';

function Registrati() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nome, setNome] = useState('');
  const [cognome, setCognome] = useState('');
  const [citta, setCitta] = useState('');
  const [errore, setErrore] = useState('');
  const [caricamento, setCaricamento] = useState(false);
  const [captchaToken, setCaptchaToken] = useState('');
  const [registrazioneCompletata, setRegistrazioneCompletata] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
  if (window.turnstile) {
    window.turnstile.render('#turnstile-widget', {
      sitekey: '0x4AAAAAAEBx6Buicj5YPu_-',
      callback: (token) => setCaptchaToken(token),
    });
  }
}, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setErrore('');
    setCaricamento(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          nome,
          cognome,
          citta,
        },
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

    setCaricamento(false);
    setRegistrazioneCompletata(true);
  }

if (registrazioneCompletata) {
    return (
      <div className="app dettaglio pannello-scuro">
        <h1>Controlla la tua email</h1>
        <p className="messaggio-successo">
          Ti abbiamo inviato un'email di conferma. Clicca sul link contenuto nel messaggio per attivare
          il tuo account, poi torna qui per accedere.
        </p>
        <Link to="/login">Vai al login</Link>
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
      <h1>Registrati</h1>

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
          minLength={6}
        />
        <input
        type="text"
        placeholder="Nome"
        value={nome}
        onChange={(e) => setNome(e.target.value)}
        required
        minLength={2}
        maxLength={40}
        />
        <input
        type="text"
        placeholder="Cognome"
        value={cognome}
        onChange={(e) => setCognome(e.target.value)}
        required
        minLength={2}
        maxLength={40}
        />
        <input
        type="text"
        placeholder="Città"
        value={citta}
        onChange={(e) => setCitta(e.target.value)}
        required
        minLength={2}
        maxLength={60}
        />

        <div id="turnstile-widget"></div>


        {errore && <p className="errore">{errore}</p>}

        <button type="submit" disabled={caricamento}>
          {caricamento ? 'Registrazione in corso...' : 'Registrati'}
        </button>
      </form>
    </div>
  );
}

export default Registrati;