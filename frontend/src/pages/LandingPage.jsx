import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Clash+Display:wght@400;500;600;700&family=Cabinet+Grotesk:wght@400;500;700;800;900&family=JetBrains+Mono:wght@400;500;600&display=swap');

  :root {
    --bg:      #04040a;
    --surface: #0a0b18;
    --border:  #14152a;
    --border2: #1e1e3a;
    --purple:  #6c5fff;
    --blue:    #4488ff;
    --teal:    #22ddaa;
    --gold:    #ffaa33;
    --red:     #ff6655;
    --text:    #e8eaf6;
    --muted:   #5a5a88;
  }

  *, *::before, *::after { margin:0; padding:0; box-sizing:border-box; }
  html { scroll-behavior: smooth; }

  body {
    background: var(--bg);
    font-family: 'Cabinet Grotesk', sans-serif;
    color: var(--text);
    overflow-x: hidden;
  }

  /* noise overlay */
  .lp-noise::before {
    content: '';
    position: fixed; inset: 0;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
    pointer-events: none; z-index: 0; opacity: 0.4;
  }

  /* ── NAV ── */
  .lp-nav {
    position: fixed; top:0; left:0; right:0; z-index:200;
    padding: 0 48px; height: 64px;
    display: flex; align-items: center; justify-content: space-between;
    background: rgba(4,4,10,0.8);
    backdrop-filter: blur(24px);
    border-bottom: 1px solid rgba(108,95,255,0.07);
  }
  .lp-nav-logo { display:flex; align-items:center; gap:10px; text-decoration:none; cursor:pointer; }
  .lp-nav-logo-icon {
    width:32px; height:32px; border-radius:9px;
    background: linear-gradient(135deg,#6c5fff,#4488ff);
    display:flex; align-items:center; justify-content:center;
    font-size:16px; box-shadow:0 0 24px rgba(108,95,255,0.45);
  }
  .lp-nav-logo-text {
    font-family:'Clash Display',sans-serif; font-size:18px;
    font-weight:700; color:var(--text); letter-spacing:-0.02em;
  }
  .lp-nav-links { display:flex; align-items:center; gap:32px; list-style:none; }
  .lp-nav-links a {
    font-size:14px; font-weight:500; color:var(--muted);
    text-decoration:none; transition:color 0.2s; cursor:pointer;
  }
  .lp-nav-links a:hover { color:var(--text); }
  .lp-nav-links a.active { color:var(--text); font-weight:700; }
  .lp-nav-cta {
    padding:8px 22px; border-radius:10px; font-size:13px; font-weight:700;
    background: linear-gradient(135deg,#6c5fff,#4a38d4);
    color: white !important; text-decoration:none; cursor:pointer;
    box-shadow:0 4px 20px rgba(108,95,255,0.35); transition:all 0.2s;
    border:none; letter-spacing:0.02em;
  }
  .lp-nav-cta:hover { box-shadow:0 6px 28px rgba(108,95,255,0.55); transform:translateY(-1px); }
  .lp-hamburger { display:none; flex-direction:column; gap:5px; cursor:pointer; background:none; border:none; padding:4px; }
  .lp-hamburger span { display:block; width:22px; height:2px; background:#5a5a88; border-radius:2px; transition:all 0.3s; }

  /* ── MOBILE MENU ── */
  .lp-mobile-menu {
    display: none;
    position: fixed; top:64px; left:0; right:0; z-index:190;
    background: rgba(4,4,10,0.97); backdrop-filter:blur(24px);
    border-bottom:1px solid rgba(108,95,255,0.1);
    padding: 24px;
    flex-direction: column; gap:16px;
  }
  .lp-mobile-menu.open { display:flex; }
  .lp-mobile-menu a {
    font-size:16px; font-weight:600; color:var(--muted);
    text-decoration:none; padding:10px 0;
    border-bottom:1px solid var(--border); cursor:pointer;
  }
  .lp-mobile-menu a:last-child { border-bottom:none; }
  .lp-mobile-menu a:hover { color:var(--text); }

  /* ── HERO ── */
  .lp-hero {
    min-height: 100vh;
    display:flex; flex-direction:column; align-items:center; justify-content:center;
    padding: 120px 24px 80px;
    position:relative; text-align:center; overflow:hidden;
  }
  .lp-mesh-orb {
    position:absolute; border-radius:50%; filter:blur(80px);
    animation:lpOrbFloat 8s ease-in-out infinite; pointer-events:none; z-index:0;
  }
  @keyframes lpOrbFloat {
    0%,100%{ transform:translate(0,0) scale(1) }
    33%    { transform:translate(30px,-20px) scale(1.1) }
    66%    { transform:translate(-20px,15px) scale(0.95) }
  }

  .lp-hero-badge {
    display:inline-flex; align-items:center; gap:8px; padding:6px 16px;
    border-radius:20px; background:rgba(108,95,255,0.1);
    border:1px solid rgba(108,95,255,0.25);
    font-family:'JetBrains Mono',monospace; font-size:11px; font-weight:600;
    color:#a08fff; letter-spacing:0.1em; text-transform:uppercase;
    margin-bottom:28px; position:relative; z-index:1;
    animation:lpFadeUp 0.6s 0.1s ease both;
  }
  .lp-bdot {
    width:6px; height:6px; border-radius:50%;
    background:#6c5fff; box-shadow:0 0 8px #6c5fff;
    animation:lpBlink 2s ease-in-out infinite;
  }
  @keyframes lpBlink { 0%,100%{opacity:1} 50%{opacity:0.2} }

  .lp-headline {
    font-family:'Clash Display',sans-serif;
    font-size:clamp(44px,7.5vw,96px); font-weight:700;
    line-height:1.0; letter-spacing:-0.04em;
    color:var(--text); margin-bottom:24px;
    position:relative; z-index:1;
    animation:lpFadeUp 0.6s 0.2s ease both;
  }
  .lp-grad {
    background:linear-gradient(135deg,#a08fff 0%,#4488ff 45%,#22ddaa 100%);
    -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;
  }
  .lp-sub {
    font-size:clamp(16px,2vw,19px); color:var(--muted); line-height:1.75;
    max-width:560px; margin:0 auto 44px; font-weight:500;
    position:relative; z-index:1;
    animation:lpFadeUp 0.6s 0.35s ease both;
  }
  .lp-ctas {
    display:flex; align-items:center; gap:14px; justify-content:center;
    flex-wrap:wrap; position:relative; z-index:1; margin-bottom:60px;
    animation:lpFadeUp 0.6s 0.5s ease both;
  }
  .lp-btn-primary {
    display:inline-flex; align-items:center; gap:8px;
    padding:14px 32px; border-radius:14px; font-size:15px; font-weight:800;
    background:linear-gradient(135deg,#6c5fff,#4a38d4); color:white;
    text-decoration:none; cursor:pointer; border:none;
    box-shadow:0 8px 32px rgba(108,95,255,0.45); transition:all 0.2s;
    position:relative; overflow:hidden;
  }
  .lp-btn-primary::before {
    content:''; position:absolute; inset:0;
    background:linear-gradient(to bottom,rgba(255,255,255,0.12),transparent);
  }
  .lp-btn-primary:hover { transform:translateY(-3px); box-shadow:0 16px 44px rgba(108,95,255,0.6); }
  .lp-btn-secondary {
    display:inline-flex; align-items:center; gap:8px;
    padding:14px 28px; border-radius:14px; font-size:15px; font-weight:700;
    background:rgba(255,255,255,0.04); border:1px solid var(--border2);
    color:var(--muted); text-decoration:none; cursor:pointer; transition:all 0.2s;
  }
  .lp-btn-secondary:hover { background:rgba(255,255,255,0.07); color:var(--text); transform:translateY(-2px); }

  @keyframes lpFadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }

  /* ── PREVIEW FRAME ── */
  .lp-preview {
    position:relative; z-index:1; width:100%; max-width:800px;
    animation:lpPreviewRise 1s 0.7s cubic-bezier(0.22,1,0.36,1) both;
  }
  @keyframes lpPreviewRise {
    from { opacity:0; transform:translateY(70px) scale(0.95) }
    to   { opacity:1; transform:translateY(0)    scale(1)    }
  }
  .lp-preview-glow {
    position:absolute; bottom:-40px; left:50%; transform:translateX(-50%);
    width:65%; height:90px;
    background:radial-gradient(ellipse,rgba(108,95,255,0.4),transparent 70%);
    filter:blur(20px); animation:lpGlowPulse 4s ease-in-out infinite; pointer-events:none;
  }
  @keyframes lpGlowPulse {
    0%,100%{ opacity:0.7; transform:translateX(-50%) scaleX(1)    }
    50%    { opacity:1;   transform:translateX(-50%) scaleX(1.15) }
  }
  .lp-frame {
    width:100%; border-radius:16px;
    border:1px solid rgba(108,95,255,0.18); background:var(--surface);
    overflow:hidden;
    box-shadow:0 0 0 1px rgba(108,95,255,0.08),
               0 40px 120px rgba(0,0,0,0.85),
               0 0 80px rgba(108,95,255,0.1);
  }
  .lp-frame-bar {
    background:#060710; padding:9px 14px;
    display:flex; align-items:center; gap:5px;
    border-bottom:1px solid var(--border);
  }
  .lp-dot { width:8px; height:8px; border-radius:50%; }
  .lp-url {
    margin-left:8px; background:#0d0e1c; border-radius:5px;
    padding:3px 12px; font-family:'JetBrains Mono',monospace;
    font-size:9px; color:#333366; flex:1; text-align:center;
  }

  /* app shell */
  .lp-app { display:flex; height:370px; }

  /* ── SIDEBAR ── */
  .lp-sb {
    width:170px; background:#070810;
    border-right:1px solid #0e0f1e;
    display:flex; flex-direction:column; flex-shrink:0;
  }
  .lp-sb-logo {
    display:flex; align-items:center; gap:7px;
    padding:11px 10px; border-bottom:1px solid #0e0f1e;
  }
  .lp-sb-logo-icon {
    width:20px; height:20px; border-radius:5px;
    background:linear-gradient(135deg,#6c5fff,#4488ff);
    display:flex; align-items:center; justify-content:center;
    font-size:10px; box-shadow:0 0 10px rgba(108,95,255,0.3);
  }
  .lp-sb-nav { flex:1; padding:6px 5px; display:flex; flex-direction:column; gap:1px; }
  .lp-sb-lbl {
    font-family:'JetBrains Mono',monospace; font-size:6.5px; font-weight:700;
    letter-spacing:0.14em; text-transform:uppercase; color:#222240; padding:5px 8px 3px;
  }
  .lp-sb-item { display:flex; align-items:center; gap:6px; padding:6px 8px; border-radius:6px; font-size:10px; color:#5a5a88; }
  .lp-sb-item-active { background:rgba(108,95,255,0.1); color:#a08fff; position:relative; }
  .lp-sb-item-active::before {
    content:''; position:absolute; left:0; top:50%; transform:translateY(-50%);
    width:2px; height:11px; background:#6c5fff; border-radius:0 2px 2px 0;
  }
  .lp-sb-streak {
    margin:2px 5px; padding:7px 8px; border-radius:7px;
    background:rgba(255,170,51,0.07); border:1px solid rgba(255,170,51,0.14);
    display:flex; align-items:center; gap:6px;
  }
  .lp-sb-profile {
    margin:2px 5px 5px; padding:7px 8px; border-radius:7px;
    background:rgba(108,95,255,0.06); border:1px solid rgba(108,95,255,0.12);
    display:flex; align-items:center; gap:6px;
  }
  .lp-sb-avatar {
    width:22px; height:22px; border-radius:6px;
    background:rgba(108,95,255,0.2); border:1px solid rgba(108,95,255,0.3);
    display:flex; align-items:center; justify-content:center;
    font-size:8px; font-weight:800; color:#8878ff; flex-shrink:0;
  }

  /* ── MAIN PANEL ── */
  .lp-main {
    flex:1; background:#080910; padding:12px 14px;
    display:flex; flex-direction:column; gap:8px;
    overflow:hidden;
  }

  /* row1: greeting + new goal btn */
  .lp-row1 { display:flex; align-items:center; justify-content:space-between; }
  .lp-greeting { font-family:'Clash Display',sans-serif; font-size:11px; font-weight:700; color:#dde0f0; }
  .lp-greeting-sub { font-size:7px; color:#444466; margin-top:1px; }
  .lp-new-btn {
    display:flex; align-items:center; gap:4px;
    padding:4px 9px; border-radius:7px;
    background:linear-gradient(135deg,rgba(108,95,255,0.18),rgba(68,136,255,0.1));
    border:1px solid rgba(108,95,255,0.25);
    font-size:7px; font-weight:700; color:#8878ff;
    white-space:nowrap; font-family:'JetBrains Mono',monospace; cursor:pointer;
  }

  /* stats 4-col */
  .lp-stats { display:grid; grid-template-columns:repeat(4,1fr); gap:5px; }
  .lp-stat { background:#0e0f1c; border:1px solid #1a1a2e; border-radius:8px; padding:6px 8px; }
  .lp-stat-val { font-family:'JetBrains Mono',monospace; font-size:12px; font-weight:800; margin-bottom:1px; }
  .lp-stat-lbl { font-size:6px; color:#5a5a88; line-height:1.3; }

  /* filter pills — right aligned below stats */
  .lp-pills { display:flex; justify-content:flex-end; gap:4px; }
  .lp-pill {
    padding:2px 7px; border-radius:20px; font-size:6.5px; font-weight:600;
    font-family:'JetBrains Mono',monospace; border:1px solid; cursor:pointer; white-space:nowrap;
  }

  /* ── GOAL CARDS GRID ── */
  .lp-goals { display:grid; grid-template-columns:repeat(4,1fr); gap:5px; }

  /* each goal card — fixed compact height */
  .lp-gcard {
    background:#0e0f1c; border:1px solid #1a1a2e; border-radius:8px;
    padding:7px 8px; height:80px;
    display:flex; flex-direction:column; justify-content:space-between;
    position:relative; overflow:hidden;
  }
  /* colored top accent */
  .lp-gcard::before { content:''; position:absolute; top:0; left:0; right:0; height:2px; background:var(--gc); }

  /* status pill — absolute top right */
  .lp-gstatus {
    position:absolute; top:6px; right:6px;
    font-size:5px; font-weight:700; padding:1px 4px; border-radius:5px;
    font-family:'JetBrains Mono',monospace; letter-spacing:0.03em; border:1px solid;
  }

  /* top section: emoji left, name right of emoji */
  .lp-gtop { display:flex; align-items:flex-start; gap:6px; }
  .lp-gemoji {
    width:22px; height:22px; border-radius:5px;
    display:flex; align-items:center; justify-content:center;
    font-size:12px; flex-shrink:0;
  }
  .lp-gname { font-size:8px; font-weight:700; color:#dde0f0; line-height:1.2; padding-right:26px; }

  /* meta: resources + days — below emoji on left */
  .lp-gmeta { display:flex; flex-direction:column; gap:1px; padding-left:0; }
  .lp-gmeta-item { font-size:6.5px; color:#5a5a88; }

  /* progress bar row */
  .lp-gbar-row { display:flex; align-items:center; gap:5px; }
  .lp-gbar { flex:1; height:2px; background:#1a1a2e; border-radius:2px; overflow:hidden; }
  .lp-gbar-fill { height:100%; border-radius:2px; }
  .lp-gpct { font-family:'JetBrains Mono',monospace; font-size:6.5px; font-weight:700; flex-shrink:0; }

  /* new goal dashed card */
  .lp-new-card {
    background:rgba(108,95,255,0.03); border:1px dashed rgba(108,95,255,0.22);
    border-radius:8px; height:80px;
    display:flex; flex-direction:column; align-items:center; justify-content:center;
    gap:4px; cursor:pointer; transition:all 0.2s;
  }
  .lp-new-card:hover { background:rgba(108,95,255,0.07); border-color:rgba(108,95,255,0.4); }
  .lp-new-plus {
    width:22px; height:22px; border-radius:5px;
    background:rgba(108,95,255,0.1); border:1px solid rgba(108,95,255,0.2);
    display:flex; align-items:center; justify-content:center;
    font-size:13px; color:#6c5fff; font-weight:300; line-height:1;
  }
  .lp-new-lbl { font-size:7px; font-weight:600; color:#5a5a88; font-family:'JetBrains Mono',monospace; text-align:center; }

  /* ── DIVIDER ── */
  .lp-divider { width:100%; height:1px; background:linear-gradient(90deg,transparent,var(--border2),transparent); max-width:1200px; margin:0 auto; }

  /* ── SECTION COMMONS ── */
  .lp-section { padding:100px 24px; position:relative; }
  .lp-inner { max-width:1040px; margin:0 auto; }
  .lp-tag {
    font-family:'JetBrains Mono',monospace; font-size:10px; font-weight:700;
    letter-spacing:0.2em; text-transform:uppercase; color:var(--purple);
    margin-bottom:16px; display:block;
  }
  .lp-section-title {
    font-family:'Clash Display',sans-serif; font-size:clamp(32px,5vw,54px);
    font-weight:700; letter-spacing:-0.03em; color:var(--text);
    line-height:1.08; margin-bottom:20px;
  }
  .lp-section-desc { font-size:17px; color:var(--muted); line-height:1.8; max-width:560px; font-weight:500; }

  /* ── ABOUT ── */
  .lp-about { display:grid; grid-template-columns:1fr 1fr; gap:56px; align-items:center; }
  .lp-about-items { display:flex; flex-direction:column; gap:14px; }
  .lp-about-item {
    display:flex; gap:16px; padding:20px; border-radius:16px;
    background:var(--surface); border:1px solid var(--border);
    transition:all 0.25s; cursor:default;
  }
  .lp-about-item:hover { border-color:var(--border2); transform:translateX(6px); box-shadow:0 8px 32px rgba(0,0,0,0.3); }
  .lp-about-icon {
    width:42px; height:42px; border-radius:12px;
    display:flex; align-items:center; justify-content:center;
    font-size:20px; flex-shrink:0; border:1px solid;
  }
  .lp-about-title { font-family:'Clash Display',sans-serif; font-size:15px; font-weight:600; color:var(--text); margin-bottom:4px; }
  .lp-about-desc { font-size:13px; color:var(--muted); line-height:1.6; }

  /* ── FEATURES ── */
  .lp-features { display:grid; grid-template-columns:repeat(3,1fr); gap:16px; margin-top:52px; }
  .lp-feat {
    background:var(--surface); border:1px solid var(--border);
    border-radius:22px; padding:28px 24px;
    position:relative; overflow:hidden;
    transition:all 0.3s cubic-bezier(0.22,1,0.36,1); cursor:default;
  }
  .lp-feat:hover { border-color:rgba(108,95,255,0.2); transform:translateY(-6px) scale(1.01); box-shadow:0 24px 80px rgba(0,0,0,0.5); }
  .lp-feat:hover .lp-feat-glow { opacity:0.15; }
  .lp-feat-glow {
    position:absolute; top:0; left:0; right:0; height:120px;
    background:radial-gradient(ellipse at 50% 0%,var(--fc),transparent 70%);
    opacity:0.07; transition:opacity 0.3s; pointer-events:none;
  }
  .lp-feat-icon {
    width:46px; height:46px; border-radius:13px;
    display:flex; align-items:center; justify-content:center;
    font-size:22px; margin-bottom:18px; border:1px solid;
    position:relative; z-index:1; transition:transform 0.3s;
  }
  .lp-feat:hover .lp-feat-icon { transform:scale(1.1) rotate(-4deg); }
  .lp-feat-title { font-family:'Clash Display',sans-serif; font-size:17px; font-weight:600; color:var(--text); margin-bottom:10px; position:relative; z-index:1; }
  .lp-feat-desc { font-size:13px; color:var(--muted); line-height:1.75; position:relative; z-index:1; }

  /* ── BADGES ── */
  .lp-badges { display:flex; justify-content:center; gap:20px; flex-wrap:wrap; margin-top:48px; }
  .lp-badge {
    display:flex; flex-direction:column; align-items:center; gap:12px;
    padding:28px 20px; border-radius:20px; border:1px solid;
    cursor:default; position:relative; overflow:hidden; width:156px;
    transition:all 0.3s cubic-bezier(0.34,1.56,0.64,1);
  }
  .lp-badge::before {
    content:''; position:absolute; inset:0;
    background:radial-gradient(ellipse at 50% 0%,var(--bc),transparent 70%);
    opacity:0.08; transition:opacity 0.3s;
  }
  .lp-badge:hover::before { opacity:0.18; }
  .lp-badge:hover { transform:translateY(-12px) scale(1.05); }
  .lp-badge-ring {
    width:72px; height:72px; border-radius:50%;
    display:flex; align-items:center; justify-content:center;
    border:2px solid; position:relative; transition:box-shadow 0.3s;
  }
  .lp-badge:hover .lp-badge-ring { box-shadow:0 0 40px var(--bs); }
  .lp-badge-emoji { font-size:34px; }
  .lp-badge-pulse {
    position:absolute; inset:-8px; border-radius:50%; border:1px solid;
    animation:lpPulse 2.5s ease-out infinite;
  }
  @keyframes lpPulse { 0%{transform:scale(1);opacity:0.6} 100%{transform:scale(1.5);opacity:0} }
  .lp-badge-name { font-family:'JetBrains Mono',monospace; font-size:10px; font-weight:700; letter-spacing:0.1em; text-transform:uppercase; text-align:center; }

  /* ── FOOTER ── */
  .lp-footer {
    padding:48px; border-top:1px solid var(--border);
    display:flex; align-items:center; justify-content:space-between;
    flex-wrap:wrap; gap:16px;
  }
  .lp-footer-links { display:flex; gap:28px; flex-wrap:wrap; }
  .lp-footer-links a { font-size:13px; color:var(--muted); text-decoration:none; transition:color 0.15s; cursor:pointer; }
  .lp-footer-links a:hover { color:var(--text); }

  /* ── REVEAL ANIMATION ── */
  .lp-reveal { opacity:0; transform:translateY(32px); transition:opacity 0.75s ease,transform 0.75s ease; }
  .lp-reveal.lp-visible { opacity:1; transform:translateY(0); }

  /* ── RESPONSIVE ── */
  @media (max-width:1024px) {
    .lp-features { grid-template-columns:repeat(2,1fr); }
    .lp-goals { grid-template-columns:repeat(2,1fr); }
    .lp-stats { grid-template-columns:repeat(2,1fr); }
    .lp-app { height:auto; min-height:320px; }
  }
  @media (max-width:768px) {
    .lp-nav { padding:0 20px; }
    .lp-nav-links { display:none; }
    .lp-hamburger { display:flex; }
    .lp-sb { display:none; }
    .lp-about { grid-template-columns:1fr; }
    .lp-features { grid-template-columns:1fr; }
    .lp-footer { padding:32px 20px; flex-direction:column; align-items:flex-start; }
    .lp-hero { padding:100px 20px 60px; }
    .lp-section { padding:64px 20px; }
    .lp-goals { grid-template-columns:repeat(2,1fr); }
    .lp-stats { grid-template-columns:repeat(2,1fr); }
    .lp-preview { max-width:100%; }
    .lp-app { height:auto; }
    .lp-badges { gap:12px; }
    .lp-badge { width:130px; padding:20px 12px; }
  }
  @media (max-width:480px) {
    .lp-headline { font-size:clamp(36px,10vw,64px); }
    .lp-goals { grid-template-columns:repeat(2,1fr); }
    .lp-feat { padding:20px 18px; }
  }
`;

/* ─────────────────────────────────────────────
   DATA
───────────────────────────────────────────── */
const GOALS = [
  {
    emoji:'⚛️', name:'Learn React',
    resources:7, days:'12 days left',
    pct:65, status:'IN PROGRESS',
    gc:'linear-gradient(90deg,#6c5fff,#4488ff)',
    gib:'rgba(108,95,255,0.12)',
    statusBg:'rgba(108,95,255,0.12)',statusBorder:'rgba(108,95,255,0.25)',statusColor:'#8878ff',
    fillBg:'linear-gradient(90deg,#6c5fff,#4488ff)', pctColor:'#6c5fff',
  },
  {
    emoji:'🖥️', name:'Node.js',
    resources:5, days:'20 days left',
    pct:40, status:'IN PROGRESS',
    gc:'linear-gradient(90deg,#22ddaa,#4488ff)',
    gib:'rgba(34,221,170,0.1)',
    statusBg:'rgba(108,95,255,0.12)',statusBorder:'rgba(108,95,255,0.25)',statusColor:'#8878ff',
    fillBg:'linear-gradient(90deg,#22ddaa,#4488ff)', pctColor:'#22ddaa',
  },
  {
    emoji:'🎨', name:'Master CSS',
    resources:4, days:'completed',
    pct:100, status:'COMPLETED',
    gc:'linear-gradient(90deg,#22cc88,#22ddaa)',
    gib:'rgba(34,204,136,0.1)',
    statusBg:'rgba(34,204,136,0.1)',statusBorder:'rgba(34,204,136,0.25)',statusColor:'#22cc88',
    fillBg:'linear-gradient(90deg,#22cc88,#22ddaa)', pctColor:'#22cc88',
  },
];

const FEATURES = [
  { icon:'🎯', title:'Goal Tracking',    desc:'Create focused goals with deadlines and emojis. See exactly how far you\'ve come at a glance.',  fc:'rgba(108,95,255,0.8)', ib:'rgba(108,95,255,0.1)', iborder:'rgba(108,95,255,0.2)' },
  { icon:'📚', title:'Resource Library', desc:'Add videos, articles, docs, projects. Auto-fetch titles from URLs. Track units for long courses.', fc:'rgba(68,136,255,0.8)',  ib:'rgba(68,136,255,0.1)',  iborder:'rgba(68,136,255,0.2)'  },
  { icon:'🔥', title:'Daily Streaks',    desc:'Build momentum with a streak that tracks your daily learning. Your longest streak is always saved.',fc:'rgba(255,170,51,0.8)', ib:'rgba(255,170,51,0.1)', iborder:'rgba(255,170,51,0.2)' },
  { icon:'🏆', title:'Badge System',     desc:'Earn badges across three tiers. Each one comes with its own celebration — progress feels rewarding.',fc:'rgba(34,221,170,0.8)', ib:'rgba(34,221,170,0.1)', iborder:'rgba(34,221,170,0.2)' },
  { icon:'📝', title:'Smart Notes',      desc:'Add notes as you learn. Flag important ones for revision. Context stays with the resource, always.',  fc:'rgba(255,102,85,0.8)', ib:'rgba(255,102,85,0.1)', iborder:'rgba(255,102,85,0.2)' },
  { icon:'📱', title:'Works Everywhere', desc:'Beautifully responsive across all devices. Log your progress on the go, at your desk, anywhere.',     fc:'rgba(136,221,255,0.8)',ib:'rgba(136,221,255,0.1)',iborder:'rgba(136,221,255,0.2)' },
];

const ABOUT_ITEMS = [
  { icon:'🎯', bg:'rgba(108,95,255,0.1)', border:'rgba(108,95,255,0.2)', title:'Set clear goals',       desc:'Create a goal for anything you want to learn. Give it a deadline. Watch yourself stay accountable.' },
  { icon:'📚', bg:'rgba(68,136,255,0.1)',  border:'rgba(68,136,255,0.2)',  title:'Organise your resources', desc:'Add videos, articles, books, and docs. Track progress through each one — no more losing your place.' },
  { icon:'🔥', bg:'rgba(255,170,51,0.1)', border:'rgba(255,170,51,0.2)', title:'Build momentum daily', desc:'Your streak grows every day you make progress. Simple accountability that actually works.' },
  { icon:'🏆', bg:'rgba(34,221,170,0.1)', border:'rgba(34,221,170,0.2)', title:'Celebrate milestones', desc:'Earn badges as you hit milestones. Every achievement gets recognised — progress should feel good.' },
];

const BADGES = [
  { emoji:'⚡', name:'Finisher',       tier:'Tier I',             stars:1, bc:'rgba(255,102,85,0.4)',  bs:'rgba(255,102,85,0.5)',  color:'#ff6655', borderC:'rgba(255,102,85,0.25)',  bg:'#0e0f1c',                          ringBorder:'rgba(255,102,85,0.4)',   ringBg:'radial-gradient(circle,rgba(255,102,85,0.15),rgba(255,102,85,0.03))',   ringGlow:'0 0 30px rgba(255,102,85,0.2)',  pulse:'rgba(255,102,85,0.3)',  delay:'0s'   },
  { emoji:'📚', name:'Resource Hunter',tier:'Tier II',            stars:2, bc:'rgba(68,136,255,0.5)',  bs:'rgba(68,136,255,0.55)', color:'#4488ff', borderC:'rgba(68,136,255,0.3)',   bg:'#0e0f1c',                          ringBorder:'rgba(68,136,255,0.45)',  ringBg:'radial-gradient(circle,rgba(68,136,255,0.18),rgba(68,136,255,0.03))',   ringGlow:'0 0 35px rgba(68,136,255,0.25)', pulse:'rgba(68,136,255,0.35)', delay:'0s'   },
  { emoji:'🎓', name:'Goal Crusher',   tier:'Tier III · Legendary',stars:3,bc:'rgba(255,170,51,0.6)', bs:'rgba(255,170,51,0.6)',  color:'#ffaa33', borderC:'rgba(255,170,51,0.4)',   bg:'linear-gradient(160deg,#181008,#100a04)', ringBorder:'rgba(255,170,51,0.55)', ringBg:'radial-gradient(circle,rgba(255,170,51,0.22),rgba(255,170,51,0.04))', ringGlow:'0 0 44px rgba(255,170,51,0.4)',  pulse:'rgba(255,170,51,0.45)',delay:'0s'   },
  { emoji:'🔥', name:'Streak Master',  tier:'Tier I',             stars:1, bc:'rgba(255,170,51,0.4)', bs:'rgba(255,170,51,0.4)',  color:'#ffaa33', borderC:'rgba(255,170,51,0.2)',   bg:'#0e0f1c',                          ringBorder:'rgba(255,170,51,0.35)',  ringBg:'radial-gradient(circle,rgba(255,170,51,0.15),rgba(255,170,51,0.03))',  ringGlow:'0 0 28px rgba(255,170,51,0.2)',  pulse:'rgba(255,170,51,0.25)',delay:'0.5s' },
  { emoji:'⏰', name:'Ahead of Time',  tier:'Tier II',            stars:2, bc:'rgba(34,221,170,0.5)', bs:'rgba(34,221,170,0.5)',  color:'#22ddaa', borderC:'rgba(34,221,170,0.25)',  bg:'#0e0f1c',                          ringBorder:'rgba(34,221,170,0.4)',   ringBg:'radial-gradient(circle,rgba(34,221,170,0.18),rgba(34,221,170,0.03))',  ringGlow:'0 0 32px rgba(34,221,170,0.2)',  pulse:'rgba(34,221,170,0.3)', delay:'1s'   },
];

/* ─────────────────────────────────────────────
   COMPONENT
───────────────────────────────────────────── */
export default function LandingPage() {
  const navigate   = useNavigate();
  const revealRefs = useRef([]);
  const navRefs    = useRef({});
  const menuRef    = useRef(null);
  const hamRef     = useRef(null);

  /* inject CSS once */
  useEffect(() => {
    const id = 'lp-styles';
    if (!document.getElementById(id)) {
      const style = document.createElement('style');
      style.id = id;
      style.textContent = CSS;
      document.head.appendChild(style);
    }
    return () => {}; // keep styles across hot reloads
  }, []);

  /* scroll reveal */
  useEffect(() => {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          setTimeout(() => entry.target.classList.add('lp-visible'), i * 90);
        }
      });
    }, { threshold: 0.08 });
    revealRefs.current.forEach(el => el && obs.observe(el));
    return () => obs.disconnect();
  }, []);

  /* active nav on scroll */
  useEffect(() => {
    const ids = ['hero','about','features','badges'];
    const handler = () => {
      let cur = '';
      ids.forEach(id => {
        const el = document.getElementById('lp-' + id);
        if (el && window.scrollY >= el.offsetTop - 90) cur = id;
      });
      Object.entries(navRefs.current).forEach(([id, el]) => {
        if (!el) return;
        el.classList.toggle('active', id === cur);
      });
    };
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  /* badge float animation */
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `@keyframes lpBadgeFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}`;
    document.head.appendChild(style);
    document.querySelectorAll('.lp-badge').forEach((b, i) => {
      b.style.animation = `lpBadgeFloat ${3.5 + i * 0.3}s ${i * 0.4}s ease-in-out infinite`;
    });
  }, []);

  const addReveal = el => { if (el) revealRefs.current.push(el); };

  const scrollTo = (id) => {
    document.getElementById('lp-' + id)?.scrollIntoView({ behavior:'smooth' });
    if (menuRef.current) menuRef.current.classList.remove('open');
  };

  const toggleMenu = () => {
    menuRef.current?.classList.toggle('open');
  };

  return (
    <div className="lp-noise" style={{ background:'#04040a', minHeight:'100vh' }}>

      {/* ── NAV ── */}
      <nav className="lp-nav">
        <div className="lp-nav-logo" onClick={() => scrollTo('hero')}>
          <div className="lp-nav-logo-icon">⚡</div>
          <span className="lp-nav-logo-text">Stride.</span>
        </div>
        <ul className="lp-nav-links">
          <li><a ref={el => navRefs.current['about']    = el} onClick={() => scrollTo('about')}>About</a></li>
          <li><a ref={el => navRefs.current['features'] = el} onClick={() => scrollTo('features')}>Features</a></li>
          <li><a ref={el => navRefs.current['badges']   = el} onClick={() => scrollTo('badges')}>Badges</a></li>
          <li><button className="lp-nav-cta" onClick={() => navigate('/login')}>Sign In →</button></li>
        </ul>
        <button className="lp-hamburger" ref={hamRef} onClick={toggleMenu} aria-label="menu">
          <span /><span /><span />
        </button>
      </nav>

      {/* mobile menu */}
      <div className="lp-mobile-menu" ref={menuRef}>
        <a onClick={() => scrollTo('about')}>About</a>
        <a onClick={() => scrollTo('features')}>Features</a>
        <a onClick={() => scrollTo('badges')}>Badges</a>
        <a onClick={() => navigate('/login')}>Sign In</a>
        <a onClick={() => navigate('/register')} style={{ color:'#8878ff' }}>Get Started →</a>
      </div>

      {/* ── HERO ── */}
      <section className="lp-hero" id="lp-hero">
        {/* mesh orbs */}
        <div className="lp-mesh-orb" style={{ width:600,height:600, background:'radial-gradient(circle,rgba(108,95,255,0.1),transparent 70%)', top:-100, left:'50%', transform:'translateX(-50%)' }} />
        <div className="lp-mesh-orb" style={{ width:380,height:380, background:'radial-gradient(circle,rgba(68,136,255,0.07),transparent 70%)',  top:'30%', left:'68%', animationDelay:'-3s'  }} />
        <div className="lp-mesh-orb" style={{ width:320,height:320, background:'radial-gradient(circle,rgba(34,221,170,0.05),transparent 70%)',  top:'20%', left:'8%',  animationDelay:'-5s'  }} />

        <div className="lp-hero-badge"><div className="lp-bdot" />Free to use · No credit card</div>
        <h1 className="lp-headline">Learn anything.<br /><span className="lp-grad">Track everything.</span></h1>
        <p className="lp-sub">Turn scattered resources and half-finished courses into a focused system. Set goals, track progress, build streaks, earn badges.</p>

        <div className="lp-ctas">
          <button className="lp-btn-primary" onClick={() => navigate('/register')}>Start for free <span>→</span></button>
          <button className="lp-btn-secondary" onClick={() => scrollTo('about')}>How it works</button>
        </div>

        {/* ── DASHBOARD PREVIEW ── */}
        <div className="lp-preview">
          <div className="lp-preview-glow" />
          <div className="lp-frame">
            {/* browser bar */}
            <div className="lp-frame-bar">
              <div className="lp-dot" style={{ background:'#ff5f57' }} />
              <div className="lp-dot" style={{ background:'#ffbd2e' }} />
              <div className="lp-dot" style={{ background:'#28c840' }} />
              <div className="lp-url">app.stride.io/dashboard</div>
            </div>

            <div className="lp-app">
              {/* sidebar */}
              <div className="lp-sb">
                <div className="lp-sb-logo">
                  <div className="lp-sb-logo-icon">⚡</div>
                  <span style={{ fontFamily:'Clash Display,sans-serif', fontSize:11, fontWeight:700, color:'#dde0f0' }}>Stride.</span>
                </div>
                <div className="lp-sb-nav">
                  <div className="lp-sb-lbl">Workspace</div>
                  <div className={`lp-sb-item lp-sb-item-active`}><span>🏠</span> Dashboard</div>
                  <div className="lp-sb-item"><span>📚</span> Resources</div>
                  <div className="lp-sb-item"><span>📈</span> Progress</div>
                  <div className="lp-sb-lbl" style={{ marginTop:4 }}>Account</div>
                  <div className="lp-sb-item"><span>⚙️</span> Settings</div>
                  <div style={{ flex:1 }} />
                  {/* streak card */}
                  <div className="lp-sb-streak">
                    <span style={{ fontSize:12 }}>🔥</span>
                    <div>
                      <div style={{ fontFamily:'JetBrains Mono,monospace', fontSize:8, fontWeight:700, color:'#ffaa33' }}>6 day streak</div>
                      <div style={{ fontSize:7, color:'#6a5a33' }}>keep it going!</div>
                    </div>
                  </div>
                  {/* profile card */}
                  <div className="lp-sb-profile">
                    <div className="lp-sb-avatar">S</div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:8, fontWeight:600, color:'#9090bb', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>Saurabh</div>
                      <div style={{ fontSize:7, color:'#44445a' }}>saurabh@gmail.com</div>
                    </div>
                    <span style={{ fontSize:8, color:'#333355' }}>→</span>
                  </div>
                </div>
              </div>

              {/* main panel */}
              <div className="lp-main">
                {/* row1: greeting + new goal button */}
                <div className="lp-row1">
                  <div>
                    <div className="lp-greeting">Good evening, Saurabh 👋</div>
                    <div className="lp-greeting-sub">6 day streak — keep it going!</div>
                  </div>
                  <div className="lp-new-btn">+ New Goal</div>
                </div>

                {/* stats */}
                <div className="lp-stats">
                  <div className="lp-stat"><div className="lp-stat-val" style={{ color:'#6c5fff' }}>8</div><div className="lp-stat-lbl">Total Goals</div></div>
                  <div className="lp-stat"><div className="lp-stat-val" style={{ color:'#4488ff' }}>24</div><div className="lp-stat-lbl">Total Resources</div></div>
                  <div className="lp-stat"><div className="lp-stat-val" style={{ color:'#22ddaa' }}>54%</div><div className="lp-stat-lbl">Avg Progress</div></div>
                  <div className="lp-stat"><div className="lp-stat-val" style={{ color:'#ffaa33' }}>🔥 6</div><div className="lp-stat-lbl">Day Streak</div></div>
                </div>

                {/* filter pills — right aligned */}
                <div className="lp-pills">
                  <div className="lp-pill" style={{ background:'rgba(108,95,255,0.12)', borderColor:'rgba(108,95,255,0.3)', color:'#8878ff' }}>All</div>
                  <div className="lp-pill" style={{ background:'transparent', borderColor:'#1e1e35', color:'#5a5a88' }}>In Progress</div>
                  <div className="lp-pill" style={{ background:'transparent', borderColor:'#1e1e35', color:'#5a5a88' }}>Due Soon</div>
                </div>

                {/* goal cards grid */}
                <div className="lp-goals">
                  {GOALS.map((g, i) => (
                    <div key={i} className="lp-gcard" style={{ '--gc': g.gc }}>
                      {/* status top right */}
                      <div className="lp-gstatus" style={{ background:g.statusBg, borderColor:g.statusBorder, color:g.statusColor }}>{g.status}</div>
                      {/* emoji + name */}
                      <div className="lp-gtop">
                        <div className="lp-gemoji" style={{ background:g.gib }}>{g.emoji}</div>
                        <div className="lp-gname">{g.name}</div>
                      </div>
                      {/* resources + days below emoji */}
                      <div className="lp-gmeta">
                        <div className="lp-gmeta-item">{g.resources} resources</div>
                        <div className="lp-gmeta-item">{g.days}</div>
                      </div>
                      {/* progress bar */}
                      <div className="lp-gbar-row">
                        <div className="lp-gbar"><div className="lp-gbar-fill" style={{ width:`${g.pct}%`, background:g.fillBg }} /></div>
                        <div className="lp-gpct" style={{ color:g.pctColor }}>{g.pct}%</div>
                      </div>
                    </div>
                  ))}
                  {/* new goal dashed card */}
                  <div className="lp-new-card">
                    <div className="lp-new-plus">+</div>
                    <div className="lp-new-lbl">Create new goal</div>
                  </div>
                </div>
              </div>{/* /main */}
            </div>{/* /app */}
          </div>{/* /frame */}
        </div>{/* /preview */}
      </section>

      <div className="lp-divider" />

      {/* ── ABOUT ── */}
      <section className="lp-section" id="lp-about">
        <div className="lp-inner">
          <div className="lp-about">
            <div>
              <span className="lp-tag lp-reveal" ref={addReveal}>// about</span>
              <h2 className="lp-section-title lp-reveal" ref={addReveal}>Learning should feel<br />rewarding.</h2>
              <p className="lp-section-desc lp-reveal" ref={addReveal} style={{ marginBottom:24 }}>Most people learn in chaos — a video here, a docs page there, a course forgotten halfway through. This brings it all into one focused system that keeps you moving forward.</p>
              <p className="lp-section-desc lp-reveal" ref={addReveal} style={{ fontSize:15 }}>Whether you're picking up a new skill, preparing for an exam, or just curious — structured progress makes the difference between starting and finishing.</p>
            </div>
            <div className="lp-about-items">
              {ABOUT_ITEMS.map((item, i) => (
                <div key={i} className="lp-about-item lp-reveal" ref={addReveal}>
                  <div className="lp-about-icon" style={{ background:item.bg, borderColor:item.border }}>{item.icon}</div>
                  <div>
                    <div className="lp-about-title">{item.title}</div>
                    <div className="lp-about-desc">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="lp-divider" />

      {/* ── FEATURES ── */}
      <section className="lp-section" id="lp-features">
        <div className="lp-inner">
          <span className="lp-tag lp-reveal" ref={addReveal}>// features</span>
          <h2 className="lp-section-title lp-reveal" ref={addReveal}>Everything you need.<br />Nothing you don't.</h2>
          <p className="lp-section-desc lp-reveal" ref={addReveal}>Intentionally focused. No bloat, no noise — just the tools that actually make you learn better.</p>
          <div className="lp-features">
            {FEATURES.map((f, i) => (
              <div key={i} className="lp-feat lp-reveal" ref={addReveal} style={{ '--fc': f.fc }}>
                <div className="lp-feat-glow" />
                <div className="lp-feat-icon" style={{ background:f.ib, borderColor:f.iborder }}>{f.icon}</div>
                <div className="lp-feat-title">{f.title}</div>
                <div className="lp-feat-desc">{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="lp-divider" />

      {/* ── BADGES ── */}
      <section className="lp-section" id="lp-badges" style={{ padding:'80px 24px' }}>
        <div className="lp-inner">
          <span className="lp-tag lp-reveal" ref={addReveal} style={{ display:'block', textAlign:'center' }}>// achievements</span>
          <h2 className="lp-section-title lp-reveal" ref={addReveal} style={{ textAlign:'center' }}>Earn badges.<br /><span className="lp-grad">Stay motivated.</span></h2>
          <p className="lp-section-desc lp-reveal" ref={addReveal} style={{ margin:'0 auto', textAlign:'center' }}>Complete milestones and unlock badges across three tiers. Each one is a reminder of how far you've come.</p>
          <div className="lp-badges">
            {BADGES.map((b, i) => (
              <div key={i} className="lp-badge lp-reveal" ref={addReveal}
                style={{ background:b.bg, borderColor:b.borderC, '--bc':b.bc, '--bs':b.bs }}>
                <div className="lp-badge-ring" style={{ background:b.ringBg, borderColor:b.ringBorder, boxShadow:b.ringGlow }}>
                  <span className="lp-badge-emoji">{b.emoji}</span>
                  <div className="lp-badge-pulse" style={{ borderColor:b.pulse, animationDelay:b.delay }} />
                </div>
                <div className="lp-badge-name" style={{ color:b.color }}>{b.name}</div>
                <div style={{ display:'flex', gap:3 }}>
                  {Array.from({ length: b.stars }).map((_, si) => (
                    <span key={si} style={{ color:b.color, fontSize:11 }}>★</span>
                  ))}
                </div>
                <div style={{ fontSize:10, color:b.color, opacity:0.7 }}>{b.tier}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="lp-footer">
        <div style={{ display:'flex', alignItems:'center', gap:9 }}>
          <div className="lp-nav-logo-icon" style={{ width:26, height:26, fontSize:12 }}>⚡</div>
          <span style={{ fontFamily:'Clash Display,sans-serif', fontSize:15, fontWeight:700, color:'#dde0f0' }}>Stride.</span>
        </div>
        <div className="lp-footer-links">
          <a onClick={() => scrollTo('about')}>About</a>
          <a onClick={() => scrollTo('features')}>Features</a>
          <a onClick={() => scrollTo('badges')}>Badges</a>
          <a onClick={() => navigate('/login')}>Sign In</a>
          <a onClick={() => navigate('/register')}>Get Started</a>
        </div>
        <div style={{ fontFamily:'JetBrains Mono,monospace', fontSize:11, color:'#252535' }}>© 2025 Stride. All rights reserved.</div>
      </footer>

    </div>
  );
}