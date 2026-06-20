import { createContext, useContext, useState, useCallback } from 'react';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [user,          setUser]          = useState(null);
  const [profile,       setProfile]       = useState({
    name: '', email: '', gender: 'male', college: '',
    degree: '', year: '', targetRole: '', linkedin: '', github: '',
  });
  const [sessions,      setSessions]      = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [screen,        setScreen]        = useState('landing');
  const [sidebarOpen,   setSidebarOpen]   = useState(true);

  // Interview state
  const [company,    setCompany]    = useState(null);
  const [role,       setRole]       = useState('');
  const [aiVoice,    setAiVoice]    = useState('female');
  const [resumeText, setResumeText] = useState('');
  const [jobDesc,    setJobDesc]    = useState('');
  const [atsResult,  setAtsResult]  = useState(null);
  const [questions,  setQuestions]  = useState([]);
  const [qIndex,     setQIndex]     = useState(0);
  const [chatLog,    setChatLog]    = useState([]);

  const login = useCallback((data) => {
    setUser(data);
    setProfile(data);
    setScreen('dashboard');
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setScreen('landing');
  }, []);

  const addSession = useCallback((session) => {
    setSessions(prev => [session, ...prev]);
  }, []);

  const updateProfile = useCallback((updates) => {
    setProfile(prev => ({ ...prev, ...updates }));
    setUser(prev => ({ ...prev, ...updates }));
  }, []);

  return (
    <AppContext.Provider value={{
      user, profile, sessions, activeSession, screen, sidebarOpen,
      company, role, aiVoice, resumeText, jobDesc, atsResult,
      questions, qIndex, chatLog,
      setScreen, setSidebarOpen, setCompany, setRole, setAiVoice,
      setResumeText, setJobDesc, setAtsResult, setQuestions,
      setQIndex, setChatLog, setActiveSession,
      login, logout, addSession, updateProfile,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
