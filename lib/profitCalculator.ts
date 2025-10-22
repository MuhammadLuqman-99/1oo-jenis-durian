import { TreeInfo, CostRecord, RevenueRecord, ProfitAnalysis, ZoneProfitAnalysis } from "@/types/tree";

// Calculate profit for a single tree
export function calculateTreeProfit(
  tree: TreeInfo,
  costs: CostRecord[],
  revenues: RevenueRecord[],
  periodStart: string,
  periodEnd: string
): ProfitAnalysis {
  // Filter costs for this tree within period
  const treeCosts = costs.filter((cost) => {
    if (cost.treeId !== tree.id && cost.zone !== tree.zone) return false;
    const costDate = new Date(cost.date);
    return costDate >= new Date(periodStart) && costDate <= new Date(periodEnd);
  });

  // Filter revenues for this tree within period
  const treeRevenues = revenues.filter((rev) => {
    if (rev.treeId !== tree.id) return false;
    const revDate = new Date(rev.harvestDate);
    return revDate >= new Date(periodStart) && revDate <= new Date(periodEnd);
  });

  // Calculate costs by category
  const fertilizerCosts = treeCosts
    .filter((c) => c.category === "Fertilizer")
    .reduce((sum, c) => sum + c.amount, 0);

  const pesticideCosts = treeCosts
    .filter((c) => c.category === "Pesticide")
    .reduce((sum, c) => sum + c.amount, 0);

  const laborCosts = treeCosts
    .filter((c) => c.category === "Labor")
    .reduce((sum, c) => sum + c.amount, 0);

  const otherCosts = treeCosts
    .filter((c) => !["Fertilizer", "Pesticide", "Labor"].includes(c.category))
    .reduce((sum, c) => sum + c.amount, 0);

  const totalCosts = fertilizerCosts + pesticideCosts + laborCosts + otherCosts;

  // Calculate revenue
  const totalRevenue = treeRevenues.reduce((sum, r) => sum + r.totalRevenue, 0);
  const totalYieldKg = treeRevenues.reduce((sum, r) => sum + r.yieldKg, 0);
  const avgPricePerKg = totalYieldKg > 0 ? totalRevenue / totalYieldKg : 0;

  // Calculate profit
  const netProfit = totalRevenue - totalCosts;
  const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;
  const roi = totalCosts > 0 ? (netProfit / totalCosts) * 100 : 0;

  return {
    treeId: tree.id,
    treeNo: tree.no || tree.id,
    variety: tree.variety,
    zone: tree.zone,
    totalCosts,
    fertilizerCosts,
    pesticideCosts,
    laborCosts,
    otherCosts,
    totalRevenue,
    totalYieldKg,
    avgPricePerKg,
    netProfit,
    profitMargin,
    roi,
    periodStart,
    periodEnd,
  };
}

// Calculate profit for all trees
export function calculateAllTreeProfits(
  trees: TreeInfo[],
  costs: CostRecord[],
  revenues: RevenueRecord[],
  periodStart: string,
  periodEnd: string
): ProfitAnalysis[] {
  return trees
    .map((tree) => calculateTreeProfit(tree, costs, revenues, periodStart, periodEnd))
    .sort((a, b) => b.netProfit - a.netProfit); // Sort by profit descending
}

// Calculate profit by zone
export function calculateZoneProfits(
  trees: TreeInfo[],
  costs: CostRecord[],
  revenues: RevenueRecord[],
  periodStart: string,
  periodEnd: string
): ZoneProfitAnalysis[] {
  const zones = [...new Set(trees.map((t) => t.zone).filter(Boolean))];

  return zones.map((zone) => {
    const zoneTrees = trees.filter((t) => t.zone === zone);
    const zoneProfits = zoneTrees.map((tree) =>
      calculateTreeProfit(tree, costs, revenues, periodStart, periodEnd)
    );

    const totalCosts = zoneProfits.reduce((sum, p) => sum + p.totalCosts, 0);
    const totalRevenue = zoneProfits.reduce((sum, p) => sum + p.totalRevenue, 0);
    const netProfit = totalRevenue - totalCosts;
    const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;
    const avgProfitPerTree = zoneTrees.length > 0 ? netProfit / zoneTrees.length : 0;

    // Find top variety by profit
    const varietyProfits = zoneProfits.reduce((acc, p) => {
      if (!acc[p.variety]) {
        acc[p.variety] = 0;
      }
      acc[p.variety] += p.netProfit;
      return acc;
    }, {} as Record<string, number>);

    const topVariety = Object.entries(varietyProfits).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";

    return {
      zone: zone!,
      treeCount: zoneTrees.length,
      totalCosts,
      totalRevenue,
      netProfit,
      profitMargin,
      avgProfitPerTree,
      topVariety,
    };
  }).sort((a, b) => b.netProfit - a.netProfit);
}

// Calculate profit by variety
export function calculateVarietyProfits(
  trees: TreeInfo[],
  costs: CostRecord[],
  revenues: RevenueRecord[],
  periodStart: string,
  periodEnd: string
) {
  const varieties = [...new Set(trees.map((t) => t.variety))];

  return varieties.map((variety) => {
    const varietyTrees = trees.filter((t) => t.variety === variety);
    const varietyProfits = varietyTrees.map((tree) =>
      calculateTreeProfit(tree, costs, revenues, periodStart, periodEnd)
    );

    const totalCosts = varietyProfits.reduce((sum, p) => sum + p.totalCosts, 0);
    const totalRevenue = varietyProfits.reduce((sum, p) => sum + p.totalRevenue, 0);
    const netProfit = totalRevenue - totalCosts;
    const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;
    const avgProfitPerTree = varietyTrees.length > 0 ? netProfit / varietyTrees.length : 0;
    const totalYield = varietyProfits.reduce((sum, p) => sum + p.totalYieldKg, 0);

    return {
      variety,
      treeCount: varietyTrees.length,
      totalCosts,
      totalRevenue,
      netProfit,
      profitMargin,
      avgProfitPerTree,
      totalYield,
      avgYieldPerTree: varietyTrees.length > 0 ? totalYield / varietyTrees.length : 0,
    };
  }).sort((a, b) => b.netProfit - a.netProfit);
}

// Get overall farm statistics
export function getFarmFinancialStats(
  costs: CostRecord[],
  revenues: RevenueRecord[],
  periodStart: string,
  periodEnd: string
) {
  // Filter by period
  const periodCosts = costs.filter((c) => {
    const date = new Date(c.date);
    return date >= new Date(periodStart) && date <= new Date(periodEnd);
  });

  const periodRevenues = revenues.filter((r) => {
    const date = new Date(r.harvestDate);
    return date >= new Date(periodStart) && date <= new Date(periodEnd);
  });

  const totalCosts = periodCosts.reduce((sum, c) => sum + c.amount, 0);
  const totalRevenue = periodRevenues.reduce((sum, r) => sum + r.totalRevenue, 0);
  const netProfit = totalRevenue - totalCosts;
  const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;
  const roi = totalCosts > 0 ? (netProfit / totalCosts) * 100 : 0;

  // Cost breakdown
  const costsByCategory = periodCosts.reduce((acc, cost) => {
    if (!acc[cost.category]) {
      acc[cost.category] = 0;
    }
    acc[cost.category] += cost.amount;
    return acc;
  }, {} as Record<string, number>);

  // Revenue by quality
  const revenueByQuality = periodRevenues.reduce((acc, rev) => {
    if (!acc[rev.quality]) {
      acc[rev.quality] = 0;
    }
    acc[rev.quality] += rev.totalRevenue;
    return acc;
  }, {} as Record<string, number>);

  return {
    totalCosts,
    totalRevenue,
    netProfit,
    profitMargin,
    roi,
    costsByCategory,
    revenueByQuality,
    periodStart,
    periodEnd,
  };
}

// Get top performing trees
export function getTopPerformingTrees(
  trees: TreeInfo[],
  costs: CostRecord[],
  revenues: RevenueRecord[],
  periodStart: string,
  periodEnd: string,
  limit: number = 10
): ProfitAnalysis[] {
  const allProfits = calculateAllTreeProfits(trees, costs, revenues, periodStart, periodEnd);
  return allProfits.slice(0, limit);
}

// Get underperforming trees (losses or low profit)
export function getUnderperformingTrees(
  trees: TreeInfo[],
  costs: CostRecord[],
  revenues: RevenueRecord[],
  periodStart: string,
  periodEnd: string,
  limit: number = 10
): ProfitAnalysis[] {
  const allProfits = calculateAllTreeProfits(trees, costs, revenues, periodStart, periodEnd);
  return allProfits
    .filter((p) => p.netProfit < 0 || p.roi < 10) // Loss or ROI < 10%
    .slice(0, limit);
}

// Format currency
export function formatCurrency(amount: number): string {
  return `RM ${amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
}

// Format percentage
export function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`;
}
