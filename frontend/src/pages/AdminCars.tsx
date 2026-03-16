import { useEffect, useState } from 'react';
import api from '../services/api';

interface Car {
  id: string;
  brand: string;
  model: string;
  year: number;
  dailyRate: number;
}

const AdminCars = () => {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [dailyRate, setDailyRate] = useState('');

  useEffect(() => {
    fetchCars();
  }, []);

  const fetchCars = async () => {
    try {
      const res = await api.get('/cars');
      setCars(res.data);
    } catch (err: any) {
      alert('Failed to load cars');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!brand || !model || !year || !dailyRate) {
      alert('Please fill all fields');
      return;
    }
    setAdding(true);
    try {
      await api.post('/cars', {
        brand,
        model,
        year: parseInt(year),
        dailyRate: parseFloat(dailyRate),
        lat: 0,
        lng: 0,
        status: 'AVAILABLE'
      });
      fetchCars();
      setBrand('');
      setModel('');
      setYear('');
      setDailyRate('');
    } catch (err: any) {
      alert('Add car failed');
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeleting(id);
    try {
      await api.delete(`/cars/${id}`);
      fetchCars();
    } catch (err: any) {
      alert('Delete failed');
    } finally {
      setDeleting(null);
    }
  };

  if (loading) return <div className="text-center p-4">Loading cars...</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl mb-4">Admin Cars</h1>
      <div className="bg-white p-6 rounded shadow-md mb-4">
        <h2 className="text-xl mb-2">Add New Car</h2>
        <input value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="Brand" className="p-2 border rounded mr-2" />
        <input value={model} onChange={(e) => setModel(e.target.value)} placeholder="Model" className="p-2 border rounded mr-2" />
        <input value={year} onChange={(e) => setYear(e.target.value)} placeholder="Year" className="p-2 border rounded mr-2" />
        <input value={dailyRate} onChange={(e) => setDailyRate(e.target.value)} placeholder="Daily Rate" className="p-2 border rounded mr-2" />
        <button onClick={handleAdd} disabled={adding} className="bg-green-500 text-white p-2 rounded disabled:opacity-50">
          {adding ? 'Adding...' : 'Add Car'}
        </button>
      </div>
      <div className="space-y-2">
        {cars.map((car) => (
          <div key={car.id} className="bg-white p-4 rounded shadow-md flex justify-between">
            <div>
              <p>{car.brand} {car.model} ({car.year}) - ${car.dailyRate}/day</p>
            </div>
            <button onClick={() => handleDelete(car.id)} disabled={deleting === car.id} className="bg-red-500 text-white p-2 rounded disabled:opacity-50">
              {deleting === car.id ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminCars;