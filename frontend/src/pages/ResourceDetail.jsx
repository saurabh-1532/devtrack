import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import useWindowSize from '../hooks/useWindowSize';
import BadgeModal from '../components/shared/BadgeModal';

const typeConfig = {
  video:   { icon: '🎬', color: '#ff6655', bg: 'rgba(255,102,85,0.1)'  },
  docs:    { icon: '📄', color: '#4488ff', bg: 'rgba(68,136,255,0.1)'  },
  project: { icon: '🛠️', color: '#22cc88', bg: 'rgba(34,204,136,0.1)' },
  article: { icon: '📰', color: '#8878ff', bg: 'rgba(108,95,255,0.1)'  },
  other:   { icon: '📦', color: '#9090bb', bg: 'rgba(144,144,187,0.1)' },
};

const statusConfig = {
  saved:         { label: 'Saved',       color: '#9090bb', bg: 'rgba(144,144,187,0.1)',  border: 'rgba(144,144,187,0.2)'  },
  'in-progress': { label: 'In Progress', color: '#8878ff', bg: 'rgba(108,95,255,0.12)', border: 'rgba(108,95,255,0.2)'  },
  done:          { label: '✓ Done',      color: '#22cc88', bg: 'rgba(34,204,136,0.12)', border: 'rgba(34,204,136,0.2)'  },
};

// ── Confetti ──
const Confetti = () => {
  const COLORS = ['#6c5fff','#4488ff','#22cc88','#ffaa33','#ff6655','#ff88cc','#88ddff','#ffffff'];
  const pieces = Array.from({ length: 120 }, (_, i) => ({
    id: i,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    left: Math.random() * 100,
    delay: Math.random() * 2,
    duration: 2.5 + Math.random() * 2,
    size: 6 + Math.random() * 8,
    sway: 1.5 + Math.random() * 2,
    shape: ['2px','50%','0'][Math.floor(Math.random() * 3)],
  }));
  return (
    <>
      <style>{`
        @keyframes confettiFall {
          0%   { transform: translateY(-20px) rotate(0deg) scale(1); opacity: 1; }
          80%  { opacity: 1; }
          100% { transform: translateY(110vh) rotate(720deg) scale(0.5); opacity: 0; }
        }
        @keyframes confettiSway {
          0%   { margin-left: 0px; }
          25%  { margin-left: 40px; }
          75%  { margin-left: -40px; }
          100% { margin-left: 0px; }
        }
      `}</style>
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 999, overflow: 'hidden' }}>
        {pieces.map(p => (
          <div key={p.id} style={{
            position: 'absolute', top: '-20px',
            left: `${p.left}%`,
            width: `${p.size}px`, height: `${p.size}px`,
            background: p.color, borderRadius: p.shape,
            animation: `confettiFall ${p.duration}s ${p.delay}s ease-in forwards, confettiSway ${p.sway}s ${p.delay}s ease-in-out infinite`,
          }} />
        ))}
      </div>
    </>
  );
};

// ── Note Item ──
const NoteItem = ({ note, onDelete }) => {
  const [hovered, setHovered] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    await onDelete(note._id);
    setDeleting(false);
  };

  const date = new Date(note.createdAt).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: '11px 13px', borderRadius: '10px',
        background: '#13142a', flexShrink: 0,
        border: `1px solid ${note.flag === 'revision' ? 'rgba(255,170,51,0.2)' : '#1e1e35'}`,
        borderLeft: `3px solid ${note.flag === 'revision' ? '#ffaa33' : '#1e1e35'}`,
        display: 'flex', flexDirection: 'column', gap: '6px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
        <p style={{ fontSize: '12px', color: '#9090bb', lineHeight: 1.6, flex: 1 }}>{note.text}</p>
        {hovered && (
          <button
            onClick={handleDelete} disabled={deleting}
            style={{ width: '22px', height: '22px', borderRadius: '6px', background: 'rgba(255,102,85,0.08)', border: '1px solid rgba(255,102,85,0.18)', color: '#ff6655', fontSize: '10px', cursor: 'pointer', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >✕</button>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '9.5px', color: '#333355' }}>{date}</span>
        {note.flag === 'revision' && (
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '9px', fontWeight: 700, padding: '2px 7px', borderRadius: '6px', background: 'rgba(255,170,51,0.1)', color: '#ffaa33' }}>⚑ revision</span>
        )}
      </div>
    </div>
  );
};

// ── RESOURCE DETAIL ──
const ResourceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const width = useWindowSize();
  const isMobile = width < 768;

  const [resource, setResource]         = useState(null);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState('');
  const [doneUnits, setDoneUnits]       = useState(0);
  const [saving, setSaving]             = useState(false);
  const [saveError, setSaveError]       = useState('');
  const [noteText, setNoteText]         = useState('');
  const [noteFlag, setNoteFlag]         = useState(null);
  const [notes, setNotes]               = useState([]);
  const [showCelebration, setShowCelebration] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [newStreak, setNewStreak]       = useState(null);
  const [newBadges, setNewBadges]       = useState([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting]         = useState(false);
  const [showBadgeModal, setShowBadgeModal] = useState(false);


  useEffect(() => {
    const fetchResource = async () => {
      try {
        const res = await api.get(`/resource/${id}`);
        setResource(res.data);
        setDoneUnits(res.data.doneUnits || 0);
        setNotes(res.data.notes || []);
        if (res.data.status === 'done') setShowCelebration(true);
      } catch (err) {
        setError('Failed to load resource.');
      } finally {
        setLoading(false);
      }
    };
    fetchResource();
  }, [id]);

  const savedDoneUnits = resource?.doneUnits || 0;
  const totalUnits     = resource?.totalUnits || 0;
  const hasUnits       = totalUnits > 0;
  const atMax          = doneUnits >= totalUnits && hasUnits;
  const canDecrement   = doneUnits > savedDoneUnits;
  const canIncrement   = doneUnits < totalUnits;
  const progressPct    = hasUnits ? Math.round((doneUnits / totalUnits) * 100) : 0;
  const tc             = typeConfig[resource?.type]   || typeConfig.other;
  const sc             = statusConfig[resource?.status] || statusConfig.saved;

  const handleSaveProgress = async () => {
    if (hasUnits && doneUnits === savedDoneUnits) return;
    setSaving(true); setSaveError('');
    try {
      const res = await api.patch(`/resource/${id}/progress`, { doneUnits });
      if (noteText.trim()) {
        const noteRes = await api.post(`/resource/${id}/notes`, { text: noteText.trim(), flag: noteFlag });
        setNotes(prev => [...prev, noteRes.data]);
        setNoteText(''); setNoteFlag(null);
      }
      setResource(prev => ({ ...prev, doneUnits: res.data.resource.doneUnits, status: res.data.resource.status }));
      if (res.data.resource.status === 'done') {
        setShowCelebration(true); setShowConfetti(true);
         setNewStreak(res.data.streak);
        setNewBadges(res.data.newBadges || []);
        if (res.data.newBadges?.length > 0) setShowBadgeModal(true);
        setTimeout(() => setShowConfetti(false), 5000);
      }
    } catch (err) {
      setSaveError(err.response?.data?.message || 'Failed to save progress.');
    } finally {
      setSaving(false);
    }
  };

  const handleMarkDone = async () => {
    setSaving(true); setSaveError('');
    try {
      const res = await api.patch(`/resource/${id}/progress`, { doneUnits: 0 });
      if (noteText.trim()) {
        const noteRes = await api.post(`/resource/${id}/notes`, { text: noteText.trim(), flag: noteFlag });
        setNotes(prev => [...prev, noteRes.data]);
        setNoteText(''); setNoteFlag(null);
      }
      setResource(prev => ({ ...prev, status: res.data.resource.status }));
      setShowCelebration(true); setShowConfetti(true);
        setNewStreak(res.data.streak);
        setNewBadges(res.data.newBadges || []);
        if (res.data.newBadges?.length > 0) setShowBadgeModal(true);
        setTimeout(() => setShowConfetti(false), 5000);
    } catch (err) {
      setSaveError(err.response?.data?.message || 'Failed to save.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteNote = async (noteId) => {
    try {
      await api.delete(`/resource/${id}/notes/${noteId}`);
      setNotes(prev => prev.filter(n => n._id !== noteId));
    } catch (err) { console.error(err); }
  };

  const handleDeleteResource = async () => {
    setDeleting(true);
    try {
      await api.delete(`/resource/${id}`);
      navigate(-1);
    } catch (err) { console.error(err); }
    finally { setDeleting(false); }
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#080910' }}>
      <div style={{ width: '32px', height: '32px', borderRadius: '50%', border: '2px solid #6c5fff', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  );

  if (error) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#080910' }}>
      <p style={{ color: '#ff6655', fontSize: '14px' }}>{error}</p>
    </div>
  );

  // ── shared styles ──
  const pill = (color, bg, border, label) => (
    <span style={{ padding: '3px 9px', borderRadius: '20px', fontFamily: 'JetBrains Mono, monospace', fontSize: '9.5px', fontWeight: 600, color, background: bg, border: `1px solid ${border}` }}>{label}</span>
  );

  return (
    <div style={{
      padding: isMobile ? '16px' : '24px 28px',
      display: 'flex', flexDirection: 'column', gap: '16px',
      // on desktop fill viewport height so two col can stretch
      height: isMobile ? 'auto' : '100%',
      minHeight: isMobile ? '100vh' : 0,
      background: '#080910', boxSizing: 'border-box',
    }}>

      <style>{`
        @keyframes celebGlow {
          0%,100% { box-shadow: 0 0 0 1px rgba(34,204,136,0.2), 0 8px 40px rgba(34,204,136,0.06); }
          50%      { box-shadow: 0 0 0 1px rgba(34,204,136,0.4), 0 12px 56px rgba(34,204,136,0.16); }
        }
        @keyframes emojiFloat {
          0%,100% { transform: translateY(0px); }
          50%     { transform: translateY(-5px); }
        }
        @keyframes celebSlideIn {
          from { opacity: 0; transform: translateY(-12px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes barFill {
          from { width: 0%; }
          to   { width: 100%; }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes emojiPop {
          0%   { transform: scale(0) rotate(-20deg); opacity: 0; }
          60%  { transform: scale(1.3) rotate(8deg); opacity: 1; }
          80%  { transform: scale(0.9) rotate(-4deg); }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        .notes-scroll::-webkit-scrollbar { width: 4px; }
        .notes-scroll::-webkit-scrollbar-track { background: transparent; }
        .notes-scroll::-webkit-scrollbar-thumb { background: #1e1e35; border-radius: 4px; }
      `}</style>

      {showConfetti && <Confetti />}

      {/* back */}
      <button
        onClick={() => navigate(-1)}
        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#444466', background: 'none', border: 'none', cursor: 'pointer', padding: 0, width: 'fit-content', flexShrink: 0 }}
        onMouseEnter={e => e.currentTarget.style.color = '#8888bb'}
        onMouseLeave={e => e.currentTarget.style.color = '#444466'}
      >← Back to Goal</button>

      {/* resource header */}
      <div style={{
        background: '#0e0f1c',
        border: `1px solid ${resource?.status === 'done' ? 'rgba(34,204,136,0.2)' : '#1a1a2e'}`,
        borderRadius: '14px', padding: isMobile ? '14px' : '16px 20px',
        display: 'flex', alignItems: isMobile ? 'flex-start' : 'center',
        justifyContent: 'space-between', gap: '12px', flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
          <div style={{ width: isMobile ? '38px' : '42px', height: isMobile ? '38px' : '42px', borderRadius: '11px', flexShrink: 0, background: tc.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: isMobile ? '18px' : '20px' }}>
            {tc.icon}
          </div>
          <div style={{ minWidth: 0 }}>
            <p style={{ fontFamily: 'Syne, sans-serif', fontSize: isMobile ? '13px' : '15px', fontWeight: 700, color: '#dde0f0', marginBottom: '5px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: isMobile ? 'normal' : 'nowrap' }}>
              {resource?.title}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '7px', flexWrap: 'wrap', marginBottom: '4px' }}>
              {pill(tc.color, tc.bg, `${tc.color}33`, resource?.type)}
              {pill(sc.color, sc.bg, sc.border, sc.label)}
            </div>
            {resource?.url && (
                <a href={resource.url} target="_blank" rel="noreferrer"
                    style={{
                    fontFamily: 'JetBrains Mono, monospace', fontSize: '11px',
                    color: '#6c5fff', textDecoration: 'none',
                    display: 'inline-flex', alignItems: 'center', gap: '4px',
                    maxWidth: '100%',        // ← constrain to parent width
                    overflow: 'hidden',      // ← hide overflow
                    }}
                    onMouseEnter={e => e.currentTarget.style.color = '#8878ff'}
                    onMouseLeave={e => e.currentTarget.style.color = '#6c5fff'}
                >
                    <span style={{ flexShrink: 0 }}>↗</span>
                    <span style={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',  // ← show ... at end
                    whiteSpace: 'nowrap',      // ← single line
                    }}>
                    {resource.url}
                    </span>
                </a>
                )}
          </div>
        </div>
        <button
          onClick={() => setShowDeleteConfirm(true)}
          style={{ padding: isMobile ? '5px 10px' : '6px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: 500, color: '#ff6655', background: 'rgba(255,102,85,0.06)', border: '1px solid rgba(255,102,85,0.18)', cursor: 'pointer', flexShrink: 0 }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,102,85,0.12)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,102,85,0.06)'}
        >Delete</button>
      </div>

      {/* ── COMPLETION STATE ── */}
      {showCelebration ? (
        <div style={{
          display: isMobile ? 'flex' : 'grid',
          flexDirection: 'column',
          gridTemplateColumns: isMobile ? undefined : '1fr 300px',
          gap: '16px',
          flex: isMobile ? undefined : 1,
          minHeight: isMobile ? undefined : 0,
          alignItems: isMobile ? undefined : 'stretch',
        }}>

          {/* celebration card */}
          <div style={{
            background: '#0e0f1c',
            border: '1px solid rgba(34,204,136,0.25)',
            borderRadius: '18px', padding: isMobile ? '20px' : '24px',
            display: 'flex', flexDirection: 'column', gap: '18px',
            animation: 'celebSlideIn 0.5s 0.1s ease both, celebGlow 3s 1s ease-in-out infinite',
            height: isMobile ? 'auto' : '100%',
          }}>

            {/* hero */}
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
              padding: isMobile ? '20px 16px' : '24px 20px',
              background: 'rgba(34,204,136,0.05)', border: '1px solid rgba(34,204,136,0.1)',
              borderRadius: '14px', gap: '10px',
              flex: isMobile ? undefined : 1, justifyContent: 'center',
            }}>
              <span style={{ fontSize: isMobile ? '44px' : '52px', animation: 'emojiPop 0.6s 0.5s ease both, emojiFloat 3s 1.5s ease-in-out infinite', display: 'inline-block', filter: 'drop-shadow(0 0 16px rgba(34,204,136,0.35))' }}>
                🎉
              </span>
              <p style={{ fontFamily: 'Syne, sans-serif', fontSize: isMobile ? '20px' : '22px', fontWeight: 800, color: '#22cc88', letterSpacing: '-0.02em', animation: 'fadeUp 0.4s 0.8s ease both', opacity: 0 }}>
                Resource Completed!
              </p>
              <p style={{ fontSize: '12px', color: '#5a5a88', lineHeight: 1.7, animation: 'fadeUp 0.4s 1s ease both', opacity: 0 }}>
                Incredible work! You've finished this resource and added it to your learning journey.
              </p>
              {/* resource name — full width */}
              <div style={{
                fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', fontWeight: 600,
                color: '#9090bb', padding: '8px 14px',
                background: 'rgba(144,144,187,0.08)', border: '1px solid rgba(144,144,187,0.15)',
                borderRadius: '10px', width: '100%', textAlign: 'center',
                animation: 'fadeUp 0.4s 1.1s ease both', opacity: 0,
              }}>
                {resource?.title}
              </div>
            </div>

            {/* progress bar — only if has units */}
            {hasUnits && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '7px', flexShrink: 0, animation: 'fadeUp 0.4s 1.2s ease both', opacity: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '11px', color: '#5a5a88' }}>Units completed</span>
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', fontWeight: 700, color: '#22cc88' }}>{totalUnits} / {totalUnits} ✓</span>
                </div>
                <div style={{ height: '8px', background: '#1a1a2e', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', borderRadius: '4px', background: 'linear-gradient(90deg,#22cc88,#4488ff)', animation: 'barFill 1s 0.6s ease both', boxShadow: '0 0 10px rgba(34,204,136,0.3)' }} />
                </div>
              </div>
            )}

            <div style={{ height: '1px', background: '#13142a', flexShrink: 0 }} />

            {/* rewards */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', flexShrink: 0, animation: 'fadeUp 0.4s 1.3s ease both', opacity: 0 }}>
              {newStreak ? (
                <div style={{ padding: '12px 14px', borderRadius: '12px', background: 'rgba(255,170,51,0.07)', border: '1px solid rgba(255,170,51,0.15)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '22px' }}>🔥</span>
                  <div>
                    <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '13px', fontWeight: 700, color: '#ffaa33' }}>{newStreak?.currentStreak} Day Streak</p>
                    <p style={{ fontSize: '10px', color: '#6a5a33', marginTop: '2px' }}>extended!</p>
                  </div>
                </div>
              ) : (
                <div style={{ padding: '12px 14px', borderRadius: '12px', background: 'rgba(255,170,51,0.07)', border: '1px solid rgba(255,170,51,0.15)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '22px' }}>🔥</span>
                  <div>
                    <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '13px', fontWeight: 700, color: '#ffaa33' }}>Streak Active</p>
                    <p style={{ fontSize: '10px', color: '#6a5a33', marginTop: '2px' }}>keep going!</p>
                  </div>
                </div>
              )}
              {newBadges.length > 0 ? (
                <div style={{ padding: '12px 14px', borderRadius: '12px', background: 'rgba(34,204,136,0.07)', border: '1px solid rgba(34,204,136,0.15)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '22px' }}>🏆</span>
                  <div>
                    <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '12px', fontWeight: 700, color: '#22cc88' }}>Badge Earned</p>
                    <p style={{ fontSize: '10px', color: '#1a5a3a', marginTop: '2px' }}>{newBadges[0]?.name}</p>
                  </div>
                </div>
              ) : (
                <div style={{ padding: '12px 14px', borderRadius: '12px', background: 'rgba(108,95,255,0.07)', border: '1px solid rgba(108,95,255,0.15)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '22px' }}>✨</span>
                  <div>
                    <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '12px', fontWeight: 700, color: '#8878ff' }}>No badges yet</p>
                    <p style={{ fontSize: '10px', color: '#3a3a6a', marginTop: '2px' }}>keep completing!</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* notes panel */}
          <div style={{
            background: '#0e0f1c', border: '1px solid #1a1a2e',
            borderRadius: '18px', padding: '20px',
            display: 'flex', flexDirection: 'column', gap: '12px',
            height: isMobile ? 'auto' : '100%',
            minHeight: isMobile ? undefined : 0,
            overflow: 'hidden',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
              <p style={{ fontFamily: 'Syne, sans-serif', fontSize: '14px', fontWeight: 700, color: '#dde0f0' }}>
                Notes <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '10px', fontWeight: 600, color: '#444466', marginLeft: '5px' }}>{notes.length}</span>
              </p>
              {!isMobile && <span style={{ fontSize: '10px', color: '#333355', fontFamily: 'JetBrains Mono, monospace' }}>read-only</span>}
            </div>

            {notes.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, gap: '8px', padding: '24px 0' }}>
                <span style={{ fontSize: '28px' }}>📝</span>
                <p style={{ fontSize: '12px', color: '#333355', textAlign: 'center' }}>No notes added.<br /><span style={{ color: '#222238' }}>Notes appear here when<br />you update progress.</span></p>
              </div>
            ) : (
              <div
                className="notes-scroll"
                style={{
                  flex: 1, overflowY: isMobile ? 'visible' : 'auto',
                  display: 'flex', flexDirection: 'column', gap: '8px',
                  minHeight: 0, paddingRight: '2px',
                }}
              >
                {[...notes].reverse().map(note => (
                  <NoteItem key={note._id} note={note} onDelete={handleDeleteNote} />
                ))}
              </div>
            )}
          </div>
        </div>

      ) : (
        /* ── PROGRESS STATE ── */
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '1fr 300px',
          gap: '16px', alignItems: 'start',
        }}>

          {/* progress card */}
          <div style={{ background: '#0e0f1c', border: '1px solid #1a1a2e', borderRadius: '16px', padding: isMobile ? '18px' : '22px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <p style={{ fontFamily: 'Syne, sans-serif', fontSize: '14px', fontWeight: 700, color: '#dde0f0' }}>
              {hasUnits ? 'Update Progress' : 'Mark Progress'}
            </p>

            {hasUnits ? (
              <>
                {/* progress bar — full width on top */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontSize: '11px', color: '#5a5a88' }}>Units completed</span>
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', fontWeight: 700, color: atMax ? '#22cc88' : '#6c5fff' }}>{doneUnits} / {totalUnits}</span>
                  </div>
                  <div style={{ height: '8px', background: '#1a1a2e', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', borderRadius: '4px', width: `${progressPct}%`, background: atMax ? 'linear-gradient(90deg,#22cc88,#4488ff)' : 'linear-gradient(90deg,#6c5fff,#4488ff)', transition: 'width 0.3s ease' }} />
                  </div>
                </div>

                {/* counter centered below */}
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', background: '#13142a', border: '1px solid #1e1e35', borderRadius: '14px', overflow: 'hidden' }}>
                    <button
                      onClick={() => setDoneUnits(prev => Math.max(savedDoneUnits, prev - 1))}
                      disabled={!canDecrement}
                      style={{ width: '52px', height: '52px', background: 'transparent', border: 'none', fontSize: '20px', color: canDecrement ? '#5a5a88' : '#2a2a3a', cursor: canDecrement ? 'pointer' : 'not-allowed' }}
                      onMouseEnter={e => { if (canDecrement) e.currentTarget.style.color = '#8878ff'; }}
                      onMouseLeave={e => { if (canDecrement) e.currentTarget.style.color = '#5a5a88'; }}
                    >−</button>
                    <div style={{ padding: '0 24px', fontFamily: 'JetBrains Mono, monospace', fontSize: '22px', fontWeight: 700, color: '#dde0f0', borderLeft: '1px solid #1e1e35', borderRight: '1px solid #1e1e35', minWidth: '80px', textAlign: 'center' }}>
                      {doneUnits}
                    </div>
                    <button
                      onClick={() => setDoneUnits(prev => Math.min(totalUnits, prev + 1))}
                      disabled={!canIncrement}
                      style={{ width: '52px', height: '52px', background: 'transparent', border: 'none', fontSize: '20px', color: canIncrement ? '#5a5a88' : '#2a2a3a', cursor: canIncrement ? 'pointer' : 'not-allowed' }}
                      onMouseEnter={e => { if (canIncrement) e.currentTarget.style.color = '#8878ff'; }}
                      onMouseLeave={e => { if (canIncrement) e.currentTarget.style.color = '#5a5a88'; }}
                    >＋</button>
                  </div>
                </div>
              </>
            ) : (
              <p style={{ fontSize: '12px', color: '#444466' }}>
                This resource has no units set. Add a note and mark it as done when you finish.
              </p>
            )}

            {/* note input */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '14px', background: '#13142a', borderRadius: '12px', border: '1px solid #1e1e35' }}>
              <p style={{ fontSize: '11px', fontWeight: 600, color: '#5a5a88', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                Add a note <span style={{ color: '#333355', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>— optional</span>
              </p>
              <textarea
                value={noteText}
                onChange={e => setNoteText(e.target.value)}
                placeholder="What did you learn? Any key takeaway..."
                rows={3}
                style={{ width: '100%', background: 'transparent', border: 'none', outline: 'none', fontSize: '13px', color: '#dde0f0', fontFamily: 'Inter, sans-serif', resize: 'none', lineHeight: 1.6 }}
              />
              <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'stretch' : 'center', gap: '8px' }}>
                <div
                  onClick={() => setNoteFlag(prev => prev === 'revision' ? null : 'revision')}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', background: noteFlag === 'revision' ? 'rgba(255,170,51,0.12)' : 'rgba(255,170,51,0.06)', border: `1px solid ${noteFlag === 'revision' ? 'rgba(255,170,51,0.3)' : 'rgba(255,170,51,0.15)'}`, fontSize: '11px', fontWeight: 600, color: '#ffaa33', transition: 'all 0.15s' }}
                >
                  ⚑ {noteFlag === 'revision' ? 'Marked for revision' : 'Mark for revision'}
                </div>
                <button
                  onClick={hasUnits ? handleSaveProgress : handleMarkDone}
                  disabled={saving || (hasUnits && doneUnits === savedDoneUnits)}
                  style={{ padding: '8px 18px', borderRadius: '10px', background: saving || (hasUnits && doneUnits === savedDoneUnits) ? 'rgba(108,95,255,0.2)' : 'linear-gradient(135deg,#6c5fff,#5a4ee8)', border: 'none', fontSize: '13px', fontWeight: 600, color: 'white', cursor: saving || (hasUnits && doneUnits === savedDoneUnits) ? 'not-allowed' : 'pointer', boxShadow: '0 4px 12px rgba(108,95,255,0.25)' }}
                >
                  {saving ? 'Saving...' : hasUnits ? 'Save Progress →' : '✓ Mark as Done'}
                </button>
              </div>
            </div>

            {saveError && (
              <p style={{ fontSize: '12px', color: '#ff6655', background: 'rgba(255,102,85,0.08)', border: '1px solid rgba(255,102,85,0.2)', borderRadius: '8px', padding: '8px 12px' }}>{saveError}</p>
            )}
          </div>

          {/* notes panel — progress state */}
          <div style={{ background: '#0e0f1c', border: '1px solid #1a1a2e', borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px', position: isMobile ? 'static' : 'sticky', top: '24px' }}>
            <p style={{ fontFamily: 'Syne, sans-serif', fontSize: '14px', fontWeight: 700, color: '#dde0f0' }}>
              Notes <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '10px', fontWeight: 600, color: '#444466', marginLeft: '5px' }}>{notes.length}</span>
            </p>
            {notes.length === 0 ? (
              <p style={{ fontSize: '12px', color: '#333355', textAlign: 'center', padding: '20px 0' }}>No notes yet.<br />Add one when you update progress.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: isMobile ? 'none' : '400px', overflowY: isMobile ? 'visible' : 'auto' }}>
                {[...notes].reverse().map(note => (
                  <NoteItem key={note._id} note={note} onDelete={handleDeleteNote} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
            {showBadgeModal && newBadges.length > 0 && (
                <BadgeModal
                badges={newBadges}
                onClose={() => setShowBadgeModal(false)}
                />
                )}
      {/* delete modal */}
      {showDeleteConfirm && (
        <div onClick={() => setShowDeleteConfirm(false)} style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#0e0f1c', border: '1px solid #1e1e35', borderRadius: '18px', padding: '28px', width: '100%', maxWidth: '380px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <p style={{ fontFamily: 'Syne, sans-serif', fontSize: '16px', fontWeight: 700, color: '#dde0f0', marginBottom: '8px' }}>Delete Resource?</p>
              <p style={{ fontSize: '13px', color: '#5a5a88', lineHeight: 1.6 }}>This will permanently delete <strong style={{ color: '#9090bb' }}>{resource?.title}</strong> and all its notes.</p>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setShowDeleteConfirm(false)} style={{ flex: 1, height: '42px', borderRadius: '10px', background: 'transparent', border: '1px solid #1e1e35', fontSize: '13px', fontWeight: 500, color: '#5a5a88', cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleDeleteResource} disabled={deleting} style={{ flex: 1, height: '42px', borderRadius: '10px', background: 'rgba(255,102,85,0.15)', border: '1px solid rgba(255,102,85,0.3)', fontSize: '13px', fontWeight: 600, color: '#ff6655', cursor: 'pointer' }}>
                {deleting ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ResourceDetail;