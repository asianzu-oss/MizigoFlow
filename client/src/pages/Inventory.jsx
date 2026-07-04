import { useState, useEffect } from 'react';
import Sidebar from '../components/common/Sidebar';
import Navbar from '../components/common/Navbar';
import api from '../services/api';

const Inventory = () => {
  const [products, setProducts] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showGRN, setShowGRN] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  const [search, setSearch] = useState('');
  const [deletingProduct, setDeletingProduct] = useState(null);

  const [productForm, setProductForm] = useState({
    name: '',
    sku: '',
    category: '',
    unit_of_measure: '',
    reorder_level: '',
    bin_location: '',
  });

  const [grnForm, setGrnForm] = useState({
    product_id: '',
    quantity: '',
    notes: '',
  });

  const fetchData = async () => {
    try {
      const [productsRes, lowStockRes] = await Promise.all([
        api.get('/inventory'),
        api.get('/inventory/lowstock'),
      ]);
      setProducts(productsRes.data);
      setLowStock(lowStockRes.data);
    } catch (error) {
      console.error('Inventory fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddProduct = async () => {
    if (!productForm.name) {
      setMessage({ type: 'error', text: 'Product name is required' });
      return;
    }
    try {
      setSubmitting(true);
      await api.post('/inventory', productForm);
      setMessage({ type: 'success', text: 'Product added successfully' });
      setShowAddProduct(false);
      setProductForm({ name: '', sku: '', category: '', unit_of_measure: '', reorder_level: '', bin_location: '' });
      fetchData();
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to add product' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleGRN = async () => {
    if (!grnForm.product_id || !grnForm.quantity) {
      setMessage({ type: 'error', text: 'Product and quantity are required' });
      return;
    }
    try {
      setSubmitting(true);
      await api.post('/inventory/grn', {
        items: [{ product_id: parseInt(grnForm.product_id), quantity: parseInt(grnForm.quantity) }],
        notes: grnForm.notes,
      });
      setMessage({ type: 'success', text: 'Goods received successfully' });
      setShowGRN(false);
      setGrnForm({ product_id: '', quantity: '', notes: '' });
      fetchData();
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'GRN failed' });
    } finally {
      setSubmitting(false);
    }
  };

 const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.sku && p.sku.toLowerCase().includes(search.toLowerCase())) ||
    (p.category && p.category.toLowerCase().includes(search.toLowerCase())) ||
    (p.bin_location && p.bin_location.toLowerCase().includes(search.toLowerCase()))
  );

  const handleDeleteProduct = async () => {
  try {
    setSubmitting(true);
    await api.delete(`/inventory/${deletingProduct.id}`);
    setMessage({ type: 'success', text: 'Product deleted successfully' });
    setDeletingProduct(null);
    fetchData();
  } catch (error) {
    setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to delete product' });
  } finally {
    setSubmitting(false);
  }
};
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar title="Inventory" />
        <div className="p-6 space-y-6">

          {/* Message */}
          {message && (
            <div className={`px-4 py-3 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
              {message.text}
              <button onClick={() => setMessage(null)} className="ml-2 font-bold">×</button>
            </div>
          )}

          {/* Delete Confirmation */}
{deletingProduct && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white rounded-xl p-6 max-w-sm w-full mx-4 shadow-xl">
      <h4 className="font-semibold text-gray-800 mb-2">Delete Product</h4>
      <p className="text-sm text-gray-600 mb-4">
        Are you sure you want to delete <strong>{deletingProduct.name}</strong>? This will also delete all stock records and movements for this product.
      </p>
      <div className="flex gap-3">
        <button onClick={handleDeleteProduct} disabled={submitting} className="btn-danger">
          {submitting ? 'Deleting...' : 'Yes, Delete'}
        </button>
        <button onClick={() => setDeletingProduct(null)} className="btn-secondary">Cancel</button>
      </div>
    </div>
  </div>
)}
          {/* Low Stock Alert */}
          {lowStock.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3">
              <p className="text-red-700 text-sm font-medium">
                ⚠️ {lowStock.length} product(s) are below reorder level
              </p>
            </div>
          )}

          {/* Header */}
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-gray-800">Stock List</h3>
            <div className="flex gap-3">
              <button onClick={() => setShowGRN(true)} className="btn-secondary">
                + Receive Goods (GRN)
              </button>
              <button onClick={() => setShowAddProduct(true)} className="btn-primary">
                + Add Product
              </button>
            </div>
          </div>
          <input
  type="text"
  className="input-field max-w-sm"
  placeholder="Search by name, SKU, category or bin..."
  value={search}
  onChange={(e) => setSearch(e.target.value)}
/>

          {/* Add Product Form */}
          {showAddProduct && (
            <div className="card">
              <h4 className="font-semibold text-gray-800 mb-4">Add New Product</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
                  <input className="input-field" placeholder="e.g. Cement Bags" value={productForm.name} onChange={(e) => setProductForm({ ...productForm, name: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
                  <input className="input-field" placeholder="e.g. CEM001" value={productForm.sku} onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <input className="input-field" placeholder="e.g. Construction" value={productForm.category} onChange={(e) => setProductForm({ ...productForm, category: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unit of Measure</label>
                  <input className="input-field" placeholder="e.g. bags, kg, litres" value={productForm.unit_of_measure} onChange={(e) => setProductForm({ ...productForm, unit_of_measure: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reorder Level</label>
                  <input type="number" className="input-field" placeholder="e.g. 50" value={productForm.reorder_level} onChange={(e) => setProductForm({ ...productForm, reorder_level: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bin Location</label>
                  <input className="input-field" placeholder="e.g. A1" value={productForm.bin_location} onChange={(e) => setProductForm({ ...productForm, bin_location: e.target.value })} />
                </div>
              </div>
              <div className="flex gap-3 mt-4">
                <button onClick={handleAddProduct} disabled={submitting} className="btn-primary">
                  {submitting ? 'Saving...' : 'Save Product'}
                </button>
                <button onClick={() => setShowAddProduct(false)} className="btn-secondary">Cancel</button>
              </div>
            </div>
          )}

          {/* GRN Form */}
          {showGRN && (
            <div className="card">
              <h4 className="font-semibold text-gray-800 mb-4">Receive Goods (GRN)</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Product *</label>
                  <select className="input-field" value={grnForm.product_id} onChange={(e) => setGrnForm({ ...grnForm, product_id: e.target.value })}>
                    <option value="">Select product</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>{p.name} (Current: {p.quantity} {p.unit_of_measure})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantity *</label>
                  <input type="number" className="input-field" placeholder="Enter quantity" value={grnForm.quantity} onChange={(e) => setGrnForm({ ...grnForm, quantity: e.target.value })} />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea className="input-field" rows={2} placeholder="Optional notes..." value={grnForm.notes} onChange={(e) => setGrnForm({ ...grnForm, notes: e.target.value })} />
                </div>
              </div>
              <div className="flex gap-3 mt-4">
                <button onClick={handleGRN} disabled={submitting} className="btn-primary">
                  {submitting ? 'Processing...' : 'Confirm Receipt'}
                </button>
                <button onClick={() => setShowGRN(false)} className="btn-secondary">Cancel</button>
              </div>
            </div>
          )}

          {/* Stock Table */}
          <div className="card overflow-x-auto">
            {loading ? (
              <p className="text-gray-400 text-sm">Loading...</p>
            ) : products.length === 0 ? (
              <p className="text-gray-400 text-sm">No products yet</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-3 px-2 text-gray-500 font-medium">Product</th>
                    <th className="text-left py-3 px-2 text-gray-500 font-medium">SKU</th>
                    <th className="text-left py-3 px-2 text-gray-500 font-medium">Category</th>
                    <th className="text-left py-3 px-2 text-gray-500 font-medium">Quantity</th>
                    <th className="text-left py-3 px-2 text-gray-500 font-medium">Unit</th>
                    <th className="text-left py-3 px-2 text-gray-500 font-medium">Bin</th>
                    <th className="text-left py-3 px-2 text-gray-500 font-medium">Status</th>
                    <th className="text-left py-3 px-2 text-gray-500 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((product) => (
                    <tr key={product.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="py-3 px-2 font-medium">{product.name}</td>
                      <td className="py-3 px-2 text-gray-600">{product.sku || '-'}</td>
                      <td className="py-3 px-2 text-gray-600">{product.category || '-'}</td>
                      <td className="py-3 px-2 font-semibold">{product.quantity}</td>
                      <td className="py-3 px-2 text-gray-600">{product.unit_of_measure || '-'}</td>
                      <td className="py-3 px-2 text-gray-600">{product.bin_location || '-'}</td>
                      <td className="py-3 px-2">
                        {product.quantity <= product.reorder_level ? (
                          <span className="badge-danger">Low Stock</span>
                        ) : (
                          <span className="badge-success">In Stock</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default Inventory;