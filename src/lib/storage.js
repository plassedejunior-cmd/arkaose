// Cache diário por DOB+HH:MM em localStorage

export const localDayStr = () => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const da = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${da}`;
};

export const cacheKey = (dob, hh, mm) =>
  `chaos_cache_${localDayStr()}__${dob || "no-dob"}__${String(hh).padStart(
    2,
    "0"
  )}:${String(mm).padStart(2, "0")}`;

export const getCached = (dob, hh, mm) => {
  try {
    const raw = localStorage.getItem(cacheKey(dob, hh, mm));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const setCached = (dob, hh, mm, obj) => {
  try {
    localStorage.setItem(cacheKey(dob, hh, mm), JSON.stringify(obj));
  } catch {}
};
