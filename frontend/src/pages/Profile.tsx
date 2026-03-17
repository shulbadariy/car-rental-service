import { useEffect, useMemo, useState } from 'react';
import api from '../services/api';

interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  birthDate: string | null;
}

interface RentalCar {
  id: string;
  brand: string;
  model: string;
  year: number;
  startPrice?: number;
  pricePerMinute?: number;
}

interface CurrentRental {
  id: string;
  startTime: string;
  car: RentalCar;
}

interface RentalHistoryItem {
  id: string;
  startDate: string;
  endDate: string | null;
  totalPrice: number;
  car: RentalCar;
}

interface MyRentalsResponse {
  currentRental: CurrentRental | null;
  history: RentalHistoryItem[];
}

const Profile = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [currentRental, setCurrentRental] = useState<CurrentRental | null>(null);
  const [history, setHistory] = useState<RentalHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [minutes, setMinutes] = useState(0);

  const fetchProfileData = async () => {
    setLoading(true);
    try {
      const [userRes, rentalsRes] = await Promise.all([
        api.get('/users/me'),
        api.get('/rentals/my'),
      ]);

      setUser(userRes.data);
      const rentals: MyRentalsResponse = rentalsRes.data;
      setCurrentRental(rentals.currentRental);
      setHistory(rentals.history);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, []);

  useEffect(() => {
    if (!currentRental?.startTime) {
      setMinutes(0);
      return;
    }

    const updateMinutes = () => {
      const now = Date.now();
      const start = new Date(currentRental.startTime).getTime();
      const diffMinutes = Math.max(0, Math.floor((now - start) / 60000));
      setMinutes(diffMinutes);
    };

    updateMinutes();
    const timer = window.setInterval(updateMinutes, 1000);
    return () => window.clearInterval(timer);
  }, [currentRental]);

  const currentPrice = useMemo(() => {
    if (!currentRental) return 0;
    const startPrice = Number(currentRental.car.startPrice ?? 0);
    const ppm = Number(currentRental.car.pricePerMinute ?? 0);
    return startPrice + ppm * minutes;
  }, [currentRental, minutes]);

  const handleStopRental = async () => {
    if (!currentRental) return;
    if (!confirm('Are you sure you want to stop this rental?')) return;

    try {
      await api.post('/rentals/stop', { rentalId: currentRental.id });
      alert('Rental stopped successfully');
      fetchProfileData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to stop rental');
    }
  };

  if (loading) {
    return <div className="text-center p-6">Loading profile...</div>;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Profile</h1>

      {currentRental && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-5">
          <h2 className="text-xl font-semibold text-blue-900 mb-3">Active Rental</h2>
          <p className="text-lg font-semibold">
            {currentRental.car.brand} {currentRental.car.model}
          </p>
          <p className="text-blue-800">Rented for: {minutes} minute{minutes === 1 ? '' : 's'}</p>
          <p className="text-blue-800 font-semibold">Current price: ${currentPrice.toFixed(2)}</p>
          <button
            onClick={handleStopRental}
            className="mt-4 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
          >
            Stop Rental
          </button>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-5">
        <h2 className="text-xl font-semibold mb-4">User Info</h2>
        <div className="space-y-2 text-gray-700">
          <p><span className="font-semibold">First Name:</span> {user?.firstName || '-'}</p>
          <p><span className="font-semibold">Last Name:</span> {user?.lastName || '-'}</p>
          <p><span className="font-semibold">Email:</span> {user?.email || '-'}</p>
          <p>
            <span className="font-semibold">Birth Date:</span>{' '}
            {user?.birthDate ? new Date(user.birthDate).toLocaleDateString() : '-'}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-5">
        <h2 className="text-xl font-semibold mb-4">Rental History</h2>
        {history.length === 0 ? (
          <p className="text-gray-500">No rental history found.</p>
        ) : (
          <div className="space-y-3">
            {history.map((rental) => (
              <div key={rental.id} className="border rounded p-4">
                <p className="font-semibold">Car: {rental.car.brand} {rental.car.model}</p>
                <p>Start: {new Date(rental.startDate).toLocaleString()}</p>
                <p>End: {rental.endDate ? new Date(rental.endDate).toLocaleString() : '-'}</p>
                <p>Total price: ${Number(rental.totalPrice ?? 0).toFixed(2)}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
