import { useEffect, useState } from 'react';
import api from '../services/api';

/* ─────────────────────────────────────────────
   BADGE DEFINITIONS  (matches checkBadges.js)
───────────────────────────────────────────── */
const ALL_BADGES = [
  { id: 'first_step',      emoji: '🎯', name: 'First Step',      maxTier: 1, color: '#6c5fff', glow: 'rgba(108,95,255,0.4)' },
  { id: 'resource_hunter', emoji: '📚', name: 'Resource Hunter', maxTier: 3, color: '#4488ff', glow: 'rgba(68,136,255,0.4)'  },
  { id: 'finisher',        emoji: '⚡', name: 'Finisher',        maxTier: 3, color: '#ff6655', glow: 'rgba(255,102,85,0.4)'  },
  { id: 'streak',          emoji: '🔥', name: 'Streak Master',   maxTier: 3, color: '#ffaa33', glow: 'rgba(255,170,51,0.4)'  },
  { id: 'goal_crusher',    emoji: '🎓', name: 'Goal Crusher',    maxTier: 3, color: '#ffaa33', glow: 'rgba(255,170,51,0.5)'  },
  { id: 'ahead_of_time',   emoji: '⏰', name: 'Ahead of Time',   maxTier: 2, color: '#22ddaa', glow: 'rgba(34,221,170,0.4)'  },
];

const TIER_LABELS = { 1: 'I', 2: 'II', 3: 'III' };

/* ─────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────── */
function getUserBadgeTier(earnedBadges, id) {
  const found = earnedBadges.filter(b => b.id === id);
  if (!found.length) return 0;
  return Math.max(...found.map(b => b.tier));
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { weekday: 'short' });
}

function getStatusStyle(status) {
  if (status === 'done')        return { bg: 'rgba(34,204,136,0.1)', border: 'rgba(34,204,136,0.25)', color: '#22cc88', label: 'DONE ✓' };
  if (status === 'in-progress') return { bg: 'rgba(108,95,255,0.1)', border: 'rgba(108,95,255,0.25)', color: '#8878ff', label: 'IN PROGRESS' };
  return                               { bg: 'rgba(90,90,136,0.1)',  border: 'rgba(90,90,136,0.2)',   color: '#5a5a88', label: 'SAVED' };
}

/* ─────────────────────────────────────────────
   INLINE CSS
───────────────────────────────────────────── */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Clash+Display:wght@400;500;600;700&family=Cabinet+Grotesk:wght@400;500;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');

.pp-wrap {
  padding: 32px 28px;
  max-width: 1200px;
  font-family: 'Cabinet Grotesk', sans-serif;
  color: #e8eaf6;
}

/* header */
.pp-header { display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:28px; flex-wrap:wrap; gap:12px; }
.pp-title  { font-family:'Clash Display',sans-serif; font-size:26px; font-weight:700; color:#e8eaf6; letter-spacing:-0.03em; }
.pp-sub    { font-size:13px; color:#5a5c7a; margin-top:4px; }
.pp-date   { display:flex; align-items:center; gap:6px; padding:7px 14px; border-radius:10px; background:#0e1020; border:1px solid #1e2038; font-family:'JetBrains Mono',monospace; font-size:11px; color:#5a5c7a; }

/* grids */
.pp-grid-4  { display:grid; grid-template-columns:repeat(4,1fr); gap:14px; margin-bottom:14px; }
.pp-grid-21 { display:grid; grid-template-columns:2fr 1fr;        gap:14px; margin-bottom:14px; }
.pp-grid-2  { display:grid; grid-template-columns:1fr 1fr;         gap:14px; }

/* base card */
.pp-card {
  background: #0e1020;
  border: 1px solid #151728;
  border-radius: 16px;
  padding: 20px;
  position: relative;
  overflow: hidden;
}
.pp-card-title {
  font-family:'JetBrains Mono',monospace;
  font-size:9px; font-weight:700;
  letter-spacing:0.15em; text-transform:uppercase;
  color:#5a5c7a; margin-bottom:14px;
}

/* stat cards */
.pp-stat-val { font-family:'Clash Display',sans-serif; font-size:38px; font-weight:700; line-height:1; letter-spacing:-0.03em; }
.pp-stat-lbl { font-size:12px; color:#5a5c7a; font-weight:500; margin-top:4px; }
.pp-stat-chip {
  display:inline-flex; align-items:center; gap:4px;
  padding:3px 8px; border-radius:20px;
  font-family:'JetBrains Mono',monospace; font-size:9px; font-weight:700;
  margin-top:8px;
}

/* streak card */
.pp-streak-card { background:linear-gradient(135deg,rgba(255,170,51,0.07),rgba(255,100,50,0.03)); border-color:rgba(255,170,51,0.17); }
.pp-streak-row  { display:flex; align-items:center; gap:4px; }
.pp-streak-fire { font-size:34px; }
.pp-streak-val  { font-family:'Clash Display',sans-serif; font-size:42px; font-weight:700; color:#ffaa33; line-height:1; letter-spacing:-0.03em; }

.pp-sc-row  { display:flex; align-items:center; gap:10px; margin-top:6px; }
.pp-sc-lbl  { font-size:11px; color:#5a5c7a; width:72px; flex-shrink:0; }
.pp-sc-bg   { flex:1; height:5px; background:#1a1c2e; border-radius:3px; overflow:hidden; }
.pp-sc-fill { height:100%; border-radius:3px; }
.pp-sc-val  { font-family:'JetBrains Mono',monospace; font-size:11px; font-weight:700; min-width:22px; text-align:right; }

/* ── 7-DAY CHART ── */
.pp-chart-wrap  { display:flex; align-items:flex-end; gap:5px; height:100px; }
.pp-day-col     { display:flex; flex-direction:column; align-items:center; gap:4px; flex:1; height:100%; }
.pp-day-bar-area{ flex:1; width:100%; display:flex; align-items:flex-end; justify-content:center; }
.pp-day-bar     { width:100%; max-width:32px; border-radius:5px 5px 2px 2px; transition:all 0.4s cubic-bezier(0.34,1.56,0.64,1); position:relative; cursor:default; }
.pp-day-bar:hover { filter:brightness(1.2); }
.pp-day-lbl     { font-family:'JetBrains Mono',monospace; font-size:8px; color:#5a5c7a; text-align:center; flex-shrink:0; }
.pp-chart-legend{ display:flex; gap:16px; margin-top:14px; padding-top:12px; border-top:1px solid #151728; align-items:center; flex-wrap:wrap; }
.pp-legend-item { display:flex; align-items:center; gap:5px; font-size:11px; color:#5a5c7a; }
.pp-legend-dot  { width:8px; height:8px; border-radius:2px; }

/* tooltip */
.pp-tooltip {
  position:absolute; bottom:calc(100% + 6px); left:50%; transform:translateX(-50%);
  background:#0a0c1a; border:1px solid #1e2038;
  padding:4px 8px; border-radius:6px;
  font-family:'JetBrains Mono',monospace; font-size:9px; color:#e8eaf6;
  white-space:nowrap; pointer-events:none; opacity:0; transition:opacity 0.15s;
  z-index:10;
}
.pp-day-bar:hover .pp-tooltip { opacity:1; }

/* weekly comparison */
.pp-wk-row  { display:flex; flex-direction:column; gap:6px; margin-bottom:12px; }
.pp-wk-lbl  { display:flex; justify-content:space-between; font-size:12px; color:#5a5c7a; }
.pp-wk-val  { font-family:'JetBrains Mono',monospace; font-size:12px; font-weight:700; }
.pp-wk-bg   { height:6px; background:#1a1c2e; border-radius:3px; overflow:hidden; }
.pp-wk-fill { height:100%; border-radius:3px; transition:width 0.6s ease; }
.pp-wk-chip { display:flex; align-items:center; gap:10px; padding:12px 14px; border-radius:12px; margin-top:4px; }
.pp-wk-big  { font-family:'Clash Display',sans-serif; font-size:26px; font-weight:700; }
.pp-wk-info { font-size:11px; color:#5a5c7a; line-height:1.5; }

/* goal list */
.pp-goal-list {
  display:flex; flex-direction:column; gap:8px;
  overflow-y: auto;
  max-height: 300px;
  padding-right: 6px;
  scrollbar-width: thin;
  scrollbar-color: #1e2038 transparent;
}
.pp-goal-list::-webkit-scrollbar { width:4px; }
.pp-goal-list::-webkit-scrollbar-track { background:transparent; }
.pp-goal-list::-webkit-scrollbar-thumb { background:#1e2038; border-radius:4px; }
.pp-goal-list::-webkit-scrollbar-thumb:hover { background:#2a2c48; }
.pp-goal-item {
  display:flex; align-items:center; gap:12px;
  padding:12px 14px; border-radius:12px;
  background:#0a0c1a; border:1px solid #151728;
  transition:border-color 0.2s;
}
.pp-goal-item:hover { border-color:#1e2038; }
.pp-goal-emoji { width:34px; height:34px; border-radius:9px; display:flex; align-items:center; justify-content:center; font-size:18px; flex-shrink:0; }
.pp-goal-info  { flex:1; min-width:0; }
.pp-goal-name  { font-size:13px; font-weight:700; color:#e8eaf6; margin-bottom:6px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.pp-goal-bar-row{ display:flex; align-items:center; gap:8px; }
.pp-goal-bar-bg { flex:1; height:4px; background:#1a1c2e; border-radius:2px; overflow:hidden; }
.pp-goal-bar-fill{ height:100%; border-radius:2px; transition:width 0.5s ease; }
.pp-goal-pct   { font-family:'JetBrains Mono',monospace; font-size:10px; font-weight:700; min-width:30px; text-align:right; flex-shrink:0; }
.pp-goal-days  { font-size:10px; color:#5a5c7a; margin-top:3px; }
.pp-goal-status{
  font-family:'JetBrains Mono',monospace; font-size:8px; font-weight:700;
  padding:3px 7px; border-radius:8px; border:1px solid;
  white-space:nowrap; flex-shrink:0;
}

/* badges */
.pp-badge-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:8px; }
.pp-badge-item {
  display:flex; flex-direction:column; align-items:center; gap:7px;
  padding:14px 8px; border-radius:13px; border:1px solid;
  position:relative; overflow:hidden; transition:all 0.25s cubic-bezier(0.34,1.56,0.64,1);
  cursor:default;
}
.pp-badge-item:hover { transform:translateY(-4px); }
.pp-badge-glow {
  position:absolute; inset:0;
  background:radial-gradient(ellipse at 50% 0%, var(--bc), transparent 65%);
  opacity:0.06; pointer-events:none; transition:opacity 0.25s;
}
.pp-badge-item:hover .pp-badge-glow { opacity:0.14; }
.pp-badge-ring {
  width:44px; height:44px; border-radius:50%;
  display:flex; align-items:center; justify-content:center;
  border:2px solid; font-size:22px; position:relative;
  transition:box-shadow 0.25s;
}
.pp-badge-item:hover .pp-badge-ring { box-shadow:0 0 20px var(--bs); }
.pp-badge-pulse {
  position:absolute; inset:-7px; border-radius:50%; border:1px solid;
  animation:ppPulse 2.5s ease-out infinite;
}
@keyframes ppPulse { 0%{transform:scale(1);opacity:0.5} 100%{transform:scale(1.6);opacity:0} }
.pp-badge-name { font-family:'JetBrains Mono',monospace; font-size:7.5px; font-weight:700; letter-spacing:0.07em; text-transform:uppercase; text-align:center; line-height:1.3; }
.pp-badge-tier { font-family:'JetBrains Mono',monospace; font-size:7px; opacity:0.6; }
.pp-badge-locked { opacity:0.22; filter:grayscale(1); }
.pp-badge-locked:hover { transform:none; }

/* empty / loading */
.pp-empty { text-align:center; padding:40px 20px; color:#5a5c7a; font-size:14px; }
.pp-loading{ display:flex; align-items:center; justify-content:center; height:200px; color:#5a5c7a; font-family:'JetBrains Mono',monospace; font-size:12px; }

/* responsive */
@media(max-width:1024px){
  .pp-grid-4  { grid-template-columns:repeat(2,1fr); }
  .pp-grid-21 { grid-template-columns:1fr; }
  .pp-grid-2  { grid-template-columns:1fr; }
}
@media(max-width:640px){
  .pp-wrap    { padding:20px 16px; }
  .pp-grid-4  { grid-template-columns:repeat(2,1fr); }
  .pp-badge-grid { grid-template-columns:repeat(3,1fr); }
  .pp-stat-val{ font-size:28px; }
  .pp-streak-val{ font-size:32px; }
}
`;

/* ─────────────────────────────────────────────
   COMPONENT
───────────────────────────────────────────── */
export default function ProgressPage() {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  useEffect(() => {
    const id = 'pp-styles';
    if (!document.getElementById(id)) {
      const s = document.createElement('style');
      s.id = id; s.textContent = CSS;
      document.head.appendChild(s);
    }
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/progress');
        setData(res.data);
      } catch {
        setError('Failed to load progress data.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div className="pp-loading">Loading progress…</div>;
  if (error)   return <div className="pp-empty">{error}</div>;
  if (!data)   return null;

  const { stats, streak, last7Days, weeklyComparison, goals, badges: earnedBadges } = data;

  /* ── bar chart: max units for scaling ── */
  const maxUnits = Math.max(...last7Days.map(d => d.units), 1);

  /* ── streak compare bar widths ── */
  const longestStreak = streak.longestStreak || 1;
  const currentPct    = Math.round((streak.currentStreak / longestStreak) * 100);

  /* ── weekly bar widths ── */
  const wkMax      = Math.max(weeklyComparison.thisWeek, weeklyComparison.lastWeek, 1);
  const thisWkPct  = Math.round((weeklyComparison.thisWeek / wkMax) * 100);
  const lastWkPct  = Math.round((weeklyComparison.lastWeek / wkMax) * 100);

  /* ── completion % ── */
  const resourcePct = stats.totalResources > 0
    ? Math.round((stats.completedResources / stats.totalResources) * 100)
    : 0;

  /* ── current month label ── */
  const monthLabel = new Date().toLocaleDateString('en-US', { month:'long', year:'numeric' });

  return (
    <div className="pp-wrap">

      {/* ── HEADER ── */}
      <div className="pp-header">
        <div>
          <div className="pp-title">Progress</div>
          <div className="pp-sub">Your learning journey at a glance</div>
        </div>
        <div className="pp-date">📅 {monthLabel}</div>
      </div>

      {/* ── ROW 1: 4 STAT CARDS ── */}
      <div className="pp-grid-4">

        {/* Total Goals */}
        <div className="pp-card">
          <div className="pp-card-title">Total Goals</div>
          <div className="pp-stat-val" style={{ color:'#6c5fff' }}>{stats.totalGoals}</div>
          <div className="pp-stat-lbl">{stats.completedGoals} completed</div>
          <div className="pp-stat-chip" style={{ background:'rgba(108,95,255,0.1)', color:'#8878ff' }}>
            {stats.totalGoals - stats.completedGoals} active
          </div>
        </div>

        {/* Resources */}
        <div className="pp-card">
          <div className="pp-card-title">Resources</div>
          <div className="pp-stat-val" style={{ color:'#4488ff' }}>{stats.totalResources}</div>
          <div className="pp-stat-lbl">{stats.completedResources} completed</div>
          <div className="pp-stat-chip" style={{ background:'rgba(68,136,255,0.1)', color:'#4488ff' }}>
            {resourcePct}% done
          </div>
        </div>

        {/* Study Days */}
        <div className="pp-card">
          <div className="pp-card-title">Study Days</div>
          <div className="pp-stat-val" style={{ color:'#22ddaa' }}>{stats.totalStudyDays}</div>
          <div className="pp-stat-lbl">total active days</div>
          <div className="pp-stat-chip" style={{ background:'rgba(34,221,170,0.1)', color:'#22ddaa' }}>
            {last7Days.filter(d => d.studied).length} this week
          </div>
        </div>

        {/* Streak card */}
        <div className="pp-card pp-streak-card">
          <div className="pp-card-title">Current Streak</div>
          <div className="pp-streak-row">
            <span className="pp-streak-fire">🔥</span>
            <div>
              <div className="pp-streak-val">{streak.currentStreak}</div>
              <div className="pp-stat-lbl">days in a row</div>
            </div>
          </div>
          {/* current vs longest bars */}
          <div style={{ marginTop:12 }}>
            <div className="pp-sc-row">
              <div className="pp-sc-lbl">Current</div>
              <div className="pp-sc-bg">
                <div className="pp-sc-fill" style={{ width:`${currentPct}%`, background:'linear-gradient(90deg,#ffaa33,#ff8833)' }} />
              </div>
              <div className="pp-sc-val" style={{ color:'#ffaa33' }}>{streak.currentStreak}</div>
            </div>
            <div className="pp-sc-row" style={{ marginTop:6 }}>
              <div className="pp-sc-lbl">Longest</div>
              <div className="pp-sc-bg">
                <div className="pp-sc-fill" style={{ width:'100%', background:'linear-gradient(90deg,#ff6655,#ffaa33)' }} />
              </div>
              <div className="pp-sc-val" style={{ color:'#ff6655' }}>{streak.longestStreak}</div>
            </div>
          </div>
        </div>

      </div>

      {/* ── ROW 2: 7-DAY CHART + WEEKLY COMPARISON ── */}
      <div className="pp-grid-21">

        {/* 7-day bar chart */}
        <div className="pp-card">
          <div className="pp-card-title">7-Day Activity — units completed per day</div>
          <div className="pp-chart-wrap">
            {last7Days.map((day, i) => {
              const isToday  = i === last7Days.length - 1;
              const heightPct = day.units > 0 ? Math.max((day.units / maxUnits) * 100, 10) : 6;
              const barBg = isToday
                ? 'linear-gradient(to top,#6c5fff,#22ddaa)'
                : day.studied
                  ? `linear-gradient(to top,#6c5fff,#4488ff)`
                  : '#1e2038';
              const opacity  = day.studied ? (0.6 + (day.units / maxUnits) * 0.4) : 1;
              const glow     = day.studied ? (isToday ? '0 0 16px rgba(34,221,170,0.5)' : '0 0 10px rgba(108,95,255,0.35)') : 'none';

              return (
                <div key={day.date} className="pp-day-col">
                  <div className="pp-day-bar-area">
                    <div
                      className="pp-day-bar"
                      style={{
                        height: `${heightPct}%`,
                        background: barBg,
                        opacity,
                        boxShadow: glow,
                        position: 'relative',
                      }}
                    >
                      {/* tooltip */}
                      <div className="pp-tooltip">
                        {day.studied ? `${day.units} unit${day.units !== 1 ? 's' : ''}` : 'Not studied'}
                      </div>
                    </div>
                  </div>
                  <div className="pp-day-lbl" style={{ color: isToday ? '#22ddaa' : undefined, fontWeight: isToday ? 700 : undefined }}>
                    {isToday ? 'Today' : formatDate(day.date)}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pp-chart-legend">
            <div className="pp-legend-item">
              <div className="pp-legend-dot" style={{ background:'linear-gradient(135deg,#6c5fff,#4488ff)' }} />
              Studied
            </div>
            <div className="pp-legend-item">
              <div className="pp-legend-dot" style={{ background:'#1e2038' }} />
              Missed
            </div>
            <div className="pp-legend-item">
              <div className="pp-legend-dot" style={{ background:'linear-gradient(135deg,#6c5fff,#22ddaa)' }} />
              Today
            </div>
            <div style={{ marginLeft:'auto', fontFamily:'JetBrains Mono,monospace', fontSize:10, color:'#5a5c7a' }}>
              Hover bar for units
            </div>
          </div>
        </div>

        {/* weekly comparison */}
        <div className="pp-card">
          <div className="pp-card-title">Weekly Comparison</div>

          <div className="pp-wk-row">
            <div className="pp-wk-lbl">
              <span>This week</span>
              <span className="pp-wk-val" style={{ color:'#6c5fff' }}>{weeklyComparison.thisWeek} units</span>
            </div>
            <div className="pp-wk-bg">
              <div className="pp-wk-fill" style={{ width:`${thisWkPct}%`, background:'linear-gradient(90deg,#6c5fff,#4488ff)' }} />
            </div>
          </div>

          <div className="pp-wk-row">
            <div className="pp-wk-lbl">
              <span>Last week</span>
              <span className="pp-wk-val" style={{ color:'#5a5c7a' }}>{weeklyComparison.lastWeek} units</span>
            </div>
            <div className="pp-wk-bg">
              <div className="pp-wk-fill" style={{ width:`${lastWkPct}%`, background:'#1e2038' }} />
            </div>
          </div>

          {/* change chip */}
          {weeklyComparison.improved ? (
            <div className="pp-wk-chip" style={{ background:'rgba(34,221,170,0.07)', border:'1px solid rgba(34,221,170,0.15)', borderRadius:12 }}>
              <span style={{ fontSize:20 }}>📈</span>
              <div>
                <div className="pp-wk-big" style={{ color:'#22ddaa' }}>+{weeklyComparison.change}%</div>
                <div className="pp-wk-info">better than last week<br /><span style={{ color:'#22ddaa', fontWeight:700 }}>Keep it up!</span></div>
              </div>
            </div>
          ) : (
            <div className="pp-wk-chip" style={{ background:'rgba(255,102,85,0.07)', border:'1px solid rgba(255,102,85,0.15)', borderRadius:12 }}>
              <span style={{ fontSize:20 }}>📉</span>
              <div>
                <div className="pp-wk-big" style={{ color:'#ff6655' }}>{weeklyComparison.change}%</div>
                <div className="pp-wk-info">vs last week<br /><span style={{ color:'#ff6655', fontWeight:700 }}>Push harder!</span></div>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* ── ROW 3: GOAL BREAKDOWN + BADGES ── */}
      <div className="pp-grid-2">

        {/* goal breakdown */}
        <div className="pp-card">
          <div className="pp-card-title">Goal Breakdown</div>

          {goals.length === 0 ? (
            <div className="pp-empty">No goals yet. Create one on the dashboard!</div>
          ) : (
            <div className="pp-goal-list">
              {goals.map(goal => {
                const s = getStatusStyle(goal.status);
                /* gradient by status */
                const fillBg = goal.status === 'done'
                  ? 'linear-gradient(90deg,#22cc88,#22ddaa)'
                  : goal.progress > 60
                    ? 'linear-gradient(90deg,#6c5fff,#22ddaa)'
                    : 'linear-gradient(90deg,#6c5fff,#4488ff)';

                return (
                  <div key={goal._id} className="pp-goal-item">
                    <div className="pp-goal-emoji" style={{ background: `${s.bg}` }}>{goal.emoji}</div>
                    <div className="pp-goal-info">
                      <div className="pp-goal-name">{goal.name}</div>
                      <div className="pp-goal-bar-row">
                        <div className="pp-goal-bar-bg">
                          <div className="pp-goal-bar-fill" style={{ width:`${goal.progress}%`, background: fillBg }} />
                        </div>
                        <div className="pp-goal-pct" style={{ color: goal.status === 'done' ? '#22cc88' : '#6c5fff' }}>
                          {goal.progress}%
                        </div>
                      </div>
                      {goal.daysRemaining !== null && goal.status !== 'done' && (
                        <div className="pp-goal-days">
                          {goal.daysRemaining > 0
                            ? `${goal.daysRemaining} days left`
                            : goal.daysRemaining === 0
                              ? 'Due today!'
                              : `${Math.abs(goal.daysRemaining)} days overdue`}
                        </div>
                      )}
                    </div>
                    <div className="pp-goal-status" style={{ background:s.bg, borderColor:s.border, color:s.color }}>
                      {s.label}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* badges */}
        <div className="pp-card">
          <div className="pp-card-title">
            Badges — {earnedBadges.length} earned
          </div>

          <div className="pp-badge-grid">
            {ALL_BADGES.map(badge => {
              const tier    = getUserBadgeTier(earnedBadges, badge.id);
              const earned  = tier > 0;
              const locked  = !earned;

              return (
                <div
                  key={badge.id}
                  className={`pp-badge-item${locked ? ' pp-badge-locked' : ''}`}
                  style={{
                    background: earned ? `rgba(${badge.color.slice(1).match(/../g).map(h=>parseInt(h,16)).join(',')},0.04)` : '#0e1020',
                    borderColor: earned ? `${badge.color}33` : '#151728',
                    '--bc': `${badge.color}44`,
                    '--bs': `${badge.color}55`,
                  }}
                  title={locked ? 'Locked' : `${badge.name} · Tier ${TIER_LABELS[tier]}`}
                >
                  <div className="pp-badge-glow" />
                  <div
                    className="pp-badge-ring"
                    style={{
                      background: earned ? `${badge.color}14` : '#1a1c2e',
                      borderColor: earned ? `${badge.color}55` : '#1e2038',
                      boxShadow: earned ? `0 0 18px ${badge.glow}` : 'none',
                    }}
                  >
                    {badge.emoji}
                    {earned && (
                      <div className="pp-badge-pulse" style={{ borderColor:`${badge.color}44` }} />
                    )}
                  </div>
                  <div className="pp-badge-name" style={{ color: earned ? badge.color : '#5a5c7a' }}>
                    {badge.name}
                  </div>
                  {earned && (
                    <div className="pp-badge-tier" style={{ color: badge.color }}>
                      Tier {TIER_LABELS[tier]}
                    </div>
                  )}
                  {locked && (
                    <div className="pp-badge-tier">Locked</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}