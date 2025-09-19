// src/components/ResultsSidebarDesktop.jsx
export default function ResultsSidebarDesktop({ data, running, seconds }) {
  // quando estiver medindo, mostra status simples
  if (running) {
    return (
      <aside className="sidebar only-desktop" aria-label="Resultados">
        <div className="panel">
          <h3 className="title">Medindo…</h3>
          <p style={{opacity:.9, marginTop:".2rem"}}>
            O pêndulo está medindo a influência do caos.
          </p>
          <div className="chip" style={{marginTop:".6rem"}}>
            {String(seconds).padStart(2,"0")}s
          </div>
        </div>
      </aside>
    );
  }

  if (!data) return null;

  return (
    <aside className="sidebar only-desktop" aria-label="Resultados">
      {/* Intensidade */}
    <div className="panel">
  <h3 className="title">Intensidade</h3>

  <div className="result-head">
    <div className="big">{data.bigCounter}</div>
    <span className={`chip ${data.rangeBadge?.key || ""}`}>
      {data.rangeBadge?.label || "—"}
    </span>
  </div>

  <p style={{opacity:.9, marginTop:".5rem"}}>{data.rangeDesc}</p>
</div>


      {/* Signo no caos */}
    <div className="panel">
  <div className="title-row">
    <h3 className="title">Seu signo no caos</h3>
    <span className="chip">{data.signoChaos || "—"}</span>
  </div>
  <p style={{opacity:.9, marginTop:".6rem"}}>{data.inflMsg}</p>
</div>

      {/* Conselho */}
      <div className="panel">
        <h3 className="title">Conselho do dia</h3>
        <p style={{opacity:.95}}>{data.advice}</p>
      </div>
    </aside>
  );
}
