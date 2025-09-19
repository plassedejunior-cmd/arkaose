// src/pages/Historico.jsx
import { useEffect, useState } from "react";
import { historyStore, getCached } from "../lib/storage";
import { buildResultData } from "../lib/resultBuilder";

export default function Historico() {
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    setItems(historyStore.list());
  }, []);

  function handleSelect(entry) {
    if (!entry || entry.hh == null || entry.mm == null || !entry.dateStamp) {
      setError("Registro incompleto.");
      setSelected(null);
      return;
    }
    const cached = getCached(entry.dob, entry.hh, entry.mm, entry.dateStamp);
    if (!cached) {
      setError("Não foi possível recuperar esta medição. Talvez o cache tenha sido limpo.");
      setSelected(null);
      return;
    }
    setError("");
    setSelected({
      entry,
      result: buildResultData({ dob: entry.dob, cached, already: true }),
    });
  }

  return (
    <main className="page" id="historico">
      <article className="prose" style={{ display: "grid", gap: "1.5rem" }}>
        <header>
          <h1>Histórico de medições</h1>
          <p>
            Selecione uma entrada para rever o resultado correspondente neste dispositivo.
          </p>
        </header>

        {items.length === 0 ? (
          <p className="p" style={{ opacity: 0.85 }}>
            Nenhum registro encontrado. Faça uma medição para começar o histórico.
          </p>
        ) : (
          <div className="history-layout">
            {/* Lista à esquerda */}
            <div className="history-list" role="list">
              {items.map((item) => (
                <button
                  type="button"
                  key={item.cacheKey}
                  className={`history-item${
                    selected?.entry.cacheKey === item.cacheKey ? " active" : ""
                  }`}
                  onClick={() => handleSelect(item)}
                >
                  <span className="history-date">{item.dateStamp}</span>
                  <span className="history-time">
                    {item.hh}:{item.mm}
                  </span>
                  <span className="history-dob">DOB: {item.dob}</span>
                </button>
              ))}
            </div>

            {/* Detalhe à direita (mesmo visual da sidebar) */}
            <div className="history-detail">
              {error ? (
                <div className="panel" style={{ borderColor: "#4c2b2b", background: "#150f14" }}>
                  <p className="p" style={{ color: "#ffb4b4" }}>{error}</p>
                </div>
              ) : selected ? (
                <>
                  {/* Meta do registro (compacto) */}
                  <div className="panel">
                    <h3 className="title">Medição</h3>
                    <p style={{ opacity: 0.85, marginTop: ".4rem" }}>
                      Data: <b>{selected.entry.dateStamp}</b> &nbsp;•&nbsp; Hora informada:{" "}
                      <b>{selected.entry.hh}:{selected.entry.mm}</b> &nbsp;•&nbsp; DOB:{" "}
                      <b>{selected.entry.dob}</b>
                    </p>
                  </div>

                  {/* Intensidade (igual à sidebar) */}
                  <div className="panel">
                    <h3 className="title">Intensidade</h3>
                    <div className="result-head">
                      <div className="big">{selected.result.bigCounter}</div>
                      <span className={`chip ${selected.result.rangeBadge?.key || ""}`}>
                        {selected.result.rangeBadge?.label || "—"}
                      </span>
                    </div>
                    <p style={{ opacity: 0.9, marginTop: ".5rem" }}>
                      {selected.result.rangeDesc}
                    </p>
                  </div>

                  {/* Signo no caos (igual à sidebar) */}
                  <div className="panel">
                    <div className="title-row">
                      <h3 className="title">Seu signo no caos</h3>
                      <span className="chip">
                        {selected.result.signoChaos || "—"}
                      </span>
                    </div>
                    <p style={{ opacity: 0.9, marginTop: ".6rem" }}>
                      {selected.result.inflMsg}
                    </p>
                  </div>

                  {/* Conselho do dia (sem fortune) */}
                  <div className="panel">
                    <h3 className="title">Conselho do dia</h3>
                    <p style={{ opacity: 0.95 }}>
                      {selected.result.advice}
                    </p>
                  </div>
                </>
              ) : (
                <p className="p" style={{ opacity: 0.85 }}>
                  Selecione uma medição para ver os detalhes.
                </p>
              )}
            </div>
          </div>
        )}
      </article>
    </main>
  );
}
