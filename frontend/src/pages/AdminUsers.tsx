import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';
import ConfirmModal from '../components/ConfirmModal';

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
  const { user: currentUser } = useAuth();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editFirstName, setEditFirstName] = useState('');
  const [editLastName, setEditLastName] = useState('');
  const [editBirthDate, setEditBirthDate] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/admin/users');
      setUsers(res.data);
    } catch {
      toast.error("We couldn't load users. Please try again.");
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

    try {
      setSavingEdit(true);
      await api.patch(`/admin/users/${editingUserId}`, data);

      setUsers((prev) => prev.map((u) => (u.id === editingUserId ? { ...u, ...data } : u)));
      closeEditModal();
    } catch {
      toast.error("We couldn't update this user. Please try again.");
    } finally {
      setSavingEdit(false);
    }
  };

  const canDeleteUser = (targetUser: User) => {
    return (
      (currentUser?.role === 'ADMIN' && targetUser.role === 'USER') ||
      (currentUser?.role === 'SUPERADMIN' && targetUser.id !== currentUser.id)
    );
  };

  const handleDelete = (userId: string) => {
    setSelectedUserId(userId);
    setConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedUserId) return;

    try {
      await api.delete(`/admin/users/${selectedUserId}`);
      toast.success('User deleted');
      setConfirmOpen(false);
      setSelectedUserId(null);
      fetchUsers();
    } catch {
      toast.error("We couldn't delete this user. Please try again.");
    }
  };

  const handleCancelDelete = () => {
    setConfirmOpen(false);
    setSelectedUserId(null);
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
      <ConfirmModal
        isOpen={confirmOpen}
        title="Delete user"
        message="Are you sure you want to delete this user?"
        confirmText="Delete"
        confirmVariant="danger"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <table className="min-w-full">
        <thead>
          <tr>
            <th className="py-2 px-4 text-left text-xs uppercase tracking-wide text-gray-500 bg-gray-50">First Name</th>
            <th className="py-2 px-4 text-left text-xs uppercase tracking-wide text-gray-500 bg-gray-50">Last Name</th>
            <th className="py-2 px-4 text-left text-xs uppercase tracking-wide text-gray-500 bg-gray-50">Email</th>
            <th className="py-2 px-4 text-left text-xs uppercase tracking-wide text-gray-500 bg-gray-50">Birth Date</th>
            <th className="py-2 px-4 text-left text-xs uppercase tracking-wide text-gray-500 bg-gray-50">Role</th>
            <th className="py-2 px-4 text-left text-xs uppercase tracking-wide text-gray-500 bg-gray-50">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((tableUser) => (
            <tr key={tableUser.id} className="border-b hover:bg-gray-50 transition even:bg-gray-50">
              <td className="py-2 px-4 font-medium text-gray-900">{tableUser.firstName}</td>
              <td className="py-2 px-4 font-medium text-gray-900">{tableUser.lastName}</td>
              <td className="py-2 px-4 text-gray-600 text-sm">{tableUser.email}</td>
              <td className="py-2 px-4 text-gray-600 text-sm">{tableUser.birthDate ? tableUser.birthDate.slice(0, 10) : '-'}</td>
              <td className="py-2 px-4">
                <span className="px-2 py-1 text-xs font-semibold rounded bg-gray-100 text-gray-700">
                  {tableUser.role}
                </span>
              </td>
              <td className="py-2 px-4">
                <div className="flex gap-2">
                <button
                  onClick={() => openEditModal(tableUser)}
                  className="bg-yellow-400 hover:bg-yellow-500 text-white text-sm px-3 py-1 rounded"
                >
                  Edit
                </button>
                {canDeleteUser(tableUser) && (
                  <button
                    onClick={() => handleDelete(tableUser.id)}
                    className="bg-red-500 hover:bg-red-600 text-white text-sm px-3 py-1 rounded"
                  >
                    Delete
                  </button>
                )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  );
};

export default AdminUsers;
