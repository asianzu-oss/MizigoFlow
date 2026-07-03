import { useState, useEffect } from 'react';
import Sidebar from '../components/common/Sidebar';
import Navbar from '../components/common/Navbar';
import api from '../services/api';

const Drivers = () => {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddDriver, setShowAddDriver] = useState(false);
  const [editingDriver, setEditingDriver] = useState(null);
  const [deletingDriver, setDeletingDriver] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  const [search, setSearch] = useState('');

  const [driverForm, setDriverForm] = useState({
    full_name: '',
    phone_number: '',
    national_id: '',
    license_number: '',
  });

  const fetchDrivers = async () => {
    try {
      const res = await api.get('/drivers');
      setDrivers(res.data);
    } catch (error) {
      console.error('Drivers fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, []);

  const handleAddDriver = async () => {
    if (!driverForm.full_name) {
      setMessage({ type: 'error', text: 'Full name is required' });
      return;
    }
    try {
      setSubmitting(true);
      await api.post('/drivers', driverForm);
      setMessage({ type: 'success', text: 'Driver added successfully' });
      setShowAddDriver(false);
      setDriverForm({ full_name: '', phone_number: '', national_id: '', license_number: '' });
      fetchDrivers();
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to add driver' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditDriver = async () => {
    try {
      setSubmitting(true);
      await api.put(`/drivers/${editingDriver.id}`, editingDriver);
      setMessage({ type: 'success', text: 'Driver updated successfully' });
      setEditingDriver(null);
      fetchDrivers();
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to update driver' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteDriver = async () => {
    try {
      setSubmitting(true);
      await api.delete(`/drivers/${deletingDriver.id}`);
      setMessage({ type: 'success', text: 'Driver deleted successfully' });
      setDeletingDriver(null);
      fetchDrivers();
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to delete driver' });
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = drivers.filter((d) =>
    d.full_name.toLowerCase().includes(search.toLowerCase()) ||
    (d.phone_number && d.phone_number.includes(search)) ||
    (d.license_number && d.license_number.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar title="Drivers" />
        <div className="p-6 space-y-6">

          {/* Message */}
          {message && (
            <div className={`px-4 py-3 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
              {message.text}
              <button onClick={() => setMessage(null)} className="ml-2 font-bold">×</button>
            </div>
          )}

          {/* Delete Confirmation */}
          {deletingDriver && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl p-6 max-w-sm w-full mx-4 shadow-xl">
                <h4 className="font-semibold text-gray-800 mb-2">Delete Driver</h4>
                <p className="text-sm text-gray-600 mb-4">
                  Are you sure you want to delete <strong>{deletingDriver.full_name}</strong>? This cannot be undone.
                </p>
                <div className="flex gap-3">
                  <button onClick={handleDeleteDriver} disabled={submitting} className="btn-danger">
                    {submitting ? 'Deleting...' : 'Yes, Delete'}
                  </button>
                  <button onClick={() => setDeletingDriver(null)} className="btn-secondary">Cancel</button>
                </div>
              </div>
            </div>
          )}

          {/* Header */}
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-gray-800">All Drivers</h3>
            <button onClick={() => setShowAddDriver(true)} className="btn-primary">
              + Add Driver
            </button>
          </div>

          {/* Search */}
          <input
            type="text"
            className="input-field max-w-sm"
            placeholder="Search by name, phone or license..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {/* Add Driver Form */}
          {showAddDriver && (
            <div className="card">
              <h4 className="font-semibold text-gray-800 mb-4">Add New Driver</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                  <input className="input-field" placeholder="e.g. John Mukasa" value={driverForm.full_name} onChange={(e) => setDriverForm({ ...driverForm, full_name: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <input className="input-field" placeholder="e.g. 0701234567" value={driverForm.phone_number} onChange={(e) => setDriverForm({ ...driverForm, phone_number: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">National ID</label>
                  <input className="input-field" placeholder="e.g. CM123456" value={driverForm.national_id} onChange={(e) => setDriverForm({ ...driverForm, national_id: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">License Number</label>
                  <input className="input-field" placeholder="e.g. UG12345" value={driverForm.license_number} onChange={(e) => setDriverForm({ ...driverForm, license_number: e.target.value })} />
                </div>
              </div>
              <div className="flex gap-3 mt-4">
                <button onClick={handleAddDriver} disabled={submitting} className="btn-primary">
                  {submitting ? 'Saving...' : 'Save Driver'}
                </button>
                <button onClick={() => setShowAddDriver(false)} className="btn-secondary">Cancel</button>
              </div>
            </div>
          )}

          {/* Edit Driver Form */}
          {editingDriver && (
            <div className="card border-blue-200 border">
              <h4 className="font-semibold text-gray-800 mb-4">Edit Driver — {editingDriver.full_name}</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                  <input className="input-field" value={editingDriver.full_name} onChange={(e) => setEditingDriver({ ...editingDriver, full_name: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <input className="input-field" value={editingDriver.phone_number || ''} onChange={(e) => setEditingDriver({ ...editingDriver, phone_number: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">National ID</label>
                  <input className="input-field" value={editingDriver.national_id || ''} onChange={(e) => setEditingDriver({ ...editingDriver, national_id: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">License Number</label>
                  <input className="input-field" value={editingDriver.license_number || ''} onChange={(e) => setEditingDriver({ ...editingDriver, license_number: e.target.value })} />
                </div>
              </div>
              <div className="flex gap-3 mt-4">
                <button onClick={handleEditDriver} disabled={submitting} className="btn-primary">
                  {submitting ? 'Saving...' : 'Save Changes'}
                </button>
                <button onClick={() => setEditingDriver(null)} className="btn-secondary">Cancel</button>
              </div>
            </div>
          )}

          {/* Drivers Table */}
          <div className="card overflow-x-auto">
            {loading ? (
              <p className="text-gray-400 text-sm">Loading...</p>
            ) : filtered.length === 0 ? (
              <p className="text-gray-400 text-sm">No drivers found</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-3 px-2 text-gray-500 font-medium">Full Name</th>
                    <th className="text-left py-3 px-2 text-gray-500 font-medium">Phone</th>
                    <th className="text-left py-3 px-2 text-gray-500 font-medium">National ID</th>
                    <th className="text-left py-3 px-2 text-gray-500 font-medium">License No.</th>
                    <th className="text-left py-3 px-2 text-gray-500 font-medium">Added On</th>
                    <th className="text-left py-3 px-2 text-gray-500 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((driver) => (
                    <tr key={driver.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="py-3 px-2 font-medium">{driver.full_name}</td>
                      <td className="py-3 px-2 text-gray-600">{driver.phone_number || '-'}</td>
                      <td className="py-3 px-2 text-gray-600">{driver.national_id || '-'}</td>
                      <td className="py-3 px-2 text-gray-600">{driver.license_number || '-'}</td>
                      <td className="py-3 px-2 text-gray-600">{new Date(driver.created_at).toLocaleDateString()}</td>
                      <td className="py-3 px-2">
                        <div className="flex gap-2">
                          <button onClick={() => setEditingDriver(driver)} className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-lg hover:bg-blue-200">Edit</button>
                          <button onClick={() => setDeletingDriver(driver)} className="text-xs bg-red-100 text-red-700 px-3 py-1 rounded-lg hover:bg-red-200">Delete</button>
                        </div>
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

export default Drivers;