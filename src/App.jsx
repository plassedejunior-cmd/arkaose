// src/App.jsx
import { useEffect, useRef, useState } from "react";
import { Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import HudForm from "./components/HudForm";
import ChaosCanvas from "./components/ChaosCanvas";
import AdBox from "./components/AdBox";

import MobileChaosDrawer from "./components/MobileChaosDrawer";
import { getDailyAdvice } from "./lib/weatherAdvice";
import ComoFunciona from "./pages/ComoFunciona";
import Sobre from "./pages/Sobre";
import Historico from "./pages/Historico";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Forgot from "./pages/Forgot";
import Reset from "./pages/Reset";
import Profile from "./pages/Profile";
import NovaCompra from "./pages/NovaCompra";
import AppHome from "./pages/AppHome";

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

export default function App() {
  const initialIsDesktop =
    typeof window !== "undefined"
      ? window.matchMedia("(min-width: 720px)").matches
      : true;

  const [runKey, setRunKey] = useState(0);
  // geolocalizacao + clima (sem UI)
  const { status: geoStatus, coords: geoCoords } = useGeolocation({ requestOnMount: true });
  const { weather } = useWeather({ coords: geoCoords });

  // animacao
  const [running, setRunning] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [speedMul, setSpeedMul] = useState(1.0);

  // resultado
  const [result, setResult] = useState({
    alreadyMsg: "",
    bigCounter: "0000",
    rangeBadge: { key: "", label: "-" },
    rangeDesc: "",
    inflMsg: "",
    signoTrad: "-",
    signoChaos: "-",
    traits: [],
    fortune: "",
    advice: "",
  });
  const [resultReady, setResultReady] = useState(false);

  const [isDesktop, setIsDesktop] = useState(initialIsDesktop);
  const [drawerExpanded, setDrawerExpanded] = useState(!initialIsDesktop);

  // refs
  const lastInputRef = useRef(null);
  const timerRef = useRef(null);
  const canvasRef = useRef(null);

  // breakpoint listener
  useEffect(() => {
    const media = window.matchMedia("(min-width: 720px)");
    const onChange = () => {
      setIsDesktop(media.matches);
      setDrawerExpanded(!media.matches);
    };
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  function handleStart({ dob, hh, mm }) {
    if (!dob || hh === "" || mm === "") {
      alert("Preencha data e hora do nascimento.");
      return;
    }

    lastInputRef.current = { dob, hh, mm };

    const cached = getCached(dob, hh, mm);
    if (cached) {
      showResults({ dob, cached, already: true });
      if (!isDesktop) {
        setResultReady(true);
        setDrawerExpanded(true);
      }
      setRunning(false);
      setSeconds(0);
      clearInterval(timerRef.current);
      return;
    }

    const dayStamp = localDayStr();
    const seed = hashStr(`${dayStamp}|${dob}|${hh}:${mm}`);
    const rng = mulberry32(seed);
    const chaosNum = Math.floor(rng() * 2000) + 1;
    const phraseIdx = Math.floor(rng() * 90);
    const speed = 1.0 + rng() * 1.2;
    const traits = pickDistinct(rng, TRAITS_POOL, 3);

    const newCached = { chaosNum, phraseIdx, speedMul: speed, traits };
    setCached(dayStamp, dob, hh, mm, newCached);

    setRunKey((k) => k + 1);
    setSpeedMul(speed);
    setRunning(true);
    setSeconds(20);
    setResultReady(false);
    if (!isDesktop) setDrawerExpanded(false);

    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setSeconds((value) => {
        const next = value - 1;
        if (next <= 0) {
          clearInterval(timerRef.current);
          setRunning(false);
          showResults({ dob, cached: newCached, already: false });
        }
        return Math.max(0, next);
      });
    }, 1000);
  }

  function showResults({ dob, cached, already }) {
    const st = signoTropical(dob);
    const { signo: sc, casas } = chaosSignFromBuckets(st, cached.chaosNum);
    const combo = composeDualTraitsMessage(st, sc, casas, dob);
    const badge = rangeInfo(cached.chaosNum);

    const hh = lastInputRef.current?.hh ?? "";
    const mm = lastInputRef.current?.mm ?? "";
    const seedKey = `${localDayStr()}|${dob}|${hh}:${mm}`;
    const meta = { dayStr: seedKey, lat: weather?.lat, lng: weather?.lng };

    let adviceObj = cached?.advice;
    if (!adviceObj || !adviceObj.text) {
      adviceObj = getDailyAdvice(weather?.current, meta);
    }
    if (!adviceObj || !adviceObj.text) {
      adviceObj = getDailyAdvice(weather?.current, meta);
    }

    const finalAdvice = adviceObj?.text || "";
    if (adviceObj) {
      const updatedCache = { ...cached, advice: adviceObj };
      setCached(localDayStr(), dob, hh, mm, updatedCache);
    }

    setResult({
      alreadyMsg: already ? "Voce ja mediu o seu caos hoje. O caos se acalma a meia-noite." : "",
      bigCounter: String(cached.chaosNum),
      rangeBadge: { key: badge.key, label: badge.label },
      rangeDesc: badge.blurb,
      inflMsg: combo.message,
      signoTrad: st,
      signoChaos: sc,
      advice: finalAdvice,
    });

    setResultReady(true);
    if (!isDesktop) {
      setDrawerExpanded(true);
    }
  }

  return (
    <div>
      <Header />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot" element={<Forgot />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/nova-compra" element={<NovaCompra />} />
        <Route path="/reset" element={<Reset />} />
        <Route path="/app" element={<AppHome />} />
        <Route path="/como-funciona" element={<ComoFunciona />} />
        <Route path="/sobre" element={<Sobre />} />
        <Route path="/historico" element={<Historico />} />
        <Route
          path="/"
          element={
            <div className="main-grid">
              {isDesktop ? null : (
                <div className="stage">
                  <ChaosCanvas
                    key={runKey}
                    ref={canvasRef}
                    running={running}
                    speedMul={speedMul}
                  />
                </div>
              )}

              <div className="only-desktop">
                <div className="desktop-layout">
                  <HudForm onStart={handleStart} disabled={running} />

                  <ResultsSidebarDesktop
                    data={result}
                    running={running}
                    seconds={seconds}
                    resultReady={resultReady}
                    canvasRef={canvasRef}
                    canvasKey={runKey}
                    speedMul={speedMul}
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
          }
        />
      </Routes>
 
      <Footer />
    </div>
  );
}










