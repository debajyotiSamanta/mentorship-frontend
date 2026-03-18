import { useEffect, useRef, useState } from 'react';

// Free public STUN servers
const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
};

export function useWebRTC(socket, remoteUserId) {
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  
  const peerConnection = useRef(null);

  // Initialize Media Devices on mount
  useEffect(() => {
    async function startMedia() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        setLocalStream(stream);
      } catch (err) {
        console.error('Failed to get media devices:', err);
      }
    }
    startMedia();

    return () => {
      // Cleanup tracks on unmount
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  // Watch for socket and remoteUser to initialize RTCPeerConnection and signaling
  useEffect(() => {
    if (!socket || !localStream) return;

    // We only create connection when we know the OTHER person is in the room
    const createPeerConnection = (targetSocketId) => {
      // Avoid recreating
      if (peerConnection.current) return peerConnection.current;

      console.log('🔗 Creating WebRTC PeerConnection');
      const pc = new RTCPeerConnection(ICE_SERVERS);
      peerConnection.current = pc;

      // Add local tracks to PC
      localStream.getTracks().forEach((track) => {
        pc.addTrack(track, localStream);
      });

      // Handle receiving remote tracks
      pc.ontrack = (event) => {
        console.log('📺 Received remote track');
        setRemoteStream(event.streams[0]);
      };

      // Handle ICE candidates
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit('webrtc-ice-candidate', {
            candidate: event.candidate,
            fromUserId: socket.userId // We'll need to add this property to our socket wrapper
          });
        }
      };

      return pc;
    };

    // --- Signaling Event Handlers ---
    
    // When another user joins, WE (the existing user) create an offer
    const handleUserJoined = async (user) => {
      // user.socketId is not broadcasted directly in my current backend setup, 
      // the backend broadcasts user {userId, name, role}.
      // Wait, let's just listen for offers/answers and when participants list changes we'll handle start call
    };

    const handleOffer = async ({ fromSocketId, offer }) => {
      console.log('📥 Received offer, creating answer');
      const pc = createPeerConnection(fromSocketId);
      
      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      socket.emit('webrtc-answer', {
        answer,
      });
    };

    const handleAnswer = async ({ answer }) => {
      console.log('📥 Received answer, setting remote description');
      const pc = peerConnection.current;
      if (pc) {
        await pc.setRemoteDescription(new RTCSessionDescription(answer));
      }
    };

    const handleIceCandidate = async ({ candidate }) => {
      const pc = peerConnection.current;
      if (pc && candidate) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (e) {
          console.error('Error adding ICE candidate', e);
        }
      }
    };

    const handleUserLeft = () => {
      console.log('👋 Remote user left, closing WebRTC');
      if (peerConnection.current) {
        peerConnection.current.close();
        peerConnection.current = null;
      }
      setRemoteStream(null);
    };

    socket.on('webrtc-offer', handleOffer);
    socket.on('webrtc-answer', handleAnswer);
    socket.on('webrtc-ice-candidate', handleIceCandidate);
    socket.on('user-left', handleUserLeft);

    return () => {
      socket.off('webrtc-offer', handleOffer);
      socket.off('webrtc-answer', handleAnswer);
      socket.off('webrtc-ice-candidate', handleIceCandidate);
      socket.off('user-left', handleUserLeft);
    };
  }, [socket, localStream]);

  // Method to manually start call (create offer)
  const startCall = async () => {
    if (!socket || !localStream || !remoteUserId) return;
    
    console.log('📞 Starting call, creating offer');
    if (peerConnection.current) {
      peerConnection.current.close();
      peerConnection.current = null;
    }

    const pc = new RTCPeerConnection(ICE_SERVERS);
    peerConnection.current = pc;

    localStream.getTracks().forEach((track) => {
      pc.addTrack(track, localStream);
    });

    pc.ontrack = (event) => {
      setRemoteStream(event.streams[0]);
    };

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('webrtc-ice-candidate', {
          targetUserId: remoteUserId,
          candidate: event.candidate,
        });
      }
    };

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    socket.emit('webrtc-offer', {
      offer,
    });
  };

  const toggleMic = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        return audioTrack.enabled;
      }
    }
    return false;
  };

  const toggleCam = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        return videoTrack.enabled;
      }
    }
    return false;
  };

  return { localStream, remoteStream, startCall, toggleMic, toggleCam };
}
