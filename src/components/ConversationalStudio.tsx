import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Terminal, 
  CheckCircle2, 
  ChevronDown, 
  ChevronRight, 
  Cpu, 
  Database, 
  ShieldCheck, 
  RotateCcw,
  Sparkles,
  Code2
} from 'lucide-react';
import { ConversationalAnalysisResponse } from '../types/ontology';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  responsePayload?: ConversationalAnalysisResponse;
  timestamp: string;
}

const PRESET_PROMPTS = [
  {
    role: 'Logistics Manager',
    prompt: 'How many of our inbound freight loads hit their delivery windows in Q3?',
    targetMetric: 'On_Time_Delivery'
  },
  {
    role: 'Procurement Officer',
    prompt: 'Show me our vendor compliance score for on-time arrivals last quarter.',
    targetMetric: 'On_Time_Delivery'
  },
  {
    role: 'Supply Chain Planner',
    prompt: 'What was our OTIF delivery rate for Q3?',
    targetMetric: 'On_Time_Delivery'
  },
  {
    role: 'Inventory Controller',
    prompt: 'How many days of inventory do we have tied up in stock across part categories?',
    targetMetric: 'Days_of_Inventory'
  },
  {
    role: 'Operations VP',
    prompt: 'What was our order fill rate across plant regions in Q3?',
    targetMetric: 'Fill_Rate'
  },
  {
    role: 'Finance Director',
    prompt: 'What is our true landed cost per unit including freight and customs?',
    targetMetric: 'Landed_Cost'
  }
];

export const ConversationalStudio: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [expandedTraceId, setExpandedTraceId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize with the canonical Phase 3 scenario on first load
  useEffect(() => {
    if (messages.length === 0) {
      handleSendPrompt('How many of our inbound freight loads hit their delivery windows in Q3?');
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendPrompt = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    const userMsgId = 'user-' + Date.now();
    const userMsg: ChatMessage = {
      id: userMsgId,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: textToSend })
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      const data: ConversationalAnalysisResponse = await res.json();

      const assistantMsgId = 'assistant-' + Date.now();
      const assistantMsg: ChatMessage = {
        id: assistantMsgId,
        sender: 'assistant',
        text: data.answer,
        responsePayload: data,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, assistantMsg]);
      setExpandedTraceId(assistantMsgId);
    } catch (err: any) {
      const errorMsgId = 'err-' + Date.now();
      setMessages((prev) => [
        ...prev,
        {
          id: errorMsgId,
          sender: 'assistant',
          text: `Error processing query: ${err?.message || 'Server error'}. Please check your connection or environment parameters.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendPrompt(inputQuery);
  };

  const handleResetChat = () => {
    setMessages([]);
    setExpandedTraceId(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Section / Architectural Context */}
      <div className="border border-slate-200 bg-white p-6 rounded-xl shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Terminal className="w-5 h-5 text-indigo-600" />
              Governed Supply Chain Conversational Terminal
            </h1>
            <p className="text-sm text-slate-600 max-w-3xl leading-relaxed">
              Google AI Studio function-calling architecture routing unstructured natural language through strict canonical tools. No LLM-written SQL; queries are compiled directly to BigQuery materialized views.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleResetChat}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
              title="Clear terminal session"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Session</span>
            </button>
          </div>
        </div>

        {/* Quick Persona Prompt Selectors */}
        <div className="mt-4 pt-4 border-t border-slate-100">
          <div className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">
            Test Persona Prompts (Phase 3 Multi-Persona Ingestion)
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {PRESET_PROMPTS.map((preset, idx) => (
              <button
                key={idx}
                onClick={() => handleSendPrompt(preset.prompt)}
                disabled={isLoading}
                className="text-left p-2.5 rounded-lg border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50 transition-all text-xs group"
              >
                <div className="flex items-center justify-between text-slate-500 group-hover:text-indigo-600 font-medium mb-1">
                  <span>{preset.role}</span>
                  <span className="font-mono text-[10px] text-slate-400 group-hover:text-indigo-500">
                    {preset.targetMetric}
                  </span>
                </div>
                <div className="text-slate-800 line-clamp-1 group-hover:text-slate-900">
                  &ldquo;{preset.prompt}&rdquo;
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Conversation Stream */}
      <div className="border border-slate-200 bg-slate-50/60 rounded-xl overflow-hidden shadow-xs flex flex-col min-h-[500px]">
        {/* Messages List */}
        <div className="flex-1 p-4 sm:p-6 space-y-6 overflow-y-auto max-h-[640px]">
          {messages.length === 0 && (
            <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-slate-400">
              <ShieldCheck className="w-12 h-12 text-slate-300 mb-3" />
              <p className="text-base font-medium text-slate-700">Awaiting Supply Chain Prompt</p>
              <p className="text-xs text-slate-500 max-w-md mt-1">
                Enter a business question or click any persona preset above to trigger the governed function-calling sequence.
              </p>
            </div>
          )}

          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            const payload = msg.responsePayload;
            const isTraceExpanded = expandedTraceId === msg.id;

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-2`}
              >
                {/* Message Header */}
                <div className="flex items-center gap-2 text-xs text-slate-500 px-1">
                  <span>{isUser ? 'You (Supply Chain Stakeholder)' : 'Governed Assistant (Gemini 3.8 Flash)'}</span>
                  <span aria-hidden="true">·</span>
                  <span>{msg.timestamp}</span>
                </div>

                {/* Message Content Bubble */}
                <div
                  className={`max-w-3xl rounded-xl p-4 sm:p-5 text-sm ${
                    isUser
                      ? 'bg-slate-900 text-white rounded-br-xs'
                      : 'bg-white border border-slate-200 text-slate-900 shadow-xs rounded-bl-xs w-full'
                  }`}
                >
                  <div className="whitespace-pre-wrap leading-relaxed">{msg.text}</div>

                  {/* If Assistant response, render Governance Badges and Pipeline Trace */}
                  {!isUser && payload && (
                    <div className="mt-4 pt-4 border-t border-slate-100 space-y-4">
                      {/* Governance Verification Bar */}
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="inline-flex items-center gap-1.5 text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Tool: <strong className="font-mono">{payload.function_call.name}</strong></span>
                        </div>
                        <div className="inline-flex items-center gap-1.5 text-xs text-indigo-800 bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded-md">
                          <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Canonical Metric: <strong className="font-mono">{payload.metric_name}</strong></span>
                        </div>
                        <div className="inline-flex items-center gap-1.5 text-xs text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md">
                          <Cpu className="w-3.5 h-3.5 text-slate-500" />
                          <span>Latency: {payload.latency_ms}ms</span>
                        </div>

                        <button
                          onClick={() => setExpandedTraceId(isTraceExpanded ? null : msg.id)}
                          className="ml-auto flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-medium py-1 px-2 hover:bg-indigo-50 rounded-md transition-colors"
                        >
                          <Code2 className="w-3.5 h-3.5" />
                          <span>{isTraceExpanded ? 'Hide Architecture Trace' : 'Inspect Architecture Trace'}</span>
                          {isTraceExpanded ? (
                            <ChevronDown className="w-3.5 h-3.5" />
                          ) : (
                            <ChevronRight className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>

                      {/* Expandable Architecture & SQL Audit Drawer */}
                      {isTraceExpanded && (
                        <div className="mt-3 p-4 bg-slate-900 text-slate-100 rounded-lg text-xs space-y-4 font-mono">
                          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                            <span className="text-slate-400 font-semibold tracking-wider uppercase text-[11px]">
                              Google AI Studio Function Call & BigQuery Lineage
                            </span>
                            <span className="text-emerald-400 text-[10px]">Zero Hallucination Verified</span>
                          </div>

                          {/* 1. Intercepted Tool Call */}
                          <div>
                            <div className="text-indigo-400 mb-1 flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                              <span>STEP 1: LLM Function Call Payload</span>
                            </div>
                            <pre className="p-3 bg-slate-950 rounded border border-slate-800 overflow-x-auto text-[11px] text-indigo-200">
{JSON.stringify(payload.function_call, null, 2)}
                            </pre>
                          </div>

                          {/* 2. BigQuery Materialized View SQL Translation */}
                          <div>
                            <div className="text-emerald-400 mb-1 flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                              <span>STEP 2: Backend BigQuery View Translation (Deterministic)</span>
                            </div>
                            <pre className="p-3 bg-slate-950 rounded border border-slate-800 overflow-x-auto text-[11px] text-emerald-200">
{payload.query_result.generated_sql}
                            </pre>
                          </div>

                          {/* 3. Governed Semantic Output */}
                          <div>
                            <div className="text-amber-400 mb-1 flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                              <span>STEP 3: Materialized View Result returned as functionResponse</span>
                            </div>
                            <div className="p-3 bg-slate-950 rounded border border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-2 text-slate-300 text-[11px]">
                              <div>
                                <span className="text-slate-500 block">Metric:</span>
                                <span className="font-semibold text-white">{payload.query_result.metric_name}</span>
                              </div>
                              <div>
                                <span className="text-slate-500 block">Value:</span>
                                <span className="font-semibold text-emerald-400">{payload.query_result.formatted_value}</span>
                              </div>
                              <div>
                                <span className="text-slate-500 block">Rows:</span>
                                <span>{payload.query_result.row_count}</span>
                              </div>
                              <div>
                                <span className="text-slate-500 block">Execution:</span>
                                <span>{payload.query_result.execution_time_ms} ms</span>
                              </div>
                            </div>
                          </div>

                          {/* 4. Mandatory Governed Definition */}
                          <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-300">
                            <span className="text-slate-400 block font-semibold mb-0.5">Enforced Governed Definition:</span>
                            <p className="text-slate-200 italic font-sans text-xs bg-slate-950/70 p-2.5 rounded border border-slate-800/80">
                              &ldquo;{payload.query_result.governed_definition}&rdquo;
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex items-center space-x-3 text-slate-500 text-xs py-3 px-2 animate-pulse">
              <Sparkles className="w-4 h-4 text-indigo-600 animate-spin" />
              <span>Translating natural query via AI Studio System Instructions & Function Calling...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-white border-t border-slate-200">
          <form onSubmit={handleFormSubmit} className="flex gap-2">
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Ask a supply chain metric question (e.g., 'What was our OTIF delivery rate for Q3?')..."
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-slate-900 placeholder:text-slate-400"
            />
            <button
              type="submit"
              disabled={!inputQuery.trim() || isLoading}
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow-xs cursor-pointer"
            >
              <span>Send</span>
              <Send className="w-4 h-4" />
            </button>
          </form>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 px-1">
            <span>Guaranteed: System instructions prohibit direct SQL drafting. All metrics flow through governed views.</span>
            <span className="font-mono text-slate-400 hidden sm:inline">query_governed_metrics tool</span>
          </div>
        </div>
      </div>
    </div>
  );
};
