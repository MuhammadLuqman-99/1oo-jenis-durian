/**
 * Shopping Cart Service
 * Manages customer shopping cart with localStorage persistence
 */

import { ShoppingCart, CartItem, Product, DiscountCode } from '@/types/tree';
import { getProductById } from './productService';

const CART_KEY = 'durian_shopping_cart';
const TAX_RATE = 0.06; // 6% SST (Malaysia)

// ============================================
// CART MANAGEMENT
// ============================================

/**
 * Get current cart
 */
export function getCart(): ShoppingCart {
  if (typeof window === 'undefined') {
    return createEmptyCart();
  }

  try {
    const stored = localStorage.getItem(CART_KEY);
    if (!stored) {
      return createEmptyCart();
    }

    return JSON.parse(stored);
  } catch (error) {
    console.error('Error loading cart:', error);
    return createEmptyCart();
  }
}

/**
 * Create empty cart
 */
function createEmptyCart(): ShoppingCart {
  return {
    id: `cart_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    items: [],
    subtotal: 0,
    discount: 0,
    tax: 0,
    shippingCost: 0,
    total: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Save cart to localStorage
 */
function saveCart(cart: ShoppingCart): void {
  if (typeof window === 'undefined') return;

  try {
    cart.updatedAt = new Date().toISOString();
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  } catch (error) {
    console.error('Error saving cart:', error);
  }
}

/**
 * Calculate cart totals
 */
function calculateTotals(cart: ShoppingCart): ShoppingCart {
  // Calculate subtotal
  const subtotal = cart.items.reduce((sum, item) => sum + item.subtotal, 0);

  // Apply discount
  let discount = 0;
  if (cart.discountCode) {
    // Discount calculation will be handled by applyDiscountCode function
    discount = cart.discount;
  }

  // Calculate tax on (subtotal - discount)
  const taxableAmount = subtotal - discount;
  const tax = Math.round(taxableAmount * TAX_RATE * 100) / 100;

  // Calculate total
  const total = subtotal - discount + tax + cart.shippingCost;

  return {
    ...cart,
    subtotal,
    discount,
    tax,
    total,
  };
}

/**
 * Add item to cart
 */
export async function addToCart(
  productId: string,
  quantity: number = 1,
  selectedWeight?: number,
  notes?: string
): Promise<ShoppingCart> {
  const cart = getCart();

  // Get product details
  const product = await getProductById(productId);
  if (!product) {
    throw new Error('Product not found');
  }

  if (!product.inStock || product.stockQuantity < quantity) {
    throw new Error('Product out of stock');
  }

  // Check if item already in cart
  const existingItemIndex = cart.items.findIndex(item => item.productId === productId);

  if (existingItemIndex >= 0) {
    // Update quantity
    const existingItem = cart.items[existingItemIndex];
    const newQuantity = existingItem.quantity + quantity;

    if (product.stockQuantity < newQuantity) {
      throw new Error('Not enough stock');
    }

    cart.items[existingItemIndex] = {
      ...existingItem,
      quantity: newQuantity,
      subtotal: existingItem.price * newQuantity,
    };
  } else {
    // Add new item
    const cartItem: CartItem = {
      productId: product.id,
      product,
      quantity,
      selectedWeight,
      price: product.price,
      subtotal: product.price * quantity,
      notes,
    };

    cart.items.push(cartItem);
  }

  const updatedCart = calculateTotals(cart);
  saveCart(updatedCart);

  return updatedCart;
}

/**
 * Update item quantity
 */
export function updateCartItemQuantity(productId: string, quantity: number): ShoppingCart {
  const cart = getCart();

  const itemIndex = cart.items.findIndex(item => item.productId === productId);
  if (itemIndex === -1) {
    throw new Error('Item not in cart');
  }

  if (quantity <= 0) {
    // Remove item
    return removeFromCart(productId);
  }

  // Update quantity
  const item = cart.items[itemIndex];
  cart.items[itemIndex] = {
    ...item,
    quantity,
    subtotal: item.price * quantity,
  };

  const updatedCart = calculateTotals(cart);
  saveCart(updatedCart);

  return updatedCart;
}

/**
 * Remove item from cart
 */
export function removeFromCart(productId: string): ShoppingCart {
  const cart = getCart();

  cart.items = cart.items.filter(item => item.productId !== productId);

  const updatedCart = calculateTotals(cart);
  saveCart(updatedCart);

  return updatedCart;
}

/**
 * Clear cart
 */
export function clearCart(): ShoppingCart {
  const emptyCart = createEmptyCart();
  saveCart(emptyCart);
  return emptyCart;
}

/**
 * Get cart item count
 */
export function getCartItemCount(): number {
  const cart = getCart();
  return cart.items.reduce((count, item) => count + item.quantity, 0);
}

/**
 * Get cart total
 */
export function getCartTotal(): number {
  const cart = getCart();
  return cart.total;
}

// ============================================
// DISCOUNT CODES
// ============================================

/**
 * Apply discount code
 */
export async function applyDiscountCode(code: string): Promise<{
  success: boolean;
  message: string;
  cart?: ShoppingCart;
}> {
  const cart = getCart();

  if (cart.items.length === 0) {
    return {
      success: false,
      message: 'Cart is empty',
    };
  }

  // TODO: Fetch discount code from Firestore
  // For now, hardcode some sample codes
  const discountCodes: Record<string, DiscountCode> = {
    'WELCOME10': {
      id: '1',
      code: 'WELCOME10',
      type: 'percentage',
      value: 10,
      minPurchase: 50,
      usageLimit: 1000,
      usageCount: 0,
      validFrom: '2025-01-01',
      isActive: true,
      createdBy: 'admin',
      createdAt: '2025-01-01',
    },
    'SAVE20': {
      id: '2',
      code: 'SAVE20',
      type: 'fixed',
      value: 20,
      minPurchase: 100,
      usageLimit: 500,
      usageCount: 0,
      validFrom: '2025-01-01',
      isActive: true,
      createdBy: 'admin',
      createdAt: '2025-01-01',
    },
  };

  const discountCode = discountCodes[code.toUpperCase()];

  if (!discountCode) {
    return {
      success: false,
      message: 'Invalid discount code',
    };
  }

  if (!discountCode.isActive) {
    return {
      success: false,
      message: 'This discount code is no longer active',
    };
  }

  if (discountCode.validUntil && new Date() > new Date(discountCode.validUntil)) {
    return {
      success: false,
      message: 'This discount code has expired',
    };
  }

  if (discountCode.minPurchase && cart.subtotal < discountCode.minPurchase) {
    return {
      success: false,
      message: `Minimum purchase of RM${discountCode.minPurchase} required`,
    };
  }

  if (discountCode.usageLimit && discountCode.usageCount >= discountCode.usageLimit) {
    return {
      success: false,
      message: 'This discount code has reached its usage limit',
    };
  }

  // Calculate discount
  let discountAmount = 0;
  if (discountCode.type === 'percentage') {
    discountAmount = (cart.subtotal * discountCode.value) / 100;
    if (discountCode.maxDiscount) {
      discountAmount = Math.min(discountAmount, discountCode.maxDiscount);
    }
  } else {
    discountAmount = discountCode.value;
  }

  // Apply discount
  cart.discountCode = discountCode.code;
  cart.discount = Math.round(discountAmount * 100) / 100;

  const updatedCart = calculateTotals(cart);
  saveCart(updatedCart);

  return {
    success: true,
    message: `Discount applied: RM${updatedCart.discount.toFixed(2)} off!`,
    cart: updatedCart,
  };
}

/**
 * Remove discount code
 */
export function removeDiscountCode(): ShoppingCart {
  const cart = getCart();

  cart.discountCode = undefined;
  cart.discount = 0;

  const updatedCart = calculateTotals(cart);
  saveCart(updatedCart);

  return updatedCart;
}

// ============================================
// SHIPPING
// ============================================

/**
 * Update shipping method
 */
export function updateShippingCost(shippingCost: number): ShoppingCart {
  const cart = getCart();

  cart.shippingCost = shippingCost;

  const updatedCart = calculateTotals(cart);
  saveCart(updatedCart);

  return updatedCart;
}

/**
 * Calculate shipping cost based on total and method
 */
export function calculateShippingCost(
  total: number,
  method: 'standard' | 'express' | 'pickup'
): number {
  if (method === 'pickup') {
    return 0;
  }

  // Free shipping for orders above RM150
  if (total >= 150) {
    return 0;
  }

  // Standard: RM10, Express: RM20
  return method === 'express' ? 20 : 10;
}

// ============================================
// VALIDATION
// ============================================

/**
 * Validate cart before checkout
 */
export async function validateCart(): Promise<{
  isValid: boolean;
  errors: string[];
}> {
  const cart = getCart();
  const errors: string[] = [];

  if (cart.items.length === 0) {
    errors.push('Cart is empty');
    return { isValid: false, errors };
  }

  // Validate each item
  for (const item of cart.items) {
    const product = await getProductById(item.productId);

    if (!product) {
      errors.push(`Product "${item.product.name}" no longer exists`);
      continue;
    }

    if (!product.inStock) {
      errors.push(`Product "${product.name}" is out of stock`);
      continue;
    }

    if (product.stockQuantity < item.quantity) {
      errors.push(`Only ${product.stockQuantity} units of "${product.name}" available`);
      continue;
    }

    // Check if price changed
    if (product.price !== item.price) {
      errors.push(`Price of "${product.name}" has changed`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
