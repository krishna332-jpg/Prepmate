import { useState, useEffect } from 'react';

export function Navbar({ screen, setScreen, user, onProfileOpen }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const s = () => setScrolled(window.scrollY > 4);
    window.addEventListener('scroll', s);
    return () => window.removeEventListener('scroll', s);
  }, []);

  const name = user?.displayName?.split(' ')[0] || user?.name?.split(' ')[0] || 'User';

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 200,
      background: scrolled ? 'rgba(0,0,0,0.95)' : 'rgba(0,0,0,0.7)',
      backdropFilter: 'blur(20px)',
      borderBottom: `1px solid ${scrolled ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.04)'}`,
      transition: 'all 0.3s',
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 clamp(16px,3vw,32px)', height: 'clamp(52px,7vh,60px)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div onClick={() => setScreen('dashboard')} style={{ cursor: 'pointer', userSelect: 'none' }}>
          <span style={{ fontSize: '16px', fontWeight: 700, color: '#fff', letterSpacing: '-0.02em' }}>PrepMate</span>
          <span style={{ fontSize: '12px', color: '#333', marginLeft: '8px' }}>/ AI Interview Coach</span>
        </div>
        <div style={{ display: 'flex', gap: '0' }}>
          {[{ id: 'dashboard', l: 'Dashboard' }, { id: 'prep', l: 'Prepare' }, { id: 'sessions', l: 'Sessions' }, { id: 'tracker', l: 'Tracker' }].map(n => (
            <button key={n.id} onClick={() => setScreen(n.id)} style={{
              padding: '6px 14px', border: 'none', background: 'transparent', cursor: 'pointer',
              color: screen === n.id ? '#fff' : '#555', fontSize: '13px', fontWeight: screen === n.id ? 500 : 400,
              fontFamily: 'Inter,sans-serif', transition: 'color 0.15s',
              borderBottom: screen === n.id ? '1px solid #fff' : '1px solid transparent',
            }}
              onMouseEnter={e => { if (screen !== n.id) e.currentTarget.style.color = '#999'; }}
              onMouseLeave={e => { if (screen !== n.id) e.currentTarget.style.color = '#555'; }}
            >{n.l}</button>
          ))}
        </div>
        <div onClick={onProfileOpen} style={{ cursor: 'pointer', padding: '6px 14px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.03)', transition: 'all 0.15s' }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
        >
          <span style={{ fontSize: '13px', color: '#ededed', fontWeight: 500 }}>{name}</span>
        </div>
      </div>
    </nav>
  );
}