import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import useWindowSize from '../hooks/useWindowSize';

const getDaysRemaining = (deadline) => {
  if (!deadline) return null;
  const diff = new Date(deadline) - new Date();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

const typeConfig = {
  video:    { color: '#ff6655', bg: 'rgba(255,102,85,0.1)'   },
  article:  { color: '#4488ff', bg: 'rgba(68,136,255,0.1)'   },
  course:   { color: '#8878ff', bg: 'rgba(108,95,255,0.1)'   },
  tutorial: { color: '#22cc88', bg: 'rgba(34,204,136,0.1)'   },
  book:     { color: '#ffaa33', bg: 'rgba(255,170,51,0.1)'   },
  other:    { color: '#9090bb', bg: 'rgba(144,144,187,0.1)'  },
};

// ── Resource Row ──
const ResourceRow = ({ resource, onClick }) => {
  const [hovered, setHovered] = useState(false);
  const type = typeConfig[resource.type] || typeConfig.other;
  const done = resource.completed;

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: '14px',
        padding: '14px 16px',
        background: '#0e0f1c',
        border: `1px solid ${hovered ? 'rgba(108,95,255,0.2)' : '#1a1a2e'}`,
        borderLeft: `3px solid ${done ? '#22cc88' : '#1a1a2e'}`,
        borderRadius: '12px', cursor: 'pointer',
        opacity: done ? 0.6 : 1,
        transition: 'all 0.15s',
      }}
    >
      {/* done indicator */}
      <div style={{
        width: '20px', height: '20px', borderRadius: '6px',
        flexShrink: 0, display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        background: done ? 'rgba(34,204,136,0.15)' : 'transparent',
        border: `1.5px solid ${done ? '#22cc88' : '#2a2a44'}`,
      }}>
        {done && <span style={{ fontSize: '11px', color: '#22cc88' }}>✓</span>}
      </div>

      {/* info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          fontSize: '13px', fontWeight: 500,
          color: done ? '#555566' : '#ccccee',
          textDecoration: done ? 'line-through' : 'none',
          marginBottom: '3px',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {resource.title}
        </p>
        <p style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: '10px', color: '#333355',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {resource.url}
        </p>
      </div>

      {/* type badge */}
      <div style={{
        padding: '2px 8px', borderRadius: '6px', flexShrink: 0,
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: '9px', fontWeight: 600,
        color: type.color, background: type.bg,
      }}>
        {resource.type || 'other'}
      </div>

      {/* arrow */}
      <span style={{ color: '#333355', fontSize: '12px', flexShrink: 0 }}>→</span>
    </div>
  );
};

// ── GOAL DETAIL ──
const GoalDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const width = useWindowSize();
  const isMobile = width < 768;

  const [goal, setGoal]         = useState(null);
  const [resources, setResources] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        
        const [goalRes, resourcesRes] = await Promise.all([
          api.get(`/goals/${id}`),
          api.get(`/resource/goal/${id}`),
        ]);
        setGoal(goalRes.data);
        setResources(resourcesRes.data);
      
      } catch (err) {
        setError('Failed to load goal.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/goals/${id}`);
      navigate('/app/dashboard');
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#080910', minHeight: '100vh' }}>
      <div style={{ width: '32px', height: '32px', borderRadius: '50%', border: '2px solid #6c5fff', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  );

  if (error) return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#080910', minHeight: '100vh' }}>
      <p style={{ color: '#ff6655', fontSize: '14px' }}>{error}</p>
    </div>
  );

  const daysRemaining = getDaysRemaining(goal?.deadline);
  const progress = goal?.progress || 0;
  const completedCount = resources.filter(r => r.completed).length;

  const getStatus = () => {
    if (progress === 100) return { label: 'Completed', color: '#22cc88', bg: 'rgba(34,204,136,0.12)', border: 'rgba(34,204,136,0.2)' };
    if (daysRemaining !== null && daysRemaining <= 3) return { label: 'Due Soon', color: '#ffaa33', bg: 'rgba(255,170,51,0.12)', border: 'rgba(255,170,51,0.2)' };
    return { label: 'In Progress', color: '#8878ff', bg: 'rgba(108,95,255,0.12)', border: 'rgba(108,95,255,0.2)' };
  };

  const status = getStatus();

  return (
    <div style={{
      padding: isMobile ? '20px 16px' : '28px 32px',
      display: 'flex', flexDirection: 'column', gap: '24px',
      minHeight: '100vh', background: '#080910',
    }}>

      {/* back */}
      <button
        onClick={() => navigate('/app/dashboard')}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          fontSize: '12px', color: '#444466', background: 'none',
          border: 'none', cursor: 'pointer', padding: 0, width: 'fit-content',
        }}
        onMouseEnter={e => e.currentTarget.style.color = '#8888bb'}
        onMouseLeave={e => e.currentTarget.style.color = '#444466'}
      >
        ← Back to Dashboard
      </button>

      {/* goal header card */}
      <div style={{
        background: '#0e0f1c', border: '1px solid #1a1a2e',
        borderRadius: '16px', padding: isMobile ? '18px' : '24px',
      }}>
        <div style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          alignItems: isMobile ? 'flex-start' : 'flex-start',
          justifyContent: 'space-between',
          gap: '16px', marginBottom: '20px',
        }}>
          {/* left — emoji + title + pills */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: isMobile ? '48px' : '56px',
              height: isMobile ? '48px' : '56px',
              borderRadius: '14px', flexShrink: 0,
              background: 'rgba(108,95,255,0.1)',
              border: '1px solid rgba(108,95,255,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: isMobile ? '24px' : '28px',
            }}>
              {goal?.emoji || '🎯'}
            </div>
            <div>
              <h1 style={{
                fontFamily: 'Syne, sans-serif',
                fontSize: isMobile ? '17px' : '20px',
                fontWeight: 700, color: '#dde0f0', marginBottom: '8px',
              }}>
                {goal?.name}
              </h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                {/* status */}
                <div style={{
                  padding: '3px 10px', borderRadius: '20px',
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '10px', fontWeight: 600,
                  color: status.color, background: status.bg,
                  border: `1px solid ${status.border}`,
                }}>
                  {status.label}
                </div>
                {/* days left */}
                {daysRemaining !== null && (
                  <div style={{
                    padding: '3px 10px', borderRadius: '20px',
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '10px', fontWeight: 600,
                    color: '#ffaa33', background: 'rgba(255,170,51,0.08)',
                    border: '1px solid rgba(255,170,51,0.15)',
                  }}>
                    ⏰ {daysRemaining <= 0 ? 'Overdue' : `${daysRemaining} day${daysRemaining !== 1 ? 's' : ''} left`}
                  </div>
                )}
                {/* resource count */}
                <div style={{
                  padding: '3px 10px', borderRadius: '20px',
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '10px', fontWeight: 600,
                  color: '#4488ff', background: 'rgba(68,136,255,0.08)',
                  border: '1px solid rgba(68,136,255,0.15)',
                }}>
                  📚 {resources.length} resource{resources.length !== 1 ? 's' : ''}
                </div>
              </div>
            </div>
          </div>

          {/* right — actions */}
          <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
            <button
              style={{
                padding: '7px 14px', borderRadius: '9px',
                fontSize: '12px', fontWeight: 500,
                color: '#5a5a88', background: 'transparent',
                border: '1px solid #1e1e35', cursor: 'pointer',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#2a2a44'; e.currentTarget.style.color = '#8888aa'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#1e1e35'; e.currentTarget.style.color = '#5a5a88'; }}
            >
              Edit
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              style={{
                padding: '7px 14px', borderRadius: '9px',
                fontSize: '12px', fontWeight: 500,
                color: '#ff6655', background: 'rgba(255,102,85,0.06)',
                border: '1px solid rgba(255,102,85,0.2)', cursor: 'pointer',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,102,85,0.12)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,102,85,0.06)'; }}
            >
              Delete
            </button>
          </div>
        </div>

        {/* progress bar */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', color: '#5a5a88' }}>
              Overall Progress — {completedCount} of {resources.length} done
            </span>
            <span style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '13px', fontWeight: 700, color: '#6c5fff',
            }}>
              {Math.round(progress)}%
            </span>
          </div>
          <div style={{ height: '6px', background: '#1a1a2e', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: '3px',
              width: `${progress}%`,
              background: progress === 100
                ? 'linear-gradient(90deg, #22cc88, #4488ff)'
                : 'linear-gradient(90deg, #6c5fff, #4488ff)',
              transition: 'width 0.6s ease',
            }} />
          </div>
        </div>
      </div>

      {/* resources section */}
      <div>
        <div style={{
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', marginBottom: '14px',
        }}>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '15px', fontWeight: 700, color: '#dde0f0' }}>
            Resources
          </h2>
          <button
            onClick={() => navigate(`/app/goals/${id}/add-resource`)}
            style={{
              padding: '8px 16px',
              background: 'linear-gradient(135deg, #6c5fff, #5a4ee8)',
              borderRadius: '9px', fontSize: '12px', fontWeight: 600,
              color: 'white', border: 'none', cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(108,95,255,0.25)',
            }}
          >
            + Add Resource
          </button>
        </div>

        {resources.length === 0 ? (
          <div style={{
            padding: '48px 20px', textAlign: 'center',
            background: '#0a0b18', border: '1px dashed #1a1a2e',
            borderRadius: '12px', display: 'flex',
            flexDirection: 'column', alignItems: 'center', gap: '10px',
          }}>
            <span style={{ fontSize: '28px', opacity: 0.3 }}>📚</span>
            <p style={{ fontFamily: 'Syne, sans-serif', fontSize: '14px', fontWeight: 700, color: '#444466' }}>
              No resources yet
            </p>
            <p style={{ fontSize: '12px', color: '#2a2a44', maxWidth: '260px', lineHeight: 1.6 }}>
              Add your first resource — a video, article, course or anything you want to learn from.
            </p>
            <button
              onClick={() => navigate(`/app/goals/${id}/add-resource`)}
              style={{
                marginTop: '4px', padding: '9px 20px',
                background: 'linear-gradient(135deg, #6c5fff, #5a4ee8)',
                borderRadius: '9px', fontSize: '13px', fontWeight: 600,
                color: 'white', border: 'none', cursor: 'pointer',
              }}
            >
              + Add your first resource
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {resources.map(resource => (
              <ResourceRow
                key={resource._id}
                resource={resource}
                onClick={() => navigate(`/app/resources/${resource._id}`)}
              />
            ))}
          </div>
        )}
      </div>

      {/* delete confirm modal */}
      {showDeleteConfirm && (
        <div
          onClick={() => setShowDeleteConfirm(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 100,
            background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '16px',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: '#0e0f1c', border: '1px solid #1e1e35',
              borderRadius: '18px', padding: '28px',
              width: '100%', maxWidth: '380px',
              boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
              display: 'flex', flexDirection: 'column', gap: '16px',
            }}
          >
            <div>
              <p style={{ fontFamily: 'Syne, sans-serif', fontSize: '16px', fontWeight: 700, color: '#dde0f0', marginBottom: '8px' }}>
                Delete Goal?
              </p>
              <p style={{ fontSize: '13px', color: '#5a5a88', lineHeight: 1.6 }}>
                This will permanently delete <strong style={{ color: '#9090bb' }}>{goal?.name}</strong> and all its resources. This cannot be undone.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                style={{
                  flex: 1, height: '42px', borderRadius: '10px',
                  background: 'transparent', border: '1px solid #1e1e35',
                  fontSize: '13px', fontWeight: 500, color: '#5a5a88', cursor: 'pointer',
                }}
              >Cancel</button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                style={{
                  flex: 1, height: '42px', borderRadius: '10px',
                  background: deleting ? 'rgba(255,102,85,0.3)' : 'rgba(255,102,85,0.15)',
                  border: '1px solid rgba(255,102,85,0.3)',
                  fontSize: '13px', fontWeight: 600, color: '#ff6655', cursor: 'pointer',
                }}
              >
                {deleting ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default GoalDetail;