import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AppMode, TranscriptLine, SpeakerRole, SuggestedAnswer, AnticipatedQuestion } from './types';
import LiveDesktop from './components/LiveDesktop';
import FloatingWidget from './components/FloatingWidget';
import TutorMode from './components/TutorMode';
import AutonomousMode from './components/AutonomousMode';
import { generateCopilotSuggestions } from './services/geminiService';

// Mock data for demonstration purposes
const MOCK_CLIENT_QUESTIONS = [
  "Hi, thanks for taking the time. Can you explain how your platform connects to our existing CRM?",
  "Okay, that makes sense. Does it also work on mobile devices?",
  "What about security? How is our data protected?",
  "How long does a typical integration take?"
];

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>(AppMode.DESKTOP);
  const [isHidden, setIsHidden] = useState(false);
  
  // Copilot State
  const [transcript, setTranscript] = useState<TranscriptLine[]>([]);
  const [suggestion, setSuggestion] = useState<SuggestedAnswer | null>(null);
  const [anticipatedQuestions, setAnticipatedQuestions] = useState<AnticipatedQuestion[]>([]);
  const [isListening, setIsListening] = useState(false);
  
  // Simulation state
  const [mockQuestionIndex, setMockQuestionIndex] = useState(0);
  const transcriptRef = useRef(transcript);

  // Keep ref in sync for callbacks
  useEffect(() => {
    transcriptRef.current = transcript;
  }, [transcript]);

  // Handle generating suggestions when transcript updates
  const updateSuggestions = useCallback(async () => {
    const currentTranscript = transcriptRef.current;
    if (currentTranscript.length === 0) return;

    const { answer, questions } = await generateCopilotSuggestions(currentTranscript);
    if (answer) setSuggestion(answer);
    if (questions) setAnticipatedQuestions(questions);
  }, []);

  // Trigger suggestion update when a new client message arrives
  useEffect(() => {
    const lastMsg = transcript[transcript.length - 1];
    if (lastMsg && lastMsg.role === SpeakerRole.CLIENT) {
      updateSuggestions();
    }
  }, [transcript, updateSuggestions]);

  // Simulation: Add mock client question
  const simulateClientSpeech = useCallback(() => {
    if (mockQuestionIndex < MOCK_CLIENT_QUESTIONS.length) {
      const text = MOCK_CLIENT_QUESTIONS[mockQuestionIndex];
      const newLine: TranscriptLine = {
        id: Date.now().toString(),
        role: SpeakerRole.CLIENT,
        text: text,
        timestamp: Date.now(),
        isFinal: true
      };
      setTranscript(prev => [...prev, newLine]);
      setMockQuestionIndex(prev => prev + 1);
    }
  }, [mockQuestionIndex]);

  // Simulation: Add mock user response
  const simulateUserSpeech = useCallback(() => {
    if (suggestion) {
      const newLine: TranscriptLine = {
        id: Date.now().toString(),
        role: SpeakerRole.USER,
        text: suggestion.short,
        timestamp: Date.now(),
        isFinal: true
      };
      setTranscript(prev => [...prev, newLine]);
      setSuggestion(null); // Clear suggestion after user speaks it
    }
  }, [suggestion]);

  const toggleListening = () => {
    setIsListening(!isListening);
  };

  return (
    <div className="w-full h-screen relative overflow-hidden bg-black font-sans text-white">
      
      {/* Base Layer: Live Desktop View */}
      <LiveDesktop 
        mode={mode} 
        setMode={setMode} 
        isHidden={isHidden} 
        setIsHidden={setIsHidden} 
      />

      {/* Overlay Layers based on Mode */}
      {!isHidden && (mode === AppMode.COPILOT_COMPACT || mode === AppMode.COPILOT_EXPANDED) && (
        <FloatingWidget 
          mode={mode} 
          setMode={setMode}
          transcript={transcript}
          suggestion={suggestion}
          anticipatedQuestions={anticipatedQuestions}
          isListening={isListening}
          toggleListening={toggleListening}
        />
      )}

      {!isHidden && mode === AppMode.TUTOR && (
        <TutorMode setMode={setMode} />
      )}

      {!isHidden && mode === AppMode.AUTONOMOUS && (
        <AutonomousMode setMode={setMode} />
      )}

      {/* Floating Hide/Show Button */}
      <button 
        onClick={() => setIsHidden(!isHidden)}
        className="absolute bottom-[100px] right-[30px] bg-[#111] border border-white/10 text-lime text-[13px] font-semibold px-[18px] py-[10px] rounded-[30px] flex items-center gap-2 cursor-pointer shadow-[0_10px_25px_rgba(0,0,0,0.8)] z-50 transition-colors hover:bg-[#1A1A1A]"
      >
        <span>{isHidden ? 'Show AI' : 'Hide AI'}</span>
        {isHidden ? (
          <svg width="14" height="14" viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth="2.5"><polyline points="6 15 12 9 18 15"></polyline></svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth="2.5"><polyline points="18 15 12 9 6 15"></polyline></svg>
        )}
      </button>

      {/* Developer Simulation Controls (Visible only in Copilot mode for demo) */}
      {!isHidden && (mode === AppMode.COPILOT_COMPACT || mode === AppMode.COPILOT_EXPANDED) && (
        <div className="fixed bottom-32 left-8 bg-panel-bg border border-panel-border p-4 rounded-2xl shadow-2xl z-50 flex flex-col gap-2 w-64">
          <div className="text-[10px] text-gray-500 font-bold mb-1 uppercase tracking-wider">Demo Controls</div>
          <button 
            onClick={simulateClientSpeech}
            disabled={mockQuestionIndex >= MOCK_CLIENT_QUESTIONS.length}
            className="px-3 py-2 bg-lime/10 hover:bg-lime/20 text-lime text-xs rounded-xl border border-lime/20 disabled:opacity-50 transition-colors text-left font-medium"
          >
            Simulate Client Question
          </button>
          <button 
            onClick={simulateUserSpeech}
            disabled={!suggestion}
            className="px-3 py-2 bg-[#1A1A1D] hover:bg-[#2C2C2E] text-gray-300 text-xs rounded-xl border border-[#2C2C2E] disabled:opacity-50 transition-colors text-left font-medium"
          >
            Simulate User Answer
          </button>
          <button 
            onClick={() => { setTranscript([]); setSuggestion(null); setAnticipatedQuestions([]); setMockQuestionIndex(0); }}
            className="px-3 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs rounded-xl border border-red-500/20 transition-colors mt-1 text-left font-medium"
          >
            Reset Session
          </button>
        </div>
      )}

    </div>
  );
};

export default App;
