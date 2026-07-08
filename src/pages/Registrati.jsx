import { useState } from 'react';
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
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault(); // impedisce al browser di ricaricare la pagina (comportamento di default dei form)
    setErrore('');
    setCaricamento(true);

    // 1. Crea l'utente in Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setErrore(error.message);
      setCaricamento(false);
      return;
    }

    // Chiediamo esplicitamente a Supabase la sessione attuale, invece di fidarci solo di data.session
    const { data: sessionData } = await supabase.auth.getSession();

    console.log('Sessione verificata:', sessionData.session);

    if (!sessionData.session) {
      setCaricamento(false);
      setErrore('Registrazione avvenuta! Controlla la tua email per confermare l\'account prima di accedere.');
      return;
    }

    // 2. Salva nome, cognome, città nella tabella profili
    const userId = data.user.id;

    const { error: erroreProfilo } = await supabase.from('profili').insert({
      id: userId,
      nome,
      cognome,
      citta,
    });

    if (erroreProfilo) {
      setErrore(erroreProfilo.message);
      setCaricamento(false);
      return;
    }

    setCaricamento(false);
    navigate('/'); // torna alla homepage dopo la registrazione
  }

  return (
    <div className="app dettaglio">
      <Link to="/">← Torna alla lista</Link>
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
        />
        <input
          type="text"
          placeholder="Cognome"
          value={cognome}
          onChange={(e) => setCognome(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Città"
          value={citta}
          onChange={(e) => setCitta(e.target.value)}
          required
        />

        {errore && <p className="errore">{errore}</p>}

        <button type="submit" disabled={caricamento}>
          {caricamento ? 'Registrazione in corso...' : 'Registrati'}
        </button>
      </form>
    </div>
  );
}

export default Registrati;