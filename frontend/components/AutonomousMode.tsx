import React, { useState } from 'react';
import { AppMode, AutonomousPlan } from '../types';
import { X, CheckCircle2, Circle, AlertTriangle, Terminal } from 'lucide-react';

interface AutonomousModeProps {
  setMode: (mode: AppMode) => void;
}

const mockPlan: AutonomousPlan = {
  goal: "Create a meeting summary and email it to the client.",
  steps: [
    { id: '1', description: 'Read the meeting transcript', status: 'completed' },
    { id: '2', description: 'Generate the summary', status: 'completed' },
    { id: '3', description: 'Open Gmail', status: 'active' },
    { id: '4', description: 'Create a draft', status: 'pending' },
    { id: '5', description: 'Ask for approval before sending', status: 'pending' },
  ]
};

const AutonomousMode: React.FC<AutonomousModeProps> = ({ setMode }) => {
  const [plan] = useState<AutonomousPlan>(mockPlan);
  const [isExecuting, setIsExecuting] = useState(false);

  const handleStart = () => {
    setIsExecuting(true);
  };

  return (
    <div className="fixed top-24 right-8 z-50 w-80 bg-panel-bg border border-panel-border rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col">
      
      {/* Header */}
      <div className="h-11 border-b border-[#2C2C2E] bg-[#1C1C1E] flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Terminal className="text-lime" size={16} />
          <h2 className="text-sm font-semibold text-white">Autopilot Task</h2>
        </div>
        <button onClick={() => setMode(AppMode.DESKTOP)} className="text-gray-400 hover:text-white transition-colors p-1 rounded hover:bg-white/10">
          <X size={16} />
        </button>
      </div>

      {/* Content */}
      <div className="p-5 space-y-5 bg-[#0A0A0A]">
        <p className="text-sm text-gray-100 font-medium leading-snug">{plan.goal}</p>
        
        <div className="space-y-3.5">
          {plan.steps.map((step) => (
            <div key={step.id} className="flex items-start gap-3">
              <div className="mt-0.5 shrink-0">
                {step.status === 'completed' && <CheckCircle2 size={14} className="text-lime" />}
                {step.status === 'active' && <div className="w-3.5 h-3.5 rounded-full border-2 border-lime border-t-transparent animate-spin"></div>}
                {step.status === 'pending' && <Circle size={14} className="text-gray-600" />}
                {step.status === 'failed' && <AlertTriangle size={14} className="text-red-500" />}
              </div>
              <div className={`text-xs leading-relaxed ${
                step.status === 'completed' ? 'text-gray-500 line-through' :
                step.status === 'active' ? 'text-lime font-medium' :
                'text-gray-400'
              }`}>
                {step.description}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="p-4 border-t border-[#2C2C2E] bg-[#1C1C1E] flex justify-between items-center">
        <button className="text-xs text-gray-400 hover:text-white font-medium px-2 py-1 rounded hover:bg-white/5 transition-colors">
          View Plan
        </button>
        <div className="flex gap-2">
          <button className="px-3 py-1.5 bg-[#2C2C2E] hover:bg-[#3A3A3C] text-white rounded-lg text-xs font-medium transition-colors border border-[#3A3A3C]">
            Pause
          </button>
          <button 
            onClick={handleStart} 
            disabled={isExecuting} 
            className="px-4 py-1.5 bg-lime hover:bg-[#9ee600] disabled:bg-lime/20 disabled:text-lime/50 text-black rounded-lg text-xs font-bold transition-colors shadow-[0_0_10px_rgba(180,255,0,0.2)]"
          >
            {isExecuting ? 'Running' : 'Start'}
          </button>
        </div>
      </div>

    </div>
  );
};

export default AutonomousMode;
