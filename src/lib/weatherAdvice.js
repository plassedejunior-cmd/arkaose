// src/lib/weatherAdvice.js
import { classifyWMO } from "./weatherMap";
import { WEATHER_ADVICE } from "./weatherAdviceTexts";
import { hashStr } from "./rng";

/** YYYY-MM-DD do fuso local */
function localDayStr() { /* igual ao seu */ }

/** escolhe 1 item de um array de forma estável (determinística) pelo seed */
// util interno do weatherAdvice.js (ou extraia p/ rng.js se preferir)
function pickStable(arr, seed) {
  if (!Array.isArray(arr) || arr.length === 0) return "";
  // índice sempre não-negativo
  const idx = Math.abs(hashStr(String(seed))) % arr.length;
  const val = arr[idx];
  // garante string
  return typeof val === "string" ? val : String(val ?? "");
}


// 👉 helper: checa se temos dados de clima utilizáveis
function hasUsableWeather(w = {}) {
  const hasCodeOrCat = w.weathercode != null || w.category != null;
  const hasSignals = [w.cloudcover, w.precipitation, w.precipitation_probability]
    .some(v => typeof v === "number" && !Number.isNaN(v));
  return hasCodeOrCat || hasSignals;
}

/**
 * Gera conselho baseado SOMENTE no clima do dia.
 * Retorna null se não houver dados suficientes de clima.
 */
// src/lib/weatherAdvice.js

export function buildWeatherAdvice(w = {}, meta = {}) {
  if (!hasUsableWeather(w)) return null;

  const code = w.weathercode ?? null;
  let category =
    w.category ??
    classifyWMO(code, {
      cloudcover: w.cloudcover,
      precipitation: w.precipitation,
      probability: w.precipitation_probability,
    });

  // 🔑 Normalização (resolve "Nublado", "Chuva", etc → cloudy/rainy/sunny)
  const normalizeMap = {
    Nublado: "cloudy",
    "Parcialmente nublado": "cloudy",
    Encoberto: "cloudy",
    Chuva: "rainy",
    Chuvoso: "rainy",
    Ensolarado: "sunny",
    Sol: "sunny",
  };

  if (normalizeMap[category]) {
    category = normalizeMap[category];
  }

  if (!category) return null;

  const dayStr = meta.dayStr || localDayStr();
  const seed = `${dayStr}|${category}|${meta.lat ?? ""},${meta.lng ?? ""}`;

  const list = WEATHER_ADVICE[category] || [];
  if (!list.length) return null;

  const text = pickStable(list, seed);
  const icon = category === "sunny" ? "☀️" : category === "rainy" ? "🌧️" : "☁️";

  return { text, tags: [category], icon };
}

/** Fallback genérico quando não há localização/clima */
export function buildGenericAdvice(meta = {}) {
  const dayStr = meta.dayStr || localDayStr();
  const seed = `${dayStr}|generic`;
  const list = WEATHER_ADVICE.generic || [];

  const text = pickStable(list, seed).trim();
  // como fallback final, se algo MUITO errado acontecer:
  const safeText = text || (Array.isArray(list) && list[0]) || "Respire fundo por alguns segundos.";
  return { text: safeText, tags: ["generic"], icon: "🧭" };
}

/** 🔒 Prioriza SEMPRE clima; só cai no genérico se não houver clima. */
export function getDailyAdvice(w = {}, meta = {}) {
  return buildWeatherAdvice(w, meta) || buildGenericAdvice(meta);
}
