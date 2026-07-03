import { useState, useEffect } from 'react';
import Sidebar from '../components/common/Sidebar';
import Navbar from '../components/common/Navbar';
import api from '../services/api';

const Reports = () => {
  const [gateLogs, setGateLogs] = useState([]);
  const [stockMovements, setStockMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('gate');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [gateRes, inventoryRes] = await Promise.all([
          api.get('/gates'),
          api.get('/inventory'),
        ]);
        setGateLogs(gateRes.data);

        // Fetch movements for all products
        const movements = [];
        for (const product of inventoryRes.data) {
          const res = await api.get(`/inventory/${product.id}`);
          movements.push(...(res.data.movements || []));
        }
        setStockMovements(movements);
      } catch (error) {
        console.error('Reports fetch error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar title="Reports" />
        <div className="p-6 space-y-6">

          {/* Tabs */}
          <div className="flex gap-2 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('gate')}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'gate' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              Vehicle Movement Report
            </button>
            <button
              onClick={() => setActiveTab('stock')}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'stock' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              Stock Movement Report
            </button>
          </div>

          {loading ? (
            <p className="text-gray-400 text-sm">Loading reports...</p>
          ) : activeTab === 'gate' ? (
            <div className="card overflow-x-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-gray-800">Vehicle Movement Report</h3>
                <button onClick={() => window.print()} className="btn-secondary text-sm">
                  🖨️ Print
                </button>
              </div>
              {gateLogs.length === 0 ? (
                <p className="text-gray-400 text-sm">No gate logs yet</p>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left py-3 px-2 text-gray-500 font-medium">#</th>
                      <th className="text-left py-3 px-2 text-gray-500 font-medium">Vehicle</th>
                      <th className="text-left py-3 px-2 text-gray-500 font-medium">Driver</th>
                      <th className="text-left py-3 px-2 text-gray-500 font-medium">Direction</th>
                      <th className="text-left py-3 px-2 text-gray-500 font-medium">Purpose</th>
                      <th className="text-left py-3 px-2 text-gray-500 font-medium">Arrival</th>
                      <th className="text-left py-3 px-2 text-gray-500 font-medium">Departure</th>
                      <th className="text-left py-3 px-2 text-gray-500 font-medium">Turnaround</th>
                    </tr>
                  </thead>
                  <tbody>
                    {gateLogs.map((log) => (
                      <tr key={log.id} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="py-3 px-2 text-gray-400">{log.id}</td>
                        <td className="py-3 px-2 font-medium">{log.plate_number}</td>
                        <td className="py-3 px-2 text-gray-600">{log.driver_name}</td>
                        <td className="py-3 px-2">
                          <span className={log.direction === 'inbound' ? 'badge-success' : 'badge-info'}>
                            {log.direction}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-gray-600 capitalize">{log.purpose}</td>
                        <td className="py-3 px-2 text-gray-600">{new Date(log.arrival_time).toLocaleString()}</td>
                        <td className="py-3 px-2 text-gray-600">{log.departure_time ? new Date(log.departure_time).toLocaleString() : '-'}</td>
                        <td className="py-3 px-2 text-gray-600">{log.turnaround_minutes ? `${log.turnaround_minutes} min` : '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          ) : (
            <div className="card overflow-x-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-gray-800">Stock Movement Report</h3>
                <button onClick={() => window.print()} className="btn-secondary text-sm">
                  🖨️ Print
                </button>
              </div>
              {stockMovements.length === 0 ? (
                <p className="text-gray-400 text-sm">No stock movements yet</p>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left py-3 px-2 text-gray-500 font-medium">#</th>
                      <th className="text-left py-3 px-2 text-gray-500 font-medium">Product</th>
                      <th className="text-left py-3 px-2 text-gray-500 font-medium">Type</th>
                      <th className="text-left py-3 px-2 text-gray-500 font-medium">Quantity</th>
                      <th className="text-left py-3 px-2 text-gray-500 font-medium">Performed By</th>
                      <th className="text-left py-3 px-2 text-gray-500 font-medium">Date</th>
                      <th className="text-left py-3 px-2 text-gray-500 font-medium">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stockMovements.map((movement) => (
                      <tr key={movement.id} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="py-3 px-2 text-gray-400">{movement.id}</td>
                        <td className="py-3 px-2 font-medium">{movement.product_id}</td>
                        <td className="py-3 px-2">
                          <span className={movement.movement_type === 'inbound' ? 'badge-success' : movement.movement_type === 'outbound' ? 'badge-danger' : 'badge-warning'}>
                            {movement.movement_type}
                          </span>
                        </td>
                        <td className="py-3 px-2 font-semibold">{movement.quantity}</td>
                        <td className="py-3 px-2 text-gray-600">{movement.performed_by_name}</td>
                        <td className="py-3 px-2 text-gray-600">{new Date(movement.created_at).toLocaleString()}</td>
                        <td className="py-3 px-2 text-gray-600">{movement.notes || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default Reports;