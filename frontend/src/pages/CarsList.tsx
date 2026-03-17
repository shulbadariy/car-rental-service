import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import CarCard from '../components/CarCard';

interface Car {
  id: string;
  brand: string;
  model: string;
  year: number;
  startPrice: number;
  pricePerMinute: number;
}

interface CarFilters {
  brand: string;
  model: string;
  year: string;
  minStartPrice: string;
  maxStartPrice: string;
  minPricePerMinute: string;
  maxPricePerMinute: string;
}

interface CarFilterOptions {
  brands: string[];
  models: string[];
  years: number[];
}

const CarsList = () => {
  const [allCars, setAllCars] = useState<Car[]>([]);
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [options, setOptions] = useState<CarFilterOptions>({
    brands: [],
    models: [],
    years: [],
  });
  const [brandModels, setBrandModels] = useState<string[]>([]);
  const [brandInput, setBrandInput] = useState('');
  const [brandFocused, setBrandFocused] = useState(false);
  const [modelInput, setModelInput] = useState('');
  const [modelFocused, setModelFocused] = useState(false);
  const [yearInput, setYearInput] = useState('');
  const [yearFocused, setYearFocused] = useState(false);
  const [filters, setFilters] = useState<CarFilters>({
    brand: '',
    model: '',
    year: '',
    minStartPrice: '',
    maxStartPrice: '',
    minPricePerMinute: '',
    maxPricePerMinute: '',
  });
  const navigate = useNavigate();

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

  useEffect(() => {
    fetchCars();
  }, []);

  useEffect(() => {
    const fetchAllCars = async () => {
      try {
        const res = await api.get('/cars/all');
        setAllCars(res.data);
      } catch (error) {
        console.error('Failed to load all cars', error);
        setAllCars([]);
      }
    };

    fetchAllCars();
  }, []);

  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const res = await api.get('/cars/filters');
        console.log('FILTER OPTIONS:', res.data);
        setOptions(res.data);
        setBrandModels(res.data.models ?? []);
      } catch (error) {
        console.error('Failed to load filter options', error);
        setOptions({ brands: [], models: [], years: [] });
        setBrandModels([]);
      }
    };

    fetchFilterOptions();
  }, []);

  useEffect(() => {
    const models = [...new Set(
      allCars
        .filter((car) => !filters.brand || car.brand === filters.brand)
        .map((car) => car.model),
    )];

    setBrandModels(models);
    setFilters((prev) => {
      if (prev.model && !models.includes(prev.model)) {
        return { ...prev, model: '', year: '' };
      }
      return prev;
    });
  }, [allCars, filters.brand]);

  const fetchCarsByFilters = async (nextFilters: CarFilters) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      Object.entries(nextFilters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      const res = await api.get(`/cars?${params.toString()}`);
      setCars(res.data);
    } catch (err: any) {
      alert('Failed to apply filters');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = async () => {
    await fetchCarsByFilters(filters);
  };

  const resetFilters = async () => {
    setFilters({
      brand: '',
      model: '',
      year: '',
      minStartPrice: '',
      maxStartPrice: '',
      minPricePerMinute: '',
      maxPricePerMinute: '',
    });
    setBrandInput('');
    setModelInput('');
    setYearInput('');
    await fetchCars();
  };

  const goToCarDetails = (carId: string) => {
    navigate(`/cars/${carId}`);
  };

  // Computed suggestions shown only while each input is focused
  const brandSuggestions = brandFocused
    ? !brandInput
      ? options.brands
      : options.brands.filter((b) => b.toLowerCase().includes(brandInput.toLowerCase()))
    : [];

  const modelSuggestions = modelFocused
    ? !modelInput
      ? brandModels
      : brandModels.filter((m) => m.toLowerCase().includes(modelInput.toLowerCase()))
    : [];

  const validYears = options.years.filter((year) =>
    allCars.some(
      (car) =>
        car.year === year &&
        (!filters.brand || car.brand === filters.brand) &&
        (!filters.model || car.model === filters.model),
    ),
  );
  const yearSuggestions = yearFocused
    ? !yearInput
      ? validYears
      : validYears.filter((y) => String(y).includes(yearInput))
    : [];

  if (loading) return <div className="text-center p-4">Loading cars...</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl mb-4">Available Cars</h1>
      <div className="bg-white p-4 rounded shadow-md mb-4">
        <h2 className="text-xl mb-3">Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
          <div className="relative">
            <input
              value={brandInput}
              onChange={(e) => {
                const val = e.target.value;
                setBrandInput(val);
                if (!val) {
                  setFilters((prev) => ({ ...prev, brand: '', model: '', year: '' }));
                  setModelInput('');
                  setYearInput('');
                }
              }}
              onFocus={() => setBrandFocused(true)}
              onBlur={() => setTimeout(() => setBrandFocused(false), 150)}
              placeholder="Brand"
              className="w-full p-2 border rounded"
            />
            {brandSuggestions.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border rounded shadow-md max-h-40 overflow-y-auto">
                {brandSuggestions.map((b) => (
                  <button
                    key={b}
                    onClick={() => {
                      setBrandInput(b);
                      setBrandFocused(false);
                      setModelInput('');
                      setYearInput('');
                      setFilters((prev) => ({ ...prev, brand: b, model: '', year: '' }));
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-gray-100"
                  >
                    {b}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="relative">
            <input
              value={modelInput}
              onChange={(e) => {
                const val = e.target.value;
                setModelInput(val);
                if (!val) {
                  setFilters((prev) => ({ ...prev, model: '', year: '' }));
                  setYearInput('');
                }
              }}
              onFocus={() => setModelFocused(true)}
              onBlur={() => setTimeout(() => setModelFocused(false), 150)}
              placeholder="Model"
              className="w-full p-2 border rounded"
            />
            {modelSuggestions.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border rounded shadow-md max-h-40 overflow-y-auto">
                {modelSuggestions.map((m) => (
                  <button
                    key={m}
                    onClick={() => {
                      setModelInput(m);
                      setModelFocused(false);
                      setYearInput('');
                      setFilters((prev) => ({ ...prev, model: m, year: '' }));
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-gray-100"
                  >
                    {m}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="relative">
            <input
              value={yearInput}
              onChange={(e) => {
                const val = e.target.value;
                setYearInput(val);
                if (!val) {
                  setFilters((prev) => ({ ...prev, year: '' }));
                }
              }}
              onFocus={() => setYearFocused(true)}
              onBlur={() => setTimeout(() => setYearFocused(false), 150)}
              placeholder="Year"
              className="w-full p-2 border rounded"
            />
            {yearSuggestions.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border rounded shadow-md max-h-40 overflow-y-auto">
                {yearSuggestions.map((y) => (
                  <button
                    key={y}
                    onClick={() => {
                      setYearInput(String(y));
                      setYearFocused(false);
                      setFilters((prev) => ({ ...prev, year: String(y) }));
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-gray-100"
                  >
                    {y}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="mb-3">
          <h4 className="font-semibold mb-2">Start Price</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              type="number"
              min="0"
              step="1"
              value={filters.minStartPrice}
              onChange={(e) => setFilters({ ...filters, minStartPrice: e.target.value })}
              placeholder="Min"
              className="p-2 border rounded"
            />
            <input
              type="number"
              min="0"
              step="1"
              value={filters.maxStartPrice}
              onChange={(e) => setFilters({ ...filters, maxStartPrice: e.target.value })}
              placeholder="Max"
              className="p-2 border rounded"
            />
          </div>
        </div>

        <div className="mb-3">
          <h4 className="font-semibold mb-2">Price per minute</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              type="number"
              min="0"
              step="0.01"
              value={filters.minPricePerMinute}
              onChange={(e) => setFilters({ ...filters, minPricePerMinute: e.target.value })}
              placeholder="Min"
              className="p-2 border rounded"
            />
            <input
              type="number"
              min="0"
              step="0.01"
              value={filters.maxPricePerMinute}
              onChange={(e) => setFilters({ ...filters, maxPricePerMinute: e.target.value })}
              placeholder="Max"
              className="p-2 border rounded"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <button onClick={applyFilters} className="bg-blue-600 text-white px-4 py-2 rounded">
            Apply Filters
          </button>
          <button onClick={resetFilters} className="bg-gray-300 text-black px-4 py-2 rounded">
            Reset
          </button>
        </div>
      </div>
      {cars.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 text-lg">No cars available right now</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {cars.map((car) => (
            <CarCard
              key={car.id}
              car={car}
              onRent={goToCarDetails}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CarsList;
