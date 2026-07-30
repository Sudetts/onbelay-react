import { Link } from 'react-router-dom';

function Termini() {
  return (
    <div className="app dettaglio pagina-legale">
      <Link to="/">← Torna alla lista</Link>
      <h1>Termini di Servizio</h1>
      <p className="link-piccolo">Ultimo aggiornamento: [DATA]</p>

      <h2>1. Cos'è Onbelay</h2>
      <p>
        Onbelay è una piattaforma che permette agli utenti registrati di consultare e condividere
        relazioni di vie lunghe di arrampicata (descrizioni, foto, tracce GPX), create dalla community
        di utenti. Utilizzando il sito, accetti questi termini.
      </p>

      <h2>2. Account utente</h2>
      <p>
        Per creare e consultare contenuti è necessario registrarsi con un indirizzo email valido. Sei
        responsabile della sicurezza delle tue credenziali di accesso. Ci riserviamo il diritto di sospendere
        account che violano questi termini o che vengono usati in modo fraudolento.
      </p>

      <h2>3. Contenuti caricati dagli utenti</h2>
      <p>
        Caricando una via, una foto, una traccia GPX o qualsiasi altro contenuto, dichiari di:
      </p>
      <ul>
        <li>Essere autorizzato a condividere quel contenuto (es. foto scattate da te, o di cui hai il permesso)</li>
        <li>Fornire informazioni accurate e verificate al meglio delle tue conoscenze, pur consapevole che l'arrampicata comporta rischi intrinseci</li>
      </ul>
      <p>
        Mantieni la proprietà dei contenuti che carichi, ma concedi a Onbelay una licenza non esclusiva a
        pubblicarli, mostrarli e distribuirli all'interno della piattaforma, anche dopo eventuali modifiche
        approvate da altri utenti secondo il sistema di revisione del sito.
      </p>
      <p>
        Tutti i contenuti nuovi e le modifiche proposte sono soggetti a revisione da parte
        dell'amministrazione prima della pubblicazione pubblica.
      </p>

      <h2>4. Esonero di responsabilità (importante)</h2>
      <p>
        <strong>
          L'arrampicata e l'alpinismo sono attività intrinsecamente pericolose. Le informazioni presenti su
          Onbelay sono fornite dalla community e potrebbero contenere imprecisioni, essere non aggiornate o
          non corrispondere alle reali condizioni del terreno.
        </strong>{' '}
        Onbelay non garantisce l'accuratezza, la completezza o l'affidabilità delle relazioni pubblicate.
        L'utilizzo di queste informazioni per pianificare o affrontare una via è a esclusivo rischio e
        responsabilità dell'utente. Onbelay non è responsabile per infortuni, danni o incidenti derivanti
        dall'uso delle informazioni presenti sul sito.
      </p>

      <h2>5. Sistema di crediti</h2>
      <p>
        Alcuni contenuti del sito richiedono l'utilizzo di crediti per essere sbloccati. I crediti possono
        essere ottenuti contribuendo con nuove vie o modifiche approvate dall'amministrazione, o, dove
        disponibile, acquistati. I dettagli su eventuali acquisti sono specificati al momento dell'acquisto
        stesso.
      </p>

      <h2>6. Comportamento degli utenti</h2>
      <p>Non è consentito:</p>
      <ul>
        <li>Caricare contenuti falsi, offensivi, o protetti da copyright senza autorizzazione</li>
        <li>Utilizzare il sito per finalità diverse da quelle previste</li>
        <li>Tentare di aggirare i sistemi di sicurezza o il sistema di crediti</li>
        <li>Creare account multipli per aggirare limitazioni del servizio</li>
      </ul>

      <h2>7. Cookie</h2>
      <p>Il sito utilizza esclusivamente cookie tecnici necessari, in particolare:</p>
      <ul>
        <li>Cookie di sessione, per mantenere l'accesso effettuato durante la navigazione</li>
      </ul>
      <p>
        Non utilizziamo cookie di profilazione o di terze parti a fini pubblicitari.
      </p>

      <h2>8. Modifiche al servizio</h2>
      <p>
        Ci riserviamo il diritto di modificare, sospendere o interrompere il servizio, in tutto o in parte,
        in qualsiasi momento. Cercheremo di dare un preavviso ragionevole per modifiche sostanziali.
      </p>

      <h2>9. Contatti</h2>
      <p>Per domande su questi termini, scrivi a [EMAIL_PLACEHOLDER].</p>
    </div>
  );
}

export default Termini;