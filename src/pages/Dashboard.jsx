import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';

export default function Dashboard() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // For mentors creating sessions
  const [newTitle, setNewTitle] = useState('');
  const [creating, setCreating] = useState(false);
  
  // For students joining sessions
  const [inviteCode, setInviteCode] = useState('');
  const [joining, setJoining] = useState(false);
  const navigate = useNavigate();

  // For AI Mentor Search
  const [aiPrompt, setAiPrompt] = useState('');
  const [searchingAI, setSearchingAI] = useState(false);
  const [aiResults, setAiResults] = useState([]);
  const [showAIModal, setShowAIModal] = useState(false);

  // For Mentor Profile Update
  const [profileSkills, setProfileSkills] = useState(user?.skills?.join(', ') || '');
  const [profileAvailability, setProfileAvailability] = useState(user?.availability || '');
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const res = await api.get('/sessions');
      setSessions(res.data.sessions);
    } catch (err) {
      console.error('Failed to fetch sessions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSession = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    
    setCreating(true);
    setError('');
    try {
      const res = await api.post('/sessions', { title: newTitle });
      setSessions([res.data.session, ...sessions]);
      setNewTitle('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create session');
    } finally {
      setCreating(false);
    }
  };

  const handleJoinSession = async (e) => {
    e.preventDefault();
    if (!inviteCode.trim()) return;
    
    setJoining(true);
    setError('');
    try {
      await api.post(`/sessions/${inviteCode}/join`);
      navigate(`/session/${inviteCode}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid invite code or session ended');
    } finally {
      setJoining(false);
    }
  };

  const handleAISearch = async (e) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;
    
    setSearchingAI(true);
    setError('');
    try {
      const res = await api.post('/mentors/ai-match', { prompt: aiPrompt });
      setAiResults(res.data.mentors || []);
      setShowAIModal(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to search for mentors');
    } finally {
      setSearchingAI(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setUpdatingProfile(true);
    setProfileSuccess('');
    setError('');
    try {
      await api.patch('/auth/profile', {
        skills: profileSkills,
        availability: profileAvailability
      });
      setProfileSuccess('Profile updated! AI matching is now smarter.');
      setTimeout(() => setProfileSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setUpdatingProfile(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-dark-900 relative overflow-hidden">
      
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/20 rounded-full mix-blend-screen filter blur-[120px] pointer-events-none animate-blob"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-purple-600/20 rounded-full mix-blend-screen filter blur-[120px] pointer-events-none animate-blob" style={{ animationDelay: '2s' }}></div>

      <div className="container mx-auto px-4 py-10 max-w-5xl relative z-10">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 tracking-tight">Dashboard</h1>
            <p className="text-gray-400 mt-2 font-medium">Manage and join your 1-on-1 mentorship sessions</p>
          </div>
        </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-3 rounded-lg mb-6 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError('')} className="text-red-400 hover:text-red-300">×</button>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-6">
        {/* ACTION CARDS */}
        <div className="md:col-span-1 space-y-6">
          {user?.role === 'mentor' && (
            <>
            <div className="relative group rounded-2xl p-[1px] bg-gradient-to-b from-white/10 to-transparent overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-purple-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative bg-dark-900/80 backdrop-blur-xl rounded-2xl p-6 h-full border border-white/5">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center mb-4 border border-purple-500/30 text-purple-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-white mb-2">Create Session</h2>
                <p className="text-sm text-gray-400 mb-6">Launch a new real-time workspace and share the invite code.</p>
                <form onSubmit={handleCreateSession}>
                  <input
                    type="text"
                    placeholder="e.g., React Advanced Patterns"
                    className="w-full bg-dark-800/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 focus:bg-dark-800 transition-all shadow-inner mb-4"
                    value={newTitle}
                    onChange={e => setNewTitle(e.target.value)}
                    maxLength={50}
                  />
                  <button
                    type="submit"
                    disabled={creating || !newTitle.trim()}
                    className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-purple-500/20 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {creating ? 'Creating Workspace...' : 'Create Workspace'}
                  </button>
                </form>
              </div>
            </div>

            <div className="relative group rounded-2xl p-[1px] bg-gradient-to-b from-white/10 to-transparent overflow-hidden mt-6">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative bg-dark-900/80 backdrop-blur-xl rounded-2xl p-6 h-full border border-white/5">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center mb-4 border border-purple-500/30 text-purple-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-white mb-2">Mentor Profile</h2>
                <p className="text-sm text-gray-400 mb-6">Keep your skills and availability updated for better matching.</p>
                
                {profileSuccess && (
                  <div className="mb-4 text-xs bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 py-2 px-3 rounded-lg animate-pulse">
                    {profileSuccess}
                  </div>
                )}

                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 px-1">Expertise</label>
                    <input
                      type="text"
                      className="w-full bg-dark-800/50 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all text-sm"
                      value={profileSkills}
                      onChange={e => setProfileSkills(e.target.value)}
                      placeholder="React, Node.js, Python..."
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 px-1">Available slots</label>
                    <input
                      type="text"
                      className="w-full bg-dark-800/50 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all text-sm"
                      value={profileAvailability}
                      onChange={e => setProfileAvailability(e.target.value)}
                      placeholder="e.g. Weeknights 6pm-9pm"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={updatingProfile}
                    className="w-full bg-white/5 hover:bg-white/10 text-white border border-white/10 font-bold py-2.5 rounded-xl transition-all active:scale-[0.98] disabled:opacity-50 text-sm"
                  >
                    {updatingProfile ? 'Saving...' : 'Update Explorer Profile'}
                  </button>
                </form>
              </div>
            </div>
            </>
          )}

          {user?.role === 'student' && (
            <>
            <div className="relative group rounded-2xl p-[1px] bg-gradient-to-b from-white/10 to-transparent overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-blue-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative bg-dark-900/80 backdrop-blur-xl rounded-2xl p-6 h-full border border-white/5">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center mb-4 border border-indigo-500/30 text-indigo-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-white mb-2">Join Session</h2>
                <p className="text-sm text-gray-400 mb-6">Enter the 8-character invite code provided by your mentor.</p>
                <form onSubmit={handleJoinSession}>
                  <input
                    type="text"
                    placeholder="e.g., X7B9K2M1"
                    className="w-full flex-1 bg-dark-800/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 focus:bg-dark-800 transition-all shadow-inner mb-4 uppercase text-center tracking-[0.2em] font-mono text-lg"
                    value={inviteCode}
                    onChange={e => setInviteCode(e.target.value.toUpperCase())}
                    maxLength={10}
                  />
                  <button
                    type="submit"
                    disabled={joining || !inviteCode.trim()}
                    className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-indigo-500/20 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {joining ? 'Connecting...' : 'Enter Workspace'}
                  </button>
                </form>
              </div>
            </div>
            
            <div className="relative group rounded-2xl p-[1px] bg-gradient-to-b from-emerald-500/50 to-transparent overflow-hidden mt-6">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-teal-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative bg-dark-900/80 backdrop-blur-xl rounded-2xl p-6 h-full border border-white/5">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center mb-4 border border-emerald-500/30 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-white mb-2">AI Mentor Match</h2>
                <p className="text-sm text-gray-400 mb-6">Describe what you want to learn and when you're available.</p>
                <form onSubmit={handleAISearch}>
                  <textarea
                    placeholder="e.g. I need a React mentor available on weekends..."
                    className="w-full bg-dark-800/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 focus:bg-dark-800 transition-all shadow-inner mb-4 resize-none h-24 text-sm"
                    value={aiPrompt}
                    onChange={e => setAiPrompt(e.target.value)}
                  />
                  <button
                    type="submit"
                    disabled={searchingAI || !aiPrompt.trim()}
                    className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-emerald-500/20 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {searchingAI ? (
                       <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div><span>Searching...</span></>
                    ) : 'Find Mentor ✨'}
                  </button>
                </form>
              </div>
            </div>
            </>
          )}
        </div>

        {/* SESSION LIST */}
        <div className="md:col-span-2">
          <div className="bg-dark-900/60 backdrop-blur-xl rounded-2xl border border-white/5 shadow-2xl overflow-hidden flex flex-col h-full">
            <div className="px-6 py-5 border-b border-white/5 bg-white/[0.02] flex justify-between items-center">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                Active Workspaces
              </h2>
              <button onClick={fetchSessions} className="text-gray-400 hover:text-white transition-colors bg-white/5 hover:bg-white/10 p-2 rounded-lg" title="Refresh">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
            
            <div className="p-0">
              {loading ? (
                <div className="p-8 text-center text-gray-400">Loading sessions...</div>
              ) : sessions.length === 0 ? (
                <div className="p-12 text-center flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full bg-dark-700 flex items-center justify-center mb-4 text-gray-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <p className="text-gray-400 font-medium tracking-wide">No sessions found.</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {user?.role === 'mentor' ? "Create one using the form on the left." : "Ask your mentor for an invite code."}
                  </p>
                </div>
              ) : (
                <ul className="divide-y divide-white/5">
                  {sessions.map(session => (
                    <li key={session.id} className="p-6 hover:bg-white/[0.02] transition-colors group">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                        <div>
                          <h3 className="text-xl font-bold text-gray-100 group-hover:text-white transition-colors flex items-center gap-3">
                            {session.title}
                            {session.status === 'active' && (
                              <span className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.8)] animate-pulse"></span>
                            )}
                          </h3>
                          <div className="mt-2 flex flex-wrap gap-x-5 gap-y-2 text-sm text-gray-400 font-medium">
                            <span className="flex items-center gap-1.5 bg-dark-800/50 px-2 py-1 rounded-md border border-white/5">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              {new Date(session.created_at).toLocaleDateString()}
                            </span>
                            
                            {user?.role === 'mentor' ? (
                              <span className="flex items-center gap-1.5 bg-dark-800/50 px-2 py-1 rounded-md border border-white/5">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                                {session.student ? <span className="text-gray-300">{session.student.full_name}</span> : <span className="text-yellow-500/80 italic">Waiting...</span>}
                              </span>
                            ) : (
                              <span className="flex items-center gap-1.5 bg-dark-800/50 px-2 py-1 rounded-md border border-white/5">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                </svg>
                                <span className="text-gray-300">{session.mentor?.full_name}</span>
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col items-start sm:items-end gap-3 shrink-0">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
                            session.status === 'active' ? 'bg-green-500/10 text-green-400 border-green-500/20 shadow-[0_0_10px_rgba(34,197,94,0.1)]' : 
                            session.status === 'ended' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 
                            'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                          }`}>
                            {session.status}
                          </span>
                          
                          {session.status !== 'ended' && (
                            <div className="flex items-center gap-3">
                              {user?.role === 'mentor' && session.status === 'waiting' && (
                                <div className="text-xs bg-black/40 border border-white/10 px-3 py-1.5 rounded-lg font-mono text-gray-300 select-all cursor-copy hover:border-white/20 transition-colors" title="Double click to copy">
                                  {session.invite_code}
                                </div>
                              )}
                              <button 
                                onClick={() => navigate(`/session/${session.invite_code}`)}
                                className="text-sm font-semibold bg-white text-black hover:bg-gray-200 px-5 py-2 rounded-lg transition-all shadow-lg shadow-white/10 active:scale-95"
                              >
                                Enter Workspace
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
        </div>
      </div>
      
      {/* AI Results Modal */}
      {showAIModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]" onClick={() => setShowAIModal(false)}></div>
          <div className="relative bg-dark-900 border border-white/10 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-[slideInUp_0.3s_ease-out]">
            <div className="px-6 py-5 border-b border-white/5 bg-gradient-to-r from-emerald-900/20 to-transparent flex justify-between items-center shrink-0">
               <div>
                 <h2 className="text-xl font-bold text-white flex items-center gap-2">
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                   </svg>
                   AI Mentor Recommendations
                 </h2>
                 <p className="text-gray-400 text-sm mt-1">Based on: <span className="text-gray-300 italic">"{aiPrompt}"</span></p>
               </div>
               <button onClick={() => setShowAIModal(false)} className="text-gray-500 hover:text-white transition-colors bg-white/5 hover:bg-white/10 rounded-xl p-2">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                 </svg>
               </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-2 sm:p-4 custom-scrollbar bg-black/20">
              {aiResults.length === 0 ? (
                <div className="text-center py-16 px-4">
                  <div className="w-16 h-16 rounded-full bg-dark-800 flex items-center justify-center mx-auto mb-4 border border-white/5 text-gray-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">No perfect matches found</h3>
                  <p className="text-gray-400 max-w-sm mx-auto">Try broadening your search query or asking for different time slots or skills.</p>
                </div>
              ) : (
                <ul className="space-y-4">
                  {aiResults.map(mentor => (
                    <li key={mentor.id || mentor._id} className="bg-dark-800/80 backdrop-blur-md rounded-2xl p-5 border border-white/10 hover:border-emerald-500/30 transition-all shadow-md group">
                      <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-center">
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-xl font-bold text-white shadow-lg shrink-0 border-2 border-dark-900 group-hover:scale-105 transition-transform">
                          {mentor.name?.charAt(0).toUpperCase() || mentor.full_name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-white mb-1">{mentor.name || mentor.full_name}</h3>
                          
                          <div className="flex flex-wrap gap-2 mt-2">
                             {mentor.skills && mentor.skills.length > 0 ? (
                               mentor.skills.map((skill, i) => (
                                 <span key={i} className="px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold tracking-wide">
                                   {skill}
                                 </span>
                               ))
                             ) : (
                               <span className="text-xs text-gray-500 italic">No specific skills listed</span>
                             )}
                          </div>
                          
                          <div className="mt-3 flex items-start gap-2 bg-dark-900/50 p-2.5 rounded-lg border border-white/5">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-sm text-gray-300 break-words">{mentor.availability || 'Reach out to schedule a time.'}</span>
                          </div>
                        </div>
                        <div className="w-full sm:w-auto mt-2 sm:mt-0 flex justify-end">
                           {/* Usually students need the mentor's invite code or they have to message them. For now just show contact capability */}
                           <button className="text-sm font-semibold bg-white text-black hover:bg-emerald-500 hover:text-white px-5 py-2.5 rounded-xl transition-all shadow-lg active:scale-95 w-full sm:w-auto">
                             Connect
                           </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
