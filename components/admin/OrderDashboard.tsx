'use client';

import { useState, useEffect } from 'react';
import { Search, Eye, Package, Truck, CheckCircle, XCircle, RefreshCw, Download, Filter } from 'lucide-react';
import { CustomerOrder } from '@/types/tree';
import {
  getAllOrders,
  updateOrderStatus,
  cancelOrder,
  refundOrder,
} from '@/lib/orderService';
import { showSuccess, showError } from '@/lib/toast';
import { useAuth } from '@/contexts/AuthContext';

export default function OrderDashboard() {
  const { userProfile } = useAuth();
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<CustomerOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPaymentStatus, setFilterPaymentStatus] = useState<string>('all');

  // Modal states
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<CustomerOrder | null>(null);

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [orders, searchTerm, filterStatus, filterPaymentStatus]);

  const loadOrders = async () => {
    setLoading(true);
    const allOrders = await getAllOrders();
    setOrders(allOrders);
    setLoading(false);
  };

  const filterOrders = () => {
    let filtered = [...orders];

    // Filter by search
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (o) =>
          o.orderNumber.toLowerCase().includes(search) ||
          o.customer.name.toLowerCase().includes(search) ||
          o.customer.email.toLowerCase().includes(search) ||
          o.customer.phone.includes(search)
      );
    }

    // Filter by order status
    if (filterStatus !== 'all') {
      filtered = filtered.filter((o) => o.status === filterStatus);
    }

    // Filter by payment status
    if (filterPaymentStatus !== 'all') {
      filtered = filtered.filter((o) => o.paymentStatus === filterPaymentStatus);
    }

    // Sort by newest first
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    setFilteredOrders(filtered);
  };

  const handleUpdateStatus = async (orderId: string, newStatus: CustomerOrder['status']) => {
    if (!userProfile) {
      showError('User profile not found');
      return;
    }

    try {
      await updateOrderStatus(orderId, newStatus, '', userProfile.name);
      showSuccess(`Order status updated to ${newStatus}`);
      await loadOrders();

      // Update selected order if viewing details
      if (selectedOrder && selectedOrder.id === orderId) {
        const updatedOrder = await import('@/lib/orderService').then(m => m.getOrderById(orderId));
        setSelectedOrder(updatedOrder);
      }
    } catch (error: any) {
      showError(error.message || 'Failed to update order status');
    }
  };

  const handleCancelOrder = async (orderId: string, reason: string) => {
    if (!userProfile) {
      showError('User profile not found');
      return;
    }

    if (!confirm('Are you sure you want to cancel this order? Stock will be restored.')) {
      return;
    }

    try {
      await cancelOrder(orderId, reason, userProfile.name);
      showSuccess('Order cancelled and stock restored');
      await loadOrders();
      setShowDetailModal(false);
    } catch (error: any) {
      showError(error.message || 'Failed to cancel order');
    }
  };

  const handleRefundOrder = async (orderId: string, reason: string) => {
    if (!userProfile) {
      showError('User profile not found');
      return;
    }

    if (!confirm('Are you sure you want to refund this order? Stock will be restored.')) {
      return;
    }

    try {
      await refundOrder(orderId, reason, userProfile.name);
      showSuccess('Order refunded and stock restored');
      await loadOrders();
      setShowDetailModal(false);
    } catch (error: any) {
      showError(error.message || 'Failed to refund order');
    }
  };

  const openDetailModal = (order: CustomerOrder) => {
    setSelectedOrder(order);
    setShowDetailModal(true);
  };

  const getStatusColor = (status: CustomerOrder['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'processing':
        return 'bg-purple-100 text-purple-800';
      case 'shipped':
        return 'bg-indigo-100 text-indigo-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'refunded':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: CustomerOrder['paymentStatus']) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'refunded':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const stats = {
    total: orders.length,
    pending: orders.filter((o) => o.status === 'pending').length,
    processing: orders.filter((o) => o.status === 'processing').length,
    shipped: orders.filter((o) => o.status === 'shipped').length,
    delivered: orders.filter((o) => o.status === 'delivered').length,
    totalRevenue: orders
      .filter((o) => o.paymentStatus === 'paid')
      .reduce((sum, o) => sum + o.total, 0),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Order Dashboard</h2>
        <p className="text-gray-600 mt-1">Manage customer orders and track deliveries</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-4">
          <p className="text-sm text-gray-600 mb-1">Total Orders</p>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4">
          <p className="text-sm text-gray-600 mb-1">Pending</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4">
          <p className="text-sm text-gray-600 mb-1">Processing</p>
          <p className="text-2xl font-bold text-purple-600">{stats.processing}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4">
          <p className="text-sm text-gray-600 mb-1">Shipped</p>
          <p className="text-2xl font-bold text-indigo-600">{stats.shipped}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4">
          <p className="text-sm text-gray-600 mb-1">Delivered</p>
          <p className="text-2xl font-bold text-green-600">{stats.delivered}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4">
          <p className="text-sm text-gray-600 mb-1">Revenue</p>
          <p className="text-2xl font-bold text-green-600">RM {stats.totalRevenue.toFixed(2)}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Search by order number, customer name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>
          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>
          <div>
            <select
              value={filterPaymentStatus}
              onChange={(e) => setFilterPaymentStatus(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="all">All Payments</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending Payment</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading orders...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-12">
            <Package size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-600 text-lg">No orders found</p>
            <p className="text-gray-500 mt-2">
              {searchTerm || filterStatus !== 'all' || filterPaymentStatus !== 'all'
                ? 'Try adjusting your filters'
                : 'No orders have been placed yet'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Items
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{order.orderNumber}</p>
                        <p className="text-xs text-gray-500 capitalize">
                          {order.shippingMethod.replace('-', ' ')}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{order.customer.name}</p>
                        <p className="text-sm text-gray-600">{order.customer.email}</p>
                        <p className="text-xs text-gray-500">{order.customer.phone}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{order.items.length} items</p>
                        <p className="text-xs text-gray-500">
                          {order.items.slice(0, 2).map((item) => item.product.name).join(', ')}
                          {order.items.length > 2 && '...'}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-gray-900">RM {order.total.toFixed(2)}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPaymentStatusColor(
                          order.paymentStatus
                        )}`}
                      >
                        {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-900">
                        {new Date(order.createdAt).toLocaleDateString('en-MY', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(order.createdAt).toLocaleTimeString('en-MY', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => openDetailModal(order)}
                        className="inline-flex items-center px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <Eye size={14} className="mr-1" />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {showDetailModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    Order Details - {selectedOrder.orderNumber}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Placed on{' '}
                    {new Date(selectedOrder.createdAt).toLocaleString('en-MY', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle size={24} />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Status Update Section */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Update Order Status</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {selectedOrder.status !== 'cancelled' && selectedOrder.status !== 'refunded' && (
                    <>
                      {selectedOrder.status === 'pending' && (
                        <button
                          onClick={() => handleUpdateStatus(selectedOrder.id, 'confirmed')}
                          className="px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Confirm Order
                        </button>
                      )}
                      {(selectedOrder.status === 'confirmed' || selectedOrder.status === 'pending') && (
                        <button
                          onClick={() => handleUpdateStatus(selectedOrder.id, 'processing')}
                          className="px-3 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors"
                        >
                          Start Processing
                        </button>
                      )}
                      {(selectedOrder.status === 'processing' || selectedOrder.status === 'confirmed') &&
                        selectedOrder.shippingMethod !== 'pickup' && (
                          <button
                            onClick={() => handleUpdateStatus(selectedOrder.id, 'shipped')}
                            className="px-3 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors"
                          >
                            Mark as Shipped
                          </button>
                        )}
                      {(selectedOrder.status === 'shipped' || selectedOrder.status === 'processing') && (
                        <button
                          onClick={() => handleUpdateStatus(selectedOrder.id, 'delivered')}
                          className="px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                        >
                          Mark as Delivered
                        </button>
                      )}
                      <button
                        onClick={() => handleCancelOrder(selectedOrder.id, 'Cancelled by admin')}
                        className="px-3 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
                      >
                        Cancel Order
                      </button>
                      {selectedOrder.paymentStatus === 'paid' && (
                        <button
                          onClick={() => handleRefundOrder(selectedOrder.id, 'Refunded by admin')}
                          className="px-3 py-2 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors"
                        >
                          Refund Order
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Customer & Shipping Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Customer Information</h4>
                  <div className="space-y-2 text-sm">
                    <p>
                      <span className="text-gray-600">Name:</span>{' '}
                      <span className="font-medium">{selectedOrder.customer.name}</span>
                    </p>
                    <p>
                      <span className="text-gray-600">Email:</span>{' '}
                      <span className="font-medium">{selectedOrder.customer.email}</span>
                    </p>
                    <p>
                      <span className="text-gray-600">Phone:</span>{' '}
                      <span className="font-medium">{selectedOrder.customer.phone}</span>
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">
                    {selectedOrder.shippingMethod === 'pickup' ? 'Pickup Information' : 'Shipping Address'}
                  </h4>
                  {selectedOrder.shippingMethod === 'pickup' ? (
                    <div className="text-sm">
                      <p className="font-medium">Customer will pick up from farm</p>
                      <p className="text-gray-600 mt-2">
                        Recipient: {selectedOrder.shippingAddress.recipientName}
                      </p>
                      <p className="text-gray-600">Phone: {selectedOrder.shippingAddress.phone}</p>
                    </div>
                  ) : (
                    <div className="text-sm">
                      <p className="font-medium">{selectedOrder.shippingAddress.recipientName}</p>
                      <p className="text-gray-600 mt-1">
                        {selectedOrder.shippingAddress.addressLine1}
                        {selectedOrder.shippingAddress.addressLine2 && (
                          <>, {selectedOrder.shippingAddress.addressLine2}</>
                        )}
                      </p>
                      <p className="text-gray-600">
                        {selectedOrder.shippingAddress.postcode} {selectedOrder.shippingAddress.city}
                      </p>
                      <p className="text-gray-600">
                        {selectedOrder.shippingAddress.state}, {selectedOrder.shippingAddress.country}
                      </p>
                      <p className="text-gray-600 mt-1">Phone: {selectedOrder.shippingAddress.phone}</p>
                    </div>
                  )}
                  <div className="mt-3 text-sm">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                        selectedOrder.status
                      )}`}
                    >
                      {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Order Items</h4>
                <div className="space-y-3">
                  {selectedOrder.items.map((item) => (
                    <div
                      key={item.productId}
                      className="flex items-center space-x-4 pb-3 border-b last:border-0"
                    >
                      <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        {item.product.images && item.product.images[0] ? (
                          <img
                            src={item.product.images[0]}
                            alt={item.product.name}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <span className="text-3xl">🥭</span>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{item.product.name}</p>
                        <p className="text-sm text-gray-600">{item.product.variety}</p>
                        <p className="text-sm text-gray-600">
                          RM {item.price.toFixed(2)} × {item.quantity} {item.product.unit}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">RM {item.subtotal.toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Summary */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Order Summary</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">RM {selectedOrder.subtotal.toFixed(2)}</span>
                  </div>
                  {selectedOrder.discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount</span>
                      <span className="font-medium">-RM {selectedOrder.discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax (6% SST)</span>
                    <span className="font-medium">RM {selectedOrder.tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-medium">
                      {selectedOrder.shippingCost === 0
                        ? 'FREE'
                        : `RM ${selectedOrder.shippingCost.toFixed(2)}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-lg font-semibold pt-2 border-t">
                    <span>Total</span>
                    <span className="text-green-600">RM {selectedOrder.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Payment Info */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Payment Information</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Method:</span>
                    <span className="font-medium capitalize">{selectedOrder.paymentMethod}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Status:</span>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPaymentStatusColor(
                        selectedOrder.paymentStatus
                      )}`}
                    >
                      {selectedOrder.paymentStatus.charAt(0).toUpperCase() +
                        selectedOrder.paymentStatus.slice(1)}
                    </span>
                  </div>
                  {selectedOrder.transactions && selectedOrder.transactions.length > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Transaction ID:</span>
                      <span className="font-mono text-xs">
                        {selectedOrder.transactions[0].curlecPaymentId || 'N/A'}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Customer Notes */}
              {selectedOrder.customerNotes && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Customer Notes</h4>
                  <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                    {selectedOrder.customerNotes}
                  </p>
                </div>
              )}

              {/* Status History */}
              {selectedOrder.statusHistory && selectedOrder.statusHistory.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Status History</h4>
                  <div className="space-y-2">
                    {selectedOrder.statusHistory.map((history, index) => (
                      <div key={index} className="text-sm bg-gray-50 p-3 rounded-lg">
                        <div className="flex justify-between">
                          <span className="font-medium capitalize">{history.status}</span>
                          <span className="text-gray-600">
                            {new Date(history.timestamp).toLocaleString('en-MY', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        {history.note && <p className="text-gray-600 mt-1">{history.note}</p>}
                        {history.updatedBy && (
                          <p className="text-xs text-gray-500 mt-1">Updated by: {history.updatedBy}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-6 py-2 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
