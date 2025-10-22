'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Download, Upload, Database, FileJson, FileSpreadsheet, AlertCircle, CheckCircle } from 'lucide-react';
import {
  exportAllData,
  exportInventoryOnly,
  exportInventoryAsCSV,
  importData,
  getBackupStats,
} from '@/lib/backupService';
import { showSuccess, showError, showWarning } from '@/lib/toast';
import { useAuth } from '@/contexts/AuthContext';

export default function BackupManager() {
  const { userProfile } = useAuth();
  const [stats, setStats] = useState({ totalRecords: 0, dataSize: '0 KB' });
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    const backupStats = await getBackupStats();
    setStats(backupStats);
  };

  const handleExportAll = async () => {
    setLoading(true);
    try {
      await exportAllData(userProfile?.displayName || 'Admin');
      showSuccess('Full backup downloaded successfully!');
    } catch (error: any) {
      showError(error.message || 'Failed to export data');
    } finally {
      setLoading(false);
    }
  };

  const handleExportInventory = async () => {
    setLoading(true);
    try {
      await exportInventoryOnly(userProfile?.displayName || 'Admin');
      showSuccess('Inventory backup downloaded successfully!');
    } catch (error: any) {
      showError(error.message || 'Failed to export inventory');
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = async () => {
    setLoading(true);
    try {
      await exportInventoryAsCSV();
      showSuccess('CSV exported successfully! Open in Excel.');
    } catch (error: any) {
      showError(error.message || 'Failed to export CSV');
    } finally {
      setLoading(false);
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.name.endsWith('.json')) {
      showError('Please select a JSON backup file');
      return;
    }

    setImporting(true);
    try {
      const result = await importData(file);

      if (result.success) {
        showSuccess(`Import successful! Imported ${JSON.stringify(result.stats)}`);
        await loadStats(); // Refresh stats
      } else {
        showError(result.error || 'Import failed');
      }
    } catch (error: any) {
      showError(error.message || 'Failed to import data');
    } finally {
      setImporting(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <Database size={32} />
          <h2 className="text-2xl font-bold">Backup & Export</h2>
        </div>
        <p className="text-blue-100">Download backups or export data for safekeeping</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-2">
            <FileJson className="text-blue-600" size={24} />
            <h3 className="font-semibold text-gray-700">Total Records</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.totalRecords.toLocaleString()}</p>
          <p className="text-sm text-gray-500 mt-1">Across all collections</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-2">
            <Database className="text-green-600" size={24} />
            <h3 className="font-semibold text-gray-700">Data Size</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.dataSize}</p>
          <p className="text-sm text-gray-500 mt-1">Estimated backup size</p>
        </div>
      </div>

      {/* Firebase Automatic Backups Info */}
      <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <CheckCircle className="text-green-600 flex-shrink-0" size={24} />
          <div>
            <h3 className="font-bold text-green-900 mb-2">✅ Automatic Backups Enabled</h3>
            <p className="text-green-800 text-sm mb-3">
              Firebase automatically backs up your data daily. Your data is safe even if you don't manually export!
            </p>
            <ul className="text-green-700 text-sm space-y-1">
              <li>• Daily automatic backups by Google</li>
              <li>• Data stored in multiple locations</li>
              <li>• Point-in-time recovery available</li>
              <li>• 99.99% uptime guarantee</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Export Options */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Manual Export Options</h3>
        <p className="text-gray-600 mb-6">Download backups for extra safety, compliance, or offline archives</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Export All Data */}
          <button
            onClick={handleExportAll}
            disabled={loading}
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-4 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="mx-auto mb-2" size={32} />
            <div className="text-lg">Full Backup</div>
            <div className="text-xs opacity-90">All data (JSON)</div>
          </button>

          {/* Export Inventory Only */}
          <button
            onClick={handleExportInventory}
            disabled={loading}
            className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-semibold py-4 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FileJson className="mx-auto mb-2" size={32} />
            <div className="text-lg">Inventory Only</div>
            <div className="text-xs opacity-90">Inventory data (JSON)</div>
          </button>

          {/* Export as CSV */}
          <button
            onClick={handleExportCSV}
            disabled={loading}
            className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-4 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FileSpreadsheet className="mx-auto mb-2" size={32} />
            <div className="text-lg">Excel Export</div>
            <div className="text-xs opacity-90">Inventory (CSV)</div>
          </button>
        </div>
      </div>

      {/* Import Data */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Import Data</h3>
        <p className="text-gray-600 mb-4">Restore from a previous backup file</p>

        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4 mb-4">
          <div className="flex items-start gap-2">
            <AlertCircle className="text-yellow-600 flex-shrink-0" size={20} />
            <div className="text-sm text-yellow-800">
              <p className="font-semibold mb-1">⚠️ Warning:</p>
              <p>Importing will ADD data to your current database. It won't replace existing data.</p>
            </div>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFileSelect}
          className="hidden"
        />

        <button
          onClick={handleImportClick}
          disabled={importing}
          className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-4 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <Upload size={24} />
          {importing ? 'Importing...' : 'Import from Backup File'}
        </button>
      </div>

      {/* Best Practices */}
      <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
        <h3 className="font-bold text-blue-900 mb-3">💡 Backup Best Practices</h3>
        <ul className="text-blue-800 text-sm space-y-2">
          <li>• <strong>Weekly:</strong> Download a full backup for local archive</li>
          <li>• <strong>Before major changes:</strong> Export data before bulk updates</li>
          <li>• <strong>Store safely:</strong> Keep backups in Google Drive, Dropbox, or external drive</li>
          <li>• <strong>Test restores:</strong> Occasionally test importing to ensure backups work</li>
          <li>• <strong>Multiple copies:</strong> Keep backups in different locations (3-2-1 rule)</li>
        </ul>
      </div>
    </div>
  );
}
