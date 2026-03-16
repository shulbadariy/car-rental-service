import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import CarsList from './pages/CarsList';
import CarDetail from './pages/CarDetail';
import MyRentals from './pages/MyRentals';
import AdminCars from './pages/AdminCars';
import AdminUsers from './pages/AdminUsers';
import Navbar from './components/Navbar';

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
      { path: 'cars/:id', element: <CarDetail /> },
      { path: 'my-rentals', element: <MyRentals /> },
      { path: 'admin/cars', element: <AdminCars /> },
      { path: 'admin/users', element: <AdminUsers /> },
    ]
  }
]);