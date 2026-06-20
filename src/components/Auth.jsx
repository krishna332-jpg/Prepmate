import { useState } from 'react';
import { signInWithGoogle } from '../firebase';

const REGISTERED = {};
const validateEmail = e => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(e));

function Input({ label, value, onChange, placeholder, type='text', error, onBlur }) {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <label style={{ display:'block', fontSize:'12px', color:'#a1a1a1', marginBottom:'6px', fontWeight:500 }}>{label}</label>
      <input type={type} value={value} onChange={onChange} placeholder={placeholder}
        onFocus={()=>setFocused(true)}
        onBlur={()=>{ setFocused(false); if(onBlur) onBlur(); }}
        style={{ width:'100%', background:'#0a0a0a', border:`1px solid ${error?'#e00':focused?'rgba(255,255,255,0.4)':'rgba(255,255,255,0.1)'}`, borderRadius:'8px', padding:'10px 14px', color:'#fff', fontSize:'14px', fontFamily:'Inter,sans-serif', outline:'none', transition:'border-color 0.15s', boxSizing:'border-box' }}
      />
      {error && <p style={{ fontSize:'11px', color:'#e00', marginTop:'4px', margin:'4px 0 0' }}>{error}</p>}
    </div>
  );
}

export function Auth({ mode, profile, setProfile, onSubmit, onToggle, onGoogleSuccess, onGoogleNewUser }) {
  const [errors,  setErrors]  = useState({});
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const [gLoading, setGLoading] = useState(false);

  const set = k => v => { setProfile(p=>({...p,[k]:v})); setErrors(e=>({...e,[k]:''})); };
  const touch = k => () => setTouched(t=>({...t,[k]:true}));

  const validate = () => {
    const e = {};
    if (mode==='signup' && !profile.name?.trim()) e.name = 'Name is required';
    if (!profile.email?.trim())                   e.email = 'Email is required';
    else if (!validateEmail(profile.email))        e.email = 'Enter a valid email';
    else if (mode==='signup' && REGISTERED[profile.email.toLowerCase()]) e.email = 'Already registered — sign in instead';
    if (!profile.password?.trim())                 e.password = 'Password is required';
    else if (profile.password.length < 8)          e.password = 'Minimum 8 characters';
    return e;
  };

  const handleSubmit = () => {
    setTouched({name:true,email:true,password:true});
    const e = validate();
    if (Object.keys(e).length>0) { setErrors(e); return; }
    if (mode==='signup') REGISTERED[profile.email.toLowerCase()] = true;
    onSubmit();
  };

  const handleGoogle = async () => {
    setGLoading(true);
    try {
      const result = await signInWithGoogle();
      const u = result.user;
      const isNew = !REGISTERED[u.email.toLowerCase()];
      if (isNew) {
        REGISTERED[u.email.toLowerCase()] = true;
        onGoogleNewUser(u); // needs to fill extra details
      } else {
        onGoogleSuccess(u); // straight to dashboard
      }
    } catch(e) {
      console.error('Google sign in error:', e);
      alert('Google sign in failed. Please try again or check if Google Auth is enabled in Firebase console.');
    }
    setGLoading(false);
  };

  const err = k => touched[k] ? errors[k] : '';

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#000', padding:'20px', position:'relative', overflow:'hidden' }}>
      {/* Subtle grid */}
      <div style={{ position:'fixed', inset:0, pointerEvents:'none', backgroundImage:'linear-gradient(rgba(255,255,255,0.02) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.02) 1px,transparent 1px)', backgroundSize:'52px 52px' }}/>

      <div style={{ width:'100%', maxWidth: mode==='signup'?'820px':'400px', position:'relative', zIndex:1 }}>

        {/* Logo */}
        <div style={{ textAlign:'center', marginBottom:'32px' }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:'8px', marginBottom:'16px' }}>
            <div style={{ width:'32px', height:'32px', background:'#fff', borderRadius:'8px', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <span style={{ fontFamily:'Inter,sans-serif', fontSize:'16px', fontWeight:800, color:'#000' }}>P</span>
            </div>
            <span style={{ fontSize:'20px', fontWeight:700, color:'#fff', letterSpacing:'-0.02em' }}>PrepMate</span>
          </div>
          <h1 style={{ fontSize:'clamp(22px,3vw,28px)', fontWeight:700, color:'#fff', letterSpacing:'-0.03em', margin:'0 0 6px' }}>
            {mode==='signup' ? 'Create your account' : 'Welcome back'}
          </h1>
          <p style={{ fontSize:'14px', color:'#666', margin:0 }}>
            {mode==='signup' ? 'Start your interview prep journey' : 'Sign in to continue'}
          </p>
        </div>

        {mode==='signup' ? (
          /* SIGNUP — 2 column */
          <div style={{ background:'#111', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'12px', padding:'clamp(20px,3vw,36px)', display:'grid', gridTemplateColumns:'1fr 1fr', gap:'clamp(16px,2vw,28px)' }}>
            {/* Left */}
            <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
              <div>
                <p style={{ fontSize:'13px', color:'#666', margin:'0 0 16px', lineHeight:1.6 }}>Continue with Google to autofill your details, or fill in manually below.</p>
                <GoogleBtn onClick={handleGoogle} loading={gLoading} label="Continue with Google"/>
              </div>
              <Divider/>
              <Input label="Full Name" value={profile.name||''} onChange={e=>set('name')(e.target.value)} onBlur={touch('name')} placeholder="Arjun Krishnan" error={err('name')}/>
              <Input label="Email" value={profile.email||''} onChange={e=>set('email')(e.target.value)} onBlur={touch('email')} placeholder="arjun@gmail.com" type="email" error={err('email')}/>
              <Input label="Password" value={profile.password||''} onChange={e=>set('password')(e.target.value)} onBlur={touch('password')} placeholder="Min 8 characters" type="password" error={err('password')}/>
            </div>

            {/* Right */}
            <div style={{ display:'flex', flexDirection:'column', gap:'16px', justifyContent:'center' }}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
                <Input label="College" value={profile.college||''} onChange={e=>set('college')(e.target.value)} placeholder="NIT Trichy"/>
                <Input label="Degree"  value={profile.degree||''}  onChange={e=>set('degree')(e.target.value)}  placeholder="B.Tech CSE"/>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
                <Input label="Year" value={profile.year||''} onChange={e=>set('year')(e.target.value)} placeholder="3rd Year"/>
                <div>
                  <label style={{ display:'block', fontSize:'12px', color:'#a1a1a1', marginBottom:'6px', fontWeight:500 }}>Gender</label>
                  <div style={{ display:'flex', gap:'5px' }}>
                    {['Male','Female','Other'].map(g=>(
                      <button key={g} onClick={()=>set('gender')(g.toLowerCase())} style={{ flex:1, padding:'10px 0', borderRadius:'6px', cursor:'pointer', border:`1px solid ${profile.gender===g.toLowerCase()?'rgba(255,255,255,0.4)':'rgba(255,255,255,0.08)'}`, background:profile.gender===g.toLowerCase()?'rgba(255,255,255,0.08)':'transparent', color:profile.gender===g.toLowerCase()?'#fff':'#666', fontSize:'11px', fontFamily:'Inter,sans-serif', transition:'all 0.15s' }}>{g}</button>
                    ))}
                  </div>
                </div>
              </div>
              <Input label="Target Role" value={profile.targetRole||''} onChange={e=>set('targetRole')(e.target.value)} placeholder="SWE Intern"/>
              <PrimaryBtn onClick={handleSubmit} label="Create Account"/>
              <p style={{ textAlign:'center', fontSize:'12px', color:'#444', margin:0 }}>
                Have an account? <span onClick={onToggle} style={{ color:'#fff', cursor:'pointer' }}>Sign in</span>
              </p>
            </div>
          </div>

        ) : (
          /* SIGNIN — single */
          <div style={{ background:'#111', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'12px', padding:'clamp(24px,4vw,40px)' }}>
            <div style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
              <GoogleBtn onClick={handleGoogle} loading={gLoading} label="Continue with Google"/>
              <Divider/>
              <Input label="Email"    value={profile.email||''}    onChange={e=>set('email')(e.target.value)}    onBlur={touch('email')}    placeholder="arjun@gmail.com"    type="email"    error={err('email')}/>
              <Input label="Password" value={profile.password||''} onChange={e=>set('password')(e.target.value)} onBlur={touch('password')} placeholder="Your password" type="password" error={err('password')}/>
              <PrimaryBtn onClick={handleSubmit} label="Sign In"/>
            </div>
            <p style={{ textAlign:'center', fontSize:'12px', color:'#444', marginTop:'16px', margin:'16px 0 0' }}>
              No account? <span onClick={onToggle} style={{ color:'#fff', cursor:'pointer' }}>Create one</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function GoogleBtn({ onClick, loading, label }) {
  const [hov, setHov] = useState(false);
  return (
    <button onClick={onClick} disabled={loading}
      onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{ width:'100%', padding:'11px', borderRadius:'8px', border:`1px solid ${hov?'rgba(255,255,255,0.25)':'rgba(255,255,255,0.12)'}`, background: hov?'rgba(255,255,255,0.06)':'rgba(255,255,255,0.03)', color:'#fff', fontSize:'14px', fontFamily:'Inter,sans-serif', fontWeight:500, cursor:loading?'wait':'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:'10px', transition:'all 0.15s', opacity:loading?0.6:1 }}>
      <svg width="16" height="16" viewBox="0 0 48 48">
        <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3l5.7-5.7C34.5 6.5 29.5 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.9z"/>
        <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3.1 0 5.8 1.2 7.9 3l5.7-5.7C34.5 6.5 29.5 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
        <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.3 35.5 26.8 36.5 24 36.5c-5.2 0-9.6-3.3-11.2-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/>
        <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.2-2.3 4.1-4.2 5.4l6.2 5.2C37 36.9 44 31 44 24c0-1.3-.1-2.7-.4-3.9z"/>
      </svg>
      {loading ? 'Signing in...' : label}
    </button>
  );
}

function PrimaryBtn({ onClick, label }) {
  const [hov, setHov] = useState(false);
  return (
    <button onClick={onClick}
      onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{ width:'100%', padding:'11px', borderRadius:'8px', border:'none', background:hov?'#ededed':'#fff', color:'#000', fontSize:'14px', fontFamily:'Inter,sans-serif', fontWeight:600, cursor:'pointer', transition:'background 0.15s', letterSpacing:'-0.01em' }}>
      {label}
    </button>
  );
}

function Divider() {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
      <div style={{ flex:1, height:'1px', background:'rgba(255,255,255,0.08)' }}/>
      <span style={{ fontSize:'11px', color:'#444' }}>or</span>
      <div style={{ flex:1, height:'1px', background:'rgba(255,255,255,0.08)' }}/>
    </div>
  );
}

// Extra details form after Google sign in for new users
export function GoogleDetailsForm({ googleUser, profile, setProfile, onComplete }) {
  const set = k => v => setProfile(p=>({...p,[k]:v}));
  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#000', padding:'20px' }}>
      <div style={{ width:'100%', maxWidth:'480px', background:'#111', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'12px', padding:'clamp(24px,4vw,40px)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'12px', marginBottom:'24px' }}>
          {googleUser?.photoURL && <img src={googleUser.photoURL} alt="" style={{ width:'40px', height:'40px', borderRadius:'50%' }}/>}
          <div>
            <div style={{ fontSize:'14px', fontWeight:600, color:'#fff' }}>{googleUser?.displayName}</div>
            <div style={{ fontSize:'12px', color:'#666' }}>{googleUser?.email}</div>
          </div>
        </div>
        <h2 style={{ fontSize:'20px', fontWeight:700, color:'#fff', marginBottom:'6px', letterSpacing:'-0.02em' }}>Complete your profile</h2>
        <p style={{ fontSize:'13px', color:'#666', marginBottom:'24px' }}>Just a few more details to personalise your experience.</p>
        <div style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
            <Input label="College" value={profile.college||''} onChange={e=>set('college')(e.target.value)} placeholder="NIT Trichy"/>
            <Input label="Degree"  value={profile.degree||''}  onChange={e=>set('degree')(e.target.value)}  placeholder="B.Tech CSE"/>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
            <Input label="Year" value={profile.year||''} onChange={e=>set('year')(e.target.value)} placeholder="3rd Year"/>
            <div>
              <label style={{ display:'block', fontSize:'12px', color:'#a1a1a1', marginBottom:'6px', fontWeight:500 }}>Gender</label>
              <div style={{ display:'flex', gap:'5px' }}>
                {['Male','Female','Other'].map(g=>(
                  <button key={g} onClick={()=>set('gender')(g.toLowerCase())} style={{ flex:1, padding:'9px 0', borderRadius:'6px', cursor:'pointer', border:`1px solid ${profile.gender===g.toLowerCase()?'rgba(255,255,255,0.4)':'rgba(255,255,255,0.08)'}`, background:profile.gender===g.toLowerCase()?'rgba(255,255,255,0.08)':'transparent', color:profile.gender===g.toLowerCase()?'#fff':'#666', fontSize:'11px', fontFamily:'Inter,sans-serif', transition:'all 0.15s' }}>{g}</button>
                ))}
              </div>
            </div>
          </div>
          <Input label="Target Role" value={profile.targetRole||''} onChange={e=>set('targetRole')(e.target.value)} placeholder="Software Engineer Intern"/>
          <button onClick={onComplete}
            style={{ width:'100%', padding:'11px', borderRadius:'8px', border:'none', background:'#fff', color:'#000', fontSize:'14px', fontFamily:'Inter,sans-serif', fontWeight:600, cursor:'pointer', marginTop:'4px' }}>
            Go to Dashboard →
          </button>
        </div>
      </div>
    </div>
  );
}
