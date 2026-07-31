import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errore, setErrore] = useState('');
  const [caricamento, setCaricamento] = useState(false);
  const [captchaToken, setCaptchaToken] = useState('');
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
      setErrore(error.message);
      setCaricamento(false);
      return;
    }

    setCaricamento(false);
    navigate('/');
  }

  return (
    <div className="app dettaglio">
      <Link to="/">← Torna alla lista</Link>
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
    </div>
  );
}

export default Login;