import { Link } from 'react-router-dom';

function Privacy() {
  return (
    <div className="app dettaglio pagina-legale">
      <Link to="/">← Torna alla lista</Link>
      <h1>Informativa sulla Privacy</h1>
      <p className="link-piccolo">Ultimo aggiornamento: [DATA]</p>

      <h2>1. Titolare del trattamento</h2>
      <p>
        Il titolare del trattamento dei dati raccolti tramite il sito Onbelay è
        Onbelay [SOSTITUIRE CON NOME E COGNOME REALI PRIMA DEL LANCIO], contattabile
        all'indirizzo email: [EMAIL_PLACEHOLDER].
      </p>

      <h2>2. Quali dati raccogliamo</h2>
      <p>Raccogliamo i seguenti dati personali:</p>
      <ul>
        <li>Email, utilizzata per la registrazione e l'accesso all'account</li>
        <li>Nome, cognome e città, forniti volontariamente in fase di registrazione</li>
        <li>Contenuti caricati dall'utente: vie, descrizioni, foto, tracce GPX</li>
        <li>Dati tecnici di navigazione (indirizzo IP, tipo di browser) raccolti automaticamente dal servizio di hosting</li>
      </ul>

      <h2>3. Perché trattiamo i tuoi dati (finalità e base giuridica)</h2>
      <ul>
        <li>Creazione e gestione dell'account utente (esecuzione del contratto d'uso del servizio)</li>
        <li>Pubblicazione dei contenuti che scegli di condividere sul sito (esecuzione del contratto)</li>
        <li>Comunicazioni relative al servizio, come conferme email o notifiche di approvazione (esecuzione del contratto)</li>
        <li>Sicurezza e prevenzione di abusi (legittimo interesse)</li>
      </ul>

      <h2>4. Con chi condividiamo i dati</h2>
      <p>
        I dati sono conservati tramite fornitori di servizi tecnici di cui ci avvaliamo per il funzionamento
        del sito: Supabase (database, autenticazione, archiviazione file) e Netlify (hosting del sito web).
        Questi fornitori possono trattare i dati anche al di fuori dell'Unione Europea, in conformità con le
        clausole contrattuali standard previste dal GDPR per il trasferimento internazionale di dati.
      </p>
      <p>
        Non vendiamo né cediamo i tuoi dati personali a terzi per finalità commerciali o pubblicitarie.
      </p>

      <h2>5. Per quanto tempo conserviamo i dati</h2>
      <p>
        I dati dell'account sono conservati finché mantieni un account attivo sul sito. Puoi richiedere
        la cancellazione del tuo account e dei dati associati in qualsiasi momento, scrivendo all'indirizzo
        email indicato al punto 1.
      </p>

      <h2>6. I tuoi diritti</h2>
      <p>In qualità di interessato, hai diritto di:</p>
      <ul>
        <li>Accedere ai dati personali che trattiamo su di te</li>
        <li>Richiederne la rettifica se inesatti</li>
        <li>Richiederne la cancellazione ("diritto all'oblio")</li>
        <li>Richiederne la portabilità in un formato leggibile</li>
        <li>Opporti al trattamento in determinate circostanze</li>
        <li>Proporre reclamo al Garante per la Protezione dei Dati Personali (www.garanteprivacy.it)</li>
      </ul>
      <p>Per esercitare questi diritti, scrivi a [EMAIL_PLACEHOLDER].</p>

      <h2>7. Cookie</h2>
      <p>
        Il sito utilizza cookie tecnici necessari al funzionamento (es. mantenimento della sessione di
        accesso). Per maggiori dettagli, consulta la nostra <Link to="/termini">informativa sui cookie</Link>.
      </p>

      <h2>8. Modifiche a questa informativa</h2>
      <p>
        Questa informativa può essere aggiornata nel tempo. Le modifiche sostanziali verranno comunicate
        agli utenti registrati tramite email o avviso sul sito.
      </p>
    </div>
  );
}

export default Privacy;