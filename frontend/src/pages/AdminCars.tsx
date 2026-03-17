import { useEffect, useState } from 'react';
import L from 'leaflet';
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import api from '../services/api';

interface Car {
  id: string;
  brand: string;
  model: string;
  year: number;
  startPrice: number;
  pricePerMinute: number;
  lat: number;
  lng: number;
}

const defaultLocation = {
  latitude: 48.8566,
  longitude: 2.3522,
};

const markerIcon = new L.Icon({
  iconUrl: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

function MapClickHandler({
  setLocation,
}: {
  setLocation: React.Dispatch<React.SetStateAction<{ latitude: number; longitude: number }>>;
}) {
  useMapEvents({
    click(e) {
      setLocation({
        latitude: e.latlng.lat,
        longitude: e.latlng.lng,
      });
    },
  });

  return null;
}

function RecenterMap({ center }: { center: [number, number] }) {
  const map = useMap();

  useEffect(() => {
    map.setView(center);
  }, [center, map]);

  return null;
}

const AdminCars = () => {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [startPrice, setStartPrice] = useState('');
  const [pricePerMinute, setPricePerMinute] = useState('');
  const [location, setLocation] = useState(defaultLocation);

  useEffect(() => {
    fetchCars();
  }, []);

  const fetchCars = async () => {
    try {
      const res = await api.get('/admin/cars');
      setCars(res.data);
    } catch (err: any) {
      alert('Failed to load cars');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!brand || !model || !year || !startPrice || !pricePerMinute) {
      alert('Please fill all fields');
      return;
    }
    setAdding(true);
    try {
      await api.post('/cars', {
        brand,
        model,
        year: parseInt(year),
        startPrice: parseFloat(startPrice),
        pricePerMinute: parseFloat(pricePerMinute),
        lat: location.latitude,
        lng: location.longitude,
        status: 'AVAILABLE'
      });
      fetchCars();
      setBrand('');
      setModel('');
      setYear('');
      setStartPrice('');
      setPricePerMinute('');
      setLocation(defaultLocation);
    } catch (err: any) {
      alert('Add car failed');
    } finally {
      setAdding(false);
    }
  };

  const startEdit = (car: Car) => {
    setEditingId(car.id);
    setBrand(car.brand);
    setModel(car.model);
    setYear(String(car.year));
    setStartPrice(String(car.startPrice));
    setPricePerMinute(String(car.pricePerMinute));
    setLocation({
      latitude: car.lat,
      longitude: car.lng,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setBrand('');
    setModel('');
    setYear('');
    setStartPrice('');
    setPricePerMinute('');
    setLocation(defaultLocation);
  };

  const handleSave = async () => {
    if (!editingId) return;

    if (!brand || !model || !year || !startPrice || !pricePerMinute) {
      alert('Please fill all fields');
      return;
    }

    setSaving(true);
    try {
      await api.patch(`/admin/cars/${editingId}`, {
        brand,
        model,
        year: parseInt(year),
        startPrice: parseFloat(startPrice),
        pricePerMinute: parseFloat(pricePerMinute),
        lat: location.latitude,
        lng: location.longitude,
      });
      fetchCars();
      cancelEdit();
    } catch (err: any) {
      alert('Update failed');
    } finally {
      setSaving(false);
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
        <h2 className="text-xl mb-2">{editingId ? 'Edit Car' : 'Add New Car'}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
          <input value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="Brand" className="p-2 border rounded" />
          <input value={model} onChange={(e) => setModel(e.target.value)} placeholder="Model" className="p-2 border rounded" />
          <input value={year} onChange={(e) => setYear(e.target.value)} placeholder="Year" className="p-2 border rounded" />
          <input value={startPrice} onChange={(e) => setStartPrice(e.target.value)} placeholder="Start Price" className="p-2 border rounded" />
          <input value={pricePerMinute} onChange={(e) => setPricePerMinute(e.target.value)} placeholder="Price per Minute" className="p-2 border rounded" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
          <input
            type="number"
            step="0.0001"
            value={location.latitude}
            onChange={(e) =>
              setLocation({ ...location, latitude: Number(e.target.value) })
            }
            placeholder="Latitude"
            className="p-2 border rounded"
          />
          <input
            type="number"
            step="0.0001"
            value={location.longitude}
            onChange={(e) =>
              setLocation({ ...location, longitude: Number(e.target.value) })
            }
            placeholder="Longitude"
            className="p-2 border rounded"
          />
        </div>

        <div className="mb-4 rounded overflow-hidden border">
          <MapContainer
            center={[location.latitude, location.longitude]}
            zoom={13}
            style={{ height: '300px', width: '100%' }}
          >
            <RecenterMap center={[location.latitude, location.longitude]} />
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <Marker position={[location.latitude, location.longitude]} icon={markerIcon} />
            <MapClickHandler setLocation={setLocation} />
          </MapContainer>
        </div>

        {editingId ? (
          <>
            <button onClick={handleSave} disabled={saving} className="bg-blue-500 text-white p-2 rounded disabled:opacity-50 mr-2">
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <button onClick={cancelEdit} className="bg-gray-300 text-black p-2 rounded">
              Cancel
            </button>
          </>
        ) : (
          <button onClick={handleAdd} disabled={adding} className="bg-green-500 text-white p-2 rounded disabled:opacity-50">
            {adding ? 'Adding...' : 'Add Car'}
          </button>
        )}
      </div>
      <div className="space-y-2">
        {cars.map((car) => (
          <div key={car.id} className="bg-white p-4 rounded shadow-md flex justify-between items-center">
            <div>
              <p>
                {car.brand} {car.model} ({car.year}) - ${car.startPrice.toFixed(2)} + ${car.pricePerMinute.toFixed(2)}/min
              </p>
              <p className="text-sm text-gray-600">
                Location: {car.lat.toFixed(4)}, {car.lng.toFixed(4)}
              </p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => startEdit(car)} className="bg-yellow-500 text-white p-2 rounded">
                Edit
              </button>
              <button onClick={() => handleDelete(car.id)} disabled={deleting === car.id} className="bg-red-500 text-white p-2 rounded disabled:opacity-50">
                {deleting === car.id ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminCars;