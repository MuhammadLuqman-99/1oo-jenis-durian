import {
  SmartAlert,
  AlertRule,
  NotificationPreference,
  AlertStats,
  TreeInfo,
  TreeHealthRecord,
  ScheduledTask,
  InventoryItem,
  HarvestPrediction,
  DailyForecast,
} from "@/types/tree";

// Get all alerts
export function getAllAlerts(): SmartAlert[] {
  if (typeof window === "undefined") return [];

  const stored = localStorage.getItem("smart_alerts");
  if (!stored) return [];

  return JSON.parse(stored);
}

// Save alerts
export function saveAlerts(alerts: SmartAlert[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("smart_alerts", JSON.stringify(alerts));
}

// Generate alerts from all farm data
export function generateAllAlerts(
  trees: TreeInfo[],
  healthRecords: TreeHealthRecord[],
  tasks: ScheduledTask[],
  inventory: InventoryItem[],
  harvestPredictions: HarvestPrediction[],
  weatherForecast: DailyForecast[]
): SmartAlert[] {
  const alerts: SmartAlert[] = [];
  const now = new Date();

  // 1. Tree Health Alerts
  healthRecords.forEach((record) => {
    if (record.healthStatus === "Sakit" && record.attackLevel === "Teruk") {
      alerts.push({
        id: `alert-health-${record.id}`,
        type: "Tree Health",
        severity: "Critical",
        priority: 1,
        title: `🚨 Critical: Tree ${record.treeNo} Severely Diseased`,
        message: `Tree ${record.treeNo} (${record.variety}) in ${record.zone || record.location} is severely sick`,
        description: `Disease: ${record.diseaseType || "Unknown"}. Immediate treatment required to prevent spread.`,
        source: "System Check",
        sourceId: record.treeId,
        status: "Active",
        createdAt: now.toISOString(),
        actionRequired: true,
        recommendedActions: [
          "Isolate affected tree if possible",
          "Apply recommended treatment immediately",
          "Monitor nearby trees for symptoms",
          "Consult agricultural expert if condition worsens",
        ],
        affectedItems: [record.treeId],
        affectedZones: record.zone ? [record.zone] : [],
        notificationSent: false,
        notificationChannels: ["App", "SMS"],
        recipients: ["Farm Manager"],
        category: "Urgent",
        tags: ["disease", "urgent", record.variety.toLowerCase()],
        location: record.zone || record.location,
      });
    } else if (record.healthStatus === "Sakit") {
      alerts.push({
        id: `alert-health-${record.id}`,
        type: "Tree Health",
        severity: "High",
        priority: 2,
        title: `⚠️ Tree ${record.treeNo} Requires Attention`,
        message: `Tree ${record.treeNo} showing signs of disease`,
        description: `${record.diseaseType || "Health issue detected"}. Attack level: ${record.attackLevel || "Not specified"}.`,
        source: "System Check",
        sourceId: record.treeId,
        status: "Active",
        createdAt: now.toISOString(),
        actionRequired: true,
        recommendedActions: [
          "Schedule inspection within 24 hours",
          "Prepare treatment if needed",
          "Document symptoms with photos",
        ],
        affectedItems: [record.treeId],
        affectedZones: record.zone ? [record.zone] : [],
        notificationSent: false,
        notificationChannels: ["App"],
        recipients: ["Farm Manager"],
        category: "Preventive",
        tags: ["disease", record.variety.toLowerCase()],
        location: record.zone || record.location,
      });
    }
  });

  // Check for disease outbreaks (multiple trees in same zone)
  const diseasesByZone = healthRecords
    .filter((r) => r.healthStatus === "Sakit" && r.zone)
    .reduce((acc, r) => {
      const zone = r.zone!;
      if (!acc[zone]) acc[zone] = [];
      acc[zone].push(r);
      return acc;
    }, {} as Record<string, TreeHealthRecord[]>);

  Object.entries(diseasesByZone).forEach(([zone, records]) => {
    if (records.length >= 3) {
      alerts.push({
        id: `alert-outbreak-${zone}`,
        type: "Disease Outbreak",
        severity: "Critical",
        priority: 1,
        title: `🦠 Disease Outbreak in Zone ${zone}`,
        message: `${records.length} trees affected in Zone ${zone}`,
        description: `Potential disease outbreak detected. ${records.length} trees showing symptoms. Immediate action required to prevent further spread.`,
        source: "Auto-Generated",
        status: "Active",
        createdAt: now.toISOString(),
        actionRequired: true,
        recommendedActions: [
          `Quarantine Zone ${zone} if possible`,
          "Conduct thorough zone inspection",
          "Apply zone-wide treatment",
          "Monitor adjacent zones closely",
          "Consider consulting plant pathologist",
        ],
        affectedItems: records.map((r) => r.treeId),
        affectedZones: [zone],
        notificationSent: false,
        notificationChannels: ["App", "SMS", "Email"],
        recipients: ["Farm Manager", "Head Worker"],
        category: "Urgent",
        tags: ["outbreak", "disease", `zone-${zone}`],
        location: `Zone ${zone}`,
      });
    }
  });

  // 2. Task Reminders
  const todayStr = now.toISOString().split("T")[0];
  const tomorrowStr = new Date(now.getTime() + 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  // Overdue tasks
  tasks.filter((t) => t.status === "Overdue").forEach((task) => {
    alerts.push({
      id: `alert-task-overdue-${task.id}`,
      type: "Task Reminder",
      severity: "High",
      priority: 2,
      title: `⏰ Overdue: ${task.title}`,
      message: `Task "${task.title}" is overdue`,
      description: `Due date was ${task.dueDate}. Assigned to: ${task.assignedTo.join(", ")}`,
      source: "System Check",
      sourceId: task.id,
      status: "Active",
      createdAt: now.toISOString(),
      actionRequired: true,
      recommendedActions: [
        "Complete task as soon as possible",
        "Update task status if already done",
        "Reassign if worker unavailable",
      ],
      affectedItems: [task.id],
      affectedZones: task.zone ? [task.zone] : [],
      notificationSent: false,
      notificationChannels: ["App"],
      recipients: task.assignedTo,
      category: "Urgent",
      tags: ["task", "overdue", task.taskType.toLowerCase()],
        location: task.zone || task.location,
    });
  });

  // Tasks due today
  tasks
    .filter((t) => t.scheduledDate === todayStr && t.status === "Pending")
    .forEach((task) => {
      alerts.push({
        id: `alert-task-today-${task.id}`,
        type: "Task Reminder",
        severity: "Medium",
        priority: 3,
        title: `📅 Today: ${task.title}`,
        message: `Scheduled for today at ${task.scheduledTime || "TBD"}`,
        description: `${task.description}. Duration: ${task.estimatedDuration} minutes.`,
        source: "System Check",
        sourceId: task.id,
        status: "Active",
        createdAt: now.toISOString(),
        actionRequired: true,
        recommendedActions: [
          "Review task details",
          "Prepare required equipment",
          "Start task at scheduled time",
        ],
        affectedItems: [task.id],
        affectedZones: task.zone ? [task.zone] : [],
        notificationSent: false,
        notificationChannels: ["App"],
        recipients: task.assignedTo,
        category: "Scheduled",
        tags: ["task", "today", task.taskType.toLowerCase()],
        location: task.zone || task.location,
      });
    });

  // 3. Inventory Alerts
  inventory
    .filter((item) => item.status === "Out of Stock")
    .forEach((item) => {
      alerts.push({
        id: `alert-inventory-out-${item.id}`,
        type: "Inventory Low",
        severity: "Critical",
        priority: 1,
        title: `🚫 Out of Stock: ${item.name}`,
        message: `${item.name} is completely out of stock`,
        description: `Required stock level: ${item.minStockLevel} ${item.unit}. Order immediately.`,
        source: "System Check",
        sourceId: item.id,
        status: "Active",
        createdAt: now.toISOString(),
        actionRequired: true,
        recommendedActions: [
          `Order at least ${item.minStockLevel} ${item.unit}`,
          "Contact supplier: " + (item.supplier || "TBD"),
          "Find alternative supplier if needed",
          "Postpone activities requiring this item",
        ],
        affectedItems: [item.id],
        notificationSent: false,
        notificationChannels: ["App", "SMS"],
        recipients: ["Farm Manager", "Procurement"],
        category: "Urgent",
        tags: ["inventory", "out-of-stock", item.category.toLowerCase()],
        location: item.location,
      });
    });

  inventory
    .filter((item) => item.status === "Low Stock")
    .forEach((item) => {
      alerts.push({
        id: `alert-inventory-low-${item.id}`,
        type: "Inventory Low",
        severity: "Medium",
        priority: 3,
        title: `⚠️ Low Stock: ${item.name}`,
        message: `Only ${item.currentStock} ${item.unit} remaining`,
        description: `Below minimum level of ${item.minStockLevel} ${item.unit}. Reorder recommended.`,
        source: "System Check",
        sourceId: item.id,
        status: "Active",
        createdAt: now.toISOString(),
        actionRequired: true,
        recommendedActions: [
          `Reorder ${item.maxStockLevel - item.currentStock} ${item.unit}`,
          "Check with supplier for availability",
          "Plan usage carefully until restocked",
        ],
        affectedItems: [item.id],
        notificationSent: false,
        notificationChannels: ["App"],
        recipients: ["Farm Manager"],
        category: "Preventive",
        tags: ["inventory", "low-stock", item.category.toLowerCase()],
        location: item.location,
      });
    });

  // Expiring items
  inventory
    .filter((item) => item.status === "Expiring Soon" && item.expiryDate)
    .forEach((item) => {
      const daysUntilExpiry = Math.floor(
        (new Date(item.expiryDate!).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );

      alerts.push({
        id: `alert-inventory-expiry-${item.id}`,
        type: "Inventory Low",
        severity: daysUntilExpiry <= 7 ? "High" : "Medium",
        priority: daysUntilExpiry <= 7 ? 2 : 3,
        title: `⏳ Expiring Soon: ${item.name}`,
        message: `Expires in ${daysUntilExpiry} days`,
        description: `${item.currentStock} ${item.unit} will expire on ${item.expiryDate}. Use or dispose before expiry.`,
        source: "System Check",
        sourceId: item.id,
        status: "Active",
        createdAt: now.toISOString(),
        actionRequired: true,
        recommendedActions: [
          "Prioritize using this stock first",
          "Schedule usage before expiry date",
          "Dispose safely if expired",
          "Adjust future order quantities",
        ],
        affectedItems: [item.id],
        notificationSent: false,
        notificationChannels: ["App"],
        recipients: ["Farm Manager"],
        category: "Preventive",
        tags: ["inventory", "expiring", item.category.toLowerCase()],
        location: item.location,
      });
    });

  // 4. Harvest Due Alerts
  harvestPredictions
    .filter((pred) => pred.status === "Ready")
    .forEach((harvest) => {
      alerts.push({
        id: `alert-harvest-${harvest.id}`,
        type: "Harvest Due",
        severity: "Medium",
        priority: 3,
        title: `🌳 Ready to Harvest: Tree ${harvest.treeNo}`,
        message: `${harvest.variety} ready for harvest`,
        description: `Predicted yield: ${harvest.predictedYield} kg. Confidence: ${harvest.confidence}. Harvest within optimal window for best quality.`,
        source: "System Check",
        sourceId: harvest.treeId,
        status: "Active",
        createdAt: now.toISOString(),
        actionRequired: true,
        recommendedActions: [
          "Schedule harvest within next 3-5 days",
          "Prepare harvesting equipment",
          "Check weather forecast (avoid rain)",
          "Arrange transportation if needed",
        ],
        affectedItems: [harvest.treeId],
        affectedZones: harvest.zone ? [harvest.zone] : [],
        notificationSent: false,
        notificationChannels: ["App"],
        recipients: ["Farm Manager", "Harvest Team"],
        category: "Scheduled",
        tags: ["harvest", harvest.variety.toLowerCase()],
        location: harvest.zone || "",
      });
    });

  // 5. Weather Warnings
  weatherForecast.forEach((day, index) => {
    // Heavy rain warning
    if (day.totalPrecipitation > 50 && index <= 2) {
      const dayName = new Date(day.date).toLocaleDateString("en-MY", { weekday: "long" });
      alerts.push({
        id: `alert-weather-rain-${day.date}`,
        type: "Weather Warning",
        severity: day.totalPrecipitation > 100 ? "High" : "Medium",
        priority: 2,
        title: `🌧️ Heavy Rain Expected: ${dayName}`,
        message: `${day.totalPrecipitation.toFixed(0)}mm rainfall predicted`,
        description: `Heavy rain on ${day.date}. Postpone outdoor activities. Check drainage systems.`,
        source: "Weather API",
        status: "Active",
        createdAt: now.toISOString(),
        expiresAt: day.date,
        actionRequired: true,
        recommendedActions: [
          "Postpone spraying and fertilizing",
          "Secure loose equipment",
          "Check farm drainage",
          "Plan indoor maintenance tasks",
        ],
        affectedItems: [],
        notificationSent: false,
        notificationChannels: ["App"],
        recipients: ["Farm Manager", "All Workers"],
        category: "Preventive",
        tags: ["weather", "rain"],
        location: "All zones",
      });
    }

    // Strong wind warning
    if (day.maxWindSpeed > 30 && index <= 2) {
      const dayName = new Date(day.date).toLocaleDateString("en-MY", { weekday: "long" });
      alerts.push({
        id: `alert-weather-wind-${day.date}`,
        type: "Weather Warning",
        severity: "Medium",
        priority: 3,
        title: `💨 Strong Winds: ${dayName}`,
        message: `Wind speeds up to ${day.maxWindSpeed} km/h`,
        description: `Strong winds on ${day.date}. Risk of branch damage.`,
        source: "Weather API",
        status: "Active",
        createdAt: now.toISOString(),
        expiresAt: day.date,
        actionRequired: false,
        recommendedActions: [
          "Avoid tree pruning",
          "Do not spray pesticides",
          "Check tree supports",
          "Be prepared for fallen branches",
        ],
        affectedItems: [],
        notificationSent: false,
        notificationChannels: ["App"],
        recipients: ["Farm Manager"],
        category: "Informational",
        tags: ["weather", "wind"],
        location: "All zones",
      });
    }
  });

  return alerts;
}

// Add manual alert
export function addAlert(
  alert: Omit<SmartAlert, "id" | "createdAt">
): SmartAlert {
  const alerts = getAllAlerts();
  const newAlert: SmartAlert = {
    ...alert,
    id: `alert-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };

  alerts.push(newAlert);
  saveAlerts(alerts);

  return newAlert;
}

// Acknowledge alert
export function acknowledgeAlert(
  alertId: string,
  acknowledgedBy: string
): SmartAlert | null {
  const alerts = getAllAlerts();
  const index = alerts.findIndex((a) => a.id === alertId);

  if (index === -1) return null;

  alerts[index].status = "Acknowledged";
  alerts[index].acknowledgedAt = new Date().toISOString();
  alerts[index].acknowledgedBy = acknowledgedBy;

  saveAlerts(alerts);
  return alerts[index];
}

// Resolve alert
export function resolveAlert(
  alertId: string,
  resolvedBy: string
): SmartAlert | null {
  const alerts = getAllAlerts();
  const index = alerts.findIndex((a) => a.id === alertId);

  if (index === -1) return null;

  alerts[index].status = "Resolved";
  alerts[index].resolvedAt = new Date().toISOString();
  alerts[index].resolvedBy = resolvedBy;

  saveAlerts(alerts);
  return alerts[index];
}

// Dismiss alert
export function dismissAlert(alertId: string): SmartAlert | null {
  const alerts = getAllAlerts();
  const index = alerts.findIndex((a) => a.id === alertId);

  if (index === -1) return null;

  alerts[index].status = "Dismissed";
  saveAlerts(alerts);

  return alerts[index];
}

// Delete alert
export function deleteAlert(alertId: string): boolean {
  const alerts = getAllAlerts();
  const filtered = alerts.filter((a) => a.id !== alertId);

  if (filtered.length === alerts.length) return false;

  saveAlerts(filtered);
  return true;
}

// Get active alerts
export function getActiveAlerts(): SmartAlert[] {
  return getAllAlerts()
    .filter((a) => a.status === "Active")
    .sort((a, b) => a.priority - b.priority || b.severity.localeCompare(a.severity));
}

// Get critical alerts
export function getCriticalAlerts(): SmartAlert[] {
  return getAllAlerts()
    .filter((a) => a.status === "Active" && a.severity === "Critical")
    .sort((a, b) => a.priority - b.priority);
}

// Calculate alert statistics
export function getAlertStats(): AlertStats {
  const all = getAllAlerts();
  const now = new Date();
  const today = now.toISOString().split("T")[0];
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const active = all.filter((a) => a.status === "Active");
  const critical = all.filter((a) => a.severity === "Critical");
  const acknowledged = all.filter((a) => a.status === "Acknowledged");
  const resolved = all.filter((a) => a.status === "Resolved");

  const alertsToday = all.filter((a) => a.createdAt.startsWith(today));
  const alertsThisWeek = all.filter(
    (a) => new Date(a.createdAt) >= weekAgo
  );

  // Calculate avg acknowledgement time
  const ackedWithTime = acknowledged.filter((a) => a.acknowledgedAt);
  const totalAckTime = ackedWithTime.reduce((sum, a) => {
    const created = new Date(a.createdAt).getTime();
    const acked = new Date(a.acknowledgedAt!).getTime();
    return sum + (acked - created);
  }, 0);
  const avgAcknowledgeTime =
    ackedWithTime.length > 0
      ? totalAckTime / ackedWithTime.length / (1000 * 60)
      : 0;

  // Calculate avg resolve time
  const resolvedWithTime = resolved.filter((a) => a.resolvedAt);
  const totalResolveTime = resolvedWithTime.reduce((sum, a) => {
    const created = new Date(a.createdAt).getTime();
    const resolvedTime = new Date(a.resolvedAt!).getTime();
    return sum + (resolvedTime - created);
  }, 0);
  const avgResolveTime =
    resolvedWithTime.length > 0
      ? totalResolveTime / resolvedWithTime.length / (1000 * 60)
      : 0;

  // Count by type
  const treeHealthAlerts = all.filter((a) => a.type === "Tree Health").length;
  const taskReminders = all.filter((a) => a.type === "Task Reminder").length;
  const weatherAlerts = all.filter((a) => a.type === "Weather Warning").length;
  const inventoryAlerts = all.filter((a) => a.type === "Inventory Low").length;
  const harvestAlerts = all.filter((a) => a.type === "Harvest Due").length;

  // Determine trend
  const lastWeekCount = alertsThisWeek.length;
  const previousWeekStart = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
  const previousWeekAlerts = all.filter(
    (a) => new Date(a.createdAt) >= previousWeekStart && new Date(a.createdAt) < weekAgo
  );
  const change = lastWeekCount - previousWeekAlerts.length;
  const alertTrend: AlertStats["alertTrend"] =
    change > 2 ? "Increasing" : change < -2 ? "Decreasing" : "Stable";

  return {
    totalAlerts: all.length,
    activeAlerts: active.length,
    criticalAlerts: critical.length,
    highAlerts: all.filter((a) => a.severity === "High").length,
    acknowledgedAlerts: acknowledged.length,
    resolvedAlerts: resolved.length,
    treeHealthAlerts,
    taskReminders,
    weatherAlerts,
    inventoryAlerts,
    harvestAlerts,
    avgAcknowledgeTime: Math.round(avgAcknowledgeTime),
    avgResolveTime: Math.round(avgResolveTime),
    alertsToday: alertsToday.length,
    alertsThisWeek: alertsThisWeek.length,
    alertTrend,
  };
}
