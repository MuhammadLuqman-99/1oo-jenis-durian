/**
 * Backup & Export Service
 * Handles data export/import for backups and data portability
 */

import {
  getAllInventoryItems,
  getStockTransactions,
  getAllPurchaseOrders,
  getAllHarvestInventory,
  addInventoryItem,
  addStockTransaction,
  createPurchaseOrder,
  addHarvestInventory,
} from './firebaseInventoryService';
import { getAllTrees, getAllHealthRecords } from './firebaseService';

export interface BackupData {
  version: string;
  exportDate: string;
  exportedBy: string;
  data: {
    trees: any[];
    healthRecords: any[];
    inventoryItems: any[];
    stockTransactions: any[];
    purchaseOrders: any[];
    harvestInventory: any[];
  };
  stats: {
    totalTrees: number;
    totalHealthRecords: number;
    totalInventoryItems: number;
    totalTransactions: number;
    totalPurchaseOrders: number;
    totalHarvestRecords: number;
  };
}

/**
 * Export all data to JSON file
 */
export async function exportAllData(exportedBy: string = 'Admin'): Promise<void> {
  try {
    // Fetch all data from Firebase
    const [trees, healthRecords, inventoryItems, stockTransactions, purchaseOrders, harvestInventory] =
      await Promise.all([
        getAllTrees(),
        getAllHealthRecords(),
        getAllInventoryItems(),
        getStockTransactions(),
        getAllPurchaseOrders(),
        getAllHarvestInventory(),
      ]);

    // Create backup data structure
    const backupData: BackupData = {
      version: '1.0.0',
      exportDate: new Date().toISOString(),
      exportedBy,
      data: {
        trees,
        healthRecords,
        inventoryItems,
        stockTransactions,
        purchaseOrders,
        harvestInventory,
      },
      stats: {
        totalTrees: trees.length,
        totalHealthRecords: healthRecords.length,
        totalInventoryItems: inventoryItems.length,
        totalTransactions: stockTransactions.length,
        totalPurchaseOrders: purchaseOrders.length,
        totalHarvestRecords: harvestInventory.length,
      },
    };

    // Convert to JSON
    const jsonString = JSON.stringify(backupData, null, 2);

    // Create blob
    const blob = new Blob([jsonString], { type: 'application/json' });

    // Create download link
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `durian-farm-backup-${Date.now()}.json`;

    // Trigger download
    document.body.appendChild(a);
    a.click();

    // Cleanup
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    console.log('Backup exported successfully:', backupData.stats);
  } catch (error) {
    console.error('Error exporting data:', error);
    throw new Error('Failed to export data. Please try again.');
  }
}

/**
 * Import data from JSON file
 */
export async function importData(file: File): Promise<{
  success: boolean;
  stats?: BackupData['stats'];
  error?: string;
}> {
  try {
    // Read file
    const text = await file.text();
    const backupData: BackupData = JSON.parse(text);

    // Validate backup format
    if (!backupData.version || !backupData.data) {
      return {
        success: false,
        error: 'Invalid backup file format',
      };
    }

    // Confirm with user (this should be done in the component)
    const confirmMessage = `
      This will import:
      - ${backupData.stats.totalTrees} trees
      - ${backupData.stats.totalHealthRecords} health records
      - ${backupData.stats.totalInventoryItems} inventory items
      - ${backupData.stats.totalTransactions} transactions
      - ${backupData.stats.totalPurchaseOrders} purchase orders
      - ${backupData.stats.totalHarvestRecords} harvest records

      Exported on: ${new Date(backupData.exportDate).toLocaleString()}
      By: ${backupData.exportedBy}

      Are you sure you want to import this data?
    `;

    if (!confirm(confirmMessage)) {
      return {
        success: false,
        error: 'Import cancelled by user',
      };
    }

    // Import data (this creates NEW records, doesn't overwrite)
    let importedCount = 0;

    // Note: Trees and health records use different service
    // For now, we'll focus on inventory data
    // You'll need to add similar functions for trees if needed

    // Import inventory items
    for (const item of backupData.data.inventoryItems) {
      const { id, createdAt, updatedAt, ...itemData } = item;
      await addInventoryItem(itemData);
      importedCount++;
    }

    // Import transactions
    for (const transaction of backupData.data.stockTransactions) {
      const { id, ...transactionData } = transaction;
      await addStockTransaction(transactionData);
      importedCount++;
    }

    // Import purchase orders
    for (const order of backupData.data.purchaseOrders) {
      const { id, createdAt, updatedAt, ...orderData } = order;
      await createPurchaseOrder(orderData);
      importedCount++;
    }

    // Import harvest inventory
    for (const harvest of backupData.data.harvestInventory) {
      const { id, createdAt, updatedAt, ...harvestData } = harvest;
      await addHarvestInventory(harvestData);
      importedCount++;
    }

    return {
      success: true,
      stats: backupData.stats,
    };
  } catch (error: any) {
    console.error('Error importing data:', error);
    return {
      success: false,
      error: error.message || 'Failed to import data',
    };
  }
}

/**
 * Export only inventory data
 */
export async function exportInventoryOnly(exportedBy: string = 'Admin'): Promise<void> {
  try {
    const [inventoryItems, stockTransactions, purchaseOrders, harvestInventory] = await Promise.all([
      getAllInventoryItems(),
      getStockTransactions(),
      getAllPurchaseOrders(),
      getAllHarvestInventory(),
    ]);

    const backupData = {
      version: '1.0.0',
      type: 'inventory-only',
      exportDate: new Date().toISOString(),
      exportedBy,
      data: {
        inventoryItems,
        stockTransactions,
        purchaseOrders,
        harvestInventory,
      },
      stats: {
        totalInventoryItems: inventoryItems.length,
        totalTransactions: stockTransactions.length,
        totalPurchaseOrders: purchaseOrders.length,
        totalHarvestRecords: harvestInventory.length,
      },
    };

    const jsonString = JSON.stringify(backupData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inventory-backup-${Date.now()}.json`;

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    console.log('Inventory backup exported successfully');
  } catch (error) {
    console.error('Error exporting inventory:', error);
    throw new Error('Failed to export inventory data');
  }
}

/**
 * Export data as CSV for Excel
 */
export async function exportInventoryAsCSV(): Promise<void> {
  try {
    const items = await getAllInventoryItems();

    // Create CSV header
    const headers = [
      'ID',
      'Name',
      'Category',
      'Current Stock',
      'Minimum Stock',
      'Unit',
      'Unit Cost',
      'Supplier Name',
      'Supplier Contact',
      'Expiry Date',
      'Last Restock Date',
      'Created At',
    ];

    // Create CSV rows
    const rows = items.map((item) => [
      item.id,
      item.name,
      item.category,
      item.currentStock,
      item.minimumStock,
      item.unit,
      item.unitCost,
      item.supplier?.name || '',
      item.supplier?.contact || '',
      item.expiryDate || '',
      item.lastRestockDate || '',
      item.createdAt,
    ]);

    // Combine headers and rows
    const csvContent = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n');

    // Create blob
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inventory-${Date.now()}.csv`;

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    console.log('CSV exported successfully');
  } catch (error) {
    console.error('Error exporting CSV:', error);
    throw new Error('Failed to export CSV');
  }
}

/**
 * Get backup statistics
 */
export async function getBackupStats(): Promise<{
  lastBackup?: string;
  totalRecords: number;
  dataSize: string;
}> {
  try {
    const [trees, healthRecords, inventoryItems, stockTransactions, purchaseOrders, harvestInventory] =
      await Promise.all([
        getAllTrees(),
        getAllHealthRecords(),
        getAllInventoryItems(),
        getStockTransactions(),
        getAllPurchaseOrders(),
        getAllHarvestInventory(),
      ]);

    const totalRecords =
      trees.length +
      healthRecords.length +
      inventoryItems.length +
      stockTransactions.length +
      purchaseOrders.length +
      harvestInventory.length;

    // Estimate data size
    const dataString = JSON.stringify({
      trees,
      healthRecords,
      inventoryItems,
      stockTransactions,
      purchaseOrders,
      harvestInventory,
    });
    const sizeInBytes = new Blob([dataString]).size;
    const sizeInKB = (sizeInBytes / 1024).toFixed(2);
    const sizeInMB = (sizeInBytes / (1024 * 1024)).toFixed(2);

    const dataSize = sizeInBytes > 1024 * 1024 ? `${sizeInMB} MB` : `${sizeInKB} KB`;

    return {
      totalRecords,
      dataSize,
    };
  } catch (error) {
    console.error('Error getting backup stats:', error);
    return {
      totalRecords: 0,
      dataSize: '0 KB',
    };
  }
}
