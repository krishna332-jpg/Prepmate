export const T = {
  // Pure black like Vercel
  bg:       '#000000',
  bgMid:    '#0a0a0a',
  bgCard:   '#111111',
  bgCardLt: '#1a1a1a',
  bgHover:  '#222222',

  // White primary
  white:    '#ffffff',
  gray1:    '#ededed',
  gray2:    '#a1a1a1',
  gray3:    '#666666',
  gray4:    '#333333',
  gray5:    '#1a1a1a',

  // Accent — Vercel uses white/black but we add subtle blue
  blue:     '#0070f3',
  blueLt:   '#3291ff',
  blueDim:  'rgba(0,112,243,0.15)',

  green:   '#50e3c2',
  red:     '#e00',
  amber:   '#f5a623',

  // Borders — very subtle like Vercel
  border:    'rgba(255,255,255,0.1)',
  borderDim: 'rgba(255,255,255,0.06)',

  // Fonts — Vercel uses Geist, we use Inter
  display: "'Inter', 'Helvetica Neue', sans-serif",
  body:    "'Inter', 'Helvetica Neue', sans-serif",
  mono:    "'JetBrains Mono', monospace",

  sm: '6px', md: '8px', lg: '12px', xl: '16px',
};

export const COMPANIES = [
  { name:'Google',    color:'#4285F4', sector:'Big Tech' },
  { name:'Microsoft', color:'#00A4EF', sector:'Big Tech' },
  { name:'Amazon',    color:'#FF9900', sector:'Big Tech' },
  { name:'Apple',     color:'#555555', sector:'Big Tech' },
  { name:'Meta',      color:'#0866FF', sector:'Big Tech' },
  { name:'Swiggy',    color:'#FC8019', sector:'Startup' },
  { name:'Razorpay',  color:'#2EB88A', sector:'Fintech' },
  { name:'Infosys',   color:'#007CC2', sector:'IT Services' },
  { name:'TCS',       color:'#E31837', sector:'IT Services' },
  { name:'CRED',      color:'#E11D48', sector:'Startup' },
  { name:'Wipro',     color:'#804090', sector:'IT Services' },
  { name:'Zepto',     color:'#8B5CF6', sector:'Startup' },
  { name:'PhonePe',   color:'#5F259F', sector:'Fintech' },
  { name:'Flipkart',  color:'#2874F0', sector:'E-commerce' },
  { name:'Zomato',    color:'#E23744', sector:'Startup' },
];

export const ROLES = [
  'Software Engineer Intern','Full Stack Developer Intern','Frontend Engineer Intern',
  'Backend Engineer Intern','Data Science Intern','ML Engineer Intern',
  'QA Engineer Intern','DevOps Intern','Android Developer Intern',
  'iOS Developer Intern','Data Analyst Intern','Product Engineer Intern',
  'Cloud Engineer Intern','Cybersecurity Intern','UI/UX Design Intern',
];

export const SAMPLE_QUESTIONS = [
  "Walk me through your most technically challenging project from your resume.",
  "You listed React in your skills — explain the virtual DOM and why it matters.",
  "Describe a situation where you had to debug a critical issue under pressure.",
  "Tell me about a conflict in a team and how you resolved it.",
  "Why do you specifically want to join this company over others?",
  "Explain a data structure you used in your project and why you chose it.",
  "What is your biggest technical weakness and how are you addressing it?",
  "Where do you see yourself in 3 years if you get this internship?",
];
