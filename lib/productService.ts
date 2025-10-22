/**
 * Product Service
 * Manages product catalog for customer-facing e-commerce
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
  limit,
  serverTimestamp,
} from 'firebase/firestore';
import { Product, ProductReview } from '@/types/tree';
import { logActivity } from './activityLog';
import { getCurrentUser, getUserProfile } from './authService';

const PRODUCTS_COLLECTION = 'products';
const REVIEWS_COLLECTION = 'product_reviews';

// ============================================
// PRODUCT MANAGEMENT
// ============================================

/**
 * Get all products (with optional filters)
 */
export async function getAllProducts(filters?: {
  isPublished?: boolean;
  category?: string;
  inStock?: boolean;
}): Promise<Product[]> {
  try {
    let q = query(collection(db, PRODUCTS_COLLECTION), orderBy('createdAt', 'desc'));

    if (filters?.isPublished !== undefined) {
      q = query(q, where('isPublished', '==', filters.isPublished));
    }
    if (filters?.category) {
      q = query(q, where('category', '==', filters.category));
    }
    if (filters?.inStock !== undefined) {
      q = query(q, where('inStock', '==', filters.inStock));
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Product));
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}

/**
 * Get featured products for homepage
 */
export async function getFeaturedProducts(limitCount: number = 6): Promise<Product[]> {
  try {
    const q = query(
      collection(db, PRODUCTS_COLLECTION),
      where('isPublished', '==', true),
      where('isFeatured', '==', true),
      where('inStock', '==', true),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Product));
  } catch (error) {
    console.error('Error fetching featured products:', error);
    return [];
  }
}

/**
 * Get single product by ID
 */
export async function getProductById(id: string): Promise<Product | null> {
  try {
    const docRef = doc(db, PRODUCTS_COLLECTION, id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Product;
    }
    return null;
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
}

/**
 * Create new product
 */
export async function createProduct(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<string | null> {
  try {
    const docRef = await addDoc(collection(db, PRODUCTS_COLLECTION), {
      ...product,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    // Log activity
    const user = getCurrentUser();
    if (user) {
      const userProfile = await getUserProfile(user.uid);
      if (userProfile) {
        logActivity(
          userProfile.name,
          'create',
          'Tree Management',
          `Created product: ${product.name}`,
          {
            severity: 'info',
            entityType: 'tree',
            entityId: docRef.id,
            metadata: { variety: product.variety, price: product.price }
          }
        );
      }
    }

    return docRef.id;
  } catch (error) {
    console.error('Error creating product:', error);
    return null;
  }
}

/**
 * Update existing product
 */
export async function updateProduct(id: string, updates: Partial<Product>): Promise<boolean> {
  try {
    const docRef = doc(db, PRODUCTS_COLLECTION, id);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });

    // Get product name for logging
    const product = await getProductById(id);

    // Log activity
    const user = getCurrentUser();
    if (user && product) {
      const userProfile = await getUserProfile(user.uid);
      if (userProfile) {
        logActivity(
          userProfile.name,
          'update',
          'Tree Management',
          `Updated product: ${product.name}`,
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
    console.error('Error updating product:', error);
    return false;
  }
}

/**
 * Delete product
 */
export async function deleteProduct(id: string): Promise<boolean> {
  try {
    // Get product info before deleting
    const product = await getProductById(id);
    const productName = product?.name || 'Unknown';

    await deleteDoc(doc(db, PRODUCTS_COLLECTION, id));

    // Log activity
    const user = getCurrentUser();
    if (user) {
      const userProfile = await getUserProfile(user.uid);
      if (userProfile) {
        logActivity(
          userProfile.name,
          'delete',
          'Tree Management',
          `Deleted product: ${productName}`,
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
    console.error('Error deleting product:', error);
    return false;
  }
}

/**
 * Update product stock
 */
export async function updateProductStock(id: string, quantity: number): Promise<boolean> {
  try {
    const product = await getProductById(id);
    if (!product) return false;

    const newQuantity = product.stockQuantity + quantity;
    const inStock = newQuantity > 0;

    await updateDoc(doc(db, PRODUCTS_COLLECTION, id), {
      stockQuantity: newQuantity,
      inStock,
      updatedAt: serverTimestamp(),
    });

    // Log activity
    const user = getCurrentUser();
    if (user) {
      const userProfile = await getUserProfile(user.uid);
      if (userProfile) {
        logActivity(
          userProfile.name,
          'update',
          'Tree Management',
          `Updated stock for ${product.name}: ${quantity > 0 ? '+' : ''}${quantity}`,
          {
            severity: 'info',
            entityType: 'tree',
            entityId: id,
            metadata: { oldStock: product.stockQuantity, newStock: newQuantity }
          }
        );
      }
    }

    return true;
  } catch (error) {
    console.error('Error updating product stock:', error);
    return false;
  }
}

/**
 * Search products
 */
export async function searchProducts(searchTerm: string): Promise<Product[]> {
  try {
    // Note: Firestore doesn't support full-text search natively
    // This is a basic implementation. For production, use Algolia or Elasticsearch
    const products = await getAllProducts({ isPublished: true });

    const lowerSearch = searchTerm.toLowerCase();
    return products.filter(p =>
      p.name.toLowerCase().includes(lowerSearch) ||
      p.variety.toLowerCase().includes(lowerSearch) ||
      p.description.toLowerCase().includes(lowerSearch) ||
      p.tags?.some(tag => tag.toLowerCase().includes(lowerSearch))
    );
  } catch (error) {
    console.error('Error searching products:', error);
    return [];
  }
}

// ============================================
// PRODUCT REVIEWS
// ============================================

/**
 * Get reviews for a product
 */
export async function getProductReviews(productId: string): Promise<ProductReview[]> {
  try {
    const q = query(
      collection(db, REVIEWS_COLLECTION),
      where('productId', '==', productId),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as ProductReview));
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return [];
  }
}

/**
 * Add product review
 */
export async function addProductReview(review: Omit<ProductReview, 'id' | 'createdAt' | 'updatedAt' | 'helpful'>): Promise<string | null> {
  try {
    const docRef = await addDoc(collection(db, REVIEWS_COLLECTION), {
      ...review,
      helpful: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    // Update product rating
    await updateProductRating(review.productId);

    return docRef.id;
  } catch (error) {
    console.error('Error adding review:', error);
    return null;
  }
}

/**
 * Update product rating based on reviews
 */
async function updateProductRating(productId: string): Promise<void> {
  try {
    const reviews = await getProductReviews(productId);

    if (reviews.length === 0) {
      await updateDoc(doc(db, PRODUCTS_COLLECTION, productId), {
        rating: 0,
        reviewCount: 0,
      });
      return;
    }

    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / reviews.length;

    await updateDoc(doc(db, PRODUCTS_COLLECTION, productId), {
      rating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
      reviewCount: reviews.length,
    });
  } catch (error) {
    console.error('Error updating product rating:', error);
  }
}

/**
 * Respond to review (admin only)
 */
export async function respondToReview(
  reviewId: string,
  response: string,
  respondedBy: string
): Promise<boolean> {
  try {
    await updateDoc(doc(db, REVIEWS_COLLECTION, reviewId), {
      response: {
        message: response,
        respondedBy,
        respondedAt: new Date().toISOString(),
      },
      updatedAt: serverTimestamp(),
    });

    return true;
  } catch (error) {
    console.error('Error responding to review:', error);
    return false;
  }
}

/**
 * Mark review as helpful
 */
export async function markReviewHelpful(reviewId: string): Promise<boolean> {
  try {
    const reviewDoc = await getDoc(doc(db, REVIEWS_COLLECTION, reviewId));
    if (!reviewDoc.exists()) return false;

    const review = reviewDoc.data() as ProductReview;
    await updateDoc(doc(db, REVIEWS_COLLECTION, reviewId), {
      helpful: review.helpful + 1,
    });

    return true;
  } catch (error) {
    console.error('Error marking review helpful:', error);
    return false;
  }
}

/**
 * Publish a product (make it visible to customers)
 */
export async function publishProduct(id: string): Promise<boolean> {
  try {
    await updateDoc(doc(db, PRODUCTS_COLLECTION, id), {
      isPublished: true,
      updatedAt: serverTimestamp(),
    });

    // Log activity
    const user = getCurrentUser();
    if (user) {
      const userProfile = await getUserProfile(user.uid);
      if (userProfile) {
        const product = await getProductById(id);
        logActivity(
          userProfile.name,
          'update',
          'Tree Management',
          `Published product: ${product?.name}`,
          { severity: 'info', entityType: 'tree', entityId: id }
        );
      }
    }

    return true;
  } catch (error) {
    console.error('Error publishing product:', error);
    return false;
  }
}

/**
 * Unpublish a product (hide it from customers)
 */
export async function unpublishProduct(id: string): Promise<boolean> {
  try {
    await updateDoc(doc(db, PRODUCTS_COLLECTION, id), {
      isPublished: false,
      updatedAt: serverTimestamp(),
    });

    // Log activity
    const user = getCurrentUser();
    if (user) {
      const userProfile = await getUserProfile(user.uid);
      if (userProfile) {
        const product = await getProductById(id);
        logActivity(
          userProfile.name,
          'update',
          'Tree Management',
          `Unpublished product: ${product?.name}`,
          { severity: 'info', entityType: 'tree', entityId: id }
        );
      }
    }

    return true;
  } catch (error) {
    console.error('Error unpublishing product:', error);
    return false;
  }
}
