/**
 * Order Service
 * Manages customer orders and integrates with payment system
 */

import { db } from './firebase';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import {
  CustomerOrder,
  OrderItem,
  ShoppingCart,
  ShippingAddress,
  OrderStatusUpdate,
  PaymentTransaction,
} from '@/types/tree';
import { logActivity } from './activityLog';
import { updateProductStock } from './productService';
import { clearCart } from './cartService';

const ORDERS_COLLECTION = 'customer_orders';
const ORDER_STATUS_COLLECTION = 'order_status_updates';
const PAYMENTS_COLLECTION = 'payment_transactions';

// ============================================
// ORDER MANAGEMENT
// ============================================

/**
 * Generate order number
 */
function generateOrderNumber(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');

  return `ORD-${year}${month}${day}-${random}`;
}

/**
 * Create order from cart
 */
export async function createOrderFromCart(
  cart: ShoppingCart,
  customerInfo: {
    customerId?: string;
    name: string;
    email: string;
    phone: string;
  },
  shippingAddress: ShippingAddress,
  shippingMethod: 'standard' | 'express' | 'pickup',
  paymentMethod: 'curlec' | 'card' | 'fpx' | 'ewallet',
  customerNotes?: string
): Promise<{ orderId: string; order: CustomerOrder } | null> {
  try {
    // Create order items from cart
    const items: OrderItem[] = cart.items.map(cartItem => ({
      id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      productId: cartItem.productId,
      productName: cartItem.product.name,
      variety: cartItem.product.variety,
      quantity: cartItem.quantity,
      unit: cartItem.product.unit,
      price: cartItem.price,
      subtotal: cartItem.subtotal,
      weight: cartItem.selectedWeight,
      notes: cartItem.notes,
    }));

    // Calculate estimated delivery
    const estimatedDelivery = new Date();
    if (shippingMethod === 'standard') {
      estimatedDelivery.setDate(estimatedDelivery.getDate() + 5);
    } else if (shippingMethod === 'express') {
      estimatedDelivery.setDate(estimatedDelivery.getDate() + 2);
    }

    // Create order
    const order: Omit<CustomerOrder, 'id'> = {
      orderNumber: generateOrderNumber(),
      customerId: customerInfo.customerId || 'guest',
      customer: {
        name: customerInfo.name,
        email: customerInfo.email,
        phone: customerInfo.phone,
      },
      items,
      subtotal: cart.subtotal,
      discount: cart.discount,
      discountCode: cart.discountCode,
      tax: cart.tax,
      shippingCost: cart.shippingCost,
      total: cart.total,
      paymentMethod,
      paymentStatus: 'pending',
      shippingAddress,
      shippingMethod,
      estimatedDelivery: estimatedDelivery.toISOString().split('T')[0],
      status: 'pending',
      customerNotes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Save to Firestore
    const docRef = await addDoc(collection(db, ORDERS_COLLECTION), {
      ...order,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    const createdOrder = { id: docRef.id, ...order } as CustomerOrder;

    // Log activity
    logActivity(
      customerInfo.name,
      'create',
      'User Action',
      `New order placed: ${order.orderNumber}`,
      {
        severity: 'info',
        entityType: 'system',
        entityId: docRef.id,
        metadata: {
          total: order.total,
          itemCount: items.length,
          paymentMethod,
        },
      }
    );

    // Add initial status update
    await addOrderStatusUpdate(docRef.id, 'pending', 'Order created', 'System');

    return { orderId: docRef.id, order: createdOrder };
  } catch (error) {
    console.error('Error creating order:', error);
    return null;
  }
}

/**
 * Get order by ID
 */
export async function getOrderById(orderId: string): Promise<CustomerOrder | null> {
  try {
    const docRef = doc(db, ORDERS_COLLECTION, orderId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as CustomerOrder;
    }
    return null;
  } catch (error) {
    console.error('Error fetching order:', error);
    return null;
  }
}

/**
 * Get order by order number
 */
export async function getOrderByNumber(orderNumber: string): Promise<CustomerOrder | null> {
  try {
    const q = query(
      collection(db, ORDERS_COLLECTION),
      where('orderNumber', '==', orderNumber)
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) return null;

    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() } as CustomerOrder;
  } catch (error) {
    console.error('Error fetching order by number:', error);
    return null;
  }
}

/**
 * Get customer orders
 */
export async function getCustomerOrders(customerId: string): Promise<CustomerOrder[]> {
  try {
    const q = query(
      collection(db, ORDERS_COLLECTION),
      where('customerId', '==', customerId),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as CustomerOrder));
  } catch (error) {
    console.error('Error fetching customer orders:', error);
    return [];
  }
}

/**
 * Get all orders (admin)
 */
export async function getAllOrders(): Promise<CustomerOrder[]> {
  try {
    const q = query(
      collection(db, ORDERS_COLLECTION),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as CustomerOrder));
  } catch (error) {
    console.error('Error fetching all orders:', error);
    return [];
  }
}

/**
 * Update order status
 */
export async function updateOrderStatus(
  orderId: string,
  status: CustomerOrder['status'],
  message: string,
  updatedBy: string
): Promise<boolean> {
  try {
    const updateData: any = {
      status,
      updatedAt: serverTimestamp(),
    };

    // Add timestamp for specific statuses
    if (status === 'confirmed') {
      updateData.confirmedAt = new Date().toISOString();
    } else if (status === 'shipped') {
      updateData.shippedAt = new Date().toISOString();
    } else if (status === 'delivered') {
      updateData.deliveredAt = new Date().toISOString();
    } else if (status === 'cancelled') {
      updateData.cancelledAt = new Date().toISOString();
    }

    await updateDoc(doc(db, ORDERS_COLLECTION, orderId), updateData);

    // Add status update
    await addOrderStatusUpdate(orderId, status, message, updatedBy);

    // Log activity
    const order = await getOrderById(orderId);
    if (order) {
      logActivity(
        updatedBy,
        'update',
        'User Action',
        `Order ${order.orderNumber} status: ${status}`,
        {
          severity: status === 'cancelled' ? 'warning' : 'info',
          entityType: 'system',
          entityId: orderId,
          metadata: { status, message },
        }
      );
    }

    // TODO: Send email notification to customer

    return true;
  } catch (error) {
    console.error('Error updating order status:', error);
    return false;
  }
}

/**
 * Confirm order and process payment
 */
export async function confirmOrder(
  orderId: string,
  paymentId?: string
): Promise<boolean> {
  try {
    const order = await getOrderById(orderId);
    if (!order) return false;

    // Update payment status
    await updateDoc(doc(db, ORDERS_COLLECTION, orderId), {
      paymentStatus: 'paid',
      paymentId,
      paidAt: new Date().toISOString(),
      updatedAt: serverTimestamp(),
    });

    // Update order status
    await updateOrderStatus(
      orderId,
      'confirmed',
      'Payment received and order confirmed',
      'System'
    );

    // Reduce product stock
    for (const item of order.items) {
      await updateProductStock(item.productId, -item.quantity);
    }

    return true;
  } catch (error) {
    console.error('Error confirming order:', error);
    return false;
  }
}

/**
 * Cancel order
 */
export async function cancelOrder(
  orderId: string,
  reason: string,
  cancelledBy: string
): Promise<boolean> {
  try {
    const order = await getOrderById(orderId);
    if (!order) return false;

    // Don't allow cancellation if already shipped/delivered
    if (['shipped', 'delivered'].includes(order.status)) {
      throw new Error('Cannot cancel order that has been shipped or delivered');
    }

    // If order was paid, mark for refund
    if (order.paymentStatus === 'paid') {
      await updateDoc(doc(db, ORDERS_COLLECTION, orderId), {
        paymentStatus: 'refunded',
      });

      // TODO: Process refund through payment gateway
    }

    // Restore product stock if order was confirmed
    if (order.status === 'confirmed' || order.status === 'processing') {
      for (const item of order.items) {
        await updateProductStock(item.productId, item.quantity);
      }
    }

    // Update status
    await updateOrderStatus(orderId, 'cancelled', reason, cancelledBy);

    return true;
  } catch (error) {
    console.error('Error cancelling order:', error);
    return false;
  }
}

/**
 * Refund an order
 */
export async function refundOrder(
  orderId: string,
  reason: string,
  refundedBy: string
): Promise<boolean> {
  try {
    const order = await getOrderById(orderId);
    if (!order) return false;

    // Only allow refund for paid orders
    if (order.paymentStatus !== 'paid') {
      throw new Error('Cannot refund order that has not been paid');
    }

    // Update payment status to refunded
    await updateDoc(doc(db, ORDERS_COLLECTION, orderId), {
      paymentStatus: 'refunded',
      updatedAt: serverTimestamp(),
    });

    // Restore product stock
    for (const item of order.items) {
      await updateProductStock(item.productId, item.quantity);
    }

    // Update order status to refunded
    await updateOrderStatus(orderId, 'refunded', reason, refundedBy);

    // TODO: Process refund through Curlec payment gateway

    return true;
  } catch (error) {
    console.error('Error refunding order:', error);
    return false;
  }
}

/**
 * Add tracking number
 */
export async function addTrackingNumber(
  orderId: string,
  trackingNumber: string,
  updatedBy: string
): Promise<boolean> {
  try {
    await updateDoc(doc(db, ORDERS_COLLECTION, orderId), {
      trackingNumber,
      updatedAt: serverTimestamp(),
    });

    await addOrderStatusUpdate(
      orderId,
      'shipped',
      `Order shipped. Tracking number: ${trackingNumber}`,
      updatedBy
    );

    return true;
  } catch (error) {
    console.error('Error adding tracking number:', error);
    return false;
  }
}

// ============================================
// ORDER STATUS UPDATES
// ============================================

/**
 * Add order status update
 */
async function addOrderStatusUpdate(
  orderId: string,
  status: CustomerOrder['status'],
  message: string,
  updatedBy: string
): Promise<void> {
  try {
    await addDoc(collection(db, ORDER_STATUS_COLLECTION), {
      orderId,
      status,
      message,
      updatedBy,
      timestamp: serverTimestamp(),
      notificationSent: false,
    });
  } catch (error) {
    console.error('Error adding status update:', error);
  }
}

/**
 * Get order status history
 */
export async function getOrderStatusHistory(orderId: string): Promise<OrderStatusUpdate[]> {
  try {
    const q = query(
      collection(db, ORDER_STATUS_COLLECTION),
      where('orderId', '==', orderId),
      orderBy('timestamp', 'asc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as OrderStatusUpdate));
  } catch (error) {
    console.error('Error fetching status history:', error);
    return [];
  }
}

// ============================================
// PAYMENT
// ============================================

/**
 * Create payment transaction record
 */
export async function createPaymentTransaction(
  orderId: string,
  customerId: string,
  amount: number,
  paymentMethod: string
): Promise<string | null> {
  try {
    const transaction: Omit<PaymentTransaction, 'id'> = {
      orderId,
      customerId,
      amount,
      currency: 'MYR',
      paymentMethod,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const docRef = await addDoc(collection(db, PAYMENTS_COLLECTION), {
      ...transaction,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return docRef.id;
  } catch (error) {
    console.error('Error creating payment transaction:', error);
    return null;
  }
}

/**
 * Update payment transaction
 */
export async function updatePaymentTransaction(
  transactionId: string,
  updates: Partial<PaymentTransaction>
): Promise<boolean> {
  try {
    await updateDoc(doc(db, PAYMENTS_COLLECTION, transactionId), {
      ...updates,
      updatedAt: serverTimestamp(),
    });

    return true;
  } catch (error) {
    console.error('Error updating payment transaction:', error);
    return false;
  }
}
