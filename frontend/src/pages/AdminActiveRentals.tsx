import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';
import ConfirmModal from '../components/ConfirmModal';

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
  const { user } = useAuth();
  const [rentals, setRentals] = useState<ActiveRental[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingRentalId, setPendingRentalId] = useState<string | null>(null);
  const [stoppingRental, setStoppingRental] = useState(false);

  const fetchActiveRentals = async () => {
    try {
      const res = await api.get('/admin/rentals/active');
      setRentals(res.data);
    } catch {
      toast.error("We couldn't load active rentals. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveRentals();
  }, []);

  const confirmStopRental = async () => {
    if (!pendingRentalId) return;

    setStoppingRental(true);
    try {
      await api.post('/rentals/stop', { rentalId: pendingRentalId });
      setPendingRentalId(null);
      fetchActiveRentals();
    } catch {
      toast.error("We couldn't stop this rental. Please try again.");
    } finally {
      setStoppingRental(false);
    }
  };

  const formatStartTime = (rental: ActiveRental) => {
    const source = rental.startTime ?? rental.startDate;
    if (!source) return 'N/A';

    const date = new Date(source);
    if (Number.isNaN(date.getTime())) return 'N/A';

    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  if (loading) return <div className="text-center p-4">Loading active rentals...</div>;

  return (
    <div className="max-w-3xl mx-auto px-4 space-y-4">
      <ConfirmModal
        isOpen={Boolean(pendingRentalId)}
        title="Stop rental"
        message="Are you sure you want to stop this rental?"
        confirmText="Stop rental"
        confirmVariant="danger"
        loading={stoppingRental}
        onConfirm={confirmStopRental}
        onCancel={() => setPendingRentalId(null)}
      />

      <h1 className="text-3xl mb-4">Active Rentals</h1>

      {rentals.length === 0 ? (
        <div className="bg-white p-4 rounded shadow-md">No active rentals</div>
      ) : (
        <div className="space-y-3">
          {rentals.map((rental) => (
            <div
              key={rental.id}
              className="bg-white rounded-xl shadow-sm px-5 py-4 flex justify-between items-center hover:shadow-md transition"
            >
              <div className="flex flex-col">
                <p className="text-lg font-semibold text-gray-900">
                  {rental.car.brand} {rental.car.model}
                </p>
                <p className="text-sm text-gray-600">
                  {rental.user.email}
                  <span className="mx-2 text-gray-400">•</span>
                  {formatStartTime(rental)}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs font-medium text-green-700 bg-green-100 px-2 py-1 rounded-full">
                  ACTIVE
                </span>
                {(user?.role === 'ADMIN' || user?.role === 'SUPERADMIN') && (
                  <button
                    onClick={() => setPendingRentalId(rental.id)}
                    className="bg-red-500 hover:bg-red-600 text-white text-sm px-3 py-1.5 rounded-md"
                  >
                    Stop
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminActiveRentals;
