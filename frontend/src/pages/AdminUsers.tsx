import { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  birthDate?: string | null;
  role: string;
}

interface EditUserModalProps {
  isOpen: boolean;
  firstName: string;
  lastName: string;
  birthDate: string;
  saving: boolean;
  onFirstNameChange: (value: string) => void;
  onLastNameChange: (value: string) => void;
  onBirthDateChange: (value: string) => void;
  onSave: () => void;
  onCancel: () => void;
}

const EditUserModal = ({
  isOpen,
  firstName,
  lastName,
  birthDate,
  saving,
  onFirstNameChange,
  onLastNameChange,
  onBirthDateChange,
  onSave,
  onCancel,
}: EditUserModalProps) => {
  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onCancel} />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md bg-white rounded-lg shadow-xl p-5">
        <h2 className="text-xl font-semibold mb-4">Edit User</h2>
        <div className="space-y-3">
          <input
            value={firstName}
            onChange={(e) => onFirstNameChange(e.target.value)}
            placeholder="First name"
            className="w-full p-2 border rounded"
          />
          <input
            value={lastName}
            onChange={(e) => onLastNameChange(e.target.value)}
            placeholder="Last name"
            className="w-full p-2 border rounded"
          />
          <input
            type="date"
            value={birthDate}
            onChange={(e) => onBirthDateChange(e.target.value)}
            placeholder="Birth date"
            className="w-full p-2 border rounded"
          />
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onCancel} className="bg-gray-300 text-black px-4 py-2 rounded">
            Cancel
          </button>
          <button
            onClick={onSave}
            disabled={saving}
            className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </>
  );
};

const AdminUsers = () => {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'SUPERADMIN';

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editFirstName, setEditFirstName] = useState('');
  const [editLastName, setEditLastName] = useState('');
  const [editBirthDate, setEditBirthDate] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/admin/users');
      setUsers(res.data);
    } catch (err: any) {
      alert('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const openEditModal = (selectedUser: User) => {
    setEditingUserId(selectedUser.id);
    setEditFirstName(selectedUser.firstName);
    setEditLastName(selectedUser.lastName);
    setEditBirthDate(selectedUser.birthDate ? selectedUser.birthDate.slice(0, 10) : '');
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditingUserId(null);
    setEditFirstName('');
    setEditLastName('');
    setEditBirthDate('');
  };

  const saveEditUser = async () => {
    if (!editingUserId) return;

    const data = {
      firstName: editFirstName,
      lastName: editLastName,
      birthDate: editBirthDate || undefined,
    };

    console.log(editingUserId, data);

    try {
      setSavingEdit(true);
      const token = localStorage.getItem('token');
      await api.patch(`/admin/users/${editingUserId}`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setUsers((prev) => prev.map((u) => (u.id === editingUserId ? { ...u, ...data } : u)));
      closeEditModal();
    } catch (err: any) {
      alert('Failed to edit user');
    } finally {
      setSavingEdit(false);
    }
  };

  const deleteUser = async (user: User) => {
    try {
      await api.delete(`/admin/users/${user.id}`);
      setUsers((prev) => prev.filter((u) => u.id !== user.id));
    } catch (err: any) {
      alert('Failed to delete user');
    }
  };

  if (loading) return <div className="text-center p-4">Loading users...</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl mb-4">Admin Users</h1>
      <EditUserModal
        isOpen={isEditModalOpen}
        firstName={editFirstName}
        lastName={editLastName}
        birthDate={editBirthDate}
        saving={savingEdit}
        onFirstNameChange={setEditFirstName}
        onLastNameChange={setEditLastName}
        onBirthDateChange={setEditBirthDate}
        onSave={saveEditUser}
        onCancel={closeEditModal}
      />
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
          {users.map((user) => (
            <tr key={user.id} className="border-t">
              <td className="py-2 px-4">{user.firstName}</td>
              <td className="py-2 px-4">{user.lastName}</td>
              <td className="py-2 px-4">{user.email}</td>
              <td className="py-2 px-4">{user.birthDate ? user.birthDate.slice(0, 10) : '-'}</td>
              <td className="py-2 px-4">{user.role}</td>
              <td className="py-2 px-4 space-x-2">
                <button
                  onClick={() => openEditModal(user)}
                  className="bg-yellow-500 text-white px-2 py-1 rounded text-sm"
                >
                  Edit
                </button>
                {isSuperAdmin && (
                  <button
                    onClick={() => deleteUser(user)}
                    className="bg-red-500 text-white px-2 py-1 rounded text-sm"
                  >
                    Delete
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

export default AdminUsers;
