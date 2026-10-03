export type MetricName = 
  | 'On_Time_Delivery'
  | 'Fill_Rate'
  | 'Days_of_Inventory'
  | 'Landed_Cost';

export type DimensionName =
  | 'supplier_name'
  | 'part_category'
  | 'plant_region'
  | 'time_month'
  | 'time_quarter';

export interface GovernedMetricDefinition {
  id: MetricName;
  displayName: string;
  unit: '%' | 'days' | '$USD';
  governedFormula: string;
  governedDefinition: string;
  businessRationale: string;
  bigQueryFormula: string;
  materializedViewSource: string;
  ungovernedHallucinationRisk: {
    flawedFormula: string;
    whyItFails: string;
    sampleFlawedResult: string;
    sampleGovernedResult: string;
  };
}

export interface SupplyChainEntity {
  name: string;
  definition: string;
  primaryKey: string;
  keyRelationships: string[];
  attributes: { name: string; type: string; description: string }[];
  sampleRecordsCount: number;
}

export interface QueryGovernedMetricsArgs {
  metric_name: MetricName;
  dimensions?: DimensionName[];
  filters?: string[];
}

export interface QueryExecutionResult {
  metric_name: MetricName;
  metric_display_name: string;
  governed_definition: string;
  calculated_value: number;
  formatted_value: string;
  unit: string;
  row_count: number;
  breakdown?: Array<{
    dimension: string;
    value: string;
    metric_value: number;
    formatted_value: string;
  }>;
  generated_sql: string;
  view_queried: string;
  execution_time_ms: number;
  filters_applied: string[];
  dimensions_grouped: string[];
}

export interface PipelineTraceStep {
  step: 'NATURAL_QUERY' | 'FUNCTION_CALL_INTERCEPTED' | 'BIGQUERY_SQL_TRANSLATION' | 'SEMANTIC_EXECUTION' | 'FUNCTION_RESPONSE_SYNTHESIS';
  timestamp: number;
  title: string;
  details: any;
}

export interface ConversationalAnalysisResponse {
  answer: string;
  governed_definition_cited: boolean;
  metric_name: MetricName;
  function_call: {
    name: 'query_governed_metrics';
    args: QueryGovernedMetricsArgs;
  };
  query_result: QueryExecutionResult;
  pipeline_trace: PipelineTraceStep[];
  governance_checks: {
    zero_raw_sql_hallucination: boolean;
    canonical_metric_enforced: boolean;
    definition_cited: boolean;
    semantic_layer_isolated: boolean;
  };
  model_used: string;
  latency_ms: number;
}

export interface PersonaScenario {
  id: string;
  title: string;
  role: string;
  avatar: string;
  prompt: string;
  mappedMetric: MetricName;
  jargonTerms: string[];
  expectedFunctionCall: QueryGovernedMetricsArgs;
  explanation: string;
}
