'use client';

import { Bell, AlertTriangle, Info, CheckCircle } from 'lucide-react';
import { TreeInfo, TreeHealthRecord } from '@/types/tree';

interface AlertsDashboardProps {
  trees: TreeInfo[];
  healthRecords: TreeHealthRecord[];
}

export default function AlertsDashboard({ trees, healthRecords }: AlertsDashboardProps) {
  const criticalAlerts = healthRecords.filter(r => r.healthStatus === 'Sakit').length;
  const warnings = healthRecords.filter(r => r.healthStatus === 'Sederhana').length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-red-500 to-red-600 text-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <AlertTriangle size={24} />
          </div>
          <p className="text-3xl font-bold">{criticalAlerts}</p>
          <p className="text-sm mt-2 opacity-90">Critical Alerts</p>
        </div>
        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <Bell size={24} />
          </div>
          <p className="text-3xl font-bold">{warnings}</p>
          <p className="text-sm mt-2 opacity-90">Warnings</p>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <Info size={24} />
          </div>
          <p className="text-3xl font-bold">0</p>
          <p className="text-sm mt-2 opacity-90">Info</p>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle size={24} />
          </div>
          <p className="text-3xl font-bold">{trees.length - criticalAlerts - warnings}</p>
          <p className="text-sm mt-2 opacity-90">Healthy Trees</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Bell className="text-red-600" size={24} />
          Recent Alerts
        </h3>
        <div className="space-y-3">
          {healthRecords
            .filter(r => r.healthStatus === 'Sakit' || r.healthStatus === 'Sederhana')
            .slice(0, 5)
            .map((record) => (
              <div
                key={record.id}
                className={`p-4 rounded-lg border-l-4 ${
                  record.healthStatus === 'Sakit'
                    ? 'bg-red-50 border-red-500'
                    : 'bg-yellow-50 border-yellow-500'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <AlertTriangle
                        size={16}
                        className={record.healthStatus === 'Sakit' ? 'text-red-600' : 'text-yellow-600'}
                      />
                      <span className="font-semibold">Tree {record.treeNo} - {record.variety}</span>
                    </div>
                    <p className="text-sm text-gray-700">Health Status: {record.healthStatus}</p>
                    {record.diseaseType && (
                      <p className="text-sm text-gray-600">Disease: {record.diseaseType}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">Inspected: {record.inspectionDate}</p>
                  </div>
                </div>
              </div>
            ))}
          {healthRecords.filter(r => r.healthStatus === 'Sakit' || r.healthStatus === 'Sederhana').length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <CheckCircle size={48} className="mx-auto mb-2 text-green-500" />
              <p>No alerts - All trees are healthy!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
