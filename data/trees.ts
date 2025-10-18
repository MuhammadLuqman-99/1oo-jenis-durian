import { TreeInfo, FarmActivity } from "@/types/tree";

// Sample tree data - In production, this would come from a database
export const treesData: TreeInfo[] = [
  {
    id: "tree-001",
    bil: 1,
    no: "10/0005/0001",
    variety: "Musang King (D197)",
    treeAge: 25,
    plantedDate: "1999-03-15",
    location: "Block A, Row 3",
    zone: "ZON HIJAU",
    row: "B003",
    cloneType: "D197-CLONE-A",
    // New measurements
    tarikhBaru: "2024-10-15",
    saizKanopiBaru: "8.5",
    saizUkurLilitBaru: "125",
    // Old measurements
    tarikhLama: "2024-01-15",
    saizKanopiLama: "7.8",
    saizUkurLilitLama: "1180",
    // Fertilizer
    tarikhBaja: "2024-09-10",
    jenisBaja: "NPK 15-15-15 (Organic)",
    // Pesticide
    tarikhRacun: "2024-09-05",
    jenisRacun: "Neem Oil (Natural)",
    lastFertilized: "2024-09-10",
    fertilizerType: "Organic Compound (NPK 15-15-15)",
    lastHarvest: "2024-07-20",
    nextExpectedHarvest: "2025-01-15",
    health: "Excellent",
    yield: "150-180 kg/year",
    notes: "Premium tree with consistent high-quality yield",
    updatedAt: "2024-10-14",
    lastInspectionDate: "2024-10-10",
    lastPruningDate: "2024-08-15",
    lastPestControlDate: "2024-09-10",
    lastWateringDate: "2024-10-14",
    currentCondition: "Flowering",
    requiresAttention: false,
    careHistory: [
      {
        id: "evt-001",
        date: "2024-10-10",
        eventType: "inspection",
        description: "Monthly health inspection completed",
        performedBy: "Farm Manager",
        notes: "Tree showing excellent health, no issues detected"
      },
      {
        id: "evt-002",
        date: "2024-09-10",
        eventType: "fertilization",
        description: "Applied organic NPK fertilizer",
        performedBy: "Agriculture Team",
        notes: "Used 5kg of organic compound fertilizer"
      },
      {
        id: "evt-003",
        date: "2024-08-15",
        eventType: "pruning",
        description: "Trimmed excess branches for better air circulation",
        performedBy: "Farm Manager",
        notes: "Removed 3 dead branches"
      },
      {
        id: "evt-004",
        date: "2024-07-20",
        eventType: "harvest",
        description: "Harvested 45 premium durians",
        performedBy: "Harvest Team",
        notes: "Total yield: 165kg, all fruits Grade A"
      },
      {
        id: "evt-005",
        date: "2024-06-12",
        eventType: "fertilization",
        description: "Applied organic NPK fertilizer",
        performedBy: "Agriculture Team",
        notes: "Regular fertilization schedule"
      },
      {
        id: "evt-006",
        date: "2024-05-18",
        eventType: "pest_control",
        description: "Natural pest control with neem oil",
        performedBy: "Agriculture Team",
        notes: "Preventive measure, no pest detected"
      }
    ]
  },
  {
    id: "tree-002",
    bil: 2,
    no: "10/0005/0002",
    variety: "Black Thorn (D200)",
    treeAge: 22,
    plantedDate: "2002-06-20",
    location: "Block B, Row 5",
    zone: "ZON HIJAU",
    row: "B005",
    cloneType: "D200-CLONE-B",
    // New measurements
    tarikhBaru: "2024-10-14",
    saizKanopiBaru: "7.2",
    saizUkurLilitBaru: "118",
    // Old measurements
    tarikhLama: "2024-02-10",
    saizKanopiLama: "6.9",
    saizUkurLilitLama: "1140",
    // Fertilizer
    tarikhBaja: "2024-09-15",
    jenisBaja: "Organic Compost + Micronutrients",
    // Pesticide
    tarikhRacun: "2024-08-20",
    jenisRacun: "Bacillus thuringiensis",
    lastFertilized: "2024-09-15",
    fertilizerType: "Organic Compost with Micronutrients",
    lastHarvest: "2024-08-05",
    nextExpectedHarvest: "2025-02-10",
    health: "Excellent",
    yield: "120-150 kg/year",
    notes: "Exceptional fruit quality, high demand variety",
    updatedAt: "2024-10-14",
    lastInspectionDate: "2024-10-12",
    lastPruningDate: "2024-08-20",
    lastPestControlDate: "2024-09-08",
    lastWateringDate: "2024-10-13",
    currentCondition: "Fruiting",
    requiresAttention: false,
    careHistory: [
      {
        id: "evt-101",
        date: "2024-09-15",
        eventType: "fertilization",
        description: "Applied organic compost with micronutrients",
        performedBy: "Agriculture Team",
        notes: "Special formula for Black Thorn variety"
      },
      {
        id: "evt-102",
        date: "2024-08-25",
        eventType: "soil_test",
        description: "Soil analysis for nutrient levels",
        performedBy: "Lab Technician",
        notes: "pH optimal at 6.5, all nutrients balanced"
      },
      {
        id: "evt-103",
        date: "2024-08-05",
        eventType: "harvest",
        description: "Harvested 38 Black Thorn durians",
        performedBy: "Harvest Team",
        notes: "Total yield: 142kg, exceptional quality"
      }
    ]
  },
  {
    id: "tree-003",
    bil: 3,
    no: "10/0005/0003",
    variety: "D24",
    treeAge: 30,
    plantedDate: "1994-04-10",
    location: "Block A, Row 1",
    zone: "ZON HIJAU",
    row: "B001",
    cloneType: "D24-ORIGINAL",
    // New measurements
    tarikhBaru: "2024-10-12",
    saizKanopiBaru: "9.8",
    saizUkurLilitBaru: "142",
    // Old measurements
    tarikhLama: "2024-03-05",
    saizKanopiLama: "9.5",
    saizUkurLilitLama: "1380",
    // Fertilizer
    tarikhBaja: "2024-09-05",
    jenisBaja: "NPK 15-15-15 + Fish Emulsion",
    // Pesticide
    tarikhRacun: "2024-07-15",
    jenisRacun: "Pyrethrin (Organic)",
    lastFertilized: "2024-09-05",
    fertilizerType: "Organic Compound (NPK 15-15-15)",
    lastHarvest: "2024-07-15",
    nextExpectedHarvest: "2024-12-20",
    health: "Good",
    yield: "200-250 kg/year",
    notes: "Mature tree with high productivity",
    updatedAt: "2024-10-14",
    lastInspectionDate: "2024-10-11",
    lastPruningDate: "2024-08-10",
    lastPestControlDate: "2024-09-05",
    lastWateringDate: "2024-10-14",
    currentCondition: "Dormant",
    requiresAttention: false,
    careHistory: [
      {
        id: "evt-201",
        date: "2024-09-20",
        eventType: "watering",
        description: "Deep watering during dry season",
        performedBy: "Farm Manager",
        notes: "Extra care during hot weather"
      },
      {
        id: "evt-202",
        date: "2024-09-05",
        eventType: "fertilization",
        description: "Regular organic fertilization",
        performedBy: "Agriculture Team",
        notes: "Mature tree maintenance program"
      },
      {
        id: "evt-203",
        date: "2024-07-15",
        eventType: "harvest",
        description: "Major harvest of 60+ durians",
        performedBy: "Harvest Team",
        notes: "Excellent yield: 238kg total"
      }
    ]
  },
  {
    id: "tree-004",
    bil: 4,
    no: "10/0005/0004",
    variety: "Red Prawn (D175)",
    treeAge: 18,
    plantedDate: "2006-08-25",
    location: "Block C, Row 2",
    zone: "ZON KUNING",
    row: "B002",
    cloneType: "D175-CLONE-C",
    // New measurements
    tarikhBaru: "2024-10-11",
    saizKanopiBaru: "6.5",
    saizUkurLilitBaru: "95",
    // Old measurements
    tarikhLama: "2024-04-18",
    saizKanopiLama: "6.2",
    saizUkurLilitLama: "920",
    // Fertilizer
    tarikhBaja: "2024-09-12",
    jenisBaja: "Seaweed Extract + Fish Emulsion",
    // Pesticide
    tarikhRacun: "2024-08-30",
    jenisRacun: "Insecticidal Soap",
    lastFertilized: "2024-09-12",
    fertilizerType: "Fish Emulsion & Seaweed Extract",
    lastHarvest: "2024-08-20",
    nextExpectedHarvest: "2025-01-25",
    health: "Excellent",
    yield: "100-130 kg/year",
    notes: "Known for distinctive color and flavor",
    updatedAt: "2024-10-14",
    lastInspectionDate: "2024-10-09",
    lastPruningDate: "2024-08-25",
    lastPestControlDate: "2024-09-12",
    lastWateringDate: "2024-10-13",
    currentCondition: "Healthy Growth",
    requiresAttention: false,
    careHistory: [
      {
        id: "evt-301",
        date: "2024-09-12",
        eventType: "fertilization",
        description: "Applied fish emulsion and seaweed extract",
        performedBy: "Agriculture Team",
        notes: "Organic marine-based fertilizer program"
      },
      {
        id: "evt-302",
        date: "2024-08-20",
        eventType: "harvest",
        description: "Harvested distinctive red-flesh durians",
        performedBy: "Harvest Team",
        notes: "28 fruits, 115kg total, premium color"
      },
      {
        id: "evt-303",
        date: "2024-07-30",
        eventType: "inspection",
        description: "Quality check for color development",
        performedBy: "Farm Manager",
        notes: "Excellent red-orange flesh development"
      }
    ]
  },
];

// Sample farm activities - In production, this would come from a database
export const farmActivities: FarmActivity[] = [
  {
    id: "act-001",
    date: "2024-10-10",
    activity: "Fertilization",
    description: "Applied organic compound fertilizer to Block A trees",
    performedBy: "Farm Manager",
  },
  {
    id: "act-002",
    date: "2024-10-08",
    activity: "Pest Control",
    description: "Natural pest control using neem oil spray",
    performedBy: "Agriculture Team",
  },
  {
    id: "act-003",
    date: "2024-10-05",
    activity: "Soil Testing",
    description: "Monthly soil pH and nutrient analysis completed",
    performedBy: "Lab Technician",
  },
  {
    id: "act-004",
    date: "2024-10-01",
    activity: "Pruning",
    description: "Selective pruning for better air circulation and sunlight",
    performedBy: "Farm Manager",
  },
  {
    id: "act-005",
    date: "2024-09-28",
    activity: "Irrigation",
    description: "Upgraded drip irrigation system in Block C",
    performedBy: "Maintenance Team",
  },
];
