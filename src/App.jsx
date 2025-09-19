// src/App.jsx
import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { Link } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import HudForm from "./components/HudForm";
import ChaosCanvas from "./components/ChaosCanvas";

import MobileChaosDrawer from "./components/MobileChaosDrawer";
import { buildWeatherAdvice, buildGenericAdvice,  getDailyAdvice   } from "./lib/weatherAdvice";
import ComoFunciona from "./pages/ComoFunciona";
import Sobre from "./pages/Sobre";

import { getCached, setCached, localDayStr } from "./lib/storage";
import { mulberry32, hashStr, pickDistinct } from "./lib/rng";


import { TRAITS_POOL } from "./lib/constants";

import {
  signoTropical,
  chaosSignFromBuckets,
  rangeInfo,
  composeDualTraitsMessage,
} from "./lib/chaosLogic";

import useGeolocation from "./hooks/useGeolocation";
import useWeather from "./hooks/useWeather";

import ResultsSidebarDesktop from "./components/ResultsSidebarDesktop";
import Historico from "./pages/Historico";

export default function App() {
  const { pathname } = useLocation();
  const initialIsDesktop =
  typeof window !== "undefined"
    ? window.matchMedia("(min-width: 720px)").matches
    : true;
 
 const [runKey, setRunKey] = useState(0);
  // geolocalização + clima (sem UI)
  const { status: geoStatus, coords: geoCoords } = useGeolocation({ requestOnMount: true });
  const { weather } = useWeather({ coords: geoCoords });

  // animação
  const [running, setRunning] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [speedMul, setSpeedMul] = useState(1.0);

  // resultado
  const [result, setResult] = useState({
    alreadyMsg: "",
    bigCounter: "0000",
    rangeBadge: { key: "", label: "—" },
    rangeDesc: "",
    inflMsg: "",
    signoTrad: "—",
    signoChaos: "—",
    traits: [],
    fortune: "", // não exibimos mais
    advice: "",
  });
  const [resultReady, setResultReady] = useState(false);

  // desktop modal
  const [modalOpen, setModalOpen] = useState(false);

  // plataforma
 
  const [isDesktop, setIsDesktop] = useState(initialIsDesktop);
const [drawerExpanded, setDrawerExpanded] = useState(!initialIsDesktop); // <- mobile inicia expandido

  // refs
  const lastInputRef = useRef(null);
  const timerRef = useRef(null);
  const canvasRef = useRef(null);
 

  // breakpoint listener
useEffect(() => {
  const m = window.matchMedia("(min-width: 720px)");
  const onChange = () => {
    setIsDesktop(m.matches);
    setDrawerExpanded(!m.matches); // mobile => expandido; desktop => recolhido
  };
  m.addEventListener("change", onChange);
  return () => m.removeEventListener("change", onChange);
}, []);

 function handleStart({ dob, hh, mm }) {
  if (!dob || hh === "" || mm === "") {
    alert("Preencha data e hora do nascimento.");
    return;
  }

  // guarda última entrada (usado no drawer)
  lastInputRef.current = { dob, hh, mm };

  // 1) Se já existe cache para esse DOB+HH:MM no dia atual → mostra direto
  const cached = getCached(dob, hh, mm);
  if (cached) {
    // monta e exibe o resultado imediatamente
    showResults({ dob, cached, already: true });

    // no mobile, já deixa o drawer pronto e expandido
    if (!isDesktop) {
      setResultReady(true);
      setDrawerExpanded(true);
    }

    // garante que nenhum contador/loop esteja ativo
    setRunning(false);
    setSeconds(0);
    clearInterval(timerRef.current);
    return;
  }

  // 2) Não há cache → gera números determinísticos para hoje + entrada
  const seed = hashStr(`${localDayStr()}|${dob}|${hh}:${mm}`);
  const rng = mulberry32(seed);
  const chaosNum  = Math.floor(rng() * 2000) + 1;
  const phraseIdx = Math.floor(rng() * 90);         // se ainda usar em algum lugar
  const speed     = 1.0 + rng() * 1.2;
  const traits    = pickDistinct(rng, TRAITS_POOL, 3);

  const newCached = { chaosNum, phraseIdx, speedMul: speed, traits };
  setCached(dob, hh, mm, newCached);

  // 3) Prepara UI / animação
  setRunKey(k => k + 1);   // força reset do canvas
  setSpeedMul(speed);
  setRunning(true);
  setSeconds(20);
  setResultReady(false);
  if (!isDesktop) setDrawerExpanded(false); // começa “fechado” enquanto mede

  clearInterval(timerRef.current);
  timerRef.current = setInterval(() => {
    setSeconds((s) => {
      const n = s - 1;
      if (n <= 0) {
        clearInterval(timerRef.current);
        setRunning(false);
        // showResults cuida de expandir o drawer no mobile ao final
        showResults({ dob, cached: newCached, already: false });
      }
      return Math.max(0, n);
    });
  }, 1000);
}




function showResults({ dob, cached, already }) {
  // — Signos / mensagens —
  const st = signoTropical(dob);
  const { signo: sc, casas } = chaosSignFromBuckets(st, cached.chaosNum);
  const combo = composeDualTraitsMessage(st, sc, casas, dob);
  const badge = rangeInfo(cached.chaosNum);

  // — Seed amarrado ao input do usuário (mesma ideia do handleStart) —
  const hh = lastInputRef.current?.hh ?? "";
  const mm = lastInputRef.current?.mm ?? "";
  const seedKey = `${localDayStr()}|${dob}|${hh}:${mm}`;
  const meta = { dayStr: seedKey, lat: weather?.lat, lng: weather?.lng };

  // 1) tenta usar o que veio salvo no cache da medição
  let adviceObj = cached?.advice;

  // 2) se o cache não tiver (ou vier malformado), calcula agora
  if (!adviceObj || !adviceObj.text) {
    adviceObj = getDailyAdvice(weather?.current, meta);
  }

  // 3) Fallback final: se ainda assim não houver texto, use genérico
  if (!adviceObj || !adviceObj.text) {
  console.debug("", {
    category: weather?.current?.category,
    code: weather?.current?.weathercode
  });
  adviceObj = getDailyAdvice(weather?.current, meta);
}

  const finalAdvice = adviceObj.text || "";

  // — Monta resultado para UI —
  setResult({
    alreadyMsg: already ? "Você já mediu o seu caos hoje. O caos se acalma à meia-noite." : "",
    bigCounter: String(cached.chaosNum),
    rangeBadge: { key: badge.key, label: badge.label },
    rangeDesc: badge.blurb,
    inflMsg: combo.message,
    signoTrad: st,
    signoChaos: sc,
    advice: finalAdvice,
  });

   if (isDesktop) {
    setModalOpen(true);
  } else {
    setResultReady(true);
    setDrawerExpanded(true);   // <- expandir ao mostrar resultado no mobile
  }
}





  const isHome = pathname === "/";

  return (
    <div
      style={{
        minHeight: "100dvh",
        position: "relative",
        display: "grid",
        gridTemplateRows: "auto 1fr auto",
      }}
    >
      <Header />
{pathname === "/como-funciona" ? (<ComoFunciona />) : 
pathname === "/sobre" ? (<Sobre />) : 
pathname === "/historico" ? (<Historico />) : 


(
  <div className="main-grid">
    {/* Coluna principal (canvas) */}
    <div className="stage">
     <ChaosCanvas
  key={runKey}          // <-- isto força o reset/limpeza
  ref={canvasRef}
  running={running}
  speedMul={speedMul}
/>
    </div>

    {/* Coluna direita (HUD + resultados, só desktop) */}
    <div className="only-desktop">
      <div className="sidebar">
        <div className="panel">
          <HudForm onStart={handleStart} disabled={running} />
        </div>

        <ResultsSidebarDesktop
          data={result}
          running={running}
          seconds={seconds}
        />
      </div>
    </div>

   
 {!isDesktop && (
  <MobileChaosDrawer
    open={true}
    expanded={drawerExpanded}
    onExpandedChange={setDrawerExpanded}
    running={running}
    seconds={seconds}
    lastInput={lastInputRef.current}
    resultReady={resultReady}
    result={result}
    canvasRef={canvasRef}
    onStart={handleStart}
  />
)}

  </div>
)}

      <Footer />
    </div>
  );
}
