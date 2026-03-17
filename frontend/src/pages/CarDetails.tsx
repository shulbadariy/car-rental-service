import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';

interface Car {
  id: string;
  brand: string;
  model: string;
  year: number;
  startPrice: number;
  pricePerMinute: number;
}

const CarDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [car, setCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [renting, setRenting] = useState(false);

  useEffect(() => {
    const fetchCar = async () => {
      if (!id) {
        setError('Car id is missing');
        setLoading(false);
        return;
      }

      try {
        const res = await api.get(`/cars/${id}`);
        if (!res.data) {
          setError('Car not found');
        } else {
          setCar(res.data);
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load car details');
      } finally {
        setLoading(false);
      }
    };

    fetchCar();
  }, [id]);

  const estimatedPriceFor30Min = useMemo(() => {
    if (!car) return 0;
    return car.startPrice + car.pricePerMinute * 30;
  }, [car]);

  const handleRent = async () => {
    if (!car) return;

    setRenting(true);
    try {
      await api.post('/rentals', { carId: car.id });
      alert('Car rented successfully');
      navigate('/profile');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Rent failed');
    } finally {
      setRenting(false);
    }
  };

  if (loading) {
    return <div className="text-center p-8">Loading car details...</div>;
  }

  if (error) {
    return <div className="text-center p-8 text-red-600">{error}</div>;
  }

  if (!car) {
    return <div className="text-center p-8">Car not found</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-md p-6 space-y-4">
        <h1 className="text-3xl font-bold text-center">Car Details</h1>
        <div className="space-y-2 text-lg">
          <p>
            <span className="font-semibold">Brand:</span> {car.brand}
          </p>
          <p>
            <span className="font-semibold">Model:</span> {car.model}
          </p>
          <p>
            <span className="font-semibold">Year:</span> {car.year}
          </p>
          <p>
            <span className="font-semibold">Start Price:</span> ${car.startPrice.toFixed(2)}
          </p>
          <p>
            <span className="font-semibold">Price per minute:</span> ${car.pricePerMinute.toFixed(2)}
          </p>
        </div>

        <div className="bg-gray-50 rounded p-3 text-center text-gray-800">
          Estimated price for 30 min: <span className="font-semibold">${estimatedPriceFor30Min.toFixed(2)}</span>
        </div>

        <button
          onClick={handleRent}
          disabled={renting}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded disabled:opacity-60"
        >
          {renting ? 'Renting...' : 'Rent Car'}
        </button>
      </div>
    </div>
  );
};

export default CarDetails;
