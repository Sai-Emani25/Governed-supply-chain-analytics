import React, { useState } from 'react';
import { 
  Database, 
  Layers, 
  ArrowRight, 
  Key, 
  Table, 
  Calculator, 
  FileCode,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';
import { SUPPLY_CHAIN_ENTITIES, GOVERNED_METRICS } from '../data/governedOntologyData';

export const OntologyCatalog: React.FC = () => {
  const [selectedEntityIndex, setSelectedEntityIndex] = useState(0);
  const [selectedMetricKey, setSelectedMetricKey] = useState<string>('On_Time_Delivery');

  const selectedEntity = SUPPLY_CHAIN_ENTITIES[selectedEntityIndex];
  const selectedMetric = GOVERNED_METRICS[selectedMetricKey];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="border border-slate-200 bg-white p-6 rounded-xl shadow-xs">
        <div className="space-y-1">
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Database className="w-5 h-5 text-indigo-600" />
            Phase 1: Governed Supply Chain Ontology & Canonical Metrics
          </h1>
          <p className="text-sm text-slate-600 max-w-3xl leading-relaxed">
            A governed ontology ensures that every entity, foreign key relationship, and business metric has one incontrovertible definition. Raw tables are isolated behind semantic views; Gemini only interacts with governed schemas.
          </p>
        </div>
      </div>

      {/* Part 1: Core Entities & Relationships */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-600" />
            Core Entities & Relational Schema (6 Entities)
          </h2>
          <span className="text-xs text-slate-500 font-mono">Governed Semantic Layer v2.4</span>
        </div>

        {/* Entity Selector Tabs */}
        <div className="flex space-x-1 sm:space-x-2 overflow-x-auto pb-1 scrollbar-none">
          {SUPPLY_CHAIN_ENTITIES.map((ent, idx) => (
            <button
              key={ent.name}
              onClick={() => setSelectedEntityIndex(idx)}
              className={`px-3.5 py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                selectedEntityIndex === idx
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {ent.name}
            </button>
          ))}
        </div>

        {/* Selected Entity Card */}
        <div className="border border-slate-200 bg-white rounded-xl shadow-xs p-6 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900">{selectedEntity.name}</h3>
                <span className="text-xs font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                  PK: {selectedEntity.primaryKey}
                </span>
              </div>
              <p className="text-sm text-slate-600 mt-1">{selectedEntity.definition}</p>
            </div>

            <div className="flex flex-wrap gap-2 text-xs">
              <span className="text-slate-400 self-center">Relationships:</span>
              {selectedEntity.keyRelationships.map((rel, rIdx) => (
                <span
                  key={rIdx}
                  className="bg-indigo-50 text-indigo-700 border border-indigo-100 px-2.5 py-1 rounded-md font-medium text-[11px]"
                >
                  {rel}
                </span>
              ))}
            </div>
          </div>

          {/* Attributes Schema Table */}
          <div>
            <h4 className="text-xs uppercase font-semibold text-slate-500 tracking-wider mb-3 flex items-center gap-1.5">
              <Table className="w-3.5 h-3.5" />
              Governed Entity Attributes
            </h4>
            <div className="overflow-x-auto border border-slate-200 rounded-lg">
              <table className="min-w-full divide-y divide-slate-200 text-xs">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-2.5 text-left font-semibold text-slate-700">Attribute</th>
                    <th className="px-4 py-2.5 text-left font-semibold text-slate-700">Type</th>
                    <th className="px-4 py-2.5 text-left font-semibold text-slate-700">Key Constraint</th>
                    <th className="px-4 py-2.5 text-left font-semibold text-slate-700">Business Definition</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {selectedEntity.attributes.map((attr, aIdx) => (
                    <tr key={aIdx} className="hover:bg-slate-50/50">
                      <td className="px-4 py-2.5 font-mono font-medium text-slate-900">{attr.name}</td>
                      <td className="px-4 py-2.5 font-mono text-slate-600">{attr.type}</td>
                      <td className="px-4 py-2.5">
                        {attr.name === selectedEntity.primaryKey ? (
                          <span className="inline-flex items-center gap-1 text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded font-mono font-medium">
                            <Key className="w-3 h-3" /> PRIMARY KEY
                          </span>
                        ) : attr.name.endsWith('_id') ? (
                          <span className="text-[11px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded font-mono">
                            FOREIGN KEY
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-2.5 text-slate-700">{attr.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Part 2: Canonical Metrics Deep Dive */}
      <div className="space-y-4 pt-4 border-t border-slate-200">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Calculator className="w-4 h-4 text-emerald-600" />
            Canonical Metrics (The Governed Logic)
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            These metrics are strictly hard-coded into BigQuery Materialized Views rather than calculated on the fly by the LLM.
          </p>
        </div>

        {/* Metric Selector Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {Object.values(GOVERNED_METRICS).map((m) => (
            <button
              key={m.id}
              onClick={() => setSelectedMetricKey(m.id)}
              className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                selectedMetricKey === m.id
                  ? 'border-emerald-600 bg-emerald-50/50 shadow-xs'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div className="text-xs font-semibold text-slate-900">{m.displayName}</div>
              <div className="text-[11px] font-mono text-emerald-700 mt-0.5">{m.id}</div>
            </button>
          ))}
        </div>

        {/* Selected Metric Detailed Breakdown Card */}
        <div className="border border-slate-200 bg-white rounded-xl shadow-xs p-6 space-y-6">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900">{selectedMetric.displayName}</h3>
                <span className="text-xs font-mono bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded font-medium">
                  Canonical Unit: {selectedMetric.unit}
                </span>
              </div>
              <p className="text-sm text-slate-700 mt-2 italic font-serif">
                &ldquo;{selectedMetric.governedDefinition}&rdquo;
              </p>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1 md:w-72 shrink-0">
              <span className="text-slate-500 font-semibold uppercase text-[10px] block">Materialized View Source</span>
              <code className="text-indigo-700 font-mono text-xs block break-all font-semibold">
                {selectedMetric.materializedViewSource}
              </code>
            </div>
          </div>

          {/* Formulas Comparison: Governed vs BigQuery */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Mathematical Definition */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
              <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider block">
                Governed Mathematical Logic
              </span>
              <code className="text-xs font-mono text-slate-900 block p-3 bg-white rounded border border-slate-200">
                {selectedMetric.governedFormula}
              </code>
              <p className="text-xs text-slate-600 leading-relaxed pt-1">
                <strong>Business Rationale:</strong> {selectedMetric.businessRationale}
              </p>
            </div>

            {/* BigQuery Materialized View DDL */}
            <div className="p-4 bg-slate-900 text-slate-100 rounded-lg space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-semibold uppercase tracking-wider">BigQuery Materialized DDL</span>
                <span className="text-emerald-400 font-mono text-[10px]">Materialized</span>
              </div>
              <pre className="text-[11px] font-mono text-emerald-300 p-3 bg-slate-950 rounded border border-slate-800 overflow-x-auto">
{selectedMetric.bigQueryFormula}
              </pre>
            </div>
          </div>

          {/* Hallucination Risk Warning */}
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-xs space-y-2">
            <div className="flex items-center gap-2 text-amber-900 font-semibold">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>Why Raw SQL Calculations Fail (Ungoverned AI Risk)</span>
            </div>
            <div className="text-amber-800 leading-relaxed">
              <strong>Flawed Prompting Pattern:</strong> <code className="font-mono text-amber-950">{selectedMetric.ungovernedHallucinationRisk.flawedFormula}</code>
            </div>
            <p className="text-amber-800 leading-relaxed">
              <strong>Failure Mode:</strong> {selectedMetric.ungovernedHallucinationRisk.whyItFails}
            </p>
            <div className="flex items-center gap-4 pt-1 font-mono text-[11px]">
              <span className="text-rose-700">Flawed Output: {selectedMetric.ungovernedHallucinationRisk.sampleFlawedResult}</span>
              <span aria-hidden="true" className="text-amber-300">|</span>
              <span className="text-emerald-800 font-bold">Governed True Metric: {selectedMetric.ungovernedHallucinationRisk.sampleGovernedResult}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
