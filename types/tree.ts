export interface TreeInfo {
  id: string;
  bil?: number; // Bil (Number/Index)
  no?: string; // No (Tree number)
  variety: string;
  treeAge: number;
  plantedDate: string;
  location: string;
  zone?: string; // Zone/area of the farm
  row?: string; // Row number (Bilau)
  cloneType?: string; // Klonal - clone variety type

  // New measurements (Baru)
  tarikhBaru?: string; // Tarikh Baru (New Date)
  saizKanopiBaru?: string; // Saiz Kanopi Baru (m) - New Canopy Size
  saizUkurLilitBaru?: string; // Saiz Ukur Lilit Baru (cm) - New Circumference

  // Old measurements (Lama)
  tarikhLama?: string; // Tarikh Lama (Old Date)
  saizKanopiLama?: string; // Saiz Kanopi Lama (m) - Old Canopy Size
  saizUkurLilitLama?: string; // Saiz Ukur Lilit Lama (mm) - Old Circumference

  // Fertilizer tracking
  tarikhBaja?: string; // Tarikh Baja - Fertilizer Date
  jenisBaja?: string; // Jenis Baja - Fertilizer Type

  // Pesticide tracking
  tarikhRacun?: string; // Tarikh Racun - Pesticide Date
  jenisRacun?: string; // Jenis Racun - Pesticide Type

  lastFertilized: string;
  fertilizerType: string;
  lastHarvest: string;
  nextExpectedHarvest: string;
  health: "Excellent" | "Good" | "Fair" | "Needs Attention";
  yield: string;
  notes: string;
  updatedAt: string;
  // Monitoring dates
  lastInspectionDate?: string;
  lastPruningDate?: string;
  lastPestControlDate?: string;
  lastWateringDate?: string;
  // Current condition
  currentCondition?: string;
  requiresAttention?: boolean;
  careHistory: TreeCareEvent[];
}

export interface TreeCareEvent {
  id: string;
  date: string;
  eventType: "fertilization" | "pruning" | "pest_control" | "watering" | "harvest" | "inspection" | "soil_test" | "other";
  description: string;
  performedBy: string;
  notes?: string;
}

export interface FarmActivity {
  id: string;
  date: string;
  activity: string;
  description: string;
  performedBy: string;
}

export interface TreeHealthRecord {
  id: string;
  treeId: string;
  treeNo: string;
  variety: string;
  location: string;
  zone?: string;
  row?: string;
  // Health status
  inspectionDate: string;
  healthStatus: "Sihat" | "Sederhana" | "Sakit"; // Healthy, Moderate, Sick
  diseaseType?: string; // Jenis Penyakit/Serangan
  attackLevel?: "Ringan" | "Sederhana" | "Teruk" | ""; // Attack severity: Light, Moderate, Severe
  treatment?: string; // Rawatan/Tindakan Diambil
  notes?: string; // Catatan Tambahan
  photos?: string[]; // Base64 encoded photos
  inspectedBy: string;
  updatedAt: string;
}
