// src/components/AdBox.jsx
import { useEffect, useRef, useState } from "react";

export default function AdBox() {
  const ref = useRef(null);
  const [filled, setFilled] = useState(false);

  useEffect(() => {
    if (!ref.current) return;

    const ro = new ResizeObserver(() => {
      const w = ref.current?.offsetWidth || 0;
      if (!filled && w > 0) {
        try {
          (window.adsbygoogle = window.adsbygoogle || []).push({});
          setFilled(true);
        } catch (e) {
          console.warn("AdSense push error:", e);
        }
      }
    });
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, [filled]);

  return (
    <ins
      ref={ref}
      className="adsbygoogle"
      style={{ display: "block", width: "100%", minHeight: 280 }} // dÃƒÂ¡ espaÃƒÂ§o mÃƒÂ­nimo
      data-ad-client="ca-pub-9843343193634456"
      data-ad-slot="1234567890"
      data-ad-format="auto"
      data-full-width-responsive="true"
      data-adtest="on"
    />
  );
}
