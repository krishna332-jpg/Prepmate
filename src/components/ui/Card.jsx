import { useState } from 'react';
import { T } from '../../styles/tokens';
export function Card({ children, style={}, onClick, hover=false }) {
  const [hov,setHov]=useState(false);
  return (
    <div onClick={onClick} onMouseEnter={()=>hover&&setHov(true)} onMouseLeave={()=>hover&&setHov(false)}
      style={{ background:T.bgCard, border:`1px solid ${hov?T.border:T.borderDim}`, borderRadius:T.xl, padding:'24px', transition:T.mid, cursor:onClick?'pointer':'default', transform:hov?'translateY(-2px)':'none', ...style }}>
      {children}
    </div>
  );
}
