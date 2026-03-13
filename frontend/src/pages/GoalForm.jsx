import { useState, useEffect, useRef } from 'react';
import api from '../services/api';

const EMOJIS = [
  '🎯','📚','💻','🐍','⚛️','🗄️','🎨','🔐','📱','🌐',
  '🧠','⚙️','🔬','📊','🎵','✍️','🏗️','🧪','🚀','💡',
  '📝','🔧','🌍','🎮','📐','🔭','🎤','🏛️','🧮','🔑',
];

const GoalForm = ({ onClose, onCreated }) => {
  //const { token } = useAuth();

  const [name, setName]             = useState('');
  const [emoji, setEmoji]           = useState('🎯');
  const [days, setDays]             = useState('');
  const [showEmojis, setShowEmojis] = useState(false);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');

  const nameRef    = useRef();
  const emojiRef   = useRef();

  // autofocus
  useEffect(() => { nameRef.current?.focus(); }, []);

  // Escape to close
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  // close emoji grid when clicking outside it
  useEffect(() => {
    if (!showEmojis) return;
    const handler = (e) => {
      if (emojiRef.current && !emojiRef.current.contains(e.target)) {
        setShowEmojis(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showEmojis]);

  const handleSubmit = async () => {
  if (!name.trim()) { setError('Goal name is required.'); return; }
  if (days && (isNaN(days) || Number(days) < 1)) {
    setError('Please enter a valid number of days.'); return;
  }
  setLoading(true); setError('');
  try {
    const res = await api.post('/goals', {
      name: name.trim(),
      emoji,
      deadlineDays: days ? Number(days) : null,
    });
    onCreated(res.data);
    onClose();
  } catch (err) {
    console.log('Error:', err.response);
    setError(err.response?.data?.message || 'Something went wrong.');
  } finally {
    setLoading(false);
  }
};

  const inputStyle = {
    width: '100%', height: '46px',
    background: '#13142a', border: '1px solid #1e1e35',
    borderRadius: '12px', padding: '0 14px',
    fontSize: '14px', color: '#dde0f0',
    outline: 'none', fontFamily: 'Inter, sans-serif',
    transition: 'border-color 0.15s', boxSizing: 'border-box',
  };

  const labelStyle = {
    fontSize: '11px', fontWeight: 600, color: '#5a5a88',
    marginBottom: '8px', letterSpacing: '0.05em', display: 'block',
  };

  return (
    <div
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        background: 'rgba(0,0,0,0.72)',
        backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '16px',
      }}
    >
      <div style={{
        background: '#0e0f1c',
        border: '1px solid #1e1e35',
        borderRadius: '18px',
        width: '100%', maxWidth: '420px',
        boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
        maxHeight: '90vh', overflowY: 'auto',
      }}>

        {/* header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '20px 24px', borderBottom: '1px solid #1a1a2e',
        }}>
          <p style={{ fontFamily: 'Syne, sans-serif', fontSize: '16px', fontWeight: 700, color: '#dde0f0' }}>
            New Goal
          </p>
          <button
            onMouseDown={(e) => { e.stopPropagation(); onClose(); }}
            style={{
              width: '28px', height: '28px', borderRadius: '8px',
              background: '#13142a', border: '1px solid #1e1e35',
              color: '#5a5a88', fontSize: '14px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >✕</button>
        </div>

        {/* body */}
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* goal name */}
          <div>
            <span style={labelStyle}>GOAL NAME</span>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>

              {/* emoji picker */}
              <div ref={emojiRef} style={{ position: 'relative', flexShrink: 0 }}>
                <button
                  onMouseDown={(e) => { e.stopPropagation(); setShowEmojis(prev => !prev); }}
                  style={{
                    width: '46px', height: '46px', borderRadius: '12px',
                    background: '#13142a', border: '1px solid #1e1e35',
                    fontSize: '22px', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >{emoji}</button>

                {showEmojis && (
                  <div style={{
                    position: 'absolute', top: '52px', left: 0, zIndex: 200,
                    background: '#13142a', border: '1px solid #1e1e35',
                    borderRadius: '14px', padding: '10px',
                    display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)',
                    gap: '4px', width: '220px',
                    boxShadow: '0 12px 32px rgba(0,0,0,0.6)',
                  }}>
                    {EMOJIS.map(em => (
                      <button
                        key={em}
                        onMouseDown={(e) => { e.stopPropagation(); setEmoji(em); setShowEmojis(false); }}
                        style={{
                          width: '32px', height: '32px', borderRadius: '8px',
                          background: emoji === em ? 'rgba(108,95,255,0.2)' : 'transparent',
                          border: `1px solid ${emoji === em ? 'rgba(108,95,255,0.3)' : 'transparent'}`,
                          fontSize: '16px', cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}
                      >{em}</button>
                    ))}
                  </div>
                )}
              </div>

              {/* name input */}
              <input
                ref={nameRef}
                value={name}
                onChange={e => { setName(e.target.value); setError(''); }}
                onKeyDown={e => { if (e.key === 'Enter') handleSubmit(); }}
                placeholder="e.g. Learn TypeScript"
                maxLength={60}
                style={{ ...inputStyle, flex: 1 }}
                onFocus={e => e.target.style.borderColor = 'rgba(108,95,255,0.5)'}
                onBlur={e => e.target.style.borderColor = '#1e1e35'}
              />
            </div>
          </div>

          {/* deadline — days input */}
          <div>
            <span style={labelStyle}>
              DEADLINE{' '}
              <span style={{ color: '#333355', fontWeight: 400, letterSpacing: 0, textTransform: 'none' }}>
                — optional
              </span>
            </span>
            <div style={{ position: 'relative' }}>
              <input
                type="number"
                value={days}
                onChange={e => { setDays(e.target.value); setError(''); }}
                placeholder="e.g. 30"
                min="1"
                max="365"
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = 'rgba(108,95,255,0.5)'}
                onBlur={e => e.target.style.borderColor = '#1e1e35'}
              />
              {/* "days" label inside input */}
              {days && (
                <span style={{
                  position: 'absolute', right: '14px', top: '50%',
                  transform: 'translateY(-50%)',
                  fontSize: '12px', color: '#5a5a88',
                  pointerEvents: 'none',
                }}>
                  day{Number(days) !== 1 ? 's' : ''} from today
                </span>
              )}
            </div>
            {/* helper */}
            {days && Number(days) > 0 && (
              <p style={{ fontSize: '11px', color: '#444466', marginTop: '6px' }}>
                Deadline: {new Date(Date.now() + Number(days) * 86400000).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
              </p>
            )}
          </div>

          {/* error */}
          {error && (
            <p style={{
              fontSize: '12px', color: '#ff6655',
              background: 'rgba(255,102,85,0.08)',
              border: '1px solid rgba(255,102,85,0.2)',
              borderRadius: '8px', padding: '8px 12px',
            }}>{error}</p>
          )}

          {/* actions */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onMouseDown={(e) => { e.stopPropagation(); onClose(); }}
              style={{
                flex: 1, height: '44px', borderRadius: '12px',
                background: 'transparent', border: '1px solid #1e1e35',
                fontSize: '14px', fontWeight: 500, color: '#5a5a88',
                cursor: 'pointer',
              }}
            >Cancel</button>

            <button
              onMouseDown={handleSubmit}
              disabled={loading || !name.trim()}
              style={{
                flex: 2, height: '44px', borderRadius: '12px',
                background: loading || !name.trim()
                  ? 'rgba(108,95,255,0.3)'
                  : 'linear-gradient(135deg, #6c5fff, #5a4ee8)',
                border: 'none',
                fontSize: '14px', fontWeight: 600, color: 'white',
                cursor: loading || !name.trim() ? 'not-allowed' : 'pointer',
                boxShadow: loading || !name.trim() ? 'none' : '0 4px 14px rgba(108,95,255,0.28)',
              }}
            >{loading ? 'Creating...' : 'Create Goal →'}</button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default GoalForm;