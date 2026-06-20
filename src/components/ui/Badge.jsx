import { T } from '../../styles/tokens';
const V = {
  blue:  { bg:T.blueDim, color:T.blueBright, border:T.border },
  green: { bg:'rgba(16,185,129,0.1)', color:'#10B981', border:'rgba(16,185,129,0.25)' },
  red:   { bg:'rgba(239,68,68,0.1)', color:'#EF4444', border:'rgba(239,68,68,0.25)' },
  amber: { bg:'rgba(245,158,11,0.1)', color:'#F59E0B', border:'rgba(245,158,11,0.25)' },
  muted: { bg:'rgba(255,255,255,0.04)', color:T.muted, border:T.borderDim },
};
export function Badge({ children, variant='muted', style={} }) {
  const v = V[variant]||V.muted;
  return <span style={{ display:'inline-flex',alignItems:'center',gap:'5px',padding:'3px 12px',borderRadius:'100px',background:v.bg,color:v.color,border:`1px solid ${v.border}`,fontSize:'11px',fontWeight:500,fontFamily:T.mono,letterSpacing:'0.06em',...style }}>{children}</span>;
}
