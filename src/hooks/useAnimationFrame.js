import { useEffect, useRef } from "react";

/**
 * useAnimationFrame(callback)
 * Chama `callback({ now, dt })` a cada frame (requestAnimationFrame).
 * - dt é o delta time em segundos, limitado a 0.033 (~30 FPS) para estabilidade.
 */
export function useAnimationFrame(callback) {
  const cbRef = useRef(callback);
  const rafRef = useRef(0);
  const lastRef = useRef(performance.now());

  useEffect(() => {
    cbRef.current = callback;
  }, [callback]);

  useEffect(() => {
    function frame(now) {
      const dt = Math.min(0.033, (now - lastRef.current) / 1000);
      lastRef.current = now;
      cbRef.current?.({ now, dt });
      rafRef.current = requestAnimationFrame(frame);
    }
    rafRef.current = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);
}
