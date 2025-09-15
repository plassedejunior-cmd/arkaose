import { useEffect, useState } from "react";

/**
 * Retorna { w, h, dpr } e atualiza ao redimensionar.
 * - w/h: inteiros do viewport
 * - dpr: devicePixelRatio clampado entre 1 e 2 (performance)
 */
export function useCanvasSize() {
  const [size, setSize] = useState({ w: 300, h: 150, dpr: 1 });

  useEffect(() => {
    const handler = () => {
      const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
      setSize({
        w: Math.floor(window.innerWidth),
        h: Math.floor(window.innerHeight),
        dpr,
      });
    };
    handler(); // inicial
    window.addEventListener("resize", handler, { passive: true });
    return () => window.removeEventListener("resize", handler);
  }, []);

  return size;
}
