import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import useWindowSize from '../hooks/useWindowSize';

const typeConfig = {
  video:   { icon: '🎬', color: '#ff6655', bg: 'rgba(255,102,85,0.1)',   border: 'rgba(255,102,85,0.2)'   },
  docs:    { icon: '📄', color: '#4488ff', bg: 'rgba(68,136,255,0.1)',   border: 'rgba(68,136,255,0.2)'   },
  project: { icon: '🛠️', color: '#22cc88', bg: 'rgba(34,204,136,0.1)',  border: 'rgba(34,204,136,0.2)'   },
  article: { icon: '📰', color: '#8878ff', bg: 'rgba(108,95,255,0.1)',   border: 'rgba(108,95,255,0.2)'   },
  other:   { icon: '📦', color: '#9090bb', bg: 'rgba(144,144,187,0.1)',  border: 'rgba(144,144,187,0.2)'  },
};

const statusConfig = {
  saved:         { label: 'Saved',       color: '#9090bb', bg: 'rgba(144,144,187,0.1)', border: 'rgba(144,144,187,0.2)' },
  'in-progress': { label: 'In Progress', color: '#8878ff', bg: 'rgba(108,95,255,0.1)',  border: 'rgba(108,95,255,0.2)' },
  done:          { label: '✓ Done',      color: '#22cc88', bg: 'rgba(34,204,136,0.1)',  border: 'rgba(34,204,136,0.2)' },
};

const SORT_OPTIONS = [
  { label: 'Recent',      value: 'recent'   },
  { label: 'Oldest',      value: 'oldest'   },
  { label: 'A → Z',       value: 'az'       },
  { label: 'Z → A',       value: 'za'       },
  { label: 'Progress',    value: 'progress' },
];

const ResourcesPage = () => {
  const navigate = useNavigate();
  const width = useWindowSize();
  const isMobile = width < 768;

  const [resources, setResources] = useState([]);
  const [goals, setGoals]         = useState({});
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');

  const [search, setSearch]       = useState('');
  const [filter, setFilter]       = useState('all');
  const [sort, setSort]           = useState('recent');
  const [showSort, setShowSort]   = useState(false);

  // fetch all resources + goals map
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resRes, goalsRes] = await Promise.all([
          api.get('/resource'),
          api.get('/goals'),
        ]);
        setResources(resRes.data);
        // build goalId → goal map for quick lookup
        const goalsMap = {};
        goalsRes.data.forEach(g => { goalsMap[g._id] = g; });
        setGoals(goalsMap);
      } catch (err) {
        setError('Failed to load resources.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // filter + search + sort
  const filtered = useMemo(() => {
    let list = [...resources];

    // filter by status
    if (filter !== 'all') list = list.filter(r => r.status === filter);

    // search by title
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(r => r.title.toLowerCase().includes(q));
    }

    // sort
    switch (sort) {
      case 'oldest':   list.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)); break;
      case 'az':       list.sort((a, b) => a.title.localeCompare(b.title)); break;
      case 'za':       list.sort((a, b) => b.title.localeCompare(a.title)); break;
      case 'progress': list.sort((a, b) => {
        const pa = a.totalUnits > 0 ? a.doneUnits / a.totalUnits : 0;
        const pb = b.totalUnits > 0 ? b.doneUnits / b.totalUnits : 0;
        return pb - pa;
      }); break;
      default: list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    return list;
  }, [resources, filter, search, sort]);

  // counts
  const counts = useMemo(() => ({
    all:         resources.length,
    saved:       resources.filter(r => r.status === 'saved').length,
    'in-progress': resources.filter(r => r.status === 'in-progress').length,
    done:        resources.filter(r => r.status === 'done').length,
  }), [resources]);

  const pill = (label, color, bg, border) => (
    <span style={{ padding: '2px 8px', borderRadius: '20px', fontFamily: 'JetBrains Mono, monospace', fontSize: isMobile ? '8px' : '9px', fontWeight: 600, color, background: bg, border: `1px solid ${border}`, whiteSpace: 'nowrap' }}>
      {label}
    </span>
  );

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
    <><style>{`.filter-scroll::-webkit-scrollbar { display: none; }`}</style>
    <div style={{ padding: isMobile ? '18px 16px' : '28px 32px', display: 'flex', flexDirection: 'column', gap: '20px', minHeight: '100vh', background: '#080910' }}
      onClick={() => setShowSort(false)}
    >

      {/* header */}
      <div style={{ display: 'flex', alignItems: isMobile ? 'flex-start' : 'center', justifyContent: 'space-between', gap: '12px', flexDirection: isMobile ? 'column' : 'row' }}>
        <div>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: isMobile ? '18px' : '20px', fontWeight: 800, color: '#dde0f0', marginBottom: '4px' }}>Resources</h1>
          <p style={{ fontSize: '12px', color: '#444466' }}>All your learning resources across every goal</p>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ padding: '5px 12px', borderRadius: '20px', fontFamily: 'JetBrains Mono, monospace', fontSize: '10px', fontWeight: 700, color: '#8878ff', background: 'rgba(108,95,255,0.1)', border: '1px solid rgba(108,95,255,0.2)' }}>
            {counts.all} total
          </span>
          <span style={{ padding: '5px 12px', borderRadius: '20px', fontFamily: 'JetBrains Mono, monospace', fontSize: '10px', fontWeight: 700, color: '#22cc88', background: 'rgba(34,204,136,0.1)', border: '1px solid rgba(34,204,136,0.2)' }}>
            {counts.done} done
          </span>
          <span style={{ padding: '5px 12px', borderRadius: '20px', fontFamily: 'JetBrains Mono, monospace', fontSize: '10px', fontWeight: 700, color: '#ffaa33', background: 'rgba(255,170,51,0.1)', border: '1px solid rgba(255,170,51,0.2)' }}>
            {counts['in-progress']} in progress
          </span>
        </div>
      </div>

      {/* search + sort */}

    
    {/* search + sort */}
<div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: 'stretch', gap: '10px' }}>
  <div style={{ flex: 1, position: 'relative' }}>
    <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', fontSize: '13px', color: '#3a3a5a', pointerEvents: 'none' }}>🔍</span>
    <input
      value={search}
      onChange={e => setSearch(e.target.value)}
      placeholder="Search resources..."
      style={{ width: '100%', height: '42px', background: '#0e0f1c', border: '1px solid #1e1e35', borderRadius: '12px', padding: '0 14px 0 38px', fontSize: '13px', color: '#dde0f0', fontFamily: 'Inter, sans-serif', outline: 'none' }}
      onFocus={e => e.target.style.borderColor = 'rgba(108,95,255,0.4)'}
      onBlur={e => e.target.style.borderColor = '#1e1e35'}
    />
  </div>

  {/* sort — moves below search on mobile */}
  <div style={{ position: 'relative', flexShrink: 0, alignSelf: isMobile ? 'flex-end' : 'auto' }} onClick={e => e.stopPropagation()}>
    <button
      onClick={() => setShowSort(prev => !prev)}
      style={{ height: '42px', padding: '0 16px', background: showSort ? '#13142a' : '#0e0f1c', border: `1px solid ${showSort ? 'rgba(108,95,255,0.3)' : '#1e1e35'}`, borderRadius: '12px', fontSize: '12px', fontWeight: 500, color: showSort ? '#8878ff' : '#5a5a88', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'Inter, sans-serif', whiteSpace: 'nowrap' }}
    >
      Sort: {SORT_OPTIONS.find(o => o.value === sort)?.label} ▾
    </button>
    {showSort && (
      <div style={{ position: 'absolute', top: '48px', left: 0, background: '#0e0f1c', border: '1px solid #1e1e35', borderRadius: '12px', overflow: 'hidden', zIndex: 50, minWidth: '140px', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
        {SORT_OPTIONS.map(opt => (
          <div
            key={opt.value}
            onClick={() => { setSort(opt.value); setShowSort(false); }}
            style={{ padding: '10px 14px', fontSize: '12px', fontWeight: 500, color: sort === opt.value ? '#8878ff' : '#5a5a88', background: sort === opt.value ? 'rgba(108,95,255,0.08)' : 'transparent', cursor: 'pointer' }}
            onMouseEnter={e => { if (sort !== opt.value) e.currentTarget.style.background = '#13142a'; }}
            onMouseLeave={e => { if (sort !== opt.value) e.currentTarget.style.background = 'transparent'; }}
          >
            {opt.label}
          </div>
        ))}
      </div>
    )}
  </div>
</div>
      





        {/* sort dropdown */}
        

      {/* filter pills */}
      <div className="filter-scroll" style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '2px', msOverflowStyle: 'none', scrollbarWidth: 'none' }}>
        {[
          { key: 'all',          label: `All (${counts.all})`                          },
          { key: 'saved',        label: `Saved (${counts.saved})`                      },
          { key: 'in-progress',  label: `In Progress (${counts['in-progress']})`       },
          { key: 'done',         label: `Done (${counts.done})`                        },
        ].map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            style={{ padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 500, cursor: 'pointer', border: `1px solid ${filter === f.key ? 'rgba(108,95,255,0.3)' : '#1e1e35'}`, background: filter === f.key ? 'rgba(108,95,255,0.12)' : 'transparent', color: filter === f.key ? '#8878ff' : '#5a5a88', fontFamily: 'Inter, sans-serif', whiteSpace: 'nowrap', transition: 'all 0.15s' }}
          >{f.label}</button>
        ))}
      </div>

      {/* resource list */}
      {filtered.length === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', gap: '12px' }}>
          <span style={{ fontSize: '32px' }}>📭</span>
          <p style={{ fontSize: '14px', fontWeight: 600, color: '#3a3a5a' }}>
            {search ? 'No resources match your search' : 'No resources yet'}
          </p>
          <p style={{ fontSize: '12px', color: '#252535', textAlign: 'center' }}>
            {search ? 'Try a different search term' : 'Add resources to your goals to see them here'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {filtered.map(resource => {
            const tc   = typeConfig[resource.type]   || typeConfig.other;
            const sc   = statusConfig[resource.status] || statusConfig.saved;
            const goal = goals[resource.goalId];
            const done = resource.status === 'done';
            const pct  = resource.totalUnits > 0
              ? Math.round((resource.doneUnits / resource.totalUnits) * 100)
              : 0;

            return (
              <div
                key={resource._id}
                onClick={() => navigate(`/app/resources/${resource._id}`)}
                style={{
                  display: 'flex', alignItems: 'center', gap: isMobile ? '10px' : '14px',
                  padding: isMobile ? '12px 14px' : '14px 18px',
                  borderRadius: '14px', background: '#0e0f1c',
                  border: `1px solid ${done ? 'rgba(34,204,136,0.15)' : '#1a1a2e'}`,
                  borderLeft: done ? '3px solid rgba(34,204,136,0.3)' : '1px solid #1a1a2e',
                  cursor: 'pointer', transition: 'background 0.15s, border-color 0.15s',
                  opacity: done ? 0.7 : 1,
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#111220'; e.currentTarget.style.borderColor = '#1e1e35'; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#0e0f1c'; e.currentTarget.style.borderColor = done ? 'rgba(34,204,136,0.15)' : '#1a1a2e'; }}
              >
                {/* type icon */}
                <div style={{ width: isMobile ? '36px' : '40px', height: isMobile ? '36px' : '40px', borderRadius: '10px', background: done ? 'rgba(34,204,136,0.06)' : tc.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: isMobile ? '16px' : '18px', flexShrink: 0 }}>
                  {tc.icon}
                </div>

                {/* info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: isMobile ? '12px' : '13px', fontWeight: 600, color: done ? '#5a5a88' : '#dde0f0', marginBottom: '6px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textDecoration: done ? 'line-through' : 'none' }}>
                    {resource.title}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                    {pill(resource.type, tc.color, tc.bg, tc.border)}
                    {pill(sc.label, sc.color, sc.bg, sc.border)}
                    {goal && (
                      <span style={{ padding: '2px 8px', borderRadius: '6px', fontSize: isMobile ? '9px' : '10px', fontWeight: 500, color: '#5a5a88', background: 'rgba(144,144,187,0.08)', border: '1px solid rgba(144,144,187,0.12)', whiteSpace: 'nowrap' }}>
                        {goal.emoji || '🎯'} {goal.name}
                      </span>
                    )}
                  </div>
                </div>

                {/* right — progress */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '5px', flexShrink: 0 }}>
                  {done ? (
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '12px', fontWeight: 700, color: '#22cc88' }}>✓</span>
                  ) : resource.totalUnits > 0 ? (
                    <>
                      <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: isMobile ? '9px' : '10px', fontWeight: 700, color: '#6c5fff' }}>
                        {resource.doneUnits} / {resource.totalUnits}
                      </span>
                      <div style={{ width: isMobile ? '56px' : '80px', height: '4px', background: '#1a1a2e', borderRadius: '2px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', borderRadius: '2px', width: `${pct}%`, background: 'linear-gradient(90deg,#6c5fff,#4488ff)', transition: 'width 0.3s ease' }} />
                      </div>
                    </>
                  ) : (
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '10px', color: '#3a3a5a' }}>—</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div></>
  );
};

export default ResourcesPage;