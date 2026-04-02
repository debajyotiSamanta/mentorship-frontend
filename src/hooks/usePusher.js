import Pusher from 'pusher-js';
import { useEffect, useMemo, useState } from 'react';

const PUSHER_KEY = import.meta.env.VITE_PUSHER_KEY;
const PUSHER_CLUSTER = import.meta.env.VITE_PUSHER_CLUSTER;
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export function usePusher(sessionId, token, userId, onError) {
  const [pusher, setPusher] = useState(null);
  const [channel, setChannel] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('connecting');

  useEffect(() => {
    if (!token || !sessionId) return;

    // Initialize Pusher
    if (import.meta.env.DEV) {
      console.log(`🔌 Initializing Pusher with Key: ${PUSHER_KEY}, Cluster: ${PUSHER_CLUSTER}`);
    }

    const pusherClient = new Pusher(PUSHER_KEY, {
      cluster: PUSHER_CLUSTER,
      authEndpoint: `${API_URL}/pusher/auth`,
      auth: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
      enableLogging: import.meta.env.DEV, // Only log Pusher internals in dev
    });

    pusherClient.connection.bind('error', (err) => {
      console.error('Pusher Connection Error:', err?.message || err);
      setConnectionStatus('error');
      if (onError) onError('Real-time connection failed. Chat may not update in real-time.');
    });

    pusherClient.connection.bind('state_change', (states) => {
      if (import.meta.env.DEV) {
        console.log('Pusher State Change:', states.current);
      }
      setConnectionStatus(states.current);
    });

    pusherClient.connection.bind('connected', () => {
      if (import.meta.env.DEV) {
        console.log('✅ Pusher Connected');
      }
      setConnectionStatus('connected');
    });

    // Subscribe to presence channel with error handling
    if (import.meta.env.DEV) {
      console.log(`📡 Subscribing to: presence-session-${sessionId}`);
    }

    let presenceChannel;
    try {
      presenceChannel = pusherClient.subscribe(`presence-session-${sessionId}`);
    } catch (err) {
      console.error('Failed to subscribe to presence channel:', err);
      if (onError) onError('Failed to join session. Please try again.');
      return;
    }

    presenceChannel.bind('pusher:subscription_error', (status) => {
      console.error('Pusher Subscription Error:', status);
      setConnectionStatus('error');
      if (onError) onError('Failed to join real-time session.');
    });

    presenceChannel.bind('pusher:subscription_succeeded', () => {
      if (import.meta.env.DEV) {
        console.log('✅ Pusher Subscription Succeeded');
      }
      setConnectionStatus('subscribed');
    });

    setPusher(pusherClient);
    setChannel(presenceChannel);

    return () => {
      if (import.meta.env.DEV) {
        console.log('Disconnecting Pusher');
      }
      try {
        presenceChannel.unbind_all();
        presenceChannel.unsubscribe();
        pusherClient.disconnect();
      } catch (err) {
        console.error('Error during Pusher cleanup:', err);
      }
    };
  }, [sessionId, token]);

  const socket = useMemo(() => {
    if (!channel) return null;

    return {
      userId,
      on: (event, callback) => {
        if (event === 'room-participants') {
          channel.bind('pusher:subscription_succeeded', (members) => {
            const users = [];
            members.each(member => users.push({
              userId: member.id,
              name: member.info.name,
              role: member.info.role
            }));
            callback(users);
          });
        } else if (event === 'user-joined') {
          channel.bind('pusher:member_added', (member) => {
            callback({
              userId: member.id,
              name: member.info.name,
              role: member.info.role
            });
          });
        } else if (event === 'user-left') {
          channel.bind('pusher:member_removed', (member) => {
            callback({
              userId: member.id,
              name: member.info.name
            });
          });
        } else {
          channel.bind(event, callback);
          channel.bind(`client-${event}`, callback);
        }
      },
      off: (event, callback) => {
        channel.unbind(event, callback);
        channel.unbind(`client-${event}`, callback);
      },
      emit: (event, data) => {
        const clientEvents = [
          'code-change', 
          'code-update',
          'language-change', 
          'language-update',
          'webrtc-offer', 
          'webrtc-answer', 
          'webrtc-ice-candidate'
        ];
        
        if (clientEvents.includes(event)) {
          channel.trigger(`client-${event}`, data);
        }
      }
    };
  }, [channel, userId]);

  return socket;
}
