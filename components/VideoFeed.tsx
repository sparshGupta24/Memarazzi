
import React, { useEffect, useState, useRef } from 'react';

interface VideoFeedProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  remoteStream: MediaStream | null;
  isTracking: boolean;
  isAnalyzing: boolean;
  onToggle: () => void;
  onManualCapture: () => void;
}

const VideoFeed: React.FC<VideoFeedProps> = ({ 
  videoRef, 
  remoteStream, 
  isTracking, 
  onToggle, 
  onManualCapture, 
  isAnalyzing 
}) => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    async function setupCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { width: 1920, height: 1080, facingMode: 'user' },
          audio: true 
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setHasPermission(true);
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
        setHasPermission(false);
      }
    }

    setupCamera();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, [videoRef]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  if (hasPermission === false) {
    return (
      <div className="h-full w-full bg-black flex flex-col items-center justify-center p-8 text-center">
        <i className="fa-solid fa-camera-slash text-6xl text-red-500 mb-6"></i>
        <h3 className="text-2xl font-black text-red-400 tracking-tighter">EYES CLOSED</h3>
        <p className="text-gray-500 mt-2 max-w-xs">Camera access is required for the Mirror to reflect your soul (and memes).</p>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 w-full h-full bg-black overflow-hidden flex flex-col md:flex-row gap-1 p-1">
      {/* Local Participant (Host) */}
      <div className={`relative h-full transition-all duration-700 overflow-hidden rounded-2xl ${remoteStream ? 'flex-1' : 'w-full'}`}>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`w-full h-full object-cover transition-all duration-1000 ${isTracking ? 'scale-100 brightness-110 contrast-105' : 'grayscale brightness-50'}`}
        />
        <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-md px-3 py-1 rounded-lg border border-white/10">
          <span className="text-[10px] font-black text-white uppercase tracking-tighter">YOU (HOST)</span>
        </div>
        {/* Local Scan Line */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-3/4 h-[1px] bg-gradient-to-r from-transparent via-blue-500/30 to-transparent animate-scan-line"></div>
      </div>

      {/* Remote Participant (Guest) */}
      {remoteStream && (
        <div className="relative h-full flex-1 overflow-hidden rounded-2xl transition-all duration-700 animate-in slide-in-from-right">
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover brightness-105 contrast-105"
          />
          <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-md px-3 py-1 rounded-lg border border-white/10">
            <span className="text-[10px] font-black text-white uppercase tracking-tighter">GUEST</span>
          </div>
        </div>
      )}
      
      {/* Global HUD Layer */}
      <div className="absolute inset-0 pointer-events-none p-8 flex flex-col justify-between">
        <div className="flex justify-end items-start gap-4">
          <div className="bg-black/40 backdrop-blur-md border border-white/10 px-4 py-2 rounded-xl flex items-center gap-3">
             <div className={`w-3 h-3 rounded-full ${isTracking ? 'bg-red-500 animate-pulse' : 'bg-gray-600'}`}></div>
             <span className="text-[10px] font-mono font-bold tracking-widest text-white uppercase">
              {isTracking ? 'ANALYSIS_ONLINE' : 'TRACKING_OFF'}
             </span>
             {isAnalyzing && (
               <div className="flex gap-1 ml-2">
                 <span className="w-1 h-1 bg-blue-500 rounded-full animate-bounce"></span>
                 <span className="w-1 h-1 bg-blue-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                 <span className="w-1 h-1 bg-blue-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
               </div>
             )}
          </div>
        </div>

        <div className="w-full flex flex-col items-center gap-4">
          <div className="flex gap-4 pointer-events-auto">
            <button 
              onClick={onToggle}
              className={`flex items-center gap-4 px-10 py-5 rounded-full font-black text-xl transition-all active:scale-95 shadow-2xl border-4 ${
                isTracking 
                  ? 'bg-red-600/10 border-red-600/50 text-white backdrop-blur-md hover:bg-red-600/30' 
                  : 'bg-blue-600 border-blue-400 text-white shadow-blue-500/40'
              }`}
            >
              {isTracking ? (
                <><i className="fa-solid fa-eye-slash"></i> PAUSE MIRROR</>
              ) : (
                <><i className="fa-solid fa-eye"></i> RESUME MIRROR</>
              )}
            </button>

            {isTracking && (
              <button 
                onClick={onManualCapture}
                disabled={isAnalyzing}
                className="w-20 h-20 bg-white hover:bg-blue-500 text-black hover:text-white rounded-full flex items-center justify-center text-3xl transition-all active:scale-90 shadow-2xl border-4 border-black group disabled:opacity-50 disabled:cursor-not-allowed"
                title="Manual Capture"
              >
                <i className={`fa-solid ${isAnalyzing ? 'fa-spinner fa-spin' : 'fa-camera'} group-hover:scale-110 transition-transform`}></i>
              </button>
            )}
          </div>
          
          {isTracking && (
            <span className="text-[9px] font-black text-white/40 uppercase tracking-[0.4em] animate-pulse">
              Tap camera for instant meme
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoFeed;
