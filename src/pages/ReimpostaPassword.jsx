import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';

function ReimpostaPassword() {
  const [password, setPassword] = useState('');
  const [conferma, setConferma] = useState('');
  const [errore, setErrore] = useState('');
  const [caricamento, setCaricamento] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setErrore('');

    if (password !== conferma) {
      setErrore('Le due password non coincidono.');
      return;
    }

    setCaricamento(true);

    const { error } = await supabase.auth.updateUser({ password });

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
      <h1>Imposta una nuova password</h1>

      <form onSubmit={handleSubmit} className="form">
        <input
          type="password"
          placeholder="Nuova password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
        />
        <input
          type="password"
          placeholder="Conferma nuova password"
          value={conferma}
          onChange={(e) => setConferma(e.target.value)}
          required
          minLength={6}
        />

        {errore && <p className="errore">{errore}</p>}

        <button type="submit" disabled={caricamento}>
          {caricamento ? 'Salvataggio in corso...' : 'Salva nuova password'}
        </button>
      </form>
    </div>
  );
}

export default ReimpostaPassword;