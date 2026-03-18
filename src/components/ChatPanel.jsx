import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';

export default function ChatPanel({ socket, sessionId }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  // Load history
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await api.get(`/messages/${sessionId}`);
        setMessages(res.data.messages || []);
      } catch (err) {
        console.error('Failed to load chat history', err);
      }
    };
    fetchHistory();
  }, [sessionId]);

  // Listen for new messages
  useEffect(() => {
    if (!socket) return;
    
    const handleMessage = (msg) => {
      setMessages((prev) => [...prev, msg]);
    };

    socket.on('receive-message', handleMessage);
    
    return () => {
      socket.off('receive-message', handleMessage);
    };
  }, [socket]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    try {
      await api.post('/messages', {
        session_id: sessionId,
        content: input,
      });
      setInput('');
    } catch (err) {
      console.error('Failed to send message', err);
    }
  };

  return (
    <div className="flex flex-col h-full bg-dark-900/80 backdrop-blur-2xl border-l border-white/5 w-80 flex-shrink-0 z-10 shadow-2xl relative">
      <div className="p-5 border-b border-white/5 bg-white/[0.02] flex justify-between items-center">
        <h3 className="font-bold text-white flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30 text-indigo-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          Session Chat
        </h3>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar relative z-10">
        {messages.map((msg, idx) => {
          const isMe = msg.sender_id === user.id;
          return (
            <div key={msg.id || idx} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} animate-[fadeIn_0.3s_ease-out]`}>
              <div className="flex items-baseline gap-2 mb-1.5 px-1">
                <span className="text-xs font-semibold text-gray-400">{isMe ? 'You' : msg.sender?.full_name}</span>
                <span className="text-[10px] text-gray-500 font-medium">
                  {new Date(msg.created_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <div className={`px-4 py-2.5 rounded-2xl max-w-[85%] text-sm leading-relaxed shadow-lg ${
                isMe 
                  ? 'bg-gradient-to-tr from-indigo-500 to-purple-600 text-white rounded-tr-sm shadow-indigo-500/20' 
                  : 'bg-dark-800/80 backdrop-blur-md text-gray-100 rounded-tl-sm border border-white/10'
              }`}>
                {msg.content}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-white/[0.02] border-t border-white/5 relative z-10 backdrop-blur-3xl">
        <form onSubmit={sendMessage} className="relative flex items-center">
          <input
            type="text"
            className="w-full bg-dark-900/50 border border-white/10 rounded-2xl pl-5 pr-14 py-3.5 text-sm text-white focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all placeholder-gray-500 shadow-inner"
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button 
            type="submit"
            disabled={!input.trim()}
            className="absolute right-2 top-2 bottom-2 w-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white flex items-center justify-center transition-all disabled:opacity-50 disabled:from-dark-700 disabled:to-dark-700 disabled:text-gray-500 shadow-lg shadow-indigo-500/20 active:scale-95"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 transform rotate-90 ml-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}
