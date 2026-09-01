import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';

function PasswordDimenticata() {
  const [email, setEmail] = useState('');
  const [messaggio, setMessaggio] = useState('');
  const [errore, setErrore] = useState('');
  const [caricamento, setCaricamento] = useState(false);
  const [captchaToken, setCaptchaToken] = useState('');

  useEffect(() => {
    if (window.turnstile) {
      window.turnstile.render('#turnstile-widget-recupero', {
        sitekey: '0x4AAAAAAEBx6Buicj5YPu_-',
        callback: (token) => setCaptchaToken(token),
      });
    }
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setErrore('');
    setMessaggio('');
    setCaricamento(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reimposta-password`,
      captchaToken,
    });

    if (error) {
      setErrore(error.message);
    } else {
      setMessaggio('Controlla la tua email: ti abbiamo inviato un link per reimpostare la password.');
    }

    setCaricamento(false);
  }

  return (
    <div className="app dettaglio pannello-scuro">
      <Link to="/login" className="link-home">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9.5 12 3l9 6.5" />
          <path d="M5 9v11a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V9" />
        </svg>
        LOGIN
      </Link>
      <h1>Password dimenticata</h1>

      <form onSubmit={handleSubmit} className="form">
        <input
          type="email"
          placeholder="La tua email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <div id="turnstile-widget-recupero"></div>

        {errore && <p className="errore">{errore}</p>}
        {messaggio && <p className="messaggio-successo">{messaggio}</p>}

        <button type="submit" disabled={caricamento}>
          {caricamento ? 'Invio in corso...' : 'Invia link di recupero'}
        </button>
      </form>
    </div>
  );
}

export default PasswordDimenticata;