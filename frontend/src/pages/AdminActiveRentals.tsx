import { useEffect, useState } from 'react';
import api from '../services/api';

interface ActiveRental {
  id: string;
  startDate?: string;
  startTime?: string;
  car: {
    id: string;
    brand: string;
    model: string;
  };
  user: {
    id: string;
    email: string;
  };
}

const AdminActiveRentals = () => {
  const [rentals, setRentals] = useState<ActiveRental[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchActiveRentals = async () => {
    try {
      const res = await api.get('/admin/rentals/active');
      setRentals(res.data);
    } catch (err: any) {
      alert('Failed to load active rentals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveRentals();
  }, []);

  const formatStartTime = (rental: ActiveRental) => {
    const source = rental.startTime ?? rental.startDate;
    if (!source) return 'N/A';

    const date = new Date(source);
    if (Number.isNaN(date.getTime())) return 'N/A';

    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  if (loading) return <div className="text-center p-4">Loading active rentals...</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl mb-4">Active Rentals</h1>

      {rentals.length === 0 ? (
        <div className="bg-white p-4 rounded shadow-md">No active rentals</div>
      ) : (
        <div className="space-y-3">
          {rentals.map((rental) => (
            <div key={rental.id} className="bg-white p-4 rounded shadow-md">
              <p className="text-lg font-semibold">{rental.car.brand} {rental.car.model}</p>
              <p className="text-gray-700">Rented by: {rental.user.email}</p>
              <p className="text-gray-700">Since: {formatStartTime(rental)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminActiveRentals;
