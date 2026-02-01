
import React, { useState } from 'react';
import { MemeMatch } from '../types';

interface MemePopupProps {
  match: MemeMatch;
  isAnalyzing: boolean;
}

const MemePopup: React.FC<MemePopupProps> = ({ match, isAnalyzing }) => {
  const [shareError, setShareError] = useState<string | null>(null);

  const getShareData = async () => {
    const imageUrl = match.memeImageUrl || match.snapshotUrl;
    const shareText = `Check out this meme I just made! \n\n"${match.memeTitle}"\n"${match.memeCaption}"`;
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    const file = new File([blob], `meme-${Date.now()}.png`, { type: 'image/png' });
    return { file, shareText, imageUrl };
  };

  const shareWhatsApp = async () => {
    try {
      const { file, shareText } = await getShareData();
      // Try native share first as it allows sending the actual IMAGE file
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'Meme Mirror AI',
          text: shareText,
        });
      } else {
        // Fallback to text sharing via URL
        const encodedText = encodeURIComponent(shareText);
        window.open(`https://wa.me/?text=${encodedText}`, '_blank');
      }
    } catch (e) {
      console.error(e);
      setShareError("WhatsApp share failed.");
    }
  };

  const shareMail = async () => {
    const shareText = `Check out this meme I just made! \n\n"${match.memeTitle}"\n"${match.memeCaption}"`;
    const mailUrl = `mailto:?subject=Look at this meme!&body=${encodeURIComponent(shareText)}`;
    window.location.href = mailUrl;
  };

  const shareNative = async () => {
    try {
      const { file, shareText } = await getShareData();
      if (navigator.share) {
        await navigator.share({
          files: [file],
          title: 'Meme Mirror AI',
          text: shareText,
        });
      } else {
        setShareError("System share not supported.");
      }
    } catch (e) {
      setShareError("Share failed.");
    }
  };

  return (
    <div className={`w-[90vw] max-w-[400px] bg-white rounded-[2rem] shadow-[0_40px_100px_rgba(0,0,0,0.6)] overflow-hidden transition-all duration-300 border-[12px] border-white relative`}>
      {/* Visual Header */}
      <div className="bg-black py-2 px-6 flex justify-between items-center">
        <span className="text-white text-[9px] font-black tracking-widest uppercase italic">GEN_LOCAL_400x400</span>
        <div className="flex gap-1.5">
          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
          <div className="w-1.5 h-1.5 bg-white/20 rounded-full"></div>
        </div>
      </div>

      <div className="relative bg-black aspect-square w-full group">
        <img 
          src={match.memeImageUrl || match.snapshotUrl} 
          alt="Meme Mirror Result" 
          className="w-full h-full object-contain pointer-events-none"
        />
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

        {/* Action Buttons */}
        <div className="flex flex-col gap-2">
           <div className="flex gap-2">
              <button 
                  onClick={() => {
                    const link = document.createElement('a');
                    link.download = `mirror-meme-${Date.now()}.png`;
                    link.href = match.memeImageUrl || match.snapshotUrl;
                    link.click();
                  }}
                  className="flex-1 bg-black text-white py-4 rounded-2xl font-black text-[10px] hover:bg-gray-800 transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                <i className="fa-solid fa-download"></i> SAVE
              </button>
              
              <button 
                  onClick={shareNative}
                  className="flex-1 bg-gray-100 text-black py-4 rounded-2xl font-black text-[10px] hover:bg-gray-200 transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                <i className="fa-solid fa-share-nodes"></i> OTHERS
              </button>
           </div>

           <div className="flex gap-2">
              <button 
                  onClick={shareWhatsApp}
                  className="flex-1 bg-[#25D366] text-white py-4 rounded-2xl font-black text-[10px] hover:bg-[#20ba59] transition-all flex items-center justify-center gap-2 active:scale-95 shadow-lg shadow-green-500/20"
              >
                <i className="fa-brands fa-whatsapp text-sm"></i> WHATSAPP
              </button>
              
              <button 
                  onClick={shareMail}
                  className="flex-1 bg-blue-500 text-white py-4 rounded-2xl font-black text-[10px] hover:bg-blue-400 transition-all flex items-center justify-center gap-2 active:scale-95 shadow-lg shadow-blue-500/20"
              >
                <i className="fa-solid fa-envelope text-sm"></i> EMAIL
              </button>
           </div>
        </div>
        
        {shareError && (
          <p className="text-[9px] text-red-500 text-center font-bold uppercase animate-pulse">{shareError}</p>
        )}
      </div>
      
      {/* 10s Timer Progress Bar */}
      <div className="h-2 w-full bg-gray-100">
        <div className="h-full bg-blue-500 animate-progress-shrink origin-left"></div>
      </div>
    </div>
  );
};

export default MemePopup;
