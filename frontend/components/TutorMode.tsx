import React, { useEffect, useState, useCallback } from 'react';
import { AppMode } from '../types';
import { liveAudioService } from '../services/liveAudioService';
import { Mic, X } from 'lucide-react';

interface TutorModeProps {
  setMode: (mode: AppMode) => void;
}

const TutorMode: React.FC<TutorModeProps> = ({ setMode }) => {
  const [status, setStatus] = useState<'idle' | 'listening' | 'speaking' | 'error'>('idle');
  const [transcript, setTranscript] = useState<{text: string, isUser: boolean}[]>([]);

  const handleTranscriptUpdate = useCallback((text: string, isUser: boolean) => {
    setTranscript(prev => [...prev, { text, isUser }]);
  }, []);

  const handleStateChange = useCallback((newState: 'idle' | 'listening' | 'speaking' | 'error') => {
    setStatus(newState);
  }, []);

  useEffect(() => {
    liveAudioService.onTranscriptUpdate = handleTranscriptUpdate;
    liveAudioService.onStateChange = handleStateChange;
    
    liveAudioService.startSession();

    return () => {
      liveAudioService.stopSession();
    };
  }, [handleTranscriptUpdate, handleStateChange]);

  const latestUser = transcript.filter(t => t.isUser).pop();
  const latestAI = transcript.filter(t => !t.isUser).pop();

  const toggleSession = () => {
    if (status === 'idle' || status === 'error') {
      liveAudioService.startSession();
    } else {
      liveAudioService.stopSession();
    }
  };

  return (
    <div className="fixed bottom-32 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-6 pointer-events-none">
      
      {/* Transcript Bubbles */}
      <div className="flex flex-col items-center gap-3 w-full max-w-xl">
        {latestUser && (
          <div className="bg-panel-bg px-5 py-2.5 rounded-2xl border border-panel-border text-sm text-gray-300 pointer-events-auto shadow-lg text-center">
            "{latestUser.text}"
          </div>
        )}
        {latestAI && (
          <div className="bg-lime/10 px-6 py-3.5 rounded-2xl border border-lime/30 text-base text-lime pointer-events-auto shadow-xl text-center font-medium">
            {latestAI.text}
          </div>
        )}
      </div>

      {/* Animated Orb */}
      <div className="relative pointer-events-auto flex flex-col items-center gap-3 mt-2">
        <div className="text-[10px] font-bold uppercase tracking-wider text-lime bg-lime/10 px-3 py-1 rounded-full border border-lime/20">
          {status === 'listening' ? 'Listening...' : status === 'speaking' ? 'Speaking...' : 'Ready'}
        </div>
        
        <button 
          onClick={toggleSession}
          className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-500 ${
            status === 'listening' 
              ? 'bg-lime text-black animate-pulse shadow-[0_0_40px_rgba(180,255,0,0.6)] scale-110' 
              : status === 'speaking'
              ? 'bg-white text-black shadow-[0_0_40px_rgba(255,255,255,0.6)] scale-105'
              : 'bg-panel-bg border border-panel-border text-white hover:bg-[#1A1A1D]'
          }`}
        >
          <Mic size={24} />
        </button>

        <button 
          onClick={() => setMode(AppMode.DESKTOP)}
          className="absolute -right-14 top-1/2 -translate-y-1/2 p-2.5 bg-panel-bg border border-panel-border rounded-full text-gray-400 hover:text-white hover:bg-red-500/20 hover:border-red-500/50 transition-all shadow-lg"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

export default TutorMode;
