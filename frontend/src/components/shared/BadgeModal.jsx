import { useState,useEffect } from 'react';

const BADGE_META = {
  first_step:      { name: 'First Step',      icon: '🎯', desc: 'Created your first goal. Every expert was once a beginner!'         },
  resource_hunter: { name: 'Resource Hunter', icon: '📚', desc: 'You\'re building a serious library of learning resources!'           },
  finisher:        { name: 'Finisher',        icon: '⚡', desc: 'Complete your first resource. The journey begins!'                   },
  streak:          { name: 'Streak Master',   icon: '🔥', desc: 'Consistency is your superpower. Keep the streak alive!'             },
  goal_crusher:    { name: 'Goal Crusher',    icon: '🎓', desc: 'Completed multiple goals. Truly unstoppable!'                       },
  ahead_of_time:   { name: 'Ahead of Time',   icon: '⏰', desc: 'Completed a goal before its deadline. Efficiency at its finest!'    },
};

const TIER_LABELS  = { 1: 'Tier I', 2: 'Tier II', 3: 'Tier III' };
const TIER_STARS   = { 1: '★', 2: '★★', 3: '★★★' };
const STAR_COLORS  = { 1: '#8878ff', 2: '#5599ff', 3: '#ffbb44' };
const BTN_LABELS   = { 1: '✨ Nice one!', 2: '💪 Awesome!', 3: '🔥 Legendary!' };

const TIER_STYLES = {
  1: {
    modalBg:     'linear-gradient(160deg, #111025 0%, #0a0b1a 100%)',
    border:      'rgba(108,95,255,0.35)',
    glow:        'rgba(108,95,255,0.25)',
    ringBg:      'radial-gradient(circle, rgba(108,95,255,0.18), rgba(108,95,255,0.04))',
    ringBorder:  'rgba(108,95,255,0.45)',
    ringGlow:    '0 0 40px rgba(108,95,255,0.35)',
    pulse:       'rgba(108,95,255,0.4)',
    label:       '#8878ff',
    divider:     'linear-gradient(90deg, transparent, rgba(108,95,255,0.4), transparent)',
    btnBg:       'linear-gradient(135deg, #6c5fff 0%, #4a38d4 100%)',
    btnColor:    'white',
    btnShadow:   'rgba(108,95,255,0.45)',
    shimmer:     'rgba(108,95,255,0.15)',
  },
  2: {
    modalBg:     'linear-gradient(160deg, #0a1220 0%, #080e1a 100%)',
    border:      'rgba(68,136,255,0.4)',
    glow:        'rgba(68,136,255,0.3)',
    ringBg:      'radial-gradient(circle, rgba(68,136,255,0.18), rgba(68,136,255,0.04))',
    ringBorder:  'rgba(68,136,255,0.5)',
    ringGlow:    '0 0 44px rgba(68,136,255,0.4)',
    pulse:       'rgba(68,136,255,0.45)',
    label:       '#5599ff',
    divider:     'linear-gradient(90deg, transparent, rgba(68,136,255,0.45), transparent)',
    btnBg:       'linear-gradient(135deg, #4488ff 0%, #2255cc 100%)',
    btnColor:    'white',
    btnShadow:   'rgba(68,136,255,0.45)',
    shimmer:     'rgba(68,136,255,0.18)',
  },
  3: {
    modalBg:     'linear-gradient(160deg, #181008 0%, #100a04 100%)',
    border:      'rgba(255,170,51,0.45)',
    glow:        'rgba(255,170,51,0.35)',
    ringBg:      'radial-gradient(circle, rgba(255,170,51,0.22), rgba(255,170,51,0.04))',
    ringBorder:  'rgba(255,170,51,0.55)',
    ringGlow:    '0 0 50px rgba(255,170,51,0.5)',
    pulse:       'rgba(255,170,51,0.5)',
    label:       '#ffbb44',
    divider:     'linear-gradient(90deg, transparent, rgba(255,170,51,0.5), transparent)',
    btnBg:       'linear-gradient(135deg, #ffbb33 0%, #ff8800 100%)',
    btnColor:    '#1a0800',
    btnShadow:   'rgba(255,170,51,0.5)',
    shimmer:     'rgba(255,170,51,0.2)',
  },
};

const CONFETTI_COLORS = {
  1: ['#8878ff','#cc88ff','#ff88cc','#88ddff','#ffaa33','#22cc88','#ff6655','#ffffff','#6c5fff','#ffdd88'],
  2: ['#4488ff','#88ccff','#ff88cc','#ffaa33','#22cc88','#cc88ff','#ff6655','#ffffff','#44ddff','#ffdd44'],
  3: ['#ffaa33','#ffdd44','#ff8800','#ff6655','#ff88cc','#22cc88','#88ddff','#ffffff','#ffee88','#ffbb55'],
};
const CONFETTI_COUNT = { 1: 110, 2: 140, 3: 180 };

// ── Confetti ──
const Confetti = ({ tier }) => {
  const colors = CONFETTI_COLORS[tier];
  const count  = CONFETTI_COUNT[tier];
  const pieces = Array.from({ length: count }, (_, i) => ({
    id: i,
    color:    colors[Math.floor(Math.random() * colors.length)],
    left:     Math.random() * 100,
    delay:    Math.random() * 2.2,
    duration: 2.8 + Math.random() * 2,
    size:     8 + Math.random() * (tier === 3 ? 14 : tier === 2 ? 10 : 8),
    sway:     1.5 + Math.random() * 2,
    shape:    ['3px','50%','0','6px'][Math.floor(Math.random() * 4)],
  }));

  return (
    <>
      <style>{`
        @keyframes confettiFall {
          0%   { transform: translateY(-20px) rotate(0deg) scale(1); opacity: 1; }
          85%  { opacity: 1; }
          100% { transform: translateY(110vh) rotate(720deg) scale(0.3); opacity: 0; }
        }
        @keyframes confettiSway {
          0%   { margin-left: 0; }
          25%  { margin-left: 60px; }
          75%  { margin-left: -60px; }
          100% { margin-left: 0; }
        }
      `}</style>
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 1100, overflow: 'hidden' }}>
        {pieces.map(p => (
          <div key={p.id} style={{
            position: 'absolute', top: '-20px',
            left: `${p.left}%`,
            width: `${p.size}px`, height: `${p.size}px`,
            background: p.color, borderRadius: p.shape, opacity: 0,
            animation: `confettiFall ${p.duration}s ${p.delay}s ease-in forwards, confettiSway ${p.sway}s ${p.delay}s ease-in-out infinite`,
          }} />
        ))}
      </div>
    </>
  );
};

// ── Badge Modal ──
const BadgeModal = ({ badges, onClose }) => {
  const [current, setCurrent] = useState(0);

  // close on Escape
  useEffect(() => {
    const handler = e => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  if (!badges || badges.length === 0) return null;

  const badge = badges[current];
  const meta  = BADGE_META[badge.id] || { name: badge.id, icon: '🏆', desc: 'Achievement unlocked!' };
  const tier  = badge.tier || 1;
  const ts    = TIER_STYLES[tier];
  const isLast = current === badges.length - 1;

  const handleNext = () => {
    if (isLast) onClose();
    else setCurrent(prev => prev + 1);
  };

  return (
    <>
      <style>{`
        @keyframes backdropIn  { from { opacity: 0; } to { opacity: 1; } }
        @keyframes modalPop    { from { opacity: 0; transform: scale(0.65) translateY(40px); } 60% { transform: scale(1.03) translateY(-4px); } to { opacity: 1; transform: scale(1) translateY(0); } }
        @keyframes badgePop    { from { transform: scale(0) rotate(-40deg); opacity: 0; } 60% { transform: scale(1.1) rotate(5deg); } to { transform: scale(1) rotate(0); opacity: 1; } }
        @keyframes emojiPop    { from { transform: scale(0); opacity: 0; } 60% { transform: scale(1.2); } to { transform: scale(1); opacity: 1; } }
        @keyframes badgeFloat  { 0%,100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-9px) rotate(2deg); } }
        @keyframes ringPulse   { 0% { transform: scale(1); opacity: 0.8; } 100% { transform: scale(1.5); opacity: 0; } }
        @keyframes ringPulse2  { 0% { transform: scale(1); opacity: 0.6; } 100% { transform: scale(1.6); opacity: 0; } }
        @keyframes starsIn     { from { opacity: 0; transform: translateX(-50%) translateY(8px); } to { opacity: 1; transform: translateX(-50%) translateY(0); } }
        @keyframes fadeUp      { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes shimmer     { 0%,100% { opacity: 0.1; } 50% { opacity: 0.2; } }
        @keyframes glowPulse   { 0%,100% { box-shadow: 0 0 0 1px ${ts.border}, 0 32px 100px ${ts.glow}; } 50% { box-shadow: 0 0 0 1px ${ts.border}, 0 32px 120px ${ts.glow}, 0 0 60px ${ts.glow}; } }
        @keyframes btnShine    { 0%,100% { box-shadow: 0 6px 28px ${ts.btnShadow}; } 50% { box-shadow: 0 8px 36px ${ts.btnShadow}, 0 0 20px ${ts.btnShadow}; } }
      `}</style>

      <Confetti tier={tier} />

      {/* backdrop */}
      <div
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.82)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', animation: 'backdropIn 0.3s ease both' }}
      >
        {/* modal */}
        <div
          onClick={e => e.stopPropagation()}
          style={{ width: '100%', maxWidth: '400px', borderRadius: '24px', padding: '36px 28px 28px', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', overflow: 'hidden', background: ts.modalBg, border: `1px solid ${ts.border}`, boxShadow: `0 0 0 1px ${ts.border}22, 0 32px 100px ${ts.glow}, inset 0 1px 0 rgba(255,255,255,0.05)`, animation: 'modalPop 0.55s 0.1s cubic-bezier(0.34,1.56,0.64,1) both, glowPulse 3s 1s ease-in-out infinite', zIndex: 1001 }}
        >
          {/* shimmer bg */}
          <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '80%', height: '200px', background: `radial-gradient(ellipse at 50% 0%, ${ts.shimmer} 0%, transparent 70%)`, pointerEvents: 'none', animation: 'shimmer 3s ease-in-out infinite' }} />

          {/* badge icon */}
          <div style={{ position: 'relative', marginBottom: '28px', animation: 'badgeFloat 4s 1.5s ease-in-out infinite' }}>
            <div style={{ width: '116px', height: '116px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', background: ts.ringBg, border: `2px solid ${ts.ringBorder}`, boxShadow: `${ts.ringGlow}, inset 0 0 24px ${ts.shimmer}`, animation: 'badgePop 0.65s 0.35s cubic-bezier(0.34,1.56,0.64,1) both' }}>
              <span style={{ fontSize: '54px', display: 'inline-block', animation: 'emojiPop 0.5s 0.6s cubic-bezier(0.34,1.56,0.64,1) both' }}>{meta.icon}</span>
              {/* pulse rings */}
              <div style={{ position: 'absolute', inset: '-10px', borderRadius: '50%', border: `1.5px solid ${ts.pulse}`, animation: 'ringPulse 2s 1s ease-out infinite' }} />
              <div style={{ position: 'absolute', inset: '-10px', borderRadius: '50%', border: `1px solid ${ts.pulse}`, animation: 'ringPulse2 2s 1.5s ease-out infinite' }} />
            </div>
            {/* tier stars */}
            <div style={{ position: 'absolute', bottom: '-6px', left: '50%', display: 'flex', alignItems: 'center', gap: '3px', padding: '3px 10px', borderRadius: '20px', background: '#0a0b18', border: '1px solid rgba(255,255,255,0.08)', animation: 'starsIn 0.4s 0.9s ease both', opacity: 0, whiteSpace: 'nowrap' }}>
              {TIER_STARS[tier].split('').map((s, i) => (
                <span key={i} style={{ color: STAR_COLORS[tier], fontSize: '11px' }}>{s}</span>
              ))}
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '9px', color: '#444466', marginLeft: '3px' }}>{TIER_LABELS[tier]}</span>
            </div>
          </div>

          {/* text */}
          <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '10px', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: ts.label, marginBottom: '10px', animation: 'fadeUp 0.4s 0.75s ease both', opacity: 0 }}>
            🏆 Badge Earned
          </p>
          <p style={{ fontFamily: 'Syne, sans-serif', fontSize: '28px', fontWeight: 800, color: '#dde0f0', textAlign: 'center', letterSpacing: '-0.02em', marginBottom: '10px', animation: 'fadeUp 0.4s 0.9s ease both', opacity: 0 }}>
            {meta.name}
          </p>
          <p style={{ fontSize: '13px', color: '#5a5a88', textAlign: 'center', lineHeight: 1.7, marginBottom: '28px', maxWidth: '280px', animation: 'fadeUp 0.4s 1.05s ease both', opacity: 0 }}>
            {meta.desc}
          </p>

          {/* divider */}
          <div style={{ width: '100%', height: '1px', background: ts.divider, marginBottom: '22px', animation: 'fadeUp 0.4s 1.15s ease both', opacity: 0 }} />

          {/* button */}
          <button
            onClick={handleNext}
            style={{ width: '100%', height: '50px', borderRadius: '14px', fontSize: '15px', fontWeight: 700, border: 'none', cursor: 'pointer', background: ts.btnBg, color: ts.btnColor, boxShadow: `0 6px 28px ${ts.btnShadow}`, animation: 'fadeUp 0.4s 1.25s ease both, btnShine 3s 2s ease-in-out infinite', opacity: 0, position: 'relative', overflow: 'hidden' }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(255,255,255,0.1), transparent)', pointerEvents: 'none' }} />
            {isLast ? BTN_LABELS[tier] : `Next Badge →`}
          </button>

          {/* counter */}
          {badges.length > 1 && (
            <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '10px', color: '#252535', marginTop: '16px', animation: 'fadeUp 0.4s 1.35s ease both', opacity: 0 }}>
              {current + 1} of {badges.length} badges
            </p>
          )}
        </div>
      </div>
    </>
  );
};

export default BadgeModal;