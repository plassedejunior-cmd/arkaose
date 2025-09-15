import { useState } from "react";
import { renderShareCard } from "../lib/shareCard";

/**
 * Modal de resultados (acessível e responsivo).
 *
 * Props:
 *  - open: boolean
 *  - onClose: () => void
 *  - data: {
 *      alreadyMsg: string,
 *      bigCounter: string,
 *      rangeBadge: { key:string, label:string },
 *      rangeDesc: string,
 *      inflMsg: string,
 *      signoTrad: string,
 *      signoChaos: string,
 *      traits: string[],
 *      fortune: string,
 *      advice: string
 *    }
 *  - canvasRef: React.RefObject<HTMLCanvasElement>  // para capturar o desenho no compartilhamento
 */
export default function ResultsModal({ open, onClose, data, canvasRef }) {
  if (!open) return null;

  const {
    alreadyMsg,
    bigCounter,
    rangeBadge,
    rangeDesc,
    inflMsg,
    signoTrad,
    signoChaos,
    traits = [],
    fortune,
    advice,
  } = data || {};

  const [busy, setBusy] = useState(false);

  async function handleShare() {
    try {
      setBusy(true);
      const { blob, dataUrl } = await renderShareCard({
        canvasEl: canvasRef?.current,
        title: "Seu signo no caos",
        chaosSign: signoChaos,
        influenceText: inflMsg,
        brandPlaceholder: "sua marca", // espaço reservado para logo
      });

      // Tenta compartilhar nativo (mobile); se não der, baixa o PNG
      const file = new File([blob], "chaos-card.png", { type: "image/png" });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: "Chaos Pendulum" });
      } else {
        const a = document.createElement("a");
        a.href = dataUrl;
        a.download = "chaos-card.png";
        a.click();
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className="modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="results-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <div className="modal" role="document">
        {/* Cabeçalho */}
        <div className="modal-head">
          <h2 className="modal-title" id="results-title">Resultados do dia</h2>
          {alreadyMsg ? (
            <div
              style={{
                marginTop: ".5rem",
                padding: ".4rem .6rem",
                border: "1px solid #2a3c5a",
                borderRadius: ".5rem",
                fontSize: ".9rem",
                opacity: 0.9,
              }}
            >
              {alreadyMsg}
            </div>
          ) : null}
        </div>

        {/* Corpo com overflow customizado */}
        <div className="modal-body overflow-soft">
          {/* Intensidade */}
          <div className="section" aria-labelledby="box-msg-title">
            <h3 className="h2" id="box-msg-title">
              A influência caótica sobre VOCÊ hoje é de:
            </h3>
                
            <div className="result-head">
            <div className="bigCounter">{bigCounter}</div>
                <span className={`chip ${rangeBadge?.key || ""}`}>
                 {rangeBadge?.label ?? "—"}
                </span>
            </div>
            <p className="p" style={{ marginTop: ".3rem", opacity: 0.9 }}>{rangeDesc}</p>

          </div>

          {/* Signos (mesma linha + scroll horizontal suave) */}
          <div className="section" aria-labelledby="box-infl-title" style={{ marginTop: ".9rem" }}>
            <h3 className="h2" id="box-infl-title">A influência caótica sobre SEU SIGNO hoje é de:</h3>

            <p className="p" style={{ marginTop: ".6rem", opacity: 0.9 }}>{inflMsg}</p>

            <div className="signos-row overflow-soft" style={{ marginTop: ".6rem" }}>
              <div className="signo"><b>Signo:</b> <span>{signoTrad}</span></div>
              <div className="seta">→</div>
              <div className="signo"><b>Signo no caos:</b> <span>{signoChaos}</span></div>
            </div>
          </div>

          {/* Traços */}
          <div className="section" aria-labelledby="box-traits-title" style={{ marginTop: ".9rem" }}>
            <h3 className="h2" id="box-traits-title">Traços do dia</h3>
            <div
              className="grid overflow-soft"
              style={{
                gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
                marginTop: ".6rem",
              }}
            >
              {traits.slice(0, 3).map((t, i) => (
                <span
                  key={i}
                  className="tag"
                  style={{
                    background: "#111a28",
                    border: "1px solid #24344e",
                    padding: ".35rem .6rem",
                    borderRadius: ".55rem",
                    fontSize: "clamp(.85rem,.8rem + .2vw,.95rem)",
                  }}
                >
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* Frase + conselho */}
          <div className="section" aria-labelledby="box-phrase-title" style={{ marginTop: ".9rem" }}>
            <h3 className="h2" id="box-phrase-title">Frase do dia</h3>
            <p className="p" style={{ marginTop: ".6rem" }}>{fortune}</p>
            <p className="p" style={{ opacity: 0.9 }}>{advice}</p>
          </div>
        </div>

        {/* Ações (rodapé) */}
       <div className="actions">
        <button className="closebtn" onClick={handleShare} disabled={busy}>
        {busy ? "Gerando..." : "Compartilhar"}
        </button>
        <button className="closebtn" onClick={onClose}>Fechar</button>
        </div>
      </div>
    </div>
  );
}
