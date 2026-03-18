import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000';

export function useSocket(sessionId, token) {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (!token || !sessionId) return;

    // Connect to server
    const newSocket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket'],
    });

    newSocket.on('connect', () => {
      console.log('✅ Connected to socket server');
      newSocket.emit('join-room', sessionId);
    });

    newSocket.on('connect_error', (err) => {
      console.error('Socket connection error:', err.message);
    });

    setSocket(newSocket);

    return () => {
      console.log('🔌 Disconnecting socket');
      newSocket.disconnect();
    };
  }, [sessionId, token]);

  return socket;
}
