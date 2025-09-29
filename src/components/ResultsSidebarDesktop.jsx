// src/components/ResultsSidebarDesktop.jsx
import ChaosIntensityBar from "./ChaosIntensityBar";

export default function ResultsSidebarDesktop({ data, running, seconds }) {
  if (running) {
    return (
      <aside className="sidebar only-desktop" aria-label="Resultados">
        <div className="panel">
          <h3 className="title">Medindo…</h3>
          <p style={{ opacity: .9, marginTop: ".2rem" }}>
            O pêndulo está medindo a influência do caos.
          </p>
          <div className="chip" style={{ marginTop: ".6rem" }}>
            {String(seconds).padStart(2, "0")}s
          </div>
        </div>
      </aside>
    );
  }

  if (!data) return null;

  return (
    <aside className="sidebar only-desktop" aria-label="Resultados">
      {/* Intensidade */}
 
        <ChaosIntensityBar value={Number(data.bigCounter)} />
      
      {/* Signo no caos */}
      <div className="panel">
        <div className="title-row">
          <h3 className="title">Seu signo no caos</h3>
          <span className="chip">{data.signoChaos || "—"}</span>
        </div>
        <p style={{ opacity: .9, marginTop: ".6rem" }}>{data.inflMsg}</p>
      </div>

      {/* Conselho */}
      <div className="panel">
        <h3 className="title">Conselho do dia</h3>
        <p style={{ opacity: .95 }}>{data.advice}</p>
      </div>
    </aside>
  );
}
