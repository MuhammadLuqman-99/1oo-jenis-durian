import type { TreeInfo } from "@/types/tree";

/**
 * Utility to generate tree data for 500 trees
 * You can customize this template and run it to generate your tree database
 */

const durianVarieties = [
  "Musang King", "Black Thorn", "D24", "Red Prawn", "XO", "Green Bamboo",
  "Golden Phoenix", "Tekka", "D13", "D101", "D88", "D197", "D200",
  "IOI", "Kun Poh", "Goat Milk", "Ang Hae", "D175", "D163", "D99"
];

const blocks = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];

const healthStatuses: Array<"Excellent" | "Good" | "Fair" | "Needs Attention"> = [
  "Excellent", "Good", "Fair", "Needs Attention"
];

const fertilizerTypes = [
  "Organic NPK 15-15-15",
  "Compost Blend",
  "Fish Emulsion",
  "Organic Compound",
  "Premium NPK 10-20-10",
  "Bio-fertilizer Mix"
];

/**
 * Generate a random date within the last N days
 */
function getRandomPastDate(maxDaysAgo: number): string {
  const today = new Date();
  const daysAgo = Math.floor(Math.random() * maxDaysAgo);
  const date = new Date(today.getTime() - (daysAgo * 24 * 60 * 60 * 1000));
  return date.toISOString().split('T')[0];
}

/**
 * Generate a future date within the next N days
 */
function getRandomFutureDate(maxDaysAhead: number): string {
  const today = new Date();
  const daysAhead = Math.floor(Math.random() * maxDaysAhead) + 30; // At least 30 days ahead
  const date = new Date(today.getTime() + (daysAhead * 24 * 60 * 60 * 1000));
  return date.toISOString().split('T')[0];
}

/**
 * Generate planting date based on tree age
 */
function getPlantingDate(yearsOld: number): string {
  const today = new Date();
  const plantDate = new Date(today.getFullYear() - yearsOld,
    Math.floor(Math.random() * 12),
    Math.floor(Math.random() * 28) + 1
  );
  return plantDate.toISOString().split('T')[0];
}

/**
 * Generate a single tree
 */
export function generateTree(index: number): TreeInfo {
  const variety = durianVarieties[Math.floor(Math.random() * durianVarieties.length)];
  const block = blocks[Math.floor(index / 50) % blocks.length]; // 50 trees per block
  const row = Math.floor((index % 50) / 10) + 1; // 10 trees per row
  const position = (index % 10) + 1;

  const treeAge = Math.floor(Math.random() * 20) + 5; // 5-25 years old
  const health = healthStatuses[Math.floor(Math.random() * healthStatuses.length)];

  const treeId = `tree-${String(index + 1).padStart(3, '0')}`;
  const location = `Block ${block}, Row ${row}, Position ${position}`;

  const plantedDate = getPlantingDate(treeAge);
  const lastFertilized = getRandomPastDate(90); // Within last 90 days
  const lastHarvest = getRandomPastDate(180); // Within last 180 days
  const nextExpectedHarvest = getRandomFutureDate(180); // Next 30-180 days

  const yieldAmount = Math.floor(Math.random() * 150) + 50; // 50-200 kg

  return {
    id: treeId,
    variety: variety,
    treeAge: treeAge,
    plantedDate: plantedDate,
    location: location,
    lastFertilized: lastFertilized,
    fertilizerType: fertilizerTypes[Math.floor(Math.random() * fertilizerTypes.length)],
    lastHarvest: lastHarvest,
    nextExpectedHarvest: nextExpectedHarvest,
    health: health,
    yield: `${yieldAmount} kg/year`,
    notes: health === "Needs Attention"
      ? "Requires inspection and care adjustment"
      : health === "Excellent"
      ? "Premium tree in optimal condition"
      : "",
    updatedAt: new Date().toISOString().split('T')[0],
    careHistory: [
      {
        date: plantedDate,
        eventType: "planting",
        description: `${variety} tree planted in ${location}`,
        performedBy: "Farm Manager",
      },
      {
        date: lastFertilized,
        eventType: "fertilization",
        description: `Applied ${fertilizerTypes[Math.floor(Math.random() * fertilizerTypes.length)]}`,
        performedBy: "Farm Team",
      },
      {
        date: lastHarvest,
        eventType: "harvest",
        description: `Harvested approximately ${yieldAmount} kg of premium durians`,
        performedBy: "Harvest Team",
      }
    ]
  };
}

/**
 * Generate all 500 trees
 */
export function generateAllTrees(count: number = 500): TreeInfo[] {
  const trees: TreeInfo[] = [];
  for (let i = 0; i < count; i++) {
    trees.push(generateTree(i));
  }
  return trees;
}

/**
 * Generate trees and output as JSON file content
 */
export function generateTreesJSON(count: number = 500): string {
  const trees = generateAllTrees(count);
  return JSON.stringify(trees, null, 2);
}

/**
 * Generate CSV format for Excel import
 */
export function generateTreesCSV(count: number = 500): string {
  const trees = generateAllTrees(count);

  const headers = [
    "ID", "Variety", "Tree Age", "Planted Date", "Location",
    "Last Fertilized", "Fertilizer Type", "Last Harvest",
    "Next Expected Harvest", "Health", "Yield", "Notes"
  ];

  const rows = trees.map(tree => [
    tree.id,
    tree.variety,
    tree.treeAge,
    tree.plantedDate,
    tree.location,
    tree.lastFertilized,
    tree.fertilizerType,
    tree.lastHarvest,
    tree.nextExpectedHarvest,
    tree.health,
    tree.yield,
    tree.notes
  ]);

  const csv = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  return csv;
}
