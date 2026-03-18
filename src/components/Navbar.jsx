import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-50 bg-dark-900/80 backdrop-blur-xl border-b border-white/5 px-4 py-3">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-xl font-bold tracking-tight text-white flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:scale-105 transition-transform">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <span className="hidden sm:block">MentorSpace</span>
        </Link>

        <div>
          {user ? (
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-300">
                {user.full_name} <span className="ml-2 text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">{user.role}</span>
              </span>
              <button 
                onClick={handleLogout}
                className="text-sm px-4 py-2 font-medium text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-all"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/login" className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-all">Sign In</Link>
              <Link to="/register" className="px-5 py-2 text-sm font-medium bg-white text-black hover:bg-gray-100 rounded-lg transition-all shadow-[0_0_15px_rgba(255,255,255,0.15)]">Get Started</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
