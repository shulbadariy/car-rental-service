import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';
import ConfirmModal from '../components/ConfirmModal';

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
  const navigate = useNavigate();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [currentRental, setCurrentRental] = useState<CurrentRental | null>(null);
  const [history, setHistory] = useState<RentalHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [minutes, setMinutes] = useState(0);
  const [isStopModalOpen, setIsStopModalOpen] = useState(false);

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
    } catch {
      toast.error("We couldn't load your profile. Please try again.");
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

  const confirmStopRental = async () => {
    if (!currentRental) return;

    try {
      await api.post('/rentals/stop', { rentalId: currentRental.id });
      toast.success('Rental stopped successfully');
      setIsStopModalOpen(false);
      fetchProfileData();
    } catch {
      toast.error("We couldn't stop the rental. Please try again.");
    }
  };

  const handleStopRental = () => {
    if (!currentRental) return;
    setIsStopModalOpen(true);
  };

  if (loading) {
    return <div className="text-center p-6">Loading profile...</div>;
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      <ConfirmModal
        isOpen={isStopModalOpen}
        title="Stop rental"
        message="Are you sure you want to stop this rental?"
        confirmText="Stop rental"
        confirmVariant="danger"
        onConfirm={confirmStopRental}
        onCancel={() => setIsStopModalOpen(false)}
      />

      <h1 className="text-3xl font-bold">Profile</h1>

      {currentRental && (
        <div className="rounded-xl border border-blue-200 bg-blue-100 p-6 shadow-md space-y-2">
          <div className="border-b border-blue-200 pb-2 mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Active Rental</h2>
          </div>
          <p className="text-lg font-semibold text-gray-900">
            {currentRental.car.brand} {currentRental.car.model}
          </p>
          <p className="text-blue-900/80">Rented for: {minutes} minute{minutes === 1 ? '' : 's'}</p>
          <p className="text-2xl font-bold text-green-600">Current price: ${currentPrice.toFixed(2)}</p>
          <div className="flex gap-3 justify-center mt-4">
            <button
              onClick={() => navigate(`/cars/${currentRental.car.id}`)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
            >
              View Car Details
            </button>
            <button
              onClick={handleStopRental}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
            >
              Stop Rental
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-5">
        <div className="border-b pb-2 mb-4">
          <h2 className="text-xl font-semibold text-gray-900">User Info</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-left">
          <p><span className="text-gray-500 text-sm">First Name:</span> <span className="text-gray-900 font-medium">{user?.firstName || '-'}</span></p>
          <p><span className="text-gray-500 text-sm">Last Name:</span> <span className="text-gray-900 font-medium">{user?.lastName || '-'}</span></p>
          <p><span className="text-gray-500 text-sm">Email:</span> <span className="text-gray-900 font-medium">{user?.email || '-'}</span></p>
          <p>
            <span className="text-gray-500 text-sm">Birth Date:</span>{' '}
            <span className="text-gray-900 font-medium">{user?.birthDate ? new Date(user.birthDate).toLocaleDateString() : '-'}</span>
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-5">
        <div className="border-b pb-2 mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Rental History</h2>
        </div>
        {history.length === 0 ? (
          <p className="text-gray-500">No rental history found.</p>
        ) : (
          <div className="space-y-4">
            {history.map((rental) => (
              <div key={rental.id} className="bg-gray-50 rounded-lg shadow-sm p-4 space-y-1">
                <p className="font-semibold text-gray-900">{rental.car.brand} {rental.car.model}</p>
                <p className="text-sm text-gray-600">Start: {new Date(rental.startDate).toLocaleString()}</p>
                <p className="text-sm text-gray-600">End: {rental.endDate ? new Date(rental.endDate).toLocaleString() : '-'}</p>
                <p className="font-semibold text-green-600">Total price: ${Number(rental.totalPrice ?? 0).toFixed(2)}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
