import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function Login() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [pass,  setPass]  = useState("");
  const [msg,   setMsg]   = useState("");

  async function onSubmit(e){
    e.preventDefault();
    setMsg("Entrando...");
    const { error } = await supabase.auth.signInWithPassword({ email, password: pass });
    if (error) return setMsg(error.message);
    setMsg("Ok! Redirecionando...");
    nav("/app");
  }

  return (
    <div style={{maxWidth: 380, margin:"40px auto"}}>
      <h2>Entrar</h2>
      <form onSubmit={onSubmit} style={{display:"grid", gap:10}}>
        <input placeholder="Seu e-mail" value={email} onChange={e=>setEmail(e.target.value)} />
        <input placeholder="Senha" type="password" value={pass} onChange={e=>setPass(e.target.value)} />
        <button type="submit">Entrar</button>
      </form>
      <p style={{color:"#888", marginTop:8}}>{msg}</p>
      <div style={{marginTop:12, display:"flex", gap:12}}>
        <Link to="/signup">Criar conta</Link>
        <Link to="/forgot">Esqueci a senha</Link>
      </div>
    </div>
  );
}
