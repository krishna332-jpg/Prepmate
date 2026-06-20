import { useState, useRef } from 'react';
import { COMPANIES, ROLES } from '../styles/tokens';
import { useSpeech } from '../hooks/useSpeech';

export function PrepScreen({ company, setCompany, role, setRole, aiVoice, setAiVoice,
  resumeText, setResumeText, jobDesc, setJobDesc, atsResult, onAnalyse, onStart, loading }) {
  const { speak } = useSpeech();
  const [companySearch, setCompanySearch] = useState(company?.name || '');
  const [roleSearch,    setRoleSearch]    = useState(role || '');
  const [showCo,        setShowCo]        = useState(false);
  const [showRole,      setShowRole]      = useState(false);
  const [resumeTab,     setResumeTab]     = useState('paste');
  const [atsView,       setAtsView]       = useState(false);
  const [analysing,     setAnalysing]     = useState(false);
  const fileRef = useRef(null);
  const [pdfLoading, setPdfLoading] = useState(false);

  const filtCo   = COMPANIES.filter(c => c.name.toLowerCase().includes(companySearch.toLowerCase()));
  const filtRole = ROLES.filter(r => r.toLowerCase().includes(roleSearch.toLowerCase()));

  const selCo   = co => { setCompany(co); setCompanySearch(co.name); setShowCo(false); };
  const selRole = r  => { setRole(r); setRoleSearch(r); setShowRole(false); };
  const customCo   = () => { if (companySearch.trim()) { setCompany({ name: companySearch.trim(), color: '#fff', sector: 'Custom' }); setShowCo(false); }};
  const customRole = () => { if (roleSearch.trim()) { setRole(roleSearch.trim()); setShowRole(false); }};

  const canAnalyse = resumeText.trim().length > 30 && jobDesc.trim().length > 20 && company && role;
  const readyToStart = atsResult && company && role;

  const handlePDF = async e => {
    const f = e.target.files[0];
    if (!f) return;
    if (f.type !== 'application/pdf') {
      const reader = new FileReader();
      reader.onload = () => setResumeText(reader.result);
      reader.readAsText(f);
      return;
    }
    setPdfLoading(true);
    try {
      if (!window.pdfjsLib) {
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
          script.onload = resolve;
          script.onerror = reject;
          document.head.appendChild(script);
        });
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      }
      const arrayBuffer = await f.arrayBuffer();
      const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let fullText = '';
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        fullText += content.items.map(item => item.str).join(' ') + '\n\n';
      }
      if (fullText.trim().length < 30) {
        setResumeText(`[Could not extract text from ${f.name} — it may be a scanned image. Please paste your resume text manually.]`);
      } else {
        setResumeText(fullText.trim());
      }
    } catch (err) {
      setResumeText(`[Failed to read ${f.name}. Please paste your resume text manually.]`);
    }
    setPdfLoading(false);
  };

  const handleAnalyse = async () => {
    if (!canAnalyse) return;
    setAnalysing(true);
    setTimeout(async () => {
      setAtsView(true);
      await onAnalyse();
      setAnalysing(false);
    }, 700);
  };

  const handleBack = () => setAtsView(false);

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: 'clamp(24px,4vw,48px) clamp(16px,3vw,32px)', overflow: 'hidden' }}>

      <div style={{ marginBottom: 'clamp(20px,3vw,32px)' }}>
        <p style={{ fontSize: '11px', color: '#444', letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 8px', fontFamily: 'JetBrains Mono,monospace' }}>Step 01 — Configure</p>
        <h2 style={{ fontSize: 'clamp(24px,4vw,40px)', fontWeight: 800, color: '#fff', letterSpacing: '-0.04em', margin: 0 }}>Set up your interview</h2>
        <p style={{ fontSize: '13px', color: '#444', margin: '10px 0 0', lineHeight: 1.6 }}>
          Fill in your target role, paste your resume and the job description, then analyse to unlock your interview.
        </p>
      </div>

      <div style={{ position: 'relative' }}>

        {/* TOP ROW — Company / Role / Voice — always full width, compact */}
        {!atsView && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 'clamp(12px,2vw,20px)', marginBottom: 'clamp(20px,3vw,28px)' }}>
            <div>
              <Label>Target Company</Label>
              <div style={{ position: 'relative' }}>
                <SearchInput value={companySearch}
                  onChange={e => { setCompanySearch(e.target.value); setShowCo(true); setCompany(null); }}
                  onFocus={() => setShowCo(true)}
                  onBlur={() => setTimeout(() => setShowCo(false), 160)}
                  placeholder="Search — Google, Razorpay..."
                  selected={!!company}
                />
                {showCo && companySearch && (
                  <DropMenu>
                    {filtCo.map(co => (
                      <DropItem key={co.name} onMouseDown={() => selCo(co)}>
                        <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: co.color, display: 'inline-block', marginRight: '10px', flexShrink: 0 }}/>
                        {co.name} <span style={{ color: '#444', fontSize: '11px', marginLeft: '6px' }}>{co.sector}</span>
                      </DropItem>
                    ))}
                    {!COMPANIES.find(c => c.name.toLowerCase() === companySearch.toLowerCase()) && (
                      <DropItem onMouseDown={customCo} style={{ color: '#666' }}>+ Use "{companySearch}"</DropItem>
                    )}
                  </DropMenu>
                )}
              </div>
            </div>

            <div>
              <Label>Target Role</Label>
              <div style={{ position: 'relative' }}>
                <SearchInput value={roleSearch}
                  onChange={e => { setRoleSearch(e.target.value); setShowRole(true); setRole(''); }}
                  onFocus={() => setShowRole(true)}
                  onBlur={() => setTimeout(() => setShowRole(false), 160)}
                  placeholder="Search — Frontend Intern, ML Engineer..."
                  selected={!!role}
                />
                {showRole && roleSearch && (
                  <DropMenu>
                    {filtRole.map(r => (
                      <DropItem key={r} onMouseDown={() => selRole(r)}>{r}</DropItem>
                    ))}
                    {!ROLES.find(r => r.toLowerCase() === roleSearch.toLowerCase()) && (
                      <DropItem onMouseDown={customRole} style={{ color: '#666' }}>+ Use "{roleSearch}"</DropItem>
                    )}
                  </DropMenu>
                )}
              </div>
            </div>

            <div>
              <Label>AI Voice</Label>
              <div style={{ display: 'flex', gap: '6px' }}>
                {[{ v: 'female', l: 'Female' }, { v: 'male', l: 'Male' }].map(({ v, l }) => (
                  <button key={v} onClick={() => setAiVoice(v)} style={{ flex: 1, padding: '10px', borderRadius: '7px', cursor: 'pointer', border: `1px solid ${aiVoice === v ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.08)'}`, background: aiVoice === v ? 'rgba(255,255,255,0.06)' : 'transparent', color: aiVoice === v ? '#fff' : '#555', fontSize: '13px', fontFamily: 'Inter,sans-serif', transition: 'all 0.15s' }}>{l}</button>
                ))}
                <button onClick={() => speak('Hello, I am your AI interviewer. Are you ready?', aiVoice)} style={{ padding: '10px 12px', borderRadius: '7px', border: '1px solid rgba(255,255,255,0.08)', background: 'transparent', color: '#444', fontSize: '12px', fontFamily: 'Inter,sans-serif', cursor: 'pointer', flexShrink: 0 }}
                  onMouseEnter={e => e.currentTarget.style.color = '#999'} onMouseLeave={e => e.currentTarget.style.color = '#444'}>Preview</button>
              </div>
            </div>
          </div>
        )}

        {/* RESUME + JD — side by side, compact, no page scroll */}
        {!atsView && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'clamp(12px,2vw,20px)', marginBottom: '16px' }}>
            <div style={{ animation: analysing ? 'fadeOutLeft 0.5s ease forwards' : 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <Label>Your Resume</Label>
                <div style={{ display: 'flex', gap: '4px', background: '#0a0a0a', borderRadius: '6px', padding: '3px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  {[{ id: 'paste', l: 'Paste' }, { id: 'upload', l: 'Upload' }].map(t => (
                    <button key={t.id} onClick={() => setResumeTab(t.id)} style={{ padding: '4px 11px', borderRadius: '4px', border: 'none', cursor: 'pointer', background: resumeTab === t.id ? '#fff' : 'transparent', color: resumeTab === t.id ? '#000' : '#444', fontSize: '11px', fontWeight: resumeTab === t.id ? 600 : 400, fontFamily: 'Inter,sans-serif', transition: 'all 0.15s' }}>{t.l}</button>
                  ))}
                </div>
              </div>
              {resumeTab === 'paste' ? (
                <textarea value={resumeText} onChange={e => setResumeText(e.target.value)} rows={9}
                  placeholder="Paste your full resume here — experience, projects, skills, education..."
                  style={{ width: '100%', height: '220px', background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '12px 14px', color: '#ededed', fontSize: '12px', fontFamily: 'Inter,sans-serif', fontWeight: 300, lineHeight: 1.6, resize: 'none', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.15s', overflowY: 'auto' }}
                  onFocus={e => e.target.style.borderColor = 'rgba(255,255,255,0.3)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                />
              ) : (
                <div onClick={() => fileRef.current?.click()} style={{ height: '220px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '1px dashed rgba(255,255,255,0.15)', borderRadius: '8px', padding: '20px', textAlign: 'center', cursor: 'pointer', transition: 'all 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'}
                >
                  {pdfLoading ? (
                    <>
                      <div style={{ fontSize: '12px', color: '#888', fontFamily: 'JetBrains Mono,monospace' }}>Extracting text...</div>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', marginTop: '14px' }}>
                        {[0,1,2].map(i => <div key={i} style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#fff', animation: `bounce 1.2s ${i*0.18}s infinite` }}/>)}
                      </div>
                    </>
                  ) : (
                    <>
                      <div style={{ fontSize: '13px', color: '#ededed', marginBottom: '4px' }}>
                        {resumeText && !resumeText.startsWith('[') ? `${resumeText.length} characters extracted` : 'Click to upload PDF'}
                      </div>
                      <div style={{ fontSize: '11px', color: '#444' }}>PDF — max 5MB</div>
                    </>
                  )}
                  <input ref={fileRef} type="file" accept=".pdf,.txt,.doc" onChange={handlePDF} style={{ display: 'none' }}/>
                </div>
              )}
            </div>

            <div style={{ animation: analysing ? 'fadeOutRight 0.5s ease forwards' : 'none' }}>
              <Label>Job Description</Label>
              <textarea value={jobDesc} onChange={e => setJobDesc(e.target.value)} rows={9}
                placeholder="Paste the job description here..."
                style={{ width: '100%', height: '220px', marginTop: '8px', background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '12px 14px', color: '#ededed', fontSize: '12px', fontFamily: 'Inter,sans-serif', fontWeight: 300, lineHeight: 1.6, resize: 'none', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.15s', overflowY: 'auto' }}
                onFocus={e => e.target.style.borderColor = 'rgba(255,255,255,0.3)'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
              />
            </div>
          </div>
        )}

        {/* Analyse button + hint — full width below both panels */}
        {!atsView && (
          <div>
            <button onClick={handleAnalyse} disabled={!canAnalyse || analysing}
              style={{ width: '100%', padding: '13px', borderRadius: '8px', border: 'none', background: canAnalyse ? '#fff' : 'rgba(255,255,255,0.06)', color: canAnalyse ? '#000' : '#444', fontSize: '14px', fontWeight: 600, fontFamily: 'Inter,sans-serif', cursor: canAnalyse ? 'pointer' : 'not-allowed', transition: 'all 0.15s' }}
              onMouseEnter={e => { if (canAnalyse) e.currentTarget.style.background = '#ededed'; }}
              onMouseLeave={e => { if (canAnalyse) e.currentTarget.style.background = '#fff'; }}
            >{analysing ? 'Analysing...' : 'Analyse Resume'}</button>

            {!canAnalyse && (
              <div style={{ marginTop: '10px', fontSize: '12px', color: '#444', lineHeight: 1.6 }}>
                {!company || !role ? 'Select a company and role, ' : ''}
                {(!resumeText || resumeText.trim().length <= 30) ? 'add your resume, ' : ''}
                {(!jobDesc || jobDesc.trim().length <= 20) ? 'and paste the job description ' : ''}
                to unlock analysis.
              </div>
            )}
          </div>
        )}

        {/* ATS result — full width, replaces everything above when shown */}
        {atsView && (
          <div style={{ animation: 'fadeInUp 0.5s cubic-bezier(0.16,1,0.3,1) both', maxWidth: '760px' }}>
            {analysing ? (
              <div style={{ padding: '60px 20px', textAlign: 'center' }}>
                <div style={{ fontSize: '11px', color: '#444', fontFamily: 'JetBrains Mono,monospace', letterSpacing: '0.08em', marginBottom: '20px' }}>ANALYSING RESUME...</div>
                <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                  {[0,1,2].map(i => <div key={i} style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#fff', animation: `bounce 1.2s ${i*0.18}s infinite` }}/>)}
                </div>
              </div>
            ) : atsResult ? (
              <ATSResult result={atsResult} onBack={handleBack} onStart={onStart} loading={loading} readyToStart={readyToStart}/>
            ) : null}
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeOutLeft  { from{opacity:1} to{opacity:0;transform:translateX(-10px)} }
        @keyframes fadeOutRight { from{opacity:1} to{opacity:0;transform:translateX(10px)} }
        @keyframes fadeInUp     { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes bounce       { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-7px)} }
        textarea::placeholder, input::placeholder { color:#333!important }
      `}</style>
    </div>
  );
}

function ATSResult({ result, onBack, onStart, loading, readyToStart }) {
  const gradeColor = result.ats_score >= 80 ? '#fff' : result.ats_score >= 60 ? '#aaa' : '#777';
  return (
    <div style={{ animation: 'slideInLeft 0.5s ease both' }}>

      <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 14px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: '#555', fontSize: '12px', fontFamily: 'Inter,sans-serif', cursor: 'pointer', marginBottom: '24px', transition: 'all 0.15s' }}
        onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'; }}
        onMouseLeave={e => { e.currentTarget.style.color = '#555'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
      >‹ Back to Resume</button>

      {/* Score hero card */}
      <div style={{ border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '28px', marginBottom: '20px', background: 'radial-gradient(circle at top right, rgba(255,255,255,0.04), transparent 60%)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', width: '110px', height: '110px', flexShrink: 0 }}>
            <svg width="110" height="110" style={{ transform: 'rotate(-90deg)' }}>
              <circle cx="55" cy="55" r="48" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="7"/>
              <circle cx="55" cy="55" r="48" fill="none" stroke={gradeColor} strokeWidth="7" strokeLinecap="round"
                strokeDasharray={`${2*Math.PI*48}`} strokeDashoffset={`${2*Math.PI*48*(1-result.ats_score/100)}`}
                style={{ transition: 'stroke-dashoffset 1.2s ease 0.2s' }}/>
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ fontSize: '30px', fontWeight: 900, color: '#fff', letterSpacing: '-0.04em', lineHeight: 1 }}>{result.ats_score}</div>
              <div style={{ fontSize: '9px', color: '#444', fontFamily: 'JetBrains Mono,monospace', marginTop: '1px' }}>/ 100</div>
            </div>
          </div>
          <div style={{ flex: 1, minWidth: '180px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <span style={{ fontSize: '22px', fontWeight: 800, color: '#fff', letterSpacing: '-0.03em' }}>Grade {result.grade}</span>
            </div>
            <div style={{ fontSize: '13px', color: '#888', lineHeight: 1.6 }}>{result.verdict}</div>
          </div>
        </div>
      </div>

      {/* Score bars */}
      <div style={{ border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '18px 20px', marginBottom: '16px', background: '#0a0a0a' }}>
        {[
          { l: 'Keyword Match',  v: result.keyword_density  || 0 },
          { l: 'Readability',    v: result.readability_score || 0 },
          { l: 'Action Verbs',   v: result.action_verb_score || 0 },
        ].map(({ l, v }, i) => (
          <div key={l} style={{ marginBottom: i<2?'14px':0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontSize: '12px', color: '#888' }}>{l}</span>
              <span style={{ fontSize: '12px', color: '#fff', fontFamily: 'JetBrains Mono,monospace', fontWeight: 600 }}>{v}%</span>
            </div>
            <div style={{ height: '4px', background: 'rgba(255,255,255,0.06)', borderRadius: '2px' }}>
              <div style={{ height: '100%', background: '#fff', borderRadius: '2px', width: `${v}%`, transition: 'width 1s ease 0.3s' }}/>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
        <ATSSection title="Found in Resume" tone="positive">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {result.strong_keywords?.length ? result.strong_keywords.map(k => <Chip key={k} label={k} bright/>) : <span style={{ fontSize:'12px', color:'#333' }}>None detected</span>}
          </div>
        </ATSSection>
        <ATSSection title="Missing Keywords" tone="negative">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {result.missing_keywords?.length ? result.missing_keywords.map(k => <Chip key={k} label={k}/>) : <span style={{ fontSize:'12px', color:'#333' }}>None — great coverage</span>}
          </div>
        </ATSSection>
      </div>

      <ATSSection title="Formatting Issues">
        {result.formatting_issues?.map((f, i) => <ATSRow key={i} icon="—" text={f}/>)}
      </ATSSection>

      <ATSSection title="Weak Phrases to Remove">
        {result.weak_phrases?.map((f, i) => <ATSRow key={i} icon="✕" text={f}/>)}
      </ATSSection>

      <ATSSection title="How to Make It 10/10" tone="positive">
        {result.how_to_make_perfect?.map((tip, i) => <ATSRow key={i} icon={`${i+1}`} text={tip} bright/>)}
      </ATSSection>

      {readyToStart && (
        <button onClick={onStart} disabled={loading} style={{ width: '100%', marginTop: '12px', padding: '14px', borderRadius: '10px', border: 'none', background: '#fff', color: '#000', fontSize: '14px', fontWeight: 700, fontFamily: 'Inter,sans-serif', cursor: loading ? 'wait' : 'pointer', opacity: loading ? 0.5 : 1, transition: 'all 0.15s' }}
          onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#ededed'; }}
          onMouseLeave={e => e.currentTarget.style.background = '#fff'}
        >{loading ? 'Preparing your interview...' : 'Start Interview'}</button>
      )}
    </div>
  );
}

function Label({ children }) {
  return <div style={{ fontSize: '11px', color: '#444', letterSpacing: '0.08em', marginBottom: '8px', textTransform: 'uppercase', fontFamily: 'JetBrains Mono,monospace' }}>{children}</div>;
}

function SearchInput({ value, onChange, onFocus, onBlur, placeholder, selected }) {
  return (
    <div style={{ position: 'relative' }}>
      <input value={value} onChange={onChange} onFocus={onFocus} onBlur={onBlur} placeholder={placeholder}
        style={{ width: '100%', background: '#0a0a0a', border: `1px solid ${selected ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.1)'}`, borderRadius: '8px', padding: '10px 36px 10px 36px', color: '#fff', fontSize: '13px', fontFamily: 'Inter,sans-serif', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.15s' }}
        onFocus={e => e.target.style.borderColor = 'rgba(255,255,255,0.35)'}
        onBlur={e => e.target.style.borderColor = selected ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.1)'}
      />
      <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#333', fontSize: '14px' }}>⌕</span>
      {selected && <span style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#fff', fontSize: '13px' }}>✓</span>}
    </div>
  );
}

function DropMenu({ children }) {
  return (
    <div style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, zIndex: 50, background: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', maxHeight: '200px', overflowY: 'auto', boxShadow: '0 20px 40px rgba(0,0,0,0.8)' }}>
      {children}
    </div>
  );
}

function DropItem({ children, onMouseDown, style: extra = {} }) {
  return (
    <div onMouseDown={onMouseDown}
      style={{ padding: '10px 14px', cursor: 'pointer', fontSize: '13px', color: '#ededed', display: 'flex', alignItems: 'center', transition: 'background 0.1s', ...extra }}
      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
    >{children}</div>
  );
}

function ATSSection({ title, children, tone }) {
  const border = tone==='positive' ? 'rgba(255,255,255,0.1)' : tone==='negative' ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.06)';
  return (
    <div style={{ marginBottom: '12px' }}>
      <div style={{ fontSize: '10px', color: '#444', letterSpacing: '0.1em', fontFamily: 'JetBrains Mono,monospace', marginBottom: '8px', textTransform: 'uppercase' }}>{title}</div>
      <div style={{ padding: '14px', border: `1px solid ${border}`, borderRadius: '10px', background: '#0a0a0a' }}>
        {children}
      </div>
    </div>
  );
}

function Chip({ label, bright }) {
  return (
    <span style={{ padding: '4px 11px', borderRadius: '5px', fontSize: '12px', fontFamily: 'JetBrains Mono,monospace', border: `1px solid ${bright ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.07)'}`, color: bright ? '#fff' : '#444', background: bright ? 'rgba(255,255,255,0.04)' : 'transparent' }}>
      {label}
    </span>
  );
}

function ATSRow({ icon, text, bright }) {
  return (
    <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', marginBottom: '8px' }}>
      <span style={{ fontSize: '11px', color: '#444', flexShrink: 0, fontFamily: 'JetBrains Mono,monospace', marginTop: '2px', minWidth: '16px' }}>{icon}</span>
      <span style={{ fontSize: '13px', color: bright ? '#ededed' : '#666', lineHeight: 1.65 }}>{text}</span>
    </div>
  );
}