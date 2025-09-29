import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";

export default function AppHome(){
  const nav = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data?.user) nav("/login");
      else setUser(data.user);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (!session?.user) nav("/login");
      else setUser(session.user);
    });
    return () => sub?.subscription?.unsubscribe();
  }, [nav]);

  async function signOut(){ await supabase.auth.signOut(); }

  return (
    <div style={{maxWidth: 640, margin:"40px auto"}}>
      <h2>Área logada</h2>
      <p>Bem-vindo, {user?.email}</p>
      <button onClick={signOut}>Sair</button>
    </div>
  );
}
