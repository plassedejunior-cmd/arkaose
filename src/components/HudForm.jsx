import { useEffect, useMemo, useState } from "react";

const MONTH_LABELS = [
  "Jan",
  "Fev",
  "Mar",
  "Abr",
  "Mai",
  "Jun",
  "Jul",
  "Ago",
  "Set",
  "Out",
  "Nov",
  "Dez",
];

export default function HudForm({ onStart, disabled }) {
  const now = useMemo(() => new Date(), []);
  const [dobDay, setDobDay] = useState(String(now.getDate()).padStart(2, "0"));
  const [dobMonth, setDobMonth] = useState(String(now.getMonth() + 1).padStart(2, "0"));
  const [dobYear, setDobYear] = useState(String(now.getFullYear()));
  const [hour, setHour] = useState("12");
  const [minute, setMinute] = useState("00");
  const [days, setDays] = useState([]);
  const [noTime, setNoTime] = useState(false);

  useEffect(() => {
    hydrateDays(dobMonth, dobYear);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    hydrateDays(dobMonth, dobYear);
  }, [dobMonth, dobYear]);

  function daysInMonth(month1to12, year) {
    return new Date(year, month1to12, 0).getDate();
  }

  function hydrateDays(monthValue, yearValue) {
    const max = daysInMonth(parseInt(monthValue, 10), parseInt(yearValue, 10));
    const list = Array.from({ length: max }, (_, index) => String(index + 1).padStart(2, "0"));
    setDays(list);

    if (parseInt(dobDay, 10) > max) {
      setDobDay(String(max).padStart(2, "0"));
    }
  }

  const years = useMemo(
    () => Array.from({ length: 121 }, (_, index) => String(now.getFullYear() - index)),
    [now]
  );
  const hours = useMemo(
    () => Array.from({ length: 24 }, (_, index) => String(index).padStart(2, "0")),
    []
  );
  const minutes = useMemo(
    () => Array.from({ length: 60 }, (_, index) => String(index).padStart(2, "0")),
    []
  );

  const dob = `${dobYear}-${dobMonth}-${dobDay}`;

  function handleStart() {
    const hh = noTime ? "00" : hour;
    const mm = noTime ? "00" : minute;
    onStart?.({ dob, hh, mm });
  }

  function toggleNoTime(event) {
    const checked = event.target.checked;
    setNoTime(checked);
    if (checked) {
      setHour("00");
      setMinute("00");
    }
  }

  return (
    <form className="hud-card" onSubmit={(event) => event.preventDefault()} aria-label="Entrada de dados">
      <div className="hud-head">
        <h2 className="hud-title">Insira a data e hora de nascimento</h2>
        
      </div>

      <div className="hud-row">
        <div className="hud-field">
          <select
            aria-label="Dia"
            value={dobDay}
            onChange={(event) => setDobDay(event.target.value)}
            required
          >
            {days.map((dayValue) => (
              <option key={dayValue} value={dayValue}>
                {dayValue}
              </option>
            ))}
          </select>
        </div>

        <div className="hud-field">
          <select
            aria-label="Mês"
            value={dobMonth}
            onChange={(event) => setDobMonth(event.target.value)}
            required
          >
            {MONTH_LABELS.map((label, index) => {
              const value = String(index + 1).padStart(2, "0");
              return (
                <option key={value} value={value}>
                  {label}
                </option>
              );
            })}
          </select>
        </div>

        <div className="hud-field">
          <select
            aria-label="Ano"
            value={dobYear}
            onChange={(event) => setDobYear(event.target.value)}
            required
          >
            {years.map((yearValue) => (
              <option key={yearValue} value={yearValue}>
                {yearValue}
              </option>
            ))}
          </select>
        </div>

        {!noTime && (
          <div className="hud-field">
            <select
              aria-label="Hora"
              id="hour"
              value={hour}
              onChange={(event) => setHour(event.target.value)}
              required
            >
              {hours.map((hourValue) => (
                <option key={hourValue} value={hourValue}>
                  {hourValue} h
                </option>
              ))}
            </select>
          </div>
        )}

        {!noTime && (
          <div className="hud-field">
            <select
              aria-label="Minuto"
              value={minute}
              onChange={(event) => setMinute(event.target.value)}
              required
            >
              {minutes.map((minuteValue) => (
                <option key={minuteValue} value={minuteValue}>
                  {minuteValue} m
                </option>
              ))}
            </select>
          </div>
        )}

        <button
          type="button"
          className="btn btn-measure"
          disabled={disabled}
          onClick={handleStart}
        >
          Medir a influência caótica
        </button>
      </div>

      <label className="hud-checkbox">
        <input
          type="checkbox"
          checked={noTime}
          onChange={toggleNoTime}
        />
        <span>Não lembro a hora e minuto do meu nascimento</span>
      </label>

      {noTime && (
        <p className="hud-hint">
          Usaremos 00:00 como referência. Sem a hora exata o prognóstico pode ficar menos preciso.
        </p>
      )}
    </form>
  );
}
