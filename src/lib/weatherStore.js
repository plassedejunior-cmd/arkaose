// src/lib/weatherStore.js
const KEY = "weather:current";

export function saveWeather(data){
  try{ localStorage.setItem(KEY, JSON.stringify(data)); }catch{}
}
export function loadWeather(){
  try{
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  }catch{ return null; }
}
export function clearWeather(){
  try{ localStorage.removeItem(KEY); }catch{}
}
