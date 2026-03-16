import { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';

interface User {
  id: string;
  email: string;
  role: string;
}

const AdminUsers = () => {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'SUPERADMIN';

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users');
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

  const toggleRole = async (user: User) => {
    const newRole = user.role === 'USER' ? 'ADMIN' : 'USER';
    try {
      await api.patch(`/users/${user.id}`, { role: newRole });
      fetchUsers();
    } catch (err: any) {
      alert('Failed to update role');
    }
  };

  const deleteUser = async (user: User) => {
    try {
      await api.patch(`/users/${user.id}/soft-delete`);
      fetchUsers();
    } catch (err: any) {
      alert('Failed to delete user');
    }
  };

  if (loading) return <div className="text-center p-4">Loading users...</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl mb-4">Admin Users</h1>
      <table className="min-w-full bg-white shadow-md rounded">
        <thead>
          <tr className="bg-gray-200">
            <th className="py-2 px-4 text-left">Email</th>
            <th className="py-2 px-4 text-left">Role</th>
            {isSuperAdmin && <th className="py-2 px-4 text-left">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="border-t">
              <td className="py-2 px-4">{user.email}</td>
              <td className="py-2 px-4">{user.role}</td>
              {isSuperAdmin && (
                <td className="py-2 px-4 space-x-2">
                  <button
                    onClick={() => toggleRole(user)}
                    className="bg-blue-500 text-white px-2 py-1 rounded text-sm"
                  >
                    {user.role === 'USER' ? 'Make Admin' : 'Make User'}
                  </button>
                  <button
                    onClick={() => deleteUser(user)}
                    className="bg-red-500 text-white px-2 py-1 rounded text-sm"
                  >
                    Delete
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminUsers;
