import { useApp } from '../../context/AppContext';

export default function LoginPage() {
  const { API } = useApp();
  return (
    <div
      className="h-screen flex items-center justify-center bg-[#0d1117]"
      style={{ backgroundImage: 'radial-gradient(ellipse at 50% 0%, rgba(99,102,241,0.18) 0%, transparent 65%)' }}
    >
      <div className="bg-[#161b22] border border-white/[0.08] rounded-2xl p-10 flex flex-col items-center gap-6 w-full max-w-sm shadow-2xl">
        {/* Logo */}
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
        </div>

        {/* Text */}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white tracking-tight">Calendar Assistant</h1>
          <p className="text-slate-400 text-sm mt-1.5 leading-relaxed">
            AI-powered scheduling, right in your browser
          </p>
        </div>

        {/* Google Sign-in */}
        <a
          href={`${API}/auth/google`}
          className="w-full flex items-center justify-center gap-3 px-5 py-3 bg-white text-gray-800 rounded-xl font-medium text-sm hover:bg-gray-100 transition-colors shadow-md"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
            <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.17z"/>
            <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 0 1-7.18-2.54H1.83v2.07A8 8 0 0 0 8.98 17z"/>
            <path fill="#FBBC05" d="M4.5 10.52a4.8 4.8 0 0 1 0-3.04V5.41H1.83a8 8 0 0 0 0 7.18l2.67-2.07z"/>
            <path fill="#EA4335" d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.83 5.4L4.5 7.49a4.77 4.77 0 0 1 4.48-3.3z"/>
          </svg>
          Continue with Google
        </a>

        <p className="text-slate-600 text-xs text-center">
          Connects securely via Google OAuth 2.0
        </p>
      </div>
    </div>
  );
}
