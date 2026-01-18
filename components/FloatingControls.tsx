
import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';

interface FloatingControlsProps {
  status: string;
  recordingTime: number;
  onStop: () => void;
  onPause: () => void;
  onResume: () => void;
}

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

// Simple Icon Components for Floating Controls
const IconStop = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="none"><rect x="3" y="3" width="18" height="18" rx="2"/></svg>);
const IconPause = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="none"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>);
const IconPlay = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="5 3 19 12 5 21 5 3"/></svg>);
const IconPopOut = () => (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 3 21 3 21 8"/><line x1="10" x2="21" y1="14" y2="3"/></svg>);
const IconPopIn = () => (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h6v6"/><line x1="10" x2="21" y1="14" y2="3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></svg>);
const IconGrip = () => (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="12" r="1"/><circle cx="9" cy="5" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="19" r="1"/></svg>);

export const FloatingControls: React.FC<FloatingControlsProps> = ({ 
  status, 
  recordingTime, 
  onStop, 
  onPause, 
  onResume 
}) => {
  const [pipWindow, setPipWindow] = useState<Window | null>(null);
  const [isPipSupported, setIsPipSupported] = useState(false);
  
  const [position, setPosition] = useState<{x: number, y: number} | null>(null);
  const isDragging = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // @ts-ignore
    const isApiSupported = !!window.documentPictureInPicture;
    const isTopLevel = window.self === window.top;
    if (isApiSupported && isTopLevel) setIsPipSupported(true);
    
    setPosition({
        x: window.innerWidth - 380,
        y: window.innerHeight - 100
    });
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (pipWindow) return;
    if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        dragOffset.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
        isDragging.current = true;
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
        if (isDragging.current) {
            e.preventDefault();
            setPosition({ x: e.clientX - dragOffset.current.x, y: e.clientY - dragOffset.current.y });
        }
    };
    const handleMouseUp = () => { isDragging.current = false; };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  const togglePip = async () => {
    if (pipWindow) {
      pipWindow.close();
      setPipWindow(null);
    } else {
      try {
        // @ts-ignore
        const win = await window.documentPictureInPicture.requestWindow({ width: 340, height: 80 });
        // Copy basic styles
        [...document.styleSheets].forEach((styleSheet) => {
            try {
              if (styleSheet.href) {
                const link = document.createElement('link');
                link.rel = 'stylesheet';
                link.href = styleSheet.href;
                win.document.head.appendChild(link);
              }
            } catch (e) {}
        });
        
        // Tailwind injection for PiP
        const script = document.createElement('script');
        script.src = "https://cdn.tailwindcss.com";
        win.document.head.appendChild(script);

        win.document.body.className = "bg-zinc-950 flex items-center justify-center m-0 h-full overflow-hidden";
        win.addEventListener('pagehide', () => setPipWindow(null));
        setPipWindow(win);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const isPaused = status === 'PAUSED';

  const Content = (
    <div 
        ref={containerRef}
        className={`flex items-center gap-4 px-3 py-2 bg-zinc-900/90 border border-white/10 backdrop-blur-md shadow-2xl select-none group
        ${pipWindow ? 'w-full h-full justify-center border-none' : 'rounded-full animate-in fade-in zoom-in-95 cursor-grab active:cursor-grabbing ring-1 ring-black/50'}`}
    >
       {!pipWindow && (
           <div onMouseDown={handleMouseDown} className="text-zinc-600 group-hover:text-zinc-400 transition-colors">
               <IconGrip />
           </div>
       )}

       <div className="flex items-center gap-2 min-w-[70px]">
          <div className={`w-2 h-2 rounded-full shadow-[0_0_8px_currentColor] ${isPaused ? 'bg-amber-500 text-amber-500' : 'bg-red-500 text-red-500 animate-pulse'}`}></div>
          <span className="font-mono text-lg font-bold text-zinc-100 tabular-nums">{formatTime(recordingTime)}</span>
       </div>

       <div className="h-6 w-px bg-white/10 mx-1"></div>

       <div className="flex items-center gap-2">
         <button 
            onClick={isPaused ? onResume : onPause} 
            className="p-2 rounded-full bg-zinc-800 text-zinc-200 hover:bg-zinc-700 hover:text-white transition-all border border-white/5 active:scale-95" 
            title={isPaused ? "Resume" : "Pause"}
         >
            {isPaused ? <IconPlay /> : <IconPause />}
         </button>

         <button 
            onClick={onStop} 
            className="p-2 rounded-full bg-red-600 text-white hover:bg-red-500 transition-all shadow-lg shadow-red-900/20 active:scale-95" 
            title="Stop"
         >
            <IconStop />
         </button>
       </div>

       {isPipSupported && (
           <button 
             onClick={togglePip} 
             className="ml-2 p-1.5 rounded-md text-zinc-500 hover:text-zinc-200 hover:bg-white/5 transition-colors"
           >
             {pipWindow ? <IconPopIn /> : <IconPopOut />}
           </button>
       )}
    </div>
  );

  if (pipWindow) return createPortal(Content, pipWindow.document.body);

  return (
    <div className="fixed z-[100]" style={position ? { left: position.x, top: position.y } : { opacity: 0 }}>
      {Content}
    </div>
  );
};
