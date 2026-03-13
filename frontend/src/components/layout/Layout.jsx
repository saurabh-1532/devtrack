import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import useWindowSize from '../../hooks/useWindowSize';

const Layout = () => {
  const width = useWindowSize();
  const isMobile = width < 768;
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#080910' }}>

      {/* mobile overlay */}
      {isMobile && sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.6)',
            zIndex: 40,
          }}
        />
      )}

      {/* sidebar */}
      <div style={{
        position: isMobile ? 'fixed' : 'relative',
        left: isMobile ? (sidebarOpen ? '0' : '-260px') : '0',
        top: 0, bottom: 0,
        zIndex: 50,
        transition: 'left 0.25s ease',
        flexShrink: 0, 
      }}>
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>

      {/* main */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' ,overflow: 'hidden'}}>

        {/* mobile topbar */}
        {isMobile && (
          <div style={{
            display: 'flex', alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 16px',
            background: '#0a0b18',
            borderBottom: '1px solid #13142a',
            position: 'sticky', top: 0, zIndex: 30,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '26px', height: '26px', borderRadius: '7px',
                background: 'linear-gradient(135deg, #6c5fff, #4488ff)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '12px',
              }}>⚡</div>
              <span style={{ fontFamily: 'Syne, sans-serif', fontSize: '14px', fontWeight: 800, color: '#dde0f0' }}>
               Stride.
              </span>
            </div>
            <button
              onClick={() => setSidebarOpen(true)}
              style={{
                background: 'transparent', border: 'none',
                cursor: 'pointer', padding: '4px',
                display: 'flex', flexDirection: 'column',
                gap: '5px',
              }}
            >
              {[0,1,2].map(i => (
                <div key={i} style={{ width: '20px', height: '2px', background: '#5a5a88', borderRadius: '2px' }} />
              ))}
            </button>
          </div>
        )}

        <main style={{ flex: 1, overflow: 'auto' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;