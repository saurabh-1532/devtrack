import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import useWindowSize from '../hooks/useWindowSize';

const BADGE_META = {
  first_step:      { name: 'FIRST STEP', icon: '🎯', color: '#8878ff', border: 'rgba(108,95,255,0.25)' },
  resource_hunter: { name: 'HUNTER',     icon: '📚', color: '#4488ff', border: 'rgba(68,136,255,0.25)'  },
  finisher:        { name: 'FINISHER',   icon: '⚡', color: '#ff6655', border: 'rgba(255,102,85,0.25)'  },
  streak:          { name: 'STREAK',     icon: '🔥', color: '#ffaa33', border: 'rgba(255,170,51,0.25)'  },
  goal_crusher:    { name: 'CRUSHER',    icon: '🎓', color: '#22cc88', border: 'rgba(34,204,136,0.25)'  },
  ahead_of_time:   { name: 'AHEAD',      icon: '⏰', color: '#88ddff', border: 'rgba(136,221,255,0.25)' },
};

const TIER_LABELS = { 1: '★ I', 2: '★★ II', 3: '★★★ III' };

// all possible badge combinations (id + tier)
const ALL_BADGES = [
  { id: 'first_step',      tier: 1 },
  { id: 'finisher',        tier: 1 }, { id: 'finisher',        tier: 2 }, { id: 'finisher',        tier: 3 },
  { id: 'resource_hunter', tier: 1 }, { id: 'resource_hunter', tier: 2 }, { id: 'resource_hunter', tier: 3 },
  { id: 'streak',          tier: 1 }, { id: 'streak',          tier: 2 }, { id: 'streak',          tier: 3 },
  { id: 'goal_crusher',    tier: 1 }, { id: 'goal_crusher',    tier: 2 }, { id: 'goal_crusher',    tier: 3 },
  { id: 'ahead_of_time',   tier: 1 }, { id: 'ahead_of_time',   tier: 2 },
];

const ProfilePage = () => {
  const navigate  = useNavigate();
  const { logout } = useAuth();
  const width     = useWindowSize();
  const isMobile  = width < 768;

  const [user, setUser]               = useState(null);
  const [stats, setStats]             = useState(null);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');

  // danger zone
  const [showDeleteGoals, setShowDeleteGoals]     = useState(false);
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);
  const [deleting, setDeleting]                   = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const [userRes, statsRes] = await Promise.all([
          api.get('/auth/me'),
          api.get('/user/stats'),
        ]);
        setUser(userRes.data);
        setStats(statsRes.data);
      } catch (err) {
        setError('Failed to load profile.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleDeleteAllGoals = async () => {
    setDeleting(true);
    try {
      await api.delete('/goals/all');
      setShowDeleteGoals(false);
      navigate('/app/dashboard');
    } catch (err) {
      alert('Failed to delete goals.');
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      await api.delete('/user/account');
      logout();
      navigate('/');
    } catch (err) {
      alert('Failed to delete account.');
    } finally {
      setDeleting(false);
    }
  };

  // check if a badge+tier is earned
  const isEarned = (id, tier) => {
    if (!user?.badges) return false;
    return user.badges.some(b => b.id === id && b.tier === tier);
  };

  const earnedCount = ALL_BADGES.filter(b => isEarned(b.id, b.tier)).length;

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    : '';

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

  return (
    <div style={{ background: '#080910', minHeight: '100vh', padding: isMobile ? '18px 16px' : '28px 32px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ width: '100%', maxWidth: '600px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

        {/* header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: isMobile ? '18px' : '20px', fontWeight: 800, color: '#dde0f0', marginBottom: '4px' }}>Profile</h1>
            <p style={{ fontSize: '12px', color: '#444466' }}>Your learning identity</p>
          </div>
          <button
            onClick={handleLogout}
            style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: isMobile ? '8px 12px' : '9px 16px', borderRadius: '10px', background: 'rgba(255,102,85,0.06)', border: '1px solid rgba(255,102,85,0.18)', color: '#ff6655', fontSize: isMobile ? '12px' : '13px', fontWeight: 500, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,102,85,0.1)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,102,85,0.06)'}
          >
            ⎋ Logout
          </button>
        </div>

        {/* profile card — read only */}
        <div style={{ background: '#0e0f1c', border: '1px solid #1a1a2e', borderRadius: '18px', padding: isMobile ? '18px' : '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '14px' : '20px' }}>
            <div style={{ width: isMobile ? '58px' : '72px', height: isMobile ? '58px' : '72px', borderRadius: '18px', background: 'linear-gradient(135deg, rgba(108,95,255,0.2), rgba(68,136,255,0.1))', border: '2px solid rgba(108,95,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Syne, sans-serif', fontSize: isMobile ? '22px' : '28px', fontWeight: 800, color: '#8878ff', boxShadow: '0 0 28px rgba(108,95,255,0.2)', flexShrink: 0 }}>
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <div style={{ fontFamily: 'Syne, sans-serif', fontSize: isMobile ? '16px' : '20px', fontWeight: 800, color: '#dde0f0' }}>{user?.name}</div>
              <div style={{ fontSize: isMobile ? '12px' : '13px', color: '#5a5a88' }}>{user?.email}</div>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '10px', color: '#333355', background: '#0a0b18', border: '1px solid #1a1a2e', borderRadius: '6px', padding: '3px 10px', display: 'inline-block' }}>
                Member since {memberSince}
              </div>
            </div>
          </div>
        </div>

        {/* stats */}
        <div style={{ background: '#0e0f1c', border: '1px solid #1a1a2e', borderRadius: '18px', padding: isMobile ? '16px' : '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <p style={{ fontFamily: 'Syne, sans-serif', fontSize: '14px', fontWeight: 700, color: '#dde0f0' }}>Learning Stats</p>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(3, 1fr)' : 'repeat(5, 1fr)', gap: '10px' }}>
            {[
              { value: stats?.totalGoals      ?? 0, label: 'Goals',       color: '#6c5fff' },
              { value: stats?.completedGoals  ?? 0, label: 'Completed',   color: '#22cc88' },
              { value: stats?.totalResources  ?? 0, label: 'Resources',   color: '#4488ff' },
              { value: `🔥 ${stats?.currentStreak ?? 0}`, label: isMobile ? 'Streak' : 'Day Streak', color: '#ffaa33' },
              { value: stats?.longestStreak   ?? 0, label: 'Best Streak', color: '#ff6655' },
            ].map((s, i) => (
              <div key={i} style={{ padding: isMobile ? '12px 8px' : '16px 12px', background: '#13142a', border: '1px solid #1e1e35', borderRadius: '14px', display: 'flex', flexDirection: 'column', gap: '5px', alignItems: 'center', textAlign: 'center' }}>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: isMobile ? '18px' : '22px', fontWeight: 800, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: isMobile ? '10px' : '11px', color: '#5a5a88' }}>{s.label}</div>
              </div>
            ))}
            {/* badges count — only on mobile (6th stat) */}
            {isMobile && (
              <div style={{ padding: '12px 8px', background: '#13142a', border: '1px solid #1e1e35', borderRadius: '14px', display: 'flex', flexDirection: 'column', gap: '5px', alignItems: 'center', textAlign: 'center' }}>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '18px', fontWeight: 800, color: '#8878ff' }}>{earnedCount}</div>
                <div style={{ fontSize: '10px', color: '#5a5a88' }}>Badges</div>
              </div>
            )}
          </div>
        </div>

        {/* badges */}
        <div style={{ background: '#0e0f1c', border: '1px solid #1a1a2e', borderRadius: '18px', padding: isMobile ? '16px' : '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <p style={{ fontFamily: 'Syne, sans-serif', fontSize: '14px', fontWeight: 700, color: '#dde0f0' }}>Badges</p>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: isMobile ? '9px' : '10px', color: '#444466', background: '#13142a', border: '1px solid #1e1e35', borderRadius: '20px', padding: '3px 10px' }}>
              {earnedCount} / {ALL_BADGES.length} earned
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(4, 1fr)' : 'repeat(6, 1fr)', gap: '8px' }}>
            {ALL_BADGES.map((b, i) => {
              const meta    = BADGE_META[b.id];
              const earned  = isEarned(b.id, b.tier);
              return (
                <div key={i} style={{ padding: isMobile ? '10px 6px' : '14px 10px', borderRadius: '14px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', border: `1px solid ${earned ? meta.border : '#1e1e35'}`, background: earned ? '#13142a' : 'rgba(255,255,255,0.015)', opacity: earned ? 1 : 0.35, filter: earned ? 'none' : 'grayscale(1)', transition: earned ? 'transform 0.15s' : 'none', cursor: earned ? 'default' : 'default', textAlign: 'center' }}
                  onMouseEnter={e => { if (earned) e.currentTarget.style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={e => { if (earned) e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                  <span style={{ fontSize: isMobile ? '20px' : '26px' }}>{meta.icon}</span>
                  <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: isMobile ? '7px' : '8px', fontWeight: 700, color: earned ? meta.color : '#3a3a5a', lineHeight: 1.3 }}>{meta.name}</div>
                  <div style={{ fontSize: isMobile ? '7px' : '8px', color: earned ? meta.color : '#252535', opacity: earned ? 0.7 : 1 }}>
                    {earned ? TIER_LABELS[b.tier] : '🔒'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* danger zone */}
        <div style={{ background: '#0e0f1c', border: '1px solid rgba(255,102,85,0.15)', borderRadius: '18px', padding: isMobile ? '16px' : '24px' }}>
          <p style={{ fontFamily: 'Syne, sans-serif', fontSize: '14px', fontWeight: 700, color: '#ff6655', marginBottom: '4px' }}>Danger Zone</p>
          <p style={{ fontSize: '12px', color: '#5a5a88', marginBottom: '16px' }}>Permanent actions that cannot be undone.</p>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setShowDeleteGoals(true)}
              style={{ padding: '9px 18px', borderRadius: '10px', background: 'rgba(255,102,85,0.07)', border: '1px solid rgba(255,102,85,0.2)', color: '#ff6655', fontSize: isMobile ? '12px' : '13px', fontWeight: 500, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,102,85,0.12)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,102,85,0.07)'}
            >Delete All Goals</button>
            <button
              onClick={() => setShowDeleteAccount(true)}
              style={{ padding: '9px 18px', borderRadius: '10px', background: 'rgba(255,102,85,0.12)', border: '1px solid rgba(255,102,85,0.28)', color: '#ff6655', fontSize: isMobile ? '12px' : '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,102,85,0.18)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,102,85,0.12)'}
            >Delete Account</button>
          </div>
        </div>

      </div>

      {/* delete goals confirm modal */}
      {showDeleteGoals && (
        <div onClick={() => setShowDeleteGoals(false)} style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#0e0f1c', border: '1px solid rgba(255,102,85,0.2)', borderRadius: '18px', padding: '28px', width: '100%', maxWidth: '380px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <p style={{ fontFamily: 'Syne, sans-serif', fontSize: '16px', fontWeight: 700, color: '#dde0f0', marginBottom: '8px' }}>Delete All Goals?</p>
              <p style={{ fontSize: '13px', color: '#5a5a88', lineHeight: 1.6 }}>This will permanently delete <strong style={{ color: '#ff6655' }}>all your goals and resources</strong>. This cannot be undone.</p>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setShowDeleteGoals(false)} style={{ flex: 1, height: '42px', borderRadius: '10px', background: 'transparent', border: '1px solid #1e1e35', fontSize: '13px', fontWeight: 500, color: '#5a5a88', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>Cancel</button>
              <button onClick={handleDeleteAllGoals} disabled={deleting} style={{ flex: 1, height: '42px', borderRadius: '10px', background: 'rgba(255,102,85,0.15)', border: '1px solid rgba(255,102,85,0.3)', fontSize: '13px', fontWeight: 600, color: '#ff6655', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
                {deleting ? 'Deleting...' : 'Yes, Delete All'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* delete account confirm modal */}
      {showDeleteAccount && (
        <div onClick={() => setShowDeleteAccount(false)} style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#0e0f1c', border: '1px solid rgba(255,102,85,0.2)', borderRadius: '18px', padding: '28px', width: '100%', maxWidth: '380px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <p style={{ fontFamily: 'Syne, sans-serif', fontSize: '16px', fontWeight: 700, color: '#ff6655', marginBottom: '8px' }}>Delete Account?</p>
              <p style={{ fontSize: '13px', color: '#5a5a88', lineHeight: 1.6 }}>This will permanently delete <strong style={{ color: '#ff6655' }}>your account, all goals, and all resources</strong>. There is no going back.</p>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setShowDeleteAccount(false)} style={{ flex: 1, height: '42px', borderRadius: '10px', background: 'transparent', border: '1px solid #1e1e35', fontSize: '13px', fontWeight: 500, color: '#5a5a88', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>Cancel</button>
              <button onClick={handleDeleteAccount} disabled={deleting} style={{ flex: 1, height: '42px', borderRadius: '10px', background: 'rgba(255,102,85,0.15)', border: '1px solid rgba(255,102,85,0.3)', fontSize: '13px', fontWeight: 600, color: '#ff6655', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
                {deleting ? 'Deleting...' : 'Yes, Delete Account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;