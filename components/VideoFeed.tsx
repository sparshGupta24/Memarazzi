
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
          className={`w-full h-full object-cover transition-all duration-1000 ${isTracking ? 'scale-100 brightness-110 contrast-105' : 'scale-[1.02] brightness-90 contrast-100'}`}
        />
        
        {/* Subtle Vignette when Paused */}
        {!isTracking && (
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/60 pointer-events-none transition-opacity duration-1000"></div>
        )}

        <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-md px-3 py-1 rounded-lg border border-white/10 z-20">
          <span className="text-[10px] font-black text-white uppercase tracking-tighter">YOU (HOST)</span>
        </div>
        
        {/* Local Scan Line */}
        {isTracking && (
          <div className="absolute top-10 left-1/2 -translate-x-1/2 w-3/4 h-[1px] bg-gradient-to-r from-transparent via-blue-500/30 to-transparent animate-scan-line"></div>
        )}
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
      <div className="absolute inset-0 pointer-events-none p-8 flex flex-col justify-between z-10">
        <div className="flex justify-end items-start gap-4">
          <div className="bg-black/40 backdrop-blur-md border border-white/10 px-4 py-2 rounded-xl flex items-center gap-3">
             <div className={`w-3 h-3 rounded-full ${isTracking ? 'bg-red-500 animate-pulse' : 'bg-amber-500'}`}></div>
             <span className="text-[10px] font-mono font-bold tracking-widest text-white uppercase">
              {isTracking ? 'PAPARAZZI_AUTO' : 'STANDBY_MANUAL'}
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

        <div className="w-full flex flex-col items-center gap-6">
          {/* Enhanced Paparazzi Command Center */}
          <div className={`relative flex items-center gap-8 pointer-events-auto bg-black/60 backdrop-blur-3xl px-8 py-6 rounded-[4rem] border-2 transition-all duration-700 ${
            isTracking 
              ? 'border-blue-500/50 animate-glow-blue' 
              : 'border-amber-500/20 animate-glow-amber'
          }`}>
            
            {/* Spinning Lens Decor */}
            {isTracking && (
              <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-[4rem]">
                 <div className="absolute -inset-1 border-2 border-dashed border-blue-500/20 rounded-[4rem] animate-spin-slow"></div>
              </div>
            )}

            {/* State Indicator Badge */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className={`text-[8px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full border ${
                isTracking 
                  ? 'bg-blue-600 text-white border-blue-400 animate-pulse' 
                  : 'bg-amber-600/20 text-amber-500 border-amber-600/40'
              }`}>
                {isTracking ? 'LIVE_TRACKING' : 'MANUAL_MODE'}
              </span>
            </div>
            
            {/* The Funky Paparazzi Icon */}
            <div className="relative group">
              <div className={`text-4xl transition-all duration-500 ${isTracking ? 'text-white scale-110' : 'text-amber-500/60'}`}>
                <i className={`fa-solid fa-camera-retro ${isTracking ? 'animate-paparazzi-active' : 'animate-paparazzi-paused'}`}></i>
              </div>
              {isTracking && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-black animate-pulse"></div>
              )}
            </div>

            {/* Toggle Switch */}
            <div className="flex flex-col items-center gap-1">
              <button 
                onClick={onToggle}
                className={`relative w-20 h-10 rounded-full transition-all duration-500 p-1 flex items-center shadow-inner ${
                  isTracking ? 'bg-blue-600 shadow-blue-900/50' : 'bg-gray-800 shadow-black'
                }`}
              >
                <div className={`h-8 w-8 rounded-full bg-white shadow-xl transition-all duration-500 transform flex items-center justify-center ${
                  isTracking ? 'translate-x-10 rotate-180' : 'translate-x-0 rotate-0'
                }`}>
                  <i className={`fa-solid ${isTracking ? 'fa-check text-blue-600' : 'fa-power-off text-gray-400'} text-[10px]`}></i>
                </div>
              </button>
              <span className="text-[7px] font-black text-white/30 uppercase tracking-widest">AUTO_ON</span>
            </div>

            <div className="h-10 w-[1px] bg-white/10 mx-1"></div>
            
            {/* Manual Capture Button - Stronger visual when tracking is off */}
            <div className="flex flex-col items-center gap-1">
              <button 
                onClick={onManualCapture}
                disabled={isAnalyzing}
                className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl transition-all active:scale-90 shadow-2xl border-4 group disabled:opacity-30 disabled:cursor-not-allowed ${
                  isTracking 
                    ? 'bg-white border-black text-black hover:bg-blue-500 hover:text-white hover:border-blue-400' 
                    : 'bg-amber-500 border-amber-600 text-black animate-bounce [animation-iteration-count:3]'
                }`}
                title="Manual Capture"
              >
                <i className={`fa-solid ${isAnalyzing ? 'fa-spinner fa-spin' : 'fa-camera-polaroid'} group-hover:scale-110 transition-transform`}></i>
              </button>
              <span className={`text-[7px] font-black uppercase tracking-widest ${!isTracking ? 'text-amber-500' : 'text-white/30'}`}>SNAP_NOW</span>
            </div>
          </div>
          
          <div className="flex flex-col items-center">
            <span className={`text-[9px] font-black uppercase tracking-[0.5em] transition-colors duration-500 ${isTracking ? 'text-blue-400' : 'text-amber-500/50'}`}>
              {isTracking ? 'Paparazzi is hunting for memes' : 'Ready for manual snapshot'}
            </span>
            {isTracking && (
               <div className="mt-2 h-1 w-32 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 animate-[scan-line_2s_infinite]"></div>
               </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoFeed;
