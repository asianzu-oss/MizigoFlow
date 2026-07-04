import { useState, useEffect } from 'react';
import Sidebar from '../components/common/Sidebar';
import Navbar from '../components/common/Navbar';
import api from '../services/api';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateOrder, setShowCreateOrder] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  const [search, setSearch] = useState('');

  const [orderForm, setOrderForm] = useState({
    order_type: 'delivery',
    vehicle_id: '',
    driver_id: '',
    expected_date: '',
    notes: '',
    items: [{ product_id: '', expected_quantity: '' }],
  });

  const fetchData = async () => {
    try {
      const [ordersRes, vehiclesRes, driversRes, productsRes] = await Promise.all([
        api.get('/orders'),
        api.get('/vehicles'),
        api.get('/drivers'),
        api.get('/inventory'),
      ]);
      setOrders(ordersRes.data);
      setVehicles(vehiclesRes.data);
      setDrivers(driversRes.data);
      setProducts(productsRes.data);
    } catch (error) {
      console.error('Orders fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const addItem = () => {
    setOrderForm({
      ...orderForm,
      items: [...orderForm.items, { product_id: '', expected_quantity: '' }],
    });
  };

  const removeItem = (index) => {
    const items = orderForm.items.filter((_, i) => i !== index);
    setOrderForm({ ...orderForm, items });
  };

  const updateItem = (index, field, value) => {
    const items = orderForm.items.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    );
    setOrderForm({ ...orderForm, items });
  };

  const handleCreateOrder = async () => {
    if (!orderForm.vehicle_id || !orderForm.driver_id) {
      setMessage({ type: 'error', text: 'Vehicle and driver are required' });
      return;
    }
    try {
      setSubmitting(true);
      await api.post('/orders', {
        ...orderForm,
        items: orderForm.items.map((item) => ({
          product_id: parseInt(item.product_id),
          expected_quantity: parseInt(item.expected_quantity),
        })),
      });
      setMessage({ type: 'success', text: 'Order created successfully' });
      setShowCreateOrder(false);
      setOrderForm({ order_type: 'delivery', vehicle_id: '', driver_id: '', expected_date: '', notes: '', items: [{ product_id: '', expected_quantity: '' }] });
      fetchData();
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to create order' });
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    const map = {
      pending: 'badge-warning',
      in_progress: 'badge-info',
      completed: 'badge-success',
      cancelled: 'badge-danger',
    };
    return map[status] || 'badge-info';
  };

  const filtered = orders.filter((o) =>
  (o.plate_number && o.plate_number.toLowerCase().includes(search.toLowerCase())) ||
  (o.driver_name && o.driver_name.toLowerCase().includes(search.toLowerCase())) ||
  (o.order_type && o.order_type.toLowerCase().includes(search.toLowerCase())) ||
  (o.status && o.status.toLowerCase().includes(search.toLowerCase()))
);
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar title="Orders" />
        <div className="p-6 space-y-6">

          {/* Message */}
          {message && (
            <div className={`px-4 py-3 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
              {message.text}
              <button onClick={() => setMessage(null)} className="ml-2 font-bold">×</button>
            </div>
          )}

          {/* Header */}
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-gray-800">All Orders</h3>
            <button onClick={() => setShowCreateOrder(true)} className="btn-primary">
              + Create Order
            </button>
          </div>

          <input
  type="text"
  className="input-field max-w-sm"
  placeholder="Search by vehicle, driver, type or status..."
  value={search}
  onChange={(e) => setSearch(e.target.value)}
/>
          {/* Create Order Form */}
          {showCreateOrder && (
            <div className="card">
              <h4 className="font-semibold text-gray-800 mb-4">Create New Order</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Order Type *</label>
                  <select className="input-field" value={orderForm.order_type} onChange={(e) => setOrderForm({ ...orderForm, order_type: e.target.value })}>
                    <option value="delivery">Delivery (Inbound)</option>
                    <option value="dispatch">Dispatch (Outbound)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle *</label>
                  <select className="input-field" value={orderForm.vehicle_id} onChange={(e) => setOrderForm({ ...orderForm, vehicle_id: e.target.value })}>
                    <option value="">Select vehicle</option>
                    {vehicles.map((v) => (
                      <option key={v.id} value={v.id}>{v.plate_number}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Driver *</label>
                  <select className="input-field" value={orderForm.driver_id} onChange={(e) => setOrderForm({ ...orderForm, driver_id: e.target.value })}>
                    <option value="">Select driver</option>
                    {drivers.map((d) => (
                      <option key={d.id} value={d.id}>{d.full_name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expected Date</label>
                  <input type="date" className="input-field" value={orderForm.expected_date} onChange={(e) => setOrderForm({ ...orderForm, expected_date: e.target.value })} />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea className="input-field" rows={2} placeholder="Optional notes..." value={orderForm.notes} onChange={(e) => setOrderForm({ ...orderForm, notes: e.target.value })} />
                </div>
              </div>

              {/* Order Items */}
              <div className="mt-4">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium text-gray-700">Order Items</label>
                  <button onClick={addItem} className="text-xs text-blue-600 hover:underline">+ Add Item</button>
                </div>
                {orderForm.items.map((item, index) => (
                  <div key={index} className="flex gap-3 mb-2">
                    <select className="input-field" value={item.product_id} onChange={(e) => updateItem(index, 'product_id', e.target.value)}>
                      <option value="">Select product</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                    <input type="number" className="input-field w-32" placeholder="Qty" value={item.expected_quantity} onChange={(e) => updateItem(index, 'expected_quantity', e.target.value)} />
                    {orderForm.items.length > 1 && (
                      <button onClick={() => removeItem(index)} className="text-red-500 hover:text-red-700 px-2">×</button>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex gap-3 mt-4">
                <button onClick={handleCreateOrder} disabled={submitting} className="btn-primary">
                  {submitting ? 'Creating...' : 'Create Order'}
                </button>
                <button onClick={() => setShowCreateOrder(false)} className="btn-secondary">Cancel</button>
              </div>
            </div>
          )}

          {/* Orders Table */}
          <div className="card overflow-x-auto">
            {loading ? (
              <p className="text-gray-400 text-sm">Loading...</p>
            ) : orders.length === 0 ? (
              <p className="text-gray-400 text-sm">No orders yet</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-3 px-2 text-gray-500 font-medium">Order #</th>
                    <th className="text-left py-3 px-2 text-gray-500 font-medium">Type</th>
                    <th className="text-left py-3 px-2 text-gray-500 font-medium">Vehicle</th>
                    <th className="text-left py-3 px-2 text-gray-500 font-medium">Driver</th>
                    <th className="text-left py-3 px-2 text-gray-500 font-medium">Status</th>
                    <th className="text-left py-3 px-2 text-gray-500 font-medium">Expected Date</th>
                    <th className="text-left py-3 px-2 text-gray-500 font-medium">Created By</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((order) => (
                    <tr key={order.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="py-3 px-2 font-medium">#{order.id}</td>
                      <td className="py-3 px-2 capitalize text-gray-600">{order.order_type}</td>
                      <td className="py-3 px-2 text-gray-600">{order.plate_number}</td>
                      <td className="py-3 px-2 text-gray-600">{order.driver_name}</td>
                      <td className="py-3 px-2">
                        <span className={getStatusBadge(order.status)}>{order.status}</span>
                      </td>
                      <td className="py-3 px-2 text-gray-600">
                        {order.expected_date ? new Date(order.expected_date).toLocaleDateString() : '-'}
                      </td>
                      <td className="py-3 px-2 text-gray-600">{order.created_by_name}</td>
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

export default Orders;