import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../hooks/useSocket';
import { useWebRTC } from '../hooks/useWebRTC';
import api from '../lib/api';

import CodeEditor from '../components/CodeEditor';
import ChatPanel from '../components/ChatPanel';
import VideoCall from '../components/VideoCall';

export default function SessionWorkspace() {
  const { inviteCode } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [sessionInfo, setSessionInfo] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // 1. Fetch Session Info
  useEffect(() => {
    const fetchSession = async () => {
      try {
        const res = await api.get(`/sessions/${inviteCode}`);
        setSessionInfo(res.data.session);
        
        // Ensure user belongs to this session
        if (user.role === 'mentor' && res.data.session.mentor?.id !== user.id) {
          throw new Error('Not authorized for this session');
        }
        if (user.role === 'student' && res.data.session.student?.id !== user.id) {
          throw new Error('Not authorized for this session');
        }
      } catch (err) {
        setError(err.message || 'Session not found');
      } finally {
        setLoading(false);
      }
    };
    fetchSession();
  }, [inviteCode, user]);

  // 2. Initialize Socket (only if session exists)
  const sessionId = sessionInfo?.id;
  const token = localStorage.getItem('token');
  const socket = useSocket(sessionId, token);

  // 3. Keep track of remote user for WebRTC targets based on room events
  const [remoteUserId, setRemoteUserId] = useState(null);
  const [remoteUserName, setRemoteUserName] = useState('');
  const [remoteSocketId, setRemoteSocketId] = useState(null);

  // 4. Initialize WebRTC
  const { 
    localStream, 
    remoteStream, 
    startCall, 
    toggleMic, 
    toggleCam 
  } = useWebRTC(socket, remoteUserId);

  const [isMicOn, setIsMicOn] = useState(true);
  const [isCamOn, setIsCamOn] = useState(true);

  const handleToggleMic = () => {
    setIsMicOn(toggleMic());
  };
  const handleToggleCam = () => {
    setIsCamOn(toggleCam());
  };

  // 5. Room participants tracking
  useEffect(() => {
    if (!socket) return;

    socket.on('room-participants', (users) => {
      setParticipants(users);
      // Find the other person in the room
      const otherUser = users.find(u => u.userId !== user.id);
      if (otherUser) {
        setRemoteUserId(otherUser.userId);
        setRemoteUserName(otherUser.name);
        setRemoteSocketId(otherUser.socketId);
        
        // As a mentor, maybe we auto-start call when student joins?
        // Or just let user click a button. Let's auto-start if I am the mentor.
        if (user.role === 'mentor') {
          setTimeout(() => {
            startCall(otherUser.socketId);
          }, 2000); // give WebRTC a sec to init devices
        }
      }
    });

    socket.on('user-joined', (joinedUser) => {
      setParticipants(prev => {
        // Remove if exists, then add
        const filtered = prev.filter(u => u.userId !== joinedUser.userId);
        return [...filtered, joinedUser];
      });
      
      setRemoteUserId(joinedUser.userId);
      setRemoteUserName(joinedUser.name);
      setRemoteSocketId(joinedUser.socketId);

      // If mentor is already in the room and student joins, start the call
      if (user.role === 'mentor') {
        setTimeout(() => {
          startCall(joinedUser.socketId);
        }, 2000);
      }
    });

    socket.on('user-left', (leftUser) => {
      setParticipants(prev => prev.filter(u => u.userId !== leftUser.userId));
      if (leftUser.userId === remoteUserId) {
        setRemoteUserId(null);
        setRemoteUserName('');
        setRemoteSocketId(null);
      }
    });

    return () => {
      socket.off('room-participants');
      socket.off('user-joined');
      socket.off('user-left');
    };
  }, [socket, user, remoteUserId, startCall]);


  const endSession = async () => {
    if (window.confirm("Are you sure you want to end this session?")) {
      try {
        await api.patch(`/sessions/${sessionId}/end`);
        navigate('/dashboard');
      } catch (err) {
        console.error("Failed to end session:", err);
      }
    }
  };

  if (loading) return <div className="text-center p-20 text-gray-400">Loading session...</div>;
  if (error) return <div className="text-center p-20 text-red-500">{error}</div>;

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col bg-dark-950 font-sans overflow-hidden relative">
      
      {/* Subtle Background Glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/10 rounded-full mix-blend-screen filter blur-[120px] pointer-events-none"></div>
      
      {/* Session Header */}
      <div className="h-16 bg-dark-900/80 backdrop-blur-2xl border-b border-white/5 flex items-center justify-between px-8 shrink-0 relative z-30 shadow-sm">
        <div className="flex items-center gap-5">
          <h2 className="text-white font-bold text-lg flex items-center gap-3">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]"></span>
            </span>
            {sessionInfo?.title}
          </h2>
          <div className="h-5 w-px bg-white/10"></div>
          <div className="text-xs font-mono font-medium tracking-wider text-gray-300 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10 flex items-center gap-2">
            <span className="text-gray-500 uppercase text-[10px]">Invite Code</span>
            <span className="text-indigo-300">{sessionInfo?.invite_code}</span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex -space-x-3">
            {participants.map((p, i) => (
              <div 
                key={p.userId || i} 
                className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 border-2 border-dark-900 flex items-center justify-center text-xs font-bold text-white shadow-lg ring-2 ring-transparent hover:ring-indigo-500/50 hover:z-20 transition-all z-10 cursor-help"
                title={`${p.name} (${p.role})`}
              >
                {p.name?.charAt(0).toUpperCase()}
              </div>
            ))}
          </div>
          
          <div className="h-5 w-px bg-white/10"></div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate('/dashboard')}
              className="text-sm font-semibold text-gray-300 hover:text-white transition-colors px-4 py-2 hover:bg-white/5 rounded-lg"
            >
              Leave
            </button>
            
            {user.role === 'mentor' && (
              <button 
                onClick={endSession}
                className="text-sm font-semibold bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/30 hover:border-red-500 px-4 py-2 rounded-lg transition-all shadow-lg shadow-red-500/10 active:scale-95"
              >
                End Session
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="flex-1 flex overflow-hidden relative z-20">
        
        {/* Left Side: Video + Editor */}
        <div className="flex-1 flex flex-col min-w-0 border-r border-white/5 shadow-2xl">
          
          {/* Top: Video Call Strip */}
          <div className="shrink-0">
            <VideoCall 
              localStream={localStream}
              remoteStream={remoteStream}
              remoteUserName={remoteUserName}
              isMicOn={isMicOn}
              isCamOn={isCamOn}
              onToggleMic={handleToggleMic}
              onToggleCam={handleToggleCam}
            />
          </div>

          {/* Bottom: Code Editor */}
          <div className="flex-1 min-h-0 relative z-0">
            <CodeEditor socket={socket} sessionId={sessionId} />
          </div>

        </div>

        {/* Right Side: Chat Panel */}
        <div className="shrink-0 flex flex-col">
          <ChatPanel socket={socket} sessionId={sessionId} />
        </div>

      </div>
    </div>
  );
}
