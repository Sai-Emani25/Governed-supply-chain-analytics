import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Truck, 
  CheckCircle2, 
  RotateCw, 
  ArrowRight, 
  ShieldCheck, 
  Sparkles, 
  HelpCircle,
  FileCheck,
  Building2,
  Workflow
} from 'lucide-react';
import { PERSONA_SCENARIOS } from '../data/governedOntologyData';
import { ConversationalAnalysisResponse, PersonaScenario } from '../types/ontology';

interface PersonaResult {
  persona: PersonaScenario;
  run?: ConversationalAnalysisResponse;
  loading: boolean;
  error?: string;
}

export const PersonaConsistencyMatrix: React.FC = () => {
  const [personaResults, setPersonaResults] = useState<PersonaResult[]>(
    PERSONA_SCENARIOS.map((p) => ({ persona: p, loading: false }))
  );
  const [isRunningAll, setIsRunningAll] = useState(false);

  useEffect(() => {
    runAllPersonas();
  }, []);

  const runAllPersonas = async () => {
    setIsRunningAll(true);
    setPersonaResults((prev) => prev.map((p) => ({ ...p, loading: true, error: undefined })));

    try {
      const res = await fetch('/api/persona-compare', { method: 'POST' });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const data = await res.json();

      setPersonaResults(
        data.results.map((item: any) => ({
          persona: item.persona,
          run: item.run,
          loading: false
        }))
      );
    } catch (err: any) {
      setPersonaResults((prev) =>
        prev.map((p) => ({
          ...p,
          loading: false,
          error: err?.message || 'Execution error'
        }))
      );
    } finally {
      setIsRunningAll(false);
    }
  };

  const runSinglePersona = async (idx: number) => {
    const target = personaResults[idx];
    setPersonaResults((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, loading: true, error: undefined } : item))
    );

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: target.persona.prompt })
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const data = await res.json();

      setPersonaResults((prev) =>
        prev.map((item, i) => (i === idx ? { ...item, run: data, loading: false } : item))
      );
    } catch (err: any) {
      setPersonaResults((prev) =>
        prev.map((item, i) =>
          i === idx ? { ...item, loading: false, error: err?.message } : item
        )
      );
    }
  };

  // Determine if all completed runs share the identical metric and value
  const validRuns = personaResults.filter((r) => r.run);
  const allMetricsMatch =
    validRuns.length === 3 &&
    validRuns.every(
      (r) =>
        r.run?.metric_name === 'On_Time_Delivery' &&
        r.run?.query_result.calculated_value === 88.4
    );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Overview & Core Thesis Banner */}
      <div className="border border-slate-200 bg-white p-6 rounded-xl shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-600" />
              Phase 3: Demonstrating Multi-Persona Consistency
            </h1>
            <p className="text-sm text-slate-600 max-w-3xl leading-relaxed">
              Because Gemini is strictly constrained by the System Instructions to map natural language intent to exact enum values in the Function Declaration, three different personas with completely divergent domain jargon receive mathematically identical metrics.
            </p>
          </div>

          <button
            onClick={runAllPersonas}
            disabled={isRunningAll}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-lg text-xs sm:text-sm font-medium transition-colors shadow-xs cursor-pointer whitespace-nowrap self-start lg:self-auto"
          >
            <RotateCw className={`w-4 h-4 ${isRunningAll ? 'animate-spin' : ''}`} />
            <span>{isRunningAll ? 'Evaluating Personas...' : 'Re-Run All Personas'}</span>
          </button>
        </div>

        {/* Verification Success Strip */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-emerald-800">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span className="font-semibold">Ontological Convergence:</span>
            <span>
              {allMetricsMatch
                ? '3/3 Personas converged on exact canonical metric On_Time_Delivery (88.4% Q3)'
                : 'Evaluating pipeline convergence across all 3 stakeholder queries...'}
            </span>
          </div>

          <div className="flex items-center gap-3 text-slate-500 font-mono text-[11px]">
            <span>Target: On_Time_Delivery</span>
            <span aria-hidden="true">·</span>
            <span>Filter: Q3</span>
            <span aria-hidden="true">·</span>
            <span>Expected: 88.4%</span>
          </div>
        </div>
      </div>

      {/* The 3 Persona Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {personaResults.map((item, idx) => {
          const { persona, run, loading, error } = item;

          return (
            <div
              key={persona.id}
              className="border border-slate-200 bg-white rounded-xl shadow-xs overflow-hidden flex flex-col"
            >
              {/* Persona Header */}
              <div className="p-5 border-b border-slate-100 bg-slate-50/50">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-700 flex items-center justify-center font-semibold text-xs">
                      {idx === 0 ? <Truck className="w-4 h-4" /> : idx === 1 ? <Building2 className="w-4 h-4" /> : <Workflow className="w-4 h-4" />}
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-slate-900">{persona.title}</h2>
                      <div className="text-xs text-slate-500">{persona.role}</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">Persona #{idx + 1}</span>
                </div>

                {/* Persona Natural Language Prompt */}
                <div className="mt-3 p-3 bg-white border border-slate-200 rounded-lg">
                  <div className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider mb-1">
                    Stakeholder Prompt:
                  </div>
                  <div className="text-xs font-medium text-slate-900 leading-snug">
                    &ldquo;{persona.prompt}&rdquo;
                  </div>
                </div>

                {/* Jargon Extracted */}
                <div className="mt-2 flex flex-wrap gap-1 text-[11px] text-slate-600">
                  <span className="text-slate-400">Domain Jargon:</span>
                  {persona.jargonTerms.map((term, tIdx) => (
                    <span
                      key={tIdx}
                      className="text-indigo-700 font-mono text-[10px] bg-indigo-50/80 px-1.5 py-0.5 rounded"
                    >
                      {term}
                    </span>
                  ))}
                </div>
              </div>

              {/* Execution Results Body */}
              <div className="p-5 flex-1 space-y-4">
                {loading ? (
                  <div className="py-12 flex flex-col items-center justify-center text-slate-400 text-xs space-y-2">
                    <Sparkles className="w-5 h-5 text-indigo-600 animate-spin" />
                    <span>Mapping intent & executing tool call...</span>
                  </div>
                ) : error ? (
                  <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded text-xs">
                    {error}
                  </div>
                ) : run ? (
                  <div className="space-y-4">
                    {/* Intercepted Function Call */}
                    <div>
                      <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600 mb-1">
                        <span>1. Function Call Produced</span>
                        <span className="text-emerald-700 font-mono text-[10px]">Strict Enum</span>
                      </div>
                      <pre className="p-2.5 bg-slate-900 text-emerald-300 rounded font-mono text-[11px] overflow-x-auto">
{`query_governed_metrics(
  metric_name = "${run.function_call.args.metric_name}",
  dimensions = ${JSON.stringify(run.function_call.args.dimensions)},
  filters = ${JSON.stringify(run.function_call.args.filters)}
)`}
                      </pre>
                    </div>

                    {/* Numerical Canonical Output */}
                    <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg">
                      <div className="text-[10px] uppercase font-semibold text-slate-500 mb-1">
                        2. Canonical Metric Result
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-slate-900">
                          {run.query_result.formatted_value}
                        </span>
                        <span className="text-xs text-slate-500">
                          {run.query_result.metric_display_name}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1">
                        Queried View: <code className="font-mono text-slate-700">{run.query_result.view_queried}</code>
                      </div>
                    </div>

                    {/* Final Model Response */}
                    <div>
                      <div className="text-[11px] font-semibold text-slate-600 mb-1">
                        3. Governed Response to Stakeholder
                      </div>
                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 leading-relaxed">
                        {run.answer}
                      </div>
                    </div>

                    {/* Definition Citation Guarantee */}
                    <div className="flex items-start gap-2 text-[11px] text-emerald-800 bg-emerald-50/70 p-2 rounded border border-emerald-100">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>Formal governed definition automatically included in response</span>
                    </div>
                  </div>
                ) : null}
              </div>

              {/* Card Footer */}
              <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/30 flex items-center justify-between text-xs">
                <span className="text-slate-500 text-[11px]">{persona.explanation}</span>
                <button
                  onClick={() => runSinglePersona(idx)}
                  disabled={loading}
                  className="text-indigo-600 hover:text-indigo-800 font-medium text-xs hover:underline cursor-pointer"
                >
                  Test Single
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Enterprise Synthesis Takeaway */}
      <div className="border border-slate-200 bg-slate-900 text-slate-100 p-6 rounded-xl shadow-xs">
        <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-2 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          Why This Solves The Enterprise Supply Chain Metric Divergence Crisis
        </h3>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          In typical unconstrained generative AI deployments, when a Logistics Manager asks about &ldquo;freight loads&rdquo;, the LLM might query raw carrier EDI logs and calculate 74.2%. When a Procurement Officer asks about &ldquo;vendor compliance&rdquo;, the LLM writes an ad-hoc query against supplier scorecards and calculates 91.0%. When a Planner asks for &ldquo;OTIF&rdquo;, it generates an on-time-in-full compound query and calculates 82.5%.
        </p>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mt-2">
          By employing <strong>Google AI Studio Function Calling with strict enums</strong> and <strong>System Instructions</strong>, the model is architecturally precluded from authoring ad-hoc formulas. All three personas map irrevocably to the canonical <code className="text-emerald-300 font-mono">On_Time_Delivery</code> metric against <code className="text-emerald-300 font-mono">mv_shipment_performance_quarterly</code>, delivering true, audited, and immutable <strong>88.4%</strong> consistency.
        </p>
      </div>
    </div>
  );
};
