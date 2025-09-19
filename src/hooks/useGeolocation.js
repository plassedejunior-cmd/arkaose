// src/hooks/useGeolocation.js
import { useCallback, useEffect, useRef, useState } from "react";
import { saveLocation } from "../lib/geoStore";

const OPTS = { enableHighAccuracy: true, timeout: 10000, maximumAge: 600000 };

export default function useGeolocation({ requestOnMount = true } = {}) {
  const [status, setStatus] = useState("idle"); // idle | prompt | granted | denied | error
  const [coords, setCoords] = useState(null);   // { lat, lng, acc, at }
  const askedRef = useRef(false);

  const request = useCallback(() => {
    if (!("geolocation" in navigator)) {
      setStatus("error");
      return;
    }
    setStatus("prompt");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords || {};
        const data = {
          lat: Number(latitude?.toFixed(6)),
          lng: Number(longitude?.toFixed(6)),
          acc: Math.round(accuracy || 0),
          at: Date.now(),
        };
        setCoords(data);
        setStatus("granted");
        saveLocation(data);
        // opcional: ver no console
        // console.log("[geo]", data);
      },
      (err) => {
        setStatus(err?.code === 1 ? "denied" : "error");
      },
      OPTS
    );
  }, []);

  useEffect(() => {
    if (askedRef.current || !requestOnMount) return;
    askedRef.current = true;

    // tenta ler o estado da permissão (quando suportado)
    if (navigator.permissions?.query) {
      navigator.permissions.query({ name: "geolocation" }).then((p) => {
        if (p.state === "granted") {
          request();
        } else if (p.state === "prompt") {
          request(); // vai abrir o prompt
        } else {
          setStatus("denied");
        }
      }).catch(() => request());
    } else {
      request();
    }
  }, [requestOnMount, request]);

  return { status, coords, request };
}
