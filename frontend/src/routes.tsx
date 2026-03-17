import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import CarsList from './pages/CarsList';
import CarsMap from './pages/CarsMap';
import CarDetails from './pages/CarDetails';
import Profile from './pages/Profile';
import AdminCars from './pages/AdminCars';
import AdminUsers from './pages/AdminUsers';
import AdminAdminsPage from './pages/AdminAdminsPage';
import AdminActiveRentals from './pages/AdminActiveRentals';
import Navbar from './components/Navbar';
import { useAuth } from './hooks/useAuth';

const RoleRoute = ({ allowedRoles }: { allowedRoles: string[] }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/cars" replace />;
  }

  return <Outlet />;
};

const Layout = () => (
  <>
    <Navbar />
    <Outlet />
  </>
);

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Navigate to="/login" replace /> },
      { path: 'login', element: <Login /> },
      { path: 'register', element: <Register /> },
      { path: 'cars', element: <CarsList /> },
      { path: 'map', element: <CarsMap /> },
      { path: 'cars/:id', element: <CarDetails /> },
      { path: 'profile', element: <Profile /> },
      { path: 'admin/cars', element: <AdminCars /> },
      {
        element: <RoleRoute allowedRoles={['ADMIN', 'SUPERADMIN']} />,
        children: [
          { path: 'admin/users', element: <AdminUsers /> },
          { path: 'admin/rentals/active', element: <AdminActiveRentals /> },
        ],
      },
      {
        element: <RoleRoute allowedRoles={['SUPERADMIN']} />,
        children: [{ path: 'admin/admins', element: <AdminAdminsPage /> }],
      },
    ]
  }
]);