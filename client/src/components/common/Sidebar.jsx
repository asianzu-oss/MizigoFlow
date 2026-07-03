import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const navigation = [
  { name: 'Dashboard', path: '/', icon: '📊', roles: ['admin', 'manager', 'storekeeper', 'gate_guard'] },
  { name: 'Gate Management', path: '/gate', icon: '🚛', roles: ['admin', 'manager', 'gate_guard'] },
  { name: 'Vehicles', path: '/vehicles', icon: '🚗', roles: ['admin', 'manager', 'storekeeper'] },
  { name: 'Drivers', path: '/drivers', icon: '👤', roles: ['admin', 'manager', 'storekeeper'] },
  { name: 'Inventory', path: '/inventory', icon: '📦', roles: ['admin', 'manager', 'storekeeper'] },
  { name: 'Orders', path: '/orders', icon: '📋', roles: ['admin', 'manager', 'storekeeper'] },
  { name: 'Documents', path: '/documents', icon: '🖨️', roles: ['admin', 'manager', 'storekeeper'] },
  { name: 'Reports', path: '/reports', icon: '📈', roles: ['admin', 'manager'] },
  { name: 'Users', path: '/users', icon: '👥', roles: ['admin'] },
];


const Sidebar = () => {
  const { user, logout } = useAuth();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const allowedNav = navigation.filter(item => item.roles.includes(user?.role));

  return (
    <>
      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full mx-4 shadow-xl">
            <h4 className="font-semibold text-gray-800 mb-2">Confirm Logout</h4>
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to log out of MizigoFlow?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => { logout(); setShowLogoutConfirm(false); }}
                className="btn-danger"
              >
                Yes, Log Out
              </button>
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="w-64 bg-gray-900 min-h-screen flex flex-col">
        {/* Logo */}
        <div className="px-6 py-5 border-b border-gray-700">
          <h1 className="text-white text-xl font-bold">MizigoFlow</h1>
          <p className="text-gray-400 text-xs mt-1">Warehouse Management</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {allowedNav.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`
              }
            >
              <span>{item.icon}</span>
              {item.name}
            </NavLink>
          ))}
        </nav>

        {/* User info & logout */}
        <div className="px-4 py-4 border-t border-gray-700">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
              {user?.full_name?.charAt(0)}
            </div>
            <div>
              <p className="text-white text-sm font-medium">{user?.full_name}</p>
              <p className="text-gray-400 text-xs capitalize">{user?.role}</p>
            </div>
          </div>
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="w-full text-left text-gray-400 hover:text-white text-sm px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors"
          >
            🚪 Logout
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;