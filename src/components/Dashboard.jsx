import { useState, useEffect } from 'react';

const scoreColor = s => s>=75?'#fff':s>=50?'#888':'#555';

export function Dashboard({ user, sessions, onStartPrep, onViewSession, onOpenTracker }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setTimeout(() => setMounted(true), 80); }, []);

  const best = sessions.length ? Math.max(...sessions.map(s => s.score)) : null;
  const cos  = new Set(sessions.map(s => s.company)).size;
  const hour = new Date().getHours();
  const tod  = hour<12?'Morning':hour<17?'Afternoon':'Evening';
  const name = user?.displayName?.split(' ')[0] || user?.name?.split(' ')[0] || 'there';

  return (
    <div style={{ maxWidth:'1100px', margin:'0 auto', padding:'clamp(20px,3.5vw,40px) clamp(16px,3vw,32px)' }}>

      {/* Hero — greeting */}
      <div style={{
        marginBottom:'clamp(24px,3.5vw,36px)',
        opacity:mounted?1:0, transform:mounted?'none':'translateY(16px)',
        transition:'all 0.5s cubic-bezier(0.16,1,0.3,1)',
      }}>
        <p style={{ fontSize:'12px', color:'#444', letterSpacing:'0.06em', textTransform:'uppercase', margin:'0 0 8px', fontFamily:'JetBrains Mono,monospace' }}>Good {tod}</p>
        <h1 style={{ fontSize:'clamp(26px,4.5vw,44px)', fontWeight:800, color:'#fff', letterSpacing:'-0.04em', lineHeight:1.1, margin:'0 0 8px' }}>
          {name}, <span style={{ color:'#555', fontWeight:400, fontStyle:'italic' }}>let's get you hired.</span>
        </h1>
        <p style={{ fontSize:'clamp(13px,1.5vw,15px)', color:'#444', margin:0, lineHeight:1.6 }}>
          {sessions.length===0
            ? 'Upload your resume, pick a company, and start practicing.'
            : `${sessions.length} session${sessions.length>1?'s':''} completed. Keep the momentum going.`}
        </p>
      </div>

      {/* Stat strip — single row, compact. Avg Score replaced with Tracker button */}
      <div style={{
        display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'1px',
        background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'12px', overflow:'hidden',
        marginBottom:'clamp(24px,3.5vw,36px)',
        opacity:mounted?1:0, transition:'all 0.5s ease 0.1s',
      }}>
        <StatBox l="Sessions"   v={sessions.length} s=""     sub={sessions.length===0?'None yet':'completed'} c="#fff"/>
        <StatBox l="Best Score" v={best}            s="/100" sub={best?'personal record':'no data yet'}        c={best?scoreColor(best):'#222'}/>

        {/* Tracker button — replaces Avg Score */}
        <button onClick={onOpenTracker} style={{
          background:'#070707', padding:'clamp(16px,2.2vw,22px) clamp(14px,2vw,20px)',
          border:'none', borderLeft:'1px solid rgba(255,255,255,0.06)', borderRight:'1px solid rgba(255,255,255,0.06)',
          cursor:'pointer', textAlign:'left', transition:'background 0.15s', display:'flex', flexDirection:'column',
        }}
          onMouseEnter={e => e.currentTarget.style.background = '#0c0c0c'}
          onMouseLeave={e => e.currentTarget.style.background = '#070707'}
        >
          <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
            <span style={{ fontSize:'clamp(20px,2.8vw,28px)', fontWeight:800, color:'#fff', letterSpacing:'-0.03em', lineHeight:1 }}>Track</span>
          </div>
          <div style={{ fontSize:'12px', color:'#888', margin:'8px 0 2px', fontWeight:600 }}>Job Tracker</div>
          <div style={{ fontSize:'10px', color:'#444', fontFamily:'JetBrains Mono,monospace', textTransform:'uppercase', letterSpacing:'0.04em' }}>open spreadsheet</div>
        </button>

        <StatBox l="Companies" v={cos} s="" sub={cos===0?'none yet':'targeted'} c="#fff"/>
      </div>

      {/* CTA card */}
      <div style={{
        border:'1px solid rgba(255,255,255,0.08)', borderRadius:'14px', padding:'clamp(24px,4vw,40px)',
        background:'linear-gradient(135deg, #0d0d0d 0%, #070707 100%)',
        display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'20px',
        marginBottom:'clamp(28px,4vw,44px)',
        opacity:mounted?1:0, transition:'all 0.5s ease 0.18s',
      }}>
        <div>
          <div style={{ fontSize:'10px', color:'#444', letterSpacing:'0.1em', fontFamily:'JetBrains Mono,monospace', marginBottom:'8px' }}>
            {sessions.length===0 ? 'GET STARTED' : 'READY FOR ANOTHER ROUND'}
          </div>
          <div style={{ fontSize:'clamp(17px,2.2vw,21px)', fontWeight:700, color:'#fff', letterSpacing:'-0.02em', marginBottom:'4px' }}>
            {sessions.length===0 ? 'Start your first interview' : 'Practice another role'}
          </div>
          <div style={{ fontSize:'13px', color:'#555' }}>Resume analysis, tailored questions, and real-time feedback.</div>
        </div>
        <button onClick={onStartPrep}
          style={{ padding:'12px 28px', borderRadius:'8px', border:'none', background:'#fff', color:'#000', fontSize:'14px', fontWeight:600, fontFamily:'Inter,sans-serif', cursor:'pointer', transition:'background 0.15s', flexShrink:0 }}
          onMouseEnter={e=>e.currentTarget.style.background='#ededed'}
          onMouseLeave={e=>e.currentTarget.style.background='#fff'}
        >{sessions.length===0?'Start First Interview':'New Interview'}</button>
      </div>

      {/* Sessions list */}
      {sessions.length > 0 && (
        <div style={{ opacity:mounted?1:0, transition:'all 0.5s ease 0.26s' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'14px' }}>
            <p style={{ fontSize:'11px', color:'#444', letterSpacing:'0.06em', textTransform:'uppercase', margin:0, fontFamily:'JetBrains Mono,monospace' }}>Recent Sessions</p>
            <span style={{ fontSize:'12px', color:'#333' }}>{sessions.length} total</span>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>
            {sessions.slice(0,5).map((s,i) => (
              <SessionRow key={s.id} session={s} onClick={()=>onViewSession(s)} delay={i*0.04}/>
            ))}
          </div>
        </div>
      )}

      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  );
}

function StatBox({ l, v, s, sub, c }) {
  return (
    <div style={{ background:'#070707', padding:'clamp(16px,2.2vw,22px) clamp(14px,2vw,20px)' }}>
      <div style={{ fontSize:'clamp(22px,3vw,32px)', fontWeight:800, color:v!==null?c:'#1a1a1a', letterSpacing:'-0.04em', lineHeight:1 }}>
        {v!==null?v:'—'}<span style={{ fontSize:'13px', color:'#2a2a2a', fontWeight:400 }}>{v!==null?s:''}</span>
      </div>
      <div style={{ fontSize:'12px', color:'#666', margin:'6px 0 2px', fontWeight:500 }}>{l}</div>
      <div style={{ fontSize:'10px', color:v!==null?'#444':'#1a1a1a', fontFamily:'JetBrains Mono,monospace', textTransform:'uppercase', letterSpacing:'0.04em' }}>{sub}</div>
    </div>
  );
}

function SessionRow({ session, onClick, delay }) {
  const [hov, setHov] = useState(false);
  return (
    <div onClick={onClick}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        background: hov?'#111':'#0a0a0a',
        border: `1px solid ${hov?'rgba(255,255,255,0.15)':'rgba(255,255,255,0.06)'}`,
        borderRadius:'10px', padding:'clamp(12px,1.5vw,16px) clamp(14px,2vw,20px)',
        display:'flex', alignItems:'center', justifyContent:'space-between',
        cursor:'pointer', transition:'all 0.15s',
        animation:`fadeUp 0.3s ease ${delay}s both`,
      }}>
      <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
        <div style={{ width:'32px', height:'32px', borderRadius:'8px', background:'#1a1a1a', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'14px', fontWeight:700, color:'#fff', flexShrink:0 }}>
          {session.company?.[0]}
        </div>
        <div>
          <div style={{ fontSize:'14px', fontWeight:600, color:'#fff' }}>{session.company}</div>
          <div style={{ fontSize:'11px', color:'#444', marginTop:'1px' }}>{session.role} · {session.date}</div>
        </div>
      </div>
      <div style={{ display:'flex', alignItems:'center', gap:'16px' }}>
        <div style={{ textAlign:'right' }}>
          <div style={{ fontSize:'22px', fontWeight:700, color:scoreColor(session.score), letterSpacing:'-0.03em' }}>{session.score}</div>
          <div style={{ fontSize:'10px', color:'#333', fontFamily:'JetBrains Mono,monospace' }}>SCORE</div>
        </div>
        <span style={{ color: hov?'#888':'#333', transition:'color 0.15s' }}>›</span>
      </div>
    </div>
  );
}