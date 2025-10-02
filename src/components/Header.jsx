// src/components/Header.jsx
import { useState } from "react";
import { Link } from "react-router-dom";
import MobileDrawer from "./MobileDrawer";
import logoFull from "../assets/images/logofull.svg";

const SOCIAL_LINKS = [
  { href: "https://www.instagram.com/arkaose", label: "Instagram", icon: "IG" },
  { href: "https://www.tiktok.com/@arkaose", label: "TikTok", icon: "TT" },
  { href: "https://www.youtube.com/@arkaose", label: "YouTube", icon: "YT" },
];

export default function Header(){
  const [open, setOpen] = useState(false);

  return (
    <>
      <header className="topbar">
        <div className="topbar-inner">
          <Link to="/" className="brand-pill" aria-label="Ir para a Home">
            <span className="brand-icon">
              <img src={logoFull} alt="" aria-hidden="true" />
            </span>
            
          </Link>

          <nav className="nav" aria-label="principal">
            <Link to="/historico" className="pill pill--outline">Histórico</Link>
            <div className="social">
              {SOCIAL_LINKS.map(({ href, label, icon }) => (
                <a key={href} href={href} target="_blank" rel="noopener noreferrer" aria-label={label}>
                  <span aria-hidden="true">{icon}</span>
                </a>
              ))}
            </div>
          </nav>

          <button
            className="menu-btn pill pill--ghost"
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

