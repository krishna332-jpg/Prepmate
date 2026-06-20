import { useState, useEffect } from 'react';
import { logOut } from '../firebase';

const FIELDS = [
  { l: 'Full Name',   k: 'name' },
  { l: 'Email',       k: 'email' },
  { l: 'College',     k: 'college' },
  { l: 'Degree',      k: 'degree' },
  { l: 'Year',        k: 'year' },
  { l: 'Target Role', k: 'targetRole' },
];

export function ProfileModal({ user, profile, setProfile, setUser, onClose, onLogout }) {
  const [editing, setEditing] = useState(false);
  const [draft,   setDraft]   = useState({});

  // Always read from `user` — that's the single source of truth after signup
  useEffect(() => {
    setDraft({
      name: user?.name || user?.displayName || '',
      email: user?.email || '',
      college: user?.college || '',
      degree: user?.degree || '',
      year: user?.year || '',
      targetRole: user?.targetRole || '',
    });
  }, [user]);

  const handleLogout = async () => {
    try { await logOut(); } catch(e) { console.error(e); }
    onLogout();
  };

  const handleSave = () => {
    setUser(u => ({ ...u, ...draft }));
    setProfile(p => ({ ...p, ...draft }));
    setEditing(false);
  };

  const name = draft.name || 'User';
  const email = draft.email || '';

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 500, background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }} onClick={onClose}>
      <div style={{ background: '#111', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: 'clamp(24px,4vw,36px)', width: '100%', maxWidth: '460px', maxHeight: '90vh', overflowY: 'auto', animation: 'fadeUp 0.25s ease' }} onClick={e => e.stopPropagation()}>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#fff', margin: '0 0 3px', letterSpacing: '-0.02em' }}>{name}</h2>
            <p style={{ fontSize: '12px', color: '#444', margin: 0, fontFamily: 'JetBrains Mono,monospace' }}>{email}</p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {!editing && (
              <button onClick={() => setEditing(true)} style={{ padding: '6px 14px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.12)', background: 'transparent', color: '#fff', fontSize: '12px', fontFamily: 'Inter,sans-serif', cursor: 'pointer', transition: 'all 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >Edit</button>
            )}
            <button onClick={onClose} style={{ padding: '6px 14px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.07)', background: 'transparent', color: '#444', fontSize: '12px', fontFamily: 'Inter,sans-serif', cursor: 'pointer' }}>Close</button>
          </div>
        </div>

        <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', marginBottom: '20px' }}/>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {FIELDS.map(({ l, k }) => (
            <div key={k} style={{ display: 'grid', gridTemplateColumns: '110px 1fr', gap: '12px', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', color: '#444', fontFamily: 'JetBrains Mono,monospace', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{l}</span>
              {editing ? (
                <input value={draft[k] || ''} onChange={e => setDraft(d => ({ ...d, [k]: e.target.value }))}
                  style={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', padding: '8px 12px', color: '#fff', fontSize: '13px', fontFamily: 'Inter,sans-serif', outline: 'none', boxSizing: 'border-box', width: '100%', transition: 'border-color 0.15s' }}
                  onFocus={e => e.target.style.borderColor = 'rgba(255,255,255,0.3)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                />
              ) : (
                <span style={{ fontSize: '13px', color: draft[k] ? '#ededed' : '#333' }}>{draft[k] || '—'}</span>
              )}
            </div>
          ))}
        </div>

        {editing && (
          <button onClick={handleSave}
            style={{ width: '100%', marginTop: '20px', padding: '11px', borderRadius: '8px', border: 'none', background: '#fff', color: '#000', fontSize: '14px', fontFamily: 'Inter,sans-serif', fontWeight: 600, cursor: 'pointer', transition: 'background 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.background = '#ededed'}
            onMouseLeave={e => e.currentTarget.style.background = '#fff'}
          >Save Changes</button>
        )}

        <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <button onClick={handleLogout}
            style={{ width: '100%', padding: '11px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)', background: 'transparent', color: '#555', fontSize: '13px', fontFamily: 'Inter,sans-serif', cursor: 'pointer', transition: 'all 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = '#555'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
          >Sign Out</button>
        </div>
      </div>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  );
}