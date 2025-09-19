import { useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";

const NAV_LINKS = [
  { to: "/", label: "Inicio" },
  { to: "/como-funciona", label: "Como funciona" },
  { to: "/sobre", label: "Sobre" },
  { to: "/historico", label: "Historico" },
];

export default function MobileDrawer({ open, onClose }) {
  const panelRef = useRef(null);
  const { pathname } = useLocation();

  useEffect(() => {
    if (!open) return;

    const onKey = (event) => {
      if (event.key === "Escape") onClose?.();
    };

    const previousOverflow = document.body.style.overflow;
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    const el = panelRef.current;
    if (el) {
      requestAnimationFrame(() => el.focus());
    }
  }, [open]);

  const handleNavigate = () => {
    onClose?.();
  };

  return (
    <>
      <div
        className={`menu-backdrop ${open ? "open" : ""}`}
        onClick={() => onClose?.()}
        aria-hidden
      />
      <aside
        ref={panelRef}
        tabIndex={-1}
        className={`menu-drawer ${open ? "open" : ""}`}
        role="dialog"
        aria-modal={open ? "true" : undefined}
        aria-label="Navegacao movel"
        aria-hidden={!open}
      >
        <header className="menu-drawer-head">
          <span className="menu-drawer-title">Chaos Pendulum</span>
          <button
            type="button"
            className="menu-drawer-close"
            onClick={() => onClose?.()}
          >
            Fechar
          </button>
        </header>

        <nav className="menu-drawer-nav" aria-label="Secoes do site">
          <ul>
            {NAV_LINKS.map(({ to, label }) => {
              const isActive = pathname === to;
              return (
                <li key={to}>
                  <Link
                    to={to}
                    className={`menu-link ${isActive ? "active" : ""}`}
                    aria-current={isActive ? "page" : undefined}
                    onClick={handleNavigate}
                  >
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>
    </>
  );
}

