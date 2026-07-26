import React, { useEffect, useRef, useState } from 'react';
import { AppMode } from '../types';
import { MonitorPlay } from 'lucide-react';

interface LiveDesktopProps {
  mode: AppMode;
  setMode: (mode: AppMode) => void;
  isHidden: boolean;
  setIsHidden: (hidden: boolean) => void;
}

const LiveDesktop: React.FC<LiveDesktopProps> = ({ mode, setMode, isHidden, setIsHidden }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isSharing, setIsSharing] = useState(false);

  useEffect(() => {
    const startScreenShare = async () => {
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setIsSharing(true);
        }
        stream.getVideoTracks()[0].onended = () => {
          setIsSharing(false);
        };
      } catch (err) {
        console.error("Failed to share screen", err);
        setIsSharing(false);
      }
    };
    startScreenShare();
  }, []);

  return (
    <div className="absolute inset-0 w-full h-full bg-black flex flex-col overflow-hidden">
      
      {/* Minimal Top Bar */}
      <div className="absolute top-0 left-0 right-0 h-10 bg-black/50 backdrop-blur-md z-40 flex items-center justify-between px-6 pointer-events-none border-b border-panel-border">
        <div className="flex items-center gap-6 pointer-events-auto">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold tracking-tight text-white">Desk-AI</span>
          </div>
          <div className="flex items-center gap-4 text-xs font-medium">
            <div className="flex items-center gap-1.5 text-gray-300">
              <div className={`w-2 h-2 rounded-full ${isSharing ? 'bg-lime shadow-[0_0_8px_rgba(180,255,0,0.8)]' : 'bg-gray-600'}`}></div>
              {isSharing ? 'Screen Shared' : 'Screen Paused'}
            </div>
            <div className="flex items-center gap-1.5 text-gray-300">
              <div className="w-2 h-2 rounded-full bg-lime shadow-[0_0_8px_rgba(180,255,0,0.8)]"></div>
              Mic Active
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 pointer-events-auto">
          <span className="text-xs text-lime font-semibold bg-lime/10 px-2.5 py-1 rounded-md border border-lime/20">
            {mode === AppMode.DESKTOP ? 'Idle' : mode.replace('_', ' ')}
          </span>
        </div>
      </div>

      {/* Live Desktop Video Background */}
      <div className="flex-1 w-full h-full relative">
        {!isSharing && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500 z-10 bg-black">
            <MonitorPlay size={48} className="mb-4 opacity-20" />
            <p className="text-lg font-medium text-gray-400">Desk-AI is ready.</p>
            <p className="text-sm mt-2">Share your screen to begin the session.</p>
            <button 
              onClick={() => {
                navigator.mediaDevices.getDisplayMedia({ video: true }).then(stream => {
                  if (videoRef.current) videoRef.current.srcObject = stream;
                  setIsSharing(true);
                }).catch(console.error);
              }}
              className="mt-6 px-6 py-3 bg-lime text-black hover:bg-[#9ee600] rounded-xl text-sm font-bold transition-all shadow-[0_0_15px_rgba(180,255,0,0.3)]"
            >
              Share Screen
            </button>
          </div>
        )}
        <video ref={videoRef} autoPlay muted className="w-full h-full object-contain pointer-events-none" />
      </div>

      {/* Eburon Pro Bottom Bar */}
      <div className={`absolute bottom-0 left-0 w-full h-[90px] flex justify-center items-end z-40 overflow-hidden transition-transform duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] pointer-events-none ${isHidden ? 'translate-y-full' : 'translate-y-0'}`}>
        
        <div className="wing left-wing pointer-events-auto"></div>
        
        <div className="center-console pointer-events-auto">
          
          {/* Power */}
          <button className="nav-item" onClick={() => setIsHidden(true)}>
            <div className="icon-wrapper">
              <svg viewBox="0 0 24 24"><path d="M18.36 6.64a9 9 0 1 1-12.73 0M12 2v10"></path></svg>
              <svg className="chevron" viewBox="0 0 24 24"><polyline points="18 15 12 9 6 15"></polyline></svg>
            </div>
            <span>Power</span>
          </button>

          {/* Talk to me */}
          <button className="nav-item" onClick={() => setMode(mode === AppMode.TUTOR ? AppMode.DESKTOP : AppMode.TUTOR)}>
            <div className="icon-wrapper">
              <svg viewBox="0 0 24 24" style={{ stroke: mode === AppMode.TUTOR ? '#B4FF00' : 'currentColor' }}>
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                <line x1="12" y1="19" x2="12" y2="23"></line>
              </svg>
              <svg className="chevron" viewBox="0 0 24 24"><polyline points="18 15 12 9 6 15"></polyline></svg>
            </div>
            <span style={{ color: mode === AppMode.TUTOR ? '#B4FF00' : 'inherit' }}>Talk to me</span>
          </button>

          {/* Transcribe */}
          <button className="nav-item" onClick={() => setMode(mode === AppMode.COPILOT_EXPANDED ? AppMode.DESKTOP : AppMode.COPILOT_EXPANDED)}>
            <div className="icon-wrapper">
              <svg viewBox="0 0 24 24" style={{ stroke: (mode === AppMode.COPILOT_EXPANDED || mode === AppMode.COPILOT_COMPACT) ? '#B4FF00' : 'currentColor' }}>
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
              </svg>
              <span className="badge">1</span>
              <svg className="chevron" viewBox="0 0 24 24"><polyline points="18 15 12 9 6 15"></polyline></svg>
            </div>
            <span style={{ color: (mode === AppMode.COPILOT_EXPANDED || mode === AppMode.COPILOT_COMPACT) ? '#B4FF00' : 'inherit' }}>Transcribe</span>
          </button>

          <div className="divider"></div>

          {/* Control PC */}
          <button className="nav-item btn-green-box" onClick={() => setMode(mode === AppMode.AUTONOMOUS ? AppMode.DESKTOP : AppMode.AUTONOMOUS)}>
            <div className="icon-wrapper">
              <svg viewBox="0 0 24 24"><rect x="5" y="2" width="14" height="20" rx="4"></rect><path d="M12 6v4"></path></svg>
              <svg className="chevron" viewBox="0 0 24 24"><polyline points="18 15 12 9 6 15"></polyline></svg>
            </div>
            <span style={{ color: mode === AppMode.AUTONOMOUS ? '#B4FF00' : 'inherit' }}>Control PC</span>
          </button>

          <div className="divider"></div>

          {/* Translate */}
          <button className="nav-item">
            <div className="icon-wrapper">
              <svg viewBox="0 0 24 24">
                <path d="M5 8a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H7l-4 4V8z"></path>
                <text x="8" y="15" fill="currentColor" stroke="none" fontSize="10" fontWeight="700">A/文</text>
              </svg>
              <svg className="chevron" viewBox="0 0 24 24"><polyline points="18 15 12 9 6 15"></polyline></svg>
            </div>
            <span>Translate</span>
          </button>

          {/* Settings */}
          <button className="nav-item">
            <div className="icon-wrapper">
              <svg viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
              </svg>
              <svg className="chevron" viewBox="0 0 24 24"><polyline points="18 15 12 9 6 15"></polyline></svg>
            </div>
            <span>Settings</span>
          </button>

          {/* More */}
          <button className="nav-item">
            <div className="icon-wrapper">
              <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="2"></circle><circle cx="19" cy="12" r="2"></circle><circle cx="5" cy="12" r="2"></circle></svg>
            </div>
            <span>More</span>
          </button>

        </div>

        <div className="wing right-wing pointer-events-auto"></div>

      </div>

    </div>
  );
};

export default LiveDesktop;
