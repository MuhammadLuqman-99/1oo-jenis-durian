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

export interface HarvestPrediction {
  id: string;
  treeId: string;
  treeNo: string;
  variety: string;
  location: string;
  zone?: string;
  predictedDate: string;
  predictedYield: number; // kg
  confidence: "High" | "Medium" | "Low";
  basedOn: string; // What data was used for prediction
  seasonType: "Main" | "Off-Season";
  status: "Upcoming" | "Ready" | "Harvested" | "Missed";
  actualHarvestDate?: string;
  actualYield?: number;
  notes?: string;
}

export interface HarvestRecord {
  id: string;
  treeId: string;
  treeNo: string;
  variety: string;
  harvestDate: string;
  yieldKg: number;
  quality: "Premium" | "Grade A" | "Grade B" | "Grade C";
  fruitCount: number;
  notes?: string;
  harvestedBy: string;
  weatherCondition?: string;
  price?: number; // RM per kg
  totalRevenue?: number;
}

// Variety-specific harvest data
export interface VarietyHarvestInfo {
  variety: string;
  avgCycleMonths: number; // Average months between harvests
  peakSeasonStart: number; // Month (1-12)
  peakSeasonEnd: number; // Month (1-12)
  avgYieldPerTree: number; // kg
  maturityAge: number; // Years before first harvest
  harvestsPerYear: number; // Typical harvests per year
}

// Cost tracking
export interface CostRecord {
  id: string;
  treeId?: string; // Optional - for tree-specific costs
  treeNo?: string;
  zone?: string; // For zone-wide costs
  date: string;
  category: "Fertilizer" | "Pesticide" | "Labor" | "Water" | "Equipment" | "Maintenance" | "Other";
  description: string;
  amount: number; // RM
  quantity?: number;
  unit?: string; // kg, liters, hours, etc.
  supplier?: string;
  notes?: string;
  createdBy: string;
}

// Revenue tracking
export interface RevenueRecord {
  id: string;
  treeId: string;
  treeNo: string;
  variety: string;
  harvestDate: string;
  yieldKg: number;
  pricePerKg: number; // RM
  totalRevenue: number; // RM
  quality: "Premium" | "Grade A" | "Grade B" | "Grade C";
  buyer?: string;
  notes?: string;
  createdBy: string;
}

// Profit analysis
export interface ProfitAnalysis {
  treeId: string;
  treeNo: string;
  variety: string;
  zone?: string;
  // Costs
  totalCosts: number;
  fertilizerCosts: number;
  pesticideCosts: number;
  laborCosts: number;
  otherCosts: number;
  // Revenue
  totalRevenue: number;
  totalYieldKg: number;
  avgPricePerKg: number;
  // Profit
  netProfit: number;
  profitMargin: number; // percentage
  roi: number; // Return on Investment %
  // Time period
  periodStart: string;
  periodEnd: string;
}

export interface ZoneProfitAnalysis {
  zone: string;
  treeCount: number;
  totalCosts: number;
  totalRevenue: number;
  netProfit: number;
  profitMargin: number;
  avgProfitPerTree: number;
  topVariety: string;
}

// Inventory Management
export interface InventoryItem {
  id: string;
  name: string;
  category: "Fertilizer" | "Pesticide" | "Equipment" | "Tools" | "Seeds" | "Other";
  currentStock: number;
  unit: string; // kg, liters, pieces, bags, etc.
  minStockLevel: number; // Alert threshold
  maxStockLevel: number;
  unitCost: number; // RM per unit
  totalValue: number; // currentStock * unitCost
  supplier?: string;
  lastRestocked: string;
  expiryDate?: string;
  location?: string; // Where stored
  notes?: string;
  status: "In Stock" | "Low Stock" | "Out of Stock" | "Expiring Soon";
}

export interface StockTransaction {
  id: string;
  itemId: string;
  itemName: string;
  type: "Purchase" | "Usage" | "Adjustment" | "Expired" | "Return";
  quantity: number; // Positive for purchase/return, negative for usage
  unit: string;
  date: string;
  cost?: number; // Total cost for purchase
  supplier?: string;
  usedFor?: string; // Tree ID or zone for usage
  notes?: string;
  performedBy: string;
}

export interface InventoryAlert {
  id: string;
  itemId: string;
  itemName: string;
  type: "Low Stock" | "Out of Stock" | "Expiring Soon" | "Expired";
  severity: "Critical" | "Warning" | "Info";
  message: string;
  currentStock: number;
  minStock: number;
  daysUntilExpiry?: number;
  actionRequired: string;
  createdAt: string;
}

export interface SupplierInfo {
  id: string;
  name: string;
  contact: string;
  email?: string;
  phone?: string;
  address?: string;
  items: string[]; // Item IDs they supply
  rating?: number; // 1-5
  notes?: string;
  lastOrderDate?: string;
}

// Task Scheduler & Reminders
export interface ScheduledTask {
  id: string;
  title: string;
  taskType: "Fertilizing" | "Spraying" | "Pruning" | "Watering" | "Harvesting" | "Inspection" | "Maintenance" | "Other";
  priority: "Low" | "Medium" | "High" | "Urgent";
  status: "Pending" | "In Progress" | "Completed" | "Overdue" | "Cancelled";

  // Scheduling
  scheduledDate: string;
  scheduledTime?: string; // HH:MM format
  dueDate: string;
  estimatedDuration?: number; // in minutes

  // Assignment
  assignedTo: string[]; // Worker names or IDs
  assignedBy: string;

  // Location
  treeId?: string; // For tree-specific tasks
  treeNo?: string;
  zone?: string; // For zone-wide tasks
  location?: string; // General location description

  // Details
  description: string;
  instructions?: string;
  requiredEquipment?: string[];
  requiredMaterials?: string[];

  // Tracking
  createdAt: string;
  updatedAt: string;
  startedAt?: string;
  completedAt?: string;
  completedBy?: string;
  completionNotes?: string;

  // Reminders
  reminderEnabled: boolean;
  reminderTime?: number; // Minutes before task
  reminderSent?: boolean;

  // Recurring
  isRecurring: boolean;
  recurrencePattern?: "Daily" | "Weekly" | "Biweekly" | "Monthly" | "Quarterly" | "Yearly";
  recurrenceInterval?: number; // Every X days/weeks/months
  recurrenceEndDate?: string;
  parentTaskId?: string; // For recurring task instances
}

export interface TaskReminder {
  id: string;
  taskId: string;
  taskTitle: string;
  reminderDate: string;
  reminderTime: string;
  recipientType: "SMS" | "Email" | "Push";
  recipient: string; // Phone number or email
  sent: boolean;
  sentAt?: string;
  error?: string;
}

export interface Worker {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  role: string; // e.g., "Fertilizer Specialist", "Pruning Expert"
  availability: "Available" | "Busy" | "Off Duty";
  assignedTasks: string[]; // Task IDs
  completedTasks: number;
  rating?: number; // 1-5
  joinedDate: string;
}

export interface TaskTemplate {
  id: string;
  name: string;
  taskType: ScheduledTask["taskType"];
  description: string;
  estimatedDuration: number;
  requiredEquipment: string[];
  requiredMaterials: string[];
  instructions: string;
  defaultPriority: ScheduledTask["priority"];
  isActive: boolean;
}

export interface TaskStats {
  totalTasks: number;
  pendingTasks: number;
  inProgressTasks: number;
  completedTasks: number;
  overdueTasks: number;
  tasksToday: number;
  tasksThisWeek: number;
  completionRate: number; // percentage
  avgCompletionTime: number; // hours
  tasksByType: Record<string, number>;
  tasksByWorker: Record<string, number>;
}

// Weather Integration
export interface CurrentWeather {
  temperature: number; // Celsius
  feelsLike: number;
  humidity: number; // percentage
  pressure: number; // hPa
  windSpeed: number; // km/h
  windDirection: number; // degrees
  cloudCover: number; // percentage
  visibility: number; // km
  uvIndex: number;
  condition: string; // e.g., "Clear", "Cloudy", "Rain"
  conditionCode: number;
  icon: string;
  isDay: boolean;
  precipitation: number; // mm
  timestamp: string;
}

export interface DailyForecast {
  date: string;
  maxTemp: number;
  minTemp: number;
  avgTemp: number;
  maxWindSpeed: number;
  totalPrecipitation: number; // mm
  avgHumidity: number;
  chanceOfRain: number; // percentage
  condition: string;
  conditionCode: number;
  icon: string;
  sunrise: string;
  sunset: string;
  uvIndex: number;
}

export interface HourlyForecast {
  time: string;
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  precipitation: number;
  chanceOfRain: number;
  condition: string;
  icon: string;
}

export interface WeatherAlert {
  id: string;
  severity: "Extreme" | "Severe" | "Moderate" | "Minor";
  event: string; // e.g., "Heavy Rain", "Thunderstorm", "Strong Wind"
  headline: string;
  description: string;
  startTime: string;
  endTime: string;
  affectedAreas: string[];
  recommendations: string[];
}

export interface FarmingRecommendation {
  id: string;
  activity: "Fertilizing" | "Spraying" | "Pruning" | "Watering" | "Harvesting" | "General";
  recommendation: "Ideal" | "Suitable" | "Not Recommended" | "Avoid";
  reason: string;
  bestDays: string[]; // Dates
  worstDays: string[]; // Dates
  tips: string[];
  priority: "High" | "Medium" | "Low";
}

export interface RainfallData {
  date: string;
  amount: number; // mm
  duration: number; // minutes
  intensity: "Light" | "Moderate" | "Heavy" | "Very Heavy";
}

export interface WeatherStats {
  avgTemperature: number;
  totalRainfall: number; // mm in last 7 days
  rainyDays: number; // in last 7 days
  avgHumidity: number;
  maxWindSpeed: number;
  totalSunshine: number; // hours
  idealSprayingDays: number;
  idealFertilizingDays: number;
}

export interface FarmLocation {
  name: string;
  latitude: number;
  longitude: number;
  timezone: string;
  elevation?: number; // meters
}

// Smart Alerts & Notifications
export interface SmartAlert {
  id: string;
  type: "Tree Health" | "Task Reminder" | "Weather Warning" | "Inventory Low" | "Harvest Due" | "Maintenance" | "Disease Outbreak" | "System";
  severity: "Critical" | "High" | "Medium" | "Low" | "Info";
  priority: number; // 1-5, 1 being highest
  title: string;
  message: string;
  description: string;

  // Source information
  source: "Auto-Generated" | "Manual" | "Weather API" | "System Check" | "User Reported";
  sourceId?: string; // Tree ID, Task ID, etc.

  // Status and timing
  status: "Active" | "Acknowledged" | "Resolved" | "Dismissed" | "Expired";
  createdAt: string;
  acknowledgedAt?: string;
  acknowledgedBy?: string;
  resolvedAt?: string;
  resolvedBy?: string;
  expiresAt?: string;

  // Actions and recommendations
  actionRequired: boolean;
  recommendedActions: string[];
  affectedItems: string[]; // IDs of affected trees, zones, etc.
  affectedZones?: string[];

  // Notification settings
  notificationSent: boolean;
  notificationChannels: ("App" | "SMS" | "Email" | "Push")[];
  recipients: string[];

  // Metadata
  category: "Urgent" | "Scheduled" | "Preventive" | "Informational";
  tags: string[];
  relatedAlerts?: string[]; // Related alert IDs
  attachments?: string[]; // URLs or base64 images
  location?: string;
}

export interface AlertRule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  type: SmartAlert["type"];
  severity: SmartAlert["severity"];

  // Trigger conditions
  condition: "Tree Health Decline" | "Task Overdue" | "Weather Threshold" | "Inventory Below Min" | "Harvest Window" | "Disease Pattern" | "Custom";
  parameters: Record<string, any>; // Flexible parameters for different conditions

  // Notification settings
  notifyChannels: ("App" | "SMS" | "Email" | "Push")[];
  notifyUsers: string[];
  notifyDelay?: number; // Minutes before sending notification

  // Scheduling
  checkFrequency: "Real-time" | "Hourly" | "Daily" | "Weekly";
  activeHours?: { start: string; end: string }; // HH:MM format
  activeDays?: number[]; // 0-6, Sunday-Saturday

  // Actions
  autoResolve: boolean;
  autoResolveAfter?: number; // Hours
  createTask: boolean;
  taskTemplate?: string;

  createdAt: string;
  lastTriggered?: string;
  triggerCount: number;
}

export interface NotificationPreference {
  userId: string;
  userName: string;

  // Channel preferences
  enableApp: boolean;
  enableSMS: boolean;
  enableEmail: boolean;
  enablePush: boolean;

  // Contact info
  phoneNumber?: string;
  email?: string;

  // Alert type preferences
  criticalAlerts: boolean;
  highAlerts: boolean;
  mediumAlerts: boolean;
  lowAlerts: boolean;

  // Quiet hours
  quietHoursEnabled: boolean;
  quietHoursStart?: string; // HH:MM
  quietHoursEnd?: string; // HH:MM

  // Digest settings
  dailyDigest: boolean;
  digestTime?: string; // HH:MM
  weeklyDigest: boolean;

  // Alert categories
  treeHealthAlerts: boolean;
  taskReminders: boolean;
  weatherWarnings: boolean;
  inventoryAlerts: boolean;
  harvestAlerts: boolean;

  updatedAt: string;
}

export interface AlertStats {
  totalAlerts: number;
  activeAlerts: number;
  criticalAlerts: number;
  highAlerts: number;
  acknowledgedAlerts: number;
  resolvedAlerts: number;

  // By type
  treeHealthAlerts: number;
  taskReminders: number;
  weatherAlerts: number;
  inventoryAlerts: number;
  harvestAlerts: number;

  // Response metrics
  avgAcknowledgeTime: number; // minutes
  avgResolveTime: number; // minutes
  alertsToday: number;
  alertsThisWeek: number;

  // Trends
  alertTrend: "Increasing" | "Stable" | "Decreasing";
}

// Export & Reporting
export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  type: "Farm Overview" | "Tree Health" | "Harvest Summary" | "Financial" | "Inventory" | "Certification" | "Insurance" | "Custom";
  format: "PDF" | "Excel" | "CSV" | "JSON";
  sections: string[];
  includeCharts: boolean;
  includePhotos: boolean;
  createdAt: string;
  lastUsed?: string;
}

export interface ExportOptions {
  format: "PDF" | "Excel" | "CSV" | "JSON";
  dateRange: {
    start: string;
    end: string;
  };
  includeData: {
    trees: boolean;
    health: boolean;
    harvests: boolean;
    costs: boolean;
    revenue: boolean;
    inventory: boolean;
    tasks: boolean;
    weather: boolean;
    alerts: boolean;
  };
  includeCharts: boolean;
  includePhotos: boolean;
  includeStatistics: boolean;
  filterBy?: {
    zones?: string[];
    varieties?: string[];
    healthStatus?: string[];
  };
}

export interface GeneratedReport {
  id: string;
  title: string;
  type: ReportTemplate["type"];
  format: "PDF" | "Excel" | "CSV" | "JSON";
  generatedAt: string;
  generatedBy: string;
  dateRange: {
    start: string;
    end: string;
  };
  fileSize: number; // bytes
  downloadUrl: string; // base64 or blob URL
  summary: {
    totalTrees: number;
    totalHarvests: number;
    totalRevenue: number;
    totalCosts: number;
    netProfit: number;
  };
}

export interface CertificationData {
  farmName: string;
  farmAddress: string;
  registrationNumber?: string;
  certificationBody?: string;
  certificationDate?: string;
  validUntil?: string;

  // Farm details
  totalArea: number; // hectares
  cultivatedArea: number;
  totalTrees: number;
  varieties: string[];

  // Compliance
  organicCertified: boolean;
  gapCertified: boolean; // Good Agricultural Practices
  myCertified: boolean; // Malaysian certification

  // Practices
  pesticideUsage: {
    type: string;
    amount: number;
    lastApplication: string;
    approved: boolean;
  }[];

  fertilizerUsage: {
    type: string;
    amount: number;
    lastApplication: string;
    organic: boolean;
  }[];

  // Health records
  diseaseOutbreaks: number;
  healthyTreePercentage: number;

  // Harvest data
  annualYield: number;
  qualityGrades: Record<string, number>;
}

export interface InsuranceClaimData {
  policyNumber: string;
  claimDate: string;
  claimType: "Weather Damage" | "Disease Outbreak" | "Pest Damage" | "Fire" | "Theft" | "Other";

  // Damage assessment
  affectedTrees: number;
  affectedZones: string[];
  estimatedLoss: number; // RM

  // Evidence
  photos: string[]; // base64 images
  healthRecords: TreeHealthRecord[];
  weatherData?: DailyForecast[];

  // Supporting documents
  veterinaryReports?: string[];
  expertAssessments?: string[];

  // Financial impact
  lostRevenue: number;
  replacementCost: number;
  cleanupCost: number;
  totalClaim: number;
}

// Activity Log Types
export interface ActivityLog {
  id: string;
  timestamp: string;
  user: string;
  action: ActivityAction;
  category: ActivityCategory;
  description: string;
  details?: string;
  entityType?: 'tree' | 'health' | 'activity' | 'report' | 'system';
  entityId?: string;
  severity?: 'info' | 'warning' | 'success' | 'error';
  metadata?: Record<string, any>;
}

export type ActivityAction =
  | 'create' | 'update' | 'delete'
  | 'login' | 'logout'
  | 'export' | 'import'
  | 'generate_report' | 'view'
  | 'assign' | 'complete'
  | 'sync' | 'backup';

export type ActivityCategory =
  | 'Authentication'
  | 'Tree Management'
  | 'Health Records'
  | 'Farm Activities'
  | 'Reports'
  | 'Data Sync'
  | 'System'
  | 'User Action';

export interface ActivityStats {
  totalActivities: number;
  todayActivities: number;
  thisWeekActivities: number;
  userActivityCount: Record<string, number>;
  categoryBreakdown: Record<ActivityCategory, number>;
  actionBreakdown: Record<ActivityAction, number>;
}

// Multi-User Support Types
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  permissions: UserPermissions;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
  createdBy?: string;
  phone?: string;
  avatar?: string;
}

export type UserRole = 'owner' | 'manager' | 'worker' | 'viewer';
export type UserStatus = 'active' | 'inactive' | 'suspended';

export interface UserPermissions {
  // Tree Management
  viewTrees: boolean;
  addTrees: boolean;
  editTrees: boolean;
  deleteTrees: boolean;

  // Inventory Management
  viewInventory: boolean;
  addInventory: boolean;
  editInventory: boolean;
  deleteInventory: boolean;

  // Health Records
  viewHealthRecords: boolean;
  addHealthRecords: boolean;
  editHealthRecords: boolean;
  deleteHealthRecords: boolean;

  // Purchase Orders
  viewPurchaseOrders: boolean;
  createPurchaseOrders: boolean;
  approvePurchaseOrders: boolean;

  // Harvest Management
  viewHarvest: boolean;
  recordHarvest: boolean;
  editHarvest: boolean;

  // Reports & Analytics
  viewReports: boolean;
  exportData: boolean;

  // User Management
  viewUsers: boolean;
  manageUsers: boolean;

  // System
  viewActivityLog: boolean;
  manageBackups: boolean;
  systemSettings: boolean;
}

// Purchase Orders
export interface PurchaseOrder {
  id: string;
  orderNumber: string;
  supplierId: string;
  supplierName: string;
  status: "Draft" | "Pending" | "Approved" | "Ordered" | "Received" | "Cancelled";
  orderDate: string;
  expectedDeliveryDate?: string;
  actualDeliveryDate?: string;
  items: PurchaseOrderItem[];
  subtotal: number;
  tax: number;
  shippingCost: number;
  totalCost: number;
  paymentStatus: "Unpaid" | "Partial" | "Paid";
  paymentMethod?: string;
  notes?: string;
  createdBy: string;
  approvedBy?: string;
  receivedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PurchaseOrderItem {
  itemId: string;
  itemName: string;
  category: "Fertilizer" | "Pesticide" | "Equipment" | "Tools" | "Seeds" | "Other";
  quantity: number;
  unit: string;
  unitCost: number;
  totalCost: number;
  receivedQuantity?: number;
  notes?: string;
}

// Harvest Inventory with Quality Grades
export interface HarvestInventory {
  id: string;
  harvestId: string;
  harvestDate: string;
  treeId?: string;
  treeNo?: string;
  variety: string;
  zone?: string;
  totalQuantity: number;
  unit: string; // kg, pieces
  qualityBreakdown: QualityGrade[];
  totalValue: number; // Calculated from quality grades
  status: "Fresh" | "Stored" | "Sold" | "Damaged" | "Expired";
  storageLocation?: string;
  harvestedBy: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface QualityGrade {
  grade: "A" | "B" | "C" | "Reject";
  quantity: number;
  pricePerUnit: number; // RM per kg or per piece
  totalValue: number;
  percentage: number; // Of total harvest
  description?: string;
}

// Inventory Statistics
export interface InventoryStats {
  totalItems: number;
  totalValue: number;
  lowStockItems: number;
  outOfStockItems: number;
  expiringItems: number;
  categoryBreakdown: Record<string, { count: number; value: number }>;
  recentTransactions: number;
  monthlySpending: number;
}

// ============================================
// E-COMMERCE & CUSTOMER-FACING TYPES
// ============================================

// Product Catalog
export interface Product {
  id: string;
  name: string;
  variety: string; // Durian variety name
  description: string;
  price: number;
  originalPrice?: number; // For showing discounts
  unit: 'kg' | 'fruit' | 'box';
  category: 'Fresh' | 'Premium' | 'Grade A' | 'Grade B' | 'Grade C';
  inStock: boolean;
  stockQuantity: number;
  images: string[];
  features: string[]; // e.g., "Creamy texture", "Sweet aroma"
  harvestDate?: string;
  expiryDate?: string;
  weight?: number; // Average weight per unit
  rating?: number; // 1-5 stars
  reviewCount?: number;
  isPublished: boolean;
  isFeatured: boolean;
  tags?: string[];
  nutritionInfo?: {
    calories?: number;
    protein?: number;
    fat?: number;
    carbs?: number;
  };
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

// Customer
export interface Customer {
  id: string;
  email: string;
  name: string;
  phone?: string;
  avatar?: string;
  // Shipping addresses
  addresses: ShippingAddress[];
  defaultAddressId?: string;
  // Order history
  totalOrders: number;
  totalSpent: number;
  // Loyalty
  loyaltyPoints?: number;
  tier?: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
  // Account
  isVerified: boolean;
  createdAt: string;
  lastOrderDate?: string;
}

export interface ShippingAddress {
  id: string;
  label: string; // "Home", "Office", etc.
  recipientName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
  isDefault: boolean;
}

// Shopping Cart
export interface CartItem {
  productId: string;
  product: Product;
  quantity: number;
  selectedWeight?: number; // For items sold by weight
  price: number; // Price at time of adding to cart
  subtotal: number;
  notes?: string; // Special requests
}

export interface ShoppingCart {
  id: string;
  customerId?: string; // null for guest checkout
  items: CartItem[];
  subtotal: number;
  discount: number;
  discountCode?: string;
  tax: number;
  shippingCost: number;
  total: number;
  createdAt: string;
  updatedAt: string;
}

// Customer Orders
export interface CustomerOrder {
  id: string;
  orderNumber: string; // e.g., "ORD-2025-0001"
  customerId: string;
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  // Order items
  items: OrderItem[];
  // Pricing
  subtotal: number;
  discount: number;
  discountCode?: string;
  tax: number;
  shippingCost: number;
  total: number;
  // Payment
  paymentMethod: 'curlec' | 'card' | 'fpx' | 'ewallet';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentId?: string; // Curlec payment ID
  paidAt?: string;
  // Shipping
  shippingAddress: ShippingAddress;
  shippingMethod: 'standard' | 'express' | 'pickup';
  estimatedDelivery?: string;
  trackingNumber?: string;
  // Order status
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  // Notes
  customerNotes?: string;
  adminNotes?: string;
  // Timestamps
  createdAt: string;
  updatedAt: string;
  confirmedAt?: string;
  shippedAt?: string;
  deliveredAt?: string;
  cancelledAt?: string;
  // Fulfillment
  assignedTo?: string; // Staff member handling the order
  // Invoice
  invoiceUrl?: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  variety: string;
  quantity: number;
  unit: string;
  price: number;
  subtotal: number;
  weight?: number;
  notes?: string;
}

// Order Status History
export interface OrderStatusUpdate {
  id: string;
  orderId: string;
  status: CustomerOrder['status'];
  message: string;
  updatedBy: string;
  timestamp: string;
  notificationSent: boolean;
}

// Discount Codes
export interface DiscountCode {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  minPurchase?: number;
  maxDiscount?: number;
  usageLimit?: number;
  usageCount: number;
  validFrom: string;
  validUntil?: string;
  isActive: boolean;
  applicableProducts?: string[]; // Product IDs, empty = all products
  createdBy: string;
  createdAt: string;
}

// Reviews & Ratings
export interface ProductReview {
  id: string;
  productId: string;
  customerId: string;
  customerName: string;
  orderId?: string;
  rating: number; // 1-5
  title: string;
  comment: string;
  images?: string[];
  isVerifiedPurchase: boolean;
  helpful: number; // Number of users who found it helpful
  createdAt: string;
  updatedAt: string;
  response?: {
    message: string;
    respondedBy: string;
    respondedAt: string;
  };
}

// Shipping Methods
export interface ShippingMethod {
  id: string;
  name: string;
  description: string;
  cost: number;
  estimatedDays: number;
  isActive: boolean;
  freeShippingMinimum?: number; // Free shipping if order total >= this
}

// Payment Information
export interface PaymentTransaction {
  id: string;
  orderId: string;
  customerId: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  status: 'pending' | 'processing' | 'success' | 'failed' | 'refunded';
  // Curlec specific
  curlecPaymentId?: string;
  curlecBillCode?: string;
  curlecBillUrl?: string;
  // Response data
  responseData?: any;
  errorMessage?: string;
  // Timestamps
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  refundedAt?: string;
}

// Notifications
export interface EmailNotification {
  id: string;
  to: string;
  subject: string;
  template: 'order_confirmation' | 'order_shipped' | 'order_delivered' | 'payment_received' | 'password_reset';
  data: any; // Template-specific data
  status: 'pending' | 'sent' | 'failed';
  sentAt?: string;
  error?: string;
  createdAt: string;
}

// Analytics & Reports
export interface SalesReport {
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  startDate: string;
  endDate: string;
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  topProducts: Array<{
    productId: string;
    productName: string;
    quantitySold: number;
    revenue: number;
  }>;
  customerStats: {
    newCustomers: number;
    returningCustomers: number;
    totalCustomers: number;
  };
  paymentMethodBreakdown: Record<string, number>;
  statusBreakdown: Record<string, number>;
}
