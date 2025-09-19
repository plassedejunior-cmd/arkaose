// src/hooks/useWeather.js
import { useEffect, useMemo, useState } from "react";
import { saveWeather, loadWeather } from "../lib/weatherStore";
import { classifyWMO, codeToLabel } from "../lib/weatherMap";

export default function useWeather({ coords, ttl = 30*60*1000 } = {}){
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setErr] = useState(null);

  const lat = coords?.lat, lng = coords?.lng;

  const url = useMemo(() => {
    if (lat == null || lng == null) return null;
    const base = "https://api.open-meteo.com/v1/forecast";
    const params = new URLSearchParams({
      latitude: String(lat),
      longitude: String(lng),
      current_weather: "true",
      hourly: "weathercode,cloudcover,precipitation,precipitation_probability",
      timezone: "auto",
    });
    return `${base}?${params.toString()}`;
  }, [lat, lng]);

  useEffect(() => {
    if (!url) return;

    // cache válido?
    const cached = loadWeather();
    const now = Date.now();
    if (cached && (now - (cached.fetchedAt || 0) < ttl)) {
      setWeather(cached);
      return;
    }

    let abort = false;
    setLoading(true); setErr(null);

    fetch(url)
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then(json => {
        if (abort) return;
        const cw = json.current_weather || {};
        const hourly = json.hourly || {};

        // encontrar índice da hora atual na série 'hourly.time'
        const times = hourly.time || [];
        const nowISO = new Date().toISOString().slice(0,13); // YYYY-MM-DDTHH
        const idx = Math.max(0, times.findIndex(t => t.slice(0,13) === nowISO));

        const cloud = (hourly.cloudcover?.[idx]) ?? null;
        const precip = (hourly.precipitation?.[idx]) ?? null;
        const prob = (hourly.precipitation_probability?.[idx]) ?? null;

        const category = classifyWMO(cw.weathercode, {
          cloudcover: cloud,
          precipitation: precip,
          probability: prob
        });

        const data = {
          source: "open-meteo",
          fetchedAt: Date.now(),
          lat, lng,
          current: {
            temperature: cw.temperature ?? null,
            windspeed: cw.windspeed ?? null,
            weathercode: cw.weathercode ?? null,
            label: codeToLabel(cw.weathercode),
            category,                    // "sunny" | "cloudy" | "rainy"
            cloudcover: cloud,
            precipitation: precip,
            precipitation_probability: prob,
          },
        };

        saveWeather(data);
        setWeather(data);
      })
      .catch(err => { if (!abort){ setErr(err); } })
      .finally(() => { if (!abort){ setLoading(false); } });

    return () => { abort = true; };
  }, [url, ttl, lat, lng]);

  return { weather, loading, error };
}
