import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';
import ConfirmModal from '../components/ConfirmModal';

type UserRole = 'ADMIN' | 'SUPERADMIN';

interface AdminUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  birthDate?: string | null;
  role: UserRole;
}

const AdminAdminsPage = () => {
  const { user: currentUser } = useAuth();
  const currentUserId = currentUser?.id;

  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);

  const [newFirstName, setNewFirstName] = useState('');
  const [newLastName, setNewLastName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newBirthDate, setNewBirthDate] = useState('');

  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editFirstName, setEditFirstName] = useState('');
  const [editLastName, setEditLastName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editBirthDate, setEditBirthDate] = useState('');
  const [password, setPassword] = useState('');
  const [adminToDelete, setAdminToDelete] = useState<AdminUser | null>(null);

  const fetchAdmins = async () => {
    try {
      const res = await api.get('/admin/admins');
      setAdmins(res.data);
    } catch {
      toast.error("We couldn't load admins. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const createAdmin = async () => {
    if (!newFirstName || !newLastName || !newEmail || !newPassword) {
      toast.error('Please fill in first name, last name, email, and password.');
      return;
    }

    setCreating(true);
    try {
      await api.post('/admin/users', {
        firstName: newFirstName,
        lastName: newLastName,
        email: newEmail,
        password: newPassword,
        birthDate: newBirthDate || undefined,
        role: 'ADMIN',
      });

      setNewFirstName('');
      setNewLastName('');
      setNewEmail('');
      setNewPassword('');
      setNewBirthDate('');
      fetchAdmins();
    } catch {
      toast.error("We couldn't create this admin. Please try again.");
    } finally {
      setCreating(false);
    }
  };

  const deleteAdmin = async (admin: AdminUser) => {
    setSavingId(admin.id);
    try {
      await api.delete(`/admin/users/${admin.id}`);
      setAdmins((prev) => prev.filter((a) => a.id !== admin.id));
      setAdminToDelete(null);
    } catch {
      toast.error("We couldn't delete this admin. Please try again.");
    } finally {
      setSavingId(null);
    }
  };

  const startEdit = (admin: AdminUser) => {
    setEditingUserId(admin.id);
    setEditFirstName(admin.firstName);
    setEditLastName(admin.lastName);
    setEditEmail(admin.email);
    setEditBirthDate(admin.birthDate ? admin.birthDate.slice(0, 10) : '');
    setPassword('');
  };

  const cancelEdit = () => {
    setEditingUserId(null);
    setEditFirstName('');
    setEditLastName('');
    setEditEmail('');
    setEditBirthDate('');
    setPassword('');
  };

  const saveEdit = async () => {
    if (!editingUserId) return;
    if (!editFirstName || !editLastName || !editEmail) {
      toast.error('Please fill in first name, last name, and email.');
      return;
    }

    setSavingId(editingUserId);
    try {
      const payload: {
        firstName: string;
        lastName: string;
        birthDate: string | undefined;
        email: string;
        password?: string;
      } = {
        firstName: editFirstName,
        lastName: editLastName,
        birthDate: editBirthDate || undefined,
        email: editEmail,
      };

      if (password) {
        payload.password = password;
      }

      await api.patch(`/users/${editingUserId}`, payload);
      cancelEdit();
      fetchAdmins();
    } catch {
      toast.error("We couldn't update this admin. Please try again.");
    } finally {
      setSavingId(null);
    }
  };

  if (loading) return <div className="text-center p-4">Loading admins...</div>;

  return (
    <div className="max-w-5xl mx-auto px-4 space-y-6">
      <ConfirmModal
        isOpen={Boolean(adminToDelete)}
        title="Delete admin"
        message={
          adminToDelete
            ? `Delete ${adminToDelete.firstName} ${adminToDelete.lastName}?`
            : ''
        }
        confirmText="Delete"
        confirmVariant="danger"
        loading={Boolean(adminToDelete && savingId === adminToDelete.id)}
        onConfirm={() => {
          if (adminToDelete) {
            deleteAdmin(adminToDelete);
          }
        }}
        onCancel={() => setAdminToDelete(null)}
      />

      <h1 className="text-3xl font-bold text-center mb-6">Admin Management</h1>

      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Create Admin</h2>
        <div className="border-b mb-4"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            value={newFirstName}
            onChange={(e) => setNewFirstName(e.target.value)}
            placeholder="First name"
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            value={newLastName}
            onChange={(e) => setNewLastName(e.target.value)}
            placeholder="Last name"
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            placeholder="Email"
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Password"
            type="password"
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="date"
            value={newBirthDate}
            onChange={(e) => setNewBirthDate(e.target.value)}
            placeholder="Birth date (optional)"
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          onClick={createAdmin}
          disabled={creating}
          className="mt-4 bg-green-500 hover:bg-green-600 text-white px-5 py-2 rounded-md font-medium disabled:opacity-50"
        >
          {creating ? 'Creating...' : 'Create Admin'}
        </button>
      </div>

      {editingUserId && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4 text-blue-600">Edit Admin</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              value={editFirstName}
              onChange={(e) => setEditFirstName(e.target.value)}
              placeholder="First name"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              value={editLastName}
              onChange={(e) => setEditLastName(e.target.value)}
              placeholder="Last name"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              value={editEmail}
              onChange={(e) => setEditEmail(e.target.value)}
              placeholder="Email"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="date"
              value={editBirthDate}
              onChange={(e) => setEditBirthDate(e.target.value)}
              placeholder="Birth date"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div>
              <input
                type="password"
                placeholder="New password (optional)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Leave empty to keep current password
              </p>
            </div>
          </div>
          <div className="mt-4 space-x-2">
            <button
              onClick={saveEdit}
              disabled={savingId === editingUserId}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md disabled:opacity-50"
            >
              Save
            </button>
            <button onClick={cancelEdit} className="bg-gray-300 hover:bg-gray-400 text-black px-4 py-2 rounded-md">
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="text-gray-500 uppercase text-xs">
              <tr>
                <th className="py-3 px-3">First Name</th>
                <th className="py-3 px-3">Last Name</th>
                <th className="py-3 px-3">Email</th>
                <th className="py-3 px-3">Birth Date</th>
                <th className="py-3 px-3">Role</th>
                <th className="py-3 px-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {admins.map((admin) => (
                <tr key={admin.id} className="border-t hover:bg-gray-50 transition">
                  <td className="py-3 px-3">{admin.firstName}</td>
                  <td className="py-3 px-3">{admin.lastName}</td>
                  <td className="py-3 px-3">{admin.email}</td>
                  <td className="py-3 px-3">{admin.birthDate ? admin.birthDate.slice(0, 10) : '-'}</td>
                  <td className="py-3 px-3">{admin.role}</td>
                  <td className="py-3 px-3 space-x-2">
                    <button
                      onClick={() => startEdit(admin)}
                      className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1.5 text-sm rounded-md"
                    >
                      Edit
                    </button>
                    {admin.role === 'ADMIN' && admin.id !== currentUserId && (
                      <button
                        onClick={() => setAdminToDelete(admin)}
                        disabled={savingId === admin.id}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 text-sm rounded-md disabled:opacity-50"
                      >
                        {savingId === admin.id ? 'Deleting...' : 'Delete'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminAdminsPage;
