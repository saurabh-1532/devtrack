import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import useWindowSize from '../hooks/useWindowSize';

const typeConfig = {
  video:   { icon: '🎬', label: 'Video'   },
  docs:    { icon: '📄', label: 'Docs'    },
  project: { icon: '🛠️', label: 'Project' },
  article: { icon: '📰', label: 'Article' },
  other:   { icon: '📦', label: 'Other'   },
};

const typeColors = {
  video:   { color: '#ff6655', bg: 'rgba(255,102,85,0.1)'  },
  docs:    { color: '#4488ff', bg: 'rgba(68,136,255,0.1)'  },
  project: { color: '#22cc88', bg: 'rgba(34,204,136,0.1)'  },
  article: { color: '#8878ff', bg: 'rgba(108,95,255,0.1)'  },
  other:   { color: '#9090bb', bg: 'rgba(144,144,187,0.1)' },
};

const getDaysRemaining = (deadline) => {
  if (!deadline) return null;
  const diff = new Date(deadline) - new Date();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

const AddResource = () => {
  const { id: goalId } = useParams();
  const navigate = useNavigate();
  const width = useWindowSize();
  const isMobile = width < 768;

  const [url, setUrl]               = useState('');
  const [title, setTitle]           = useState('');
  const [type, setType]             = useState('');
  const [totalUnits, setTotalUnits] = useState(0);
  const [fetching, setFetching]     = useState(false);
  const [fetchFailed, setFetchFailed] = useState(false);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');

  // goal context
  const [goal, setGoal]           = useState(null);
  const [resources, setResources] = useState([]);

  const fetchTimerRef = useRef(null);

  // fetch goal + existing resources
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [goalRes, resourcesRes] = await Promise.all([
          api.get(`/goals/${goalId}`),
          api.get(`/resource/goal/${goalId}`),
        ]);
        setGoal(goalRes.data);
        setResources(resourcesRes.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, [goalId]);

  // auto fetch title on url change
  useEffect(() => {
    if (fetchTimerRef.current) clearTimeout(fetchTimerRef.current);
    if (!url.trim() || !url.startsWith('http')) {
      setFetchFailed(false);
      return;
    }
    fetchTimerRef.current = setTimeout(async () => {
      setFetching(true); setFetchFailed(false);
      try {
        const res = await api.post('/utility/fetch-url', { url });
        if (res.data?.title) { setTitle(res.data.title); setFetchFailed(false); }
        else setFetchFailed(true);
      } catch { setFetchFailed(true); }
      finally { setFetching(false); }
    }, 800);
    return () => clearTimeout(fetchTimerRef.current);
  }, [url]);

  const handleSubmit = async () => {
    if (!title.trim()) { setError('Title is required.'); return; }
    if (!type) { setError('Please select a resource type.'); return; }
    setLoading(true); setError('');
    try {
      await api.post('/resource', {
        goalId,
        title: title.trim(),
        url: url.trim() || '',
        type,
        totalUnits: Number(totalUnits) || 0,
      });
      navigate(`/app/goals/${goalId}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    height: '46px', background: '#13142a',
    border: '1px solid #1e1e35', borderRadius: '12px',
    padding: '0 14px', fontSize: '14px', color: '#dde0f0',
    fontFamily: 'Inter, sans-serif', outline: 'none',
    width: '100%', boxSizing: 'border-box',
    transition: 'border-color 0.15s',
  };

  const labelStyle = {
    fontSize: '11px', fontWeight: 600, color: '#5a5a88',
    letterSpacing: '0.06em', textTransform: 'uppercase',
    display: 'block', marginBottom: '8px',
  };

  const daysRemaining = getDaysRemaining(goal?.deadline);
  const progress = goal?.progress || 0;
  const completedCount = resources.filter(r => r.status === 'done').length;

  return (
    <div style={{
      padding: isMobile ? '20px 16px' : '28px 32px',
      display: 'flex', flexDirection: 'column', gap: '24px',
      minHeight: '100vh', background: '#080910',
    }}>

      {/* back */}
      <button
        onClick={() => navigate(`/app/goals/${goalId}`)}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          fontSize: '12px', color: '#444466', background: 'none',
          border: 'none', cursor: 'pointer', padding: 0, width: 'fit-content',
        }}
        onMouseEnter={e => e.currentTarget.style.color = '#8888bb'}
        onMouseLeave={e => e.currentTarget.style.color = '#444466'}
      >← Back to Goal</button>

      {/* page header */}
      <div>
        <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: isMobile ? '18px' : '20px', fontWeight: 700, color: '#dde0f0', marginBottom: '4px' }}>
          Add Resource
        </h1>
        {goal && (
          <p style={{ fontSize: '12px', color: '#444466' }}>
            Adding to: {goal.emoji || '🎯'} {goal.name}
          </p>
        )}
      </div>

      {/* two column layout */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : '1fr 340px',
        gap: '20px',
        alignItems: 'start',
      }}>

        {/* ── LEFT — form ── */}
        <div style={{
          background: '#0e0f1c', border: '1px solid #1a1a2e',
          borderRadius: '16px', padding: isMobile ? '20px' : '28px',
          display: 'flex', flexDirection: 'column', gap: '22px',
        }}>

          {/* resource url */}
          <div>
            <label style={labelStyle}>
              Resource URL{' '}
              <span style={{ color: '#333355', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>— optional</span>
            </label>
            <input
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder="https://"
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = 'rgba(108,95,255,0.5)'}
              onBlur={e => e.target.style.borderColor = '#1e1e35'}
            />
            {fetching && (
              <p style={{ fontSize: '11px', color: '#5a5a88', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', border: '1.5px solid #6c5fff', borderTopColor: 'transparent', animation: 'spin 0.7s linear infinite' }} />
                Fetching title...
                <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
              </p>
            )}
            {fetchFailed && !fetching && (
              <p style={{ fontSize: '11px', color: '#ffaa33', marginTop: '6px' }}>
                ⚠ Couldn't fetch title — please enter it manually.
              </p>
            )}
            {!fetching && !fetchFailed && title && url && (
              <p style={{ fontSize: '11px', color: '#22cc88', marginTop: '6px' }}>✓ Title fetched successfully</p>
            )}
          </div>

          {/* title */}
          <div>
            <label style={labelStyle}>Title</label>
            <input
              value={title}
              onChange={e => { setTitle(e.target.value); setError(''); }}
              placeholder="e.g. React Hooks Explained"
              maxLength={120}
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = 'rgba(108,95,255,0.5)'}
              onBlur={e => e.target.style.borderColor = '#1e1e35'}
            />
          </div>

          {/* type */}
          <div>
            <label style={labelStyle}>Type</label>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(5, 1fr)',
              gap: '8px',
            }}>
              {Object.entries(typeConfig).map(([key, cfg]) => (
                <div
                  key={key}
                  onClick={() => setType(key)}
                  style={{
                    padding: '10px 8px', borderRadius: '10px',
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', gap: '6px',
                    cursor: 'pointer', transition: 'all 0.15s',
                    background: type === key ? 'rgba(108,95,255,0.12)' : '#13142a',
                    border: `1px solid ${type === key ? 'rgba(108,95,255,0.3)' : '#1e1e35'}`,
                  }}
                >
                  <span style={{ fontSize: '20px' }}>{cfg.icon}</span>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: type === key ? '#8878ff' : '#5a5a88' }}>
                    {cfg.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ height: '1px', background: '#13142a' }} />

          {/* total units */}
          <div>
            <label style={labelStyle}>
              Total Units{' '}
              <span style={{ color: '#333355', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>— optional</span>
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '13px', color: '#9090bb', marginBottom: '4px' }}>
                  How many units does this resource have?
                </p>
                <p style={{ fontSize: '11px', color: '#3a3a5a', lineHeight: 1.5 }}>
                  e.g. 12 videos, 5 chapters, 8 sections.<br />
                  Leave as 0 if not applicable.
                </p>
              </div>
              <div style={{
                display: 'flex', alignItems: 'center',
                background: '#13142a', border: '1px solid #1e1e35',
                borderRadius: '12px', overflow: 'hidden', flexShrink: 0,
              }}>
                <button
                  onClick={() => setTotalUnits(prev => Math.max(0, prev - 1))}
                  style={{ width: '40px', height: '46px', background: 'transparent', border: 'none', color: '#5a5a88', fontSize: '18px', cursor: 'pointer' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#8878ff'}
                  onMouseLeave={e => e.currentTarget.style.color = '#5a5a88'}
                >−</button>
                <input
                  type="number" value={totalUnits}
                  onChange={e => setTotalUnits(Math.max(0, Number(e.target.value)))}
                  min="0"
                  style={{ width: '48px', textAlign: 'center', fontFamily: 'JetBrains Mono, monospace', fontSize: '15px', fontWeight: 700, color: '#dde0f0', background: 'transparent', border: 'none', outline: 'none' }}
                />
                <button
                  onClick={() => setTotalUnits(prev => prev + 1)}
                  style={{ width: '40px', height: '46px', background: 'transparent', border: 'none', color: '#5a5a88', fontSize: '18px', cursor: 'pointer' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#8878ff'}
                  onMouseLeave={e => e.currentTarget.style.color = '#5a5a88'}
                >＋</button>
              </div>
            </div>
          </div>

          <div style={{ height: '1px', background: '#13142a' }} />

          {/* error */}
          {error && (
            <p style={{ fontSize: '12px', color: '#ff6655', background: 'rgba(255,102,85,0.08)', border: '1px solid rgba(255,102,85,0.2)', borderRadius: '8px', padding: '8px 12px' }}>
              {error}
            </p>
          )}

          {/* actions */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => navigate(`/app/goals/${goalId}`)}
              style={{ flex: 1, height: '44px', borderRadius: '12px', background: 'transparent', border: '1px solid #1e1e35', fontSize: '14px', fontWeight: 500, color: '#5a5a88', cursor: 'pointer' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#2a2a44'; e.currentTarget.style.color = '#8888aa'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#1e1e35'; e.currentTarget.style.color = '#5a5a88'; }}
            >Cancel</button>
            <button
              onClick={handleSubmit}
              disabled={loading || !title.trim() || !type}
              style={{
                flex: 2, height: '44px', borderRadius: '12px',
                background: loading || !title.trim() || !type ? 'rgba(108,95,255,0.3)' : 'linear-gradient(135deg, #6c5fff, #5a4ee8)',
                border: 'none', fontSize: '14px', fontWeight: 600, color: 'white',
                cursor: loading || !title.trim() || !type ? 'not-allowed' : 'pointer',
                boxShadow: loading || !title.trim() || !type ? 'none' : '0 4px 14px rgba(108,95,255,0.28)',
              }}
            >{loading ? 'Adding...' : 'Add Resource →'}</button>
          </div>

        </div>

        {/* ── RIGHT — goal context panel ── */}
        {!isMobile && (
          <div style={{
            background: '#0e0f1c', border: '1px solid #1a1a2e',
            borderRadius: '16px', padding: '24px',
            display: 'flex', flexDirection: 'column', gap: '20px',
            position: 'sticky', top: '28px',
          }}>

            {/* goal info */}
            {goal && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <div style={{
                    width: '44px', height: '44px', borderRadius: '12px', flexShrink: 0,
                    background: 'rgba(108,95,255,0.1)', border: '1px solid rgba(108,95,255,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px',
                  }}>{goal.emoji || '🎯'}</div>
                  <div>
                    <p style={{ fontFamily: 'Syne, sans-serif', fontSize: '14px', fontWeight: 700, color: '#dde0f0', marginBottom: '3px' }}>
                      {goal.name}
                    </p>
                    {daysRemaining !== null && (
                      <p style={{ fontSize: '11px', color: daysRemaining <= 3 ? '#ffaa33' : '#444466' }}>
                        {daysRemaining <= 0 ? 'Overdue' : `${daysRemaining} day${daysRemaining !== 1 ? 's' : ''} left`}
                      </p>
                    )}
                  </div>
                </div>

                {/* progress bar */}
                <div style={{ marginBottom: '6px', display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '11px', color: '#5a5a88' }}>Progress</span>
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', fontWeight: 700, color: '#6c5fff' }}>{Math.round(progress)}%</span>
                </div>
                <div style={{ height: '4px', background: '#1a1a2e', borderRadius: '2px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', borderRadius: '2px', width: `${progress}%`, background: 'linear-gradient(90deg, #6c5fff, #4488ff)' }} />
                </div>
              </div>
            )}

            <div style={{ height: '1px', background: '#13142a' }} />

            {/* existing resources */}
            <div>
              <p style={{ fontFamily: 'Syne, sans-serif', fontSize: '12px', fontWeight: 700, color: '#5a5a88', marginBottom: '12px' }}>
                {resources.length} Resource{resources.length !== 1 ? 's' : ''} — {completedCount} done
              </p>

              {resources.length === 0 ? (
                <p style={{ fontSize: '12px', color: '#333355' }}>No resources yet.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '280px', overflowY: 'auto' }}>
                  {resources.map(r => {
                    const tc = typeColors[r.type] || typeColors.other;
                    const done = r.status === 'done';
                    return (
                      <div key={r._id} style={{
                        display: 'flex', alignItems: 'center', gap: '10px',
                        padding: '10px 12px', borderRadius: '10px',
                        background: '#13142a', border: `1px solid ${done ? 'rgba(34,204,136,0.15)' : '#1e1e35'}`,
                        borderLeft: `3px solid ${done ? '#22cc88' : '#1e1e35'}`,
                        opacity: done ? 0.6 : 1,
                      }}>
                        <span style={{ fontSize: '13px' }}>{typeConfig[r.type]?.icon || '📦'}</span>
                        <p style={{
                          fontSize: '12px', fontWeight: 500, flex: 1,
                          color: done ? '#555566' : '#9090bb',
                          textDecoration: done ? 'line-through' : 'none',
                          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                        }}>{r.title}</p>
                        {done && <span style={{ fontSize: '11px', color: '#22cc88', flexShrink: 0 }}>✓</span>}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        )}

      </div>
    </div>
  );
};

export default AddResource;