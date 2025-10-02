import { useMemo } from "react";
import { rangeInfo } from "../lib/chaosLogic";

export default function ChaosIntensityBar({ value = 0, max = 2000, compact = false }) {
  const clamped = clamp(Number(value), 0, max);
  const pct = (clamped / max) * 100;
  const info = rangeInfo(clamped);

  const ticks = useMemo(() => [0, 500, 1000, 1500, 2000], []);

  return (
    <div
      className={`meter${compact ? " meter--compact" : ""}`.trim()}
      role="meter"
      aria-label="Intensidade do caos (0 a 2000)"
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={clamped}
    >
      <div className="meter-track">
        <div className="meter-glow" style={{ width: `${pct}%` }} />
        <div className="meter-pin" style={{ left: `${pct}%` }} />
      </div>

      {!compact && (
        <>
          <div className="meter-scale">
            {ticks.map((tick) => (
              <span key={tick}>{tick}</span>
            ))}
          </div>
          <div className="meter-desc">{info.blurb}</div>
        </>
      )}
    </div>
    
  );
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}
