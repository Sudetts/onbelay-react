import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function BannerCookie() {
  const [visibile, setVisibile] = useState(false);

  useEffect(() => {
    const scelta = localStorage.getItem('cookie-consenso');
    if (!scelta) {
      setVisibile(true);
    }
  }, []);

  function accetta() {
    localStorage.setItem('cookie-consenso', 'accettato');
    setVisibile(false);
  }

  if (!visibile) return null;

  return (
    <div className="banner-cookie">
      <p>
        Questo sito utilizza solo cookie tecnici necessari al funzionamento (es. mantenimento
        dell'accesso). Non utilizziamo cookie di profilazione o di terze parti.{' '}
        <Link to="/privacy">Maggiori informazioni</Link>.
      </p>
      <button onClick={accetta}>Ho capito</button>
    </div>
  );
}

export default BannerCookie;