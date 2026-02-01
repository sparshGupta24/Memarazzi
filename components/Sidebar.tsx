
import React from 'react';
import { MemeMatch } from '../types';

interface SidebarProps {
  history: MemeMatch[];
  onClose?: () => void;
  onRevisit?: (item: MemeMatch) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ history, onClose, onRevisit }) => {
  const getShareData = async (item: MemeMatch) => {
    const imageUrl = item.memeImageUrl || item.snapshotUrl;
    const shareText = `Check out this meme from my history!\n\n"${item.memeTitle}"`;
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    const file = new File([blob], `meme-${item.id}.png`, { type: 'image/png' });
    return { file, shareText };
  };

  const handleShare = async (e: React.MouseEvent, item: MemeMatch, type: 'wa' | 'mail' | 'native') => {
    e.stopPropagation();
    try {
      const { file, shareText } = await getShareData(item);

      if (type === 'wa') {
        if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({ files: [file], text: shareText });
        } else {
          window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank');
        }
      } else if (type === 'mail') {
        window.location.href = `mailto:?subject=Funny Meme!&body=${encodeURIComponent(shareText)}`;
      } else {
        if (navigator.share) {
          await navigator.share({ files: [file], title: 'Meme Mirror', text: shareText });
        }
      }
    } catch (err) {
      console.error("Share failed", err);
    }
  };

  return (
    <aside className="w-80 bg-gray-900/95 backdrop-blur-2xl border-r border-gray-800 flex flex-col h-full shadow-2xl">
      <div className="p-6 pt-20 border-b border-gray-800 flex items-center justify-between">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <i className="fa-solid fa-clock-rotate-left text-blue-500"></i>
          History
        </h2>
        {onClose && (
           <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
              <i className="fa-solid fa-xmark text-xl"></i>
           </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {history.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-gray-600 text-sm italic text-center px-4">
            The Mirror has not seen your soul yet...
          </div>
        ) : (
          history.map((item) => (
            <div 
              key={item.id} 
              onClick={() => onRevisit?.(item)}
              className="bg-gray-800/50 rounded-2xl p-4 border border-gray-700/50 hover:border-blue-500/50 transition-all cursor-pointer group hover:bg-gray-800/80"
            >
              <div className="flex flex-col gap-3">
                <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-black border border-white/5">
                  <img 
                    src={item.memeImageUrl || item.snapshotUrl} 
                    alt="Meme" 
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500" 
                  />
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={(e) => handleShare(e, item, 'wa')}
                      className="p-1.5 bg-[#25D366] text-white rounded-lg border border-white/20 hover:bg-[#20ba59] transition-colors shadow-lg"
                      title="Share via WhatsApp"
                    >
                      <i className="fa-brands fa-whatsapp text-[10px]"></i>
                    </button>
                    <button 
                      onClick={(e) => handleShare(e, item, 'mail')}
                      className="p-1.5 bg-blue-500 text-white rounded-lg border border-white/20 hover:bg-blue-400 transition-colors shadow-lg"
                      title="Share via Email"
                    >
                      <i className="fa-solid fa-envelope text-[10px]"></i>
                    </button>
                  </div>
                  <div className="absolute bottom-2 left-2">
                     <span className="text-[8px] bg-black/60 backdrop-blur-md text-white px-2 py-0.5 rounded-full uppercase font-black border border-white/10">
                        {item.humorStyle}
                     </span>
                  </div>
                </div>
                
                <div className="min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[9px] text-gray-500 font-mono">
                      {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className="text-[9px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-full uppercase font-black tracking-tighter">
                      {item.mood.split(' ')[0]}
                    </span>
                  </div>
                  <h3 className="text-xs font-black text-gray-100 truncate mb-1">{item.memeTitle}</h3>
                  <p className="text-[10px] text-gray-400 line-clamp-2 italic leading-relaxed">
                    "{item.memeCaption}"
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      
      <div className="p-4 border-t border-gray-800 text-[10px] text-gray-600 font-mono text-center uppercase tracking-widest">
        Click a meme to re-open
      </div>
    </aside>
  );
};

export default Sidebar;
