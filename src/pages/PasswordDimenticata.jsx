import { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';

function PasswordDimenticata() {
  const [email, setEmail] = useState('');
  const [messaggio, setMessaggio] = useState('');
  const [errore, setErrore] = useState('');
  const [caricamento, setCaricamento] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setErrore('');
    setMessaggio('');
    setCaricamento(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reimposta-password`,
    });

    if (error) {
      setErrore(error.message);
    } else {
      setMessaggio('Controlla la tua email: ti abbiamo inviato un link per reimpostare la password.');
    }

    setCaricamento(false);
  }

  return (
    <div className="app dettaglio">
      <Link to="/login">← Torna al login</Link>
      <h1>Password dimenticata</h1>

      <form onSubmit={handleSubmit} className="form">
        <input
          type="email"
          placeholder="La tua email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

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