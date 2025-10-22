/**
 * Firebase Inventory Service
 * Replaces localStorage with Firestore for production-ready data persistence
 */

import { db } from './firebase';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore';

import {
  InventoryItem,
  StockTransaction,
  InventoryAlert,
  PurchaseOrder,
  HarvestInventory,
} from '@/types/tree';
import { logActivity } from './activityLog';
import { getCurrentUser } from './authService';

// Firestore collection names
const COLLECTIONS = {
  INVENTORY_ITEMS: 'inventory_items',
  STOCK_TRANSACTIONS: 'stock_transactions',
  INVENTORY_ALERTS: 'inventory_alerts',
  PURCHASE_ORDERS: 'purchase_orders',
  HARVEST_INVENTORY: 'harvest_inventory',
};

// ============================================
// INVENTORY ITEMS
// ============================================

export async function getAllInventoryItems(): Promise<InventoryItem[]> {
  try {
    const querySnapshot = await getDocs(collection(db, COLLECTIONS.INVENTORY_ITEMS));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as InventoryItem));
  } catch (error) {
    console.error('Error fetching inventory items:', error);
    return [];
  }
}

export async function getInventoryItemById(id: string): Promise<InventoryItem | null> {
  try {
    const docRef = doc(db, COLLECTIONS.INVENTORY_ITEMS, id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as InventoryItem;
    }
    return null;
  } catch (error) {
    console.error('Error fetching inventory item:', error);
    return null;
  }
}

export async function addInventoryItem(item: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<string | null> {
  try {
    const docRef = await addDoc(collection(db, COLLECTIONS.INVENTORY_ITEMS), {
      ...item,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    // Generate alert if needed
    await checkAndGenerateAlerts({
      id: docRef.id,
      ...item,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as InventoryItem);

    // Log activity
    const user = await getCurrentUser();
    if (user) {
      const userProfile = await import('./authService').then(m => m.getUserProfile(user.uid));
      if (userProfile) {
        logActivity(
          userProfile.name,
          'create',
          'Tree Management',
          `Added inventory item: ${item.name}`,
          {
            severity: 'info',
            entityType: 'tree',
            entityId: docRef.id,
            metadata: { category: item.category, quantity: item.quantity }
          }
        );
      }
    }

    return docRef.id;
  } catch (error) {
    console.error('Error adding inventory item:', error);
    return null;
  }
}

export async function updateInventoryItem(id: string, updates: Partial<InventoryItem>): Promise<boolean> {
  try {
    const docRef = doc(db, COLLECTIONS.INVENTORY_ITEMS, id);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });

    // Check alerts after update
    const item = await getInventoryItemById(id);
    if (item) {
      await checkAndGenerateAlerts(item);
    }

    // Log activity
    const user = await getCurrentUser();
    if (user && item) {
      const userProfile = await import('./authService').then(m => m.getUserProfile(user.uid));
      if (userProfile) {
        logActivity(
          userProfile.name,
          'update',
          'Tree Management',
          `Updated inventory item: ${item.name}`,
          {
            severity: 'info',
            entityType: 'tree',
            entityId: id,
            metadata: { updates: Object.keys(updates) }
          }
        );
      }
    }

    return true;
  } catch (error) {
    console.error('Error updating inventory item:', error);
    return false;
  }
}

export async function deleteInventoryItem(id: string): Promise<boolean> {
  try {
    // Get item name before deleting
    const item = await getInventoryItemById(id);
    const itemName = item?.name || 'Unknown';

    await deleteDoc(doc(db, COLLECTIONS.INVENTORY_ITEMS, id));

    // Remove related alerts
    const alertsQuery = query(
      collection(db, COLLECTIONS.INVENTORY_ALERTS),
      where('itemId', '==', id)
    );
    const alertsSnapshot = await getDocs(alertsQuery);

    const batch = writeBatch(db);
    alertsSnapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });
    await batch.commit();

    // Log activity
    const user = await getCurrentUser();
    if (user) {
      const userProfile = await import('./authService').then(m => m.getUserProfile(user.uid));
      if (userProfile) {
        logActivity(
          userProfile.name,
          'delete',
          'Tree Management',
          `Deleted inventory item: ${itemName}`,
          {
            severity: 'warning',
            entityType: 'tree',
            entityId: id,
          }
        );
      }
    }

    return true;
  } catch (error) {
    console.error('Error deleting inventory item:', error);
    return false;
  }
}

export async function adjustStock(
  itemId: string,
  adjustment: number,
  reason: string,
  performedBy: string
): Promise<boolean> {
  try {
    const item = await getInventoryItemById(itemId);
    if (!item) return false;

    const newStock = item.currentStock + adjustment;

    // Update stock
    await updateInventoryItem(itemId, { currentStock: newStock });

    // Record transaction
    await addStockTransaction({
      itemId: item.id,
      itemName: item.name,
      type: adjustment > 0 ? 'Adjustment (In)' : 'Adjustment (Out)',
      quantity: Math.abs(adjustment),
      unit: item.unit,
      date: new Date().toISOString(),
      notes: reason,
      performedBy,
    });

    return true;
  } catch (error) {
    console.error('Error adjusting stock:', error);
    return false;
  }
}

// ============================================
// STOCK TRANSACTIONS
// ============================================

export async function getStockTransactions(): Promise<StockTransaction[]> {
  try {
    const q = query(
      collection(db, COLLECTIONS.STOCK_TRANSACTIONS),
      orderBy('date', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as StockTransaction));
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return [];
  }
}

export async function addStockTransaction(transaction: Omit<StockTransaction, 'id'>): Promise<string | null> {
  try {
    const docRef = await addDoc(collection(db, COLLECTIONS.STOCK_TRANSACTIONS), transaction);
    return docRef.id;
  } catch (error) {
    console.error('Error adding transaction:', error);
    return null;
  }
}

export async function getTransactionsByItem(itemId: string): Promise<StockTransaction[]> {
  try {
    const q = query(
      collection(db, COLLECTIONS.STOCK_TRANSACTIONS),
      where('itemId', '==', itemId),
      orderBy('date', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as StockTransaction));
  } catch (error) {
    console.error('Error fetching item transactions:', error);
    return [];
  }
}

// ============================================
// INVENTORY ALERTS
// ============================================

export async function generateInventoryAlerts(): Promise<InventoryAlert[]> {
  try {
    const items = await getAllInventoryItems();
    const batch = writeBatch(db);
    const newAlerts: InventoryAlert[] = [];

    // Clear old alerts
    const oldAlertsSnapshot = await getDocs(collection(db, COLLECTIONS.INVENTORY_ALERTS));
    oldAlertsSnapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });

    // Generate new alerts
    for (const item of items) {
      const alerts = generateAlertsForItem(item);
      for (const alert of alerts) {
        const alertRef = doc(collection(db, COLLECTIONS.INVENTORY_ALERTS));
        batch.set(alertRef, alert);
        newAlerts.push({ id: alertRef.id, ...alert });
      }
    }

    await batch.commit();
    return newAlerts;
  } catch (error) {
    console.error('Error generating alerts:', error);
    return [];
  }
}

export async function getInventoryAlerts(): Promise<InventoryAlert[]> {
  try {
    const q = query(
      collection(db, COLLECTIONS.INVENTORY_ALERTS),
      orderBy('severity', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as InventoryAlert));
  } catch (error) {
    console.error('Error fetching alerts:', error);
    return [];
  }
}

export async function dismissAlert(alertId: string): Promise<boolean> {
  try {
    await deleteDoc(doc(db, COLLECTIONS.INVENTORY_ALERTS, alertId));
    return true;
  } catch (error) {
    console.error('Error dismissing alert:', error);
    return false;
  }
}

async function checkAndGenerateAlerts(item: InventoryItem): Promise<void> {
  try {
    // Remove old alerts for this item
    const oldAlertsQuery = query(
      collection(db, COLLECTIONS.INVENTORY_ALERTS),
      where('itemId', '==', item.id)
    );
    const oldAlertsSnapshot = await getDocs(oldAlertsQuery);

    const batch = writeBatch(db);
    oldAlertsSnapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });

    // Generate new alerts
    const alerts = generateAlertsForItem(item);
    for (const alert of alerts) {
      const alertRef = doc(collection(db, COLLECTIONS.INVENTORY_ALERTS));
      batch.set(alertRef, alert);
    }

    await batch.commit();
  } catch (error) {
    console.error('Error checking alerts:', error);
  }
}

function generateAlertsForItem(item: InventoryItem): Omit<InventoryAlert, 'id'>[] {
  const alerts: Omit<InventoryAlert, 'id'>[] = [];

  // Out of stock
  if (item.currentStock <= 0) {
    alerts.push({
      itemId: item.id,
      itemName: item.name,
      type: 'Out of Stock',
      severity: 'critical',
      message: `${item.name} is out of stock`,
      createdAt: new Date().toISOString(),
    });
  }
  // Low stock
  else if (item.currentStock <= item.minimumStock) {
    alerts.push({
      itemId: item.id,
      itemName: item.name,
      type: 'Low Stock',
      severity: 'high',
      message: `${item.name} is running low (${item.currentStock} ${item.unit})`,
      createdAt: new Date().toISOString(),
    });
  }

  // Expiring soon (within 7 days)
  if (item.expiryDate) {
    const expiryDate = new Date(item.expiryDate);
    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

    if (daysUntilExpiry <= 0) {
      alerts.push({
        itemId: item.id,
        itemName: item.name,
        type: 'Expired',
        severity: 'critical',
        message: `${item.name} has expired`,
        createdAt: new Date().toISOString(),
      });
    } else if (daysUntilExpiry <= 7) {
      alerts.push({
        itemId: item.id,
        itemName: item.name,
        type: 'Expiring Soon',
        severity: 'medium',
        message: `${item.name} expires in ${daysUntilExpiry} days`,
        createdAt: new Date().toISOString(),
      });
    }
  }

  return alerts;
}

// ============================================
// PURCHASE ORDERS
// ============================================

export async function getAllPurchaseOrders(): Promise<PurchaseOrder[]> {
  try {
    const q = query(
      collection(db, COLLECTIONS.PURCHASE_ORDERS),
      orderBy('orderDate', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as PurchaseOrder));
  } catch (error) {
    console.error('Error fetching purchase orders:', error);
    return [];
  }
}

export async function getPurchaseOrderById(id: string): Promise<PurchaseOrder | null> {
  try {
    const docRef = doc(db, COLLECTIONS.PURCHASE_ORDERS, id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as PurchaseOrder;
    }
    return null;
  } catch (error) {
    console.error('Error fetching purchase order:', error);
    return null;
  }
}

export async function createPurchaseOrder(order: Omit<PurchaseOrder, 'id' | 'createdAt' | 'updatedAt'>): Promise<string | null> {
  try {
    const docRef = await addDoc(collection(db, COLLECTIONS.PURCHASE_ORDERS), {
      ...order,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating purchase order:', error);
    return null;
  }
}

export async function updatePurchaseOrder(id: string, updates: Partial<PurchaseOrder>): Promise<boolean> {
  try {
    const docRef = doc(db, COLLECTIONS.PURCHASE_ORDERS, id);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });

    // If status changed to "Received", update inventory
    if (updates.status === 'Received') {
      const order = await getPurchaseOrderById(id);
      if (order && order.items) {
        for (const item of order.items) {
          await addStockTransaction({
            itemId: item.itemId,
            itemName: item.itemName,
            type: 'Purchase',
            quantity: item.receivedQuantity || item.quantity,
            unit: item.unit,
            date: new Date().toISOString(),
            cost: item.totalCost,
            supplier: order.supplierName,
            notes: `PO #${order.orderNumber}`,
            performedBy: updates.receivedBy || 'System',
          });
        }
      }
    }

    return true;
  } catch (error) {
    console.error('Error updating purchase order:', error);
    return false;
  }
}

export async function deletePurchaseOrder(id: string): Promise<boolean> {
  try {
    await deleteDoc(doc(db, COLLECTIONS.PURCHASE_ORDERS, id));
    return true;
  } catch (error) {
    console.error('Error deleting purchase order:', error);
    return false;
  }
}

// ============================================
// HARVEST INVENTORY
// ============================================

export async function getAllHarvestInventory(): Promise<HarvestInventory[]> {
  try {
    const q = query(
      collection(db, COLLECTIONS.HARVEST_INVENTORY),
      orderBy('harvestDate', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as HarvestInventory));
  } catch (error) {
    console.error('Error fetching harvest inventory:', error);
    return [];
  }
}

export async function getHarvestInventoryById(id: string): Promise<HarvestInventory | null> {
  try {
    const docRef = doc(db, COLLECTIONS.HARVEST_INVENTORY, id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as HarvestInventory;
    }
    return null;
  } catch (error) {
    console.error('Error fetching harvest inventory:', error);
    return null;
  }
}

export async function addHarvestInventory(harvest: Omit<HarvestInventory, 'id' | 'createdAt' | 'updatedAt'>): Promise<string | null> {
  try {
    const docRef = await addDoc(collection(db, COLLECTIONS.HARVEST_INVENTORY), {
      ...harvest,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding harvest inventory:', error);
    return null;
  }
}

export async function updateHarvestInventory(id: string, updates: Partial<HarvestInventory>): Promise<boolean> {
  try {
    const docRef = doc(db, COLLECTIONS.HARVEST_INVENTORY, id);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
    return true;
  } catch (error) {
    console.error('Error updating harvest inventory:', error);
    return false;
  }
}

export async function deleteHarvestInventory(id: string): Promise<boolean> {
  try {
    await deleteDoc(doc(db, COLLECTIONS.HARVEST_INVENTORY, id));
    return true;
  } catch (error) {
    console.error('Error deleting harvest inventory:', error);
    return false;
  }
}

// ============================================
// DATA MIGRATION UTILITIES
// ============================================

/**
 * Migrate existing localStorage data to Firebase
 * Call this once to transfer all existing data
 */
export async function migrateLocalStorageToFirebase(): Promise<{
  success: boolean;
  itemsMigrated: number;
  transactionsMigrated: number;
  ordersMigrated: number;
  harvestMigrated: number;
}> {
  const result = {
    success: false,
    itemsMigrated: 0,
    transactionsMigrated: 0,
    ordersMigrated: 0,
    harvestMigrated: 0,
  };

  try {
    // Migrate inventory items
    const itemsData = localStorage.getItem('inventory_items');
    if (itemsData) {
      const items = JSON.parse(itemsData) as InventoryItem[];
      for (const item of items) {
        const { id, ...itemData } = item;
        await addInventoryItem(itemData);
        result.itemsMigrated++;
      }
    }

    // Migrate transactions
    const transactionsData = localStorage.getItem('stock_transactions');
    if (transactionsData) {
      const transactions = JSON.parse(transactionsData) as StockTransaction[];
      for (const transaction of transactions) {
        const { id, ...transactionData } = transaction;
        await addStockTransaction(transactionData);
        result.transactionsMigrated++;
      }
    }

    // Migrate purchase orders
    const ordersData = localStorage.getItem('durian_farm_purchase_orders');
    if (ordersData) {
      const orders = JSON.parse(ordersData) as PurchaseOrder[];
      for (const order of orders) {
        const { id, ...orderData } = order;
        await createPurchaseOrder(orderData);
        result.ordersMigrated++;
      }
    }

    // Migrate harvest inventory
    const harvestData = localStorage.getItem('durian_farm_harvest_inventory');
    if (harvestData) {
      const harvests = JSON.parse(harvestData) as HarvestInventory[];
      for (const harvest of harvests) {
        const { id, ...harvestData } = harvest;
        await addHarvestInventory(harvestData);
        result.harvestMigrated++;
      }
    }

    result.success = true;
    console.log('Migration completed:', result);
    return result;
  } catch (error) {
    console.error('Migration error:', error);
    return result;
  }
}
