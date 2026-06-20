import { T } from '../../styles/tokens';
export function Button({ children, variant='primary', size='md', onClick, disabled, style={}, fullWidth }) {
  const base = { border:'none', borderRadius:T.md, cursor:disabled?'not-allowed':'pointer', fontFamily:T.body, fontWeight:600, letterSpacing:'0.03em', transition:T.mid, display:'inline-flex', alignItems:'center', justifyContent:'center', gap:'8px', opacity:disabled?0.45:1, width:fullWidth?'100%':'auto' };
  const sizes = { sm:{padding:'8px 18px',fontSize:'12px'}, md:{padding:'12px 28px',fontSize:'13px'}, lg:{padding:'15px 36px',fontSize:'14px'} };
  const variants = {
    primary: { background:`linear-gradient(135deg,${T.blue},${T.blueLt})`, color:'#fff', border:`1.5px solid ${T.blue}`, boxShadow:`0 4px 16px ${T.blueGlow}` },
    outline: { background:'transparent', color:T.mutedLt, border:`1.5px solid ${T.borderMd}` },
    ghost:   { background:T.blueDim, color:T.blueBright, border:`1.5px solid ${T.border}` },
    danger:  { background:'rgba(239,68,68,0.08)', color:'#EF4444', border:'1.5px solid rgba(239,68,68,0.25)' },
  };
  return (
    <button onClick={!disabled?onClick:undefined} disabled={disabled}
      onMouseEnter={e=>{ if(!disabled&&variant==='primary'){e.currentTarget.style.transform='translateY(-1px)';e.currentTarget.style.boxShadow=`0 8px 28px ${T.blueGlow}`;}}}
      onMouseLeave={e=>{ if(!disabled){e.currentTarget.style.transform='none';e.currentTarget.style.boxShadow=variants[variant]?.boxShadow||'none';}}}
      style={{...base,...sizes[size],...variants[variant],...style}}>
      {children}
    </button>
  );
}
