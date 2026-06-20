import { useState } from 'react';
import { T } from '../../styles/tokens';
export function InputField({ label, value, onChange, placeholder, type='text', rows, error }) {
  const [focused, setFocused] = useState(false);
  const base = {
    width:'100%', background:'rgba(255,255,255,0.03)',
    border:`1.5px solid ${error?T.red:focused?T.blue:T.borderDim}`,
    borderRadius:'10px', padding:'12px 16px',
    color:T.white, fontSize:'14px', fontFamily:T.body, fontWeight:400,
    outline:'none', transition:'all 0.2s', resize:rows?'vertical':undefined,
    boxSizing:'border-box',
  };
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'5px' }}>
      {label && <label style={{ fontSize:'11px', color:error?T.red:T.muted, letterSpacing:'0.09em', fontFamily:T.mono, textTransform:'uppercase' }}>{label}</label>}
      {rows
        ? <textarea rows={rows} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} onFocus={()=>setFocused(true)} onBlur={()=>setFocused(false)} style={{...base,minHeight:`${rows*28}px`}}/>
        : <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} onFocus={()=>setFocused(true)} onBlur={()=>setFocused(false)} style={base}/>
      }
      {error && <span style={{ fontSize:'11px', color:T.red, fontFamily:T.mono }}>{error}</span>}
    </div>
  );
}
