import { useEffect, useState } from "react";

/** Observa o tamanho do elemento (content box) e retorna { w, h, dpr } */
export function useElementSize(ref) {
  const [size, setSize] = useState({ w: 300, h: 150, dpr: 1 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const ro = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
      setSize({ w: Math.floor(width), h: Math.floor(height), dpr });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);

  return size;
}
