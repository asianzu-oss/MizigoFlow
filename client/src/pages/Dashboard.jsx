import { useState, useEffect } from 'react';
import Sidebar from '../components/common/Sidebar';
import Navbar from '../components/common/Navbar';
import api from '../services/api';

const StatCard = ({ title, value, icon, color }) => (
  <div className="card flex items-center gap-4">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${color}`}>
      {icon}
    </div>
    <div>
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
    </div>
  </div>
);

const Dashboard = () => {
  const [stats, setStats] = useState({
    vehicles: 0,
    products: 0,
    orders: 0,
    lowStock: 0,
  });
  const [recentGateLogs, setRecentGateLogs] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [vehicles, products, orders, lowStock, gateLogs] = await Promise.all([
          api.get('/vehicles'),
          api.get('/inventory'),
          api.get('/orders'),
          api.get('/inventory/lowstock'),
          api.get('/gates'),
        ]);

        setStats({
          vehicles: vehicles.data.length,
          products: products.data.length,
          orders: orders.data.length,
          lowStock: lowStock.data.length,
        });

        setRecentGateLogs(gateLogs.data.slice(0, 5));
        setRecentOrders(orders.data.slice(0, 5));
      } catch (error) {
        console.error('Dashboard error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar title="Dashboard" />
        <div className="p-6 space-y-6">

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Total Vehicles" value={stats.vehicles} icon="🚛" color="bg-blue-50" />
            <StatCard title="Products" value={stats.products} icon="📦" color="bg-green-50" />
            <StatCard title="Total Orders" value={stats.orders} icon="📋" color="bg-purple-50" />
            <StatCard title="Low Stock Alerts" value={stats.lowStock} icon="⚠️" color="bg-red-50" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Recent Gate Logs */}
            <div className="card">
              <h3 className="font-semibold text-gray-800 mb-4">Recent Gate Activity</h3>
              {recentGateLogs.length === 0 ? (
                <p className="text-gray-400 text-sm">No gate activity yet</p>
              ) : (
                <div className="space-y-3">
                  {recentGateLogs.map((log) => (
                    <div key={log.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                      <div>
                        <p className="text-sm font-medium text-gray-800">{log.plate_number}</p>
                        <p className="text-xs text-gray-500">{log.driver_name} · {log.purpose}</p>
                      </div>
                      <div className="text-right">
                        <span className={log.direction === 'inbound' ? 'badge-success' : 'badge-info'}>
                          {log.direction}
                        </span>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(log.arrival_time).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Orders */}
            <div className="card">
              <h3 className="font-semibold text-gray-800 mb-4">Recent Orders</h3>
              {recentOrders.length === 0 ? (
                <p className="text-gray-400 text-sm">No orders yet</p>
              ) : (
                <div className="space-y-3">
                  {recentOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                      <div>
                        <p className="text-sm font-medium text-gray-800">Order #{order.id}</p>
                        <p className="text-xs text-gray-500">{order.plate_number} · {order.driver_name}</p>
                      </div>
                      <div className="text-right">
                        <span className={
                          order.status === 'completed' ? 'badge-success' :
                          order.status === 'pending' ? 'badge-warning' :
                          order.status === 'cancelled' ? 'badge-danger' : 'badge-info'
                        }>
                          {order.status}
                        </span>
                        <p className="text-xs text-gray-400 mt-1 capitalize">{order.order_type}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;