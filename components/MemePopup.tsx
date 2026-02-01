
import React from 'react';
import { MemeMatch } from '../types';

interface MemePopupProps {
  match: MemeMatch;
  isAnalyzing: boolean;
}

const MemePopup: React.FC<MemePopupProps> = ({ match, isAnalyzing }) => {
  return (
    <div className={`w-[85vw] max-w-sm bg-black border-4 border-white rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden transition-all duration-300 ring-4 ring-black/40`}>
      {/* Visual Header */}
      <div className="bg-white py-2 px-6 flex justify-between items-center">
        <span className="text-black text-[10px] font-black tracking-widest uppercase">MATCHED_MEME.EXE</span>
        <div className="flex gap-1">
          <div className="w-1.5 h-1.5 bg-black rounded-full"></div>
          <div className="w-1.5 h-1.5 bg-black/40 rounded-full"></div>
        </div>
      </div>

      <div className="relative bg-black aspect-square w-full">
        <img 
          src={match.snapshotUrl} 
          alt="Meme Mirror" 
          className="w-full h-full object-cover opacity-90"
        />
        
        {/* Meme Text Overlay */}
        <div className="absolute inset-0 flex flex-col justify-between p-4 pointer-events-none">
          <h3 className="text-center text-white text-xl font-black uppercase tracking-tighter drop-shadow-[0_4px_0_rgba(0,0,0,1)] [text-shadow:_-2px_-2px_0_#000,2px_-2px_0_#000,_-2px_2px_0_#000,2px_2px_0_#000]">
            {match.memeTitle}
          </h3>
          <p className="text-center text-white text-lg font-black uppercase leading-tight drop-shadow-[0_4px_0_rgba(0,0,0,1)] [text-shadow:_-2px_-2px_0_#000,2px_-2px_0_#000,_-2px_2px_0_#000,2px_2px_0_#000]">
            {match.memeCaption}
          </p>
        </div>
      </div>

      <div className="p-4 bg-white space-y-3">
        <div className="flex items-center gap-3">
           <div className="flex-1">
              <p className="text-[8px] text-gray-400 uppercase font-black tracking-widest leading-none mb-1">Aura</p>
              <p className="text-xs text-black font-bold leading-none truncate">{match.mood}</p>
           </div>
           <div className="flex-1">
              <p className="text-[8px] text-gray-400 uppercase font-black tracking-widest leading-none mb-1">Action</p>
              <p className="text-xs text-black font-bold leading-none truncate">{match.action}</p>
           </div>
        </div>

        <div className="flex gap-2">
           <button 
              onClick={() => {
                const link = document.createElement('a');
                link.download = `meme-${match.id}.png`;
                link.href = match.snapshotUrl;
                link.click();
              }}
              className="flex-1 bg-black text-white py-3 rounded-xl font-black text-xs hover:invert transition-all flex items-center justify-center gap-2"
           >
             <i className="fa-solid fa-download"></i> SAVE
           </button>
           {match.sourceUrl && (
             <a 
               href={match.sourceUrl} 
               target="_blank" 
               rel="noopener noreferrer"
               className="p-3 border-2 border-black text-black rounded-xl font-black text-xs hover:bg-black hover:text-white transition-all flex items-center justify-center"
             >
               <i className="fa-solid fa-share"></i>
             </a>
           )}
        </div>
      </div>
      
      {/* 10s Timer Progress Bar */}
      <div className="h-1.5 w-full bg-gray-200">
        <div className="h-full bg-blue-500 animate-progress-shrink origin-left"></div>
      </div>
    </div>
  );
};

export default MemePopup;
