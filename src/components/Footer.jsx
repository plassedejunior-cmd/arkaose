export default function Footer(){
  const y = new Date().getFullYear();
  return (
    <footer className="site-footer">
      <span>© {y} — Arkaose Chaos institute</span>
      <span id="sobre"></span>
    </footer>
  );
}
