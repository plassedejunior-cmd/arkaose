// src/components/MobileChaosDrawer.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { renderShareCard } from "../lib/shareCard";
import WheelDateTimePicker from "./WheelDateTimePicker";
import ChaosIntensityBar from "./ChaosIntensityBar";
/**
 * Drawer mobile combinado (entrada → medição → resultado → compartilhar).
 *
 * Props:
 *  - open: boolean
 *  - expanded: boolean
 *  - onExpandedChange?: (bool) => void
 *  - running: boolean
 *  - seconds: number
 *  - lastInput: { dob, hh, mm } | null
 *  - resultReady: boolean
 *  - result: { alreadyMsg, bigCounter, rangeBadge, rangeDesc, inflMsg, signoTrad, signoChaos, advice }
 *  - canvasRef: React.RefObject<HTMLCanvasElement>
 *  - onStart: ({ dob, hh, mm }) => void | false
 */
export default function MobileChaosDrawer({
  open,
  expanded,
  onExpandedChange,
  running,
  seconds,
  lastInput,
  resultReady,
  result,
  canvasRef,
  onStart,
}) {
  // ---------- Estado de UI: mostrar formulário (true) ou resultado (false) ----------
  const [showForm, setShowForm] = useState(true);

  // Quando o resultado ficar pronto, escondemos o formulário e mostramos o resultado.
  useEffect(() => {
    if (resultReady) setShowForm(false);
  }, [resultReady]);

  // Se voltar a medir manualmente, mostramos o formulário novamente (ver botão “Medir novamente”)

  // ---------- Estado dos inputs (selects) ----------
  const today = useMemo(() => new Date(), []);
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [day, setDay] = useState(today.getDate());
  const [hour, setHour] = useState(12);
  const [minute, setMinute] = useState(0);
  const [busyShare, setBusyShare] = useState(false);

  const currentYear = today.getFullYear();
  const years = useMemo(() => {
    const list = [];
    for (let y = currentYear; y >= currentYear - 120; y--) list.push(y);
    return list;
  }, [currentYear]);

  const MONTHS = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
  const hours = useMemo(() => [...Array(24)].map((_, i) => i), []);
  const minutes = useMemo(() => [...Array(60)].map((_, i) => i), []);

  const daysInMonth = (m, y) => new Date(y, m, 0).getDate();
  const days = useMemo(() => [...Array(daysInMonth(month, year))].map((_, i) => i + 1), [month, year]);

  // Corrige dia ao trocar mês/ano
  useEffect(() => {
    const max = daysInMonth(month, year);
    if (day > max) setDay(max);
  }, [month, year, day]);

  // Hidrata selects quando houver último input
  useEffect(() => {
    if (!lastInput) return;
    const [y, m, d] = String(lastInput.dob ?? "").split("-").map(Number);
    if (y && m && d) {
      setYear(y); setMonth(m); setDay(d);
    }
    if (lastInput.hh !== undefined) setHour(Number(lastInput.hh));
    if (lastInput.mm !== undefined) setMinute(Number(lastInput.mm));
  }, [lastInput]);

  // Bloqueia scroll do body e ESC contrai/expande (não fecha)
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onExpandedChange?.(false);
    };
    document.addEventListener("keydown", onKey);

    const prev = document.body.style.overflow;
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = prev;

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onExpandedChange]);

  // ---------- Gestos de arrastar a “gaveta” ----------
  const startY = useRef(null);
  function onTouchStart(e) { startY.current = e.touches[0].clientY; }
  function onTouchMove(e) {
    if (startY.current == null) return;
    const dy = e.touches[0].clientY - startY.current;
    if (Math.abs(dy) > 30) {
      onExpandedChange?.(dy < 0); // puxou pra cima => expandir
      startY.current = null;
    }
  }
  function onTouchEnd() { startY.current = null; }

  // ---------- Ações ----------
  function handleStart() {
    const dob = `${year}-${String(month).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
    const hh = String(hour).padStart(2,"0");
    const mm = String(minute).padStart(2,"0");

    const started = onStart?.({ dob, hh, mm });
    if (started !== false) {
      // durante a medição não mostramos o resultado nem o form completo
      setShowForm(false);
     // onExpandedChange?.(true); // contrai para não cobrir o canvas
    }
  }

  function handleMeasureAgain() {
    // volta para o formulário e esconde o resultado
    setShowForm(true);
    onExpandedChange?.(true); // expande para facilitar a edição
  }

  async function handleShare() {
    try {
      setBusyShare(true);
      const { blob, dataUrl } = await renderShareCard({
        canvasEl: canvasRef?.current,
        title: "Seu signo no caos",
        chaosSign: result?.signoChaos,
        influenceText: result?.inflMsg,
        brandPlaceholder: "sua marca",
      });
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
      setBusyShare(false);
    }
  }

  if (!open) return null;

  // ---------- UI ----------
  const showCompact = running || (resultReady && !showForm);

  return (
    <>
      {/* Backdrop nunca “fecha”; só alterna expandido/contraído */}
      <div
        className={`drawer-backdrop ${expanded ? "open" : ""}`}
        onClick={() => onExpandedChange?.(!expanded)}
        aria-hidden
      />

      <section
        className={`drawer ${expanded ? "open" : ""} ${expanded ? "" : "peek"}`}
        role="dialog"
        aria-modal="true"
        aria-label="Medição e resultados"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="drawer-head"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <div className="drawer-grip" />
        </div>

        <div className="drawer-body">
          {/* ======== Estado: medindo ======== */}
          {running && (
            <>
              <h2 className="h2 m-0">O pêndulo está medindo a influência do caos</h2>
             
              <div className="status-inner mt-sm">
                <span>Medindo…</span>
                <span className="timer">{seconds}</span>
              </div>
            </>
          )}

          {/* ======== Estado: resultado pronto (e escondemos o form) ======== */}
          {!running && resultReady && !showForm && (
            <>
              {result?.alreadyMsg ? (
                <div className="alreadyChaos" >{result.alreadyMsg}</div>
              ) : null}
              <h2 className="h2 m-0">Sua influência caótica</h2>
              <ChaosIntensityBar value={Number(result.bigCounter)} />
              <div className="divFlex" style={{ display: showCompact ? "flex" : "center" }}>
                <div className="bigCounter">{result?.bigCounter}</div>
                <span className={`chip ${result?.rangeBadge?.key || ""}`}>
                  {result?.rangeBadge?.label ?? "—"}
                </span>
              </div>

              <p className="p muted">{result?.rangeDesc}</p>

              <div className="section">
                <h3 className="h2">Influência caótica</h3>
                <p className="p muted">{result?.inflMsg}</p>
                <div className="divFlex">
                  <span className="p muted">Signo no caos</span>
                  <span className="chip chip-soft" aria-label="Signo no caos">
                    {result?.signoChaos}
                  </span>
                </div>
              </div>

              <div className="section">
                <h3 className="h2">Conselho do dia</h3>
                <p className="p">{result?.advice}</p>
              </div>

              <div className="actions">
                <button className="closebtn" onClick={handleMeasureAgain}>
                  Medir novamente
                </button>
                <button
                  className="btn-secondary"
                  onClick={handleShare}
                  disabled={busyShare}
                >
                  {busyShare ? "Gerando…" : "Compartilhar"}
                </button>
              </div>
            </>
          )}

         
          {/* ======== Estado: formulário (sem resultado) ======== */}
{!running && showForm && (
  <>
    <div className="section">
      <h3 className="h2">Data e hora de nascimento</h3>
      <WheelDateTimePicker
        value={{ day, month, year, hour, minute }}
        onChange={(next) => {
          setDay(next.day);
          setMonth(next.month);
          setYear(next.year);
          setHour(next.hour);
          setMinute(next.minute);
        }}
      />
    </div>

    <div className="actions">
      <button className="closebtn" onClick={handleStart}>
        Medir a influência caótica
      </button>
    </div>
  </>
)}

        </div>
      </section>
    </>
  );
}
