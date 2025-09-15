/**
 * Motor simples de física (Verlet) para o pêndulo de 3 barras.
 * Mantido intencionalmente pequeno e comentado para facilitar manutenção.
 */

export class Point {
  /**
   * @param {number} x
   * @param {number} y
   * @param {boolean} pinned - se true, o ponto fica fixo (âncora)
   */
  constructor(x, y, pinned = false) {
    this.x = x; this.y = y;     // posição atual
    this.px = x; this.py = y;   // posição anterior (para integrar sem velocidade explícita)
    this.ax = 0; this.ay = 0;   // aceleração acumulada no frame
    this.pinned = pinned;
  }

  /** Acumula força nesse frame (F = m*a, aqui m=1) */
  addForce(fx, fy) {
    this.ax += fx;
    this.ay += fy;
  }

  /**
   * Integra uma etapa do movimento usando Verlet:
   * newPos = pos + (pos - prevPos) * damping + acc * dt^2
   */
  step(dt, damping) {
    if (this.pinned) {
      // ponto fixo: não move; zera aceleração
      this.px = this.x; this.py = this.y;
      this.ax = 0; this.ay = 0;
      return;
    }
    const nx = this.x + (this.x - this.px) * damping + this.ax * dt * dt;
    const ny = this.y + (this.y - this.py) * damping + this.ay * dt * dt;

    // avança “janela temporal”
    this.px = this.x; this.py = this.y;
    this.x = nx; this.y = ny;

    // consome aceleração acumulada
    this.ax = 0; this.ay = 0;
  }
}

export class Stick {
  /** Constrange a distância entre p0–p1 para ser ~len (haste rígida) */
  constructor(p0, p1, len) {
    this.p0 = p0; this.p1 = p1; this.len = len;
  }

  /** Satisfaz a restrição distribuindo correção entre as pontas (0.5/0.5) */
  satisfy() {
    const dx = this.p1.x - this.p0.x;
    const dy = this.p1.y - this.p0.y;
    const dist = Math.hypot(dx, dy) || 1e-8;
    const diff = (dist - this.len) / dist;

    // pontos “pinned” não se movem
    const inv0 = this.p0.pinned ? 0 : 0.5;
    const inv1 = this.p1.pinned ? 0 : 0.5;

    const ox = dx * diff;
    const oy = dy * diff;

    this.p0.x += ox * inv0;
    this.p0.y += oy * inv0;
    this.p1.x -= ox * inv1;
    this.p1.y -= oy * inv1;
  }
}
