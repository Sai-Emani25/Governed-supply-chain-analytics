import React, { useState, useEffect } from 'react';
import { Header, ActiveTab } from './components/Header';
import { ConversationalStudio } from './components/ConversationalStudio';
import { PersonaConsistencyMatrix } from './components/PersonaConsistencyMatrix';
import { OntologyCatalog } from './components/OntologyCatalog';
import { RawVsGovernedLab } from './components/RawVsGovernedLab';
import { AIStudioBlueprint } from './components/AIStudioBlueprint';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('chat');
  const [hasGeminiKey, setHasGeminiKey] = useState<boolean>(false);
  const [modelName, setModelName] = useState<string>('gemini-3.8-flash');

  useEffect(() => {
    fetch('/api/status')
      .then((res) => res.json())
      .then((data) => {
        if (data.hasGeminiKey) setHasGeminiKey(true);
        if (data.model) setModelName(data.model);
      })
      .catch((err) => {
        console.warn('Status endpoint unavailable, running in client preview mode:', err);
      });
  }, []);

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Universal Header with Navigation Tabs */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        hasGeminiKey={hasGeminiKey}
        modelName={modelName}
      />

      {/* Main Content Workspace */}
      <main className="flex-1 pb-16">
        {activeTab === 'chat' && <ConversationalStudio />}
        {activeTab === 'personas' && <PersonaConsistencyMatrix />}
        {activeTab === 'ontology' && <OntologyCatalog />}
        {activeTab === 'raw-vs-governed' && <RawVsGovernedLab />}
        {activeTab === 'blueprint' && <AIStudioBlueprint />}
      </main>

      {/* Quiet Footer adhering strictly to Frontend Design Constitution */}
      <footer className="border-t border-slate-200 bg-white py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800">Governed Supply Chain Analytics</span>
            <span aria-hidden="true">·</span>
            <span>Google AI Studio Reference Blueprint</span>
          </div>

          <div className="flex items-center gap-3 text-slate-500">
            <span>Semantic Function Calling</span>
            <span aria-hidden="true">·</span>
            <span>BigQuery Materialized Views</span>
            <span aria-hidden="true">·</span>
            <span>Strict Tool Isolation</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
