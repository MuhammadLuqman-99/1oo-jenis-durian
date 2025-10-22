import { z } from 'zod';

// Tree validation schema
export const TreeSchema = z.object({
  id: z.string(),
  no: z.string().min(1, "Tree number is required"),
  variety: z.string().min(1, "Variety is required"),
  location: z.string().min(1, "Location is required"),
  zone: z.string().optional(),
  row: z.string().optional(),
  treeAge: z.string().optional(),
  health: z.string().optional(),
  yield: z.string().optional(),
  lastFertilized: z.string().optional(),
  fertilizerType: z.string().optional(),
  lastHarvest: z.string().optional(),
  notes: z.string().optional(),
  // Annual measurements
  tarikhBaru: z.string().optional(),
  saizKanopiBaru: z.string().optional(),
  saizUkurLilitBaru: z.string().optional(),
  tarikhLama: z.string().optional(),
  saizKanopiLama: z.string().optional(),
  saizUkurLilitLama: z.string().optional(),
  // Weekly maintenance
  tarikh: z.string().optional(),
  baja: z.string().optional(),
  jenisBaja: z.string().optional(),
  racun: z.string().optional(),
  jenisRacun: z.string().optional(),
});

// Health record validation schema
export const HealthRecordSchema = z.object({
  treeId: z.string().min(1, "Please select a tree"),
  treeNo: z.string().optional(),
  variety: z.string().optional(),
  location: z.string().optional(),
  zone: z.string().optional(),
  row: z.string().optional(),
  inspectionDate: z.string().min(1, "Inspection date is required"),
  healthStatus: z.enum(["Sihat", "Sederhana", "Sakit"], {
    errorMap: () => ({ message: "Please select a valid health status" }),
  }),
  diseaseType: z.string().optional(),
  attackLevel: z.enum(["", "Ringan", "Sederhana", "Teruk"]).optional(),
  treatment: z.string().optional(),
  notes: z.string().optional(),
  photos: z.array(z.string()).optional(),
  inspectedBy: z.string().min(1, "Inspector name is required"),
});

// Farm activity validation schema
export const FarmActivitySchema = z.object({
  id: z.string(),
  date: z.string().min(1, "Date is required"),
  activity: z.string().min(1, "Activity is required"),
  assignedTo: z.string().min(1, "Assigned person is required"),
  status: z.enum(["Pending", "In Progress", "Completed"]),
  notes: z.string().optional(),
});

// Login validation schema
export const LoginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

// Export report validation schema
export const ExportReportSchema = z.object({
  reportType: z.enum(["tree_inventory", "health_records", "farm_activities", "harvest_records"]),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  format: z.enum(["csv", "json", "pdf"]),
  includePhotos: z.boolean().optional(),
});

// Type exports for TypeScript
export type TreeFormData = z.infer<typeof TreeSchema>;
export type HealthRecordFormData = z.infer<typeof HealthRecordSchema>;
export type FarmActivityFormData = z.infer<typeof FarmActivitySchema>;
export type LoginFormData = z.infer<typeof LoginSchema>;
export type ExportReportFormData = z.infer<typeof ExportReportSchema>;
