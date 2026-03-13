import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { path: '/app/dashboard', icon: '🏠', label: 'Dashboard' },
  { path: '/app/resources', icon: '📚', label: 'Resources' },
  { path: '/app/progress',  icon: '📈', label: 'Progress'  },
];

const accountItems = [
  { path: '/app/settings', icon: '⚙️', label: 'Settings' },
];

const Sidebar = () => {
  const { user} = useAuth();
  const navigate = useNavigate();

 

  return (
    <aside style={{
      width: '270px',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
      background: '#0a0b18',
      borderRight: '1px solid #13142a',
      position: 'relative',
      overflow: 'hidden',
    }}>

      {/* top glow */}
      <div style={{
        position: 'absolute', top: 0, left: 0,
        width: '100%', height: '180px',
        background: 'radial-gradient(ellipse at 50% -20%, rgba(108,95,255,0.07) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* logo */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '12px',
        padding: '22px 20px',
        borderBottom: '1px solid #13142a',
        position: 'relative', zIndex: 1, flexShrink: 0,
      }}>
        <div style={{
          width: '32px', height: '32px', borderRadius: '9px',
          background: 'linear-gradient(135deg, #6c5fff, #4488ff)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '15px', flexShrink: 0,
          boxShadow: '0 4px 12px rgba(108,95,255,0.35)',
        }}>⚡</div>
        <span style={{ fontFamily: 'Syne, sans-serif', fontSize: '15px', fontWeight: 800, color: '#dde0f0' }}>
         Stride.
        </span>
      </div>

      {/* nav */}
      <div style={{
        flex: 1, overflowY: 'auto',
        padding: '12px 10px',
        display: 'flex', flexDirection: 'column', gap: '2px',
        position: 'relative', zIndex: 1,
      }}>

        {/* workspace label */}
        <p style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: '9.5px', fontWeight: 700,
          letterSpacing: '0.16em', textTransform: 'uppercase',
          color: '#3a3a5a', padding: '10px 12px 5px',
        }}>Workspace</p>

        {navItems.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '10px 12px',
              borderRadius: '10px',
              fontSize: '13px', fontWeight: 500,
              textDecoration: 'none',
              position: 'relative',
              transition: 'all 0.15s',
              background: isActive ? 'rgba(108,95,255,0.1)' : 'transparent',
              color: isActive ? '#a08fff' : '#5a5a88',
            })}
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span style={{
                    position: 'absolute', left: 0,
                    top: '50%', transform: 'translateY(-50%)',
                    width: '3px', height: '18px',
                    background: '#6c5fff',
                    borderRadius: '0 3px 3px 0',
                  }} />
                )}
                <span style={{ fontSize: '15px', width: '20px', textAlign: 'center' }}>{item.icon}</span>
                <span>{item.label}</span>
              </>
            )}
          </NavLink>
        ))}

        {/* account label */}
        <p style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: '9.5px', fontWeight: 700,
          letterSpacing: '0.16em', textTransform: 'uppercase',
          color: '#3a3a5a', padding: '16px 12px 5px',
        }}>Account</p>

        {accountItems.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '10px 12px',
              borderRadius: '10px',
              fontSize: '13px', fontWeight: 500,
              textDecoration: 'none',
              position: 'relative',
              transition: 'all 0.15s',
              background: isActive ? 'rgba(108,95,255,0.1)' : 'transparent',
              color: isActive ? '#a08fff' : '#5a5a88',
            })}
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span style={{
                    position: 'absolute', left: 0,
                    top: '50%', transform: 'translateY(-50%)',
                    width: '3px', height: '18px',
                    background: '#6c5fff',
                    borderRadius: '0 3px 3px 0',
                  }} />
                )}
                <span style={{ fontSize: '15px', width: '20px', textAlign: 'center' }}>{item.icon}</span>
                <span>{item.label}</span>
              </>
            )}
          </NavLink>
        ))}

        {/* spacer */}
        <div style={{ flex: 1 }} />

        {/* streak card */}
        <div style={{
          margin: '4px 2px 6px',
          padding: '12px 14px',
          borderRadius: '12px',
          display: 'flex', alignItems: 'center', gap: '10px',
          background: 'rgba(255,170,51,0.07)',
          border: '1px solid rgba(255,170,51,0.14)',
        }}>
          <span style={{ fontSize: '20px' }}>🔥</span>
          <div>
            <p style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '12px', fontWeight: 700,
              color: '#ffaa33', marginBottom: '2px',
            }}>
              {user?.currentStreak || 0} day streak
            </p>
            <p style={{ fontSize: '10px', color: '#6a5a33' }}>
              keep it going!
            </p>
          </div>
        </div>

      </div>

      {/* user section */}
      <div
        style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          padding: '12px 10px',
          borderTop: '1px solid #13142a',
          cursor: 'pointer',
          transition: 'background 0.15s',
          position: 'relative', zIndex: 1, flexShrink: 0,
        }}
        onMouseEnter={e => e.currentTarget.style.background = '#0d0e1e'}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
      >
        {/* avatar */}
        <div style={{
          width: '32px', height: '32px', borderRadius: '9px',
          background: 'rgba(108,95,255,0.15)',
          border: '1px solid rgba(108,95,255,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '13px', fontWeight: 700,
          color: '#8878ff', flexShrink: 0,
          fontFamily: 'Syne, sans-serif',
        }}>
          {user?.name?.charAt(0).toUpperCase()}
        </div>

        {/* name + email */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{
            fontSize: '12px', fontWeight: 600,
            color: '#9090bb', whiteSpace: 'nowrap',
            overflow: 'hidden', textOverflow: 'ellipsis',
            marginBottom: '1px',
          }}>{user?.name}</p>
          <p style={{
            fontSize: '10px', color: '#44445a',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>{user?.email}</p>
        </div>

        {/* logout */}
        <button
          
          onClick={() => navigate('/app/profile')}
          style={{
            width: '28px', height: '28px', borderRadius: '8px',
            background: '#0d0e1e', border: '1px solid #1a1a30',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '13px', color: '#5a5a88',
            flexShrink: 0, cursor: 'pointer',
            transition: 'all 0.15s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.color = '#ff8877';
            e.currentTarget.style.borderColor = 'rgba(255,102,85,0.3)';
            e.currentTarget.style.background = 'rgba(255,102,85,0.08)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.color = '#5a5a88';
            e.currentTarget.style.borderColor = '#1a1a30';
            e.currentTarget.style.background = '#0d0e1e';
          }}
        >
          ↗
        </button>
      </div>

    </aside>
  );
};

export default Sidebar;