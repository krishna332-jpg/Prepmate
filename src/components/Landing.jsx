import { useState, useEffect, useRef } from 'react';

export function Landing({ onGetStarted, onSignIn }) {
  const [mounted, setMounted] = useState(false);
  const canvasRef = useRef(null);

  useEffect(() => { setTimeout(() => setMounted(true), 100); }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let w = canvas.width = window.innerWidth;
    let h = canvas.height = window.innerHeight;
    let mouse = { x: w/2, y: h/2 };
    const onResize = () => { w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight; };
    const onMouse = (e) => { mouse.x = e.clientX; mouse.y = e.clientY; };
    window.addEventListener('resize', onResize);
    window.addEventListener('mousemove', onMouse);

    const GRID = 52;
    let frame;
    const draw = () => {
      ctx.clearRect(0,0,w,h);
      const cols = Math.ceil(w/GRID)+1;
      const rows = Math.ceil(h/GRID)+1;
      for (let r=0;r<rows;r++) {
        for (let c=0;c<cols;c++) {
          const x = c*GRID, y = r*GRID;
          const dx = mouse.x-x, dy = mouse.y-y;
          const dist = Math.sqrt(dx*dx+dy*dy);
          const maxDist = 280;
          const alpha = dist < maxDist ? (1-dist/maxDist)*0.55 : 0.05;
          const size = dist < maxDist ? (1-dist/maxDist)*2.5+0.5 : 0.5;
          ctx.beginPath();
          ctx.arc(x, y, size, 0, Math.PI*2);
          ctx.fillStyle = `rgba(255,255,255,${alpha})`;
          ctx.fill();
        }
      }
      frame = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(frame); window.removeEventListener('resize', onResize); window.removeEventListener('mousemove', onMouse); };
  }, []);

  return (
    <div style={{ position:'relative', minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', overflow:'hidden', background:'#000' }}>
      <canvas ref={canvasRef} style={{ position:'absolute', inset:0, pointerEvents:'none', zIndex:0 }}/>
      <div style={{ position:'absolute', top:'30%', left:'50%', transform:'translate(-50%,-50%)', width:'clamp(300px,60vw,700px)', height:'clamp(200px,40vw,500px)', background:'radial-gradient(ellipse,rgba(0,112,243,0.12) 0%,transparent 70%)', pointerEvents:'none', zIndex:1 }}/>

      <div style={{
        position:'relative', zIndex:2, textAlign:'center',
        padding:'0 clamp(20px,5vw,60px)',
        opacity: mounted?1:0, transform: mounted?'none':'translateY(24px)',
        transition:'all 0.8s cubic-bezier(0.16,1,0.3,1)',
      }}>
        <div style={{ display:'inline-flex', alignItems:'center', gap:'8px', padding:'6px 14px', borderRadius:'100px', border:'1px solid rgba(255,255,255,0.12)', background:'rgba(255,255,255,0.04)', marginBottom:'clamp(24px,4vh,40px)' }}>
          <span style={{ width:'6px', height:'6px', borderRadius:'50%', background:'#50e3c2', display:'inline-block' }}/>
          <span style={{ fontSize:'12px', color:'#a1a1a1', fontWeight:500, letterSpacing:'0.02em' }}>AI-Powered Voice Interview Coach</span>
        </div>

        <h1 style={{ fontSize:'clamp(48px,8vw,120px)', fontWeight:800, letterSpacing:'-0.04em', lineHeight:0.95, color:'#fff', margin:'0 0 clamp(16px,3vh,28px)' }}>
          PrepMate
        </h1>

        <p style={{ fontSize:'clamp(16px,2vw,22px)', fontWeight:400, color:'#666', maxWidth:'clamp(280px,50vw,560px)', margin:'0 auto clamp(28px,5vh,52px)', lineHeight:1.6, letterSpacing:'-0.01em' }}>
          Master your interviews with AI-powered voice coaching. Real questions. Real feedback. Real results.
        </p>

        {/* TWO CLEAR BUTTONS — Sign Up + Sign In */}
        <div style={{ display:'flex', gap:'12px', justifyContent:'center', flexWrap:'wrap' }}>
          <button onClick={onGetStarted}
            style={{ padding:'clamp(10px,1.5vh,14px) clamp(20px,3vw,32px)', borderRadius:'8px', border:'none', background:'#fff', color:'#000', fontSize:'clamp(13px,1.5vw,15px)', fontWeight:600, fontFamily:'Inter,sans-serif', cursor:'pointer', transition:'all 0.2s', letterSpacing:'-0.01em' }}
            onMouseEnter={e=>e.currentTarget.style.background='#ededed'}
            onMouseLeave={e=>e.currentTarget.style.background='#fff'}
          >Get Started Free</button>
          <button onClick={onSignIn}
            style={{ padding:'clamp(10px,1.5vh,14px) clamp(20px,3vw,32px)', borderRadius:'8px', border:'1px solid rgba(255,255,255,0.15)', background:'transparent', color:'#fff', fontSize:'clamp(13px,1.5vw,15px)', fontWeight:500, fontFamily:'Inter,sans-serif', cursor:'pointer', transition:'all 0.2s', letterSpacing:'-0.01em' }}
            onMouseEnter={e=>{ e.currentTarget.style.background='rgba(255,255,255,0.08)'; e.currentTarget.style.borderColor='rgba(255,255,255,0.3)'; }}
            onMouseLeave={e=>{ e.currentTarget.style.background='transparent'; e.currentTarget.style.borderColor='rgba(255,255,255,0.15)'; }}
          >Sign In</button>
        </div>

        <div style={{ display:'flex', gap:'clamp(24px,5vw,64px)', justifyContent:'center', marginTop:'clamp(40px,7vh,80px)', paddingTop:'clamp(24px,4vh,40px)', borderTop:'1px solid rgba(255,255,255,0.08)', flexWrap:'wrap' }}>
          {[['500+','Questions'],['50+','Companies'],['Voice AI','Feedback'],['Free','Forever']].map(([v,l])=>(
            <div key={l} style={{ textAlign:'center' }}>
              <div style={{ fontSize:'clamp(18px,2.5vw,28px)', fontWeight:700, color:'#fff', letterSpacing:'-0.03em' }}>{v}</div>
              <div style={{ fontSize:'clamp(10px,1.2vw,13px)', color:'#444', marginTop:'3px', letterSpacing:'0.04em' }}>{l}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}