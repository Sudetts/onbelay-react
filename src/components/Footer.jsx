import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="footer">
      <p>© {new Date().getFullYear()} Onbelay</p>
      <nav className="footer-nav">
        <Link to="/privacy">Privacy</Link>
        <Link to="/termini">Termini di Servizio</Link>
        <Link to="/contattaci">Contattaci</Link>
      </nav>
    </footer>
  );
}

export default Footer;