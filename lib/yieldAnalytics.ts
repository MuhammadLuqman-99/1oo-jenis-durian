import { TreeInfo, HarvestRecord } from "@/types/tree";

export interface YieldHistory {
  treeId: string;
  treeNo: string;
  variety: string;
  zone?: string;
  harvests: HarvestRecord[];
  totalYield: number;
  avgYieldPerHarvest: number;
  bestHarvest: HarvestRecord | null;
  worstHarvest: HarvestRecord | null;
  trend: "Improving" | "Stable" | "Declining" | "Insufficient Data";
  consistency: number; // 0-100, how consistent yields are
}

export interface VarietyPerformance {
  variety: string;
  treeCount: number;
  totalHarvests: number;
  totalYield: number;
  avgYieldPerTree: number;
  avgYieldPerHarvest: number;
  bestTree: { treeNo: string; yield: number } | null;
  topQualityPercentage: number; // % Premium + Grade A
  trend: "Improving" | "Stable" | "Declining";
}

export interface SeasonalTrend {
  month: string;
  year: number;
  harvestCount: number;
  totalYield: number;
  avgYield: number;
  avgQuality: number; // 1-4 (Premium=4, A=3, B=2, C=1)
}

export interface TopPerformer {
  rank: number;
  treeId: string;
  treeNo: string;
  variety: string;
  zone?: string;
  totalYield: number;
  harvestCount: number;
  avgYieldPerHarvest: number;
  consistency: number;
  qualityScore: number;
  recommendForBreeding: boolean;
  reason: string;
}

// Calculate yield history for a tree
export function getTreeYieldHistory(
  tree: TreeInfo,
  harvests: HarvestRecord[]
): YieldHistory {
  const treeHarvests = harvests
    .filter((h) => h.treeId === tree.id)
    .sort((a, b) => new Date(a.harvestDate).getTime() - new Date(b.harvestDate).getTime());

  const totalYield = treeHarvests.reduce((sum, h) => sum + h.yieldKg, 0);
  const avgYieldPerHarvest =
    treeHarvests.length > 0 ? totalYield / treeHarvests.length : 0;

  const bestHarvest =
    treeHarvests.length > 0
      ? treeHarvests.reduce((best, h) => (h.yieldKg > best.yieldKg ? h : best))
      : null;

  const worstHarvest =
    treeHarvests.length > 0
      ? treeHarvests.reduce((worst, h) => (h.yieldKg < worst.yieldKg ? h : worst))
      : null;

  // Calculate trend (comparing first half vs second half)
  let trend: "Improving" | "Stable" | "Declining" | "Insufficient Data" =
    "Insufficient Data";
  if (treeHarvests.length >= 4) {
    const midPoint = Math.floor(treeHarvests.length / 2);
    const firstHalf = treeHarvests.slice(0, midPoint);
    const secondHalf = treeHarvests.slice(midPoint);

    const firstAvg =
      firstHalf.reduce((sum, h) => sum + h.yieldKg, 0) / firstHalf.length;
    const secondAvg =
      secondHalf.reduce((sum, h) => sum + h.yieldKg, 0) / secondHalf.length;

    const change = ((secondAvg - firstAvg) / firstAvg) * 100;

    if (change > 10) trend = "Improving";
    else if (change < -10) trend = "Declining";
    else trend = "Stable";
  }

  // Calculate consistency (coefficient of variation)
  let consistency = 0;
  if (treeHarvests.length >= 2) {
    const mean = avgYieldPerHarvest;
    const variance =
      treeHarvests.reduce((sum, h) => sum + Math.pow(h.yieldKg - mean, 2), 0) /
      treeHarvests.length;
    const stdDev = Math.sqrt(variance);
    const cv = (stdDev / mean) * 100; // Coefficient of variation
    consistency = Math.max(0, 100 - cv); // Higher is better (more consistent)
  }

  return {
    treeId: tree.id,
    treeNo: tree.no || tree.id,
    variety: tree.variety,
    zone: tree.zone,
    harvests: treeHarvests,
    totalYield,
    avgYieldPerHarvest,
    bestHarvest,
    worstHarvest,
    trend,
    consistency: Math.round(consistency),
  };
}

// Get variety performance comparison
export function getVarietyPerformance(
  trees: TreeInfo[],
  harvests: HarvestRecord[]
): VarietyPerformance[] {
  const varieties = [...new Set(trees.map((t) => t.variety))];

  return varieties
    .map((variety) => {
      const varietyTrees = trees.filter((t) => t.variety === variety);
      const varietyHarvests = harvests.filter((h) => h.variety === variety);

      const totalYield = varietyHarvests.reduce((sum, h) => sum + h.yieldKg, 0);
      const avgYieldPerTree =
        varietyTrees.length > 0 ? totalYield / varietyTrees.length : 0;
      const avgYieldPerHarvest =
        varietyHarvests.length > 0 ? totalYield / varietyHarvests.length : 0;

      // Find best performing tree
      const treeYields = varietyTrees.map((tree) => {
        const treeHarvests = harvests.filter((h) => h.treeId === tree.id);
        const yield_val = treeHarvests.reduce((sum, h) => sum + h.yieldKg, 0);
        return { treeNo: tree.no || tree.id, yield: yield_val };
      });
      const bestTree =
        treeYields.length > 0
          ? treeYields.reduce((best, curr) =>
              curr.yield > best.yield ? curr : best
            )
          : null;

      // Calculate top quality percentage
      const topQualityCount = varietyHarvests.filter(
        (h) => h.quality === "Premium" || h.quality === "Grade A"
      ).length;
      const topQualityPercentage =
        varietyHarvests.length > 0
          ? (topQualityCount / varietyHarvests.length) * 100
          : 0;

      // Calculate trend
      let trend: "Improving" | "Stable" | "Declining" = "Stable";
      if (varietyHarvests.length >= 6) {
        const sorted = [...varietyHarvests].sort(
          (a, b) =>
            new Date(a.harvestDate).getTime() - new Date(b.harvestDate).getTime()
        );
        const midPoint = Math.floor(sorted.length / 2);
        const firstHalf = sorted.slice(0, midPoint);
        const secondHalf = sorted.slice(midPoint);

        const firstAvg =
          firstHalf.reduce((sum, h) => sum + h.yieldKg, 0) / firstHalf.length;
        const secondAvg =
          secondHalf.reduce((sum, h) => sum + h.yieldKg, 0) / secondHalf.length;

        const change = ((secondAvg - firstAvg) / firstAvg) * 100;

        if (change > 10) trend = "Improving";
        else if (change < -10) trend = "Declining";
      }

      return {
        variety,
        treeCount: varietyTrees.length,
        totalHarvests: varietyHarvests.length,
        totalYield,
        avgYieldPerTree,
        avgYieldPerHarvest,
        bestTree,
        topQualityPercentage,
        trend,
      };
    })
    .sort((a, b) => b.avgYieldPerTree - a.avgYieldPerTree);
}

// Get seasonal trends
export function getSeasonalTrends(harvests: HarvestRecord[]): SeasonalTrend[] {
  const monthlyData = harvests.reduce((acc, harvest) => {
    const date = new Date(harvest.harvestDate);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
      2,
      "0"
    )}`;

    if (!acc[key]) {
      acc[key] = {
        month: date.toLocaleDateString("en-MY", {
          month: "short",
          year: "numeric",
        }),
        year: date.getFullYear(),
        harvests: [],
      };
    }

    acc[key].harvests.push(harvest);
    return acc;
  }, {} as Record<string, { month: string; year: number; harvests: HarvestRecord[] }>);

  const qualityMap = { Premium: 4, "Grade A": 3, "Grade B": 2, "Grade C": 1 };

  return Object.values(monthlyData)
    .map((data) => ({
      month: data.month,
      year: data.year,
      harvestCount: data.harvests.length,
      totalYield: data.harvests.reduce((sum, h) => sum + h.yieldKg, 0),
      avgYield:
        data.harvests.reduce((sum, h) => sum + h.yieldKg, 0) / data.harvests.length,
      avgQuality:
        data.harvests.reduce((sum, h) => sum + qualityMap[h.quality], 0) /
        data.harvests.length,
    }))
    .sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return new Date(`${a.month} 1`).getMonth() - new Date(`${b.month} 1`).getMonth();
    });
}

// Get top performing trees for breeding
export function getTopPerformers(
  trees: TreeInfo[],
  harvests: HarvestRecord[],
  limit: number = 20
): TopPerformer[] {
  const performers = trees
    .map((tree) => {
      const history = getTreeYieldHistory(tree, harvests);

      if (history.harvests.length < 2) return null; // Need at least 2 harvests

      // Calculate quality score
      const qualityMap = { Premium: 4, "Grade A": 3, "Grade B": 2, "Grade C": 1 };
      const avgQuality =
        history.harvests.reduce((sum, h) => sum + qualityMap[h.quality], 0) /
        history.harvests.length;
      const qualityScore = (avgQuality / 4) * 100;

      // Determine if recommended for breeding
      const recommendForBreeding =
        history.avgYieldPerHarvest > 40 && // Above average yield
        history.consistency > 70 && // Consistent performer
        qualityScore > 75 && // High quality
        (history.trend === "Improving" || history.trend === "Stable");

      let reason = "";
      if (recommendForBreeding) {
        const reasons = [];
        if (history.avgYieldPerHarvest > 50)
          reasons.push("Exceptional yield");
        if (history.consistency > 80) reasons.push("Very consistent");
        if (qualityScore > 85) reasons.push("Premium quality");
        if (history.trend === "Improving") reasons.push("Improving trend");
        reason = reasons.join(", ");
      } else {
        if (history.avgYieldPerHarvest <= 40) reason = "Below average yield";
        else if (history.consistency <= 70) reason = "Inconsistent performance";
        else if (qualityScore <= 75) reason = "Quality needs improvement";
        else if (history.trend === "Declining") reason = "Declining trend";
      }

      return {
        treeId: tree.id,
        treeNo: tree.no || tree.id,
        variety: tree.variety,
        zone: tree.zone,
        totalYield: history.totalYield,
        harvestCount: history.harvests.length,
        avgYieldPerHarvest: history.avgYieldPerHarvest,
        consistency: history.consistency,
        qualityScore: Math.round(qualityScore),
        recommendForBreeding,
        reason,
      };
    })
    .filter((p): p is TopPerformer => p !== null)
    .sort((a, b) => {
      // Sort by: breeding recommendation, then yield, then consistency
      if (a.recommendForBreeding !== b.recommendForBreeding) {
        return a.recommendForBreeding ? -1 : 1;
      }
      if (Math.abs(a.avgYieldPerHarvest - b.avgYieldPerHarvest) > 5) {
        return b.avgYieldPerHarvest - a.avgYieldPerHarvest;
      }
      return b.consistency - a.consistency;
    })
    .slice(0, limit)
    .map((p, idx) => ({ ...p, rank: idx + 1 }));

  return performers;
}

// Get yield comparison data for charts
export function getYieldComparisonData(
  trees: TreeInfo[],
  harvests: HarvestRecord[]
) {
  return trees.map((tree) => {
    const history = getTreeYieldHistory(tree, harvests);
    return {
      treeNo: tree.no || tree.id,
      variety: tree.variety,
      zone: tree.zone,
      totalYield: history.totalYield,
      avgYield: history.avgYieldPerHarvest,
      harvestCount: history.harvests.length,
      trend: history.trend,
    };
  });
}
