/**
 * Camada de trilha (glow) usando um canvas offscreen.
 * Mantém rastro com fade e desenha linhas/pontos em modo “lighter”.
 */
export function createTrail() {
  let off, octx, dpr = 1, w = 0, h = 0;

  /** Redimensiona o offscreen e limpa */
  function resize(W, H, DPR) {
    dpr = DPR; w = W; h = H;
    off = document.createElement("canvas");
    off.width = Math.floor(W * DPR);
    off.height = Math.floor(H * DPR);
    octx = off.getContext("2d", { alpha: true });
    octx.setTransform(DPR, 0, 0, DPR, 0, 0);
    octx.clearRect(0, 0, W, H);
  }

  /** Aplica um leve “apagamento” no rastro */
  function fade() {
    octx.globalCompositeOperation = "source-over";
    octx.fillStyle = "rgba(11,15,21,0.04)";
    octx.fillRect(0, 0, w, h);
  }

  /** Desenha uma linha brilhante */
  function line(x1, y1, x2, y2, color, width = 1.6) {
    octx.save();
    octx.globalCompositeOperation = "lighter";
    octx.lineWidth = width;
    octx.lineCap = "round";
    octx.strokeStyle = color;
    octx.beginPath();
    octx.moveTo(x1, y1);
    octx.lineTo(x2, y2);
    octx.stroke();
    octx.restore();
  }

  /** Pontinho brilhante na ponta do pêndulo */
  function dot(x, y, color, r = 1.5) {
    octx.save();
    octx.globalCompositeOperation = "lighter";
    octx.fillStyle = color;
    octx.beginPath();
    octx.arc(x, y, r, 0, Math.PI * 2);
    octx.fill();
    octx.restore();
  }

  /** Copia o offscreen para o canvas visível */
  function drawTo(ctx2) {
    ctx2.drawImage(off, 0, 0, Math.floor(w * dpr), Math.floor(h * dpr), 0, 0, w, h);
  }

  return { resize, fade, line, dot, drawTo };
}
