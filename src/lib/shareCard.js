// Gera um cartão 1080x1920 com: fundo, imagem do canvas, título,
// “badge” com signo do caos, texto de influência e um espaço pra logo.
// Retorna { blob, dataUrl }.
export async function renderShareCard({
  canvasEl,               // <canvas> da animação
  title = "Seu signo no caos",
  chaosSign = "—",
  influenceText = "",
  brandPlaceholder = "marca",
  width = 1080,
  height = 1920,
}) {
  const out = document.createElement("canvas");
  out.width = width;
  out.height = height;
  const ctx = out.getContext("2d");

  // ---------- fundo ----------
  // (cores neutras; você pode trocar no futuro)
  const bg = ctx.createLinearGradient(0, 0, 0, height);
  bg.addColorStop(0, "#1b1b29");
  bg.addColorStop(1, "#171724");
  ctx.fillStyle = bg;
  roundRect(ctx, 40, 40, width-80, height-80, 48);
  ctx.fill();

  // sombra suave
  ctx.shadowColor = "rgba(0,0,0,.35)";
  ctx.shadowBlur = 40;
  ctx.shadowOffsetY = 12;

  // ---------- desenho do canvas como “arte” ----------
  if (canvasEl) {
    // captura o frame atual
    // desenha com leve transparência como background/ilustração
    ctx.save();
    ctx.globalAlpha = 0.8;
    // área superior para arte
    const artX = 100, artY = 120, artW = width-200, artH = Math.round(height * 0.42);
    // moldura arredondada
    clipRoundRect(ctx, artX, artY, artW, artH, 28);
    // cover
    const ratioSrc = canvasEl.width / canvasEl.height;
    const ratioDst = artW / artH;
    let sx=0, sy=0, sw=canvasEl.width, sh=canvasEl.height;
    if (ratioSrc > ratioDst) { // corta lados
      const newW = canvasEl.height * ratioDst;
      sx = (canvasEl.width - newW) / 2;
      sw = newW;
    } else { // corta topo/baixo
      const newH = canvasEl.width / ratioDst;
      sy = (canvasEl.height - newH) / 2;
      sh = newH;
    }
    ctx.drawImage(canvasEl, sx, sy, sw, sh, artX, artY, artW, artH);
    ctx.restore();
  }

  // reseta sombra
  ctx.shadowColor = "transparent";
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;

  // ---------- título ----------
  ctx.fillStyle = "#e8e6ff";
  ctx.font = "900 64px system-ui, Segoe UI, Roboto, Helvetica, Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.fillText(title, width/2, Math.round(height*0.48));

  // ---------- badge com signo ----------
  const badgeText = chaosSign || "—";
  const badgePaddingX = 28;
  const badgePaddingY = 18;
  ctx.font = "800 56px system-ui, Segoe UI, Roboto, Helvetica, Arial";
  const tw = ctx.measureText(badgeText).width;
  const bx = (width - (tw + badgePaddingX*2)) / 2;
  const by = Math.round(height*0.48) + 84;
  ctx.fillStyle = "#31294a";
  roundRect(ctx, bx, by, tw + badgePaddingX*2, 88, 22);
  ctx.fill();

  ctx.fillStyle = "#ffd083";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(badgeText, width/2, by + 44);

  // ---------- balão de texto ----------
  const bubbleX = 90, bubbleY = by + 140, bubbleW = width - 180;
  const bubbleMaxH = 520;
  ctx.fillStyle = "#3d355a";
  roundRect(ctx, bubbleX, bubbleY, bubbleW, bubbleMaxH, 26);
  ctx.fill();

  // texto (quebra simples)
  const textPad = 28;
  const maxLineW = bubbleW - textPad*2;
  ctx.fillStyle = "#d8d7ee";
  ctx.font = "400 40px system-ui, Segoe UI, Roboto, Helvetica, Arial";
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  const lines = wrapLines(ctx, influenceText, maxLineW, 4); // até 4 linhas
  let ty = bubbleY + textPad;
  for (const line of lines) {
    ctx.fillText(line, bubbleX + textPad, ty);
    ty += 52;
  }

  // ---------- placeholder da marca (reservado) ----------
  const brandH = 44;
  ctx.fillStyle = "#ffd083";
  ctx.font = "700 44px system-ui, Segoe UI, Roboto, Helvetica, Arial";
  ctx.textAlign = "right";
  ctx.textBaseline = "alphabetic";
  ctx.fillText(brandPlaceholder, width - 100, height - 120);

  // exporta
  const blob = await new Promise((res) => out.toBlob(res, "image/png", 1));
  const dataUrl = out.toDataURL("image/png");
  return { blob, dataUrl };
}

// ---------- helpers ----------
function roundRect(ctx, x, y, w, h, r){
  const rr = Math.min(r, w/2, h/2);
  ctx.beginPath();
  ctx.moveTo(x+rr, y);
  ctx.arcTo(x+w, y,   x+w, y+h, rr);
  ctx.arcTo(x+w, y+h, x,   y+h, rr);
  ctx.arcTo(x,   y+h, x,   y,   rr);
  ctx.arcTo(x,   y,   x+w, y,   rr);
  ctx.closePath();
}
function clipRoundRect(ctx, x, y, w, h, r){
  roundRect(ctx, x, y, w, h, r);
  ctx.save(); ctx.clip();
}
function wrapLines(ctx, text, maxWidth, maxLines=5){
  const words = (text || "").split(/\s+/).filter(Boolean);
  const lines=[]; let cur="";
  for(const w of words){
    const test = cur ? cur+" "+w : w;
    if (ctx.measureText(test).width <= maxWidth) { cur = test; continue; }
    if (cur) lines.push(cur);
    cur = w;
    if (lines.length >= maxLines-1) break;
  }
  if (cur && lines.length < maxLines) lines.push(cur);
  return lines;
}
