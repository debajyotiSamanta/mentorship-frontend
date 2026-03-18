import { useState, useEffect } from 'react';
import Pusher from 'pusher-js';

const PUSHER_KEY = import.meta.env.VITE_PUSHER_KEY;
const PUSHER_CLUSTER = import.meta.env.VITE_PUSHER_CLUSTER;
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export function usePusher(sessionId, token, userId) {
  const [pusher, setPusher] = useState(null);
  const [channel, setChannel] = useState(null);

  useEffect(() => {
    if (!token || !sessionId) return;

    // Initialize Pusher
    console.log(`🔌 Initializing Pusher with Key: ${PUSHER_KEY}, Cluster: ${PUSHER_CLUSTER}`);
    const pusherClient = new Pusher(PUSHER_KEY, {
      cluster: PUSHER_CLUSTER,
      authEndpoint: `${API_URL}/pusher/auth`,
      auth: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    });

    pusherClient.connection.bind('error', (err) => {
      console.error('❌ Pusher Connection Error:', err);
    });

    pusherClient.connection.bind('state_change', (states) => {
      console.log('🔄 Pusher State Change:', states.current);
    });

    // Subscribe to presence channel
    console.log(`📡 Subscribing to: presence-session-${sessionId}`);
    const presenceChannel = pusherClient.subscribe(`presence-session-${sessionId}`);

    presenceChannel.bind('pusher:subscription_error', (status) => {
      console.error('❌ Pusher Subscription Error:', status);
    });

    presenceChannel.bind('pusher:subscription_succeeded', () => {
      console.log('✅ Pusher Subscription Succeeded');
    });

    setPusher(pusherClient);
    setChannel(presenceChannel);

    return () => {
      console.log('🔌 Disconnecting Pusher');
      presenceChannel.unbind_all();
      pusherClient.unsubscribe(`presence-session-${sessionId}`);
      pusherClient.disconnect();
    };
  }, [sessionId, token]);

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
        // Regular events and Client events
        // Note: Client events are received without the 'client-' prefix by the listener
        channel.bind(event, callback);
        channel.bind(`client-${event}`, callback);
      }
    },
    off: (event, callback) => {
      channel.unbind(event, callback);
      channel.unbind(`client-${event}`, callback);
    },
    emit: (event, data) => {
      // For Pusher, many events will move to API calls, 
      // but some can be 'client events' for low-latency peer-to-peer sync.
      // Client events must be enabled in Pusher dashboard.
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
}
