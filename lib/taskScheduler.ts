import {
  ScheduledTask,
  TaskReminder,
  Worker,
  TaskTemplate,
  TaskStats,
} from "@/types/tree";

// Default workers
const defaultWorkers: Worker[] = [
  {
    id: "worker-1",
    name: "Ahmad bin Ali",
    phone: "012-345-6789",
    role: "Fertilizer Specialist",
    availability: "Available",
    assignedTasks: [],
    completedTasks: 45,
    rating: 4.8,
    joinedDate: "2023-01-15",
  },
  {
    id: "worker-2",
    name: "Siti Nurhaliza",
    phone: "013-456-7890",
    role: "Pruning Expert",
    availability: "Available",
    assignedTasks: [],
    completedTasks: 52,
    rating: 4.9,
    joinedDate: "2023-02-20",
  },
  {
    id: "worker-3",
    name: "Kumar a/l Rajan",
    phone: "014-567-8901",
    role: "Pest Control Specialist",
    availability: "Available",
    assignedTasks: [],
    completedTasks: 38,
    rating: 4.7,
    joinedDate: "2023-03-10",
  },
  {
    id: "worker-4",
    name: "Lee Wei Ming",
    phone: "015-678-9012",
    role: "General Worker",
    availability: "Available",
    assignedTasks: [],
    completedTasks: 67,
    rating: 4.6,
    joinedDate: "2022-11-05",
  },
];

// Task templates for quick task creation
const defaultTemplates: TaskTemplate[] = [
  {
    id: "template-1",
    name: "Zone Fertilization",
    taskType: "Fertilizing",
    description: "Apply NPK fertilizer to all trees in zone",
    estimatedDuration: 180, // 3 hours
    requiredEquipment: ["Fertilizer spreader", "Protective gloves"],
    requiredMaterials: ["NPK Fertilizer (15-15-15)"],
    instructions:
      "1. Check soil moisture\n2. Apply 2-3 kg per tree\n3. Water after application\n4. Record application in system",
    defaultPriority: "Medium",
    isActive: true,
  },
  {
    id: "template-2",
    name: "Pest Control Spraying",
    taskType: "Spraying",
    description: "Apply pesticide to control pests and diseases",
    estimatedDuration: 120,
    requiredEquipment: ["Sprayer", "Protective suit", "Mask"],
    requiredMaterials: ["Insecticide Spray", "Fungicide Powder"],
    instructions:
      "1. Mix pesticide according to label\n2. Spray evenly on leaves and trunk\n3. Avoid spraying in rain\n4. Record treated trees",
    defaultPriority: "High",
    isActive: true,
  },
  {
    id: "template-3",
    name: "Tree Pruning",
    taskType: "Pruning",
    description: "Prune dead branches and shape canopy",
    estimatedDuration: 60,
    requiredEquipment: ["Pruning shears", "Saw", "Safety gear"],
    requiredMaterials: [],
    instructions:
      "1. Remove dead/diseased branches\n2. Thin overcrowded areas\n3. Shape canopy for light penetration\n4. Dispose of waste properly",
    defaultPriority: "Medium",
    isActive: true,
  },
  {
    id: "template-4",
    name: "Weekly Inspection",
    taskType: "Inspection",
    description: "Inspect trees for health issues and pests",
    estimatedDuration: 90,
    requiredEquipment: ["Inspection checklist", "Camera"],
    requiredMaterials: [],
    instructions:
      "1. Check for disease symptoms\n2. Look for pest damage\n3. Assess tree health\n4. Take photos of issues\n5. Report findings",
    defaultPriority: "Medium",
    isActive: true,
  },
];

// Get all tasks
export function getAllTasks(): ScheduledTask[] {
  if (typeof window === "undefined") return [];

  const stored = localStorage.getItem("scheduled_tasks");
  if (!stored) return getDefaultTasks();

  return JSON.parse(stored);
}

// Get default sample tasks
function getDefaultTasks(): ScheduledTask[] {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + 7);

  return [
    {
      id: "task-1",
      title: "Zone A Fertilization",
      taskType: "Fertilizing",
      priority: "High",
      status: "Pending",
      scheduledDate: today.toISOString().split("T")[0],
      scheduledTime: "08:00",
      dueDate: today.toISOString().split("T")[0],
      estimatedDuration: 180,
      assignedTo: ["Ahmad bin Ali", "Lee Wei Ming"],
      assignedBy: "Admin",
      zone: "A",
      description: "Apply NPK fertilizer to all trees in Zone A",
      instructions:
        "Apply 2-3 kg per tree, water after application, record in system",
      requiredEquipment: ["Fertilizer spreader", "Protective gloves"],
      requiredMaterials: ["NPK Fertilizer (15-15-15) - 200kg"],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      reminderEnabled: true,
      reminderTime: 30,
      isRecurring: true,
      recurrencePattern: "Monthly",
      recurrenceInterval: 1,
    },
    {
      id: "task-2",
      title: "Pest Control - Trees 101-150",
      taskType: "Spraying",
      priority: "Urgent",
      status: "Pending",
      scheduledDate: today.toISOString().split("T")[0],
      scheduledTime: "06:00",
      dueDate: today.toISOString().split("T")[0],
      estimatedDuration: 120,
      assignedTo: ["Kumar a/l Rajan"],
      assignedBy: "Admin",
      zone: "B",
      description: "Spray pesticide on trees showing pest damage",
      instructions:
        "Focus on trees with visible pest damage. Mix pesticide as per instructions.",
      requiredEquipment: ["Sprayer", "Protective suit", "Mask"],
      requiredMaterials: ["Insecticide Spray - 50L"],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      reminderEnabled: true,
      reminderTime: 60,
      isRecurring: false,
    },
    {
      id: "task-3",
      title: "Pruning Session - Musang King Trees",
      taskType: "Pruning",
      priority: "Medium",
      status: "Pending",
      scheduledDate: tomorrow.toISOString().split("T")[0],
      scheduledTime: "07:30",
      dueDate: tomorrow.toISOString().split("T")[0],
      estimatedDuration: 240,
      assignedTo: ["Siti Nurhaliza", "Lee Wei Ming"],
      assignedBy: "Admin",
      zone: "C",
      description: "Prune Musang King trees for better yield",
      instructions:
        "Remove dead branches, thin canopy for light penetration",
      requiredEquipment: ["Pruning shears", "Saw", "Safety gear"],
      requiredMaterials: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      reminderEnabled: true,
      reminderTime: 120,
      isRecurring: false,
    },
    {
      id: "task-4",
      title: "Weekly Health Inspection",
      taskType: "Inspection",
      priority: "Medium",
      status: "Completed",
      scheduledDate: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      scheduledTime: "09:00",
      dueDate: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      estimatedDuration: 90,
      assignedTo: ["Ahmad bin Ali"],
      assignedBy: "Admin",
      description: "Inspect all zones for health issues",
      instructions: "Check for disease, pest damage, and general health",
      requiredEquipment: ["Inspection checklist", "Camera"],
      requiredMaterials: [],
      createdAt: new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      completedAt: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      completedBy: "Ahmad bin Ali",
      completionNotes: "All zones inspected. 3 trees need attention in Zone B.",
      reminderEnabled: false,
      isRecurring: true,
      recurrencePattern: "Weekly",
      recurrenceInterval: 1,
    },
  ];
}

// Save tasks
export function saveTasks(tasks: ScheduledTask[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("scheduled_tasks", JSON.stringify(tasks));
}

// Update task status
export function updateTaskStatus(task: ScheduledTask): ScheduledTask {
  const now = new Date();
  const dueDate = new Date(task.dueDate);

  // Mark as overdue if past due date and not completed
  if (
    task.status !== "Completed" &&
    task.status !== "Cancelled" &&
    now > dueDate
  ) {
    return { ...task, status: "Overdue", updatedAt: new Date().toISOString() };
  }

  return task;
}

// Add new task
export function addTask(
  task: Omit<ScheduledTask, "id" | "createdAt" | "updatedAt">
): ScheduledTask {
  const tasks = getAllTasks();
  const newTask: ScheduledTask = {
    ...task,
    id: `task-${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const updatedTask = updateTaskStatus(newTask);
  tasks.push(updatedTask);
  saveTasks(tasks);

  // Update worker assignments
  updateWorkerAssignments(updatedTask.assignedTo, updatedTask.id);

  return updatedTask;
}

// Update task
export function updateTask(
  id: string,
  updates: Partial<ScheduledTask>
): ScheduledTask | null {
  const tasks = getAllTasks();
  const index = tasks.findIndex((t) => t.id === id);

  if (index === -1) return null;

  const oldAssignees = tasks[index].assignedTo;
  tasks[index] = {
    ...tasks[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  tasks[index] = updateTaskStatus(tasks[index]);

  saveTasks(tasks);

  // Update worker assignments if changed
  const newAssignees = tasks[index].assignedTo;
  if (JSON.stringify(oldAssignees) !== JSON.stringify(newAssignees)) {
    removeWorkerAssignments(oldAssignees, id);
    updateWorkerAssignments(newAssignees, id);
  }

  return tasks[index];
}

// Start task
export function startTask(id: string, startedBy: string): ScheduledTask | null {
  return updateTask(id, {
    status: "In Progress",
    startedAt: new Date().toISOString(),
  });
}

// Complete task
export function completeTask(
  id: string,
  completedBy: string,
  notes?: string
): ScheduledTask | null {
  const task = updateTask(id, {
    status: "Completed",
    completedAt: new Date().toISOString(),
    completedBy,
    completionNotes: notes,
  });

  if (task) {
    // Update worker stats
    incrementWorkerCompletedTasks(completedBy);

    // Create next occurrence if recurring
    if (task.isRecurring && task.recurrencePattern) {
      createNextRecurrence(task);
    }
  }

  return task;
}

// Create next recurring task
function createNextRecurrence(task: ScheduledTask): void {
  if (!task.recurrencePattern || !task.recurrenceInterval) return;

  const currentDate = new Date(task.scheduledDate);
  let nextDate = new Date(currentDate);

  switch (task.recurrencePattern) {
    case "Daily":
      nextDate.setDate(nextDate.getDate() + task.recurrenceInterval);
      break;
    case "Weekly":
      nextDate.setDate(nextDate.getDate() + task.recurrenceInterval * 7);
      break;
    case "Biweekly":
      nextDate.setDate(nextDate.getDate() + 14);
      break;
    case "Monthly":
      nextDate.setMonth(nextDate.getMonth() + task.recurrenceInterval);
      break;
    case "Quarterly":
      nextDate.setMonth(nextDate.getMonth() + 3);
      break;
    case "Yearly":
      nextDate.setFullYear(nextDate.getFullYear() + task.recurrenceInterval);
      break;
  }

  // Don't create if past recurrence end date
  if (task.recurrenceEndDate && nextDate > new Date(task.recurrenceEndDate)) {
    return;
  }

  // Create new task instance
  const newTask: Omit<ScheduledTask, "id" | "createdAt" | "updatedAt"> = {
    ...task,
    status: "Pending",
    scheduledDate: nextDate.toISOString().split("T")[0],
    dueDate: nextDate.toISOString().split("T")[0],
    parentTaskId: task.id,
    startedAt: undefined,
    completedAt: undefined,
    completedBy: undefined,
    completionNotes: undefined,
    reminderSent: false,
  };

  addTask(newTask);
}

// Delete task
export function deleteTask(id: string): boolean {
  const tasks = getAllTasks();
  const task = tasks.find((t) => t.id === id);

  if (!task) return false;

  const filtered = tasks.filter((t) => t.id !== id);
  saveTasks(filtered);

  // Remove from worker assignments
  removeWorkerAssignments(task.assignedTo, id);

  return true;
}

// Get workers
export function getWorkers(): Worker[] {
  if (typeof window === "undefined") return defaultWorkers;

  const stored = localStorage.getItem("workers");
  if (!stored) {
    localStorage.setItem("workers", JSON.stringify(defaultWorkers));
    return defaultWorkers;
  }

  return JSON.parse(stored);
}

// Update worker assignments
function updateWorkerAssignments(workerNames: string[], taskId: string): void {
  const workers = getWorkers();
  const updated = workers.map((w) => {
    if (workerNames.includes(w.name)) {
      return {
        ...w,
        assignedTasks: [...w.assignedTasks, taskId],
        availability: w.assignedTasks.length + 1 >= 5 ? "Busy" as const : w.availability,
      };
    }
    return w;
  });
  localStorage.setItem("workers", JSON.stringify(updated));
}

// Remove worker assignments
function removeWorkerAssignments(workerNames: string[], taskId: string): void {
  const workers = getWorkers();
  const updated = workers.map((w) => {
    if (workerNames.includes(w.name)) {
      const tasks = w.assignedTasks.filter((t) => t !== taskId);
      return {
        ...w,
        assignedTasks: tasks,
        availability: tasks.length < 5 ? "Available" as const : w.availability,
      };
    }
    return w;
  });
  localStorage.setItem("workers", JSON.stringify(updated));
}

// Increment worker completed tasks
function incrementWorkerCompletedTasks(workerName: string): void {
  const workers = getWorkers();
  const updated = workers.map((w) => {
    if (w.name === workerName) {
      return { ...w, completedTasks: w.completedTasks + 1 };
    }
    return w;
  });
  localStorage.setItem("workers", JSON.stringify(updated));
}

// Get task templates
export function getTaskTemplates(): TaskTemplate[] {
  if (typeof window === "undefined") return defaultTemplates;

  const stored = localStorage.getItem("task_templates");
  if (!stored) {
    localStorage.setItem("task_templates", JSON.stringify(defaultTemplates));
    return defaultTemplates;
  }

  return JSON.parse(stored);
}

// Create task from template
export function createTaskFromTemplate(
  templateId: string,
  overrides: Partial<ScheduledTask>
): ScheduledTask | null {
  const templates = getTaskTemplates();
  const template = templates.find((t) => t.id === templateId);

  if (!template) return null;

  const task: Omit<ScheduledTask, "id" | "createdAt" | "updatedAt"> = {
    title: template.name,
    taskType: template.taskType,
    priority: template.defaultPriority,
    status: "Pending",
    scheduledDate: new Date().toISOString().split("T")[0],
    dueDate: new Date().toISOString().split("T")[0],
    estimatedDuration: template.estimatedDuration,
    assignedTo: [],
    assignedBy: "Admin",
    description: template.description,
    instructions: template.instructions,
    requiredEquipment: template.requiredEquipment,
    requiredMaterials: template.requiredMaterials,
    reminderEnabled: false,
    isRecurring: false,
    ...overrides,
  };

  return addTask(task);
}

// Get task statistics
export function getTaskStats(): TaskStats {
  const tasks = getAllTasks().map(updateTaskStatus);
  const now = new Date();
  const todayStr = now.toISOString().split("T")[0];
  const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const totalTasks = tasks.length;
  const pendingTasks = tasks.filter((t) => t.status === "Pending").length;
  const inProgressTasks = tasks.filter((t) => t.status === "In Progress").length;
  const completedTasks = tasks.filter((t) => t.status === "Completed").length;
  const overdueTasks = tasks.filter((t) => t.status === "Overdue").length;
  const tasksToday = tasks.filter((t) => t.scheduledDate === todayStr).length;
  const tasksThisWeek = tasks.filter(
    (t) =>
      new Date(t.scheduledDate) >= now && new Date(t.scheduledDate) <= weekFromNow
  ).length;

  const completionRate =
    totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  // Calculate average completion time
  const completedWithTime = tasks.filter(
    (t) => t.completedAt && t.startedAt
  );
  const totalTime = completedWithTime.reduce((sum, t) => {
    const start = new Date(t.startedAt!).getTime();
    const end = new Date(t.completedAt!).getTime();
    return sum + (end - start);
  }, 0);
  const avgCompletionTime =
    completedWithTime.length > 0
      ? totalTime / completedWithTime.length / (1000 * 60 * 60)
      : 0;

  // Tasks by type
  const tasksByType = tasks.reduce((acc, t) => {
    acc[t.taskType] = (acc[t.taskType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Tasks by worker
  const tasksByWorker = tasks.reduce((acc, t) => {
    t.assignedTo.forEach((worker) => {
      acc[worker] = (acc[worker] || 0) + 1;
    });
    return acc;
  }, {} as Record<string, number>);

  return {
    totalTasks,
    pendingTasks,
    inProgressTasks,
    completedTasks,
    overdueTasks,
    tasksToday,
    tasksThisWeek,
    completionRate,
    avgCompletionTime,
    tasksByType,
    tasksByWorker,
  };
}

// Get upcoming tasks (next 7 days)
export function getUpcomingTasks(): ScheduledTask[] {
  const tasks = getAllTasks().map(updateTaskStatus);
  const now = new Date();
  const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  return tasks
    .filter(
      (t) =>
        t.status !== "Completed" &&
        t.status !== "Cancelled" &&
        new Date(t.scheduledDate) >= now &&
        new Date(t.scheduledDate) <= weekFromNow
    )
    .sort(
      (a, b) =>
        new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime()
    );
}

// Get overdue tasks
export function getOverdueTasks(): ScheduledTask[] {
  const tasks = getAllTasks().map(updateTaskStatus);
  return tasks
    .filter((t) => t.status === "Overdue")
    .sort(
      (a, b) =>
        new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
    );
}

// Get tasks for today
export function getTodaysTasks(): ScheduledTask[] {
  const tasks = getAllTasks().map(updateTaskStatus);
  const todayStr = new Date().toISOString().split("T")[0];

  return tasks
    .filter((t) => t.scheduledDate === todayStr && t.status !== "Completed")
    .sort((a, b) => {
      const priorityOrder = { Urgent: 4, High: 3, Medium: 2, Low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
}
