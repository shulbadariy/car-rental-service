import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MapContainer, Marker, TileLayer } from 'react-leaflet';
import toast from 'react-hot-toast';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';
import ConfirmModal from '../components/ConfirmModal';

interface Car {
  id: string;
  brand: string;
  model: string;
  year: number;
  startPrice: number;
  pricePerMinute: number;
  status?: string;
  lat?: number;
  lng?: number;
  latitude?: number;
  longitude?: number;
  activeRental?: {
    id: string;
    user?: {
      firstName?: string;
      lastName?: string;
    };
  } | null;
}

interface CurrentRental {
  id: string;
  startTime?: string;
  totalPrice?: number;
  currentPrice?: number;
  cost?: number;
  car: {
    id: string;
  };
}

interface MyRentalsResponse {
  currentRental: CurrentRental | null;
}

function extractErrorMessage(err: unknown): string {
  const backendMessageRaw = (err as { response?: { data?: { message?: unknown } } })?.response?.data?.message;
  const backendMessage = Array.isArray(backendMessageRaw)
    ? backendMessageRaw.join(' ')
    : typeof backendMessageRaw === 'string'
      ? backendMessageRaw
      : '';
  return backendMessage;
}

const CarDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();

  const [car, setCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [error, setError] = useState('');
  const [renting, setRenting] = useState(false);
  const [currentRental, setCurrentRental] = useState<CurrentRental | null>(null);
  const [minutes, setMinutes] = useState(0);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  useEffect(() => {
    const fetchCar = async () => {
      if (!id) {
        setLoadError('We could not open this car right now.');
        setLoading(false);
        return;
      }

      try {
        const res = await api.get(`/cars/${id}`);
        if (!res.data) {
          setLoadError('This car is no longer available.');
        } else {
          setCar(res.data);
        }
      } catch {
        setLoadError('We could not load car details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchCar();
  }, [id]);

  const fetchMyRental = useCallback(async () => {
    if (!token || !user) {
      setCurrentRental(null);
      return;
    }

    try {
      const res = await api.get('/rentals/my');
      const rentals: MyRentalsResponse = res.data;
      setCurrentRental(rentals.currentRental);
    } catch {
      setCurrentRental(null);
    }
  }, [token, user]);

  useEffect(() => {
    fetchMyRental();
  }, [fetchMyRental]);

  const estimatedPriceFor30Min = useMemo(() => {
    if (!car) return 0;
    return car.startPrice + car.pricePerMinute * 30;
  }, [car]);

  const lat = car?.latitude ?? car?.lat;
  const lng = car?.longitude ?? car?.lng;
  const hasCoordinates = typeof lat === 'number' && typeof lng === 'number';

  const isAdmin = user?.role === 'ADMIN';
  const isMyCar = Boolean(car && currentRental?.car?.id === car.id);
  const isRented = car?.status === 'RENTED';

  useEffect(() => {
    if (!currentRental?.startTime) {
      setMinutes(0);
      return;
    }

    const updateMinutes = () => {
      const now = Date.now();
      const start = new Date(currentRental.startTime as string).getTime();
      const diffMinutes = Math.max(0, Math.floor((now - start) / 60000));
      setMinutes(diffMinutes);
    };

    updateMinutes();
    const timer = window.setInterval(updateMinutes, 1000);
    return () => window.clearInterval(timer);
  }, [currentRental]);

  const currentPrice = useMemo(() => {
    if (!currentRental || !car) return 0;

    const startPrice = Number(car.startPrice ?? 0);
    const ppm = Number(car.pricePerMinute ?? 0);

    return startPrice + ppm * minutes;
  }, [currentRental, car, minutes]);

  const handleRent = async () => {
    if (!car) return;

    if (!token || !user) {
      setShowLoginPrompt(true);
      return;
    }

    setError('');
    setRenting(true);
    try {
      const res = await api.post('/rentals', { carId: car.id });
      toast.success('Car rented successfully');
      await fetchMyRental();

      if (!res.data?.id) {
        setCurrentRental({
          id: '',
          car: { id: car.id },
          startTime: new Date().toISOString(),
        });
      }
    } catch (err: unknown) {
      const backendMessage = extractErrorMessage(err);

      if (backendMessage.toLowerCase().includes('active rental')) {
        toast.error('You cannot rent more than one car at the same time.');
      } else {
        toast.error("We couldn't start the rental. Please try again.");
      }
    } finally {
      setRenting(false);
    }
  };

  const handleStopRent = async () => {
    if (!car || !currentRental) {
      setError('No active rental was found for this car.');
      return;
    }

    if (!token || !user) {
      setError('Please log in to continue.');
      navigate('/login');
      return;
    }

    setError('');
    setRenting(true);
    try {
      await api.post('/rentals/stop', { rentalId: currentRental.id });
      toast.success('Rental stopped');
      navigate('/profile');
    } catch {
      toast.error("We couldn't stop the rental. Please try again.");
    } finally {
      setRenting(false);
    }
  };

  const handleForceStop = async () => {
    if (!car?.activeRental?.id) {
      toast.error('No active rental found for this car.');
      return;
    }

    setRenting(true);
    try {
      await api.patch(`/rentals/${car.activeRental.id}/force-stop`);
      toast.success('Rental stopped by admin');
      navigate('/cars');
    } catch {
      toast.error('Failed to stop rental');
    } finally {
      setRenting(false);
    }
  };

  const handleNavigate = () => {
    if (typeof lat !== 'number' || typeof lng !== 'number') return;

    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    window.open(url, '_blank');
  };

  if (loading) {
    return <div className="text-center p-8">Loading car details...</div>;
  }

  if (loadError) {
    return <div className="text-center p-8 text-red-600">{loadError}</div>;
  }

  if (!car) {
    return <div className="text-center p-8">This car is no longer available.</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <ConfirmModal
        isOpen={showLoginPrompt}
        title="Login required"
        message="You need to be logged in to rent a car. Go to login page?"
        confirmText="Go to login"
        onConfirm={() => {
          setShowLoginPrompt(false);
          navigate('/login');
        }}
        onCancel={() => setShowLoginPrompt(false)}
      />

      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-md p-6 space-y-5">
        <h1 className="text-3xl font-bold text-gray-900 text-center">
          {car.brand} {car.model}
        </h1>
        <div className="space-y-3">
          <p className="text-gray-600">
            <span className="font-medium text-gray-800">Year:</span> {car.year}
          </p>
          <p className="text-gray-600">
            <span className="font-medium text-gray-800">Start Price:</span> ${car.startPrice.toFixed(2)}
          </p>
          <p className="text-gray-600">
            <span className="font-medium text-gray-800">Price per minute:</span> ${car.pricePerMinute.toFixed(2)}
          </p>
          <p className="text-lg font-semibold text-green-600">
            ${car.startPrice.toFixed(2)} + ${car.pricePerMinute.toFixed(2)}/min
          </p>
        </div>

        {hasCoordinates && (
          <div>
            <div className="relative z-0 rounded-lg overflow-hidden shadow-sm mt-4">
              <MapContainer
                center={[lat, lng]}
                zoom={15}
                style={{ height: '200px', width: '100%' }}
                scrollWheelZoom={false}
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <Marker position={[lat, lng]} />
              </MapContainer>
            </div>
            <button
              onClick={() => navigate(`/map?lat=${lat}&lng=${lng}`)}
              className="mt-2 text-blue-600 underline"
            >
              Open in full map
            </button>
          </div>
        )}

        {isMyCar ? (
          <div className="bg-gray-50 rounded p-3 text-center text-gray-800">
            <p className="text-xl font-bold text-gray-900 text-center">
              Current price: ${currentPrice.toFixed(2)}
            </p>
          </div>
        ) : (
          <div className="bg-gray-50 rounded p-3 text-center text-gray-800">
            <p className="text-lg font-semibold text-green-600">
              Estimated price for 30 min: ${estimatedPriceFor30Min.toFixed(2)}
            </p>
          </div>
        )}

        {isAdmin && isRented && !isMyCar && (
          <div className="bg-gray-100 p-3 rounded text-sm text-gray-700">
            Rented by: {car.activeRental?.user?.firstName ?? 'Unknown'} {car.activeRental?.user?.lastName ?? 'user'}
          </div>
        )}

        {error && <p className="text-red-500 text-center">{error}</p>}

        {isMyCar && (
          <p className="text-center text-gray-600">
            ⏱ {minutes} minute{minutes === 1 ? '' : 's'}
          </p>
        )}

        {isMyCar ? (
          <>
            <button
              onClick={handleStopRent}
              disabled={renting}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 rounded disabled:opacity-60"
            >
              {renting ? 'Stopping...' : 'Stop Rent'}
            </button>
            <button
              onClick={handleNavigate}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded mt-2"
            >
              Navigate
            </button>
          </>
        ) : isAdmin && isRented && car.activeRental?.id ? (
          <button
            onClick={handleForceStop}
            disabled={renting}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 rounded mt-3 disabled:opacity-60"
          >
            {renting ? 'Stopping...' : 'Force Stop Rental'}
          </button>
        ) : !isRented ? (
          <button
            onClick={handleRent}
            disabled={renting}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded disabled:opacity-60"
          >
            {renting ? 'Renting...' : 'Rent Car'}
          </button>
        ) : (
          <p className="text-center text-gray-600">This car is currently rented.</p>
        )}
      </div>
    </div>
  );
};

export default CarDetails;
