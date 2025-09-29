import { useEffect, useMemo, useRef, useState } from "react";
import { rangeInfo } from "../lib/chaosLogic";

export default function ChaosIntensityBar({ value = 0, max = 2000 }) {
  const v   = clamp(Number(value), 0, max);
  const pct = (v / max) * 100;
  const info = rangeInfo(v);

  const bands = useMemo(() => ([
    { key:"r1", label:"Serena",   min:0,    max:300,  color:"#22c55e" },
    { key:"r2", label:"Suave",    min:301,  max:700,  color:"#84cc16" },
    { key:"r3", label:"Agitada",  min:701,  max:1100, color:"#eab308" },
    { key:"r4", label:"Instável", min:1101, max:1500, color:"#f97316" },
    { key:"r5", label:"Intensa",  min:1501, max:1800, color:"#ef4444" },
    { key:"r6", label:"Caótica",  min:1801, max:2000, color:"#991b1b" },
  ]), []);

  // tooltip ao lado do chip
  const [open, setOpen] = useState(false);
  const tipRef = useRef(null);
  useEffect(() => {
    const onDoc = (e) => { if (!tipRef.current?.contains(e.target)) setOpen(false); };
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, []);

  const grad = "linear-gradient(90deg,#22c55e 0%,#84cc16 18%,#eab308 40%,#f97316 65%,#ef4444 85%,#991b1b 100%)";

  return (
    <div style={S.wrap}>
      <div style={S.titleRow}>
        <span style={S.title}>Intensidade do Caos</span>

        <div style={S.chipWrap} ref={tipRef}>
          <span style={{ ...S.badge, ...badgeByKey[info.key] }}>{info.label}</span>
          <button
            aria-label="Ver legendas da escala"
            onClick={() => setOpen(v => !v)}
            style={S.tipBtn}
          >?</button>

          {open && (
            <div role="dialog" aria-label="Legenda da escala" style={S.tooltipBox}>
              <div style={S.tipTitle}>Escala (0–2000)</div>
              <div style={S.legendGrid}>
              
                {bands.map(b => (
                  <div key={b.key} style={S.pill}>
                    <span style={{ ...S.dot, background:b.color }} />
                    <div style={{ display:"flex", gap:10, alignItems:"center"}}>{b.label}<br/><small >{b.min}–{b.max}</small></div>
                  </div>
                ))}
                </div>
             
            </div>
          )}
        </div>
      </div>

      <div
        role="meter"
        aria-label="Intensidade do caos (0 a 2000)"
        aria-valuemin={0}
        aria-valuemax={2000}
        aria-valuenow={v}
        style={{ ...S.bar, background: grad }}
      >
        <div style={{ ...S.pin, left:`${clamp(pct,0,100)}%` }} />
      </div>

      <div style={S.scale}><span>0</span><span>500</span><span>1000</span><span>1500</span><span>2000</span></div>
      <div style={S.desc}>{info.blurb}</div>
    </div>
  );
}

function clamp(v,a,b){ return Math.max(a, Math.min(b, v)); }

const S = {

  wrap:{ 
    background:"#0f172a", 
    color:"#e2e8f0", 
    borderRadius:16, 
    padding:16, 
    border:"1px solid rgba(255,255,255,.06)" },

  titleRow:{ 
    display:"flex", 
    alignItems:"center", 
    gap:8, 
    marginBottom:10 },

  title:{ 
    fontWeight:700 },

  chipWrap:{ 
    position:"relative", 
    display:"flex", 
    alignItems:"center", 
    gap:6, 
    marginLeft:"auto" },

  tipBtn:{
    width:20, 
    height:20, 
    borderRadius:"50%", 
    border:"none", 
    cursor:"pointer",
    background:"#94a3b8", 
    color:"#0b1220", 
    fontWeight:700, 
    lineHeight:"20px", 
    padding:0
  },

  tooltipBox:{
    position:"absolute", 
    top:"calc(100% + 8px)", 
    right:0, 
    zIndex:50, 
    width:"fit-content",
    background:"#0b1329", 
    border:"1px solid rgba(255,255,255,.08)", 
    borderRadius:12, 
    padding:12,
    boxShadow:"0 10px 24px rgba(0,0,0,.45)"
  },
  
  tipTitle:{ 
    fontSize:12, 
    color:"#94a3b8", 
    marginBottom:8 },

  legendGrid:{ 
    display:"flex", 
    flexWrap:"wrap", 
    gap:8 },

  pill:{ 
    display:"flex", 
    gap:8, 
    alignItems:"center", 
    padding:"6px 8px", 
    borderRadius:999, 
    background:"#0b1329", 
    border:"1px solid rgba(255,255,255,.06)" },

  dot:{ 
    width:10, 
    height:10, 
    borderRadius:"50%", 
},

  bar:{ 
    position:"relative", 
    height:18, 
    borderRadius:999, 
    boxShadow:"inset 0 0 0 1px rgba(255,255,255,.06)", 
    overflow:"visible" },

  pin:{ 
    position:"absolute", 
    top:-12, 
    width:2, 
    height:42, 
    background:"#3b82f6", 
    borderRadius:1, 
    boxShadow:"0 0 6px rgba(59,130,246,.5)", 
    transform:"translateX(-1px)", 
    transition:"left .35s ease" },

  scale:{ 
    display:"flex", 
    justifyContent:"space-between", 
    fontSize:12, 
    color:"#94a3b8", 
    margin:"8px 0 8px" },

  desc:{ 
    fontSize:14, 
    color:"#cbd5e1", 
    marginTop:4 }
};

const badgeByKey = {
  r1:{ background:"rgba(34,197,94,.15)", color:"#4ade80", padding:"2px 8px", borderRadius:999, fontSize:12, fontWeight:700 },
  r2:{ background:"rgba(132,204,22,.15)", color:"#a3e635", padding:"2px 8px", borderRadius:999, fontSize:12, fontWeight:700 },
  r3:{ background:"rgba(234,179,8,.15)", color:"#facc15",  padding:"2px 8px", borderRadius:999, fontSize:12, fontWeight:700 },
  r4:{ background:"rgba(249,115,22,.15)", color:"#fb923c",  padding:"2px 8px", borderRadius:999, fontSize:12, fontWeight:700 },
  r5:{ background:"rgba(239,68,68,.15)", color:"#f87171",   padding:"2px 8px", borderRadius:999, fontSize:12, fontWeight:700 },
  r6:{ background:"rgba(153,27,27,.25)", color:"#fca5a5",   padding:"2px 8px", borderRadius:999, fontSize:12, fontWeight:700 },
};
