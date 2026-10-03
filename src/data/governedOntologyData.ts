import { 
  GovernedMetricDefinition, 
  SupplyChainEntity, 
  PersonaScenario, 
  QueryGovernedMetricsArgs,
  QueryExecutionResult
} from '../types/ontology';

export const SUPPLY_CHAIN_ENTITIES: SupplyChainEntity[] = [
  {
    name: 'Supplier',
    definition: 'Entity providing raw materials or finished components under contractual fulfillment terms.',
    primaryKey: 'supplier_id',
    keyRelationships: ['Supplies Part (1:N)', 'Originates Shipment (1:N)'],
    attributes: [
      { name: 'supplier_id', type: 'STRING', description: 'Unique surrogate identifier (e.g., SUP-1001)' },
      { name: 'supplier_name', type: 'STRING', description: 'Governed corporate business name' },
      { name: 'tier', type: 'INTEGER', description: 'Supply chain tier (1 = Direct, 2 = Component sub-tier)' },
      { name: 'country', type: 'STRING', description: 'Country of origin / manufacturing domicile' },
      { name: 'rating_score', type: 'FLOAT', description: 'Governed vendor compliance score (0.00-100.00)' }
    ],
    sampleRecordsCount: 24
  },
  {
    name: 'Part',
    definition: 'The SKU, engineering component, or finished good cataloged in inventory.',
    primaryKey: 'part_id',
    keyRelationships: ['Stored in Plant/Warehouse (N:M)', 'Fulfilled in Order (1:N)', 'Supplied by Supplier (N:1)'],
    attributes: [
      { name: 'part_id', type: 'STRING', description: 'Standard SKU number (e.g., PRT-4029)' },
      { name: 'part_name', type: 'STRING', description: 'Canonical component name' },
      { name: 'part_category', type: 'STRING', description: 'Taxonomy (Electronics, Fasteners, Hydraulics, Power)' },
      { name: 'unit_cost', type: 'NUMERIC', description: 'Invoice baseline price in USD' },
      { name: 'lead_time_days', type: 'INTEGER', description: 'Published procurement SLA lead days' }
    ],
    sampleRecordsCount: 65
  },
  {
    name: 'Plant/Location',
    definition: 'Physical node where inventory is manufactured, cross-docked, or held in reserve.',
    primaryKey: 'location_id',
    keyRelationships: ['Receives Shipment (1:N)', 'Holds Inventory (1:N)'],
    attributes: [
      { name: 'location_id', type: 'STRING', description: 'Facility identifier (e.g., LOC-ATL-01)' },
      { name: 'plant_name', type: 'STRING', description: 'Official facility title' },
      { name: 'plant_region', type: 'STRING', description: 'Geographic market (NA-East, NA-West, EU-Central, APAC-South)' },
      { name: 'capacity_sqft', type: 'INTEGER', description: 'Warehouse storage capacity' }
    ],
    sampleRecordsCount: 12
  },
  {
    name: 'Order',
    definition: 'A customer or production request for a specific quantity of designated Parts.',
    primaryKey: 'order_id',
    keyRelationships: ['Placed by Customer (N:1)', 'Generates Shipment (1:N)', 'Contains Parts (1:N)'],
    attributes: [
      { name: 'order_id', type: 'STRING', description: 'Master commercial purchase order' },
      { name: 'customer_id', type: 'STRING', description: 'Foreign key to Customer' },
      { name: 'order_date', type: 'DATE', description: 'Timestamp of customer commitment' },
      { name: 'order_status', type: 'STRING', description: 'Lifecycle state: PENDING, FULFILLED, PARTIAL, CANCELLED' }
    ],
    sampleRecordsCount: 1420
  },
  {
    name: 'Shipment',
    definition: 'The physical movement of a Part between nodes via freight or direct carrier haul.',
    primaryKey: 'shipment_id',
    keyRelationships: ['Fulfills Order (N:1)', 'Originated by Supplier (N:1)', 'Delivered to Location (N:1)'],
    attributes: [
      { name: 'shipment_id', type: 'STRING', description: 'Tracking shipment identifier' },
      { name: 'order_id', type: 'STRING', description: 'Associated customer order' },
      { name: 'supplier_id', type: 'STRING', description: 'Carrier originating vendor' },
      { name: 'part_id', type: 'STRING', description: 'Component payload' },
      { name: 'quantity_shipped', type: 'INTEGER', description: 'Units loaded on manifest' },
      { name: 'promised_delivery_date', type: 'DATE', description: 'Contractual SLA milestone' },
      { name: 'actual_delivery_date', type: 'DATE', description: 'Dock-receipt stamped date' },
      { name: 'freight_cost', type: 'NUMERIC', description: 'Total carrier line-haul bill' },
      { name: 'duties_and_taxes', type: 'NUMERIC', description: 'Customs and tariff fees' }
    ],
    sampleRecordsCount: 3850
  },
  {
    name: 'Customer',
    definition: 'The end-purchaser or assembly division consuming the Part.',
    primaryKey: 'customer_id',
    keyRelationships: ['Places Order (1:N)'],
    attributes: [
      { name: 'customer_id', type: 'STRING', description: 'Customer master record ID' },
      { name: 'customer_name', type: 'STRING', description: 'Corporate entity name' },
      { name: 'segment', type: 'STRING', description: 'Enterprise, OEM Partner, Tier-1 Assembly' },
      { name: 'region', type: 'STRING', description: 'Delivery territory' }
    ],
    sampleRecordsCount: 110
  }
];

export const GOVERNED_METRICS: Record<string, GovernedMetricDefinition> = {
  On_Time_Delivery: {
    id: 'On_Time_Delivery',
    displayName: 'On-Time Delivery (OTD)',
    unit: '%',
    governedFormula: 'COUNT(shipments WHERE actual_delivery_date <= promised_delivery_date AND status != "CANCELLED") / COUNT(total_valid_shipments)',
    governedDefinition: 'The percentage of shipments where the actual delivery date was less than or equal to the promised delivery date.',
    businessRationale: 'Protects manufacturing lines from line-stoppages. Excludes canceled shipments and carrier demurrage disputes that skew raw operational logs.',
    bigQueryFormula: `SELECT 
  ROUND(SAFE_DIVIDE(
    COUNTIF(actual_delivery_date <= promised_delivery_date),
    COUNTIF(status != 'CANCELLED' AND actual_delivery_date IS NOT NULL)
  ) * 100, 1) AS on_time_delivery_pct`,
    materializedViewSource: '`governed_supply_chain.mv_shipment_performance_quarterly`',
    ungovernedHallucinationRisk: {
      flawedFormula: 'COUNT(actual_date <= promised_date) / COUNT(*) [inclusive of canceled, in-transit, and mislabelled orders]',
      whyItFails: 'Raw queries written by LLMs frequently include unconfirmed in-transit loads, failed EDI messages, and cancelations, or confuse order_date with promised_delivery_date.',
      sampleFlawedResult: '74.2%',
      sampleGovernedResult: '88.4%'
    }
  },
  Fill_Rate: {
    id: 'Fill_Rate',
    displayName: 'Order Fill Rate',
    unit: '%',
    governedFormula: 'SUM(quantity_shipped) / SUM(quantity_ordered)',
    governedDefinition: 'The percentage of customer ordered item quantities fulfilled and shipped completely against requested quantities.',
    businessRationale: 'Direct indicator of stock availability and order completion fidelity across customer accounts.',
    bigQueryFormula: `SELECT 
  ROUND(SAFE_DIVIDE(
    SUM(quantity_shipped),
    SUM(quantity_ordered)
  ) * 100, 1) AS fill_rate_pct`,
    materializedViewSource: '`governed_supply_chain.mv_order_fulfillment_monthly`',
    ungovernedHallucinationRisk: {
      flawedFormula: 'COUNT(fulfilled_orders) / COUNT(total_orders) [order count instead of item quantity ratio]',
      whyItFails: 'LLMs confuse Order-level fill rate with Item Quantity fill rate, distorting heavy volume component performance.',
      sampleFlawedResult: '93.1%',
      sampleGovernedResult: '91.7%'
    }
  },
  Days_of_Inventory: {
    id: 'Days_of_Inventory',
    displayName: 'Days of Inventory (DOI)',
    unit: 'days',
    governedFormula: 'current_inventory_quantity / average_daily_demand_last_30_days',
    governedDefinition: 'The number of days current stock will support operations before stockout, calculated from trailing 30-day demand.',
    businessRationale: 'Monitors working capital efficiency without risking stockouts. Governed logic strictly enforces trailing 30 days demand window.',
    bigQueryFormula: `SELECT 
  ROUND(SAFE_DIVIDE(
    current_inventory_quantity,
    (total_demand_trailing_30d / 30.0)
  ), 1) AS days_of_inventory`,
    materializedViewSource: '`governed_supply_chain.mv_inventory_velocity_daily`',
    ungovernedHallucinationRisk: {
      flawedFormula: 'stock_quantity / (yearly_demand / 365) [masks seasonal surges and recent demand spikes]',
      whyItFails: 'Ungoverned SQL creates arbitrary denominator windows (7 days, 90 days, or annualized), yielding wildly conflicting inventory runway figures.',
      sampleFlawedResult: '62.4 days',
      sampleGovernedResult: '42.8 days'
    }
  },
  Landed_Cost: {
    id: 'Landed_Cost',
    displayName: 'Landed Cost Per Unit',
    unit: '$USD',
    governedFormula: 'unit_cost + allocated_freight_cost + allocated_duties_and_taxes',
    governedDefinition: 'The total delivered cost per unit including invoice purchase price, allocated transport freight, customs duties, and tariffs.',
    businessRationale: 'Provides true procurement margin visibility beyond FOB invoice pricing.',
    bigQueryFormula: `SELECT 
  ROUND(AVG(
    unit_cost + 
    SAFE_DIVIDE(freight_cost, quantity_shipped) + 
    SAFE_DIVIDE(duties_and_taxes, quantity_shipped)
  ), 2) AS avg_landed_cost_usd`,
    materializedViewSource: '`governed_supply_chain.mv_landed_cost_accounting`',
    ungovernedHallucinationRisk: {
      flawedFormula: 'AVG(unit_cost) + AVG(freight_cost) [fails to apportion lump-sum freight per unit]',
      whyItFails: 'Adding aggregate container freight directly to unit price generates astronomical, mathematically absurd unit costs.',
      sampleFlawedResult: '$1,420.50 / unit',
      sampleGovernedResult: '$34.20 / unit'
    }
  }
};

export const PERSONA_SCENARIOS: PersonaScenario[] = [
  {
    id: 'logistics_manager',
    title: 'The Logistics Manager',
    role: 'Logistics Operations Lead',
    avatar: 'truck',
    prompt: 'How many of our inbound freight loads hit their delivery windows in Q3?',
    mappedMetric: 'On_Time_Delivery',
    jargonTerms: ['inbound freight loads', 'delivery windows', 'hit schedule'],
    expectedFunctionCall: {
      metric_name: 'On_Time_Delivery',
      dimensions: ['time_quarter'],
      filters: ["time_quarter = 'Q3'"]
    },
    explanation: 'Translates operational logistics terminology (freight loads, delivery windows) into governed On_Time_Delivery metric for Q3.'
  },
  {
    id: 'procurement_officer',
    title: 'The Procurement Officer',
    role: 'Strategic Sourcing Manager',
    avatar: 'badge-check',
    prompt: 'Show me our vendor compliance score for on-time arrivals last quarter.',
    mappedMetric: 'On_Time_Delivery',
    jargonTerms: ['vendor compliance score', 'on-time arrivals', 'last quarter'],
    expectedFunctionCall: {
      metric_name: 'On_Time_Delivery',
      dimensions: ['time_quarter'],
      filters: ["time_quarter = 'Q3'"]
    },
    explanation: 'Maps commercial sourcing jargon (vendor compliance, arrivals) directly to the exact same canonical On_Time_Delivery metric.'
  },
  {
    id: 'supply_chain_planner',
    title: 'The Supply Chain Planner',
    role: 'Inventory & Demand Planning Analyst',
    avatar: 'chart-line',
    prompt: 'What was our OTIF delivery rate for Q3?',
    mappedMetric: 'On_Time_Delivery',
    jargonTerms: ['OTIF delivery rate', 'fulfillment precision', 'Q3 SLA'],
    expectedFunctionCall: {
      metric_name: 'On_Time_Delivery',
      dimensions: ['time_quarter'],
      filters: ["time_quarter = 'Q3'"]
    },
    explanation: 'Resolves the industry acronym "OTIF" directly into governed On_Time_Delivery rather than inventing custom logic.'
  }
];

// Governed Supply Chain Warehouse Data Store for Simulation
export const WAREHOUSE_SIMULATION_DATA = {
  quarters: ['Q1', 'Q2', 'Q3', 'Q4'],
  metricsByQuarter: {
    On_Time_Delivery: {
      Q1: 85.2,
      Q2: 86.9,
      Q3: 88.4, // Canonical 88.4% from user brief!
      Q4: 89.1,
      overall: 87.4
    },
    Fill_Rate: {
      Q1: 89.4,
      Q2: 90.8,
      Q3: 91.7,
      Q4: 92.5,
      overall: 91.1
    },
    Days_of_Inventory: {
      Q1: 48.2,
      Q2: 45.6,
      Q3: 42.8,
      Q4: 41.2,
      overall: 44.5
    },
    Landed_Cost: {
      Q1: 37.80,
      Q2: 35.90,
      Q3: 34.20,
      Q4: 33.75,
      overall: 35.41
    }
  },
  supplierBreakdown: {
    'Acme Corp': { OTD: 92.1, FillRate: 94.2, DOI: 39.5, LandedCost: 31.80 },
    'Apex Industrial': { OTD: 88.4, FillRate: 91.5, DOI: 43.1, LandedCost: 34.20 },
    'NovaTech Components': { OTD: 84.7, FillRate: 88.9, DOI: 47.6, LandedCost: 38.50 },
    'Solis Freight': { OTD: 90.3, FillRate: 93.0, DOI: 41.0, LandedCost: 32.90 },
    'Quantum Dynamics': { OTD: 86.5, FillRate: 90.2, DOI: 44.8, LandedCost: 36.10 }
  },
  categoryBreakdown: {
    'Electronics': { OTD: 86.8, FillRate: 89.4, DOI: 49.2, LandedCost: 52.40 },
    'Fasteners': { OTD: 93.4, FillRate: 96.1, DOI: 28.5, LandedCost: 8.90 },
    'Hydraulics': { OTD: 87.2, FillRate: 90.7, DOI: 45.0, LandedCost: 41.20 },
    'Power Systems': { OTD: 85.9, FillRate: 88.6, DOI: 51.3, LandedCost: 68.30 }
  },
  regionBreakdown: {
    'NA-East': { OTD: 89.2, FillRate: 92.4, DOI: 41.5, LandedCost: 33.80 },
    'NA-West': { OTD: 88.0, FillRate: 91.1, DOI: 43.2, LandedCost: 34.90 },
    'EU-Central': { OTD: 87.5, FillRate: 90.8, DOI: 44.0, LandedCost: 35.50 },
    'APAC-South': { OTD: 89.1, FillRate: 92.0, DOI: 42.1, LandedCost: 33.10 }
  }
};

export function executeGovernedSemanticQuery(args: QueryGovernedMetricsArgs): QueryExecutionResult {
  const metric = GOVERNED_METRICS[args.metric_name] || GOVERNED_METRICS.On_Time_Delivery;
  const startTime = Date.now();

  let targetQuarter = 'Q3'; // default user scenario
  let targetSupplier: string | null = null;
  let targetCategory: string | null = null;
  let targetRegion: string | null = null;

  if (args.filters && args.filters.length > 0) {
    for (const f of args.filters) {
      const lower = f.toLowerCase();
      if (lower.includes('q1')) targetQuarter = 'Q1';
      else if (lower.includes('q2')) targetQuarter = 'Q2';
      else if (lower.includes('q3')) targetQuarter = 'Q3';
      else if (lower.includes('q4')) targetQuarter = 'Q4';

      if (lower.includes('acme')) targetSupplier = 'Acme Corp';
      else if (lower.includes('apex')) targetSupplier = 'Apex Industrial';
      else if (lower.includes('novatech')) targetSupplier = 'NovaTech Components';

      if (lower.includes('electronics')) targetCategory = 'Electronics';
      else if (lower.includes('fasteners')) targetCategory = 'Fasteners';
      else if (lower.includes('hydraulics')) targetCategory = 'Hydraulics';

      if (lower.includes('na-east')) targetRegion = 'NA-East';
      else if (lower.includes('na-west')) targetRegion = 'NA-West';
      else if (lower.includes('eu-central')) targetRegion = 'EU-Central';
      else if (lower.includes('apac-south')) targetRegion = 'APAC-South';
    }
  }

  // Calculate canonical value
  let calculatedValue = 0;
  const quarterData = (WAREHOUSE_SIMULATION_DATA.metricsByQuarter as any)[args.metric_name];
  calculatedValue = quarterData ? (quarterData[targetQuarter] ?? quarterData.Q3) : 88.4;

  if (targetSupplier && (WAREHOUSE_SIMULATION_DATA.supplierBreakdown as any)[targetSupplier]) {
    const sData = (WAREHOUSE_SIMULATION_DATA.supplierBreakdown as any)[targetSupplier];
    if (args.metric_name === 'On_Time_Delivery') calculatedValue = sData.OTD;
    else if (args.metric_name === 'Fill_Rate') calculatedValue = sData.FillRate;
    else if (args.metric_name === 'Days_of_Inventory') calculatedValue = sData.DOI;
    else if (args.metric_name === 'Landed_Cost') calculatedValue = sData.LandedCost;
  }

  // Generate Breakdown if dimensions requested
  let breakdown: QueryExecutionResult['breakdown'];
  const dimensions = args.dimensions || [];

  if (dimensions.includes('supplier_name')) {
    breakdown = Object.entries(WAREHOUSE_SIMULATION_DATA.supplierBreakdown).map(([name, vals]) => {
      let val = vals.OTD;
      if (args.metric_name === 'Fill_Rate') val = vals.FillRate;
      else if (args.metric_name === 'Days_of_Inventory') val = vals.DOI;
      else if (args.metric_name === 'Landed_Cost') val = vals.LandedCost;
      return {
        dimension: 'supplier_name',
        value: name,
        metric_value: val,
        formatted_value: formatMetricValue(val, metric.unit)
      };
    });
  } else if (dimensions.includes('part_category')) {
    breakdown = Object.entries(WAREHOUSE_SIMULATION_DATA.categoryBreakdown).map(([cat, vals]) => {
      let val = vals.OTD;
      if (args.metric_name === 'Fill_Rate') val = vals.FillRate;
      else if (args.metric_name === 'Days_of_Inventory') val = vals.DOI;
      else if (args.metric_name === 'Landed_Cost') val = vals.LandedCost;
      return {
        dimension: 'part_category',
        value: cat,
        metric_value: val,
        formatted_value: formatMetricValue(val, metric.unit)
      };
    });
  } else if (dimensions.includes('plant_region')) {
    breakdown = Object.entries(WAREHOUSE_SIMULATION_DATA.regionBreakdown).map(([reg, vals]) => {
      let val = vals.OTD;
      if (args.metric_name === 'Fill_Rate') val = vals.FillRate;
      else if (args.metric_name === 'Days_of_Inventory') val = vals.DOI;
      else if (args.metric_name === 'Landed_Cost') val = vals.LandedCost;
      return {
        dimension: 'plant_region',
        value: reg,
        metric_value: val,
        formatted_value: formatMetricValue(val, metric.unit)
      };
    });
  } else if (dimensions.includes('time_quarter')) {
    breakdown = WAREHOUSE_SIMULATION_DATA.quarters.map(q => {
      const qVal = quarterData ? quarterData[q] : 88.4;
      return {
        dimension: 'time_quarter',
        value: q,
        metric_value: qVal,
        formatted_value: formatMetricValue(qVal, metric.unit)
      };
    });
  }

  // Construct BigQuery SQL corresponding to semantic view query
  const selectClause = dimensions.length > 0 
    ? `${dimensions.join(', ')}, ${getMetricSqlColumn(args.metric_name)}` 
    : getMetricSqlColumn(args.metric_name);
  
  const whereClauses: string[] = [];
  if (args.filters && args.filters.length > 0) {
    whereClauses.push(...args.filters);
  }
  const whereText = whereClauses.length > 0 ? `\nWHERE ${whereClauses.join(' AND ')}` : '';
  const groupByText = dimensions.length > 0 ? `\nGROUP BY ${dimensions.join(', ')}` : '';
  
  const generatedSql = `-- Governed BigQuery Semantic Layer Translation
SELECT 
  ${selectClause}
FROM ${metric.materializedViewSource}${whereText}${groupByText};`;

  const executionTime = Math.max(12, Math.round(Date.now() - startTime + 14));

  return {
    metric_name: args.metric_name,
    metric_display_name: metric.displayName,
    governed_definition: metric.governedDefinition,
    calculated_value: calculatedValue,
    formatted_value: formatMetricValue(calculatedValue, metric.unit),
    unit: metric.unit,
    row_count: breakdown ? breakdown.length : 1,
    breakdown,
    generated_sql: generatedSql,
    view_queried: metric.materializedViewSource,
    execution_time_ms: executionTime,
    filters_applied: args.filters || [],
    dimensions_grouped: dimensions
  };
}

function getMetricSqlColumn(metric: string): string {
  switch (metric) {
    case 'On_Time_Delivery':
      return 'on_time_delivery_pct';
    case 'Fill_Rate':
      return 'fill_rate_pct';
    case 'Days_of_Inventory':
      return 'days_of_inventory';
    case 'Landed_Cost':
      return 'avg_landed_cost_usd';
    default:
      return 'metric_value';
  }
}

export function formatMetricValue(val: number, unit: string): string {
  if (unit === '%') {
    return `${val.toFixed(1)}%`;
  }
  if (unit === 'days') {
    return `${val.toFixed(1)} days`;
  }
  if (unit === '$USD') {
    return `$${val.toFixed(2)}`;
  }
  return val.toString();
}

export const AI_STUDIO_TOOL_DECLARATION = {
  name: "query_governed_metrics",
  description: "Queries the governed supply chain semantic layer. Use this for ANY question requiring supply chain metrics.",
  parameters: {
    type: "OBJECT",
    properties: {
      metric_name: {
        type: "STRING",
        description: "The exact canonical metric to query.",
        enum: ["On_Time_Delivery", "Fill_Rate", "Days_of_Inventory", "Landed_Cost"]
      },
      dimensions: {
        type: "ARRAY",
        items: { 
          type: "STRING",
          enum: ["supplier_name", "part_category", "plant_region", "time_month", "time_quarter"]
        },
        description: "The entities to group by."
      },
      filters: {
        type: "ARRAY",
        items: { type: "STRING" },
        description: "Filtering criteria, e.g., 'supplier_name = Acme Corp' or 'time_quarter = Q3'"
      }
    },
    required: ["metric_name"]
  }
};

export const AI_STUDIO_SYSTEM_INSTRUCTION = `You are the Governed Supply Chain Analytics Assistant. Your purpose is to translate user natural language questions into governed semantic queries using the query_governed_metrics tool.

Ontology Rules:
- If a user asks about "supplier reliability," "delays," or "arriving on schedule," map this to the On_Time_Delivery metric.
- If a user asks about "stockouts," "meeting demand," or "fulfillment," map this to the Fill_Rate metric.
- If a user asks about "capital tied up," "stock levels," or "inventory aging," map this to the Days_of_Inventory metric.
- If a user asks about "total cost," "import costs," or "true cost," map this to Landed_Cost.

Behavioral Guardrails:
- NEVER attempt to calculate a metric yourself. ALWAYS use the query_governed_metrics tool.
- NEVER generate raw SQL.
- If a user asks for a metric not in your semantic schema, inform them that the metric is not currently governed and advise them to request it via the Data Governance team.
- When presenting the data returned by the tool, state the governed definition of the metric so the user understands exactly what is being measured.`;
