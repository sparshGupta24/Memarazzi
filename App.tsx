
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Peer, DataConnection } from 'peerjs';
import { analyzeFrame } from './services/gemini';
import { MemeMatch } from './types';
import Sidebar from './components/Sidebar';
import VideoFeed from './components/VideoFeed';
import MemePopup from './components/MemePopup';

const WITTY_PHRASES = [
  "Gotcha! Matching your vibe...",
  "Hold on, I've got a meme for this!",
  "Analyzing that face... hold still...",
  "Searching the archives for your twin...",
  "This is pure internet gold. Processing...",
  "Wait until you see this match...",
  "Scanning for high-quality irony...",
  "Found something perfect for that look!"
];

const App: React.FC = () => {
  const [history, setHistory] = useState<MemeMatch[]>([]);
  const [currentMatch, setCurrentMatch] = useState<MemeMatch | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isTracking, setIsTracking] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [wittyMessage, setWittyMessage] = useState("");
  const [showShareModal, setShowShareModal] = useState(false);
  
  // Peer State
  const [peer, setPeer] = useState<Peer | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [peerConnection, setPeerConnection] = useState<DataConnection | null>(null);
  const [roomId, setRoomId] = useState<string>("");
  const [isCopied, setIsCopied] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const popupTimerRef = useRef<number | null>(null);

  // PeerJS Setup & Room Management
  useEffect(() => {
    const hash = window.location.hash.replace('#', '');
    const currentRoom = hash || Math.random().toString(36).substring(2, 9);
    setRoomId(currentRoom);
    if (!hash) window.location.hash = currentRoom;

    const newPeer = new Peer(currentRoom, {
      debug: 1,
      config: {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
        ]
      }
    });

    newPeer.on('open', (id) => {
      console.log('Peer ID active: ' + id);
      setPeer(newPeer);
    });

    newPeer.on('call', async (call) => {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      call.answer(stream);
      call.on('stream', (rStream) => setRemoteStream(rStream));
    });

    newPeer.on('connection', (conn) => {
      setPeerConnection(conn);
      conn.on('data', (data: any) => {
        if (data.type === 'MEME_MATCH') {
          handleIncomingMeme(data.payload);
        }
      });
    });

    if (hash) {
      // Auto-connect to host if hash is present
      const interval = setInterval(() => {
        if (newPeer.open) {
          clearInterval(interval);
          attemptConnection(newPeer, hash);
        }
      }, 500);
    }

    return () => {
      newPeer.destroy();
    };
  }, []);

  const attemptConnection = async (p: Peer, targetId: string) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      const call = p.call(targetId, stream);
      call.on('stream', (rStream) => setRemoteStream(rStream));
      
      const conn = p.connect(targetId);
      setPeerConnection(conn);
      conn.on('data', (data: any) => {
        if (data.type === 'MEME_MATCH') {
          handleIncomingMeme(data.payload);
        }
      });
    } catch (e) {
      console.warn("Retrying connection...", e);
    }
  };

  const handleIncomingMeme = (match: MemeMatch) => {
    setCurrentMatch(match);
    setHistory(prev => [match, ...prev].slice(0, 50));
    setShowPopup(true);
    if (popupTimerRef.current) window.clearTimeout(popupTimerRef.current);
    popupTimerRef.current = window.setTimeout(() => setShowPopup(false), 10000);
  };

  const performAnalysis = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || isAnalyzing || !isTracking) return;

    setIsAnalyzing(true);
    setWittyMessage(WITTY_PHRASES[Math.floor(Math.random() * WITTY_PHRASES.length)]);

    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      if (context && video.videoWidth > 0) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        const base64Image = canvas.toDataURL('image/jpeg', 0.8).split(',')[1];
        const analysis = await analyzeFrame(base64Image);
        
        const newMatch: MemeMatch = {
          id: Date.now().toString(),
          timestamp: Date.now(),
          mood: analysis.result.mood,
          action: analysis.result.action,
          memeTitle: analysis.result.memeTitle,
          memeCaption: analysis.result.memeCaption,
          snapshotUrl: canvas.toDataURL('image/jpeg'),
          sourceUrl: analysis.sourceUrl,
        };

        setCurrentMatch(newMatch);
        setHistory(prev => [newMatch, ...prev].slice(0, 50));
        
        if (peerConnection) {
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
  }, [isAnalyzing, isTracking, peerConnection]);

  useEffect(() => {
    let interval: number | null = null;
    if (isTracking) {
      interval = window.setInterval(() => {
        performAnalysis();
      }, 18000); 
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTracking, performAnalysis]);

  const copyInviteLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-black font-sans">
      <VideoFeed 
        videoRef={videoRef} 
        remoteStream={remoteStream}
        isTracking={isTracking} 
        onToggle={() => setIsTracking(!isTracking)} 
        isAnalyzing={isAnalyzing}
      />
      <canvas ref={canvasRef} className="hidden" />

      {/* History Sidebar */}
      <div className={`absolute left-0 top-0 h-full z-40 transition-transform duration-500 ease-in-out ${showHistory ? 'translate-x-0' : '-translate-x-full'}`}>
        <Sidebar history={history} onClose={() => setShowHistory(false)} />
      </div>

      {/* Controls Overlay */}
      <div className="absolute top-6 left-6 z-50 flex flex-col gap-3">
        <button 
          onClick={() => setShowHistory(!showHistory)}
          className="p-3 bg-black/60 backdrop-blur-md border border-white/20 rounded-full text-white hover:bg-white/30 transition-all shadow-xl w-fit"
          title="View History"
        >
          <i className={`fa-solid ${showHistory ? 'fa-chevron-left' : 'fa-clock-rotate-left'} text-xl`}></i>
        </button>

        <button 
          onClick={() => setShowShareModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-full font-bold text-xs shadow-xl transition-all border border-blue-400/30"
        >
          <i className="fa-solid fa-share-nodes"></i>
          Share Live Room
        </button>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" onClick={() => setShowShareModal(false)}></div>
          <div className="relative w-full max-w-md bg-gray-900 border-2 border-blue-500/50 rounded-[2.5rem] p-8 shadow-[0_0_100px_rgba(37,99,235,0.3)] animate-in zoom-in duration-300">
            <h2 className="text-2xl font-black text-white mb-2 italic">GO GLOBAL 🚀</h2>
            <p className="text-gray-400 text-sm mb-6">
              To use this room with friends across the world, host these files on <span className="text-blue-400 font-bold">Vercel</span> or <span className="text-blue-400 font-bold">Netlify</span>.
            </p>
            
            <div className="space-y-4">
              <div className="bg-black/50 p-4 rounded-2xl border border-white/10">
                <p className="text-[10px] text-gray-500 uppercase font-bold mb-2">Your Private Room URL</p>
                <div className="flex items-center gap-2">
                  <input 
                    readOnly 
                    value={window.location.href} 
                    className="flex-1 bg-transparent text-sm text-blue-300 font-mono outline-none truncate"
                  />
                  <button 
                    onClick={copyInviteLink}
                    className="bg-blue-600 px-3 py-1.5 rounded-lg text-xs font-black hover:bg-blue-500 transition-colors"
                  >
                    {isCopied ? 'COPIED!' : 'COPY'}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                 <a href="https://vercel.com/new" target="_blank" className="bg-white text-black p-4 rounded-2xl text-center font-black text-xs hover:scale-95 transition-transform">
                   DEPLOY TO VERCEL
                 </a>
                 <a href="https://app.netlify.com/drop" target="_blank" className="bg-gray-800 text-white p-4 rounded-2xl text-center font-black text-xs hover:scale-95 transition-transform border border-white/10">
                   NETLIFY DROP
                 </a>
              </div>
            </div>

            <button 
              onClick={() => setShowShareModal(false)}
              className="mt-6 w-full py-3 text-gray-500 text-xs font-bold hover:text-white transition-colors"
            >
              CLOSE ASSISTANT
            </button>
          </div>
        </div>
      )}

      {/* Connection Notification */}
      {remoteStream && (
        <div className="absolute top-6 right-32 z-50">
          <div className="bg-green-600/90 backdrop-blur-md px-4 py-1.5 rounded-full border border-green-400/30 shadow-xl flex items-center gap-2">
            <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
            <span className="text-white font-black text-[10px] uppercase">GUEST_CONNECTED</span>
          </div>
        </div>
      )}

      {/* Witty Toast Feedback */}
      <div className={`absolute top-20 left-1/2 -translate-x-1/2 z-50 transition-all duration-500 transform ${isAnalyzing ? 'translate-y-0 opacity-100 scale-100' : '-translate-y-10 opacity-0 scale-95'}`}>
        <div className="bg-blue-600/90 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/20 shadow-2xl flex items-center gap-3">
          <i className="fa-solid fa-robot text-white animate-pulse"></i>
          <span className="text-white font-bold text-sm tracking-tight whitespace-nowrap">{wittyMessage}</span>
        </div>
      </div>

      {/* Side Meme Popup Overlay */}
      <div className={`absolute right-6 top-1/2 -translate-y-1/2 z-30 transition-all duration-700 ease-out transform ${currentMatch && showPopup ? 'translate-x-0 opacity-100' : 'translate-x-[120%] opacity-0'}`}>
        {currentMatch && (
          <div className="relative">
            <MemePopup match={currentMatch} isAnalyzing={isAnalyzing} />
            <button 
              onClick={() => setShowPopup(false)}
              className="absolute -top-3 -left-3 w-10 h-10 bg-white text-black rounded-full flex items-center justify-center font-bold shadow-2xl hover:scale-110 transition-transform z-10 border-4 border-black"
            >
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>
        )}
      </div>

      <div className="absolute bottom-6 left-6 z-10 pointer-events-none flex items-center gap-3">
        <h1 className="text-lg font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500 tracking-tighter">
          MEME MIRROR AI
        </h1>
        <div className="h-4 w-[1px] bg-white/20"></div>
        <span className="text-[10px] text-white/40 uppercase font-mono tracking-widest">
          {window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? 'LOCAL_DEV_MODE' : 'GLOBAL_NODE_ACTIVE'} : {roomId}
        </span>
      </div>
    </div>
  );
};

export default App;
