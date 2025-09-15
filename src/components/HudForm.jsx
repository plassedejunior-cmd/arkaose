import { useEffect, useMemo, useState } from "react";

/**
 * Form de input DOB + hora:min (controlado e responsivo).
 * Props:
 *  - onStart({ dob, hh, mm })
 *  - disabled?: boolean
 */
export default function HudForm({ onStart, disabled }) {
  const now = useMemo(() => new Date(), []);
  const [dobDay, setDobDay] = useState(String(now.getDate()).padStart(2, "0"));
  const [dobMonth, setDobMonth] = useState(
    String(now.getMonth() + 1).padStart(2, "0")
  );
  const [dobYear, setDobYear] = useState(String(now.getFullYear()));
  const [hour, setHour] = useState("12");
  const [minute, setMinute] = useState("00");
  const [days, setDays] = useState([]);

  useEffect(() => {
    updateDays(dobMonth, dobYear);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    updateDays(dobMonth, dobYear);
  }, [dobMonth, dobYear]);

  function daysInMonth(month1to12, year) {
    return new Date(year, month1to12, 0).getDate();
  }
  function updateDays(m, y) {
    const max = daysInMonth(parseInt(m, 10), parseInt(y, 10));
    setDays(Array.from({ length: max }, (_, i) => String(i + 1).padStart(2, "0")));
  }

  const months = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
  const years = Array.from({ length: 121 }, (_, i) => String(now.getFullYear() - i));
  const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
  const minutes = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0"));

  const dob = `${dobYear}-${dobMonth}-${dobDay}`;

  return (
    <form className="hud" onSubmit={(e) => e.preventDefault()} aria-label="Entrada de dados">
      <h2 className="modal-title">Informe a sua data de nascimento</h2>

      <div className="row">
        <label>Data</label>
        <div className="grid3">
          <select value={dobDay} onChange={(e) => setDobDay(e.target.value)} required>
            {days.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>

          <select value={dobMonth} onChange={(e) => setDobMonth(e.target.value)} required>
            {months.map((m, idx) => {
              const val = String(idx + 1).padStart(2, "0");
              return (
                <option key={val} value={val}>
                  {m}
                </option>
              );
            })}
          </select>

          <select value={dobYear} onChange={(e) => setDobYear(e.target.value)} required>
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="row">
        <label htmlFor="hour">Hora e minuto</label>
        <div className="grid2">
          <select id="hour" value={hour} onChange={(e) => setHour(e.target.value)} required>
            {hours.map((h) => (
              <option key={h} value={h}>
                {h} h
              </option>
            ))}
          </select>

          <select value={minute} onChange={(e) => setMinute(e.target.value)} required>
            {minutes.map((m) => (
              <option key={m} value={m}>
                {m} m
              </option>
            ))}
          </select>
        </div>
      </div>

      <button
        type="button"
        className="btn"
        disabled={disabled}
        onClick={() => onStart?.({ dob, hh: hour, mm: minute })}
      >
        Medir a influencia Caótica
      </button>
    </form>
  );
}
