// Cache e historico de medicoes em localStorage

const HISTORY_KEY = "chaos_history_v1";

export const dayStr = (d) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const da = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${da}`;
};

export const timeStr = (d) => {
  const h = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${h}:${mm}`;
};

export const localDayStr = () => dayStr(new Date());

export const cacheKey = (dateStamp, dob, hh, mm) =>
  `chaos_cache_${dateStamp || localDayStr()}__${dob || "no-dob"}__${String(hh).padStart(
    2,
    "0"
  )}:${String(mm).padStart(2, "0")}`;

export const getCached = (dob, hh, mm, dateStamp = localDayStr()) => {
  try {
    const raw = localStorage.getItem(cacheKey(dateStamp, dob, hh, mm));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const setCached = (dateStamp, dob, hh, mm, obj) => {
  try {
    localStorage.setItem(cacheKey(dateStamp, dob, hh, mm), JSON.stringify(obj));
  } catch {}
};

export const historyStore = {
  list() {
    try {
      const raw = localStorage.getItem(HISTORY_KEY);
      if (!raw) return [];
      const items = JSON.parse(raw);
      if (!Array.isArray(items)) return [];
      return items.filter((item) => item && item.cacheKey && item.dob && item.hh !== undefined && item.mm !== undefined && item.dateStamp);
    } catch {
      return [];
    }
  },
  add(entry) {
    try {
      const current = historyStore.list();
      const filtered = current.filter((item) => item.cacheKey !== entry.cacheKey);
      filtered.unshift({ ...entry, savedAt: Date.now() });
      const trimmed = filtered.slice(0, 50);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(trimmed));
    } catch {
      /* ignore */
    }
  },
};

// ===== Cache diário do "conselho do dia" =====
const DAILY_ADVICE_KEY = "chaos_daily_advice_v1";

// arredonda lat/lng (~1 km) para não variar a cada metro
function normCoord(n) {
  if (typeof n !== "number" || Number.isNaN(n)) return null;
  return Math.round(n * 100) / 100; // 2 casas decimais
}

function readAdviceDB() {
  try { return JSON.parse(localStorage.getItem(DAILY_ADVICE_KEY)) || {}; } catch { return {}; }
}
function writeAdviceDB(db) {
  try { localStorage.setItem(DAILY_ADVICE_KEY, JSON.stringify(db)); } catch {}
}

/**
 * Lê o conselho salvo do dia (opcionalmente atrelado à localização).
 * Se não houver lat/lng no cache do dia, ele vale para qualquer local.
 */
export function loadDailyAdvice({ dateStamp = localDayStr(), lat, lng } = {}) {
  const db = readAdviceDB();
  const d = db[dateStamp];
  if (!d) return null;

  const L = normCoord(lat), G = normCoord(lng);
  if (d.lat == null || d.lng == null) return d;          // cache do dia sem local → serve
  if (L == null || G == null) return d;                  // sem local atual → aceita
  if (normCoord(d.lat) === L && normCoord(d.lng) === G) return d; // match aproximado
  return null;
}

/**
 * Salva o conselho do dia (com ou sem localização).
 */
export function saveDailyAdvice({
  dateStamp = localDayStr(),
  lat, lng,
  text,
  tags = [],
  icon = "🧭",
  source = "generic", // "weather" | "generic"
} = {}) {
  const db = readAdviceDB();
  db[dateStamp] = { text, tags, icon, source, lat, lng, savedAt: Date.now() };
  writeAdviceDB(db);
}

/** Opcional: limpa o conselho daquele dia */
export function clearDailyAdvice(dateStamp = localDayStr()) {
  const db = readAdviceDB();
  if (db[dateStamp]) { delete db[dateStamp]; writeAdviceDB(db); }
}
