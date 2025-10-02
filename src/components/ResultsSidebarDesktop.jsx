// src/components/ResultsSidebarDesktop.jsx
import ChaosCanvas from "./ChaosCanvas";
import ChaosIntensityBar from "./ChaosIntensityBar";
import AdBox from "./AdBox";

const SIGNO_ICON = {
  'Áries': '♈️',
  'Touro': '♉️',
  'Gêmeos': '♊️',
  'Câncer': '♋️',
  'Leão': '♌️',
  'Virgem': '♍️',
  'Libra': '♎️',
  'Escorpião': '♏️',
  'Sagitário': '♐️',
  'Capricórnio': '♑️',
  'Aquário': '♒️',
  'Peixes': '♓️',
};


export default function ResultsSidebarDesktop({
  data,
  running,
  seconds,
  resultReady,
  canvasRef,
  canvasKey,
  speedMul,
}) {
  const formattedDate = new Date().toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  const year = new Date().getFullYear();

  const hiddenCanvas = (
    <div className="canvas-hidden" aria-hidden="true">
      <ChaosCanvas
        key={canvasKey}
        ref={canvasRef}
        running={false}
        speedMul={speedMul}
        className="canvas-shell"
      />
    </div>
  );

  if (running) {
    return (
      <div className="measure-wrap" aria-live="polite">
        <div className="hud-card">
          <div className="measure-grid">
            <ChaosCanvas
              key={canvasKey}
              ref={canvasRef}
              running
              speedMul={speedMul}
              className="canvas-shell measure-canvas"
            />

            <div className="measure-info">
              <h3>O pêndulo está medindo</h3>
              <p className="muted">
                Aguarde {String(seconds).padStart(2, "0")}s para visualizar o resultado do seu dia.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!resultReady) {
    return (
      <div className="hud-card" aria-live="polite">
        <h3>Pronto para medir</h3>
        <p className="muted">
          Escolha sua data e hora de nascimento e toque em “Medir a influência caótica” para descobrir o resultado de hoje.
        </p>
        {hiddenCanvas}
      </div>
    );
  }

  if (!data || !Number(data.bigCounter)) {
    return hiddenCanvas;
  }

  async function handleShare() {
    const text = `Minha intensidade caótica hoje é ${data.bigCounter} (${data.rangeBadge?.label}).`;

    try {
      if (navigator.share) {
        await navigator.share({ title: "Arkaose Chaos", text });
        return;
      }
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(text);
        alert("Resumo copiado! Compartilhe sua energia caótica.");
        return;
      }
    } catch (error) {
      console.debug("Ação de compartilhamento cancelada ou indisponível", error);
    }

    alert(text);
  }

  return (
    <>
      <div style={{ display: "flex"}}>


        <div className="resultado" >
          <div class="linha2">
            {/*resultados do dia*/}
            <div className="dayResult">
              <section className="hud-card" aria-label="Resumo da intensidade do caos">
                <header className="results-card__title">
                  <span className="caption">Resultados do dia</span>
                  <span className="divider" aria-hidden="true">|</span>
                  <time>{formattedDate}</time>
                </header>

                <div className="results-card__body">
                  <div className="results-card__score">
                    <div>

                      <strong>{Number(data.bigCounter)}</strong>
                    </div>
                    <span className="chip">{data.rangeBadge?.label}</span>
                  </div>

                  <ChaosIntensityBar value={Number(data.bigCounter)} />


                </div>

              </section>
            </div>
            {/*dica do dia*/}
            <div class="dayTip" >
              <aside className="results-side">
                {/* <button className="results-share" type="button" onClick={handleShare}>
            Compartilhar </button>  */}

                <section className="hud-card" aria-label="Dica do dia">
                  <div className="tip-icon" aria-hidden="true">☀️</div>
                  <div>
                    <h3>Dica do dia</h3>
                    <p className="muted">{data.advice || "Diga não para algo que não importa."}</p>
                  </div>
                </section>

              </aside>
            </div>

          </div>
          {/*signo do caos*/}
          <div class="caosDay" >
            <section className="hud-card" aria-label="Signo no caos">
              <div className="signo-body">
                <div className="signo-avatar" aria-hidden="true">{SIGNO_ICON[data.signoChaos] || "♈️"}</div>
                <div >
                  <div style={{display:"flex", alignItems:"center", gap:"10px"}}>
                  <h3 style={{marginTop:"1%"}}>Signo no caos</h3> <span className="chip">{data.signoChaos}</span></div>
                  <p className="muted">{data.inflMsg}</p>
                </div>
              </div>
             
            </section>
          </div>

        </div>
        {/*ads*/}
     

      </div>




      {hiddenCanvas}
    </>
  );
}







