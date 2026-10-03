import React, { useState } from 'react';
import { 
  Layers, 
  AlertOctagon, 
  CheckCircle2, 
  ArrowRight, 
  Code2, 
  Database, 
  Play, 
  SlidersHorizontal,
  RefreshCw
} from 'lucide-react';
import { 
  GOVERNED_METRICS, 
  WAREHOUSE_SIMULATION_DATA,
  executeGovernedSemanticQuery,
  formatMetricValue 
} from '../data/governedOntologyData';
import { MetricName, DimensionName } from '../types/ontology';

export const RawVsGovernedLab: React.FC = () => {
  const [selectedMetric, setSelectedMetric] = useState<MetricName>('On_Time_Delivery');
  const [selectedQuarter, setSelectedQuarter] = useState<string>('Q3');
  const [selectedDimension, setSelectedDimension] = useState<DimensionName | 'none'>('none');
  const [selectedSupplier, setSelectedSupplier] = useState<string>('All');

  const metricDef = GOVERNED_METRICS[selectedMetric];

  // Run governed calculation
  const dimensionsToQuery: DimensionName[] = selectedDimension === 'none' ? [] : [selectedDimension];
  const filtersToApply: string[] = [`time_quarter = '${selectedQuarter}'`];
  if (selectedSupplier !== 'All') {
    filtersToApply.push(`supplier_name = '${selectedSupplier}'`);
  }

  const governedResult = executeGovernedSemanticQuery({
    metric_name: selectedMetric,
    dimensions: dimensionsToQuery,
    filters: filtersToApply
  });

  // Calculate simulated flawed raw SQL metric
  const flawedMetricValue = (governedResult.calculated_value * 0.84).toFixed(1);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="border border-slate-200 bg-white p-6 rounded-xl shadow-xs">
        <div className="space-y-1">
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-600" />
            Anti-Hallucination Lab: Ungoverned Raw SQL vs. Governed Semantic Layer
          </h1>
          <p className="text-sm text-slate-600 max-w-3xl leading-relaxed">
            Directly test what happens when an LLM writes arbitrary SQL against raw supply chain tables versus routing through Google AI Studio&apos;s strictly bounded function calling.
          </p>
        </div>
      </div>

      {/* Interactive Controls Bar */}
      <div className="border border-slate-200 bg-white p-4 sm:p-5 rounded-xl shadow-xs space-y-4">
        <div className="text-xs uppercase font-semibold text-slate-500 tracking-wider flex items-center gap-2">
          <SlidersHorizontal className="w-3.5 h-3.5" />
          Interactive Query Parameters
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Metric Selector */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Canonical Metric</label>
            <select
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value as MetricName)}
              className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              {Object.values(GOVERNED_METRICS).map((m) => (
                <option key={m.id} value={m.id}>
                  {m.displayName}
                </option>
              ))}
            </select>
          </div>

          {/* Quarter Selector */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Time Quarter</label>
            <select
              value={selectedQuarter}
              onChange={(e) => setSelectedQuarter(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="Q1">Quarter 1 (Q1)</option>
              <option value="Q2">Quarter 2 (Q2)</option>
              <option value="Q3">Quarter 3 (Q3 - Canonical)</option>
              <option value="Q4">Quarter 4 (Q4)</option>
            </select>
          </div>

          {/* Dimension Breakdown */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Group By Dimension</label>
            <select
              value={selectedDimension}
              onChange={(e) => setSelectedDimension(e.target.value as any)}
              className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="none">No Breakdown (Aggregate)</option>
              <option value="supplier_name">supplier_name</option>
              <option value="part_category">part_category</option>
              <option value="plant_region">plant_region</option>
              <option value="time_quarter">time_quarter</option>
            </select>
          </div>

          {/* Supplier Filter */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Supplier Filter</label>
            <select
              value={selectedSupplier}
              onChange={(e) => setSelectedSupplier(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="All">All Suppliers</option>
              {Object.keys(WAREHOUSE_SIMULATION_DATA.supplierBreakdown).map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Side-by-Side Comparison Arena */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT: Flawed Raw SQL / Ungoverned Path */}
        <div className="border border-rose-200 bg-white rounded-xl shadow-xs overflow-hidden flex flex-col">
          <div className="p-4 bg-rose-50 border-b border-rose-100 flex items-center justify-between">
            <div className="flex items-center gap-2 text-rose-900 font-bold text-sm">
              <AlertOctagon className="w-4 h-4 text-rose-600" />
              <span>Ungoverned LLM: Raw SQL Generation</span>
            </div>
            <span className="text-[10px] font-mono text-rose-700 bg-rose-100 px-2 py-0.5 rounded">
              High Hallucination Risk
            </span>
          </div>

          <div className="p-5 flex-1 space-y-4 text-xs">
            <div className="p-3 bg-rose-50/60 border border-rose-200 rounded-lg text-rose-900">
              <strong className="block font-semibold mb-1">Common LLM Hallucination Trap:</strong>
              <p className="text-[11px] leading-relaxed">
                When asked &ldquo;{selectedMetric === 'On_Time_Delivery' ? 'How did inbound shipments do in ' + selectedQuarter : 'What is our ' + metricDef.displayName}&rdquo;, an unconstrained LLM generates arbitrary SQL directly against raw tables.
              </p>
            </div>

            {/* Simulated Flawed SQL */}
            <div>
              <span className="text-[11px] font-semibold text-slate-600 block mb-1">
                Ad-Hoc Generated SQL (Ungoverned & Faulty):
              </span>
              <pre className="p-3 bg-slate-900 text-rose-300 rounded font-mono text-[11px] overflow-x-auto leading-relaxed">
{selectedMetric === 'On_Time_Delivery' ? `-- Flawed: Includes canceled orders & un-received shipments
SELECT 
  COUNT(CASE WHEN actual_delivery_date <= promised_delivery_date THEN 1 END) 
  / COUNT(*) * 100 AS otd_pct
FROM raw_supply_chain.shipments
WHERE quarter = '${selectedQuarter}';` : selectedMetric === 'Landed_Cost' ? `-- Flawed: Fails to apportion bulk freight cost to units
SELECT AVG(unit_cost) + AVG(freight_cost) + AVG(duties)
FROM raw_supply_chain.invoices;` : `-- Flawed: Uses annualized denominator instead of 30d window
SELECT stock_qty / (yearly_demand / 365)
FROM raw_supply_chain.inventory;`}
              </pre>
            </div>

            {/* Flawed Numerical Output */}
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-lg">
              <span className="text-[10px] uppercase font-semibold text-rose-800 tracking-wider block">
                Calculated Metric (Corrupted Data)
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-extrabold text-rose-700">
                  {selectedMetric === 'Landed_Cost' ? `$${(governedResult.calculated_value * 28.5).toFixed(2)}` : `${flawedMetricValue}%`}
                </span>
                <span className="text-xs text-rose-600 font-medium">Skewed Result</span>
              </div>
              <p className="text-[11px] text-rose-700 mt-2">
                <strong>Why it fails:</strong> {metricDef.ungovernedHallucinationRisk.whyItFails}
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT: Governed Architecture / Semantic Layer */}
        <div className="border border-emerald-200 bg-white rounded-xl shadow-xs overflow-hidden flex flex-col">
          <div className="p-4 bg-emerald-50 border-b border-emerald-100 flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Governed Architecture: Google AI Studio Tool</span>
            </div>
            <span className="text-[10px] font-mono text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
              Audited & Immutable
            </span>
          </div>

          <div className="p-5 flex-1 space-y-4 text-xs">
            <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-lg text-emerald-900">
              <strong className="block font-semibold mb-1">Governed Semantic Enforcement:</strong>
              <p className="text-[11px] leading-relaxed">
                Gemini is constrained by System Instructions and Function Schema to emit exact enums. The backend translates the payload into parameterized BigQuery queries against pre-audited views.
              </p>
            </div>

            {/* Compiled Materialized View SQL */}
            <div>
              <span className="text-[11px] font-semibold text-slate-600 block mb-1">
                Deterministic BigQuery View Translation:
              </span>
              <pre className="p-3 bg-slate-900 text-emerald-300 rounded font-mono text-[11px] overflow-x-auto leading-relaxed">
{governedResult.generated_sql}
              </pre>
            </div>

            {/* Governed Canonical Output */}
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
              <span className="text-[10px] uppercase font-semibold text-emerald-800 tracking-wider block">
                Canonical Metric (Single Source of Truth)
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-extrabold text-emerald-700">
                  {governedResult.formatted_value}
                </span>
                <span className="text-xs text-emerald-800 font-medium">100% Governed</span>
              </div>
              <p className="text-[11px] text-emerald-900 mt-2 font-serif italic">
                &ldquo;{governedResult.governed_definition}&rdquo;
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Breakdown Data Table if Dimension Selected */}
      {governedResult.breakdown && governedResult.breakdown.length > 0 && (
        <div className="border border-slate-200 bg-white rounded-xl shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Database className="w-4 h-4 text-indigo-600" />
              Governed Dimension Breakdown: <code className="font-mono text-indigo-600">{selectedDimension}</code>
            </h3>
            <span className="text-xs text-slate-500 font-mono">
              View: {governedResult.view_queried}
            </span>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="min-w-full divide-y divide-slate-200 text-xs">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-2.5 text-left font-semibold text-slate-700">Dimension Entity</th>
                  <th className="px-4 py-2.5 text-right font-semibold text-slate-700">Canonical {metricDef.displayName}</th>
                  <th className="px-4 py-2.5 text-left font-semibold text-slate-700">SLA Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {governedResult.breakdown.map((row, rIdx) => {
                  const isHighPerformance = row.metric_value >= 88.0;
                  return (
                    <tr key={rIdx} className="hover:bg-slate-50/50">
                      <td className="px-4 py-2.5 font-medium text-slate-900">{row.value}</td>
                      <td className="px-4 py-2.5 text-right font-mono font-bold text-slate-900">
                        {row.formatted_value}
                      </td>
                      <td className="px-4 py-2.5">
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded font-medium ${
                            isHighPerformance
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-amber-50 text-amber-700'
                          }`}
                        >
                          {isHighPerformance ? 'Meets SLA Target' : 'Under Observation'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
