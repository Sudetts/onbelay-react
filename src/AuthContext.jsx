import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [utente, setUtente] = useState(null);
  const [caricamento, setCaricamento] = useState(true);

  useEffect(() => {
    // Controlla subito se c'è già una sessione attiva (es. utente torna sul sito)
    supabase.auth.getSession().then(({ data }) => {
      setUtente(data.session?.user ?? null);
      setCaricamento(false);
    });

    // Si mette in ascolto: ogni volta che qualcosa cambia (login, logout, registrazione)
    // questa funzione riparte automaticamente e aggiorna lo stato
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUtente(session?.user ?? null);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  async function logout() {
    await supabase.auth.signOut();
  }

  return (
    <AuthContext.Provider value={{ utente, caricamento, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}