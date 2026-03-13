import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import useWindowSize from '../hooks/useWindowSize';
import api from '../services/api';
import GoalForm from './GoalForm';

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
};

const getDaysRemaining = (goal) => {
  if (!goal.deadline) return null;
  const diff = new Date(goal.deadline) - new Date();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

const getStatus = (goal) => {
  const daysRemaining = getDaysRemaining(goal);
  if (goal.progress === 100) return 'completed';
  if (daysRemaining !== null && daysRemaining <= 3) return 'due-soon';
  return 'in-progress';
};

const statusConfig = {
  'in-progress': { label: 'In Progress', color: '#8878ff', bg: 'rgba(108,95,255,0.12)', border: 'rgba(108,95,255,0.2)' },
  'due-soon':    { label: 'Due Soon',    color: '#ffaa33', bg: 'rgba(255,170,51,0.12)',  border: 'rgba(255,170,51,0.2)' },
  'completed':   { label: 'Completed',   color: '#22cc88', bg: 'rgba(34,204,136,0.12)', border: 'rgba(34,204,136,0.2)' },
};

const barColor = {
  'in-progress': 'linear-gradient(90deg, #6c5fff, #4488ff)',
  'due-soon':    'linear-gradient(90deg, #ffaa33, #ff6655)',
  'completed':   'linear-gradient(90deg, #22cc88, #4488ff)',
};

// ── Goal Card ──
const GoalCard = ({ goal, onClick }) => {
  const daysRemaining = getDaysRemaining(goal); 
  const status = getStatus(goal);
  const cfg = statusConfig[status];
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: '#0e0f1c',
        border: `1px solid ${hovered ? 'rgba(108,95,255,0.3)' : '#1a1a2e'}`,
        borderRadius: '14px', padding: '18px',
        cursor: 'pointer',
        transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
        transition: 'all 0.15s',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
        <span style={{ fontSize: '24px' }}>{goal.emoji || '🎯'}</span>
        <span style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: '9.5px', fontWeight: 700,
          padding: '3px 8px', borderRadius: '20px',
          color: cfg.color, background: cfg.bg,
          border: `1px solid ${cfg.border}`,
        }}>{cfg.label}</span>
      </div>
      <p style={{ fontSize: '14px', fontWeight: 600, color: '#dde0f0', marginBottom: '4px' }}>
        {goal.name}
      </p>
      <p style={{ fontSize: '11px', color: '#444466', marginBottom: '14px' }}>
      {goal.resourceCount || 0} resource{(goal.resourceCount || 0) !== 1 ? 's' : ''}
      {daysRemaining !== null
        ? daysRemaining <= 0
          ? ' · overdue'
          : ` · ${daysRemaining} day${daysRemaining !== 1 ? 's' : ''} left`
        : ' · no deadline'}
      </p>
      <div style={{ height: '4px', background: '#1a1a2e', borderRadius: '2px', overflow: 'hidden', marginBottom: '8px' }}>
        <div style={{
          height: '100%', borderRadius: '2px',
          width: `${goal.progress || 0}%`,
          background: barColor[status],
          transition: 'width 0.6s ease',
        }} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', color: '#666688' }}>
          {Math.round(goal.progress || 0)}%
        </span>
        <span style={{ fontSize: '10px', color: '#333355' }}>
          {goal.completedResources || 0} of {goal.resourceCount || 0} done
        </span>
      </div>
    </div>
  );
};

// ── Add Goal Card ──
const AddGoalCard = ({ onClick }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? 'rgba(108,95,255,0.04)' : '#0a0b18',
        border: `1px dashed ${hovered ? 'rgba(108,95,255,0.4)' : '#1e1e35'}`,
        borderRadius: '14px', padding: '18px',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: '10px', textAlign: 'center',
        cursor: 'pointer', minHeight: '168px',
        transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
        transition: 'all 0.2s',
      }}
    >
      <div style={{
        width: '36px', height: '36px', borderRadius: '10px',
        background: hovered ? 'rgba(108,95,255,0.18)' : 'rgba(108,95,255,0.1)',
        border: `1px solid ${hovered ? 'rgba(108,95,255,0.4)' : 'rgba(108,95,255,0.2)'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '20px', transition: 'all 0.2s',
      }}>＋</div>
      <p style={{ fontSize: '13px', fontWeight: 600, color: '#5a5a88' }}>New Goal</p>
      <p style={{ fontSize: '11px', color: '#333355' }}>Add a new learning goal</p>
    </div>
  );
};

// ── Stat Card ──
const StatCard = ({ icon, value, label, color, ring }) => (
  <div style={{
    background: '#0e0f1c', border: '1px solid #1a1a2e',
    borderRadius: '12px', padding: '16px 18px',
    display: 'flex', alignItems: 'center', gap: '14px',
  }}>
    {ring ? (
      <div style={{ width: '40px', height: '40px', flexShrink: 0, position: 'relative' }}>
        <svg style={{ transform: 'rotate(-90deg)' }} width="40" height="40" viewBox="0 0 40 40">
          <circle fill="none" stroke="#1a1a2e" strokeWidth="3" cx="20" cy="20" r="15.9" />
          <circle fill="none" stroke="#22cc88" strokeWidth="3" strokeLinecap="round"
            cx="20" cy="20" r="15.9" strokeDasharray="100"
            strokeDashoffset={100 - Math.min(value, 100)} />
        </svg>
        <div style={{
          position: 'absolute', inset: 0, display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          fontFamily: 'JetBrains Mono, monospace', fontSize: '9px', fontWeight: 700, color: '#22cc88',
        }}>{Math.round(value)}%</div>
      </div>
    ) : (
      <div style={{
        width: '40px', height: '40px', borderRadius: '10px', flexShrink: 0,
        background: `${color}18`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px',
      }}>{icon}</div>
    )}
    <div>
      <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '20px', fontWeight: 700, color, marginBottom: '2px' }}>
        {ring ? `${Math.round(value)}%` : value}
      </div>
      <div style={{ fontSize: '10.5px', color: '#444466' }}>{label}</div>
    </div>
  </div>
);

// ── Filter Pill ──
const FilterPill = ({ label, active, onClick }) => {
  const [hovered, setHovered] = useState(false);
  const colors = {
    'All':         { color: '#9080ff', bg: 'rgba(108,95,255,0.12)', border: 'rgba(108,95,255,0.25)' },
    'In Progress': { color: '#8878ff', bg: 'rgba(108,95,255,0.12)', border: 'rgba(108,95,255,0.25)' },
    'Due Soon':    { color: '#ffaa33', bg: 'rgba(255,170,51,0.12)',  border: 'rgba(255,170,51,0.25)' },
    'Completed':   { color: '#22cc88', bg: 'rgba(34,204,136,0.12)', border: 'rgba(34,204,136,0.25)' },
  };
  const cfg = colors[label];
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: '5px 12px', borderRadius: '20px',
        fontSize: '11.5px', fontWeight: 600,
        cursor: 'pointer', transition: 'all 0.15s', whiteSpace: 'nowrap',
        color: active || hovered ? cfg.color : '#444466',
        background: active ? cfg.bg : 'transparent',
        border: `1px solid ${active ? cfg.border : hovered ? cfg.border : '#1a1a2e'}`,
      }}
    >{label}</div>
  );
};

// ── DASHBOARD ──
const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const width = useWindowSize();

  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1024;

  const [goals, setGoals]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState('All');
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const fetchGoals = async () => {
      try {
        const res = await api.get('/goals');
        setGoals(res.data);
      } catch (err) {
        console.error('Failed to fetch goals:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchGoals();
  }, []);

  const filteredGoals = goals.filter(goal => {
    const status = getStatus(goal);
    if (filter === 'All')         return true;
    if (filter === 'In Progress') return status === 'in-progress';
    if (filter === 'Due Soon')    return status === 'due-soon';
    if (filter === 'Completed')   return status === 'completed';
    return true;
  });

  const activeCount    = goals.filter(g => getStatus(g) !== 'completed').length;
  const totalResources = goals.reduce((sum, g) => sum + (g.resourceCount || 0), 0);
  const avgProgress    = goals.length
    ? goals.reduce((sum, g) => sum + (g.progress || 0), 0) / goals.length
    : 0;

  if (loading) return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#080910', minHeight: '100vh' }}>
      <div style={{ width: '32px', height: '32px', borderRadius: '50%', border: '2px solid #6c5fff', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  );

  return (
    <div style={{
      padding: isMobile ? '20px 16px' : '28px 32px',
      display: 'flex', flexDirection: 'column', gap: '24px',
      minHeight: '100vh', background: '#080910',
    }}>

      {/* header */}
      <div style={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        alignItems: isMobile ? 'flex-start' : 'center',
        justifyContent: 'space-between',
        gap: isMobile ? '12px' : '0',
      }}>
        <div>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: isMobile ? '18px' : '20px', fontWeight: 700, color: '#dde0f0' }}>
            {getGreeting()}, {user?.name?.split(' ')[0]}
          </h1>
          <p style={{ fontSize: '12px', color: '#444466', marginTop: '3px' }}>
            {goals.length > 0
              ? `You have ${activeCount} active goal${activeCount !== 1 ? 's' : ''}. Keep going!`
              : "Let's set up your first learning goal."}
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          style={{
            padding: '9px 18px',
            background: 'linear-gradient(135deg, #6c5fff, #5a4ee8)',
            borderRadius: '10px', fontSize: '13px', fontWeight: 600,
            color: 'white', border: 'none', cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(108,95,255,0.28)',
            alignSelf: isMobile ? 'flex-start' : 'auto',
          }}
        >+ New Goal</button>
      </div>

      {/* stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr 1fr' : isTablet ? '1fr 1fr' : 'repeat(4, 1fr)',
        gap: '12px',
      }}>
        <StatCard icon="🎯" value={goals.length}            label="Total Goals"     color="#6c5fff" />
        <StatCard icon="📚" value={totalResources}           label="Total Resources" color="#4488ff" />
        <StatCard ring      value={avgProgress}              label="Avg Progress"    color="#22cc88" />
        <StatCard icon="🔥" value={user?.currentStreak || 0} label="Day Streak"      color="#ffaa33" />
      </div>

      {/* goals */}
      {goals.length === 0 ? (
        <div style={{
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          padding: '60px 20px', textAlign: 'center', gap: '12px',
          background: '#0a0b18', border: '1px dashed #1a1a2e',
          borderRadius: '16px',
        }}>
          <span style={{ fontSize: '36px', opacity: 0.3 }}>🎯</span>
          <p style={{ fontFamily: 'Syne, sans-serif', fontSize: '16px', fontWeight: 700, color: '#444466' }}>
            No goals yet
          </p>
          <p style={{ fontSize: '12px', color: '#2a2a44', maxWidth: '280px', lineHeight: 1.6 }}>
            Create your first learning goal to get started.
            Add resources, track your progress and build your streak.
          </p>
          <button
            onClick={() => setShowForm(true)}
            style={{
              marginTop: '4px', padding: '10px 22px',
              background: 'linear-gradient(135deg, #6c5fff, #5a4ee8)',
              borderRadius: '10px', fontSize: '13px', fontWeight: 600,
              color: 'white', border: 'none', cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(108,95,255,0.25)',
            }}
          >+ Create your first goal</button>
        </div>
      ) : (
        <div>
          {/* section header + filter */}
          <div style={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            alignItems: isMobile ? 'flex-start' : 'center',
            justifyContent: 'space-between',
            marginBottom: '14px', gap: '10px',
          }}>
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '15px', fontWeight: 700, color: '#dde0f0', whiteSpace: 'nowrap' }}>
              Your Goals
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
              {['All', 'In Progress', 'Due Soon', 'Completed'].map(f => (
                <FilterPill key={f} label={f} active={filter === f} onClick={() => setFilter(f)} />
              ))}
            </div>
          </div>

          {/* grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : isTablet ? '1fr 1fr' : 'repeat(3, 1fr)',
            gap: '12px',
          }}>
            {filteredGoals.map(goal => (
              <GoalCard
                key={goal._id}
                goal={goal}
                onClick={() => navigate(`/app/goals/${goal._id}`)}
              />
            ))}
            {filter === 'All' && (
              <AddGoalCard onClick={() => setShowForm(true)} />
            )}
          </div>

          {filteredGoals.length === 0 && (
            <div style={{
              padding: '40px', textAlign: 'center',
              background: '#0a0b18', border: '1px dashed #1a1a2e', borderRadius: '14px',
            }}>
              <p style={{ fontSize: '13px', color: '#333355' }}>
                No {filter.toLowerCase()} goals found.
              </p>
            </div>
          )}
        </div>
      )}

      {/* goal form modal */}
      {showForm && (
        <GoalForm
          onClose={() => setShowForm(false)}
          onCreated={(newGoal) => setGoals(prev => [newGoal, ...prev])}
        />
      )}

    </div>
  );
};

export default Dashboard;