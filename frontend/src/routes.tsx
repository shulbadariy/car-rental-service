/* eslint-disable react-refresh/only-export-components */
import { useEffect } from 'react';
import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import toast from 'react-hot-toast';
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
  const { user, token } = useAuth();

  useEffect(() => {
    if (token && user && !allowedRoles.includes(user.role)) {
      toast.error('You do not have access to this page.');
    }
  }, [allowedRoles, token, user]);

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/profile" replace />;
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
      {
        element: <RoleRoute allowedRoles={['ADMIN']} />,
        children: [{ path: 'admin/cars', element: <AdminCars /> }],
      },
      {
        element: <RoleRoute allowedRoles={['ADMIN', 'SUPERADMIN']} />,
        children: [
          { path: 'admin/users', element: <AdminUsers /> },
        ],
      },
      {
        element: <RoleRoute allowedRoles={['ADMIN']} />,
        children: [{ path: 'admin/rentals/active', element: <AdminActiveRentals /> }],
      },
      {
        element: <RoleRoute allowedRoles={['SUPERADMIN']} />,
        children: [{ path: 'admin/admins', element: <AdminAdminsPage /> }],
      },
    ]
  }
]);