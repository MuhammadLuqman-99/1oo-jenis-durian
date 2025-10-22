'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ShoppingCart, Star, Truck, Shield, Heart, Share2, Plus, Minus } from 'lucide-react';
import { Product, ProductReview } from '@/types/tree';
import { getProductById, getProductReviews, addProductReview } from '@/lib/productService';
import { addToCart, getCartItemCount } from '@/lib/cartService';
import { showSuccess, showError } from '@/lib/toast';

interface PageProps {
  params: {
    id: string;
  };
}

export default function ProductDetailPage({ params }: PageProps) {
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [cartCount, setCartCount] = useState(0);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);

  // Review form
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewerName, setReviewerName] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    loadProduct();
    loadReviews();
    updateCartCount();
  }, [params.id]);

  const loadProduct = async () => {
    setLoading(true);
    const productData = await getProductById(params.id);
    if (!productData) {
      router.push('/shop');
      return;
    }
    setProduct(productData);
    setLoading(false);
  };

  const loadReviews = async () => {
    const reviewsData = await getProductReviews(params.id);
    setReviews(reviewsData);
  };

  const updateCartCount = () => {
    setCartCount(getCartItemCount());
  };

  const handleAddToCart = async () => {
    if (!product) return;

    setAddingToCart(true);
    try {
      await addToCart(product.id, quantity);
      showSuccess(`${quantity} ${product.unit} of ${product.name} added to cart!`);
      updateCartCount();
      setQuantity(1);
    } catch (error: any) {
      showError(error.message || 'Failed to add to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!product || !reviewerName.trim() || !reviewComment.trim()) {
      showError('Please fill in all review fields');
      return;
    }

    setSubmittingReview(true);
    try {
      await addProductReview(product.id, {
        rating: reviewRating,
        comment: reviewComment,
        reviewerName: reviewerName.trim(),
      });

      showSuccess('Review submitted successfully!');
      setShowReviewForm(false);
      setReviewRating(5);
      setReviewComment('');
      setReviewerName('');

      // Reload product and reviews to show updated rating
      await loadProduct();
      await loadReviews();
    } catch (error: any) {
      showError(error.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🥭</div>
          <p className="text-gray-600">Loading product...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return null;
  }

  const hasDiscount = product.originalPrice && product.originalPrice > product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft size={20} />
              </button>
              <Link href="/" className="flex items-center space-x-2">
                <span className="text-2xl">🥭</span>
                <span className="text-xl font-bold text-gray-900">Durian Shop</span>
              </Link>
            </div>

            <Link
              href="/shop/cart"
              className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ShoppingCart size={24} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-green-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm">
          <ol className="flex items-center space-x-2 text-gray-600">
            <li><Link href="/shop" className="hover:text-green-600">Shop</Link></li>
            <li>/</li>
            <li><Link href={`/shop?category=${product.category}`} className="hover:text-green-600">{product.category}</Link></li>
            <li>/</li>
            <li className="text-gray-900 font-medium">{product.name}</li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Image Gallery */}
          <div>
            <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-4">
              <div className="aspect-square bg-gradient-to-br from-green-100 to-yellow-100 relative">
                {product.images && product.images.length > 0 ? (
                  <img
                    src={product.images[selectedImage]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-8xl">
                    🥭
                  </div>
                )}
                {product.isFeatured && (
                  <span className="absolute top-4 left-4 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-sm font-bold">
                    Featured
                  </span>
                )}
                {hasDiscount && (
                  <span className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                    {discountPercent}% OFF
                  </span>
                )}
              </div>
            </div>

            {/* Image Thumbnails */}
            {product.images && product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === index
                        ? 'border-green-600 ring-2 ring-green-200'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
              <p className="text-lg text-gray-600 mb-4">{product.variety}</p>

              {/* Rating */}
              {product.rating && product.rating > 0 && (
                <div className="flex items-center mb-4">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={20}
                        className={i < Math.round(product.rating!) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                      />
                    ))}
                  </div>
                  <span className="ml-2 text-gray-600">
                    {product.rating.toFixed(1)} ({product.reviewCount || 0} reviews)
                  </span>
                </div>
              )}

              {/* Price */}
              <div className="mb-6">
                {hasDiscount ? (
                  <div className="flex items-baseline space-x-3">
                    <span className="text-4xl font-bold text-green-600">
                      RM {product.price.toFixed(2)}
                    </span>
                    <span className="text-2xl text-gray-400 line-through">
                      RM {product.originalPrice!.toFixed(2)}
                    </span>
                    <span className="text-sm text-red-600 font-semibold">
                      Save RM {(product.originalPrice! - product.price).toFixed(2)}
                    </span>
                  </div>
                ) : (
                  <span className="text-4xl font-bold text-gray-900">
                    RM {product.price.toFixed(2)}
                  </span>
                )}
                <span className="text-gray-500 ml-2">per {product.unit}</span>
              </div>

              {/* Stock Status */}
              <div className="mb-6">
                {product.inStock && product.stockQuantity > 0 ? (
                  <div>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      ✓ In Stock - {product.stockQuantity} {product.unit} available
                    </span>
                    {product.stockQuantity <= 10 && (
                      <p className="text-sm text-orange-600 mt-2">Only {product.stockQuantity} left!</p>
                    )}
                  </div>
                ) : (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                    Out of Stock
                  </span>
                )}
              </div>

              {/* Quantity Selector */}
              {product.inStock && product.stockQuantity > 0 && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity
                  </label>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center border border-gray-300 rounded-lg">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        disabled={quantity <= 1}
                        className="p-3 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Minus size={20} />
                      </button>
                      <span className="px-6 py-2 font-semibold text-lg">{quantity}</span>
                      <button
                        onClick={() => setQuantity(Math.min(product.stockQuantity, quantity + 1))}
                        disabled={quantity >= product.stockQuantity}
                        className="p-3 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Plus size={20} />
                      </button>
                    </div>
                    <span className="text-gray-600">
                      Total: <span className="font-semibold text-green-600">RM {(product.price * quantity).toFixed(2)}</span>
                    </span>
                  </div>
                </div>
              )}

              {/* Add to Cart Button */}
              <button
                onClick={handleAddToCart}
                disabled={!product.inStock || product.stockQuantity === 0 || addingToCart}
                className={`w-full py-4 rounded-lg font-semibold text-lg transition-colors flex items-center justify-center mb-4 ${
                  product.inStock && product.stockQuantity > 0
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {addingToCart ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Adding...
                  </>
                ) : (
                  <>
                    <ShoppingCart className="mr-2" size={20} />
                    {product.inStock && product.stockQuantity > 0 ? 'Add to Cart' : 'Out of Stock'}
                  </>
                )}
              </button>

              {/* Action Buttons */}
              <div className="flex space-x-2 mb-6">
                <button className="flex-1 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center">
                  <Heart size={18} className="mr-2" />
                  Wishlist
                </button>
                <button className="flex-1 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center">
                  <Share2 size={18} className="mr-2" />
                  Share
                </button>
              </div>

              {/* Features */}
              {product.features && product.features.length > 0 && (
                <div className="border-t pt-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Key Features</h3>
                  <ul className="space-y-2">
                    {product.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-green-600 mr-2">✓</span>
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Shipping Info */}
              <div className="border-t pt-6 mt-6 space-y-3">
                <div className="flex items-center text-sm text-gray-600">
                  <Truck size={18} className="mr-2 text-green-600" />
                  <span>Free shipping on orders over RM 150</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Shield size={18} className="mr-2 text-green-600" />
                  <span>Quality guaranteed or money back</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Product Description</h2>
          <p className="text-gray-700 leading-relaxed whitespace-pre-line">{product.description}</p>
        </div>

        {/* Reviews Section */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Customer Reviews</h2>
            <button
              onClick={() => setShowReviewForm(!showReviewForm)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
            >
              Write a Review
            </button>
          </div>

          {/* Review Form */}
          {showReviewForm && (
            <form onSubmit={handleSubmitReview} className="bg-gray-50 rounded-lg p-6 mb-6">
              <h3 className="font-semibold text-gray-900 mb-4">Share Your Experience</h3>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Name *
                </label>
                <input
                  type="text"
                  required
                  value={reviewerName}
                  onChange={(e) => setReviewerName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter your name"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rating *
                </label>
                <div className="flex items-center space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      className="focus:outline-none"
                    >
                      <Star
                        size={32}
                        className={star <= reviewRating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                      />
                    </button>
                  ))}
                  <span className="ml-2 text-gray-600">{reviewRating} stars</span>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Review *
                </label>
                <textarea
                  required
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Tell us what you think about this product..."
                />
              </div>

              <div className="flex space-x-3">
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  {submittingReview ? 'Submitting...' : 'Submit Review'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowReviewForm(false)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* Reviews List */}
          {reviews.length > 0 ? (
            <div className="space-y-6">
              {reviews.map((review) => (
                <div key={review.id} className="border-b border-gray-200 pb-6 last:border-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-green-600 font-semibold">
                          {review.reviewerName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{review.reviewerName}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(review.createdAt).toLocaleDateString('en-MY', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={16}
                          className={i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-700 ml-13">{review.comment}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Star size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-600 mb-2">No reviews yet</p>
              <p className="text-sm text-gray-500">Be the first to review this product!</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
