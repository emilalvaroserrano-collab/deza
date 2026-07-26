import React, { useState, useRef, useEffect } from 'react';
import { AppMode, TranscriptLine, SuggestedAnswer, AnticipatedQuestion, SpeakerRole } from '../types';

interface FloatingWidgetProps {
  mode: AppMode;
  setMode: (mode: AppMode) => void;
  transcript: TranscriptLine[];
  suggestion: SuggestedAnswer | null;
  anticipatedQuestions: AnticipatedQuestion[];
  isListening: boolean;
  toggleListening: () => void;
}

const FloatingWidget: React.FC<FloatingWidgetProps> = ({
  mode,
  setMode,
  transcript,
  suggestion,
  isListening
}) => {
  const isExpanded = mode === AppMode.COPILOT_EXPANDED;

  const toggleExpand = () => {
    setMode(isExpanded ? AppMode.COPILOT_COMPACT : AppMode.COPILOT_EXPANDED);
  };

  const latestClientLine = [...transcript].reverse().find(t => t.role === SpeakerRole.CLIENT);

  return (
    <div 
      className={`absolute top-5 left-1/2 -translate-x-1/2 bg-panel-bg border border-panel-border rounded-2xl flex flex-col shadow-[0_15px_35px_rgba(0,0,0,0.6)] z-50 transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden ${
        isExpanded ? 'w-[850px] max-w-[95%]' : 'w-[280px]'
      }`}
    >
      {/* Main Pill Area */}
      <div className="h-[68px] flex items-center px-4">
        <div className="w-[44px] h-[44px] bg-black rounded-xl border border-white/15 flex items-center justify-center text-lime font-extrabold text-lg relative shrink-0">
          AI
          <span className="absolute top-1.5 right-1.5 text-[10px]">✦</span>
        </div>
        
        <div className={`flex-1 flex flex-col justify-center ml-5 overflow-hidden whitespace-nowrap transition-opacity duration-300 ${isExpanded ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <div className="text-lime text-xs font-semibold flex items-center gap-1.5 mb-1">
            AI Suggested Response
            <svg width="12" height="12" viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth="2.5"><polyline points="18 15 12 9 6 15"></polyline></svg>
          </div>
          <div className="text-[15px] font-normal text-white truncate">
            {suggestion ? suggestion.short : "Listening to conversation..."}
          </div>
        </div>

        <button 
          onClick={toggleExpand}
          className="bg-transparent border-none text-lime flex items-center gap-1.5 text-xs font-semibold cursor-pointer px-3 transition-opacity hover:opacity-80 shrink-0 ml-2.5"
        >
          <span>{isExpanded ? 'Collapse' : 'Expand'}</span>
          {isExpanded ? (
            <svg width="14" height="14" viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth="2.5"><polyline points="6 15 12 9 18 15"></polyline></svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"></polyline></svg>
          )}
        </button>
      </div>

      {/* Expanded Content Area */}
      <div className={`transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] ${isExpanded ? 'max-h-[300px] opacity-100 border-t border-panel-border' : 'max-h-0 opacity-0'}`}>
        <div className="p-5 flex flex-col gap-4 bg-[#0A0A0A]">
          
          {/* Detailed Suggestion */}
          {suggestion && suggestion.detailed && (
            <div>
              <div className="text-[10px] font-bold text-lime uppercase tracking-wider mb-2">Detailed Explanation</div>
              <p className="text-sm text-gray-300 leading-relaxed">
                {suggestion.detailed}
              </p>
            </div>
          )}

          {/* Real-Time Transcript Strip */}
          <div className="pt-3 border-t border-[#1A1A1D]">
            <div className="text-[10px] text-gray-500 font-bold mb-1 uppercase tracking-wider">Client Transcript</div>
            <div className="text-sm text-gray-400 italic line-clamp-2 leading-relaxed">
              {latestClientLine ? `"${latestClientLine.text}"` : "Waiting for client..."}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default FloatingWidget;
