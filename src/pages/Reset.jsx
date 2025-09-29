import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function Reset() {
  const [pass, setPass] = useState("");
  const [msg,  setMsg]  = useState("Carregando sessão...");

  // quando o usuário chega por link do e-mail, o Supabase injeta um session token
  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setMsg(session ? "Defina sua nova senha." : "Sessão não encontrada. Abra o link do e-mail novamente.");
    })();
  }, []);

  async function onSubmit(e){
    e.preventDefault();
    setMsg("Atualizando senha...");
    const { error } = await supabase.auth.updateUser({ password: pass });
    if (error) return setMsg(error.message);
    setMsg("Senha alterada! Agora você já pode entrar.");
  }

  return (
    <div style={{maxWidth: 380, margin:"40px auto"}}>
      <h2>Redefinir senha</h2>
      <form onSubmit={onSubmit} style={{display:"grid", gap:10}}>
        <input placeholder="Nova senha" type="password" value={pass} onChange={e=>setPass(e.target.value)} />
        <button type="submit">Salvar nova senha</button>
      </form>
      <p style={{color:"#888", marginTop:8}}>{msg}</p>
    </div>
  );
}
