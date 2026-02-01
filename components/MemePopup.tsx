
import React from 'react';
import { MemeMatch } from '../types';

interface MemePopupProps {
  match: MemeMatch;
  isAnalyzing: boolean;
}

const MemePopup: React.FC<MemePopupProps> = ({ match, isAnalyzing }) => {
  return (
    <div className={`w-[90vw] max-w-[400px] bg-white rounded-[2rem] shadow-[0_40px_100px_rgba(0,0,0,0.6)] overflow-hidden transition-all duration-300 border-[12px] border-white`}>
      {/* Visual Header */}
      <div className="bg-black py-2 px-6 flex justify-between items-center">
        <span className="text-white text-[9px] font-black tracking-widest uppercase italic">GEN_LOCAL_400x400</span>
        <div className="flex gap-1.5">
          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
          <div className="w-1.5 h-1.5 bg-white/20 rounded-full"></div>
        </div>
      </div>

      <div className="relative bg-black aspect-square w-full group">
        {/* The mutated 400x400 image - The core of the request */}
        <img 
          src={match.memeImageUrl || match.snapshotUrl} 
          alt="Meme Mirror Result" 
          className="w-full h-full object-contain pointer-events-none"
        />
        
        {/* Hover info overlay */}
        <div className="absolute inset-0 bg-blue-600/0 group-hover:bg-blue-600/10 transition-colors duration-500"></div>
      </div>

      <div className="p-6 bg-white space-y-4">
        <div className="grid grid-cols-2 gap-4">
           <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100">
              <p className="text-[7px] text-gray-400 uppercase font-black tracking-widest mb-1">DETECTION_MOOD</p>
              <p className="text-[11px] text-black font-black uppercase truncate">{match.mood}</p>
           </div>
           <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100">
              <p className="text-[7px] text-gray-400 uppercase font-black tracking-widest mb-1">DETECTION_POSE</p>
              <p className="text-[11px] text-black font-black uppercase truncate">{match.action}</p>
           </div>
        </div>

        <div className="flex gap-3">
           <button 
              onClick={() => {
                const link = document.createElement('a');
                link.download = `mirror-meme-${Date.now()}.png`;
                link.href = match.memeImageUrl || match.snapshotUrl;
                link.click();
              }}
              className="flex-1 bg-black text-white py-4 rounded-2xl font-black text-xs hover:bg-blue-600 transition-all flex items-center justify-center gap-2 active:scale-95 shadow-xl shadow-black/10"
           >
             <i className="fa-solid fa-download"></i> SAVE IMAGE
           </button>
        </div>
      </div>
      
      {/* 10s Timer Progress Bar */}
      <div className="h-2 w-full bg-gray-100">
        <div className="h-full bg-blue-500 animate-progress-shrink origin-left"></div>
      </div>
    </div>
  );
};

export default MemePopup;
