'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, Eye, EyeOff, Star, Package } from 'lucide-react';
import { Product } from '@/types/tree';
import {
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  publishProduct,
  unpublishProduct,
} from '@/lib/productService';
import { showSuccess, showError } from '@/lib/toast';
import { useAuth } from '@/contexts/AuthContext';

export default function ProductManagement() {
  const { userProfile } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'published' | 'draft'>('all');

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    variety: '',
    description: '',
    price: '',
    originalPrice: '',
    unit: 'kg' as 'kg' | 'fruit' | 'box',
    category: 'Fresh' as 'Fresh' | 'Premium' | 'Grade A' | 'Grade B' | 'Grade C',
    stockQuantity: '',
    features: '',
    isFeatured: false,
  });

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, searchTerm, filterStatus]);

  const loadProducts = async () => {
    setLoading(true);
    const allProducts = await getAllProducts({});
    setProducts(allProducts);
    setLoading(false);
  };

  const filterProducts = () => {
    let filtered = [...products];

    // Filter by search
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(search) ||
          p.variety.toLowerCase().includes(search) ||
          p.category.toLowerCase().includes(search)
      );
    }

    // Filter by status
    if (filterStatus === 'published') {
      filtered = filtered.filter((p) => p.isPublished);
    } else if (filterStatus === 'draft') {
      filtered = filtered.filter((p) => !p.isPublished);
    }

    setFilteredProducts(filtered);
  };

  const openCreateModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      variety: '',
      description: '',
      price: '',
      originalPrice: '',
      unit: 'kg',
      category: 'Fresh',
      stockQuantity: '',
      features: '',
      isFeatured: false,
    });
    setShowModal(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      variety: product.variety,
      description: product.description,
      price: product.price.toString(),
      originalPrice: product.originalPrice?.toString() || '',
      unit: product.unit,
      category: product.category,
      stockQuantity: product.stockQuantity.toString(),
      features: product.features.join('\n'),
      isFeatured: product.isFeatured,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userProfile) {
      showError('User profile not found');
      return;
    }

    const price = parseFloat(formData.price);
    const stockQuantity = parseInt(formData.stockQuantity);

    if (isNaN(price) || price <= 0) {
      showError('Please enter a valid price');
      return;
    }

    if (isNaN(stockQuantity) || stockQuantity < 0) {
      showError('Please enter a valid stock quantity');
      return;
    }

    const productData = {
      name: formData.name.trim(),
      variety: formData.variety.trim(),
      description: formData.description.trim(),
      price,
      originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : undefined,
      unit: formData.unit,
      category: formData.category,
      inStock: stockQuantity > 0,
      stockQuantity,
      images: [], // Image upload to be implemented
      features: formData.features
        .split('\n')
        .map((f) => f.trim())
        .filter((f) => f.length > 0),
      rating: editingProduct?.rating,
      reviewCount: editingProduct?.reviewCount,
      isPublished: editingProduct?.isPublished || false,
      isFeatured: formData.isFeatured,
      createdBy: userProfile.uid,
    };

    try {
      if (editingProduct) {
        // Update existing product
        await updateProduct(editingProduct.id, productData);
        showSuccess('Product updated successfully');
      } else {
        // Create new product
        await createProduct(productData);
        showSuccess('Product created successfully');
      }

      setShowModal(false);
      await loadProducts();
    } catch (error: any) {
      showError(error.message || 'Failed to save product');
    }
  };

  const handleDelete = async (productId: string, productName: string) => {
    if (!confirm(`Are you sure you want to delete "${productName}"?`)) {
      return;
    }

    try {
      await deleteProduct(productId);
      showSuccess('Product deleted successfully');
      await loadProducts();
    } catch (error: any) {
      showError(error.message || 'Failed to delete product');
    }
  };

  const handleTogglePublish = async (product: Product) => {
    try {
      if (product.isPublished) {
        await unpublishProduct(product.id);
        showSuccess('Product unpublished');
      } else {
        await publishProduct(product.id);
        showSuccess('Product published');
      }
      await loadProducts();
    } catch (error: any) {
      showError(error.message || 'Failed to update product status');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Product Management</h2>
          <p className="text-gray-600 mt-1">Manage your durian products</p>
        </div>
        <button
          onClick={openCreateModal}
          className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center"
        >
          <Plus size={18} className="mr-2" />
          Add Product
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>
          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="all">All Products</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🥭</div>
            <p className="text-gray-600">Loading products...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <Package size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-600 text-lg">No products found</p>
            <p className="text-gray-500 mt-2">
              {searchTerm || filterStatus !== 'all'
                ? 'Try adjusting your filters'
                : 'Create your first product to get started'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rating
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          {product.images && product.images[0] ? (
                            <img
                              src={product.images[0]}
                              alt={product.name}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          ) : (
                            <span className="text-2xl">🥭</span>
                          )}
                        </div>
                        <div className="ml-4">
                          <p className="font-medium text-gray-900">{product.name}</p>
                          <p className="text-sm text-gray-600">{product.variety}</p>
                          {product.isFeatured && (
                            <span className="inline-flex items-center text-xs text-yellow-700 bg-yellow-100 px-2 py-0.5 rounded mt-1">
                              ⭐ Featured
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">RM {product.price.toFixed(2)}</p>
                        {product.originalPrice && product.originalPrice > product.price && (
                          <p className="text-sm text-gray-400 line-through">
                            RM {product.originalPrice.toFixed(2)}
                          </p>
                        )}
                        <p className="text-xs text-gray-500">per {product.unit}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p
                          className={`font-medium ${
                            product.stockQuantity > 10
                              ? 'text-green-600'
                              : product.stockQuantity > 0
                              ? 'text-yellow-600'
                              : 'text-red-600'
                          }`}
                        >
                          {product.stockQuantity} {product.unit}
                        </p>
                        <p className="text-xs text-gray-500">
                          {product.inStock ? 'In Stock' : 'Out of Stock'}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {product.rating && product.rating > 0 ? (
                        <div className="flex items-center">
                          <Star size={14} className="fill-yellow-400 text-yellow-400 mr-1" />
                          <span className="text-sm font-medium text-gray-900">
                            {product.rating.toFixed(1)}
                          </span>
                          <span className="text-xs text-gray-500 ml-1">
                            ({product.reviewCount})
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">No reviews</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleTogglePublish(product)}
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                          product.isPublished
                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                        }`}
                      >
                        {product.isPublished ? (
                          <>
                            <Eye size={12} className="mr-1" />
                            Published
                          </>
                        ) : (
                          <>
                            <EyeOff size={12} className="mr-1" />
                            Draft
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => openEditModal(product)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id, product.name)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <form onSubmit={handleSubmit}>
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900">
                  {editingProduct ? 'Edit Product' : 'Create New Product'}
                </h3>
              </div>

              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Product Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="e.g., Musang King"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Variety *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.variety}
                      onChange={(e) => setFormData({ ...formData, variety: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="e.g., D197"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description *
                  </label>
                  <textarea
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Describe the product..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Price (RM) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Original Price (RM)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.originalPrice}
                      onChange={(e) =>
                        setFormData({ ...formData, originalPrice: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Unit *</label>
                    <select
                      required
                      value={formData.unit}
                      onChange={(e) =>
                        setFormData({ ...formData, unit: e.target.value as any })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="kg">Kilogram (kg)</option>
                      <option value="fruit">Fruit</option>
                      <option value="box">Box</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category *
                    </label>
                    <select
                      required
                      value={formData.category}
                      onChange={(e) =>
                        setFormData({ ...formData, category: e.target.value as any })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="Fresh">Fresh</option>
                      <option value="Premium">Premium</option>
                      <option value="Grade A">Grade A</option>
                      <option value="Grade B">Grade B</option>
                      <option value="Grade C">Grade C</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Stock Quantity *
                    </label>
                    <input
                      type="number"
                      required
                      value={formData.stockQuantity}
                      onChange={(e) =>
                        setFormData({ ...formData, stockQuantity: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="0"
                      min="0"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Features (one per line)
                  </label>
                  <textarea
                    value={formData.features}
                    onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Premium quality&#10;Freshly harvested&#10;Sweet and creamy"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isFeatured"
                    checked={formData.isFeatured}
                    onChange={(e) =>
                      setFormData({ ...formData, isFeatured: e.target.checked })
                    }
                    className="mr-2 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isFeatured" className="text-sm font-medium text-gray-700">
                    Mark as Featured Product
                  </label>
                </div>
              </div>

              <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                >
                  {editingProduct ? 'Update Product' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
