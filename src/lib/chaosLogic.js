import { SIGNOS, ZODIAC_TRAITS, HORO, ADVICE } from "./constants";
import { mulberry32, hashStr, pickDistinct } from "./rng";
import { localDayStr } from "./storage";

// Converte DOB YYYY-MM-DD para signo tropical
export function signoTropical(dobStr) {
  if (!dobStr) return "—";
  const [, M, D] = dobStr.split("-").map(Number);
  const m = M;
  const d = D;
  if ((m === 3 && d >= 21) || (m === 4 && d <= 19)) return "Áries";
  if ((m === 4 && d >= 20) || (m === 5 && d <= 20)) return "Touro";
  if ((m === 5 && d >= 21) || (m === 6 && d <= 20)) return "Gêmeos";
  if ((m === 6 && d >= 21) || (m === 7 && d <= 22)) return "Câncer";
  if ((m === 7 && d >= 23) || (m === 8 && d <= 22)) return "Leão";
  if ((m === 8 && d >= 23) || (m === 9 && d <= 22)) return "Virgem";
  if ((m === 9 && d >= 23) || (m === 10 && d <= 22)) return "Libra";
  if ((m === 10 && d >= 23) || (m === 11 && d <= 21)) return "Escorpião";
  if ((m === 11 && d >= 22) || (m === 12 && d <= 21)) return "Sagitário";
  if ((m === 12 && d >= 22) || (m === 1 && d <= 19)) return "Capricórnio";
  if ((m === 1 && d >= 20) || (m === 2 && d <= 18)) return "Aquário";
  if ((m === 2 && d >= 19) || (m === 3 && d <= 20)) return "Peixes";
  return "—";
}

// Mapeia número 1..2000 para 12 buckets (desloca signo solar)
export function chaosSignFromBuckets(signoReal, chaosNum) {
  const idx = SIGNOS.indexOf(signoReal);
  if (idx < 0) return { signo: "—", casas: 0 };
  const TOTAL = 2000;
  const PARTES = 12;
  const tam = Math.ceil(TOTAL / PARTES); // 167
  const bucket = Math.min(PARTES - 1, Math.floor((Math.max(1, chaosNum) - 1) / tam));
  const offset = bucket;
  return { signo: SIGNOS[(idx + offset) % 12], casas: offset };
}

// Faixas de intensidade do caos
export function rangeInfo(num) {
  if (num <= 300)
    return {
      key: "r1",
      label: "Serena",
      blurb: "O acaso se recolhe; o movimento quase não deixa marcas.",
    };
  if (num <= 700)
    return {
      key: "r2",
      label: "Suave",
      blurb: "As variações fluem devagar, sugerindo ajustes discretos.",
    };
  if (num <= 1100)
    return {
      key: "r3",
      label: "Agitada",
      blurb: "Há pequenas oscilações; nada se torna definitivo, mas nada desmorona.",
    };
  if (num <= 1500)
    return {
      key: "r4",
      label: "Instável",
      blurb: "Os sinais se acumulam; escolhas ganham peso inesperado.",
    };
  if (num <= 1800)
    return {
      key: "r5",
      label: "Intensa",
      blurb: "As correntes aceleram; a ordem e o acaso se disputam em voz alta.",
    };
  return {
    key: "r6",
    label: "Caótica",
    blurb: "A maré do acaso domina; tudo se mistura e se reinventa no instante.",
  };
}

// Mensagem combinando traços do signo real e do “signo do caos”
export function composeDualTraitsMessage(signoReal, signoChaos, casas, dob) {
  const seed = hashStr(localDayStr() + "|" + (dob || ""));
  const rng = mulberry32(seed);

  const baseTraits = pickTraitsFromSign(signoReal, 3, rng); // 3 do Sol
  const driftTraits = pickTraitsFromSign(signoChaos, 2, rng); // 2 do Caos

  const semDrift =
    baseTraits.length === 0 || driftTraits.length === 0 || signoChaos === "—";

  const message =
    signoReal === signoChaos || semDrift
      ? `O caos está discreto hoje; seu Sol em ${signoReal} predomina em todos os sentidos da sua vida.`
      : `Seu Sol em ${signoReal} faz você ser ${listPT(baseTraits)}, mas não se espante se você se perceber ${listOu(driftTraits)}, pois a entropia do caos moveu seu vetor natal em ${casas} casa(s), trazendo influência de ${signoChaos} hoje.`;

  return { baseTraits, driftTraits, message };
}

export const phraseByIdx = (i) => HORO[i % HORO.length];
export const adviceByIdx = (i) => ADVICE[i % ADVICE.length];

// ---------- auxiliares privados ----------
function pickTraitsFromSign(signo, n, rng) {
  const arr = ZODIAC_TRAITS[signo] || [];
  const idxs = [...Array(arr.length).keys()];
  for (let i = idxs.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [idxs[i], idxs[j]] = [idxs[j], idxs[i]];
  }
  return idxs.slice(0, Math.min(n, arr.length)).map((i) => arr[i]);
}
function listPT(words) {
  const w = [...new Set(words)].filter(Boolean);
  if (w.length <= 1) return w.join("");
  if (w.length === 2) return `${w[0]} e ${w[1]}`;
  return `${w.slice(0, -1).join(", ")} e ${w[w.length - 1]}`;
}
function listOu(words) {
  const w = [...new Set(words)].filter(Boolean);
  if (w.length === 0) return "";
  if (w.length === 1) return w[0];
  return `${w[0]} ou ${w[1]}`;
}
