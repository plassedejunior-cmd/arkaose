// src/lib/weatherMap.js

// Canonical categories
const CANON = {
  sunny: "sunny",
  cloudy: "cloudy",
  rainy: "rainy",
};

/**
 * Classifica código WMO em categorias canônicas
 * @param {number} wmoCode - código do Open-Meteo
 * @param {object} opts - fallback baseado em sinais (cloudcover, precipitation, probability)
 * @returns {"sunny"|"cloudy"|"rainy"}
 */
export function classifyWMO(wmoCode, opts = {}) {
  const code = Number(wmoCode);

  if (!Number.isNaN(code)) {
    if (code === 0) return CANON.sunny;

    if (
      (code >= 1 && code <= 3) ||
      code === 45 || code === 48
    ) return CANON.cloudy;

    if (
      (code >= 51 && code <= 57) ||
      (code >= 61 && code <= 67) ||
      (code >= 71 && code <= 77) ||
      (code >= 80 && code <= 82) ||
      code === 85 || code === 86 ||
      (code >= 95 && code <= 99)
    ) return CANON.rainy;
  }

  // fallback por sinais
  const cc   = Number(opts.cloudcover ?? NaN);
  const prec = Number(opts.precipitation ?? 0);
  const prob = Number(opts.probability ?? 0);

  if (!Number.isNaN(prec) && (prec > 0 || prob >= 50)) return CANON.rainy;
  if (!Number.isNaN(cc) && cc >= 60)                   return CANON.cloudy;
  return CANON.sunny;
}

/**
 * Nome amigável em português para exibição
 * @param {number} code - código WMO
 * @returns {string} label em pt-BR
 */
export function codeToLabel(code) {
  const map = {
    0: "Céu limpo",
    1: "Poucas nuvens",
    2: "Parcialmente nublado",
    3: "Encoberto",
    45: "Nevoeiro",
    48: "Nevoeiro com gelo",
    51: "Garoa fraca", 
    53: "Garoa", 
    55: "Garoa forte",
    56: "Garoa congelante fraca", 
    57: "Garoa congelante forte",
    61: "Chuva fraca", 
    63: "Chuva", 
    65: "Chuva forte",
    66: "Chuva congelante fraca", 
    67: "Chuva congelante forte",
    71: "Neve fraca", 
    73: "Neve", 
    75: "Neve forte",
    77: "Grãos de neve", 
    80: "Pancadas fracas", 
    81: "Pancadas",
    82: "Pancadas fortes", 
    85: "Pancadas de neve fracas",
    86: "Pancadas de neve fortes", 
    95: "Trovoadas",
    96: "Trovoadas com granizo leve", 
    99: "Trovoadas com granizo",
  };
  return map[code] ?? "Condição desconhecida";
}
