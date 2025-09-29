// src/components/Header.jsx
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import MobileDrawer from "./MobileDrawer";

const userButtonStyle = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "0.4rem 0.75rem",
  borderRadius: "0.6rem",
  border: "1px solid #2a3c5a",
  background: "#152238",
  color: "#cfe6ff",
  fontWeight: 700,
  cursor: "pointer",
};

const dropdownStyle = {
  position: "absolute",
  right: 0,
  top: "calc(100% + 8px)",
  background: "#0f1726",
  border: "1px solid #233656",
  borderRadius: "8px",
  padding: "0.5rem 0",
  minWidth: "180px",
  boxShadow: "0 12px 24px rgba(0,0,0,0.35)",
  zIndex: 150,
};

const dropdownLinkStyle = {
  display: "block",
  padding: "0.45rem 1rem",
  color: "#cfe6ff",
  textDecoration: "none",
  fontWeight: 600,
};

export default function Header(){
  const [open, setOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  useEffect(() => {
    if (!userMenuOpen) return;

    const onPointerDown = (event) => {
      if (!userMenuRef.current) return;
      if (!userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    };

    window.addEventListener("pointerdown", onPointerDown);
    return () => window.removeEventListener("pointerdown", onPointerDown);
  }, [userMenuOpen]);

  return (
    <>
      <header className="topbar">
        <div className="topbar-inner">
          {/* logo clicavel -> home */}
          <h1 className="brand">
            <Link to="/" className="brand-link" aria-label="Ir para a Home">
              Chaos<br/>Pendulum
            </Link>
          </h1>

          <nav className="nav" aria-label="principal">
            <ul className="nav-list">
              <li>
                <Link to="/como-funciona">Como funciona</Link>
              </li>
              <li>
                <Link to="/sobre">Sobre</Link>
              </li>
              <li>
                <Link to="/historico">Historico</Link>
              </li>
            </ul>
          </nav>

          <div
            ref={userMenuRef}
            style={{ position: "relative", marginLeft: "auto", marginRight: "1rem" }}
          >
           {/*  <button
              type="button"
              aria-haspopup="true"
              aria-expanded={userMenuOpen}
              onClick={() => setUserMenuOpen((value) => !value)}
              style={userButtonStyle}
            >
              Area logada
            </button> */}
            {userMenuOpen && (
              <div style={dropdownStyle} role="menu" aria-label="Opcoes da area logada">
                <Link to="/profile" style={dropdownLinkStyle} onClick={() => setUserMenuOpen(false)}>
                  Meu perfil
                </Link>
                <Link to="/reset" style={dropdownLinkStyle} onClick={() => setUserMenuOpen(false)}>
                  Redefinir senha
                </Link>
                <Link to="/nova-compra" style={dropdownLinkStyle} onClick={() => setUserMenuOpen(false)}>
                  Criar compra
                </Link>
                <Link to="/login" style={dropdownLinkStyle} onClick={() => setUserMenuOpen(false)}>
                  Acessar area logada
                </Link>
              </div>
            )}
          </div>

          <button
            className="menu-btn"
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen(true)}
          >
            Menu
          </button>
        </div>
      </header>

      <MobileDrawer open={open} onClose={() => setOpen(false)} />
    </>
  );
}