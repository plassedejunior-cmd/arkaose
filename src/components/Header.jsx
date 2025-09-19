// src/components/Header.jsx
import { useState } from "react";
import { Link } from "react-router-dom";
import MobileDrawer from "./MobileDrawer";

export default function Header(){
  const [open, setOpen] = useState(false);

  return (
    <>
      <header className="topbar">
        <div className="topbar-inner">
          {/* logo clicável → home */}
          <h1 className="brand">
            <Link to="/" className="brand-link" aria-label="Ir para a Home">
              Chaos<br/>Pendulum
            </Link>
          </h1>

          <nav className="nav" aria-label="principal">
            <ul className="nav-list">
              <Link to="/como-funciona">Como funciona</Link>
              <Link to="/sobre">Sobre</Link>
              <Link to="/historico">Historico</Link>
            </ul>
          </nav>

          <button
            className="menu-btn"
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen(true)}
          >
            ☰
          </button>
        </div>
      </header>

      <MobileDrawer open={open} onClose={() => setOpen(false)} />
    </>
  );
}

