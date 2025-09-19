import { useEffect, useMemo, useRef, forwardRef } from "react";
import { Point, Stick } from "../lib/physics";
import { createTrail } from "../lib/trail";
import { useAnimationFrame } from "../hooks/useAnimationFrame";
import { useElementSize } from "../hooks/useElementSize";

/**
 * Canvas com pêndulo de 3 barras e trilha, agora limitado ao container.
 * Props:
 *  - running: boolean
 *  - speedMul: number
 *  - onClickIdle?: () => void
 *  - className?: string  → classe do container (default: "canvas-shell")
 */
const ChaosCanvas = forwardRef(function ChaosCanvas(
  { running = false, speedMul = 1, onClickIdle, className = "canvas-shell" },
  ref
) {
  const wrapRef = useRef(null);     // container que limita o canvas
  const canvasRef = useRef(null);   // o canvas em si
  const ctxRef = useRef(null);

  // expõe o <canvas> para o App (compartilhar)
  useEffect(() => {
    if (!ref) return;
    if (typeof ref === "function") ref(canvasRef.current);
    else ref.current = canvasRef.current;
  }, [ref]);

  // trilha offscreen
  const trail = useMemo(() => createTrail(), []);

  // física
  const g = 980 * 0.12;
  const L1 = 150, L2 = 150, L3 = 150;
  const damping = 0.999;
  const pRef = useRef({ p0:null, p1:null, p2:null, p3:null, s01:null, s12:null, s23:null });

  // usa o tamanho do CONTAINER (não da janela)
  const { w, h, dpr } = useElementSize(wrapRef);

  // redimensiona e prepara contexto sempre que o container mudar
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !w || !h) return;
    const ctx = canvas.getContext("2d", { alpha: false });

    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctxRef.current = ctx;

    trail.resize(w, h, dpr);
    setupPendulum();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [w, h, dpr]);

  function setupPendulum() {
    const originX = w * 0.5;
    const originY = Math.max(60, h * 0.2);

    const a1 = Math.PI * 0.8, a2 = Math.PI * 0.9, a3 = Math.PI * 0.85;

    const p0 = new Point(originX, originY, true);
    const p1 = new Point(originX + L1 * Math.sin(a1), originY + L1 * Math.cos(a1));
    const p2 = new Point(p1.x + L2 * Math.sin(a2), p1.y + L2 * Math.cos(a2));
    const p3 = new Point(p2.x + L3 * Math.sin(a3), p2.y + L3 * Math.cos(a3));

    p1.px = p1.x - 2; p2.px = p2.x + 1; p3.px = p3.x - 3;

    const s01 = new Stick(p0, p1, L1);
    const s12 = new Stick(p1, p2, L2);
    const s23 = new Stick(p2, p3, L3);

    pRef.current = { p0, p1, p2, p3, s01, s12, s23 };
  }

  function drawPendulum(ctx) {
    const { p0, p1, p2, p3 } = pRef.current;
    ctx.lineCap = "round";
    ctx.lineWidth = 2.2;
    ctx.strokeStyle = "#5b708b";
    ctx.beginPath(); ctx.moveTo(p0.x, p0.y); ctx.lineTo(p1.x, p1.y); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(p2.x, p2.y); ctx.lineTo(p3.x, p3.y); ctx.stroke();

    const circle = (x,y,r,c)=>{ ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2); ctx.fillStyle=c; ctx.fill(); };
    circle(p0.x,p0.y,4,"#a2b7d6");
    circle(p1.x,p1.y,6,"#6bdcff");
    circle(p2.x,p2.y,6,"#b084ff");
    circle(p3.x,p3.y,6,"#ff7aa2");
  }

  useAnimationFrame(({ dt }) => {
    const ctx = ctxRef.current;
    if (!ctx || !w || !h) return;

    ctx.fillStyle = "#0b0f15";
    ctx.fillRect(0, 0, w, h);

    if (running) {
      const { p1, p2, p3, s01, s12, s23 } = pRef.current;
      const steps = 2;
      for (let i = 0; i < steps; i++) {
        p1.addForce(0, g); p2.addForce(0, g); p3.addForce(0, g);

        p1.step((dt * speedMul) / steps, damping);
        p2.step((dt * speedMul) / steps, damping);
        p3.step((dt * speedMul) / steps, damping);

        for (let j = 0; j < 8; j++) { s01.satisfy(); s12.satisfy(); s23.satisfy(); }
      }

   
      trail.line(p1.px, p1.py, p1.x, p1.y, "#33c6ff", 1.4);
      trail.line(p2.px, p2.py, p2.x, p2.y, "#9d6bff", 1.4);
      trail.line(p3.px, p3.py, p3.x, p3.y, "#ff5c8a", 1.4);
      trail.dot(p3.x, p3.y, "rgba(255,122,162,0.4)", 1.2);
    }

    trail.drawTo(ctx);
    drawPendulum(ctx);
  });

  return (
    <div ref={wrapRef} className={className}>
      <canvas
        ref={canvasRef}
        onClick={() => { if (!running) setupPendulum(); onClickIdle?.(); }}
        aria-label="Animação do pêndulo caótico"
        role="img"
        title="Pêndulo caótico"
        style={{ display: "block" }}
      />
    </div>
  );
});

export default ChaosCanvas;
