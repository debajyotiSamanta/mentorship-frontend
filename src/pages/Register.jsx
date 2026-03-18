import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    role: 'student'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      await register(formData.email, formData.password, formData.full_name, formData.role);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-dark-900 font-sans selection:bg-primary-500/30">
      
      {/* Left Column: Branding / Art (Hidden on mobile) */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden bg-black flex-col justify-between p-12">
        
        {/* Animated Mesh Background */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-[30%] left-[20%] w-[500px] h-[500px] bg-indigo-600 rounded-full mix-blend-screen filter blur-[120px] opacity-40 animate-blob"></div>
          <div className="absolute top-[-10%] right-[-10%] w-[400px] h-[400px] bg-primary-600 rounded-full mix-blend-screen filter blur-[100px] opacity-30 animate-blob" style={{ animationDelay: '2s' }}></div>
          <div className="absolute bottom-[-10%] right-[10%] w-[600px] h-[600px] bg-purple-600 rounded-full mix-blend-screen filter blur-[120px] opacity-30 animate-blob" style={{ animationDelay: '4s' }}></div>
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/stardust.png")' }}></div>
        </div>

        <div className="relative z-10">
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
          <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 leading-tight mb-6 mt-12">
            Share expertise. <br/> Shape futures.
          </h1>
          <p className="text-lg text-gray-400 font-medium leading-relaxed">
            Join thousands of mentors and students engaged in profound 1-on-1 collaborative programming sessions.
          </p>
          
          <div className="mt-10 flex gap-4">
            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10">
              <h3 className="text-white font-bold text-2xl">10k+</h3>
              <p className="text-sm text-gray-400">Active Students</p>
            </div>
            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10">
              <h3 className="text-white font-bold text-2xl">99%</h3>
              <p className="text-sm text-gray-400">Match Success</p>
            </div>
          </div>
        </div>
        
        <div className="relative z-10 flex items-center gap-4 text-sm font-medium text-gray-500">
          <span>© 2026 MentorSpace</span>
        </div>
      </div>

      {/* Right Column: Register Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative overflow-hidden bg-dark-900 lg:bg-transparent">
        
        {/* Mobile background */}
        <div className="absolute inset-0 z-0 lg:hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600 rounded-full filter blur-[100px] opacity-20 animate-blob"></div>
        </div>

        <div className="relative z-10 w-full max-w-md lg:bg-white/5 lg:backdrop-blur-xl lg:border lg:border-white/10 lg:p-10 lg:shadow-2xl rounded-3xl">
          <div className="text-center lg:text-left mb-8">
            <h2 className="text-3xl font-bold text-white tracking-tight mb-2">Create an account</h2>
            <p className="text-gray-400 text-sm">Join the platform to start teaching or learning.</p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-500 text-sm px-4 py-3 rounded-xl mb-6 flex items-center gap-3 animate-[pulse_2s_ease-in-out_infinite]">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 ml-1">I want to join as a:</label>
              <div className="grid grid-cols-2 gap-4">
                <label className={`
                  relative flex items-center justify-center p-4 rounded-2xl border-2 cursor-pointer transition-all duration-300 group
                  ${formData.role === 'student' 
                    ? 'border-indigo-500 bg-indigo-500/10 shadow-[0_0_15px_rgba(99,102,241,0.2)]' 
                    : 'border-white/10 bg-dark-800/50 hover:bg-dark-800 hover:border-white/20'}
                `}>
                  <input 
                    type="radio" name="role" value="student" 
                    checked={formData.role === 'student'} 
                    onChange={handleChange} className="hidden" 
                  />
                  <div className="flex flex-col items-center gap-2">
                    <div className={`p-2 rounded-full ${formData.role === 'student' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-dark-700 text-gray-400'}`}>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
                      </svg>
                    </div>
                    <span className={`font-semibold text-sm ${formData.role === 'student' ? 'text-white' : 'text-gray-400'}`}>Student</span>
                  </div>
                  {formData.role === 'student' && (
                    <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-indigo-500"></div>
                  )}
                </label>

                <label className={`
                  relative flex items-center justify-center p-4 rounded-2xl border-2 cursor-pointer transition-all duration-300
                  ${formData.role === 'mentor' 
                    ? 'border-purple-500 bg-purple-500/10 shadow-[0_0_15px_rgba(168,85,247,0.2)]' 
                    : 'border-white/10 bg-dark-800/50 hover:bg-dark-800 hover:border-white/20'}
                `}>
                  <input 
                    type="radio" name="role" value="mentor" 
                    checked={formData.role === 'mentor'} 
                    onChange={handleChange} className="hidden" 
                  />
                  <div className="flex flex-col items-center gap-2">
                    <div className={`p-2 rounded-full ${formData.role === 'mentor' ? 'bg-purple-500/20 text-purple-400' : 'bg-dark-700 text-gray-400'}`}>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                      </svg>
                    </div>
                    <span className={`font-semibold text-sm ${formData.role === 'mentor' ? 'text-white' : 'text-gray-400'}`}>Mentor</span>
                  </div>
                  {formData.role === 'mentor' && (
                    <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-purple-500"></div>
                  )}
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5 ml-1">Full Name</label>
              <input 
                type="text" name="full_name" required
                className="w-full bg-dark-800/50 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 focus:bg-dark-800 transition-all shadow-inner"
                value={formData.full_name} onChange={handleChange} placeholder="John Doe"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5 ml-1">Email address</label>
              <input 
                type="email" name="email" required
                className="w-full bg-dark-800/50 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 focus:bg-dark-800 transition-all shadow-inner"
                value={formData.email} onChange={handleChange} placeholder="name@example.com"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5 ml-1">Password</label>
              <input 
                type="password" name="password" required minLength={6}
                className="w-full bg-dark-800/50 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 focus:bg-dark-800 transition-all shadow-inner"
                value={formData.password} onChange={handleChange} placeholder="Create a strong password"
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className={`
                w-full relative mt-6 overflow-hidden bg-gradient-to-r text-white font-bold py-3.5 rounded-xl transition-all shadow-lg hover:shadow-xl active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2
                ${formData.role === 'mentor' ? 'from-purple-600 to-indigo-600 shadow-purple-500/25 mt-6' : 'from-indigo-600 to-primary-600 shadow-indigo-500/25 mt-6'}
              `}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                  <span>Creating account...</span>
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-gray-400">
            Already have an account?{' '}
            <Link to="/login" className="text-white font-semibold hover:text-indigo-400 transition-colors">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
