import { createFileRoute } from "@tanstack/react-router";
import { Suspense, useCallback, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { useProgress } from "@react-three/drei";
import { CARRO_FB06, type Peca } from "@/components/carro/cars";
import { GarageScene } from "@/components/carro/Garage";
import { TrackScene } from "@/components/carro/TrackScene";
import { ReactionTest } from "@/components/carro/ReactionTest";
import "@/components/carro/carro.css";

export const Route = createFileRoute("/carro")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "FB-06 — Factum Scuderia | 3D & Teste de Reação" },
      { name: "description", content: "Explore o FB-06 da Factum Scuderia em 3D, conheça os componentes de engenharia e teste seus reflexos no circuito de arrancada F1." },
      { property: "og:title", content: "FB-06 — Factum Scuderia | 3D & Teste de Reação" },
      { property: "og:description", content: "Visualizador 3D do FB-06 da Factum Scuderia com teste interativo de reação na pista estilo F1." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@500;600;700;800;900&family=Barlow:wght@400;500;600;700&display=swap" },
    ],
  }),
  component: CarroPage,
});

function Loading() {
  const { progress } = useProgress();
  return (
    <div className="cg-loading">
      <div className="cg-loading-bar"><span style={{ width: `${progress}%` }} /></div>
      <div>Preparando o FB-06… {Math.round(progress)}%</div>
    </div>
  );
}

function CarroPage() {
  const carro = CARRO_FB06;
  const [modo, setModo] = useState<"garagem" | "pista">("garagem");
  const [trackCarState, setTrackCarState] = useState<"ready" | "launched" | "false_start">("ready");
  const [trackLaunchTimestamp, setTrackLaunchTimestamp] = useState<number>(0);

  const [sel, setSel] = useState<Peca | null>(null);
  const [tip, setTip] = useState<{ p: Peca; x: number; y: number } | null>(null);
  const [ready, setReady] = useState(false);
  const [hint, setHint] = useState(true);

  const onHover = useCallback((p: Peca | null, x: number, y: number) => setTip(p ? { p, x, y } : null), []);
  const onReady = useCallback(() => setReady(true), []);
  const select = (p: Peca | null) => { setSel(p); setHint(false); };

  const handleLaunch = useCallback((ms: number) => {
    setTrackCarState("launched");
    setTrackLaunchTimestamp(performance.now());
  }, []);

  const handleFalseStart = useCallback(() => {
    setTrackCarState("false_start");
  }, []);

  const handleResetCar = useCallback(() => {
    setTrackCarState("ready");
  }, []);

  const scrollToAbout = () => {
    document.getElementById("sobre-fb06")?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="cg-root" id="visualizador">
      <header className={`cg-header ${modo === "pista" ? "mode-track" : ""}`}>
        <a href="/" className="cg-back-site">← Factum Scuderia</a>
        
        <div className="cg-title">
          <h1>FB-06</h1>
        </div>

        <div className="cg-header-actions">
          {modo === "garagem" ? (
            <button
              className="cg-cta-track-btn"
              onClick={() => { setModo("pista"); setSel(null); }}
              aria-label="Ver o FB-06 na pista e testar tempo de reação"
            >
              <span className="cg-cta-track-pulse" />
              <span className="cg-cta-track-text">
                <strong>⚡ VEJA-O NA PISTA</strong>
                <small>Teste de Reação F1</small>
              </span>
            </button>
          ) : (
            <button
              className="cg-btn-switch-garage"
              onClick={() => setModo("garagem")}
              aria-label="Voltar para a garagem 3D"
            >
              🛠️ Explorar Peças 3D
            </button>
          )}
        </div>
      </header>

      <div className={`cg-stage ${modo === "pista" ? "mode-track" : "mode-garage"}`}>
        <Canvas
          shadows
          dpr={[1, 2]}
          camera={modo === "garagem" ? { position: [5.2, 2.4, 5.6], fov: 38 } : { position: [-2.8, 1.45, -2.5], fov: 38 }}
          onPointerMissed={() => sel && select(null)}
        >
          <Suspense fallback={null}>
            {modo === "garagem" ? (
              <GarageScene key="garage-fb06" carro={carro} selecionada={sel} onSelect={select} onHover={onHover} onReady={onReady} />
            ) : (
              <TrackScene key="track-fb06" carState={trackCarState} launchTimestamp={trackLaunchTimestamp} />
            )}
          </Suspense>
        </Canvas>

        {!ready && modo === "garagem" && <Loading />}

        {modo === "garagem" ? (
          <>
            {tip && !sel && (
              <div className="cg-tip" style={{ left: tip.x + 14, top: tip.y - 10 }}>{tip.p.nome}</div>
            )}
            <div className={`cg-hint ${hint && ready ? "" : "hide"}`}>Arraste para girar · toque numa peça para explorar</div>

            {/* Chamada flutuante para a pista */}
            <div className="cg-stage-track-cta-container">
              <button
                className="cg-stage-track-cta"
                onClick={() => { setModo("pista"); setSel(null); }}
              >
                <span className="cg-sparkle">⚡</span>
                <span>Ver o FB-06 na Pista · Teste de Reação</span>
                <span className="cg-arrow">→</span>
              </button>
            </div>

            <button className="cg-scroll-indicator" onClick={scrollToAbout} aria-label="Rolar para a seção sobre o FB06">
              <span>Sobre o FB06 · Engenharia</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>

            <aside className={`cg-panel ${sel ? "open" : ""}`} aria-live="polite">
              {sel && (
                <>
                  <button className="cg-close" onClick={() => select(null)}>← Voltar à vista geral</button>
                  <span className="cg-tag">{carro.nome} · Componente</span>
                  <h2>{sel.nome}</h2>
                  <div className="cg-mat"><span style={{ background: sel.cor }} />{sel.material}</div>
                  <div className="cg-lbl">Função física</div>
                  <p>{sel.funcao}</p>
                </>
              )}
            </aside>

            <nav className="cg-parts" aria-label="Peças do carro">
              {carro.pecas.map((p) => (
                <button key={p.id} className={sel?.id === p.id ? "active" : ""} onClick={() => select(sel?.id === p.id ? null : p)}>
                  {p.nome}
                </button>
              ))}
            </nav>
          </>
        ) : (
          <ReactionTest
            onLaunch={handleLaunch}
            onFalseStart={handleFalseStart}
            onResetCar={handleResetCar}
            onBackToGarage={() => setModo("garagem")}
          />
        )}
      </div>

      {/* Seção Sobre o FB06 abaixo do visualizador */}
      <section className="cg-about" id="sobre-fb06" aria-labelledby="sobre-fb06-titulo">
        <div className="cg-about-inner">
          <div className="cg-about-header">
            <span className="cg-about-badge">Engineering Portfolio 2024 · Factum Scuderia</span>
            <h2 id="sobre-fb06-titulo" className="cg-about-title">Sobre o FB06</h2>
            <div className="cg-about-line" />
          </div>

          <div className="cg-about-lead-card">
            <div className="cg-about-lead-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
              </svg>
            </div>
            <p className="cg-about-lead">
              O FB06 foi desenvolvido pela equipe de engenharia da Factum Scuderia com três objetivos centrais: o melhor tempo de pista possível, conformidade total com o regulamento da categoria (sem penalidades) e durabilidade para resistir a múltiplas corridas com o mínimo de reparo. Cada peça do carro passou por ciclos de modelagem em CAD (Autodesk Fusion 360), simulações de CFD (dinâmica de fluidos computacional) e testes de estresse estrutural antes da fabricação, que combina usinagem CNC (para o chassi) e impressão 3D (para as demais peças).
            </p>
          </div>

          <div className="cg-pillars-section">
            <h3 className="cg-section-subtitle">Os Três Objetivos Centrais de Engenharia</h3>
            <div className="cg-pillars-grid">
              <div className="cg-pillar-card">
                <div className="cg-pillar-num">01</div>
                <h4>Melhor Tempo de Pista</h4>
                <p>
                  Downforce e arrasto calibrados por perfil NACA 0006 e efeito Coandă, aliados a rolamentos cerâmicos de atrito mínimo para maximizar a inércia nos dois terços finais da pista.
                </p>
              </div>

              <div className="cg-pillar-card">
                <div className="cg-pillar-num">02</div>
                <h4>Conformidade Total</h4>
                <p>
                  Rigor absoluto em todas as dimensões, caixas de exclusão regulamentares, pesos mínimos e proteção do cockpit virtual — garantindo pontuação máxima sem penalidades.
                </p>
              </div>

              <div className="cg-pillar-card">
                <div className="cg-pillar-num">03</div>
                <h4>Durabilidade Estrutural</h4>
                <p>
                  Resistência mecânica comprovada por testes de estresse com 4x a carga de segurança no Halo de Nylon e câmara de CO2 reforçada para múltiplos disparos e impactos de desaceleração.
                </p>
              </div>
            </div>
          </div>

          <div className="cg-pipeline-section">
            <h3 className="cg-section-subtitle">Ciclo de Desenvolvimento & Manufatura</h3>
            <div className="cg-pipeline-grid">
              <div className="cg-pipeline-card">
                <div className="cg-pipeline-badge">Etapa 01</div>
                <h4>Modelagem em CAD</h4>
                <p>Desenvolvimento paramétrico no <strong>Autodesk Fusion 360</strong>, aplicando linhas de gota d'água (drop shape) e transições aerodinâmicas contínuas.</p>
              </div>

              <div className="cg-pipeline-card">
                <div className="cg-pipeline-badge">Etapa 02</div>
                <h4>Simulações CFD</h4>
                <p>Validação da dinâmica de fluidos computacional para otimizar efeito outwash nas asas, fluxo Venturi no assoalho e redução de vórtices de esteira.</p>
              </div>

              <div className="cg-pipeline-card">
                <div className="cg-pipeline-badge">Etapa 03</div>
                <h4>Testes de Estresse</h4>
                <p>Análise de elementos finitos e testes empíricos com sobrecarga estrutural de 4x na área do cockpit e resistência extrema à pressão do gás CO2.</p>
              </div>

              <div className="cg-pipeline-card">
                <div className="cg-pipeline-badge">Etapa 04</div>
                <h4>Fabricação Híbrida</h4>
                <p>Usinagem <strong>CNC de precisão</strong> para o bloco estrutural do chassi e <strong>impressão 3D aditiva</strong> (Nylon e ABS) para os demais componentes funcionais.</p>
              </div>
            </div>
          </div>

          <div className="cg-specs-section">
            <h3 className="cg-section-subtitle">Métricas Técnicas em Destaque</h3>
            <div className="cg-specs-banner">
              <div className="cg-spec-card">
                <span className="cg-spec-val">-0,64g</span>
                <span className="cg-spec-title">Alívio de Massa</span>
                <p>Redução de peso alcançada na 4ª evolução do chassi drop shape.</p>
              </div>
              <div className="cg-spec-card">
                <span className="cg-spec-val">NACA 0006</span>
                <span className="cg-spec-title">Perfil Aerodinâmico</span>
                <p>Excelente coeficiente de sustentação com mínimo arrasto induzido.</p>
              </div>
              <div className="cg-spec-card">
                <span className="cg-spec-val">Cerâmica</span>
                <span className="cg-spec-title">Rolamentos</span>
                <p>1 rolamento cerâmico por roda garantindo velocidade na inércia.</p>
              </div>
              <div className="cg-spec-card">
                <span className="cg-spec-val">4x Carga</span>
                <span className="cg-spec-title">Fator de Segurança</span>
                <p>Halo de Nylon testado a 400% da carga obrigatória de segurança.</p>
              </div>
            </div>
          </div>

          <div className="cg-about-footer">
            <button onClick={scrollToTop} className="cg-btn-back-top">
              ↑ Retornar ao Topo
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
