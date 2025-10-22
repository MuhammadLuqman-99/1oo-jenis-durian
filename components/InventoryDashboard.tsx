'use client';

import { useState, useEffect } from 'react';
import { Package, AlertTriangle, TrendingUp, ShoppingCart, DollarSign, Plus, Edit, Trash2, Download, Filter, Search, X } from 'lucide-react';
import {
  getAllInventoryItems,
  addInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  addStockTransaction,
  getStockTransactions,
  generateInventoryAlerts,
  dismissAlert,
  getAllPurchaseOrders,
  createPurchaseOrder,
  updatePurchaseOrder,
  getAllHarvestInventory,
  addHarvestInventory,
  updateHarvestInventory,
  adjustStock,
  migrateLocalStorageToFirebase,
} from '@/lib/firebaseInventoryService';
import { InventoryItem, StockTransaction, InventoryAlert, PurchaseOrder, HarvestInventory } from '@/types/tree';
import { showSuccess, showError } from '@/lib/toast';

type ViewMode = 'overview' | 'items' | 'transactions' | 'alerts' | 'purchase-orders' | 'harvest';

export default function InventoryDashboard() {
  const [viewMode, setViewMode] = useState<ViewMode>('overview');
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [transactions, setTransactions] = useState<StockTransaction[]>([]);
  const [alerts, setAlerts] = useState<InventoryAlert[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [harvestInventory, setHarvestInventory] = useState<HarvestInventory[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

  // Load all data
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      const [itemsData, transactionsData, alertsData, ordersData, harvestData] = await Promise.all([
        getAllInventoryItems(),
        getStockTransactions(),
        generateInventoryAlerts(),
        getAllPurchaseOrders(),
        getAllHarvestInventory(),
      ]);

      setItems(itemsData);
      setTransactions(transactionsData);
      setAlerts(alertsData);
      setPurchaseOrders(ordersData);
      setHarvestInventory(harvestData);
    } catch (error) {
      console.error('Error loading data:', error);
      showError('Failed to load inventory data');
    }
  };

  // Calculate stats
  const stats = {
    totalItems: items.length,
    totalValue: items.reduce((sum, item) => sum + (item.currentStock * item.unitCost), 0),
    lowStock: items.filter(item => item.currentStock <= item.minStockLevel && item.currentStock > 0).length,
    outOfStock: items.filter(item => item.currentStock === 0).length,
  };

  // Filter items
  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'All' || item.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['All', 'Fertilizer', 'Pesticide', 'Equipment', 'Tools', 'Seeds', 'Other'];

  const handleAddItem = () => {
    setEditingItem(null);
    setShowAddModal(true);
  };

  const handleSaveItem = async (itemData: any) => {
    try {
      if (editingItem) {
        const success = await updateInventoryItem(editingItem.id, itemData);
        if (success) {
          showSuccess('Item updated successfully');
          await loadAllData();
          setShowAddModal(false);
        } else {
          showError('Failed to update item');
        }
      } else {
        const result = await addInventoryItem(itemData);
        if (result) {
          showSuccess('Item added successfully');
          await loadAllData();
          setShowAddModal(false);
        } else {
          showError('Failed to add item');
        }
      }
    } catch (error) {
      console.error('Error saving item:', error);
      showError('Failed to save item');
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (confirm('Are you sure you want to delete this item?')) {
      try {
        const success = await deleteInventoryItem(id);
        if (success) {
          showSuccess('Item deleted successfully');
          await loadAllData();
        } else {
          showError('Failed to delete item');
        }
      } catch (error) {
        console.error('Error deleting item:', error);
        showError('Failed to delete item');
      }
    }
  };

  const handleDismissAlert = async (alertId: string) => {
    try {
      const success = await dismissAlert(alertId);
      if (success) {
        showSuccess('Alert dismissed');
        await loadAllData();
      }
    } catch (error) {
      console.error('Error dismissing alert:', error);
      showError('Failed to dismiss alert');
    }
  };

  return (
    <div className="space-y-6">
      {/* View Mode Tabs */}
      <div className="bg-white rounded-xl shadow-lg p-4">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setViewMode('overview')}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              viewMode === 'overview' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setViewMode('items')}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              viewMode === 'items' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Items ({items.length})
          </button>
          <button
            onClick={() => setViewMode('transactions')}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              viewMode === 'transactions' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Transactions ({transactions.length})
          </button>
          <button
            onClick={() => setViewMode('alerts')}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              viewMode === 'alerts' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Alerts ({alerts.length})
          </button>
          <button
            onClick={() => setViewMode('purchase-orders')}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              viewMode === 'purchase-orders' ? 'bg-orange-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Purchase Orders ({purchaseOrders.length})
          </button>
          <button
            onClick={() => setViewMode('harvest')}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              viewMode === 'harvest' ? 'bg-amber-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Harvest ({harvestInventory.length})
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      {viewMode === 'overview' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <Package size={24} />
              </div>
              <p className="text-3xl font-bold">{stats.totalItems}</p>
              <p className="text-sm mt-2 opacity-90">Total Items</p>
            </div>

            <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <DollarSign size={24} />
              </div>
              <p className="text-3xl font-bold">RM {stats.totalValue.toFixed(2)}</p>
              <p className="text-sm mt-2 opacity-90">Total Value</p>
            </div>

            <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <AlertTriangle size={24} />
              </div>
              <p className="text-3xl font-bold">{stats.lowStock}</p>
              <p className="text-sm mt-2 opacity-90">Low Stock Items</p>
            </div>

            <div className="bg-gradient-to-br from-red-500 to-red-600 text-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <ShoppingCart size={24} />
              </div>
              <p className="text-3xl font-bold">{stats.outOfStock}</p>
              <p className="text-sm mt-2 opacity-90">Out of Stock</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={handleAddItem}
                className="flex items-center gap-3 p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-all border-2 border-green-200"
              >
                <Plus className="text-green-600" size={24} />
                <div className="text-left">
                  <p className="font-semibold text-gray-900">Add New Item</p>
                  <p className="text-sm text-gray-600">Add supplies or equipment</p>
                </div>
              </button>
              <button
                onClick={() => setViewMode('transactions')}
                className="flex items-center gap-3 p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-all border-2 border-purple-200"
              >
                <TrendingUp className="text-purple-600" size={24} />
                <div className="text-left">
                  <p className="font-semibold text-gray-900">View Transactions</p>
                  <p className="text-sm text-gray-600">Track usage & purchases</p>
                </div>
              </button>
              <button
                onClick={() => setViewMode('alerts')}
                className="flex items-center gap-3 p-4 bg-red-50 hover:bg-red-100 rounded-lg transition-all border-2 border-red-200"
              >
                <AlertTriangle className="text-red-600" size={24} />
                <div className="text-left">
                  <p className="font-semibold text-gray-900">Check Alerts</p>
                  <p className="text-sm text-gray-600">{alerts.length} active alerts</p>
                </div>
              </button>
            </div>
          </div>

          {/* Recent Alerts */}
          {alerts.length > 0 && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Recent Alerts</h3>
              <div className="space-y-3">
                {alerts.slice(0, 5).map(alert => (
                  <div
                    key={alert.id}
                    className={`p-4 rounded-lg border-2 ${
                      alert.severity === 'Critical' ? 'bg-red-50 border-red-200' : 'bg-yellow-50 border-yellow-200'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{alert.itemName}</p>
                        <p className="text-sm text-gray-700 mt-1">{alert.message}</p>
                        <p className="text-xs text-gray-500 mt-1">{new Date(alert.createdAt).toLocaleString()}</p>
                      </div>
                      <button
                        onClick={() => handleDismissAlert(alert.id)}
                        className="p-2 hover:bg-white rounded-lg transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Items View */}
      {viewMode === 'items' && (
        <div className="space-y-6">
          {/* Search & Filter */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                />
              </div>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <button
                onClick={handleAddItem}
                className="flex items-center gap-2 px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors"
              >
                <Plus size={20} />
                Add Item
              </button>
            </div>
          </div>

          {/* Items Table */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 border-b-2 border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Category</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Stock</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Unit</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Min Level</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Unit Cost</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Total Value</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                        No items found. Click "Add Item" to create your first inventory item.
                      </td>
                    </tr>
                  ) : (
                    filteredItems.map(item => (
                      <tr key={item.id} className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="px-4 py-3 font-semibold">{item.name}</td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                            {item.category}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`font-semibold ${
                            item.currentStock === 0 ? 'text-red-600' :
                            item.currentStock <= item.minStockLevel ? 'text-yellow-600' :
                            'text-green-600'
                          }`}>
                            {item.currentStock}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm">{item.unit}</td>
                        <td className="px-4 py-3 text-sm">{item.minStockLevel}</td>
                        <td className="px-4 py-3 text-sm">RM {item.unitCost.toFixed(2)}</td>
                        <td className="px-4 py-3 font-semibold">
                          RM {(item.currentStock * item.unitCost).toFixed(2)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setEditingItem(item);
                                setShowAddModal(true);
                              }}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteItem(item.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Transactions View */}
      {viewMode === 'transactions' && (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-xl font-bold text-gray-900">Transaction History</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Date</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Item</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Type</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Quantity</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Cost</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Performed By</th>
                </tr>
              </thead>
              <tbody>
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                      No transactions yet.
                    </td>
                  </tr>
                ) : (
                  transactions.slice(0, 50).map(trans => (
                    <tr key={trans.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm">
                        {new Date(trans.date).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 font-semibold">{trans.itemName}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          trans.type === 'Purchase' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {trans.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {trans.quantity} {trans.unit}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        RM {trans.cost ? trans.cost.toFixed(2) : '0.00'}
                      </td>
                      <td className="px-4 py-3 text-sm">{trans.performedBy}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Alerts View */}
      {viewMode === 'alerts' && (
        <div className="space-y-4">
          {alerts.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
              <AlertTriangle className="mx-auto text-gray-300 mb-4" size={64} />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No Active Alerts</h3>
              <p className="text-gray-600">All inventory items are at healthy levels.</p>
            </div>
          ) : (
            alerts.map(alert => (
              <div
                key={alert.id}
                className={`bg-white rounded-xl shadow-lg p-6 border-l-4 ${
                  alert.severity === 'Critical' ? 'border-red-500' : 'border-yellow-500'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle
                        className={alert.severity === 'Critical' ? 'text-red-500' : 'text-yellow-500'}
                        size={24}
                      />
                      <h4 className="text-lg font-bold text-gray-900">{alert.type}</h4>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        alert.severity === 'Critical' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {alert.severity}
                      </span>
                    </div>
                    <p className="text-gray-700 mb-2">{alert.message}</p>
                    <p className="text-sm text-gray-600">
                      <strong>Action Required:</strong> {alert.actionRequired}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      {new Date(alert.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDismissAlert(alert.id)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Purchase Orders View */}
      {viewMode === 'purchase-orders' && (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <ShoppingCart className="mx-auto text-gray-300 mb-4" size={64} />
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Purchase Orders</h3>
          <p className="text-gray-600">Track and manage purchase orders for inventory restocking.</p>
          <p className="text-sm text-gray-500 mt-4">{purchaseOrders.length} orders in system</p>
        </div>
      )}

      {/* Harvest Inventory View */}
      {viewMode === 'harvest' && (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <Package className="mx-auto text-gray-300 mb-4" size={64} />
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Harvest Inventory</h3>
          <p className="text-gray-600">Track durian harvest with quality grading and storage management.</p>
          <p className="text-sm text-gray-500 mt-4">{harvestInventory.length} harvest records</p>
        </div>
      )}

      {/* Add/Edit Item Modal */}
      {showAddModal && (
        <ItemFormModal
          item={editingItem}
          onSave={handleSaveItem}
          onClose={() => {
            setShowAddModal(false);
            setEditingItem(null);
          }}
        />
      )}
    </div>
  );
}

// Item Form Modal Component
interface ItemFormModalProps {
  item: InventoryItem | null;
  onSave: (data: Partial<InventoryItem>) => void;
  onClose: () => void;
}

function ItemFormModal({ item, onSave, onClose }: ItemFormModalProps) {
  const [formData, setFormData] = useState({
    name: item?.name || '',
    category: item?.category || 'Fertilizer',
    currentStock: item?.currentStock || 0,
    minStockLevel: item?.minStockLevel || 10,
    unit: item?.unit || 'kg',
    unitCost: item?.unitCost || 0,
    supplier: item?.supplier || '',
    location: item?.location || '',
    expiryDate: item?.expiryDate || '',
    notes: item?.notes || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-6 rounded-t-xl">
          <h2 className="text-2xl font-bold">{item ? 'Edit Item' : 'Add New Item'}</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Item Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Category *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none"
              >
                <option value="Fertilizer">Fertilizer</option>
                <option value="Pesticide">Pesticide</option>
                <option value="Equipment">Equipment</option>
                <option value="Tools">Tools</option>
                <option value="Seeds">Seeds</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Current Stock *</label>
              <input
                type="number"
                required
                min="0"
                value={formData.currentStock}
                onChange={(e) => setFormData({ ...formData, currentStock: parseFloat(e.target.value) })}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Min Stock Level *</label>
              <input
                type="number"
                required
                min="0"
                value={formData.minStockLevel}
                onChange={(e) => setFormData({ ...formData, minStockLevel: parseFloat(e.target.value) })}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Unit *</label>
              <input
                type="text"
                required
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                placeholder="kg, liters, pieces"
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Unit Cost (RM) *</label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={formData.unitCost}
                onChange={(e) => setFormData({ ...formData, unitCost: parseFloat(e.target.value) })}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Supplier</label>
              <input
                type="text"
                value={formData.supplier}
                onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Storage Location</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Expiry Date</label>
              <input
                type="date"
                value={formData.expiryDate}
                onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none resize-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors"
            >
              {item ? 'Update' : 'Add'} Item
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
