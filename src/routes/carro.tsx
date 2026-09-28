import { createFileRoute } from "@tanstack/react-router";
import { Suspense, useCallback, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { useProgress } from "@react-three/drei";
import { CARROS, type Peca } from "@/components/carro/cars";
import { GarageScene } from "@/components/carro/Garage";
import "@/components/carro/carro.css";

export const Route = createFileRoute("/carro")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "O Carro — Garagem 3D | Factum Scuderia" },
      { name: "description", content: "Explore os carros da Factum Scuderia em uma garagem 3D: gire, aproxime e descubra a função física de cada peça." },
      { property: "og:title", content: "O Carro — Garagem 3D | Factum Scuderia" },
      { property: "og:description", content: "Explore peça por peça os carros de STEM Racing da Factum Scuderia em 3D." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@500;600;700;800&family=Barlow:wght@400;500;600&display=swap" },
    ],
  }),
  component: CarroPage,
});

function Loading() {
  const { progress } = useProgress();
  return (
    <div className="cg-loading">
      <div className="cg-loading-bar"><span style={{ width: `${progress}%` }} /></div>
      <div>Abrindo a garagem… {Math.round(progress)}%</div>
    </div>
  );
}

function CarroPage() {
  const [carId, setCarId] = useState(CARROS[0].id);
  const carro = CARROS.find((c) => c.id === carId)!;
  const [sel, setSel] = useState<Peca | null>(null);
  const [tip, setTip] = useState<{ p: Peca; x: number; y: number } | null>(null);
  const [ready, setReady] = useState(false);
  const [hint, setHint] = useState(true);

  const onHover = useCallback((p: Peca | null, x: number, y: number) => setTip(p ? { p, x, y } : null), []);
  const onReady = useCallback(() => setReady(true), []);
  const select = (p: Peca | null) => { setSel(p); setHint(false); };

  return (
    <div className="cg-root">
      <header className="cg-header">
        <a href="/" className="cg-back-site">← Factum Scuderia</a>
        <div className="cg-title">
          <span className="cg-tag">Garagem 3D</span>
          <h1>O Carro</h1>
        </div>
        <div className="cg-tabs" role="tablist" aria-label="Escolher carro">
          {CARROS.map((c) => (
            <button
              key={c.id}
              role="tab"
              aria-selected={c.id === carId}
              className={c.id === carId ? "active" : ""}
              onClick={() => { if (c.id !== carId) { setCarId(c.id); setSel(null); setReady(false); } }}
            >
              <strong>{c.nome}</strong>
              <small>{c.subtitulo}</small>
            </button>
          ))}
        </div>
      </header>

      <div className="cg-stage">
        <Canvas shadows dpr={[1, 2]} camera={{ position: [5.2, 2.4, 5.6], fov: 38 }} onPointerMissed={() => sel && select(null)}>
          <Suspense fallback={null}>
            <GarageScene key={carro.id} carro={carro} selecionada={sel} onSelect={select} onHover={onHover} onReady={onReady} />
          </Suspense>
        </Canvas>
        {!ready && <Loading />}

        {tip && !sel && (
          <div className="cg-tip" style={{ left: tip.x + 14, top: tip.y - 10 }}>{tip.p.nome}</div>
        )}
        <div className={`cg-hint ${hint && ready ? "" : "hide"}`}>Arraste para girar · toque numa peça para explorar</div>

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
      </div>
    </div>
  );
}
