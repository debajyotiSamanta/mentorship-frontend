import { useEffect, useRef } from 'react';

export default function VideoCall({ 
  localStream, 
  remoteStream, 
  remoteUserName, 
  isMicOn, 
  isCamOn, 
  onToggleMic, 
  onToggleCam 
}) {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  return (
    <div className="flex flex-col sm:flex-row gap-6 p-6 bg-dark-900/60 backdrop-blur-xl border-b border-white/5 overflow-x-auto relative z-20">
      
      {/* Remote Video (Other person) */}
      <div className="relative w-72 h-40 bg-black rounded-2xl overflow-hidden border border-white/10 shadow-[0_0_30px_rgba(99,102,241,0.15)] group shrink-0 transition-transform duration-500 hover:scale-[1.02]">
        {remoteStream ? (
          <video 
            ref={remoteVideoRef} 
            autoPlay 
            playsInline 
            className="w-full h-full object-cover opacity-90 transition-opacity group-hover:opacity-100"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 bg-dark-900">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mb-3 opacity-30 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <span className="text-xs font-semibold tracking-wide uppercase">Waiting for partner...</span>
          </div>
        )}
        <div className="absolute bottom-3 left-3 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-lg text-xs text-white font-medium shadow-sm border border-white/10 flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${remoteStream ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`}></span>
          {remoteUserName || 'Partner'}
        </div>
      </div>

      {/* Local Video (You) */}
      <div className="relative w-72 h-40 bg-black rounded-2xl overflow-hidden border border-white/10 shadow-[0_0_30px_rgba(168,85,247,0.15)] group shrink-0 transition-transform duration-500 hover:scale-[1.02]">
        <video 
          ref={localVideoRef} 
          autoPlay 
          playsInline 
          muted 
          className="w-full h-full object-cover transform scale-x-[-1] opacity-90 transition-opacity group-hover:opacity-100" 
        />
        <div className="absolute bottom-3 left-3 flex gap-2">
          <div className="bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-lg text-xs text-white font-medium shadow-sm border border-white/10 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            You
          </div>
        </div>
        
        {/* Controls Overlay */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-4 transition-all duration-300 backdrop-blur-sm">
          <button 
            onClick={onToggleMic}
            className={`p-3 rounded-full shadow-2xl backdrop-blur-md transition-all border ${isMicOn ? 'bg-white/10 border-white/20 hover:bg-white/20 text-white' : 'bg-red-500/80 border-red-400 hover:bg-red-500 text-white'} hover:scale-110 active:scale-95`}
            title={isMicOn ? 'Mute Microphone' : 'Unmute Microphone'}
          >
            {isMicOn ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" strokeOpacity="0.5" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
              </svg>
            )}
          </button>
          
          <button 
            onClick={onToggleCam}
            className={`p-3 rounded-full shadow-2xl backdrop-blur-md transition-all border ${isCamOn ? 'bg-white/10 border-white/20 hover:bg-white/20 text-white' : 'bg-red-500/80 border-red-400 hover:bg-red-500 text-white'} hover:scale-110 active:scale-95`}
            title={isCamOn ? 'Turn Off Camera' : 'Turn On Camera'}
          >
            {isCamOn ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" strokeOpacity="0.5" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18" />
              </svg>
            )}
          </button>
        </div>
      </div>
      
    </div>
  );
}
