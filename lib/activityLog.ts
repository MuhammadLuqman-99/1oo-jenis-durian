import { ActivityLog, ActivityAction, ActivityCategory, ActivityStats } from '@/types/tree';

const ACTIVITY_LOG_KEY = 'activityLogs';
const MAX_LOGS = 1000; // Keep last 1000 activities

// Get all activity logs
export function getAllActivityLogs(): ActivityLog[] {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem(ACTIVITY_LOG_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error loading activity logs:', error);
    return [];
  }
}

// Add a new activity log
export function logActivity(
  user: string,
  action: ActivityAction,
  category: ActivityCategory,
  description: string,
  options?: {
    details?: string;
    entityType?: ActivityLog['entityType'];
    entityId?: string;
    severity?: ActivityLog['severity'];
    metadata?: Record<string, any>;
  }
): void {
  if (typeof window === 'undefined') return;

  const newLog: ActivityLog = {
    id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
    user,
    action,
    category,
    description,
    severity: options?.severity || 'info',
    ...options,
  };

  try {
    const logs = getAllActivityLogs();
    const updatedLogs = [newLog, ...logs].slice(0, MAX_LOGS); // Keep only latest MAX_LOGS
    localStorage.setItem(ACTIVITY_LOG_KEY, JSON.stringify(updatedLogs));
  } catch (error) {
    console.error('Error saving activity log:', error);
  }
}

// Get activity statistics
export function getActivityStats(): ActivityStats {
  const logs = getAllActivityLogs();
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const todayLogs = logs.filter(log => new Date(log.timestamp) >= today);
  const weekLogs = logs.filter(log => new Date(log.timestamp) >= weekAgo);

  const userActivityCount: Record<string, number> = {};
  const categoryBreakdown: Record<ActivityCategory, number> = {} as any;
  const actionBreakdown: Record<ActivityAction, number> = {} as any;

  logs.forEach(log => {
    // User count
    userActivityCount[log.user] = (userActivityCount[log.user] || 0) + 1;

    // Category breakdown
    categoryBreakdown[log.category] = (categoryBreakdown[log.category] || 0) + 1;

    // Action breakdown
    actionBreakdown[log.action] = (actionBreakdown[log.action] || 0) + 1;
  });

  return {
    totalActivities: logs.length,
    todayActivities: todayLogs.length,
    thisWeekActivities: weekLogs.length,
    userActivityCount,
    categoryBreakdown,
    actionBreakdown,
  };
}

// Filter logs by date range
export function getLogsByDateRange(startDate: string, endDate: string): ActivityLog[] {
  const logs = getAllActivityLogs();
  const start = new Date(startDate);
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);

  return logs.filter(log => {
    const logDate = new Date(log.timestamp);
    return logDate >= start && logDate <= end;
  });
}

// Filter logs by user
export function getLogsByUser(user: string): ActivityLog[] {
  return getAllActivityLogs().filter(log => log.user === user);
}

// Filter logs by category
export function getLogsByCategory(category: ActivityCategory): ActivityLog[] {
  return getAllActivityLogs().filter(log => log.category === category);
}

// Filter logs by action
export function getLogsByAction(action: ActivityAction): ActivityLog[] {
  return getAllActivityLogs().filter(log => log.action === action);
}

// Clear old logs (older than specified days)
export function clearOldLogs(daysToKeep: number = 30): void {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

  const logs = getAllActivityLogs();
  const recentLogs = logs.filter(log => new Date(log.timestamp) >= cutoffDate);

  localStorage.setItem(ACTIVITY_LOG_KEY, JSON.stringify(recentLogs));
}

// Export logs as JSON
export function exportLogs(): string {
  const logs = getAllActivityLogs();
  return JSON.stringify(logs, null, 2);
}

// Export logs as CSV
export function exportLogsAsCSV(): string {
  const logs = getAllActivityLogs();
  const headers = ['Timestamp', 'User', 'Action', 'Category', 'Description', 'Severity', 'Entity Type', 'Entity ID'];
  const rows = logs.map(log => [
    log.timestamp,
    log.user,
    log.action,
    log.category,
    log.description,
    log.severity || '',
    log.entityType || '',
    log.entityId || ''
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  return csvContent;
}
