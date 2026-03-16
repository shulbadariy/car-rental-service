import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

interface Car {
  id: string;
  brand: string;
  model: string;
  year: number;
  dailyRate: number;
  status: string;
}

const CarDetail = () => {
  const { id } = useParams();
  const [car, setCar] = useState<Car | null>(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [renting, setRenting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCar = async () => {
      try {
        const res = await api.get(`/cars/${id}`);
        setCar(res.data);
      } catch (err: any) {
        alert('Failed to load car details');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchCar();
  }, [id]);

  const handleRent = async () => {
    if (!startDate || !endDate) {
      alert('Please select dates');
      return;
    }
    setRenting(true);
    try {
      await api.post('/rentals/rent', { carId: id, startDate, endDate });
      alert('Car rented successfully');
      navigate('/my-rentals');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Rent failed');
    } finally {
      setRenting(false);
    }
  };

  if (loading) return <div className="text-center p-4">Loading car details...</div>;
  if (!car) return <div className="text-center p-4">Car not found</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl mb-4">Car Details</h1>
      <div className="bg-white p-6 rounded shadow-md mb-4">
        <h2 className="text-2xl">{car.brand} {car.model}</h2>
        <p>Year: {car.year}</p>
        <p>Daily Rate: ${car.dailyRate}</p>
        <p>Status: {car.status}</p>
      </div>
      <div className="bg-white p-6 rounded shadow-md w-80 mx-auto">
        <h3 className="text-xl mb-4">Rent This Car</h3>
        <label className="block mb-2">Start Date</label>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="w-full p-2 mb-4 border rounded"
          required
          disabled={renting}
        />
        <label className="block mb-2">End Date</label>
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="w-full p-2 mb-4 border rounded"
          required
          disabled={renting}
        />
        <button
          onClick={handleRent}
          className="w-full bg-blue-500 text-white p-2 rounded disabled:opacity-50"
          disabled={renting}
        >
          {renting ? 'Renting...' : 'Rent Car'}
        </button>
      </div>
    </div>
  );
};

export default CarDetail;