
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Peer, DataConnection } from 'peerjs';
import { analyzeFrame } from './services/gemini';
import { MemeMatch, HumorStyle } from './types';
import Sidebar from './components/Sidebar';
import VideoFeed from './components/VideoFeed';
import MemePopup from './components/MemePopup';
import { createMemeImage } from './utils/memeComposer';

const WITTY_PHRASES = [
  "Gotcha! Matching your vibe...",
  "Searching the archives for your twin...",
  "Processing high-quality irony...",
  "Found something perfect for that look!",
  "Analyzing your aura... hold still...",
  "This is pure internet gold..."
];

const SAVAGE_COOLDOWN_PHRASES = [
  "Chill out, you're not that interesting.",
  "My server needs a break from your face.",
  "Patience is a virtue you clearly lack.",
  "Even AI has limits. Yours are just lower.",
  "Is your thumb okay? You're clicking like a bot.",
  "Give the magic a second to breathe, Narcissus.",
  "Slow down, the internet isn't ready for that much of you."
];

const HUMOR_MODES: { id: HumorStyle; label: string; icon: string; color: string }[] = [
  { id: 'classic', label: 'Classic', icon: 'fa-face-laugh-squint', color: 'bg-blue-500' },
  { id: 'savage', label: 'Savage', icon: 'fa-skull', color: 'bg-red-600' },
  { id: 'wholesome', label: 'Wholesome', icon: 'fa-heart', color: 'bg-pink-500' },
  { id: 'sarcastic', label: 'Sarcastic', icon: 'fa-eye-roll', color: 'bg-purple-600' },
  { id: 'brainrot', label: 'Brainrot', icon: 'fa-toilet', color: 'bg-green-500' },
];

const ANALYSIS_INTERVAL = 30000; 
const MANUAL_COOLDOWN = 5000;

const App: React.FC = () => {
  const [history, setHistory] = useState<MemeMatch[]>([]);
  const [currentMatch, setCurrentMatch] = useState<MemeMatch | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isTracking, setIsTracking] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [wittyMessage, setWittyMessage] = useState("");
  const [showShareModal, setShowShareModal] = useState(false);
  const [humorStyle, setHumorStyle] = useState<HumorStyle>('classic');
  const [savageToast, setSavageToast] = useState<string | null>(null);
  
  // Peer State
  const [peer, setPeer] = useState<Peer | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [peerConnection, setPeerConnection] = useState<DataConnection | null>(null);
  const [roomId, setRoomId] = useState<string>("");
  const [isCopied, setIsCopied] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const popupTimerRef = useRef<number | null>(null);
  const connectionAttempted = useRef(false);
  const lastAnalysisTime = useRef<number>(0);
  const lastManualClickTime = useRef<number>(0);
  const intervalRef = useRef<number | null>(null);

  // Function to perform analysis
  const performAnalysis = useCallback(async (isManual = false) => {
    const now = Date.now();
    
    // Safety check: is video ready?
    if (!videoRef.current || !canvasRef.current || isAnalyzing) return;
    
    // If not manual, only run if tracking is active
    if (!isManual && !isTracking) return;

    // Minimum cooldown between any two automatic analyses to protect quota
    if (!isManual && (now - lastAnalysisTime.current < 15000)) return;

    setIsAnalyzing(true);
    lastAnalysisTime.current = now;
    setWittyMessage(WITTY_PHRASES[Math.floor(Math.random() * WITTY_PHRASES.length)]);

    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      if (context && video.videoWidth > 0) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        const rawSnapshot = canvas.toDataURL('image/jpeg', 0.8);
        const base64Image = rawSnapshot.split(',')[1];
        
        const analysis = await analyzeFrame(base64Image, humorStyle);
        const compositeMemeUrl = await createMemeImage(rawSnapshot, analysis.memeTitle, analysis.memeCaption, humorStyle);

        const newMatch: MemeMatch = {
          id: Date.now().toString(),
          timestamp: Date.now(),
          mood: analysis.mood,
          action: analysis.action,
          memeTitle: analysis.memeTitle,
          memeCaption: analysis.memeCaption,
          snapshotUrl: rawSnapshot,
          memeImageUrl: compositeMemeUrl,
          humorStyle: humorStyle,
        };

        setCurrentMatch(newMatch);
        setHistory(prev => [newMatch, ...prev].slice(0, 50));
        
        if (peerConnection && peerConnection.open) {
          peerConnection.send({ type: 'MEME_MATCH', payload: newMatch });
        }

        setShowPopup(true);
        if (popupTimerRef.current) window.clearTimeout(popupTimerRef.current);
        popupTimerRef.current = window.setTimeout(() => setShowPopup(false), 10000);
      }
    } catch (error) {
      console.error("Analysis failed:", error);
    } finally {
      setIsAnalyzing(false);
    }
  }, [isAnalyzing, isTracking, peerConnection, humorStyle]);

  // Handle manual capture
  const handleManualCapture = () => {
    const now = Date.now();
    if (now - lastManualClickTime.current < MANUAL_COOLDOWN) {
      // Savage feedback
      setSavageToast(SAVAGE_COOLDOWN_PHRASES[Math.floor(Math.random() * SAVAGE_COOLDOWN_PHRASES.length)]);
      setTimeout(() => setSavageToast(null), 3000);
      return;
    }

    lastManualClickTime.current = now;
    performAnalysis(true);
    
    // Reset the automatic interval cycle if tracking is on
    if (isTracking && intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = window.setInterval(() => {
        performAnalysis();
      }, ANALYSIS_INTERVAL);
    }
  };

  // Setup/Reset automatic interval
  useEffect(() => {
    if (isTracking) {
      intervalRef.current = window.setInterval(() => {
        performAnalysis();
      }, ANALYSIS_INTERVAL); 
    } else {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
  }, [isTracking, performAnalysis]);

  // PeerJS Setup
  useEffect(() => {
    const hash = window.location.hash.replace('#', '');
    const isJoining = !!hash;
    const targetRoomId = hash || Math.random().toString(36).substring(2, 9);
    setRoomId(targetRoomId);
    if (!hash) window.location.hash = targetRoomId;

    const myPeerId = isJoining ? `guest-${Math.random().toString(36).substring(2, 7)}` : targetRoomId; 

    const newPeer = new Peer(myPeerId, {
      debug: 1,
      config: {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
        ]
      }
    });

    newPeer.on('open', (id) => {
      setPeer(newPeer);
      setConnectionError(null);
      if (isJoining && !connectionAttempted.current) {
        connectionAttempted.current = true;
        setTimeout(() => initiateConnection(newPeer, targetRoomId), 1500);
      }
    });

    newPeer.on('call', async (call) => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        call.answer(stream);
        call.on('stream', (rStream) => setRemoteStream(rStream));
      } catch (err) { console.error(err); }
    });

    newPeer.on('connection', (conn) => {
      setPeerConnection(conn);
      conn.on('data', (data: any) => {
        if (data.type === 'MEME_MATCH') handleIncomingMeme(data.payload);
      });
    });

    newPeer.on('error', (err) => {
      if (err.type === 'peer-not-found') setConnectionError("Host not found.");
      else if (err.type === 'id-taken' && !isJoining) window.location.reload();
    });

    return () => newPeer.destroy();
  }, []);

  const initiateConnection = async (p: Peer, targetId: string) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      const call = p.call(targetId, stream);
      call.on('stream', (rStream) => setRemoteStream(rStream));
      const conn = p.connect(targetId);
      setPeerConnection(conn);
      conn.on('data', (data: any) => {
        if (data.type === 'MEME_MATCH') handleIncomingMeme(data.payload);
      });
    } catch (e) {
      setConnectionError("Failed to connect. Retrying...");
      setTimeout(() => initiateConnection(p, targetId), 5000);
    }
  };

  const handleIncomingMeme = (match: MemeMatch) => {
    setCurrentMatch(match);
    setHistory(prev => [match, ...prev].slice(0, 50));
    setShowPopup(true);
    if (popupTimerRef.current) window.clearTimeout(popupTimerRef.current);
    popupTimerRef.current = window.setTimeout(() => setShowPopup(false), 10000);
  };

  const copyInviteLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const revisitMeme = (item: MemeMatch) => {
    setCurrentMatch(item);
    setShowPopup(true);
    setShowHistory(false);
    if (popupTimerRef.current) window.clearTimeout(popupTimerRef.current);
    popupTimerRef.current = window.setTimeout(() => setShowPopup(false), 10000);
  };

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-black font-sans selection:bg-blue-500 selection:text-white">
      <VideoFeed 
        videoRef={videoRef} 
        remoteStream={remoteStream}
        isTracking={isTracking} 
        onToggle={() => setIsTracking(!isTracking)} 
        onManualCapture={handleManualCapture}
        isAnalyzing={isAnalyzing}
      />
      <canvas ref={canvasRef} className="hidden" />

      {/* History Sidebar */}
      <div className={`absolute left-0 top-0 h-full z-40 transition-transform duration-500 ease-in-out ${showHistory ? 'translate-x-0' : '-translate-x-full'}`}>
        <Sidebar history={history} onClose={() => setShowHistory(false)} onRevisit={revisitMeme} />
      </div>

      {/* Controls Overlay */}
      <div className="absolute top-6 left-6 z-50 flex flex-col gap-3">
        <button 
          onClick={() => setShowHistory(!showHistory)}
          className="p-4 bg-black/60 backdrop-blur-xl border border-white/20 rounded-full text-white hover:bg-white/30 transition-all shadow-2xl w-fit group"
          title="View History"
        >
          <i className={`fa-solid ${showHistory ? 'fa-chevron-left' : 'fa-clock-rotate-left'} text-xl group-hover:scale-110 transition-transform`}></i>
        </button>

        <button 
          onClick={() => setShowShareModal(true)}
          className="flex items-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-full font-black text-xs shadow-2xl transition-all border border-blue-400/30 active:scale-95"
        >
          <i className="fa-solid fa-share-nodes"></i>
          INVITE FRIEND
        </button>
      </div>

      {/* Humor Mode Selector */}
      <div className="absolute top-6 right-6 z-50 flex items-center gap-2 bg-black/40 backdrop-blur-xl p-2 rounded-full border border-white/10 shadow-2xl">
        <div className="px-3 py-1 flex items-center gap-2 border-r border-white/10 mr-1">
          <i className="fa-solid fa-masks-theater text-blue-400 text-sm"></i>
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest hidden sm:inline">Humor</span>
        </div>
        {HUMOR_MODES.map((mode) => (
          <button
            key={mode.id}
            onClick={() => setHumorStyle(mode.id)}
            className={`px-4 py-2 rounded-full text-[10px] font-black uppercase transition-all flex items-center gap-2 ${
              humorStyle === mode.id 
                ? `${mode.color} text-white shadow-lg scale-105` 
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <i className={`fa-solid ${mode.icon}`}></i>
            <span className="hidden lg:inline">{mode.label}</span>
          </button>
        ))}
      </div>

      {/* Savage Cooldown Toast */}
      {savageToast && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[100] animate-in zoom-in duration-300">
           <div className="bg-red-600 text-white px-10 py-6 rounded-[2rem] border-4 border-black shadow-[0_30px_60px_rgba(0,0,0,0.8)] flex flex-col items-center gap-4 max-w-sm text-center">
             <i className="fa-solid fa-skull-crossbones text-4xl animate-bounce"></i>
             <p className="font-black text-xl italic tracking-tighter uppercase leading-none">{savageToast}</p>
             <span className="text-[10px] font-black bg-black/20 px-3 py-1 rounded-full uppercase">Wait for it...</span>
           </div>
        </div>
      )}

      {/* Connection Errors Overlay */}
      {connectionError && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-[60] animate-in fade-in slide-in-from-top duration-300">
           <div className="bg-red-600/90 backdrop-blur-md px-6 py-3 rounded-full border border-red-400/30 shadow-2xl flex items-center gap-3">
             <i className="fa-solid fa-circle-exclamation text-white"></i>
             <span className="text-white font-black text-xs uppercase tracking-widest">{connectionError}</span>
             <button onClick={() => setConnectionError(null)} className="text-white/60 hover:text-white"><i className="fa-solid fa-xmark"></i></button>
           </div>
        </div>
      )}

      {/* Witty Analysis Feedback */}
      <div className={`absolute top-24 left-1/2 -translate-x-1/2 z-50 transition-all duration-500 transform ${isAnalyzing ? 'translate-y-0 opacity-100 scale-100' : '-translate-y-10 opacity-0 scale-95'}`}>
        <div className="bg-blue-600/90 backdrop-blur-md px-8 py-4 rounded-full border border-white/20 shadow-2xl flex items-center gap-3">
          <i className="fa-solid fa-wand-magic-sparkles text-white animate-spin-slow"></i>
          <span className="text-white font-black text-sm tracking-tight whitespace-nowrap uppercase">{wittyMessage}</span>
        </div>
      </div>

      {/* Side Meme Popup Overlay */}
      <div className={`absolute right-10 top-1/2 -translate-y-1/2 z-30 transition-all duration-700 ease-out transform ${currentMatch && showPopup ? 'translate-x-0 opacity-100 rotate-0' : 'translate-x-[120%] opacity-0 rotate-12'}`}>
        {currentMatch && (
          <div className="relative group">
            <MemePopup match={currentMatch} isAnalyzing={isAnalyzing} />
            <button 
              onClick={() => setShowPopup(false)}
              className="absolute -top-4 -left-4 w-12 h-12 bg-white text-black rounded-full flex items-center justify-center font-bold shadow-2xl hover:scale-110 transition-transform z-10 border-4 border-black"
            >
              <i className="fa-solid fa-xmark text-lg"></i>
            </button>
          </div>
        )}
      </div>

      <div className="absolute bottom-8 left-10 z-10 pointer-events-none flex items-center gap-4">
        <h1 className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-500 tracking-tighter italic">MEME MIRROR</h1>
        <div className="h-6 w-[1px] bg-white/10"></div>
        <span className="text-[10px] text-white/30 uppercase font-mono tracking-[0.2em]">{remoteStream ? 'SYNC_MODE_P2P' : 'STANDALONE_MODE'}</span>
      </div>
    </div>
  );
};

export default App;
