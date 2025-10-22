'use client';

import { useState, useEffect } from 'react';
import {
  Activity,
  Calendar,
  User,
  Filter,
  Download,
  Trash2,
  AlertCircle,
  CheckCircle,
  Info,
  AlertTriangle
} from 'lucide-react';
import { ActivityLog, ActivityCategory, ActivityAction } from '@/types/tree';
import {
  getAllActivityLogs,
  getActivityStats,
  exportLogsAsCSV,
  clearOldLogs
} from '@/lib/activityLog';
import { showSuccess } from '@/lib/toast';

export default function ActivityLogDashboard() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<ActivityLog[]>([]);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterAction, setFilterAction] = useState<string>('all');
  const [filterUser, setFilterUser] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState(getActivityStats());

  useEffect(() => {
    loadLogs();
  }, []);

  useEffect(() => {
    filterLogs();
  }, [logs, filterCategory, filterAction, filterUser, searchTerm]);

  const loadLogs = () => {
    const allLogs = getAllActivityLogs();
    setLogs(allLogs);
    setStats(getActivityStats());
  };

  const filterLogs = () => {
    let filtered = logs;

    if (filterCategory !== 'all') {
      filtered = filtered.filter(log => log.category === filterCategory);
    }

    if (filterAction !== 'all') {
      filtered = filtered.filter(log => log.action === filterAction);
    }

    if (filterUser !== 'all') {
      filtered = filtered.filter(log => log.user === filterUser);
    }

    if (searchTerm) {
      filtered = filtered.filter(log =>
        log.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.details?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredLogs(filtered);
  };

  const handleExport = () => {
    const csv = exportLogsAsCSV();
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `activity-logs-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const handleClearOld = () => {
    if (confirm('Clear activities older than 30 days?')) {
      clearOldLogs(30);
      loadLogs();
      showSuccess('Old logs cleared successfully');
    }
  };

  const getSeverityIcon = (severity?: string) => {
    switch (severity) {
      case 'error':
        return <AlertCircle className="text-red-600" size={16} />;
      case 'warning':
        return <AlertTriangle className="text-yellow-600" size={16} />;
      case 'success':
        return <CheckCircle className="text-green-600" size={16} />;
      default:
        return <Info className="text-blue-600" size={16} />;
    }
  };

  const getSeverityColor = (severity?: string) => {
    switch (severity) {
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'success':
        return 'bg-green-50 border-green-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  const getActionBadge = (action: ActivityAction) => {
    const colors: Record<string, string> = {
      create: 'bg-green-100 text-green-800',
      update: 'bg-blue-100 text-blue-800',
      delete: 'bg-red-100 text-red-800',
      login: 'bg-purple-100 text-purple-800',
      logout: 'bg-gray-100 text-gray-800',
      export: 'bg-indigo-100 text-indigo-800',
      import: 'bg-cyan-100 text-cyan-800',
      generate_report: 'bg-pink-100 text-pink-800',
      view: 'bg-teal-100 text-teal-800',
      assign: 'bg-orange-100 text-orange-800',
      complete: 'bg-emerald-100 text-emerald-800',
      sync: 'bg-violet-100 text-violet-800',
      backup: 'bg-amber-100 text-amber-800',
    };

    return colors[action] || 'bg-gray-100 text-gray-800';
  };

  const uniqueUsers = Array.from(new Set(logs.map(log => log.user)));

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <Activity size={24} />
          </div>
          <p className="text-3xl font-bold">{stats.totalActivities}</p>
          <p className="text-sm mt-2 opacity-90">Total Activities</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <Calendar size={24} />
          </div>
          <p className="text-3xl font-bold">{stats.todayActivities}</p>
          <p className="text-sm mt-2 opacity-90">Today</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <Calendar size={24} />
          </div>
          <p className="text-3xl font-bold">{stats.thisWeekActivities}</p>
          <p className="text-sm mt-2 opacity-90">This Week</p>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <User size={24} />
          </div>
          <p className="text-3xl font-bold">{Object.keys(stats.userActivityCount).length}</p>
          <p className="text-sm mt-2 opacity-90">Active Users</p>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Activity by Category</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(stats.categoryBreakdown).map(([category, count]) => (
            <div key={category} className="bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-1">{category}</div>
              <div className="text-2xl font-bold text-gray-900">{count}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Filters and Actions */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex flex-wrap items-center gap-4 mb-4">
          <div className="flex items-center gap-2">
            <Filter className="text-gray-600" size={20} />
            <span className="font-semibold text-gray-900">Filters:</span>
          </div>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="all">All Categories</option>
            <option value="Authentication">Authentication</option>
            <option value="Tree Management">Tree Management</option>
            <option value="Health Records">Health Records</option>
            <option value="Farm Activities">Farm Activities</option>
            <option value="Reports">Reports</option>
            <option value="Data Sync">Data Sync</option>
            <option value="System">System</option>
            <option value="User Action">User Action</option>
          </select>

          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="all">All Actions</option>
            <option value="create">Create</option>
            <option value="update">Update</option>
            <option value="delete">Delete</option>
            <option value="login">Login</option>
            <option value="logout">Logout</option>
            <option value="export">Export</option>
            <option value="view">View</option>
          </select>

          <select
            value={filterUser}
            onChange={(e) => setFilterUser(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="all">All Users</option>
            {uniqueUsers.map(user => (
              <option key={user} value={user}>{user}</option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Search activities..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm flex-1 min-w-[200px]"
          />

          <button
            onClick={handleExport}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Download size={18} />
            Export CSV
          </button>

          <button
            onClick={handleClearOld}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Trash2 size={18} />
            Clear Old
          </button>
        </div>

        <div className="text-sm text-gray-600 mb-4">
          Showing {filteredLogs.length} of {logs.length} activities
        </div>

        {/* Activity Log List */}
        <div className="space-y-2 max-h-[600px] overflow-y-auto">
          {filteredLogs.map((log) => (
            <div
              key={log.id}
              className={`border rounded-lg p-4 ${getSeverityColor(log.severity)}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {getSeverityIcon(log.severity)}
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getActionBadge(log.action)}`}>
                      {log.action}
                    </span>
                    <span className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs font-medium">
                      {log.category}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(log.timestamp).toLocaleString('en-MY', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mb-1">
                    <User className="text-gray-600" size={14} />
                    <span className="font-semibold text-gray-900">{log.user}</span>
                  </div>

                  <p className="text-sm text-gray-700 mb-1">{log.description}</p>

                  {log.details && (
                    <p className="text-xs text-gray-600 mt-1">{log.details}</p>
                  )}

                  {log.entityType && (
                    <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                      <span className="px-2 py-0.5 bg-white rounded border">
                        {log.entityType}: {log.entityId}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {filteredLogs.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <Activity size={48} className="mx-auto mb-4 opacity-50" />
              <p>No activities found matching your filters.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
