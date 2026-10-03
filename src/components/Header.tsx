import React from 'react';
import { Database, ShieldCheck, Terminal, Layers, Users, Cpu, FileCode2 } from 'lucide-react';

export type ActiveTab = 'chat' | 'personas' | 'ontology' | 'blueprint' | 'raw-vs-governed';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  hasGeminiKey: boolean;
  modelName: string;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  hasGeminiKey,
  modelName
}) => {
  return (
    <header className="border-b border-slate-200 bg-white sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand & Governed Tagline */}
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-slate-900 text-white flex items-center justify-center shadow-xs">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-900 text-base tracking-tight">
                  Governed Supply Chain Analytics
                </span>
                <span className="text-xs font-mono text-slate-500 hidden sm:inline">
                  v2.4 · Google AI Studio Architecture
                </span>
              </div>
              <div className="text-xs text-slate-500 hidden md:flex items-center gap-2">
                <span>Enterprise Semantic Layer</span>
                <span aria-hidden="true">·</span>
                <span>Strict Tool Isolation</span>
                <span aria-hidden="true">·</span>
                <span>Zero SQL Hallucination</span>
              </div>
            </div>
          </div>

          {/* Model & Runtime Status */}
          <div className="hidden lg:flex items-center space-x-3 text-xs text-slate-600">
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-md">
              <Cpu className="w-3.5 h-3.5 text-slate-700" />
              <span>Model: <strong className="font-medium text-slate-900">{modelName}</strong></span>
              <span aria-hidden="true" className="text-slate-300">|</span>
              <span>Temp: <strong className="font-medium text-slate-900">0.2</strong></span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-200 rounded-md text-emerald-800">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>{hasGeminiKey ? 'Gemini Live Server' : 'Semantic Engine Active'}</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 sm:space-x-2 border-t border-slate-100 overflow-x-auto py-1 scrollbar-none">
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex items-center gap-2 px-3 py-2 text-xs sm:text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
              activeTab === 'chat'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Terminal className="w-4 h-4" />
            <span>Conversational Studio</span>
          </button>

          <button
            onClick={() => setActiveTab('personas')}
            className={`flex items-center gap-2 px-3 py-2 text-xs sm:text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
              activeTab === 'personas'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Persona Consistency Matrix</span>
          </button>

          <button
            onClick={() => setActiveTab('ontology')}
            className={`flex items-center gap-2 px-3 py-2 text-xs sm:text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
              activeTab === 'ontology'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Supply Chain Ontology</span>
          </button>

          <button
            onClick={() => setActiveTab('raw-vs-governed')}
            className={`flex items-center gap-2 px-3 py-2 text-xs sm:text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
              activeTab === 'raw-vs-governed'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Raw SQL vs. Governed Lab</span>
          </button>

          <button
            onClick={() => setActiveTab('blueprint')}
            className={`flex items-center gap-2 px-3 py-2 text-xs sm:text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
              activeTab === 'blueprint'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <FileCode2 className="w-4 h-4" />
            <span>AI Studio Architecture Blueprint</span>
          </button>
        </div>
      </div>
    </header>
  );
};
