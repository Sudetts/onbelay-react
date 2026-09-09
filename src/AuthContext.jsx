import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [utente, setUtente] = useState(null);
  const [caricamento, setCaricamento] = useState(true);
  const [mfaNonVerificato, setMfaNonVerificato] = useState(false);

  async function verificaLivelloSicurezza() {
    try {
      const { data } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      // Se l'utente ha un fattore MFA configurato (currentLevel esiste) ma non lo ha
      // ancora verificato in questa sessione (nextLevel è più alto di currentLevel),
      // consideriamo l'accesso come "in sospeso"
      if (data && data.nextLevel === 'aal2' && data.currentLevel !== 'aal2') {
        setMfaNonVerificato(true);
      } else {
        setMfaNonVerificato(false);
      }
    } catch (err) {
      console.error('Errore nella verifica MFA:', err);
      setMfaNonVerificato(false);
    }
  }

  useEffect(() => {
    let risolto = false;

    supabase.auth.getSession()
      .then(async ({ data }) => {
        setUtente(data.session?.user ?? null);
        if (data.session) {
          await verificaLivelloSicurezza();
        }
      })
      .catch((err) => {
        console.error('Errore nel recupero della sessione:', err);
      })
      .finally(() => {
        risolto = true;
        setCaricamento(false);
      });

    // Rete di sicurezza: se dopo 6 secondi la sessione non è ancora arrivata,
    // sblocchiamo comunque l'app invece di lasciarla incollata sul caricamento
    const timeoutSicurezza = setTimeout(() => {
      if (!risolto) {
        console.warn("Timeout nel recupero sessione, sblocco comunque l'interfaccia.");
        setCaricamento(false);
      }
    }, 6000);

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUtente(session?.user ?? null);
      if (session) {
        await verificaLivelloSicurezza();
      } else {
        setMfaNonVerificato(false);
      }
    });

    return () => {
      clearTimeout(timeoutSicurezza);
      listener.subscription.unsubscribe();
    };
  }, []);

  async function logout() {
    await supabase.auth.signOut();
  }

  return (
    <AuthContext.Provider value={{ utente, caricamento, logout, mfaNonVerificato, verificaLivelloSicurezza }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}