import { useEffect, useState } from 'react';
import L from 'leaflet';
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import { ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';
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

// Validation helpers
const isValidPrice = (value: string): boolean => {
  if (!value) return false;
  // Allow: 10, 10.5, 0.25, but not letters/symbols
  const priceRegex = /^\d+([.,]\d+)?$/;
  return priceRegex.test(value.trim());
};

const formatPrice = (value: string): string => {
  // Replace comma with dot for consistency
  return value.replace(/,/g, '.');
};

const isValidYear = (value: string): boolean => {
  if (!/^\d+$/.test(value.trim())) return false;
  const parsed = Number(value);
  return parsed >= 1900 && parsed <= 2100;
};

const AdminCars = () => {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
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
  const [yearError, setYearError] = useState('');
  const [startPriceError, setStartPriceError] = useState('');
  const [pricePerMinuteError, setPricePerMinuteError] = useState('');

  useEffect(() => {
    fetchCars();
  }, []);

  const handleYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setYear(value);

    if (value && !isValidYear(value)) {
      setYearError('Invalid year');
      return;
    }

    setYearError('');
  };

  const handleStartPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    // Auto-convert comma to dot
    value = formatPrice(value);
    setStartPrice(value);
    
    // Real-time validation
    if (value && !isValidPrice(value)) {
      setStartPriceError('Invalid number');
    } else {
      setStartPriceError('');
    }
  };

  const handlePricePerMinuteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    // Auto-convert comma to dot
    value = formatPrice(value);
    setPricePerMinute(value);
    
    // Real-time validation
    if (value && !isValidPrice(value)) {
      setPricePerMinuteError('Invalid number');
    } else {
      setPricePerMinuteError('');
    }
  };

  const areAllFieldsValid = (): boolean => {
    return (
      brand.trim() !== '' &&
      model.trim() !== '' &&
      year.trim() !== '' &&
      startPrice.trim() !== '' &&
      pricePerMinute.trim() !== '' &&
      isValidYear(year) &&
      isValidPrice(startPrice) &&
      isValidPrice(pricePerMinute)
    );
  };

  const fetchCars = async () => {
    try {
      const res = await api.get('/admin/cars');
      setCars(res.data);
    } catch {
      toast.error("We couldn't load cars. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!brand || !model || !year || !startPrice || !pricePerMinute) {
      toast.error('Please fill all fields');
      return;
    }

    if (!isValidYear(year)) {
      setYearError('Invalid year');
      toast.error('Invalid year');
      return;
    }

    // Validate price fields
    if (!isValidPrice(startPrice)) {
      setStartPriceError('Invalid number');
      toast.error('Invalid number');
      return;
    }
    if (!isValidPrice(pricePerMinute)) {
      setPricePerMinuteError('Invalid number');
      toast.error('Invalid number');
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
      setYearError('');
      setStartPriceError('');
      setPricePerMinuteError('');
    } catch {
      toast.error("We couldn't add this car. Please try again.");
    } finally {
      setAdding(false);
    }
  };

  const startEdit = (car: Car) => {
    setIsOpen(true);
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
    setYearError('');
    setStartPriceError('');
    setPricePerMinuteError('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setBrand('');
    setModel('');
    setYear('');
    setStartPrice('');
    setPricePerMinute('');
    setLocation(defaultLocation);
    setYearError('');
    setStartPriceError('');
    setPricePerMinuteError('');
  };

  const handleSave = async () => {
    if (!editingId) return;

    if (!brand || !model || !year || !startPrice || !pricePerMinute) {
      toast.error('Please fill all fields');
      return;
    }

    if (!isValidYear(year)) {
      setYearError('Invalid year');
      toast.error('Invalid year');
      return;
    }

    // Validate price fields
    if (!isValidPrice(startPrice)) {
      setStartPriceError('Invalid number');
      toast.error('Invalid number');
      return;
    }
    if (!isValidPrice(pricePerMinute)) {
      setPricePerMinuteError('Invalid number');
      toast.error('Invalid number');
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
    } catch {
      toast.error("We couldn't save changes. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeleting(id);
    try {
      await api.delete(`/cars/${id}`);
      fetchCars();
    } catch {
      toast.error("We couldn't delete this car. Please try again.");
    } finally {
      setDeleting(null);
    }
  };

  if (loading) return <div className="text-center p-4">Loading cars...</div>;

  return (
    <div className="max-w-6xl mx-auto px-4 space-y-6">
      <h1 className="text-3xl mb-4">Admin Cars</h1>
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-6 py-4 flex justify-between items-center text-lg font-semibold text-gray-900 hover:bg-gray-50 transition"
        >
          <span>Add New Car</span>
          <ChevronDown
            className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : 'rotate-0'}`}
          />
        </button>

        <div
          className={`transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}
        >
          <div className="px-6 pb-6 pt-4 space-y-4 border-t">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Row 1: Brand & Model */}
            <div className="mb-1">
              <input
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="Brand"
                className="w-full box-border border border-gray-300 rounded-md px-3 py-2 text-gray-900 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="mt-0.5 min-h-4 text-xs text-red-500 whitespace-nowrap overflow-hidden text-ellipsis"></div>
            </div>

            <div className="mb-1">
              <input
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="Model"
                className="w-full box-border border border-gray-300 rounded-md px-3 py-2 text-gray-900 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="mt-0.5 min-h-4 text-xs text-red-500 whitespace-nowrap overflow-hidden text-ellipsis"></div>
            </div>

            {/* Row 2: Year (Left) + Empty (Right) */}
            <div className="mb-1">
              <input
                value={year}
                onChange={handleYearChange}
                placeholder="e.g. 2022"
                title="Enter year between 1900 and 2100"
                className={`w-full box-border border rounded-md px-3 py-2 text-gray-900 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors ${
                  yearError
                    ? 'border-red-500 focus:ring-red-500'
                    : year && isValidYear(year)
                      ? 'border-green-500 focus:ring-green-500'
                      : 'border-gray-300 focus:ring-blue-500'
                }`}
              />
              <div className="mt-0.5 min-h-4 text-xs text-red-500 whitespace-nowrap overflow-hidden text-ellipsis">{yearError || ''}</div>
            </div>
            <div></div>

            {/* Row 3: Start Price & Price Per Minute */}
            <div className="mb-1">
              <input
                value={startPrice}
                onChange={handleStartPriceChange}
                placeholder="e.g. 10.5"
                title="Use numbers like 10, 10.5 or 0.25"
                className={`w-full box-border border rounded-md px-3 py-2 text-gray-900 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors ${
                  startPriceError
                    ? 'border-red-500 focus:ring-red-500'
                    : startPrice && isValidPrice(startPrice)
                      ? 'border-green-500 focus:ring-green-500'
                      : 'border-gray-300 focus:ring-blue-500'
                }`}
              />
              <div className="mt-0.5 min-h-4 text-xs text-red-500 whitespace-nowrap overflow-hidden text-ellipsis">{startPriceError || ''}</div>
            </div>

            <div className="mb-1">
              <input
                value={pricePerMinute}
                onChange={handlePricePerMinuteChange}
                placeholder="e.g. 0.25"
                title="Use numbers like 10, 10.5 or 0.25"
                className={`w-full box-border border rounded-md px-3 py-2 text-gray-900 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors ${
                  pricePerMinuteError
                    ? 'border-red-500 focus:ring-red-500'
                    : pricePerMinute && isValidPrice(pricePerMinute)
                      ? 'border-green-500 focus:ring-green-500'
                      : 'border-gray-300 focus:ring-blue-500'
                }`}
              />
              <div className="mt-0.5 min-h-4 text-xs text-red-500 whitespace-nowrap overflow-hidden text-ellipsis">{pricePerMinuteError || ''}</div>
            </div>

            {/* Row 4: Latitude & Longitude */}
            <div className="mb-1">
              <input
                type="number"
                step="0.0001"
                value={location.latitude}
                onChange={(e) =>
                  setLocation({ ...location, latitude: Number(e.target.value) })
                }
                placeholder="Latitude"
                className="w-full box-border border border-gray-300 rounded-md px-3 py-2 text-gray-900 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="mt-0.5 min-h-4 text-xs text-red-500 whitespace-nowrap overflow-hidden text-ellipsis"></div>
            </div>

            <div className="mb-1">
              <input
                type="number"
                step="0.0001"
                value={location.longitude}
                onChange={(e) =>
                  setLocation({ ...location, longitude: Number(e.target.value) })
                }
                placeholder="Longitude"
                className="w-full box-border border border-gray-300 rounded-md px-3 py-2 text-gray-900 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="mt-0.5 min-h-4 text-xs text-red-500 whitespace-nowrap overflow-hidden text-ellipsis"></div>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              Select car location
            </p>
            <div className="rounded-lg overflow-hidden border">
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
            <p className="text-xs text-gray-500">
              Click on the map to set location
            </p>
          </div>

          {editingId ? (
            <>
              <button onClick={handleSave} disabled={saving || !areAllFieldsValid()} className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white py-2 px-4 rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed mr-2">
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button onClick={cancelEdit} className="bg-gray-300 hover:bg-gray-400 text-black py-2 px-4 rounded-md">
                Cancel
              </button>
            </>
          ) : (
            <button onClick={handleAdd} disabled={adding || !areAllFieldsValid()} className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white py-2 rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed transition">
              {adding ? 'Adding...' : 'Add Car'}
            </button>
          )}
          </div>
        </div>
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