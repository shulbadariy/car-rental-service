import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-blue-600 text-white p-4">
      <div className="container mx-auto flex justify-between">
        <div className="space-x-4">
          <Link to="/cars" className="hover:underline">Cars</Link>
          <Link to="/my-rentals" className="hover:underline">My Rentals</Link>
          {(user?.role === 'ADMIN' || user?.role === 'SUPERADMIN') && (
            <>
              <Link to="/admin/cars" className="hover:underline">Admin Cars</Link>
              <Link to="/admin/users" className="hover:underline">Admin Users</Link>
            </>
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