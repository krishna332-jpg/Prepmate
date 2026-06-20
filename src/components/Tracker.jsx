import { useState, useEffect, useRef } from 'react';

const STATUS_OPTIONS = ['Applied', 'In Progress', 'Interview', 'Offer', 'Rejected', 'Withdrawn'];
const STATUS_COLOR = {
  'Applied':     '#666',
  'In Progress': '#888',
  'Interview':   '#fff',
  'Offer':       '#fff',
  'Rejected':    '#444',
  'Withdrawn':   '#333',
};
const STATUS_BG = {
  'Applied':     'rgba(255,255,255,0.04)',
  'In Progress': 'rgba(255,255,255,0.06)',
  'Interview':   'rgba(255,255,255,0.1)',
  'Offer':       'rgba(255,255,255,0.14)',
  'Rejected':    'rgba(255,255,255,0.02)',
  'Withdrawn':   'rgba(255,255,255,0.02)',
};

const LS_ROWS  = 'prepmate_tracker_rows';
const LS_NOTE  = 'prepmate_tracker_note';

const emptyRow = () => ({
  id: Date.now() + Math.random(),
  company: '', role: '', status: 'Applied', date: '', salary: '', link: '', notes: '',
});

export function Tracker() {
  const [rows, setRows] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  // Load on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LS_ROWS);
      setRows(saved ? JSON.parse(saved) : [emptyRow()]);
    } catch(e) { setRows([emptyRow()]); }
    setLoaded(true);
  }, []);

  // Save whenever rows change
  useEffect(() => {
    if (!loaded) return;
    try { localStorage.setItem(LS_ROWS, JSON.stringify(rows)); } catch(e) {}
  }, [rows, loaded]);

  const updateRow = (id, field, value) => {
    setRows(rs => rs.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  const addRow = () => setRows(rs => [...rs, emptyRow()]);

  const deleteRow = (id) => {
    setRows(rs => rs.filter(r => r.id !== id));
    setConfirmDelete(null);
  };

  const stats = {
    total: rows.filter(r => r.company.trim()).length,
    interview: rows.filter(r => r.status === 'Interview').length,
    offer: rows.filter(r => r.status === 'Offer').length,
    rejected: rows.filter(r => r.status === 'Rejected').length,
  };

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: 'clamp(20px,3vw,40px) clamp(16px,3vw,32px)' }}>

      {/* Header */}
      <div style={{ marginBottom: 'clamp(20px,3vw,28px)' }}>
        <p style={{ fontSize: '11px', color: '#444', letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 8px', fontFamily: 'JetBrains Mono,monospace' }}>Job Search</p>
        <h2 style={{ fontSize: 'clamp(24px,4vw,36px)', fontWeight: 800, color: '#fff', letterSpacing: '-0.04em', margin: 0 }}>Application Tracker</h2>
      </div>

      {/* Quick stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', overflow: 'hidden', marginBottom: '20px' }}>
        {[
          ['Total Applications', stats.total, '#fff'],
          ['Interviewing',       stats.interview, '#fff'],
          ['Offers',             stats.offer, '#fff'],
          ['Rejected',           stats.rejected, '#555'],
        ].map(([l,v,c]) => (
          <div key={l} style={{ background: '#070707', padding: '14px 16px' }}>
            <div style={{ fontSize: '24px', fontWeight: 800, color: c, letterSpacing: '-0.03em' }}>{v}</div>
            <div style={{ fontSize: '11px', color: '#555', marginTop: '3px' }}>{l}</div>
          </div>
        ))}
      </div>

      {/* Main split — 3/4 spreadsheet, 1/4 sticky note */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,3fr) minmax(260px,1fr)', gap: '16px', alignItems: 'start' }}>

        {/* Spreadsheet */}
        <div style={{ border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', background: '#080808', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '900px' }}>
              <thead>
                <tr style={{ background: '#0d0d0d' }}>
                  {['Company','Role','Status','Date Applied','Salary','Link','Notes',''].map(h => (
                    <th key={h} style={{ padding: '12px 14px', textAlign: 'left', fontSize: '11px', color: '#444', fontFamily: 'JetBrains Mono,monospace', letterSpacing: '0.05em', textTransform: 'uppercase', borderBottom: '1px solid rgba(255,255,255,0.07)', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={row.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <Cell value={row.company} onChange={v => updateRow(row.id, 'company', v)} placeholder="Company name" width="140px" bold/>
                    <Cell value={row.role} onChange={v => updateRow(row.id, 'role', v)} placeholder="Role" width="150px"/>
                    <td style={{ padding: '4px 8px' }}>
                      <select value={row.status} onChange={e => updateRow(row.id, 'status', e.target.value)}
                        style={{ background: STATUS_BG[row.status], color: STATUS_COLOR[row.status], border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', padding: '6px 10px', fontSize: '12px', fontFamily: 'Inter,sans-serif', fontWeight: 600, cursor: 'pointer', outline: 'none', width: '100%' }}>
                        {STATUS_OPTIONS.map(s => <option key={s} value={s} style={{ background: '#111', color: '#fff' }}>{s}</option>)}
                      </select>
                    </td>
                    <Cell type="date" value={row.date} onChange={v => updateRow(row.id, 'date', v)} width="130px"/>
                    <Cell value={row.salary} onChange={v => updateRow(row.id, 'salary', v)} placeholder="₹ / $" width="100px"/>
                    <Cell value={row.link} onChange={v => updateRow(row.id, 'link', v)} placeholder="URL" width="120px" link/>
                    <Cell value={row.notes} onChange={v => updateRow(row.id, 'notes', v)} placeholder="Notes..." width="180px"/>
                    <td style={{ padding: '4px 8px', textAlign: 'center' }}>
                      {confirmDelete === row.id ? (
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button onClick={() => deleteRow(row.id)} style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.2)', background: '#fff', color: '#000', fontSize: '10px', cursor: 'pointer', fontWeight: 600 }}>Confirm</button>
                          <button onClick={() => setConfirmDelete(null)} style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.08)', background: 'transparent', color: '#555', fontSize: '10px', cursor: 'pointer' }}>Cancel</button>
                        </div>
                      ) : (
                        <button onClick={() => setConfirmDelete(row.id)} style={{ width: '26px', height: '26px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.06)', background: 'transparent', color: '#444', fontSize: '13px', cursor: 'pointer', transition: 'all 0.15s' }}
                          onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; }}
                          onMouseLeave={e => { e.currentTarget.style.color = '#444'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; }}
                        >✕</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button onClick={addRow} style={{ width: '100%', padding: '12px', border: 'none', borderTop: '1px solid rgba(255,255,255,0.06)', background: 'transparent', color: '#555', fontSize: '13px', fontFamily: 'Inter,sans-serif', cursor: 'pointer', transition: 'all 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = '#555'; e.currentTarget.style.background = 'transparent'; }}
          >+ Add Application</button>
        </div>

        {/* Sticky note */}
        <StickyNote/>
      </div>
    </div>
  );
}

function Cell({ value, onChange, placeholder, width, type = 'text', bold, link }) {
  return (
    <td style={{ padding: '4px 8px', minWidth: width }}>
      <input type={type} value={value} placeholder={placeholder} onChange={e => onChange(e.target.value)}
        style={{
          width: '100%', background: 'transparent', border: 'none', outline: 'none',
          color: link && value ? '#9ec5fe' : '#ededed', fontSize: '13px', fontFamily: 'Inter,sans-serif',
          fontWeight: bold ? 600 : 400, padding: '8px 6px', borderRadius: '5px', boxSizing: 'border-box',
          colorScheme: 'dark',
        }}
        onFocus={e => e.target.style.background = 'rgba(255,255,255,0.04)'}
        onBlur={e => e.target.style.background = 'transparent'}
      />
    </td>
  );
}

// ── Sticky Note with rich text formatting ──────────────────────────────────
function StickyNote() {
  const editorRef = useRef(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(LS_NOTE);
      if (saved && editorRef.current) editorRef.current.innerHTML = saved;
    } catch(e) {}
    setLoaded(true);
  }, []);

  const handleInput = () => {
    if (!editorRef.current) return;
    try { localStorage.setItem(LS_NOTE, editorRef.current.innerHTML); } catch(e) {}
  };

  const exec = (cmd) => {
    document.execCommand(cmd, false, null);
    editorRef.current?.focus();
    handleInput();
  };

  const insertBullet = () => { exec('insertUnorderedList'); };

  return (
    <div style={{ border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', background: '#0d0d08', overflow: 'hidden', position: 'sticky', top: '20px' }}>
      <div style={{ padding: '12px 14px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '11px', color: '#776b3f', fontFamily: 'JetBrains Mono,monospace', letterSpacing: '0.06em' }}>STICKY NOTES</span>
        <span style={{ fontSize: '11px', color: '#444', fontFamily: 'JetBrains Mono,monospace' }}>NOTE</span>
      </div>

      {/* Toolbar */}
      <div style={{ display: 'flex', gap: '2px', padding: '6px 8px', borderBottom: '1px solid rgba(255,255,255,0.06)', flexWrap: 'wrap' }}>
        <ToolBtn onClick={() => exec('bold')} title="Bold"><b>B</b></ToolBtn>
        <ToolBtn onClick={() => exec('italic')} title="Italic"><i>I</i></ToolBtn>
        <ToolBtn onClick={() => exec('underline')} title="Underline"><u>U</u></ToolBtn>
        <ToolBtn onClick={insertBullet} title="Bullet list">•≡</ToolBtn>
        <ToolBtn onClick={() => exec('removeFormat')} title="Clear formatting">Tx</ToolBtn>
      </div>

      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        suppressContentEditableWarning
        style={{
          minHeight: '320px', maxHeight: '520px', overflowY: 'auto',
          padding: '14px', fontSize: '13px', color: '#e8e0c0', lineHeight: 1.7,
          fontFamily: 'Inter,sans-serif', outline: 'none', background: 'transparent',
        }}
        data-placeholder="Jot down anything — recruiter names, interview tips, follow-up reminders..."
      />

      <style>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #44402a;
          pointer-events: none;
        }
        [contenteditable] ul { padding-left: 20px; margin: 6px 0; }
        [contenteditable] li { margin-bottom: 4px; }
      `}</style>
    </div>
  );
}

function ToolBtn({ children, onClick, title }) {
  return (
    <button onClick={onClick} title={title}
      style={{ width: '28px', height: '28px', borderRadius: '5px', border: 'none', background: 'transparent', color: '#998a52', fontSize: '12px', cursor: 'pointer', transition: 'background 0.15s', fontFamily: 'Inter,sans-serif' }}
      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
    >{children}</button>
  );
}