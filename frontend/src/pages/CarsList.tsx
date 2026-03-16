import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import CarCard from '../components/CarCard';

interface Car {
  id: string;
  brand: string;
  model: string;
  year: number;
  dailyRate: number;
  status: string;
}

const CarsList = () => {
  const [cars, setCars] = useState<Car[]>([]);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Debounce the search input so we don't call the API on every keystroke
  useEffect(() => {
    const handler = window.setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => window.clearTimeout(handler);
  }, [search]);

  useEffect(() => {
    const fetchCars = async () => {
      try {
        const res = await api.get('/cars', {
          params: {
            q: debouncedSearch,
          },
        });
        setCars(res.data);
      } catch (err: any) {
        alert('Failed to load cars');
      } finally {
        setLoading(false);
      }
    };
    fetchCars();
  }, [debouncedSearch]);

  if (loading) return <div className="text-center p-4">Loading cars...</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl mb-4">Available Cars</h1>
      <div className="mb-4">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by brand or model..."
          className="w-full p-2 border rounded"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {cars.map((car) => (
          <Link key={car.id} to={`/cars/${car.id}`}>
            <CarCard car={car} />
          </Link>
        ))}
      </div>
    </div>
  );
};

export default CarsList;