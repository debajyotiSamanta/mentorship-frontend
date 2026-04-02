import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AuthPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { login, register } = useAuth();
  
  const [isLogin, setIsLogin] = useState(location.pathname === '/login');
  
  // Sync state with URL without reloading
  useEffect(() => {
    setIsLogin(location.pathname === '/login' || location.pathname === '/');
  }, [location.pathname]);

  const toggleMode = (path) => {
    navigate(path);
  };

  // --- Login State ---
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);
    try {
      await login(loginEmail, loginPassword);
      navigate('/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      let errorMessage = 'Failed to sign in. Please check your email and password.';
      
      if (err.userMessage) {
        errorMessage = err.userMessage;
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setLoginError(errorMessage);
    } finally {
      setLoginLoading(false);
    }
  };

  // --- Register State ---
  const [regData, setRegData] = useState({ email: '', password: '', full_name: '', role: 'student', skills: '', availability: '' });
  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError] = useState('');

  const handleRegChange = (e) => {
    setRegData({ ...regData, [e.target.name]: e.target.value });
  };

  const handleRegSubmit = async (e) => {
    e.preventDefault();
    setRegError('');
    setRegLoading(true);
    try {
      if (regData.password.length < 6) {
        setRegError('Password must be at least 6 characters long');
        setRegLoading(false);
        return;
      }
      
      await register(regData.email, regData.password, regData.full_name, regData.role, regData.skills, regData.availability);
      navigate('/dashboard');
    } catch (err) {
      console.error('Register error:', err);
      let errorMessage = 'Failed to create account. Please try again.';
      
      if (err.userMessage) {
        errorMessage = err.userMessage;
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setRegError(errorMessage);
    } finally {
      setRegLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] w-full flex bg-dark-900 font-sans selection:bg-indigo-500/30 overflow-hidden">
      
      {/* LEFT COLUMN: Art & Branding (Static Container with Animating Content) */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden bg-black flex-col justify-between p-12">
        {/* Animated Mesh Background */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-[30%] left-[20%] w-[500px] h-[500px] bg-indigo-600 rounded-full mix-blend-screen filter blur-[120px] opacity-40 animate-blob transition-all duration-1000"></div>
          <div className={`absolute w-[400px] h-[400px] bg-primary-600 rounded-full mix-blend-screen filter blur-[100px] opacity-30 animate-blob transition-all duration-1000 ${isLogin ? 'top-[-10%] right-[-10%]' : 'bottom-[-10%] right-[10%]'}`} style={{ animationDelay: '2s' }}></div>
          <div className={`absolute w-[600px] h-[600px] bg-purple-600 rounded-full mix-blend-screen filter blur-[120px] opacity-30 animate-blob transition-all duration-1000 ${isLogin ? 'bottom-[-20%] left-[20%]' : 'top-[10%] left-[-10%]'}`} style={{ animationDelay: '4s' }}></div>
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/stardust.png")' }}></div>
        </div>

        <div className="relative z-10 transition-transform duration-700 ease-out transform" style={{ transform: isLogin ? 'translateY(0)' : 'translateY(10px)' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <span className="text-white font-bold text-xl tracking-wide">MentorSpace Connect</span>
          </div>
        </div>

        <div className="relative z-10 max-w-lg">
          <div className="relative h-40">
            {/* Login Copy */}
            <div className={`absolute inset-0 transition-all duration-700 ease-in-out ${isLogin ? 'opacity-100 translate-x-0 blur-none' : 'opacity-0 -translate-x-10 blur-sm pointer-events-none'}`}>
              <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 leading-tight mb-6 mt-6">
                Welcome back to your workspace.
              </h1>
              <p className="text-lg text-gray-400 font-medium leading-relaxed">
                Log in to resume your active sessions, connect with your partners, and keep building.
              </p>
            </div>
            
            {/* Register Copy */}
            <div className={`absolute inset-0 transition-all duration-700 ease-in-out ${!isLogin ? 'opacity-100 translate-x-0 blur-none' : 'opacity-0 translate-x-10 blur-sm pointer-events-none'}`}>
              <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 leading-tight mb-6 mt-6">
                Share expertise.<br/>Shape futures.
              </h1>
              <p className="text-lg text-gray-400 font-medium leading-relaxed">
                Join thousands of mentors and students engaged in collaborative 1-on-1 programming.
              </p>
            </div>
          </div>
        </div>
        
        <div className="relative z-10 flex items-center gap-4 text-sm font-medium text-gray-500">
          <span>© 2026 MentorSpace</span>
        </div>
      </div>

      {/* RIGHT COLUMN: Form Container */}
      <div className="w-full lg:w-1/2 flex justify-center p-4 sm:p-12 relative overflow-hidden bg-dark-900 lg:bg-transparent">
        
        {/* Mobile active background mesh */}
        <div className="absolute inset-0 z-0 lg:hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600 rounded-full filter blur-[100px] opacity-20 animate-blob"></div>
        </div>

        <div className="relative z-10 w-full max-w-md h-[450px] sm:h-[650px] lg:h-auto my-auto md:my-0 mt-8 sm:mt-0">
          
          {/* ----- LOGIN FORM PANEL ----- */}
          <div className={`absolute top-0 w-full lg:bg-white/5 lg:backdrop-blur-xl lg:border lg:border-white/10 lg:p-10 lg:shadow-2xl rounded-3xl transition-all duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${isLogin ? 'opacity-100 translate-x-0 z-20 visible' : 'opacity-0 translate-x-[-120%] z-0 invisible'}`}>
            <div className="text-center lg:text-left mb-8">
              <h2 className="text-3xl font-bold text-white tracking-tight mb-2">Welcome back</h2>
              <p className="text-gray-400 text-sm">Please enter your details to sign in.</p>
            </div>

            {loginError && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-500 text-sm px-4 py-3 rounded-xl mb-6 flex items-center gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span>{loginError}</span>
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5 ml-1">Email address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                  </div>
                  <input 
                    type="email" required
                    className="w-full bg-dark-800/50 border border-white/10 rounded-xl pl-11 pr-4 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 focus:bg-dark-800 transition-all shadow-inner"
                    value={loginEmail} onChange={e => setLoginEmail(e.target.value)} placeholder="name@example.com"
                  />
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-1.5 ml-1 pr-1">
                  <label className="block text-sm font-medium text-gray-300">Password</label>
                  <a href="#" className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors">Forgot password?</a>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <input 
                    type="password" required
                    className="w-full bg-dark-800/50 border border-white/10 rounded-xl pl-11 pr-4 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 focus:bg-dark-800 transition-all shadow-inner"
                    value={loginPassword} onChange={e => setLoginPassword(e.target.value)} placeholder="••••••••"
                  />
                </div>
              </div>

              <button 
                type="submit" disabled={loginLoading}
                className="w-full relative mt-4 overflow-hidden group bg-white text-black font-semibold py-3.5 rounded-xl transition-all hover:bg-gray-100 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(255,255,255,0.1)] flex justify-center items-center gap-2"
              >
                {loginLoading ? (
                  <><div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin"></div><span>Signing in...</span></>
                ) : 'Sign in'}
              </button>
            </form>

            <p className="mt-8 text-center text-sm text-gray-400">
              Don't have an account?{' '}
              <button onClick={() => toggleMode('/register')} className="text-white font-semibold hover:text-indigo-400 transition-colors">
                Sign up for free
              </button>
            </p>
          </div>

          {/* ----- REGISTER FORM PANEL ----- */}
          <div className={`absolute top-0 w-full lg:bg-white/5 lg:backdrop-blur-xl lg:border lg:border-white/10 lg:p-10 lg:shadow-2xl rounded-3xl transition-all duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${!isLogin ? 'opacity-100 translate-x-0 z-20 visible' : 'opacity-0 translate-x-[120%] z-0 invisible'}`}>
            <div className="text-center lg:text-left mb-6">
              <h2 className="text-3xl font-bold text-white tracking-tight mb-2">Create an account</h2>
              <p className="text-gray-400 text-sm">Join the platform to start teaching or learning.</p>
            </div>

            {regError && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-500 text-sm px-4 py-3 rounded-xl mb-4 flex items-center gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span>{regError}</span>
              </div>
            )}

            <form onSubmit={handleRegSubmit} className="space-y-4">
              {/* Role Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2 ml-1">I want to join as a:</label>
                <div className="grid grid-cols-2 gap-4">
                  <label className={`
                    relative flex items-center justify-center p-3 rounded-xl border-2 cursor-pointer transition-all duration-300 group
                    ${regData.role === 'student' ? 'border-indigo-500 bg-indigo-500/10 shadow-[0_0_15px_rgba(99,102,241,0.2)]' : 'border-white/10 bg-dark-800/50 hover:bg-dark-800 hover:border-white/20'}
                  `}>
                    <input type="radio" name="role" value="student" checked={regData.role === 'student'} onChange={handleRegChange} className="hidden" />
                    <div className="flex flex-col items-center gap-1.5">
                      <div className={`p-1.5 rounded-full ${regData.role === 'student' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-dark-700 text-gray-400'}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
                        </svg>
                      </div>
                      <span className={`font-semibold text-xs ${regData.role === 'student' ? 'text-white' : 'text-gray-400'}`}>Student</span>
                    </div>
                  </label>

                  <label className={`
                    relative flex items-center justify-center p-3 rounded-xl border-2 cursor-pointer transition-all duration-300
                    ${regData.role === 'mentor' ? 'border-purple-500 bg-purple-500/10 shadow-[0_0_15px_rgba(168,85,247,0.2)]' : 'border-white/10 bg-dark-800/50 hover:bg-dark-800 hover:border-white/20'}
                  `}>
                    <input type="radio" name="role" value="mentor" checked={regData.role === 'mentor'} onChange={handleRegChange} className="hidden" />
                    <div className="flex flex-col items-center gap-1.5">
                      <div className={`p-1.5 rounded-full ${regData.role === 'mentor' ? 'bg-purple-500/20 text-purple-400' : 'bg-dark-700 text-gray-400'}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                        </svg>
                      </div>
                      <span className={`font-semibold text-xs ${regData.role === 'mentor' ? 'text-white' : 'text-gray-400'}`}>Mentor</span>
                    </div>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1 ml-1">Full Name</label>
                <input 
                  type="text" name="full_name" required
                  className="w-full bg-dark-800/50 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 focus:bg-dark-800 transition-all shadow-inner"
                  value={regData.full_name} onChange={handleRegChange} placeholder="John Doe"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1 ml-1">Email address</label>
                <input 
                  type="email" name="email" required
                  className="w-full bg-dark-800/50 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 focus:bg-dark-800 transition-all shadow-inner"
                  value={regData.email} onChange={handleRegChange} placeholder="name@example.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1 ml-1">Password</label>
                <input 
                  type="password" name="password" required minLength={6}
                  className="w-full bg-dark-800/50 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 focus:bg-dark-800 transition-all shadow-inner"
                  value={regData.password} onChange={handleRegChange} placeholder="Create a strong password"
                />
              </div>

              {/* MENTOR ONLY FIELDS */}
              {regData.role === 'mentor' && (
                <div className="space-y-4 animate-[fadeIn_0.3s_ease-out]">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1 ml-1">Your Skills (comma separated)</label>
                    <input 
                      type="text" name="skills" required
                      className="w-full bg-indigo-900/10 border border-indigo-500/30 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all shadow-inner"
                      value={regData.skills} onChange={handleRegChange} placeholder="e.g. React, Node.js, Python"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1 ml-1">Availability</label>
                    <input 
                      type="text" name="availability" required
                      className="w-full bg-indigo-900/10 border border-indigo-500/30 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all shadow-inner"
                      value={regData.availability} onChange={handleRegChange} placeholder="e.g. Weekends 10am-2pm EST"
                    />
                  </div>
                </div>
              )}

              <button 
                type="submit" disabled={regLoading}
                className={`
                  w-full relative mt-4 overflow-hidden bg-gradient-to-r text-white font-bold py-3.5 rounded-xl transition-all shadow-lg hover:shadow-xl active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2
                  ${regData.role === 'mentor' ? 'from-purple-600 to-indigo-600 shadow-purple-500/25' : 'from-indigo-600 to-blue-600 shadow-indigo-500/25'}
                `}
              >
                {regLoading ? (
                  <><div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div><span>Creating account...</span></>
                ) : 'Create Account'}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-400">
              Already have an account?{' '}
              <button onClick={() => toggleMode('/login')} className="text-white font-semibold hover:text-indigo-400 transition-colors">
                Sign in here
              </button>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
