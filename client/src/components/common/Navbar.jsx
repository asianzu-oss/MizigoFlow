import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

const Navbar = ({ title }) => {
  const { user } = useAuth();
  const [online, setOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
      <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
      <div className="flex items-center gap-3">
        {/* Online/Offline indicator */}
        <div className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded-full ${online ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          <div className={`w-1.5 h-1.5 rounded-full ${online ? 'bg-green-500' : 'bg-red-500'}`}></div>
          {online ? 'Online' : 'Offline'}
        </div>

        <span className="text-sm text-gray-500">
          {new Date().toLocaleDateString('en-UG', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </span>
        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
          {user?.full_name?.charAt(0)}
        </div>
      </div>
    </div>
  );
};

export default Navbar;