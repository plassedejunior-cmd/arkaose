// src/components/WheelDateTimePicker.jsx
import Picker from "react-mobile-picker";
import { useMemo } from "react";

const MONTHS = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];

function daysInMonth(month1to12, year){
  return new Date(year, month1to12, 0).getDate();
}

/**
 * Props:
 *  - value: { day, month, year, hour, minute }
 *  - onChange: (next) => void
 */
export default function WheelDateTimePicker({ value, onChange }) {
  const { day, month, year, hour, minute } = value;

  const years = useMemo(() => {
    const curr = new Date().getFullYear();
    return Array.from({length:121}, (_,i)=> curr - i);
  }, []);

  const maxDay = daysInMonth(month, year);
  const days = useMemo(() => Array.from({length:maxDay}, (_,i)=> i+1), [maxDay]);
  const hours = useMemo(() => Array.from({length:24}, (_,i)=> i), []);
  const minutes = useMemo(() => Array.from({length:60}, (_,i)=> i), []);

  // value do Picker e um objeto {colName: currentValue}
  const pickerValue = { day, month, year, hour, minute };

  function handleChange(next){
    // Ajusta o dia quando o mes/ano mudarem
    const nextYear  = next.year  ?? year;
    const nextMonth = next.month ?? month;
    const nextMaxDay = daysInMonth(nextMonth, nextYear);
    const nextDay = Math.min(nextMaxDay, next.day ?? day);

    onChange({
      day: nextDay,
      month: nextMonth,
      year: nextYear,
      hour: next.hour ?? hour,
      minute: next.minute ?? minute,
    });
  }

  return (
    <div className="wheel-wrap wheel-date-picker">
      <Picker value={pickerValue} onChange={handleChange} wheelMode="normal">
        <Picker.Column name="day">
          {days.map(d => (
            <Picker.Item key={d} value={d}>
              {String(d).padStart(2,"0")}
            </Picker.Item>
          ))}
        </Picker.Column>

        <Picker.Column name="month">
          {MONTHS.map((m, idx) => (
            <Picker.Item key={m} value={idx+1}>{m}</Picker.Item>
          ))}
        </Picker.Column>

        <Picker.Column name="year">
          {years.map(y => (
            <Picker.Item key={y} value={y}>{y}</Picker.Item>
          ))}
        </Picker.Column>

        <Picker.Column name="hour">
          {hours.map(h => (
            <Picker.Item key={h} value={h}>{String(h).padStart(2,"0")}h</Picker.Item>
          ))}
        </Picker.Column>

        <Picker.Column name="minute">
          {minutes.map(m => (
            <Picker.Item key={m} value={m}>{String(m).padStart(2,"0")}m</Picker.Item>
          ))}
        </Picker.Column>
      </Picker>
    </div>
  );
}
