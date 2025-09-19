// src/lib/geoStore.js
const KEY = "geo:last";

export function saveLocation(data) {
  try { localStorage.setItem(KEY, JSON.stringify(data)); } catch {}
}

export function loadLocation() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export function clearLocation() {
  try { localStorage.removeItem(KEY); } catch {}
}
