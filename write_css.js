const fs = require('fs');
const path = require('path');

const css = `/* ============================================================
   FACTUM SCUDERIA — CARRO PAGE DESIGN SYSTEM
   Editorial race-team aesthetic. No glassmorphism, no neon.
   ============================================================ */

.cg-root {
  --navy:   #011039;
  --accent: #2a4fd4;
  --white:  #ffffff;
  --ink:    #02061a;
  --border: rgba(255,255,255,0.1);
  position: relative; min-height: 100vh; background: var(--ink); color: #fff;
  font-family: 'Barlow', sans-serif; display: flex; flex-direction: column;
  overflow-x: hidden; overflow-y: auto; scroll-behavior: smooth;
}

/* HEADER */
.cg-header {
  position: absolute; z-index: 5; top: 0; left: 0; right: 0;
  display: flex; align-items: center; justify-content: space-between;
  gap: 20px; padding: 0 4%; height: 66px;
  background: rgba(2, 6, 26, 0.96);
  border-bottom: 1px solid rgba(255,255,255,0.07);
  pointer-events: none;
}
.cg-header > * { pointer-events: auto; }
.cg-header.mode-track { background: rgba(3, 7, 24, 0.98); }
.cg-back-site {
  font-family: 'Barlow Condensed', sans-serif; font-weight: 700; font-size: 0.85rem;
  letter-spacing: 0.1em; text-transform: uppercase; color: rgba(255,255,255,0.55);
  text-decoration: none; display: flex; align-items: center; gap: 5px; transition: color 0.18s;
}
.cg-back-site:hover { color: #fff; }
.cg-title { text-align: center; }
.cg-title h1 {
  font-family: 'Barlow Condensed', sans-serif; font-weight: 900;
  font-size: clamp(1.8rem, 3vw, 2.6rem); line-height: 1;
  text-transform: uppercase; letter-spacing: 0.04em; margin: 0; color: #ffffff;
}
.cg-header-actions { display: flex; align-items: center; gap: 12px; }
.cg-cta-track-btn {
  display: inline-flex; align-items: center; gap: 10px; background: var(--accent);
  border: none; border-radius: 0; padding: 10px 22px; color: #fff; cursor: pointer;
  transition: background 0.18s;
}
.cg-cta-track-btn:hover { background: #3b60e8; }
.cg-cta-track-pulse { display: none; }
.cg-cta-track-text { display: flex; flex-direction: column; text-align: left; line-height: 1.15; }
.cg-cta-track-text strong {
  font-family: 'Barlow Condensed', sans-serif; font-weight: 800; font-size: 1.1rem;
  letter-spacing: 0.06em; text-transform: uppercase;
}
.cg-cta-track-text small {
  font-size: 0.68rem; color: rgba(255,255,255,0.7); letter-spacing: 0.06em; text-transform: uppercase;
}
.cg-btn-switch-garage {
  background: transparent; border: 1px solid rgba(255,255,255,0.28); border-radius: 0;
  color: #fff; padding: 10px 18px; font-family: 'Barlow Condensed', sans-serif;
  font-weight: 700; font-size: 1rem; letter-spacing: 0.06em; text-transform: uppercase;
  cursor: pointer; transition: all 0.18s; display: flex; align-items: center; gap: 8px;
}
.cg-btn-switch-garage:hover { background: #fff; color: var(--navy); border-color: #fff; }

/* STAGE */
.cg-stage { position: relative; height: 100vh; min-height: 640px; width: 100%; flex: none; overflow: hidden; }
.cg-stage canvas { touch-action: none; }
.cg-stage-backdrop-text {
  position: absolute; right: -0.03em; bottom: -0.05em;
  font-family: 'Barlow Condensed', sans-serif; font-weight: 900;
  font-size: clamp(18vw, 22vw, 26rem); line-height: 0.82;
  text-transform: uppercase; letter-spacing: -0.03em; color: rgba(255,255,255,0.038);
  pointer-events: none; user-select: none; z-index: 4;
}
.cg-loading {
  position: absolute; inset: 0; z-index: 10; display: flex; flex-direction: column;
  align-items: center; justify-content: center; gap: 14px;
  font-family: 'Barlow Condensed', sans-serif; font-size: 1.1rem;
  letter-spacing: 0.18em; text-transform: uppercase; background: var(--ink);
}
.cg-loading-bar { width: 220px; height: 2px; background: rgba(255,255,255,0.1); }
.cg-loading-bar span { display: block; height: 100%; background: var(--accent); transition: width .2s; }
.cg-tip {
  position: fixed; pointer-events: none; background: #fff; color: var(--navy);
  font-family: 'Barlow Condensed', sans-serif; font-weight: 700; font-size: 1rem;
  padding: 4px 12px; z-index: 8;
}
.cg-hint {
  position: absolute; left: 50%; bottom: 92px; transform: translateX(-50%);
  background: rgba(2, 6, 26, 0.88); border: 1px solid rgba(255,255,255,0.12);
  padding: 8px 18px; font-size: 0.88rem; pointer-events: none; transition: opacity 0.5s;
  white-space: nowrap; color: rgba(255,255,255,0.65); letter-spacing: 0.04em; z-index: 6;
}
.cg-hint.hide { opacity: 0; }
.cg-scroll-indicator {
  position: absolute; left: 4%; bottom: 84px; z-index: 6;
  display: inline-flex; align-items: center; gap: 8px; background: transparent;
  border: 1px solid rgba(255,255,255,0.18); color: rgba(255,255,255,0.6); padding: 8px 16px;
  font-family: 'Barlow Condensed', sans-serif; font-weight: 700; font-size: 0.82rem;
  letter-spacing: 0.1em; text-transform: uppercase; cursor: pointer; transition: all 0.2s;
}
.cg-scroll-indicator:hover { color: #fff; border-color: rgba(255,255,255,0.55); }

/* INFO PANEL */
.cg-panel {
  position: absolute; z-index: 6; top: 88px; right: 3%;
  width: min(400px, 92%); max-height: calc(100% - 196px); overflow-y: auto;
  background: #011039; border: 1px solid rgba(255,255,255,0.1);
  border-left: 3px solid var(--accent); padding: 26px 24px;
  opacity: 0; transform: translateX(30px); pointer-events: none;
  transition: opacity 0.35s, transform 0.4s cubic-bezier(.2,.8,.2,1);
}
.cg-panel.open { opacity: 1; transform: none; pointer-events: auto; }
.cg-panel h2 {
  font-family: 'Barlow Condensed', sans-serif; font-weight: 800; font-size: 2.1rem;
  line-height: 1.02; text-transform: uppercase; margin: 6px 0 14px; color: #fff;
}
.cg-close {
  background: transparent; border: 1px solid rgba(255,255,255,0.2); color: rgba(255,255,255,0.7);
  border-radius: 0; padding: 7px 14px; font-family: 'Barlow Condensed', sans-serif; font-weight: 700;
  font-size: 0.88rem; letter-spacing: 0.05em; text-transform: uppercase;
  cursor: pointer; margin-bottom: 20px; transition: 0.18s;
}
.cg-close:hover { background: #fff; color: var(--navy); border-color: #fff; }
.cg-tag { display: block; font-size: 0.75rem; letter-spacing: 0.18em; text-transform: uppercase; color: rgba(255,255,255,0.45); margin-bottom: 4px; }
.cg-mat { display: flex; align-items: center; gap: 10px; font-size: 0.97rem; color: rgba(255,255,255,.8); margin-bottom: 18px; }
.cg-mat span { width: 14px; height: 14px; border: 1px solid rgba(255,255,255,.3); flex: none; }
.cg-lbl { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.18em; color: rgba(255,255,255,0.45); font-weight: 600; margin-bottom: 8px; }
.cg-panel p { font-size: 0.98rem; line-height: 1.68; color: rgba(255,255,255,.88); }
.cg-parts {
  position: absolute; z-index: 5; left: 0; right: 0; bottom: 0;
  display: flex; justify-content: center; gap: 6px; padding: 14px 4% 18px;
  overflow-x: auto; scrollbar-width: none; background: rgba(2,6,26,0.92);
  border-top: 1px solid rgba(255,255,255,0.07);
}
.cg-parts button {
  flex: none; background: transparent; color: rgba(255,255,255,0.65);
  border: 1px solid rgba(255,255,255,0.15); border-radius: 0; padding: 7px 16px;
  font-size: 0.88rem; font-family: 'Barlow Condensed', sans-serif; font-weight: 600;
  letter-spacing: 0.04em; text-transform: uppercase; cursor: pointer; transition: 0.18s;
}
.cg-parts button:hover, .cg-parts button.active { background: #fff; color: var(--navy); border-color: #fff; }

/* REACTION TEST */
.cg-rx-overlay {
  position: absolute; inset: 0; z-index: 6; display: flex; flex-direction: column;
  justify-content: space-between; align-items: center; padding: 85px 4% 32px;
  pointer-events: auto; cursor: pointer; user-select: none; background: rgba(2,6,26,0.1);
}
.cg-rx-topbar {
  width: 100%; max-width: 1200px; display: flex; align-items: center;
  justify-content: space-between; gap: 16px; pointer-events: auto;
}
.cg-rx-btn-back {
  background: #011039; border: 1px solid rgba(255,255,255,0.18); border-radius: 0;
  color: rgba(255,255,255,0.82); padding: 9px 18px;
  font-family: 'Barlow Condensed', sans-serif; font-weight: 700; font-size: 0.88rem;
  letter-spacing: 0.09em; text-transform: uppercase; cursor: pointer; transition: all 0.18s;
  display: flex; align-items: center; gap: 7px;
}
.cg-rx-btn-back:hover { background: #fff; color: var(--navy); border-color: #fff; }
.cg-rx-badges { display: flex; align-items: center; gap: 10px; }
.cg-rx-record-badge {
  display: inline-flex; align-items: center; gap: 8px; background: #011039;
  border: 1px solid rgba(255,255,255,0.12); border-left: 3px solid #d4a820;
  padding: 7px 14px; font-family: 'Barlow Condensed', sans-serif;
  font-size: 0.88rem; letter-spacing: 0.05em; color: rgba(255,255,255,0.82);
}
.cg-rx-record-badge strong { color: #d4a820; font-size: 1rem; }
.cg-rx-record-icon { display: flex; align-items: center; }
.cg-rx-btn-sound {
  background: #011039; border: 1px solid rgba(255,255,255,0.18); border-radius: 0;
  color: rgba(255,255,255,0.65); padding: 8px 14px; font-size: 0.82rem;
  font-family: 'Barlow Condensed', sans-serif; font-weight: 600;
  letter-spacing: 0.06em; text-transform: uppercase; cursor: pointer; transition: 0.18s;
  display: flex; align-items: center; gap: 6px;
}
.cg-rx-btn-sound:hover { background: rgba(255,255,255,0.08); color: #fff; border-color: rgba(255,255,255,0.38); }

/* F1 Start Lights */
.cg-rx-gantry { display: flex; flex-direction: column; align-items: center; margin: 10px 0 0; pointer-events: none; }
.cg-rx-gantry-frame {
  display: flex; align-items: center; gap: clamp(10px, 2.5vw, 22px);
  background: #08090f; border: 2px solid rgba(255,255,255,0.06);
  padding: 16px clamp(18px, 4vw, 36px);
}
.cg-rx-light-col {
  display: flex; flex-direction: column; gap: 10px; background: #040507;
  border: 1px solid rgba(255,255,255,0.04); padding: 8px 10px;
}
.cg-rx-bulb {
  width: clamp(26px, 4.5vw, 42px); height: clamp(26px, 4.5vw, 42px);
  border-radius: 50%; background: #150000; border: 2px solid #200000; transition: all 0.07s ease-out;
}
.cg-rx-bulb.lit {
  background: radial-gradient(circle at 38% 38%, #ff7070 0%, #cc0000 45%, #820000 100%);
  border-color: #ff1a1a;
}

/* Status */
.cg-rx-status { display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; min-height: 200px; }
.cg-rx-prompt {
  background: #011039; border: 1px solid rgba(255,255,255,0.12); border-left: 3px solid var(--accent);
  padding: 12px 28px; font-family: 'Barlow Condensed', sans-serif; font-weight: 700;
  font-size: clamp(1rem, 2.2vw, 1.3rem); letter-spacing: 0.07em; text-transform: uppercase;
  color: #fff; display: inline-flex; align-items: center; gap: 10px;
}
.cg-rx-prompt-icon { display: flex; align-items: center; }
.cg-rx-prompt.pulse { animation: cgPulse 1.6s infinite; }
@keyframes cgPulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.65; } }
.cg-rx-prompt.go {
  background: #155e2e; border: 1px solid rgba(255,255,255,0.2); border-left-width: 1px; color: #fff;
  font-size: clamp(1.6rem, 4vw, 2.4rem); font-weight: 900; letter-spacing: 0.14em; animation: cgGoPop 0.22s ease-out;
}
@keyframes cgGoPop { 0% { transform: scale(0.88); } 60% { transform: scale(1.06); } 100% { transform: scale(1); } }

/* Result cards */
.cg-rx-result-card {
  position: relative; background: #011039;
  border-top: 4px solid var(--accent); border-left: 1px solid rgba(255,255,255,0.1);
  border-right: 1px solid rgba(255,255,255,0.1); border-bottom: 1px solid rgba(255,255,255,0.1);
  padding: 32px 36px; max-width: 480px; width: 92%; text-align: center;
  animation: cgCardIn 0.28s ease-out;
}
@keyframes cgCardIn { 0% { opacity: 0; transform: translateY(18px); } 100% { opacity: 1; transform: translateY(0); } }
.cg-rx-result-card.false-start { border-top-color: #cc0000; }
.cg-rx-result-card.false-start h2 {
  font-family: 'Barlow Condensed', sans-serif; font-weight: 900; font-size: 2.2rem;
  color: #ff3a3a; letter-spacing: 0.05em; text-transform: uppercase; margin: 12px 0 10px;
}
.cg-rx-result-card.false-start p { color: rgba(255,255,255,.82); font-size: 1rem; line-height: 1.5; margin: 0 0 22px; }
.cg-rx-warning-badge {
  display: inline-block; background: #3a0000; border: 1px solid rgba(200,0,0,0.3);
  color: rgba(255,130,130,0.9); font-family: 'Barlow Condensed', sans-serif; font-weight: 700;
  font-size: 0.78rem; letter-spacing: 0.16em; text-transform: uppercase; padding: 3px 12px;
}
.cg-rx-result-card.success { border-top-color: var(--accent); }
.cg-rx-result-tag {
  display: block; font-family: 'Barlow Condensed', sans-serif; font-size: 0.82rem;
  font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase;
  color: rgba(255,255,255,0.45); margin-bottom: 6px;
}
.cg-rx-time-display { display: flex; align-items: baseline; justify-content: center; gap: 6px; margin: 4px 0 16px; }
.cg-rx-time-val {
  font-family: 'Barlow Condensed', sans-serif; font-weight: 900;
  font-size: clamp(4.5rem, 9vw, 6.5rem); line-height: 0.9; letter-spacing: -0.02em; color: #fff;
}
.cg-rx-time-unit { font-family: 'Barlow Condensed', sans-serif; font-weight: 700; font-size: 1.8rem; color: rgba(255,255,255,0.45); }
.cg-rx-rating strong {
  display: block; font-family: 'Barlow Condensed', sans-serif; font-weight: 800;
  font-size: 1.4rem; text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 4px;
}
.cg-rx-rating p { font-size: 0.92rem; line-height: 1.45; color: rgba(255,255,255,0.8); margin: 0 0 14px; }
.cg-rx-benchmark {
  background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
  padding: 8px 14px; font-size: 0.86rem; color: rgba(255,255,255,0.6); margin-bottom: 22px;
  display: flex; align-items: center; gap: 8px; justify-content: center;
}
.cg-rx-benchmark strong { color: #fff; }
.cg-rx-actions { display: flex; gap: 10px; justify-content: center; }
.cg-rx-retry-btn {
  flex: 1; background: var(--accent); border: none; border-radius: 0; color: #fff; padding: 12px 24px;
  font-family: 'Barlow Condensed', sans-serif; font-weight: 800; font-size: 1.1rem;
  letter-spacing: 0.06em; text-transform: uppercase; cursor: pointer; transition: background 0.18s;
}
.cg-rx-retry-btn:hover { background: #3b60e8; }
.cg-rx-secondary-btn {
  background: transparent; border: 1px solid rgba(255,255,255,0.2); border-radius: 0;
  color: rgba(255,255,255,0.8); padding: 12px 18px;
  font-family: 'Barlow Condensed', sans-serif; font-weight: 700; font-size: 1rem;
  letter-spacing: 0.06em; text-transform: uppercase; cursor: pointer; transition: all 0.18s;
}
.cg-rx-secondary-btn:hover { background: rgba(255,255,255,0.07); color: #fff; border-color: rgba(255,255,255,0.38); }
.cg-rx-touch-hint {
  font-family: 'Barlow Condensed', sans-serif; font-size: 0.95rem; font-weight: 600;
  letter-spacing: 0.1em; text-transform: uppercase; color: rgba(255,255,255,0.45);
  background: rgba(0,0,0,0.35); padding: 5px 16px;
}

/* SOBRE O FB06 */
.cg-about { position: relative; background: #010b24; border-top: 1px solid rgba(255,255,255,0.07); padding: 84px 5% 100px; }
.cg-about-inner { max-width: 1200px; margin: 0 auto; display: flex; flex-direction: column; gap: 52px; }
.cg-about-header { text-align: center; }
.cg-about-badge {
  display: inline-block; background: var(--accent); color: #fff;
  font-family: 'Barlow Condensed', sans-serif; font-size: 0.82rem; font-weight: 700;
  letter-spacing: 0.22em; text-transform: uppercase; padding: 5px 16px; margin-bottom: 16px;
}
.cg-about-title {
  font-family: 'Barlow Condensed', sans-serif; font-weight: 900;
  font-size: clamp(3rem, 5.5vw, 5rem); text-transform: uppercase;
  letter-spacing: 0.02em; line-height: 1; color: #fff; margin: 0;
}
.cg-about-line { width: 56px; height: 3px; background: var(--accent); margin: 14px auto 0; }
.cg-about-lead-card {
  position: relative; background: #011039; border: 1px solid rgba(255,255,255,0.09);
  border-left: 4px solid var(--accent); padding: 32px 36px;
  display: flex; gap: 24px; align-items: flex-start;
}
.cg-about-lead-icon {
  flex: none; width: 44px; height: 44px; background: var(--accent);
  display: flex; align-items: center; justify-content: center; color: #fff;
}
.cg-about-lead { font-size: clamp(1.02rem, 1.3vw, 1.18rem); line-height: 1.78; color: rgba(255,255,255,.9); margin: 0; }
.cg-section-subtitle {
  font-family: 'Barlow Condensed', sans-serif; font-size: 1.7rem; font-weight: 700;
  letter-spacing: 0.06em; text-transform: uppercase; color: #fff; margin: 0 0 18px;
}
.cg-pillars-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2px; }
.cg-pillar-card { background: #011039; border: 1px solid rgba(255,255,255,0.07); padding: 26px 24px; transition: background 0.18s; position: relative; }
.cg-pillar-card::before { display: none; }
.cg-pillar-card:hover { background: #021558; }
.cg-pillar-num { font-family: 'Barlow Condensed', sans-serif; font-weight: 900; font-size: 3rem; color: rgba(42,79,212,0.35); line-height: 1; margin-bottom: 6px; }
.cg-pillar-card h4 { font-family: 'Barlow Condensed', sans-serif; font-size: 1.35rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; color: #fff; margin: 0 0 10px; }
.cg-pillar-card p { font-size: 0.96rem; line-height: 1.6; color: rgba(255,255,255,.76); margin: 0; }
.cg-pipeline-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 2px; }
.cg-pipeline-card { background: #02061a; border: 1px solid rgba(255,255,255,0.06); padding: 22px 20px; transition: background 0.18s; }
.cg-pipeline-card:hover { background: #011039; }
.cg-pipeline-badge {
  display: inline-block; font-family: 'Barlow Condensed', sans-serif; font-weight: 700;
  font-size: 0.73rem; letter-spacing: 0.15em; text-transform: uppercase;
  color: rgba(255,255,255,0.45); border: 1px solid rgba(255,255,255,0.14);
  padding: 2px 8px; margin-bottom: 12px;
}
.cg-pipeline-card h4 { font-family: 'Barlow Condensed', sans-serif; font-size: 1.2rem; font-weight: 700; text-transform: uppercase; color: #fff; margin: 0 0 8px; }
.cg-pipeline-card p { font-size: 0.88rem; line-height: 1.52; color: rgba(255,255,255,.7); margin: 0; }
.cg-specs-banner { display: grid; grid-template-columns: repeat(4, 1fr); gap: 2px; }
.cg-spec-card { background: #011039; border: 1px solid rgba(255,255,255,0.07); border-top: 3px solid var(--accent); padding: 22px 18px; text-align: center; }
.cg-spec-val { display: block; font-family: 'Barlow Condensed', sans-serif; font-weight: 900; font-size: 2.4rem; color: #fff; line-height: 1.05; margin-bottom: 4px; }
.cg-spec-title { display: block; font-family: 'Barlow Condensed', sans-serif; font-size: 0.88rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: rgba(255,255,255,0.5); margin-bottom: 8px; }
.cg-spec-card p { font-size: 0.84rem; line-height: 1.45; color: rgba(255,255,255,.6); margin: 0; }
.cg-about-footer { display: flex; justify-content: center; padding-top: 10px; }
.cg-btn-back-top {
  background: transparent; border: 1px solid rgba(255,255,255,0.2); border-radius: 0;
  color: rgba(255,255,255,0.65); padding: 11px 26px;
  font-family: 'Barlow Condensed', sans-serif; font-weight: 700; font-size: 1rem;
  letter-spacing: 0.09em; text-transform: uppercase; cursor: pointer; transition: all 0.18s;
}
.cg-btn-back-top:hover { background: #fff; color: var(--navy); border-color: #fff; }

/* RESPONSIVIDADE */
@media (max-width: 1024px) {
  .cg-pipeline-grid, .cg-specs-banner { grid-template-columns: repeat(2, 1fr); }
  .cg-pillars-grid { grid-template-columns: 1fr; }
}
@media (max-width: 760px) {
  .cg-header { flex-wrap: wrap; padding: 10px 4%; gap: 8px; height: auto; }
  .cg-title { order: -1; width: 100%; text-align: left; }
  .cg-header-actions { width: 100%; justify-content: space-between; }
  .cg-cta-track-btn { width: 100%; justify-content: center; }
  .cg-scroll-indicator { display: none; }
  .cg-parts { justify-content: flex-start; }
  .cg-panel { top: auto; right: 0; left: 0; bottom: 0; width: 100%; max-height: 58%; border-top: 3px solid var(--accent); border-left: 1px solid rgba(255,255,255,.08); transform: translateY(40px); padding: 22px 20px 28px; }
  .cg-panel h2 { font-size: 1.8rem; }
  .cg-hint { font-size: .84rem; bottom: 80px; }
  .cg-about { padding: 60px 5% 80px; }
  .cg-about-lead-card { flex-direction: column; padding: 22px 18px; }
  .cg-pipeline-grid, .cg-specs-banner { grid-template-columns: 1fr; }
  .cg-rx-overlay { padding: 80px 4% 20px; }
  .cg-rx-gantry-frame { padding: 12px 14px; gap: 8px; }
  .cg-rx-light-col { padding: 6px 6px; gap: 6px; }
  .cg-rx-result-card { padding: 24px 18px; }
  .cg-rx-time-val { font-size: 3.8rem; }
  .cg-stage-backdrop-text { font-size: 45vw; }
}
@media (prefers-reduced-motion: reduce) {
  .cg-panel, .cg-hint, .cg-scroll-indicator, .cg-cta-track-btn { transition: none; animation: none; }
}
`;

fs.writeFileSync(path.join(__dirname, 'src/components/carro/carro.css'), css, 'utf8');
console.log('CSS written: ' + css.length + ' bytes');
