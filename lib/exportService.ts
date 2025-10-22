import {
  TreeInfo,
  TreeHealthRecord,
  HarvestRecord,
  CostRecord,
  RevenueRecord,
  InventoryItem,
  ScheduledTask,
  ReportTemplate,
  ExportOptions,
  GeneratedReport,
  CertificationData,
  InsuranceClaimData,
} from "@/types/tree";

// Default report templates
const defaultTemplates: ReportTemplate[] = [
  {
    id: "template-farm-overview",
    name: "Farm Overview Report",
    description: "Complete farm status including trees, health, and performance",
    type: "Farm Overview",
    format: "PDF",
    sections: ["Farm Details", "Tree Inventory", "Health Summary", "Recent Activity"],
    includeCharts: true,
    includePhotos: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: "template-harvest",
    name: "Harvest Summary Report",
    description: "Detailed harvest data and yield analysis",
    type: "Harvest Summary",
    format: "Excel",
    sections: ["Harvest Data", "Yield by Variety", "Quality Breakdown", "Revenue"],
    includeCharts: true,
    includePhotos: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: "template-financial",
    name: "Financial Report",
    description: "Income, expenses, and profit analysis",
    type: "Financial",
    format: "PDF",
    sections: ["Revenue", "Costs", "Profit Analysis", "ROI"],
    includeCharts: true,
    includePhotos: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: "template-health",
    name: "Tree Health Report",
    description: "Health records and disease tracking",
    type: "Tree Health",
    format: "PDF",
    sections: ["Health Overview", "Disease Records", "Treatment History", "Recommendations"],
    includeCharts: false,
    includePhotos: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "template-certification",
    name: "Certification Documentation",
    description: "Farm certification and compliance data",
    type: "Certification",
    format: "PDF",
    sections: ["Farm Details", "Compliance", "Practices", "Quality Grades"],
    includeCharts: false,
    includePhotos: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: "template-insurance",
    name: "Insurance Claim Report",
    description: "Documentation for insurance claims",
    type: "Insurance",
    format: "PDF",
    sections: ["Claim Details", "Damage Assessment", "Financial Impact", "Evidence"],
    includeCharts: false,
    includePhotos: true,
    createdAt: new Date().toISOString(),
  },
];

// Get report templates
export function getReportTemplates(): ReportTemplate[] {
  if (typeof window === "undefined") return defaultTemplates;

  const stored = localStorage.getItem("report_templates");
  if (!stored) {
    localStorage.setItem("report_templates", JSON.stringify(defaultTemplates));
    return defaultTemplates;
  }

  return JSON.parse(stored);
}

// Generate CSV data
export function generateCSV(
  data: any[],
  headers: string[],
  filename: string
): string {
  const csvContent = [
    headers.join(","),
    ...data.map((row) =>
      headers.map((header) => {
        const value = row[header] || "";
        // Escape commas and quotes
        return typeof value === "string" && (value.includes(",") || value.includes('"'))
          ? `"${value.replace(/"/g, '""')}"`
          : value;
      }).join(",")
    ),
  ].join("\n");

  return csvContent;
}

// Generate JSON data
export function generateJSON(data: any, filename: string): string {
  return JSON.stringify(data, null, 2);
}

// Generate Farm Overview Report Data
export function generateFarmOverviewData(
  trees: TreeInfo[],
  healthRecords: TreeHealthRecord[],
  harvests: HarvestRecord[],
  costs: CostRecord[],
  revenues: RevenueRecord[]
) {
  const totalTrees = trees.length;
  const varieties = [...new Set(trees.map((t) => t.variety))];
  const zones = [...new Set(trees.map((t) => t.zone).filter(Boolean))];

  // Health statistics
  const healthyTrees = healthRecords.filter((r) => r.healthStatus === "Sihat").length;
  const sickTrees = healthRecords.filter((r) => r.healthStatus === "Sakit").length;

  // Harvest statistics
  const totalHarvests = harvests.length;
  const totalYield = harvests.reduce((sum, h) => sum + h.yieldKg, 0);
  const avgYield = totalHarvests > 0 ? totalYield / totalHarvests : 0;

  // Financial statistics
  const totalCosts = costs.reduce((sum, c) => sum + c.amount, 0);
  const totalRevenue = revenues.reduce((sum, r) => sum + r.totalRevenue, 0);
  const netProfit = totalRevenue - totalCosts;

  return {
    farmSummary: {
      totalTrees,
      varieties: varieties.length,
      zones: zones.length,
      healthyPercentage: totalTrees > 0 ? (healthyTrees / totalTrees) * 100 : 0,
    },
    treeInventory: trees.map((t) => ({
      id: t.no || t.id,
      variety: t.variety,
      zone: t.zone || "N/A",
      age: t.treeAge,
      health: trees.find((tr) => tr.id === t.id) ? "Healthy" : "Unknown",
    })),
    healthSummary: {
      total: healthRecords.length,
      healthy: healthyTrees,
      sick: sickTrees,
      percentage: totalTrees > 0 ? (healthyTrees / totalTrees) * 100 : 0,
    },
    harvestSummary: {
      totalHarvests,
      totalYield: totalYield.toFixed(1),
      avgYield: avgYield.toFixed(1),
    },
    financialSummary: {
      totalRevenue: totalRevenue.toFixed(2),
      totalCosts: totalCosts.toFixed(2),
      netProfit: netProfit.toFixed(2),
      profitMargin: totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : "0",
    },
  };
}

// Generate Harvest Report Data
export function generateHarvestReportData(
  harvests: HarvestRecord[],
  dateRange: { start: string; end: string }
) {
  const filtered = harvests.filter(
    (h) => h.harvestDate >= dateRange.start && h.harvestDate <= dateRange.end
  );

  const totalYield = filtered.reduce((sum, h) => sum + h.yieldKg, 0);
  const totalRevenue = filtered.reduce((sum, h) => sum + (h.totalRevenue || 0), 0);

  const byVariety = filtered.reduce((acc, h) => {
    if (!acc[h.variety]) {
      acc[h.variety] = { count: 0, yield: 0, revenue: 0 };
    }
    acc[h.variety].count++;
    acc[h.variety].yield += h.yieldKg;
    acc[h.variety].revenue += h.totalRevenue || 0;
    return acc;
  }, {} as Record<string, { count: number; yield: number; revenue: number }>);

  const byQuality = filtered.reduce((acc, h) => {
    acc[h.quality] = (acc[h.quality] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return {
    summary: {
      totalHarvests: filtered.length,
      totalYield: totalYield.toFixed(1),
      avgYieldPerHarvest: filtered.length > 0 ? (totalYield / filtered.length).toFixed(1) : "0",
      totalRevenue: totalRevenue.toFixed(2),
      dateRange,
    },
    byVariety: Object.entries(byVariety).map(([variety, data]) => ({
      variety,
      harvests: data.count,
      totalYield: data.yield.toFixed(1),
      avgYield: (data.yield / data.count).toFixed(1),
      revenue: data.revenue.toFixed(2),
    })),
    byQuality: Object.entries(byQuality).map(([quality, count]) => ({
      quality,
      count,
      percentage: ((count / filtered.length) * 100).toFixed(1),
    })),
    harvests: filtered.map((h) => ({
      date: h.harvestDate,
      treeNo: h.treeNo,
      variety: h.variety,
      yield: h.yieldKg,
      quality: h.quality,
      revenue: h.totalRevenue?.toFixed(2) || "0",
    })),
  };
}

// Generate Financial Report Data
export function generateFinancialReportData(
  costs: CostRecord[],
  revenues: RevenueRecord[],
  dateRange: { start: string; end: string }
) {
  const filteredCosts = costs.filter(
    (c) => c.date >= dateRange.start && c.date <= dateRange.end
  );
  const filteredRevenues = revenues.filter(
    (r) => r.harvestDate >= dateRange.start && r.harvestDate <= dateRange.end
  );

  const totalCosts = filteredCosts.reduce((sum, c) => sum + c.amount, 0);
  const totalRevenue = filteredRevenues.reduce((sum, r) => sum + r.totalRevenue, 0);
  const netProfit = totalRevenue - totalCosts;
  const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;
  const roi = totalCosts > 0 ? (netProfit / totalCosts) * 100 : 0;

  const costsByCategory = filteredCosts.reduce((acc, c) => {
    acc[c.category] = (acc[c.category] || 0) + c.amount;
    return acc;
  }, {} as Record<string, number>);

  const revenueByVariety = filteredRevenues.reduce((acc, r) => {
    acc[r.variety] = (acc[r.variety] || 0) + r.totalRevenue;
    return acc;
  }, {} as Record<string, number>);

  return {
    summary: {
      totalRevenue: totalRevenue.toFixed(2),
      totalCosts: totalCosts.toFixed(2),
      netProfit: netProfit.toFixed(2),
      profitMargin: profitMargin.toFixed(1),
      roi: roi.toFixed(1),
      dateRange,
    },
    costBreakdown: Object.entries(costsByCategory).map(([category, amount]) => ({
      category,
      amount: amount.toFixed(2),
      percentage: ((amount / totalCosts) * 100).toFixed(1),
    })),
    revenueByVariety: Object.entries(revenueByVariety).map(([variety, amount]) => ({
      variety,
      amount: amount.toFixed(2),
      percentage: ((amount / totalRevenue) * 100).toFixed(1),
    })),
  };
}

// Generate Tree Health Report Data
export function generateHealthReportData(
  trees: TreeInfo[],
  healthRecords: TreeHealthRecord[],
  dateRange: { start: string; end: string }
) {
  const filtered = healthRecords.filter(
    (r) => r.inspectionDate >= dateRange.start && r.inspectionDate <= dateRange.end
  );

  const byStatus = filtered.reduce((acc, r) => {
    acc[r.healthStatus] = (acc[r.healthStatus] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const diseaseRecords = filtered.filter((r) => r.diseaseType);

  const byDisease = diseaseRecords.reduce((acc, r) => {
    const disease = r.diseaseType || "Unknown";
    if (!acc[disease]) {
      acc[disease] = { count: 0, severity: {} };
    }
    acc[disease].count++;
    const level = r.attackLevel || "Unknown";
    acc[disease].severity[level] = (acc[disease].severity[level] || 0) + 1;
    return acc;
  }, {} as Record<string, { count: number; severity: Record<string, number> }>);

  return {
    summary: {
      totalInspections: filtered.length,
      healthyTrees: byStatus["Sihat"] || 0,
      sickTrees: byStatus["Sakit"] || 0,
      moderateTrees: byStatus["Sederhana"] || 0,
      diseaseOutbreaks: Object.keys(byDisease).length,
    },
    statusBreakdown: Object.entries(byStatus).map(([status, count]) => ({
      status,
      count,
      percentage: ((count / filtered.length) * 100).toFixed(1),
    })),
    diseaseBreakdown: Object.entries(byDisease).map(([disease, data]) => ({
      disease,
      affectedTrees: data.count,
      severity: data.severity,
    })),
    records: filtered.map((r) => ({
      date: r.inspectionDate,
      treeNo: r.treeNo,
      variety: r.variety,
      status: r.healthStatus,
      disease: r.diseaseType || "None",
      attackLevel: r.attackLevel || "N/A",
      treatment: r.treatment || "None",
    })),
  };
}

// Download as CSV
export function downloadCSV(content: string, filename: string): void {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}.csv`);
  link.style.visibility = "hidden";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Download as JSON
export function downloadJSON(content: string, filename: string): void {
  const blob = new Blob([content], { type: "application/json;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}.json`);
  link.style.visibility = "hidden";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Generate and download report
export function generateReport(
  type: ReportTemplate["type"],
  format: "CSV" | "JSON",
  trees: TreeInfo[],
  healthRecords: TreeHealthRecord[],
  harvests: HarvestRecord[],
  costs: CostRecord[],
  revenues: RevenueRecord[],
  dateRange: { start: string; end: string }
): GeneratedReport {
  let data: any;
  let filename: string;

  const now = new Date();
  const dateStr = now.toISOString().split("T")[0];

  switch (type) {
    case "Farm Overview":
      data = generateFarmOverviewData(trees, healthRecords, harvests, costs, revenues);
      filename = `farm-overview-${dateStr}`;
      break;

    case "Harvest Summary":
      data = generateHarvestReportData(harvests, dateRange);
      filename = `harvest-summary-${dateStr}`;
      break;

    case "Financial":
      data = generateFinancialReportData(costs, revenues, dateRange);
      filename = `financial-report-${dateStr}`;
      break;

    case "Tree Health":
      data = generateHealthReportData(trees, healthRecords, dateRange);
      filename = `health-report-${dateStr}`;
      break;

    default:
      data = { message: "Report type not implemented yet" };
      filename = `report-${dateStr}`;
  }

  let content: string;
  let downloadUrl: string;

  if (format === "CSV") {
    // For CSV, flatten the data structure
    const flatData = Array.isArray(data) ? data : [data];
    const headers = Object.keys(flatData[0] || {});
    content = generateCSV(flatData, headers, filename);
    downloadCSV(content, filename);
    downloadUrl = "downloaded";
  } else {
    content = generateJSON(data, filename);
    downloadJSON(content, filename);
    downloadUrl = "downloaded";
  }

  const totalRevenue = revenues
    .filter((r) => r.harvestDate >= dateRange.start && r.harvestDate <= dateRange.end)
    .reduce((sum, r) => sum + r.totalRevenue, 0);

  const totalCosts = costs
    .filter((c) => c.date >= dateRange.start && c.date <= dateRange.end)
    .reduce((sum, c) => sum + c.amount, 0);

  return {
    id: `report-${Date.now()}`,
    title: `${type} - ${dateStr}`,
    type,
    format,
    generatedAt: now.toISOString(),
    generatedBy: localStorage.getItem("adminUser") || "Admin",
    dateRange,
    fileSize: new Blob([content]).size,
    downloadUrl,
    summary: {
      totalTrees: trees.length,
      totalHarvests: harvests.filter(
        (h) => h.harvestDate >= dateRange.start && h.harvestDate <= dateRange.end
      ).length,
      totalRevenue,
      totalCosts,
      netProfit: totalRevenue - totalCosts,
    },
  };
}

// Get report history
export function getReportHistory(): GeneratedReport[] {
  if (typeof window === "undefined") return [];

  const stored = localStorage.getItem("report_history");
  if (!stored) return [];

  return JSON.parse(stored);
}

// Save report to history
export function saveReportToHistory(report: GeneratedReport): void {
  if (typeof window === "undefined") return;

  const history = getReportHistory();
  history.unshift(report); // Add to beginning

  // Keep only last 50 reports
  const trimmed = history.slice(0, 50);

  localStorage.setItem("report_history", JSON.stringify(trimmed));
}
