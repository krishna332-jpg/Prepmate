import { useState } from 'react';

const scoreColor = s => s>=75?'#50e3c2':s>=50?'#f5a623':'#e00';

export function Sessions({ sessions, onView, onNewInterview }) {
  return (
    <div style={{ maxWidth:'900px', margin:'0 auto', padding:'clamp(24px,4vw,48px) clamp(16px,3vw,32px)' }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'16px', marginBottom:'clamp(24px,4vw,40px)' }}>
        <div>
          <p style={{ fontSize:'12px', color:'#444', letterSpacing:'0.06em', textTransform:'uppercase', margin:'0 0 8px', fontFamily:'JetBrains Mono,monospace' }}>History</p>
          <h2 style={{ fontSize:'clamp(24px,4vw,40px)', fontWeight:800, color:'#fff', letterSpacing:'-0.04em', margin:0 }}>All Sessions</h2>
        </div>
        <button onClick={onNewInterview} style={{ padding:'9px 20px', borderRadius:'8px', border:'none', background:'#fff', color:'#000', fontSize:'13px', fontFamily:'Inter,sans-serif', fontWeight:600, cursor:'pointer', transition:'background 0.15s' }}
          onMouseEnter={e=>e.currentTarget.style.background='#ededed'}
          onMouseLeave={e=>e.currentTarget.style.background='#fff'}
        >New Interview →</button>
      </div>

      {sessions.length===0 ? (
        <div style={{ border:'1px dashed rgba(255,255,255,0.08)', borderRadius:'12px', padding:'80px 40px', textAlign:'center' }}>
          <p style={{ fontSize:'16px', color:'#444', margin:'0 0 20px' }}>No sessions yet.</p>
          <button onClick={onNewInterview} style={{ padding:'9px 20px', borderRadius:'8px', border:'1px solid rgba(255,255,255,0.12)', background:'transparent', color:'#fff', fontSize:'13px', fontFamily:'Inter,sans-serif', cursor:'pointer' }}>Start your first interview →</button>
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>
          {sessions.map((s,i)=>(
            <div key={s.id} onClick={()=>onView(s)}
              style={{ background:'#0a0a0a', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'10px', padding:'clamp(14px,2vw,18px) clamp(16px,2vw,22px)', display:'flex', alignItems:'center', justifyContent:'space-between', cursor:'pointer', transition:'all 0.15s', animation:`fadeUp 0.3s ease ${i*0.04}s both` }}
              onMouseEnter={e=>{ e.currentTarget.style.background='#111'; e.currentTarget.style.borderColor='rgba(255,255,255,0.15)'; }}
              onMouseLeave={e=>{ e.currentTarget.style.background='#0a0a0a'; e.currentTarget.style.borderColor='rgba(255,255,255,0.06)'; }}
            >
              <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
                <div style={{ width:'34px', height:'34px', borderRadius:'8px', background:'#1a1a1a', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'15px', fontWeight:700, color:'#fff', flexShrink:0 }}>{s.company?.[0]}</div>
                <div>
                  <div style={{ fontSize:'14px', fontWeight:600, color:'#fff' }}>{s.company}</div>
                  <div style={{ fontSize:'11px', color:'#444', marginTop:'1px' }}>{s.role} · {s.date}</div>
                </div>
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:'16px' }}>
                <div style={{ textAlign:'right' }}>
                  <div style={{ fontSize:'22px', fontWeight:700, color:scoreColor(s.score), letterSpacing:'-0.03em' }}>{s.score}</div>
                  <div style={{ fontSize:'10px', color:'#333', fontFamily:'JetBrains Mono,monospace' }}>SCORE</div>
                </div>
                <span style={{ color:'#333' }}>›</span>
              </div>
            </div>
          ))}
        </div>
      )}
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  );
}
