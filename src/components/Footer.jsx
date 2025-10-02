import { Link } from "react-router-dom";

export default function Footer(){
  const year = new Date().getFullYear();
  return (
    <footer className="site-footer">
      <span>Arkaose Chaos Institute - {year}</span>
      <nav>
        <Link to="/sobre">Sobre</Link>
        <Link to="/como-funciona">Como funciona</Link>
      </nav>
    </footer>
  );
}
