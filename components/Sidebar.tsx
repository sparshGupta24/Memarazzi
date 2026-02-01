
import React from 'react';
import { MemeMatch } from '../types';

interface SidebarProps {
  history: MemeMatch[];
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ history, onClose }) => {
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
          <div className="flex flex-col items-center justify-center h-40 text-gray-600 text-sm italic">
            No memories yet...
          </div>
        ) : (
          history.map((item) => (
            <div 
              key={item.id} 
              className="bg-gray-800/50 rounded-xl p-3 border border-gray-700/50 hover:border-blue-500/50 transition-all cursor-pointer group"
            >
              <div className="flex gap-3">
                <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-black shrink-0">
                  <img 
                    src={item.snapshotUrl} 
                    alt="Capture" 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform" 
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-[10px] text-gray-500 font-mono">
                      {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className="text-[10px] bg-blue-500/10 text-blue-400 px-1.5 py-0.5 rounded uppercase font-bold tracking-tighter">
                      {item.mood.split(' ')[0]}
                    </span>
                  </div>
                  <h3 className="text-xs font-bold text-gray-200 truncate">{item.memeTitle}</h3>
                  <p className="text-[10px] text-gray-400 line-clamp-2 mt-1 italic">
                    "{item.memeCaption}"
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      
      <div className="p-4 border-t border-gray-800 text-[10px] text-gray-600 font-mono text-center">
        AUTO-SAVED TO BROWSER CACHE
      </div>
    </aside>
  );
};

export default Sidebar;
