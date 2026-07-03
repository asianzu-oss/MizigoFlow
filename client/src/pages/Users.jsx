import { useState, useEffect } from 'react';
import Sidebar from '../components/common/Sidebar';
import Navbar from '../components/common/Navbar';
import api from '../services/api';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddUser, setShowAddUser] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [deletingUser, setDeletingUser] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  const [userForm, setUserForm] = useState({
    full_name: '',
    email: '',
    phone_number: '',
    password: '',
    role: 'gate_guard',
  });

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users');
      setUsers(res.data);
    } catch (error) {
      console.error('Fetch users error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAddUser = async () => {
    if (!userForm.full_name || !userForm.phone_number || !userForm.password) {
      setMessage({ type: 'error', text: 'Full name, phone number and password are required' });
      return;
    }
    try {
      setSubmitting(true);
      await api.post('/auth/register', userForm);
      setMessage({ type: 'success', text: 'User created successfully' });
      setShowAddUser(false);
      setUserForm({ full_name: '', email: '', phone_number: '', password: '', role: 'gate_guard' });
      fetchUsers();
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to create user' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditUser = async () => {
    if (!editingUser.full_name || !editingUser.phone_number) {
      setMessage({ type: 'error', text: 'Full name and phone number are required' });
      return;
    }
    try {
      setSubmitting(true);
      await api.put(`/users/${editingUser.id}`, editingUser);
      setMessage({ type: 'success', text: 'User updated successfully' });
      setEditingUser(null);
      fetchUsers();
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to update user' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteUser = async () => {
    try {
      setSubmitting(true);
      await api.delete(`/users/${deletingUser.id}`);
      setMessage({ type: 'success', text: 'User deleted successfully' });
      setDeletingUser(null);
      fetchUsers();
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to delete user' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar title="User Management" />
        <div className="p-6 space-y-6">

          {/* Message */}
          {message && (
            <div className={`px-4 py-3 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
              {message.text}
              <button onClick={() => setMessage(null)} className="ml-2 font-bold">×</button>
            </div>
          )}

          {/* Delete Confirmation Modal */}
          {deletingUser && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl p-6 max-w-sm w-full mx-4 shadow-xl">
                <h4 className="font-semibold text-gray-800 mb-2">Delete User</h4>
                <p className="text-sm text-gray-600 mb-4">
                  Are you sure you want to delete <strong>{deletingUser.full_name}</strong>? This action cannot be undone.
                </p>
                <div className="flex gap-3">
                  <button onClick={handleDeleteUser} disabled={submitting} className="btn-danger">
                    {submitting ? 'Deleting...' : 'Yes, Delete'}
                  </button>
                  <button onClick={() => setDeletingUser(null)} className="btn-secondary">Cancel</button>
                </div>
              </div>
            </div>
          )}

          {/* Header */}
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-gray-800">All Users</h3>
            <button onClick={() => setShowAddUser(true)} className="btn-primary">
              + Add User
            </button>
          </div>

          {/* Add User Form */}
          {showAddUser && (
            <div className="card">
              <h4 className="font-semibold text-gray-800 mb-4">Add New User</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                  <input className="input-field" placeholder="e.g. John Mukasa" value={userForm.full_name} onChange={(e) => setUserForm({ ...userForm, full_name: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                  <input className="input-field" placeholder="e.g. 0701234567" value={userForm.phone_number} onChange={(e) => setUserForm({ ...userForm, phone_number: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email (optional)</label>
                  <input className="input-field" placeholder="e.g. john@example.com" value={userForm.email} onChange={(e) => setUserForm({ ...userForm, email: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                  <input type="password" className="input-field" placeholder="Enter password" value={userForm.password} onChange={(e) => setUserForm({ ...userForm, password: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
                  <select className="input-field" value={userForm.role} onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}>
                    <option value="gate_guard">Gate Guard</option>
                    <option value="storekeeper">Storekeeper</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 mt-4">
                <button onClick={handleAddUser} disabled={submitting} className="btn-primary">
                  {submitting ? 'Creating...' : 'Create User'}
                </button>
                <button onClick={() => setShowAddUser(false)} className="btn-secondary">Cancel</button>
              </div>
            </div>
          )}

          {/* Edit User Form */}
          {editingUser && (
            <div className="card border-blue-200 border">
              <h4 className="font-semibold text-gray-800 mb-4">Edit User — {editingUser.full_name}</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                  <input className="input-field" value={editingUser.full_name} onChange={(e) => setEditingUser({ ...editingUser, full_name: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                  <input className="input-field" value={editingUser.phone_number} onChange={(e) => setEditingUser({ ...editingUser, phone_number: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email (optional)</label>
                  <input className="input-field" value={editingUser.email || ''} onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
                  <select className="input-field" value={editingUser.role} onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}>
                    <option value="gate_guard">Gate Guard</option>
                    <option value="storekeeper">Storekeeper</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select className="input-field" value={editingUser.is_active} onChange={(e) => setEditingUser({ ...editingUser, is_active: e.target.value === 'true' })}>
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 mt-4">
                <button onClick={handleEditUser} disabled={submitting} className="btn-primary">
                  {submitting ? 'Saving...' : 'Save Changes'}
                </button>
                <button onClick={() => setEditingUser(null)} className="btn-secondary">Cancel</button>
              </div>
            </div>
          )}

          {/* Users Table */}
          <div className="card overflow-x-auto">
            {loading ? (
              <p className="text-gray-400 text-sm">Loading...</p>
            ) : users.length === 0 ? (
              <p className="text-gray-400 text-sm">No users yet</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-3 px-2 text-gray-500 font-medium">Name</th>
                    <th className="text-left py-3 px-2 text-gray-500 font-medium">Phone</th>
                    <th className="text-left py-3 px-2 text-gray-500 font-medium">Email</th>
                    <th className="text-left py-3 px-2 text-gray-500 font-medium">Role</th>
                    <th className="text-left py-3 px-2 text-gray-500 font-medium">Status</th>
                    <th className="text-left py-3 px-2 text-gray-500 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="py-3 px-2 font-medium">{user.full_name}</td>
                      <td className="py-3 px-2 text-gray-600">{user.phone_number}</td>
                      <td className="py-3 px-2 text-gray-600">{user.email || '-'}</td>
                      <td className="py-3 px-2">
                        <span className="badge-info capitalize">{user.role}</span>
                      </td>
                      <td className="py-3 px-2">
                        <span className={user.is_active ? 'badge-success' : 'badge-danger'}>
                          {user.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="py-3 px-2">
                        <div className="flex gap-2">
                          <button
                            onClick={() => setEditingUser(user)}
                            className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-lg hover:bg-blue-200"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => setDeletingUser(user)}
                            className="text-xs bg-red-100 text-red-700 px-3 py-1 rounded-lg hover:bg-red-200"
                          >
                            Delete
                          </button>
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

export default Users;