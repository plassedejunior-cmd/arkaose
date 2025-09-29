import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function Forgot() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");

  async function onSubmit(e){
    e.preventDefault();
    setMsg("Enviando link...");
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + "/reset"
    });
    if (error) return setMsg(error.message);
    setMsg("Verifique seu e-mail para redefinir a senha.");
  }

  return (
    <div style={{maxWidth: 380, margin:"40px auto"}}>
      <h2>Esqueci a senha</h2>
      <form onSubmit={onSubmit} style={{display:"grid", gap:10}}>
        <input placeholder="Seu e-mail" value={email} onChange={e=>setEmail(e.target.value)} />
        <button type="submit">Enviar link</button>
      </form>
      <p style={{color:"#888", marginTop:8}}>{msg}</p>
      <div style={{marginTop:12}}>
        <Link to="/login">Voltar ao login</Link>
      </div>
    </div>
  );
}
