import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-blue-600 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link to="/cars" className="inline-block hover:underline hover:opacity-80 transition-opacity">Cars</Link>
          {user?.role === 'ADMIN' && (
            <Link to="/admin/cars" className="inline-block hover:underline hover:opacity-80 transition-opacity">Admin Cars</Link>
          )}
          {(user?.role === 'ADMIN' || user?.role === 'SUPERADMIN') && (
            <>
              <Link to="/admin/users" className="inline-block hover:underline hover:opacity-80 transition-opacity">Admin Users</Link>
            </>
          )}
          {user?.role === 'ADMIN' && (
            <Link to="/admin/rentals/active" className="inline-block hover:underline hover:opacity-80 transition-opacity">Active Rentals</Link>
          )}
          {user?.role === 'SUPERADMIN' && (
            <Link to="/admin/admins" className="inline-block hover:underline hover:opacity-80 transition-opacity">Admin Admins</Link>
          )}
        </div>

        <div className="flex gap-4 items-center">
          {user ? (
            <>
              <Link to="/profile" className="inline-block hover:underline hover:opacity-80 transition-opacity">Profile</Link>
              <button onClick={handleLogout} className="inline-block hover:underline hover:opacity-80 transition-opacity">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="inline-block hover:underline hover:opacity-80 transition-opacity">Login</Link>
              <Link to="/register" className="inline-block hover:underline hover:opacity-80 transition-opacity">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;