// src/components/AdsLeft.jsx
import { useEffect, useRef } from "react";

export default function AdsLeft() {
  const adRef = useRef(null);

  useEffect(() => {
    // inicializa o bloco depois que o <ins> está no DOM
    try {
      if (window.adsbygoogle && adRef.current) {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (e) {
      // silencioso em dev/adblock
    }
  }, []);

  return (
    <aside className="ads-left" aria-label="Publicidade">
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: "block" }}               // em React é objeto, não string
        data-ad-client="ca-pub-9843343193634456"   // seu client
        data-ad-slot="1182051583"                  // seu slot
        data-ad-format="autorelaxed"               // mesmo formato que o Google passou
        data-full-width-responsive="true"
        data-adtest="on" // DESCOMENTE para testar em dev sem violar políticas
      />
    </aside>
  );
}
