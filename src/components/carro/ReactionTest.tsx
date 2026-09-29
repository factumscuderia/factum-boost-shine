import { useState, useEffect, useRef, useCallback } from "react";
import { sound } from "./sound";

export type ReactionState = "idle" | "countdown" | "waiting_out" | "lights_out" | "false_start" | "success";

type Props = {
  onLaunch: (reactionTimeMs: number) => void;
  onFalseStart: () => void;
  onResetCar: () => void;
  onBackToGarage: () => void;
};

export function ReactionTest({ onLaunch, onFalseStart, onResetCar, onBackToGarage }: Props) {
  const [state, setState] = useState<ReactionState>("idle");
  const [activeLights, setActiveLights] = useState(0); // 0 to 5
  const [reactionTime, setReactionTime] = useState<number | null>(null);
  const [bestTime, setBestTime] = useState<number | null>(null);
  const [muted, setMuted] = useState(sound.muted);

  const lightsOutTimestamp = useRef<number>(0);
  const timerRefs = useRef<NodeJS.Timeout[]>([]);

  // Load session best time from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("factum_best_reaction_ms");
      if (stored) setBestTime(Number(stored));
    } catch {}
  }, []);

  const clearAllTimers = useCallback(() => {
    timerRefs.current.forEach((t) => clearTimeout(t));
    timerRefs.current = [];
  }, []);

  useEffect(() => {
    return () => clearAllTimers();
  }, [clearAllTimers]);

  // Start the F1 start sequence
  const startSequence = useCallback(() => {
    clearAllTimers();
    onResetCar();
    setState("countdown");
    setActiveLights(0);
    setReactionTime(null);

    // Sequence 5 lights turning on at 750ms intervals
    for (let i = 1; i <= 5; i++) {
      const t = setTimeout(() => {
        setActiveLights(i);
        sound.beep(i - 1);

        // After the 5th light, set a random delay (1200ms - 2800ms) before lights out
        if (i === 5) {
          setState("waiting_out");
          const randomDelay = 1200 + Math.random() * 1600;
          const outTimer = setTimeout(() => {
            setActiveLights(0);
            lightsOutTimestamp.current = performance.now();
            setState("lights_out");
            sound.lightsOut();
          }, randomDelay);
          timerRefs.current.push(outTimer);
        }
      }, i * 750);
      timerRefs.current.push(t);
    }
  }, [clearAllTimers, onResetCar]);

  // Start countdown automatically on mount
  useEffect(() => {
    startSequence();
  }, [startSequence]);

  // Handle user tap/click/spacebar reaction
  const handleTrigger = useCallback(() => {
    if (state === "idle" || state === "false_start" || state === "success") {
      startSequence();
      return;
    }

    if (state === "countdown" || state === "waiting_out") {
      // FALSE START / LARGADA QUEIMADA
      clearAllTimers();
      setActiveLights(5);
      setState("false_start");
      sound.falseStart();
      onFalseStart();
      return;
    }

    if (state === "lights_out") {
      // SUCCESS! Calculate reaction time
      const time = Math.round(performance.now() - lightsOutTimestamp.current);
      setReactionTime(time);
      setState("success");
      sound.launch();
      onLaunch(time);

      // Save best time
      setBestTime((prev) => {
        const next = prev === null || time < prev ? time : prev;
        try {
          localStorage.setItem("factum_best_reaction_ms", String(next));
        } catch {}
        return next;
      });
    }
  }, [state, clearAllTimers, onFalseStart, onLaunch, startSequence]);

  // Spacebar and Enter trigger support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.code === "Enter") {
        e.preventDefault();
        handleTrigger();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleTrigger]);

  const toggleSound = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    const next = sound.toggleMute();
    setMuted(next);
  };

  const getRating = (ms: number) => {
    if (ms < 200) return { label: "Reflexo sobre-humano!", desc: "Mais rápido que a maioria dos pilotos profissionais!" };
    if (ms <= 260) return { label: "Nível Piloto de F1!", desc: "Dentro do tempo de reação de elite da Fórmula 1 (200–250ms)." };
    if (ms <= 330) return { label: "Excelente Largada!", desc: "Tempo de reação no grid oficial de competição." };
    if (ms <= 420) return { label: "Boa Reação!", desc: "Mantenha a concentração no ponto cego das luzes." };
    return { label: "Aqueça os Reflexos", desc: "Tente focar apenas no momento em que o vermelho sumir." };
  };

  return (
    <div
      className="cg-rx-overlay"
      onClick={handleTrigger}
      onTouchStart={(e) => {
        // Instant touch response without click delay on mobile/tablet
        if ((e.target as HTMLElement).closest("button")) return;
        e.preventDefault();
        handleTrigger();
      }}
    >
      {/* Barra de controle superior */}
      <div className="cg-rx-topbar" onClick={(e) => e.stopPropagation()} onTouchStart={(e) => e.stopPropagation()}>
        <button className="cg-rx-btn-back" onClick={onBackToGarage}>
          Voltar à garagem
        </button>

        <div className="cg-rx-badges">
          {bestTime !== null && (
            <div className="cg-rx-record-badge">
              <span>Seu Recorde: <strong>{bestTime}ms</strong></span>
            </div>
          )}
          <button className="cg-rx-btn-sound" onClick={toggleSound} title={muted ? "Ativar som" : "Desativar som"}>
            {muted ? "Som desativado" : "Som ativo"}
          </button>
        </div>
      </div>

      {/* Pórtico de Largada F1 (5 Luzes Vermelhas) */}
      <div className="cg-rx-gantry">
        <div className="cg-rx-gantry-frame">
          {Array.from({ length: 5 }).map((_, idx) => {
            const isLit = activeLights > idx;
            return (
              <div key={idx} className="cg-rx-light-col">
                <div className={`cg-rx-bulb ${isLit ? "lit" : ""}`} />
                <div className={`cg-rx-bulb ${isLit ? "lit" : ""}`} />
              </div>
            );
          })}
        </div>
      </div>

      {/* Orientação em tempo real ou Status do Teste */}
      <div className="cg-rx-status">
        {(state === "countdown" || state === "waiting_out") && (
          <div className="cg-rx-prompt pulse">
            <span>Toque na tela ou pressione <strong>ESPAÇO</strong> assim que as luzes apagarem!</span>
          </div>
        )}

        {state === "lights_out" && (
          <div className="cg-rx-prompt go">
            <span>VAI! VAI! VAI!</span>
          </div>
        )}

        {/* LARGADA QUEIMADA */}
        {state === "false_start" && (
          <div className="cg-rx-result-card false-start" onClick={(e) => e.stopPropagation()} onTouchStart={(e) => e.stopPropagation()}>
            <div className="cg-rx-warning-badge">LARGADA ANTECIPADA</div>
            <h2>LARGADA QUEIMADA!</h2>
            <p>Você acelerou antes das luzes vermelhas se apagarem. Como na F1 real, isso resultaria em penalidade.</p>
            <button className="cg-rx-retry-btn" onClick={startSequence}>
              Tentar novamente
            </button>
          </div>
        )}

        {/* RESULTADO DA LARGADA */}
        {state === "success" && reactionTime !== null && (
          <div className="cg-rx-result-card success" onClick={(e) => e.stopPropagation()} onTouchStart={(e) => e.stopPropagation()}>
            <span className="cg-rx-result-tag">Seu Tempo de Reação</span>
            <div className="cg-rx-time-display">
              <span className="cg-rx-time-val">{reactionTime}</span>
              <span className="cg-rx-time-unit">ms</span>
            </div>

            {(() => {
              const rating = getRating(reactionTime);
              return (
                <div className="cg-rx-rating">
                  <strong style={{ color: "#ffffff" }}>{rating.label}</strong>
                  <p>{rating.desc}</p>
                </div>
              );
            })()}

            <div className="cg-rx-benchmark">
              <span>Piloto de F1 em média: <strong>aprox. 200–300 ms</strong></span>
            </div>

            <div className="cg-rx-actions">
              <button className="cg-rx-retry-btn" onClick={startSequence}>
                Tentar novamente
              </button>
              <button className="cg-rx-secondary-btn" onClick={onBackToGarage}>
                Ver Peças do Carro
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Indicador de toque na tela inteira */}
      {state !== "success" && state !== "false_start" && (
        <div className="cg-rx-touch-hint">
          {state === "lights_out" ? "TOQUE AGORA!" : "Toque em qualquer lugar da tela quando as luzes apagarem"}
        </div>
      )}
    </div>
  );
}
