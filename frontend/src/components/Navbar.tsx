import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-blue-600 text-white p-4">
      <div className="container mx-auto flex justify-between">
        <div className="space-x-4">
          <Link to="/cars" className="hover:underline">Cars</Link>
          <Link to="/map" className="hover:underline">Map</Link>
          <Link to="/profile" className="hover:underline">Profile</Link>
          {user?.role === 'ADMIN' && (
            <Link to="/admin/cars" className="hover:underline">Admin Cars</Link>
          )}
          {(user?.role === 'ADMIN' || user?.role === 'SUPERADMIN') && (
            <>
              <Link to="/admin/users" className="hover:underline">Admin Users</Link>
              <Link to="/admin/rentals/active" className="hover:underline">Active Rentals</Link>
            </>
          )}
          {user?.role === 'SUPERADMIN' && (
            <Link to="/admin/admins" className="hover:underline">Admin Admins</Link>
          )}
        </div>
        <div>
          {user ? (
            <button onClick={logout} className="hover:underline">Logout</button>
          ) : (
            <div className="space-x-4">
              <Link to="/login" className="hover:underline">Login</Link>
              <Link to="/register" className="hover:underline">Register</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;