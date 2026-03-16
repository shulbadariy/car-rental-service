import { useEffect, useState } from 'react';
import api from '../services/api';

interface Rental {
  id: string;
  startDate: string;
  endDate: string;
  totalPrice: number;
  car: { brand: string; model: string };
}

const MyRentals = () => {
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRentals = async () => {
      try {
        const res = await api.get('/rentals/my');
        setRentals(res.data);
      } catch (err: any) {
        alert('Failed to load rentals');
      } finally {
        setLoading(false);
      }
    };
    fetchRentals();
  }, []);

  if (loading) return <div className="text-center p-4">Loading rentals...</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl mb-4">My Rentals</h1>
      {rentals.length === 0 ? (
        <p>No rentals found.</p>
      ) : (
        <div className="space-y-4">
          {rentals.map((rental) => (
            <div key={rental.id} className="bg-white p-4 rounded shadow-md">
              <p className="text-lg font-semibold">{rental.car.brand} {rental.car.model}</p>
              <p>From: {new Date(rental.startDate).toLocaleDateString()}</p>
              <p>To: {rental.endDate ? new Date(rental.endDate).toLocaleDateString() : 'Ongoing'}</p>
              <p>Total: ${rental.totalPrice}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyRentals;