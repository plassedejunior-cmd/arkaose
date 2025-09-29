import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [pass,  setPass]  = useState("");
  const [msg,   setMsg]   = useState("");

  async function onSubmit(e){
    e.preventDefault();
    setMsg("Enviando confirmação...");
    const { error } = await supabase.auth.signUp({ email, password: pass });
    if (error) return setMsg(error.message);
    setMsg("Verifique seu e-mail para confirmar a conta.");
  }

  return (
    <div style={{maxWidth: 380, margin:"40px auto"}}>
      <h2>Criar conta</h2>
      <form onSubmit={onSubmit} style={{display:"grid", gap:10}}>
        <input placeholder="Seu e-mail" value={email} onChange={e=>setEmail(e.target.value)} />
        <input placeholder="Senha" type="password" value={pass} onChange={e=>setPass(e.target.value)} />
        <button type="submit">Cadastrar</button>
      </form>
      <p style={{color:"#888", marginTop:8}}>{msg}</p>
      <div style={{marginTop:12}}>
        <Link to="/login">Já tenho conta</Link>
      </div>
    </div>
  );
}
