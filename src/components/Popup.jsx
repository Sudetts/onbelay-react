function Popup({ titolo, messaggio, testoConferma = 'Conferma', testoAnnulla = 'Annulla', soloOk = false, pericoloso = false, onConferma, onAnnulla }) {
  return (
    <div className="overlay-popup" onClick={onAnnulla}>
      <div className="finestra-popup" onClick={(e) => e.stopPropagation()}>
        {titolo && <h3>{titolo}</h3>}
        <p>{messaggio}</p>
        <div className="azioni-popup">
          {!soloOk && (
            <button type="button" onClick={onAnnulla} className="btn-popup-annulla">
              {testoAnnulla}
            </button>
          )}
          <button
            type="button"
            onClick={onConferma}
            className={pericoloso ? 'btn-popup-conferma btn-popup-pericolo' : 'btn-popup-conferma'}
          >
            {soloOk ? 'OK' : testoConferma}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Popup;