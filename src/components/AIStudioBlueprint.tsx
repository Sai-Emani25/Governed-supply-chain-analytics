import React, { useState } from 'react';
import { 
  FileCode2, 
  Copy, 
  Check, 
  Terminal, 
  Sliders, 
  Cpu, 
  Database, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { 
  AI_STUDIO_TOOL_DECLARATION, 
  AI_STUDIO_SYSTEM_INSTRUCTION 
} from '../data/governedOntologyData';

export const AIStudioBlueprint: React.FC = () => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const copyToClipboard = (text: string, sectionKey: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionKey);
    setTimeout(() => setCopiedSection(null), 2500);
  };

  const sampleBackendProxyCode = `// Google AI Studio -> Backend Integration Proxy
import { GoogleGenAI, Type } from '@google/genai';
import express from 'express';

const app = express();
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
});

app.post('/api/chat', async (req, res) => {
  const { userPrompt } = req.body;

  // 1. Send natural prompt with Governed System Instruction & Function Declaration
  const response1 = await ai.models.generateContent({
    model: 'gemini-3.8-flash',
    contents: userPrompt,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      temperature: 0.2, // Low temp for analytical precision
      tools: [{ functionDeclarations: [queryGovernedMetricsDeclaration] }]
    }
  });

  const functionCall = response1.functionCalls?.[0];
  if (!functionCall) {
    return res.json({ text: response1.text });
  }

  // 2. Intercept Tool Call & map to BigQuery Materialized View (No raw SQL written by LLM!)
  const { metric_name, dimensions, filters } = functionCall.args;
  const bigQueryResult = await queryBigQueryMaterializedView(metric_name, dimensions, filters);

  // 3. Return functionResponse back to Gemini for final natural language synthesis
  const response2 = await ai.models.generateContent({
    model: 'gemini-3.8-flash',
    contents: [
      { role: 'user', parts: [{ text: userPrompt }] },
      response1.candidates[0].content,
      {
        role: 'tool',
        parts: [{
          functionResponse: {
            name: functionCall.name,
            response: {
              metric_name,
              value: bigQueryResult.value,
              governed_definition: bigQueryResult.governed_definition
            }
          }
        }]
      }
    ],
    config: { systemInstruction: SYSTEM_INSTRUCTION, temperature: 0.2 }
  });

  res.json({ answer: response2.text, trace: { functionCall, bigQueryResult } });
});`;

  const sampleBigQueryDDL = `-- 1. BigQuery Materialized View for On-Time Delivery
CREATE MATERIALIZED VIEW \`governed_supply_chain.mv_shipment_performance_quarterly\` AS
SELECT
  supplier_name,
  plant_region,
  time_quarter,
  ROUND(SAFE_DIVIDE(
    COUNTIF(actual_delivery_date <= promised_delivery_date),
    COUNTIF(order_status != 'CANCELLED' AND actual_delivery_date IS NOT NULL)
  ) * 100, 1) AS on_time_delivery_pct,
  COUNT(1) AS total_shipments
FROM \`supply_chain_raw.shipments\`
GROUP BY 1, 2, 3;

-- 2. BigQuery Materialized View for Landed Cost Accounting
CREATE MATERIALIZED VIEW \`governed_supply_chain.mv_landed_cost_accounting\` AS
SELECT
  part_category,
  supplier_name,
  time_quarter,
  ROUND(AVG(unit_cost + SAFE_DIVIDE(freight_cost + duties_and_taxes, quantity_shipped)), 2) AS avg_landed_cost_usd
FROM \`supply_chain_raw.invoices\`
GROUP BY 1, 2, 3;`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="border border-slate-200 bg-white p-6 rounded-xl shadow-xs">
        <div className="space-y-1">
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <FileCode2 className="w-5 h-5 text-indigo-600" />
            Google AI Studio Implementation Blueprint
          </h1>
          <p className="text-sm text-slate-600 max-w-3xl leading-relaxed">
            Copy-paste configurations, Function Declaration schema, System Instructions, and BigQuery backend integration patterns to deploy this architecture into production.
          </p>
        </div>
      </div>

      {/* Recommended AI Studio Settings Bar */}
      <div className="border border-slate-200 bg-white rounded-xl p-6 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
          <Sliders className="w-4 h-4 text-indigo-600" />
          Recommended Google AI Studio Configuration
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
            <span className="text-slate-500 font-semibold block uppercase text-[10px]">Model Selection</span>
            <div className="font-bold text-slate-900 text-sm">Gemini 3.8 Flash / Gemini 3.1 Pro</div>
            <p className="text-slate-600 text-[11px] pt-1">
              Select for strict tool obedience, low latency, and deterministic reasoning.
            </p>
          </div>

          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
            <span className="text-slate-500 font-semibold block uppercase text-[10px]">Temperature Parameter</span>
            <div className="font-bold text-slate-900 text-sm">0.2 – 0.4</div>
            <p className="text-slate-600 text-[11px] pt-1">
              Low temperature keeps the analytical assistant precise, consistent, and strictly governed.
            </p>
          </div>

          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
            <span className="text-slate-500 font-semibold block uppercase text-[10px]">Function Calling Mode</span>
            <div className="font-bold text-slate-900 text-sm">Strict Function Tools</div>
            <p className="text-slate-600 text-[11px] pt-1">
              Enables guaranteed enum validation and intercepts all quantitative supply chain queries.
            </p>
          </div>
        </div>
      </div>

      {/* Section 1: Function Declaration */}
      <div className="border border-slate-200 bg-white rounded-xl shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-slate-700" />
            <h3 className="text-sm font-bold text-slate-900">
              1. Function Declaration (JSON Schema for Tools Section)
            </h3>
          </div>
          <button
            onClick={() => copyToClipboard(JSON.stringify(AI_STUDIO_TOOL_DECLARATION, null, 2), 'tool')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50 transition-colors cursor-pointer"
          >
            {copiedSection === 'tool' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedSection === 'tool' ? 'Copied JSON!' : 'Copy Schema'}</span>
          </button>
        </div>
        <div className="p-4 bg-slate-950 text-indigo-200 overflow-x-auto text-xs font-mono">
          <pre>{JSON.stringify(AI_STUDIO_TOOL_DECLARATION, null, 2)}</pre>
        </div>
      </div>

      {/* Section 2: System Instructions */}
      <div className="border border-slate-200 bg-white rounded-xl shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900">
              2. System Instructions (Prompt Context & Behavioral Guardrails)
            </h3>
          </div>
          <button
            onClick={() => copyToClipboard(AI_STUDIO_SYSTEM_INSTRUCTION, 'system')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50 transition-colors cursor-pointer"
          >
            {copiedSection === 'system' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedSection === 'system' ? 'Copied Instructions!' : 'Copy Instructions'}</span>
          </button>
        </div>
        <div className="p-5 text-slate-800 text-xs sm:text-sm font-mono whitespace-pre-wrap leading-relaxed bg-slate-50/50">
          {AI_STUDIO_SYSTEM_INSTRUCTION}
        </div>
      </div>

      {/* Section 3: BigQuery Materialized Views DDL */}
      <div className="border border-slate-200 bg-white rounded-xl shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900">
              3. The Semantic Data Store: BigQuery Materialized Views (Phase 4)
            </h3>
          </div>
          <button
            onClick={() => copyToClipboard(sampleBigQueryDDL, 'bigquery')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50 transition-colors cursor-pointer"
          >
            {copiedSection === 'bigquery' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedSection === 'bigquery' ? 'Copied SQL DDL!' : 'Copy DDL'}</span>
          </button>
        </div>
        <div className="p-4 bg-slate-950 text-emerald-300 overflow-x-auto text-xs font-mono">
          <pre>{sampleBigQueryDDL}</pre>
        </div>
      </div>

      {/* Section 4: Application Backend Proxy Architecture */}
      <div className="border border-slate-200 bg-white rounded-xl shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-purple-600" />
            <h3 className="text-sm font-bold text-slate-900">
              4. Backend Orchestration Loop (Node.js & @google/genai SDK)
            </h3>
          </div>
          <button
            onClick={() => copyToClipboard(sampleBackendProxyCode, 'backend')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50 transition-colors cursor-pointer"
          >
            {copiedSection === 'backend' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedSection === 'backend' ? 'Copied Code!' : 'Copy Node.js Code'}</span>
          </button>
        </div>
        <div className="p-4 bg-slate-950 text-slate-200 overflow-x-auto text-xs font-mono">
          <pre>{sampleBackendProxyCode}</pre>
        </div>
      </div>
    </div>
  );
};
