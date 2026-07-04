import { useState, useEffect } from 'react';
import Sidebar from '../components/common/Sidebar';
import Navbar from '../components/common/Navbar';
import api from '../services/api';

const Gate = () => {
  const [gateLogs, setGateLogs] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  const [search, setSearch] = useState('');

  const [checkInForm, setCheckInForm] = useState({
    vehicle_id: '',
    driver_id: '',
    direction: 'inbound',
    purpose: 'delivery',
    notes: '',
  });

  const fetchData = async () => {
    try {
      const [logs, vehiclesRes, driversRes] = await Promise.all([
        api.get('/gates'),
        api.get('/vehicles'),
        api.get('/drivers'),
      ]);
      setGateLogs(logs.data);
      setVehicles(vehiclesRes.data);
      setDrivers(driversRes.data);
    } catch (error) {
      console.error('Gate fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCheckIn = async () => {
    if (!checkInForm.vehicle_id || !checkInForm.driver_id) {
      setMessage({ type: 'error', text: 'Vehicle and driver are required' });
      return;
    }
    try {
      setSubmitting(true);
      await api.post('/gates/checkin', checkInForm);
      setMessage({ type: 'success', text: 'Vehicle checked in successfully' });
      setShowCheckIn(false);
      setCheckInForm({ vehicle_id: '', driver_id: '', direction: 'inbound', purpose: 'delivery', notes: '' });
      fetchData();
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Check in failed' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCheckOut = async (id) => {
    try {
      await api.put(`/gates/checkout/${id}`);
      setMessage({ type: 'success', text: 'Vehicle checked out successfully' });
      fetchData();
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Check out failed' });
    }
  };

  const filtered = gateLogs.filter((log) =>
  (log.plate_number && log.plate_number.toLowerCase().includes(search.toLowerCase())) ||
  (log.driver_name && log.driver_name.toLowerCase().includes(search.toLowerCase())) ||
  (log.purpose && log.purpose.toLowerCase().includes(search.toLowerCase())) ||
  (log.direction && log.direction.toLowerCase().includes(search.toLowerCase()))
);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar title="Gate Management" />
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
            <h3 className="font-semibold text-gray-800">Gate Logs</h3>
            <button onClick={() => setShowCheckIn(true)} className="btn-primary">
              + Vehicle Check In
            </button>
          </div>

          <input
  type="text"
  className="input-field max-w-sm"
  placeholder="Search by plate, driver, direction or purpose..."
  value={search}
  onChange={(e) => setSearch(e.target.value)}
/>

          {/* Check In Form */}
          {showCheckIn && (
            <div className="card">
              <h4 className="font-semibold text-gray-800 mb-4">Vehicle Check In</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle</label>
                  <select
                    className="input-field"
                    value={checkInForm.vehicle_id}
                    onChange={(e) => setCheckInForm({ ...checkInForm, vehicle_id: e.target.value })}
                  >
                    <option value="">Select vehicle</option>
                    {vehicles.map((v) => (
                      <option key={v.id} value={v.id}>{v.plate_number} ({v.type})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Driver</label>
                  <select
                    className="input-field"
                    value={checkInForm.driver_id}
                    onChange={(e) => setCheckInForm({ ...checkInForm, driver_id: e.target.value })}
                  >
                    <option value="">Select driver</option>
                    {drivers.map((d) => (
                      <option key={d.id} value={d.id}>{d.full_name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Direction</label>
                  <select
                    className="input-field"
                    value={checkInForm.direction}
                    onChange={(e) => setCheckInForm({ ...checkInForm, direction: e.target.value })}
                  >
                    <option value="inbound">Inbound</option>
                    <option value="outbound">Outbound</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Purpose</label>
                  <select
                    className="input-field"
                    value={checkInForm.purpose}
                    onChange={(e) => setCheckInForm({ ...checkInForm, purpose: e.target.value })}
                  >
                    <option value="delivery">Delivery</option>
                    <option value="dispatch">Dispatch</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    className="input-field"
                    rows={2}
                    placeholder="Optional notes..."
                    value={checkInForm.notes}
                    onChange={(e) => setCheckInForm({ ...checkInForm, notes: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-4">
                <button onClick={handleCheckIn} disabled={submitting} className="btn-primary">
                  {submitting ? 'Processing...' : 'Confirm Check In'}
                </button>
                <button onClick={() => setShowCheckIn(false)} className="btn-secondary">
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Gate Logs Table */}
          <div className="card overflow-x-auto">
            {loading ? (
              <p className="text-gray-400 text-sm">Loading...</p>
            ) : gateLogs.length === 0 ? (
              <p className="text-gray-400 text-sm">No gate logs yet</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-3 px-2 text-gray-500 font-medium">Vehicle</th>
                    <th className="text-left py-3 px-2 text-gray-500 font-medium">Driver</th>
                    <th className="text-left py-3 px-2 text-gray-500 font-medium">Direction</th>
                    <th className="text-left py-3 px-2 text-gray-500 font-medium">Purpose</th>
                    <th className="text-left py-3 px-2 text-gray-500 font-medium">Arrival</th>
                    <th className="text-left py-3 px-2 text-gray-500 font-medium">Departure</th>
                    <th className="text-left py-3 px-2 text-gray-500 font-medium">Turnaround</th>
                    <th className="text-left py-3 px-2 text-gray-500 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((log) => (
                    <tr key={log.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="py-3 px-2 font-medium">{log.plate_number}</td>
                      <td className="py-3 px-2 text-gray-600">{log.driver_name}</td>
                      <td className="py-3 px-2">
                        <span className={log.direction === 'inbound' ? 'badge-success' : 'badge-info'}>
                          {log.direction}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-gray-600 capitalize">{log.purpose}</td>
                      <td className="py-3 px-2 text-gray-600">
                        {new Date(log.arrival_time).toLocaleString()}
                      </td>
                      <td className="py-3 px-2 text-gray-600">
                        {log.departure_time ? new Date(log.departure_time).toLocaleString() : '-'}
                      </td>
                      <td className="py-3 px-2 text-gray-600">
                        {log.turnaround_minutes ? `${log.turnaround_minutes} min` : '-'}
                      </td>
                      <td className="py-3 px-2">
                        {!log.departure_time && (
                          <button
                            onClick={() => handleCheckOut(log.id)}
                            className="text-xs bg-orange-100 text-orange-700 px-3 py-1 rounded-lg hover:bg-orange-200"
                          >
                            Check Out
                          </button>
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

export default Gate;