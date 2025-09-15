// src/App.jsx
import { useRef, useState } from "react";
import HudForm from "./components/HudForm";
import ChaosCanvas from "./components/ChaosCanvas";
import ResultsModal from "./components/ResultsModal";

import { getCached, setCached, localDayStr } from "./lib/storage";
import { mulberry32, hashStr, pickDistinct } from "./lib/rng";
import { TRAITS_POOL } from "./lib/constants";
import {
  signoTropical,
  chaosSignFromBuckets,
  rangeInfo,
  composeDualTraitsMessage,
  phraseByIdx,
  adviceByIdx,
} from "./lib/chaosLogic";

/**
 * App:
 * - Inicia medição (20s) com animação do canvas.
 * - Gera resultado determinístico por dia+entrada (cache diário).
 * - Abre modal com dados e botão Compartilhar (gera cartão com o frame do canvas).
 */
export default function App() {
  const [running, setRunning] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [speedMul, setSpeedMul] = useState(1.0);

  const [modalOpen, setModalOpen] = useState(false);
  const [result, setResult] = useState({
    alreadyMsg: "",
    bigCounter: "0000",
    rangeBadge: { key: "", label: "—" },
    rangeDesc: "",
    inflMsg: "",
    signoTrad: "—",
    signoChaos: "—",
    traits: [],
    fortune: "",
    advice: "",
  });

  const lastInputRef = useRef(null);
  const timerRef = useRef(null);
  const canvasRef = useRef(null); // para o botão Compartilhar capturar o desenho

  function handleStart({ dob, hh, mm }) {
    if (!dob || hh === "" || mm === "") {
      alert("Preencha data, hora e minuto do nascimento.");
      return;
    }
    lastInputRef.current = { dob, hh, mm };

    // 1) Já mediu hoje? Reabre direto.
    const cached = getCached(dob, hh, mm);
    if (cached) {
      showResults({ dob, cached, already: true });
      return;
    }

    // 2) Gera (seed por dia local + entrada)
    const seed = hashStr(`${localDayStr()}|${dob}|${hh}:${mm}`);
    const rng = mulberry32(seed);
    const chaosNum = Math.floor(rng() * 2000) + 1; // 1..2000
    const phraseIdx = Math.floor(rng() * 90);      // ok se sua lista tem 90; senão, o modulo na leitura corrige
    const speed = 1.0 + rng() * 1.2;               // 1.0..2.2
    const pick = pickDistinct(rng, TRAITS_POOL, 3);

    const newCached = { chaosNum, phraseIdx, speedMul: speed, traits: pick };
    setCached(dob, hh, mm, newCached);

    // 3) Anima por 20s
    setSpeedMul(speed);
    setRunning(true);
    setSeconds(20);

    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setSeconds((s) => {
        const n = s - 1;
        if (n <= 0) {
          clearInterval(timerRef.current);
          setRunning(false);
          showResults({ dob, cached: newCached, already: false });
        }
        return Math.max(0, n);
      });
    }, 1000);
  }

  function showResults({ dob, cached, already }) {
    const st = signoTropical(dob);
    const { signo: sc, casas } = chaosSignFromBuckets(st, cached.chaosNum);
    const combo = composeDualTraitsMessage(st, sc, casas, dob);

    const badge = rangeInfo(cached.chaosNum);
    const fortune = phraseByIdx(cached.phraseIdx);
    const advice = adviceByIdx(cached.phraseIdx + cached.chaosNum);

    setResult({
      alreadyMsg: already
        ? "Você já mediu o seu caos hoje. O caos se acalma à meia-noite."
        : "",
      bigCounter: String(cached.chaosNum),
      rangeBadge: { key: badge.key, label: badge.label },
      rangeDesc: badge.blurb,
      inflMsg: combo.message,
      signoTrad: st,
      signoChaos: sc,
      traits: cached.traits,
      fortune,
      advice,
    });
    setModalOpen(true);
  }

  return (
    <div style={{ minHeight: "100dvh", position: "relative" }}>
      {/* Canvas de fundo (exposto via ref para compartilhar) */}
      <ChaosCanvas ref={canvasRef} running={running} speedMul={speedMul} />

      {/* HUD por cima */}
      <HudForm onStart={handleStart} disabled={running} />

      {/* Barra de status durante medição */}
      {running && (
        <div className="status" aria-live="polite">
          <div className="status-inner">
            <span>O pêndulo está medindo o seu caos…</span>
            <span className="timer">{seconds}</span>
          </div>
        </div>
      )}

      {/* Feedback simples quando parado */}
      {!running && lastInputRef.current && (
        <div className="container" style={{ position: "relative", zIndex: 1, marginTop: "6rem" }}>
          <section className="section">
            <h2 className="h2">Status</h2>
            <p className="p" style={{ marginTop: ".5rem", opacity: 0.9 }}>
              Pronto. Última entrada: DOB={lastInputRef.current.dob}{" "}
              {lastInputRef.current.hh}:{lastInputRef.current.mm}
            </p>
          </section>
        </div>
      )}

      {/* Modal de resultados (com botão Compartilhar) */}
      <ResultsModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        data={result}
        canvasRef={canvasRef}
      />
    </div>
  );
}
