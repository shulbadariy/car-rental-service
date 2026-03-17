import { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';

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

  const fetchAdmins = async () => {
    try {
      const res = await api.get('/admin/admins');
      setAdmins(res.data);
    } catch (err: any) {
      alert('Failed to load admins');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const createAdmin = async () => {
    if (!newFirstName || !newLastName || !newEmail || !newPassword) {
      alert('First name, last name, email, and password are required');
      return;
    }

    setCreating(true);
    try {
      const registerRes = await api.post('/auth/register', {
        email: newEmail,
        password: newPassword,
      });

      const createdUserId = registerRes.data?.id;
      if (!createdUserId) {
        throw new Error('User creation did not return user id');
      }

      await api.patch(`/users/${createdUserId}`, {
        firstName: newFirstName,
        lastName: newLastName,
        email: newEmail,
        birthDate: newBirthDate || undefined,
        role: 'ADMIN',
      });

      setNewFirstName('');
      setNewLastName('');
      setNewEmail('');
      setNewPassword('');
      setNewBirthDate('');
      fetchAdmins();
    } catch (err: any) {
      alert('Failed to create admin: ' + (err.response?.data?.message || err.message));
    } finally {
      setCreating(false);
    }
  };

  const deleteAdmin = async (admin: AdminUser) => {
    if (!confirm(`Delete ${admin.firstName} ${admin.lastName}?`)) return;
    setSavingId(admin.id);
    try {
      await api.delete(`/admin/users/${admin.id}`);
      setAdmins((prev) => prev.filter((a) => a.id !== admin.id));
    } catch (err: any) {
      alert('Failed to delete admin: ' + (err.response?.data?.message || err.message));
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
  };

  const cancelEdit = () => {
    setEditingUserId(null);
    setEditFirstName('');
    setEditLastName('');
    setEditEmail('');
    setEditBirthDate('');
  };

  const saveEdit = async () => {
    if (!editingUserId) return;
    if (!editFirstName || !editLastName || !editEmail) {
      alert('First name, last name, and email are required');
      return;
    }

    setSavingId(editingUserId);
    try {
      await api.patch(`/users/${editingUserId}`, {
        firstName: editFirstName,
        lastName: editLastName,
        birthDate: editBirthDate || undefined,
        email: editEmail,
      });
      cancelEdit();
      fetchAdmins();
    } catch (err: any) {
      alert('Failed to edit admin: ' + (err.response?.data?.message || err.message));
    } finally {
      setSavingId(null);
    }
  };

  if (loading) return <div className="text-center p-4">Loading admins...</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl mb-4">Admin Management</h1>

      <div className="bg-white p-4 rounded shadow-md mb-4">
        <h2 className="text-xl mb-3">Create Admin</h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
          <input
            value={newFirstName}
            onChange={(e) => setNewFirstName(e.target.value)}
            placeholder="First name"
            className="p-2 border rounded"
          />
          <input
            value={newLastName}
            onChange={(e) => setNewLastName(e.target.value)}
            placeholder="Last name"
            className="p-2 border rounded"
          />
          <input
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            placeholder="Email"
            className="p-2 border rounded"
          />
          <input
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Password"
            type="password"
            className="p-2 border rounded"
          />
          <input
            type="date"
            value={newBirthDate}
            onChange={(e) => setNewBirthDate(e.target.value)}
            placeholder="Birth date (optional)"
            className="p-2 border rounded"
          />
        </div>
        <button
          onClick={createAdmin}
          disabled={creating}
          className="mt-3 bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {creating ? 'Creating...' : 'Create Admin'}
        </button>
      </div>

      {editingUserId && (
        <div className="bg-white p-4 rounded shadow-md mb-4">
          <h2 className="text-xl mb-3">Edit Admin</h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
            <input
              value={editFirstName}
              onChange={(e) => setEditFirstName(e.target.value)}
              placeholder="First name"
              className="p-2 border rounded"
            />
            <input
              value={editLastName}
              onChange={(e) => setEditLastName(e.target.value)}
              placeholder="Last name"
              className="p-2 border rounded"
            />
            <input
              value={editEmail}
              onChange={(e) => setEditEmail(e.target.value)}
              placeholder="Email"
              className="p-2 border rounded"
            />
            <input
              type="date"
              value={editBirthDate}
              onChange={(e) => setEditBirthDate(e.target.value)}
              placeholder="Birth date"
              className="p-2 border rounded"
            />
          </div>
          <div className="mt-3 space-x-2">
            <button
              onClick={saveEdit}
              disabled={savingId === editingUserId}
              className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
            >
              Save
            </button>
            <button onClick={cancelEdit} className="bg-gray-300 text-black px-4 py-2 rounded">
              Cancel
            </button>
          </div>
        </div>
      )}

      <table className="min-w-full bg-white shadow-md rounded">
        <thead>
          <tr className="bg-gray-200">
            <th className="py-2 px-4 text-left">First Name</th>
            <th className="py-2 px-4 text-left">Last Name</th>
            <th className="py-2 px-4 text-left">Email</th>
            <th className="py-2 px-4 text-left">Birth Date</th>
            <th className="py-2 px-4 text-left">Role</th>
            <th className="py-2 px-4 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {admins.map((admin) => (
            <tr key={admin.id} className="border-t">
              <td className="py-2 px-4">{admin.firstName}</td>
              <td className="py-2 px-4">{admin.lastName}</td>
              <td className="py-2 px-4">{admin.email}</td>
              <td className="py-2 px-4">{admin.birthDate ? admin.birthDate.slice(0, 10) : '-'}</td>
              <td className="py-2 px-4">{admin.role}</td>
              <td className="py-2 px-4 space-x-2">
                <button
                  onClick={() => startEdit(admin)}
                  className="bg-yellow-500 text-white px-2 py-1 rounded text-sm"
                >
                  Edit
                </button>
                {admin.role === 'ADMIN' && admin.id !== currentUserId && (
                  <button
                    onClick={() => deleteAdmin(admin)}
                    disabled={savingId === admin.id}
                    className="bg-red-500 text-white px-2 py-1 rounded text-sm disabled:opacity-50"
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
  );
};

export default AdminAdminsPage;
