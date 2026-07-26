import React from 'react';
import { AppMode } from '../types';
import { 
  LayoutDashboard, 
  MessageSquare, 
  Mic, 
  MonitorPlay, 
  Settings, 
  BookOpen, 
  History,
  Play
} from 'lucide-react';

interface DashboardProps {
  setMode: (mode: AppMode) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ setMode }) => {
  return (
    <div className="flex h-full w-full bg-gray-950 text-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col">
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white">
            D
          </div>
          <span className="text-xl font-semibold tracking-tight">Desk-AI</span>
        </div>
        
        <nav className="flex-1 px-4 space-y-1">
          <NavItem icon={<LayoutDashboard size={18} />} label="Home" active />
          <NavItem icon={<MessageSquare size={18} />} label="Live Assistant" onClick={() => setMode(AppMode.COPILOT_EXPANDED)} />
          <NavItem icon={<Mic size={18} />} label="Tutor Mode" onClick={() => setMode(AppMode.TUTOR)} />
          <NavItem icon={<MonitorPlay size={18} />} label="Autonomous Tasks" onClick={() => setMode(AppMode.AUTONOMOUS)} />
          <div className="my-4 border-t border-gray-800"></div>
          <NavItem icon={<BookOpen size={18} />} label="Knowledge Base" />
          <NavItem icon={<History size={18} />} label="History" />
          <NavItem icon={<Settings size={18} />} label="Settings" />
        </nav>
        
        <div className="p-4 border-t border-gray-800 text-xs text-gray-500">
          Desk-AI Enterprise v1.0
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 border-b border-gray-800 flex items-center px-8 justify-between">
          <h1 className="text-xl font-medium">Good morning, Alex.</h1>
          <div className="flex items-center gap-4">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span className="text-sm text-gray-400">System Online</span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-4xl mx-auto space-y-8">
            
            <section>
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <ActionCard 
                  title="Start Client Copilot" 
                  description="Real-time transcription and suggested answers."
                  icon={<MessageSquare className="text-blue-400" />}
                  onClick={() => setMode(AppMode.COPILOT_COMPACT)}
                  color="bg-blue-900/20 border-blue-800/50 hover:border-blue-500/50"
                />
                <ActionCard 
                  title="Talk to Desk-AI" 
                  description="Interactive voice tutor for technical guidance."
                  icon={<Mic className="text-purple-400" />}
                  onClick={() => setMode(AppMode.TUTOR)}
                  color="bg-purple-900/20 border-purple-800/50 hover:border-purple-500/50"
                />
                <ActionCard 
                  title="Guide My Screen" 
                  description="Visual highlights and autonomous execution."
                  icon={<MonitorPlay className="text-emerald-400" />}
                  onClick={() => setMode(AppMode.AUTONOMOUS)}
                  color="bg-emerald-900/20 border-emerald-800/50 hover:border-emerald-500/50"
                />
              </div>
            </section>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <section>
                <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Recent Sessions</h2>
                <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                  <SessionRow title="Acme Corp Q3 Review" time="10:30 AM today" type="Meeting" />
                  <SessionRow title="AWS Deployment Issue" time="Yesterday" type="Support" />
                  <SessionRow title="New Hire Onboarding" time="Monday" type="Training" />
                </div>
              </section>

              <section>
                <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Active Knowledge Sources</h2>
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 space-y-3">
                  <SourceItem name="Company Docs (Confluence)" status="Synced 1h ago" />
                  <SourceItem name="Public Website" status="Live" />
                  <SourceItem name="Salesforce CRM" status="Connected" />
                  <SourceItem name="Product Manual v2.pdf" status="Indexed" />
                </div>
              </section>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
};

const NavItem = ({ icon, label, active = false, onClick }: any) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
      active ? 'bg-gray-800 text-white' : 'text-gray-400 hover:bg-gray-800/50 hover:text-gray-200'
    }`}
  >
    {icon}
    {label}
  </button>
);

const ActionCard = ({ title, description, icon, onClick, color }: any) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-start p-5 rounded-xl border transition-all text-left ${color}`}
  >
    <div className="p-2 bg-gray-950 rounded-lg mb-4 shadow-sm">
      {icon}
    </div>
    <h3 className="font-medium text-gray-100 mb-1">{title}</h3>
    <p className="text-sm text-gray-400">{description}</p>
  </button>
);

const SessionRow = ({ title, time, type }: any) => (
  <div className="flex items-center justify-between p-4 border-b border-gray-800 last:border-0 hover:bg-gray-800/30 cursor-pointer transition-colors">
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center">
        <Play size={14} className="text-gray-400 ml-0.5" />
      </div>
      <div>
        <p className="text-sm font-medium text-gray-200">{title}</p>
        <p className="text-xs text-gray-500">{time}</p>
      </div>
    </div>
    <span className="text-xs px-2 py-1 rounded-md bg-gray-800 text-gray-400">{type}</span>
  </div>
);

const SourceItem = ({ name, status }: any) => (
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-2">
      <BookOpen size={14} className="text-gray-500" />
      <span className="text-sm text-gray-300">{name}</span>
    </div>
    <span className="text-xs text-green-500/80">{status}</span>
  </div>
);

export default Dashboard;
