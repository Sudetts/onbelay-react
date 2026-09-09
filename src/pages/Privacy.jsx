import { Link } from 'react-router-dom';

function Privacy() {
  return (
    <div className="app dettaglio pagina-legale pannello-scuro">
      <Link to="/" className="link-home">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9.5 12 3l9 6.5" />
          <path d="M5 9v11a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V9" />
        </svg>
        HOME
      </Link>
      <h1>Informativa sulla Privacy</h1>
      <p className="link-piccolo">Ultimo aggiornamento: 9 settembre 2026</p>

      <h2>1. Titolare del trattamento</h2>
      <p>
        Il titolare del trattamento dei dati raccolti tramite il sito Onbelay è
        Luca Sudetti, contattabile all'indirizzo email: info@onbelay.it.
      </p>

      <h2>2. Quali dati raccogliamo</h2>
      <p>Raccogliamo i seguenti dati personali:</p>
      <ul>
        <li>Email, utilizzata per la registrazione e l'accesso all'account</li>
        <li>Nome, cognome e città, forniti volontariamente in fase di registrazione</li>
        <li>
          Dati di profilo facoltativi (genere, anno di nascita, città di residenza, stile di
          arrampicata preferito), forniti solo se e quando l'utente sceglie di compilarli dalla
          pagina del proprio profilo
        </li>
        <li>Contenuti caricati dall'utente: vie, descrizioni, foto, tracce GPX</li>
        <li>Dati tecnici di navigazione (indirizzo IP, tipo di browser) raccolti automaticamente dal servizio di hosting</li>
      </ul>

      <h2>3. Perché trattiamo i tuoi dati (finalità e base giuridica)</h2>
      <ul>
        <li>Creazione e gestione dell'account utente (esecuzione del contratto d'uso del servizio)</li>
        <li>Pubblicazione dei contenuti che scegli di condividere sul sito (esecuzione del contratto)</li>
        <li>Comunicazioni relative al servizio, come conferme email o notifiche di approvazione (esecuzione del contratto)</li>
        <li>Sicurezza e prevenzione di abusi (legittimo interesse)</li>
        <li>
          Personalizzazione dell'esperienza, ad esempio mostrare la mappa già centrata vicino alla
          tua città di residenza (consenso, dato facoltativo)
        </li>
        <li>
          Statistiche aggregate e anonime sulla community (consenso, dati facoltativi come genere,
          età, stile di arrampicata preferito)
        </li>
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
      <p>Per esercitare questi diritti, scrivi a info@onbelay.it.</p>

      <h2>7. Minori</h2>
      <p>
        Il servizio è riservato a chi ha compiuto almeno 14 anni. Non raccogliamo consapevolmente dati
        di utenti sotto questa età. Se sei un genitore o tutore e ritieni che un minore di 14 anni abbia
        fornito dati personali senza il tuo consenso, scrivici a info@onbelay.it per richiederne la
        rimozione.
      </p>

      <h2>8. Cookie</h2>
      <p>
        Il sito utilizza cookie tecnici necessari al funzionamento (es. mantenimento della sessione di
        accesso). Per maggiori dettagli, consulta la nostra <Link to="/termini">informativa sui cookie</Link>.
      </p>

      <h2>9. Modifiche a questa informativa</h2>
      <p>
        Questa informativa può essere aggiornata nel tempo. Le modifiche sostanziali verranno comunicate
        agli utenti registrati tramite email o avviso sul sito.
      </p>
    </div>
  );
}

export default Privacy;