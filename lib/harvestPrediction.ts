import { TreeInfo, HarvestPrediction, VarietyHarvestInfo } from "@/types/tree";

// Durian variety harvest data based on agricultural research
export const VARIETY_HARVEST_DATA: VarietyHarvestInfo[] = [
  {
    variety: "Musang King",
    avgCycleMonths: 4,
    peakSeasonStart: 6, // June
    peakSeasonEnd: 8, // August
    avgYieldPerTree: 45,
    maturityAge: 5,
    harvestsPerYear: 2,
  },
  {
    variety: "D24 (Sultan)",
    avgCycleMonths: 5,
    peakSeasonStart: 6,
    peakSeasonEnd: 9,
    avgYieldPerTree: 40,
    maturityAge: 4,
    harvestsPerYear: 2,
  },
  {
    variety: "Black Thorn",
    avgCycleMonths: 4,
    peakSeasonStart: 5,
    peakSeasonEnd: 7,
    avgYieldPerTree: 35,
    maturityAge: 5,
    harvestsPerYear: 2,
  },
  {
    variety: "Red Prawn",
    avgCycleMonths: 5,
    peakSeasonStart: 6,
    peakSeasonEnd: 8,
    avgYieldPerTree: 38,
    maturityAge: 4,
    harvestsPerYear: 2,
  },
  {
    variety: "D101",
    avgCycleMonths: 4,
    peakSeasonStart: 6,
    peakSeasonEnd: 9,
    avgYieldPerTree: 42,
    maturityAge: 4,
    harvestsPerYear: 2,
  },
  {
    variety: "XO",
    avgCycleMonths: 5,
    peakSeasonStart: 6,
    peakSeasonEnd: 8,
    avgYieldPerTree: 36,
    maturityAge: 5,
    harvestsPerYear: 2,
  },
];

// Get variety info or default
function getVarietyInfo(variety: string): VarietyHarvestInfo {
  const found = VARIETY_HARVEST_DATA.find((v) =>
    v.variety.toLowerCase() === variety.toLowerCase()
  );

  // Default for unknown varieties
  return found || {
    variety,
    avgCycleMonths: 5,
    peakSeasonStart: 6,
    peakSeasonEnd: 8,
    avgYieldPerTree: 40,
    maturityAge: 5,
    harvestsPerYear: 2,
  };
}

// Calculate next harvest date based on last harvest
export function predictNextHarvest(tree: TreeInfo): HarvestPrediction | null {
  const varietyInfo = getVarietyInfo(tree.variety);

  // Check if tree is mature enough
  if (tree.treeAge < varietyInfo.maturityAge) {
    return null; // Tree not ready for harvest yet
  }

  // Calculate next harvest date
  const lastHarvest = new Date(tree.lastHarvest);
  const nextDate = new Date(lastHarvest);
  nextDate.setMonth(nextDate.getMonth() + varietyInfo.avgCycleMonths);

  // Determine season type
  const nextMonth = nextDate.getMonth() + 1;
  const isPeakSeason = nextMonth >= varietyInfo.peakSeasonStart &&
                       nextMonth <= varietyInfo.peakSeasonEnd;

  // Calculate confidence based on data quality
  let confidence: "High" | "Medium" | "Low" = "Medium";
  if (tree.lastHarvest && tree.yield) {
    confidence = "High";
  } else if (!tree.lastHarvest) {
    confidence = "Low";
  }

  // Predict yield (adjust for health status)
  let predictedYield = varietyInfo.avgYieldPerTree;
  if (isPeakSeason) predictedYield *= 1.2; // 20% more in peak season

  // Adjust for tree health
  switch (tree.health) {
    case "Excellent":
      predictedYield *= 1.1;
      break;
    case "Good":
      predictedYield *= 1.0;
      break;
    case "Fair":
      predictedYield *= 0.8;
      break;
    case "Needs Attention":
      predictedYield *= 0.6;
      break;
  }

  // Adjust for tree age (peak production at 10-15 years)
  if (tree.treeAge < 7) {
    predictedYield *= 0.7;
  } else if (tree.treeAge > 20) {
    predictedYield *= 0.9;
  }

  // Determine status
  const today = new Date();
  const daysUntil = Math.floor((nextDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  let status: "Upcoming" | "Ready" | "Harvested" | "Missed" = "Upcoming";
  if (daysUntil < -30) {
    status = "Missed";
  } else if (daysUntil <= 7 && daysUntil >= -7) {
    status = "Ready";
  }

  return {
    id: `harvest-${tree.id}-${nextDate.getTime()}`,
    treeId: tree.id,
    treeNo: tree.no || tree.id,
    variety: tree.variety,
    location: tree.location,
    zone: tree.zone,
    predictedDate: nextDate.toISOString().split('T')[0],
    predictedYield: Math.round(predictedYield * 10) / 10,
    confidence,
    basedOn: `Last harvest: ${tree.lastHarvest}, Age: ${tree.treeAge} years, Health: ${tree.health}`,
    seasonType: isPeakSeason ? "Main" : "Off-Season",
    status,
  };
}

// Get all predictions for all trees
export function getAllHarvestPredictions(trees: TreeInfo[]): HarvestPrediction[] {
  return trees
    .map(tree => predictNextHarvest(tree))
    .filter((pred): pred is HarvestPrediction => pred !== null)
    .sort((a, b) => new Date(a.predictedDate).getTime() - new Date(b.predictedDate).getTime());
}

// Get upcoming harvests (next 90 days)
export function getUpcomingHarvests(trees: TreeInfo[], days: number = 90): HarvestPrediction[] {
  const predictions = getAllHarvestPredictions(trees);
  const today = new Date();
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + days);

  return predictions.filter(pred => {
    const predDate = new Date(pred.predictedDate);
    return predDate >= today && predDate <= futureDate;
  });
}

// Get harvests ready now (within 7 days)
export function getReadyHarvests(trees: TreeInfo[]): HarvestPrediction[] {
  return getAllHarvestPredictions(trees).filter(pred => pred.status === "Ready");
}

// Get harvest statistics
export function getHarvestStats(predictions: HarvestPrediction[]) {
  const totalPredictedYield = predictions.reduce((sum, pred) => sum + pred.predictedYield, 0);
  const byVariety = predictions.reduce((acc, pred) => {
    if (!acc[pred.variety]) {
      acc[pred.variety] = { count: 0, totalYield: 0 };
    }
    acc[pred.variety].count++;
    acc[pred.variety].totalYield += pred.predictedYield;
    return acc;
  }, {} as Record<string, { count: number; totalYield: number }>);

  const byMonth = predictions.reduce((acc, pred) => {
    const month = new Date(pred.predictedDate).toLocaleDateString('en-MY', { month: 'short', year: 'numeric' });
    if (!acc[month]) {
      acc[month] = { count: 0, totalYield: 0 };
    }
    acc[month].count++;
    acc[month].totalYield += pred.predictedYield;
    return acc;
  }, {} as Record<string, { count: number; totalYield: number }>);

  return {
    totalPredictions: predictions.length,
    totalPredictedYield: Math.round(totalPredictedYield * 10) / 10,
    readyCount: predictions.filter(p => p.status === "Ready").length,
    upcomingCount: predictions.filter(p => p.status === "Upcoming").length,
    byVariety,
    byMonth,
  };
}

// Get calendar data for a specific month
export function getCalendarData(trees: TreeInfo[], year: number, month: number) {
  const predictions = getAllHarvestPredictions(trees);
  const filtered = predictions.filter(pred => {
    const predDate = new Date(pred.predictedDate);
    return predDate.getFullYear() === year && predDate.getMonth() + 1 === month;
  });

  // Group by date
  const byDate = filtered.reduce((acc, pred) => {
    const date = pred.predictedDate;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(pred);
    return acc;
  }, {} as Record<string, HarvestPrediction[]>);

  return byDate;
}
