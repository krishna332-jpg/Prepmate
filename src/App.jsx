import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, logOut } from './firebase';
import { Navbar }           from './components/Navbar';
import { Landing }          from './components/Landing';
import { Auth, GoogleDetailsForm } from './components/Auth';
import { Dashboard }        from './components/Dashboard';
import { PrepScreen }       from './components/PrepScreen';
import { Interview }        from './components/Interview';
import { Report }           from './components/Report';
import { Sessions }         from './components/Sessions';
import { Tracker }          from './components/Tracker';
import { ProfileModal }     from './components/ProfileModal';
import { analyseResume, generateQuestions, evaluateAnswer } from './utils/claude';
import { SAMPLE_QUESTIONS } from './styles/tokens';
import { formatDate, formatTime } from './utils/helpers';

export default function App() {
  const [screen,        setScreen]       = useState('landing');
  const [authMode,      setAuthMode]     = useState('signup');
  const [user,          setUser]         = useState(null);
  const [profile,       setProfile]      = useState({ name:'', email:'', gender:'male', college:'', degree:'', year:'', targetRole:'', password:'' });
  const [profileOpen,   setProfileOpen]  = useState(false);
  const [googleNewUser, setGoogleNewUser]= useState(null);

  const [company,       setCompany]      = useState(null);
  const [role,          setRole]         = useState('');
  const [aiVoice,       setAiVoice]      = useState('female');
  const [resumeText,    setResumeText]   = useState('');
  const [jobDesc,       setJobDesc]      = useState('');
  const [atsResult,     setAtsResult]    = useState(null);

  const [questions,     setQuestions]    = useState([]);
  const [qIndex,        setQIndex]       = useState(0);
  const [chatLog,       setChatLog]      = useState([]);
  const [aiThinking,    setAiThinking]   = useState(false);
  const [loading,       setLoading]      = useState(false);

  const [sessions,      setSessions]     = useState([]);
  const [activeSession, setActiveSession]= useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser && screen === 'landing') {
        const u = { name: firebaseUser.displayName || firebaseUser.email?.split('@')[0], email: firebaseUser.email, uid: firebaseUser.uid };
        setUser(u);
        setScreen('dashboard');
      }
    });
    return () => unsub();
  }, []);

  const handleAuth = () => {
    const name = profile.name?.trim() || profile.email?.split('@')[0] || 'User';
    setUser({ name, email: profile.email, college: profile.college||'', degree: profile.degree||'', year: profile.year||'', gender: profile.gender||'', targetRole: profile.targetRole||'' });
    setScreen('dashboard');
  };

  const handleGoogleSuccess = (firebaseUser) => {
    const u = { name: firebaseUser.displayName || firebaseUser.email?.split('@')[0], email: firebaseUser.email, uid: firebaseUser.uid };
    setUser(u);
    setScreen('dashboard');
  };

  const handleGoogleNewUser = (firebaseUser) => {
    setGoogleNewUser(firebaseUser);
    setProfile(p => ({ ...p, name: firebaseUser.displayName||'', email: firebaseUser.email||'' }));
    setScreen('google-details');
  };

  const handleGoogleDetailsComplete = () => {
    setUser({ name: googleNewUser.displayName||profile.name, email: googleNewUser.email, uid: googleNewUser.uid, college: profile.college||'', degree: profile.degree||'', year: profile.year||'', gender: profile.gender||'', targetRole: profile.targetRole||'' });
    setGoogleNewUser(null);
    setScreen('dashboard');
  };

  const handleLogout = async () => {
    try { await logOut(); } catch(e) {}
    setUser(null); setScreen('landing'); setProfileOpen(false);
    setSessions([]); setCompany(null); setRole(''); setResumeText(''); setJobDesc(''); setAtsResult(null); setChatLog([]);
  };

  const handleAnalyse = async () => {
    const result = await analyseResume(resumeText, jobDesc);
    setAtsResult(result);
  };

  // ── Reset everything from a prep/interview session when heading back to dashboard ──
  const resetPrepSession = () => {
    setCompany(null); setRole(''); setResumeText(''); setJobDesc(''); setAtsResult(null);
    setQuestions([]); setQIndex(0); setChatLog([]); setAiThinking(false);
  };

  const goToDashboard = () => {
    resetPrepSession();
    setScreen('dashboard');
  };

  const goToPrep = () => {
    resetPrepSession();
    setScreen('prep');
  };

  const handleStart = async () => {
    setLoading(true);
    let qs = null;
    if (resumeText.trim().length > 50) {
      qs = await generateQuestions(company.name, role, resumeText, jobDesc);
    }
    const finalQs = qs && qs.length ? qs : SAMPLE_QUESTIONS.slice(0, 8);
    setQuestions(finalQs);
    setQIndex(0);
    setChatLog([]);
    setLoading(false);
    setScreen('interview');
  };

  // Called when user submits a typed answer in quiz mode
  const handleAutoSubmit = async (ans) => {
    const q = questions[qIndex];
    const questionText = q?.question || q;
    if (!questionText || !ans) return;
    setChatLog(prev => [...prev, { role:'user', text:ans, ts:formatTime() }]);
    setAiThinking(true);
    const fb = await evaluateAnswer(questionText, ans, company?.name, role);
    setChatLog(prev => [...prev, { role:'ai', text:'', ts:formatTime(), isFeedback:true, fb }]);
    setAiThinking(false);
    setQIndex(i => i + 1);
    return fb; // Interview.jsx reads this directly
  };

  const finishInterview = () => {
    const fbs   = chatLog.filter(c => c.isFeedback && c.fb);
    const avg   = fbs.length ? fbs.reduce((a,b) => a+b.fb.score, 0)/fbs.length : 5;
    const session = { id:Date.now(), company:company?.name, role, date:formatDate(), score:Math.round(avg*10), chatLog:[...chatLog], questions:[...questions] };
    setSessions(prev => [session, ...prev]);
    setActiveSession(session);
    setScreen('report');
  };

  return (
    <div style={{ minHeight:'100vh', background:'#000', overflowX:'hidden' }}>
      <div style={{ position:'fixed', inset:0, pointerEvents:'none', zIndex:0, backgroundImage:'radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px)', backgroundSize:'32px 32px' }}/>
      {user && screen !== 'google-details' && (
        <Navbar screen={screen} setScreen={(s) => s === 'dashboard' ? goToDashboard() : s === 'prep' ? goToPrep() : setScreen(s)} user={user} onProfileOpen={() => setProfileOpen(true)} />
      )}
      <main style={{ position:'relative', zIndex:1 }}>
        {screen==='landing'        && <Landing        onGetStarted={()=>{ setAuthMode('signup'); setScreen('auth'); }} onSignIn={()=>{ setAuthMode('login'); setScreen('auth'); }} />}
        {screen==='auth'           && <Auth           mode={authMode} profile={profile} setProfile={setProfile} onSubmit={handleAuth} onToggle={()=>setAuthMode(m=>m==='signup'?'login':'signup')} onGoogleSuccess={handleGoogleSuccess} onGoogleNewUser={handleGoogleNewUser} />}
        {screen==='google-details' && <GoogleDetailsForm googleUser={googleNewUser} profile={profile} setProfile={setProfile} onComplete={handleGoogleDetailsComplete} />}
        {screen==='dashboard'      && <Dashboard      user={user} sessions={sessions} onStartPrep={goToPrep} onViewSession={s=>{ setActiveSession(s); setScreen('report'); }} onOpenTracker={()=>setScreen('tracker')} />}
        {screen==='tracker'        && <Tracker/>}
        {screen==='prep'           && <PrepScreen     company={company} setCompany={setCompany} role={role} setRole={setRole} aiVoice={aiVoice} setAiVoice={setAiVoice} resumeText={resumeText} setResumeText={setResumeText} jobDesc={jobDesc} setJobDesc={setJobDesc} atsResult={atsResult} onAnalyse={handleAnalyse} onStart={handleStart} loading={loading} />}
        {screen==='interview'      && <Interview      company={company} role={role} questions={questions} qIndex={qIndex} chatLog={chatLog} aiThinking={aiThinking} aiVoice={aiVoice} onAutoSubmit={handleAutoSubmit} onRepeat={()=>setQIndex(i=>Math.max(0,i-1))} onFinish={finishInterview} />}
        {screen==='report'         && <Report         session={activeSession} onNewInterview={goToPrep} onAllSessions={()=>setScreen('sessions')} />}
        {screen==='sessions'       && <Sessions       sessions={sessions} onView={s=>{ setActiveSession(s); setScreen('report'); }} onNewInterview={goToPrep} />}
      </main>
      {profileOpen && user && (
        <ProfileModal user={user} profile={profile} setProfile={setProfile} setUser={setUser} onClose={()=>setProfileOpen(false)} onLogout={handleLogout} />
      )}
    </div>
  );
}