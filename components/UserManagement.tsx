'use client';

import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Shield, Edit, Trash2, Check, X, Mail, User as UserIcon, Crown, Briefcase, HardHat } from 'lucide-react';
import {
  getAllUsers,
  registerUser,
  updateUserRole,
  updateUserProfile,
  deactivateUser,
  reactivateUser,
  UserProfile,
  UserRole,
  isOwner,
} from '@/lib/authService';
import { showSuccess, showError } from '@/lib/toast';
import { useAuth } from '@/contexts/AuthContext';

export default function UserManagement() {
  const { userProfile } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);

  // New user form
  const [newUserForm, setNewUserForm] = useState({
    email: '',
    password: '',
    displayName: '',
    role: 'worker' as UserRole,
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const allUsers = await getAllUsers();
      setUsers(allUsers);
    } catch (error) {
      showError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate
    if (!newUserForm.email || !newUserForm.password || !newUserForm.displayName) {
      showError('Please fill in all fields');
      return;
    }

    if (newUserForm.password.length < 6) {
      showError('Password must be at least 6 characters');
      return;
    }

    try {
      const result = await registerUser(
        newUserForm.email,
        newUserForm.password,
        newUserForm.displayName,
        newUserForm.role
      );

      if (result.success) {
        showSuccess(`User ${newUserForm.displayName} created successfully!`);
        setShowAddModal(false);
        setNewUserForm({ email: '', password: '', displayName: '', role: 'worker' });
        await loadUsers();
      } else {
        showError(result.error || 'Failed to create user');
      }
    } catch (error: any) {
      showError(error.message || 'Failed to create user');
    }
  };

  const handleChangeRole = async (userId: string, newRole: UserRole) => {
    if (userId === userProfile?.uid) {
      showError("You can't change your own role");
      return;
    }

    if (confirm(`Are you sure you want to change this user's role to ${newRole}?`)) {
      const result = await updateUserRole(userId, newRole);
      if (result.success) {
        showSuccess('Role updated successfully');
        await loadUsers();
      } else {
        showError(result.error || 'Failed to update role');
      }
    }
  };

  const handleToggleActive = async (user: UserProfile) => {
    if (user.uid === userProfile?.uid) {
      showError("You can't deactivate yourself");
      return;
    }

    const action = user.isActive ? 'deactivate' : 'reactivate';
    if (confirm(`Are you sure you want to ${action} ${user.displayName}?`)) {
      const result = user.isActive
        ? await deactivateUser(user.uid)
        : await reactivateUser(user.uid);

      if (result.success) {
        showSuccess(`User ${action}d successfully`);
        await loadUsers();
      } else {
        showError(result.error || `Failed to ${action} user`);
      }
    }
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'owner':
        return <Crown className="text-yellow-600" size={20} />;
      case 'manager':
        return <Briefcase className="text-blue-600" size={20} />;
      case 'worker':
        return <HardHat className="text-green-600" size={20} />;
      default:
        return <UserIcon className="text-gray-600" size={20} />;
    }
  };

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case 'owner':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'manager':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'worker':
        return 'bg-green-100 text-green-800 border-green-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  // Check if current user is owner
  if (!isOwner(userProfile)) {
    return (
      <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-8 text-center">
        <Shield className="mx-auto mb-4 text-yellow-600" size={48} />
        <h3 className="text-xl font-bold text-yellow-900 mb-2">Access Denied</h3>
        <p className="text-yellow-800">Only farm owners can manage users.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Users size={32} />
              <h2 className="text-2xl font-bold">User Management</h2>
            </div>
            <p className="text-purple-100">Manage team members and permissions</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-white text-purple-600 font-semibold px-6 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all hover:scale-105 flex items-center gap-2"
          >
            <UserPlus size={20} />
            Add User
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-2">
            <Users className="text-purple-600" size={24} />
            <h3 className="font-semibold text-gray-700">Total Users</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">{users.length}</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-2">
            <Crown className="text-yellow-600" size={24} />
            <h3 className="font-semibold text-gray-700">Owners</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {users.filter(u => u.role === 'owner').length}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-2">
            <Briefcase className="text-blue-600" size={24} />
            <h3 className="font-semibold text-gray-700">Managers</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {users.filter(u => u.role === 'manager').length}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-2">
            <HardHat className="text-green-600" size={24} />
            <h3 className="font-semibold text-gray-700">Workers</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {users.filter(u => u.role === 'worker').length}
          </p>
        </div>
      </div>

      {/* Users List */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b-2 border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">User</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Role</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Joined</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.uid} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                        {user.displayName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{user.displayName}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {getRoleIcon(user.role)}
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border-2 ${getRoleBadgeColor(user.role)}`}>
                        {user.role.toUpperCase()}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {user.isActive ? (
                      <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold border-2 border-green-300">
                        ACTIVE
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold border-2 border-red-300">
                        INACTIVE
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-600">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {/* Change Role Dropdown */}
                      {user.uid !== userProfile?.uid && (
                        <select
                          value={user.role}
                          onChange={(e) => handleChangeRole(user.uid, e.target.value as UserRole)}
                          className="px-3 py-1 border-2 border-gray-300 rounded-lg text-sm focus:border-purple-500 focus:outline-none"
                        >
                          <option value="owner">Owner</option>
                          <option value="manager">Manager</option>
                          <option value="worker">Worker</option>
                        </select>
                      )}

                      {/* Deactivate/Reactivate */}
                      {user.uid !== userProfile?.uid && (
                        <button
                          onClick={() => handleToggleActive(user)}
                          className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                            user.isActive
                              ? 'bg-red-100 text-red-700 hover:bg-red-200'
                              : 'bg-green-100 text-green-700 hover:bg-green-200'
                          }`}
                        >
                          {user.isActive ? 'Deactivate' : 'Reactivate'}
                        </button>
                      )}

                      {user.uid === userProfile?.uid && (
                        <span className="text-xs text-gray-500 italic">(You)</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Add New User</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleAddUser} className="space-y-4">
              {/* Display Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={newUserForm.displayName}
                  onChange={(e) => setNewUserForm({ ...newUserForm, displayName: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
                  placeholder="John Doe"
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={newUserForm.email}
                  onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
                  placeholder="john@farm.com"
                  required
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={newUserForm.password}
                  onChange={(e) => setNewUserForm({ ...newUserForm, password: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
                  placeholder="Min. 6 characters"
                  required
                  minLength={6}
                />
              </div>

              {/* Role */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Role
                </label>
                <select
                  value={newUserForm.role}
                  onChange={(e) => setNewUserForm({ ...newUserForm, role: e.target.value as UserRole })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
                >
                  <option value="worker">Worker (Limited Access)</option>
                  <option value="manager">Manager (Most Access)</option>
                  <option value="owner">Owner (Full Access)</option>
                </select>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all hover:scale-105"
                >
                  Add User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Role Permissions Info */}
      <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
        <h3 className="font-bold text-blue-900 mb-4">🔑 Role Permissions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Owner */}
          <div className="bg-white rounded-lg p-4 border-2 border-yellow-300">
            <div className="flex items-center gap-2 mb-3">
              <Crown className="text-yellow-600" size={20} />
              <h4 className="font-bold text-yellow-900">Owner</h4>
            </div>
            <ul className="text-sm text-yellow-800 space-y-1">
              <li>✅ Manage users</li>
              <li>✅ View/edit everything</li>
              <li>✅ Delete records</li>
              <li>✅ Access financials</li>
              <li>✅ Full reports</li>
            </ul>
          </div>

          {/* Manager */}
          <div className="bg-white rounded-lg p-4 border-2 border-blue-300">
            <div className="flex items-center gap-2 mb-3">
              <Briefcase className="text-blue-600" size={20} />
              <h4 className="font-bold text-blue-900">Manager</h4>
            </div>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>❌ No user management</li>
              <li>✅ View/edit inventory</li>
              <li>✅ Delete some records</li>
              <li>✅ View financials</li>
              <li>✅ View reports</li>
            </ul>
          </div>

          {/* Worker */}
          <div className="bg-white rounded-lg p-4 border-2 border-green-300">
            <div className="flex items-center gap-2 mb-3">
              <HardHat className="text-green-600" size={20} />
              <h4 className="font-bold text-green-900">Worker</h4>
            </div>
            <ul className="text-sm text-green-800 space-y-1">
              <li>❌ No user management</li>
              <li>✅ View inventory</li>
              <li>✅ Update inventory</li>
              <li>❌ No delete access</li>
              <li>❌ No reports access</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
