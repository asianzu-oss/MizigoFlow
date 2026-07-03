import { useState, useEffect } from 'react';
import Sidebar from '../components/common/Sidebar';
import Navbar from '../components/common/Navbar';
import api from '../services/api';

const Vehicles = () => {
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddVehicle, setShowAddVehicle] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [deletingVehicle, setDeletingVehicle] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  const [search, setSearch] = useState('');

  const [vehicleForm, setVehicleForm] = useState({
    plate_number: '',
    type: 'truck',
    driver_id: '',
  });

  const fetchData = async () => {
    try {
      const [vehiclesRes, driversRes] = await Promise.all([
        api.get('/vehicles'),
        api.get('/drivers'),
      ]);
      setVehicles(vehiclesRes.data);
      setDrivers(driversRes.data);
    } catch (error) {
      console.error('Vehicles fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddVehicle = async () => {
    if (!vehicleForm.plate_number) {
      setMessage({ type: 'error', text: 'Plate number is required' });
      return;
    }
    try {
      setSubmitting(true);
      await api.post('/vehicles', vehicleForm);
      setMessage({ type: 'success', text: 'Vehicle added successfully' });
      setShowAddVehicle(false);
      setVehicleForm({ plate_number: '', type: 'truck', driver_id: '' });
      fetchData();
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to add vehicle' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditVehicle = async () => {
    try {
      setSubmitting(true);
      await api.put(`/vehicles/${editingVehicle.id}`, editingVehicle);
      setMessage({ type: 'success', text: 'Vehicle updated successfully' });
      setEditingVehicle(null);
      fetchData();
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to update vehicle' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteVehicle = async () => {
    try {
      setSubmitting(true);
      await api.delete(`/vehicles/${deletingVehicle.id}`);
      setMessage({ type: 'success', text: 'Vehicle deleted successfully' });
      setDeletingVehicle(null);
      fetchData();
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to delete vehicle' });
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = vehicles.filter((v) =>
    v.plate_number.toLowerCase().includes(search.toLowerCase()) ||
    (v.driver_name && v.driver_name.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar title="Vehicles" />
        <div className="p-6 space-y-6">

          {/* Message */}
          {message && (
            <div className={`px-4 py-3 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
              {message.text}
              <button onClick={() => setMessage(null)} className="ml-2 font-bold">×</button>
            </div>
          )}

          {/* Delete Confirmation */}
          {deletingVehicle && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl p-6 max-w-sm w-full mx-4 shadow-xl">
                <h4 className="font-semibold text-gray-800 mb-2">Delete Vehicle</h4>
                <p className="text-sm text-gray-600 mb-4">
                  Are you sure you want to delete vehicle <strong>{deletingVehicle.plate_number}</strong>? This cannot be undone.
                </p>
                <div className="flex gap-3">
                  <button onClick={handleDeleteVehicle} disabled={submitting} className="btn-danger">
                    {submitting ? 'Deleting...' : 'Yes, Delete'}
                  </button>
                  <button onClick={() => setDeletingVehicle(null)} className="btn-secondary">Cancel</button>
                </div>
              </div>
            </div>
          )}

          {/* Header */}
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-gray-800">All Vehicles</h3>
            <button onClick={() => setShowAddVehicle(true)} className="btn-primary">
              + Add Vehicle
            </button>
          </div>

          {/* Search */}
          <input
            type="text"
            className="input-field max-w-sm"
            placeholder="Search by plate number or driver..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {/* Add Vehicle Form */}
          {showAddVehicle && (
            <div className="card">
              <h4 className="font-semibold text-gray-800 mb-4">Add New Vehicle</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Plate Number *</label>
                  <input className="input-field" placeholder="e.g. UAA 123B" value={vehicleForm.plate_number} onChange={(e) => setVehicleForm({ ...vehicleForm, plate_number: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Type</label>
                  <select className="input-field" value={vehicleForm.type} onChange={(e) => setVehicleForm({ ...vehicleForm, type: e.target.value })}>
                    <option value="truck">Truck</option>
                    <option value="van">Van</option>
                    <option value="pickup">Pickup</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Assign Driver</label>
                  <select className="input-field" value={vehicleForm.driver_id} onChange={(e) => setVehicleForm({ ...vehicleForm, driver_id: e.target.value })}>
                    <option value="">Select driver</option>
                    {drivers.map((d) => (
                      <option key={d.id} value={d.id}>{d.full_name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex gap-3 mt-4">
                <button onClick={handleAddVehicle} disabled={submitting} className="btn-primary">
                  {submitting ? 'Saving...' : 'Save Vehicle'}
                </button>
                <button onClick={() => setShowAddVehicle(false)} className="btn-secondary">Cancel</button>
              </div>
            </div>
          )}

          {/* Edit Vehicle Form */}
          {editingVehicle && (
            <div className="card border-blue-200 border">
              <h4 className="font-semibold text-gray-800 mb-4">Edit Vehicle — {editingVehicle.plate_number}</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Plate Number *</label>
                  <input className="input-field" value={editingVehicle.plate_number} onChange={(e) => setEditingVehicle({ ...editingVehicle, plate_number: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Type</label>
                  <select className="input-field" value={editingVehicle.type} onChange={(e) => setEditingVehicle({ ...editingVehicle, type: e.target.value })}>
                    <option value="truck">Truck</option>
                    <option value="van">Van</option>
                    <option value="pickup">Pickup</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Assign Driver</label>
                  <select className="input-field" value={editingVehicle.driver_id || ''} onChange={(e) => setEditingVehicle({ ...editingVehicle, driver_id: e.target.value })}>
                    <option value="">Select driver</option>
                    {drivers.map((d) => (
                      <option key={d.id} value={d.id}>{d.full_name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex gap-3 mt-4">
                <button onClick={handleEditVehicle} disabled={submitting} className="btn-primary">
                  {submitting ? 'Saving...' : 'Save Changes'}
                </button>
                <button onClick={() => setEditingVehicle(null)} className="btn-secondary">Cancel</button>
              </div>
            </div>
          )}

          {/* Vehicles Table */}
          <div className="card overflow-x-auto">
            {loading ? (
              <p className="text-gray-400 text-sm">Loading...</p>
            ) : filtered.length === 0 ? (
              <p className="text-gray-400 text-sm">No vehicles found</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-3 px-2 text-gray-500 font-medium">Plate Number</th>
                    <th className="text-left py-3 px-2 text-gray-500 font-medium">Type</th>
                    <th className="text-left py-3 px-2 text-gray-500 font-medium">Assigned Driver</th>
                    <th className="text-left py-3 px-2 text-gray-500 font-medium">Driver Phone</th>
                    <th className="text-left py-3 px-2 text-gray-500 font-medium">Added On</th>
                    <th className="text-left py-3 px-2 text-gray-500 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((vehicle) => (
                    <tr key={vehicle.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="py-3 px-2 font-medium">{vehicle.plate_number}</td>
                      <td className="py-3 px-2 capitalize text-gray-600">{vehicle.type}</td>
                      <td className="py-3 px-2 text-gray-600">{vehicle.driver_name || '-'}</td>
                      <td className="py-3 px-2 text-gray-600">{vehicle.driver_phone || '-'}</td>
                      <td className="py-3 px-2 text-gray-600">{new Date(vehicle.created_at).toLocaleDateString()}</td>
                      <td className="py-3 px-2">
                        <div className="flex gap-2">
                          <button onClick={() => setEditingVehicle(vehicle)} className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-lg hover:bg-blue-200">Edit</button>
                          <button onClick={() => setDeletingVehicle(vehicle)} className="text-xs bg-red-100 text-red-700 px-3 py-1 rounded-lg hover:bg-red-200">Delete</button>
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

export default Vehicles;