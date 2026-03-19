import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';
import CarCard from '../components/CarCard';
import { useAuth } from '../hooks/useAuth';

interface Car {
  id: string;
  brand: string;
  model: string;
  year: number;
  startPrice: number;
  pricePerMinute: number;
  status?: string;
}

interface CurrentRental {
  id: string;
  car: {
    id: string;
  };
}

interface MyRentalsResponse {
  currentRental: CurrentRental | null;
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

const initialFilters: CarFilters = {
  brand: '',
  model: '',
  year: '',
  minStartPrice: '',
  maxStartPrice: '',
  minPricePerMinute: '',
  maxPricePerMinute: '',
};

const CarsList = () => {
  const { token, user: currentUser } = useAuth();
  const isAdmin = currentUser?.role === 'ADMIN';
  const [allCars, setAllCars] = useState<Car[]>([]);
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [options, setOptions] = useState<CarFilterOptions>({
    brands: [],
    models: [],
    years: [],
  });
  const [brandModels, setBrandModels] = useState<string[]>([]);
  const [currentRental, setCurrentRental] = useState<CurrentRental | null>(null);
  const [brandInput, setBrandInput] = useState('');
  const [brandFocused, setBrandFocused] = useState(false);
  const [modelInput, setModelInput] = useState('');
  const [modelFocused, setModelFocused] = useState(false);
  const [yearInput, setYearInput] = useState('');
  const [yearFocused, setYearFocused] = useState(false);
  const [filters, setFilters] = useState<CarFilters>(initialFilters);
  const [appliedFilters, setAppliedFilters] = useState<CarFilters>(initialFilters);
  const [showFilters, setShowFilters] = useState(false);
  const navigate = useNavigate();

  const fetchCars = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/cars${isAdmin ? '?includeRented=true' : ''}`);
      setCars(res.data);
    } catch {
      toast.error("We couldn't load cars. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        const includeRentedQuery = isAdmin ? '?includeRented=true' : '';
        const [carsRes, rentalsRes, filterOptionsRes] = await Promise.all([
          api.get(`/cars${includeRentedQuery}`),
          token
            ? api.get('/rentals/my')
            : Promise.resolve({ data: { currentRental: null } }),
          api.get('/cars/filters'),
        ]);

        setCars(carsRes.data);
        setAllCars(carsRes.data);

        const rentals: MyRentalsResponse = rentalsRes.data;
        setCurrentRental(rentals.currentRental);

        setOptions(filterOptionsRes.data);
        setBrandModels(filterOptionsRes.data.models ?? []);
      } catch {
        // Error is handled via toast below.
        toast.error("We couldn't load cars. Please try again.");
        setCars([]);
        setAllCars([]);
        setCurrentRental(null);
        setOptions({ brands: [], models: [], years: [] });
        setBrandModels([]);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [token, isAdmin]);

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
      if (isAdmin) {
        params.append('includeRented', 'true');
      }
      Object.entries(nextFilters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      // Disable own rental injection when filters are active
      const hasActiveFilters = Object.values(nextFilters).some(value => value !== '');
      if (hasActiveFilters) {
        params.append('includeOwnRental', 'false');
      }
      const res = await api.get(`/cars?${params.toString()}`);
      setCars(res.data);
    } catch {
      toast.error("We couldn't apply filters. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = async () => {
    setAppliedFilters(filters);
    await fetchCarsByFilters(filters);
  };

  const resetFilters = async () => {
    setFilters(initialFilters);
    setAppliedFilters(initialFilters);
    setBrandInput('');
    setModelInput('');
    setYearInput('');
    await fetchCars();
  };

  const goToCarDetails = (carId: string) => {
    navigate(`/cars/${carId}`);
  };

  const isMyCar = (car: Car) => currentRental?.car?.id === car.id;

  const hasActiveFilters = Object.values(appliedFilters).some((value) => value !== '');

  const visibleCars = useMemo(() => {
    const mergedCars = [...cars];

    if (!hasActiveFilters) {
      const myRentedCar = allCars.find((car) => isMyCar(car));

      if (myRentedCar && !mergedCars.some((car) => car.id === myRentedCar.id)) {
        mergedCars.push(myRentedCar);
      }
    }

    return mergedCars
      .filter((car) => isAdmin || car.status === 'AVAILABLE' || isMyCar(car))
      .sort((a, b) => Number(isMyCar(b)) - Number(isMyCar(a)));
  }, [allCars, cars, currentRental?.car?.id, isAdmin, hasActiveFilters]);

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
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <button
          onClick={() => setShowFilters((prev) => !prev)}
          className="rounded bg-blue-600 px-4 py-2 text-white shadow-sm hover:bg-blue-700"
        >
          {showFilters ? 'Hide Filters' : 'Show Filters'}
        </button>
        <button
          onClick={() => navigate('/map')}
          className="bg-green-600 text-white px-4 py-2 rounded shadow-sm hover:bg-green-700"
        >
          Search on Map
        </button>
      </div>

      {showFilters && (
      <div className="bg-gray-50 p-3 rounded-lg shadow-sm mb-4">
        <h2 className="text-lg mb-2">Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-3">
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
              className="w-full p-2 border rounded text-sm"
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
              className="w-full p-2 border rounded text-sm"
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
              className="w-full p-2 border rounded text-sm"
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

        <div className="mb-2">
          <h4 className="font-semibold mb-2">Start Price</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <input
              type="number"
              min="0"
              step="1"
              value={filters.minStartPrice}
              onChange={(e) => setFilters({ ...filters, minStartPrice: e.target.value })}
              placeholder="Min"
              className="p-2 border rounded text-sm"
            />
            <input
              type="number"
              min="0"
              step="1"
              value={filters.maxStartPrice}
              onChange={(e) => setFilters({ ...filters, maxStartPrice: e.target.value })}
              placeholder="Max"
              className="p-2 border rounded text-sm"
            />
          </div>
        </div>

        <div className="mb-2">
          <h4 className="font-semibold mb-2">Price per minute</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <input
              type="number"
              min="0"
              step="0.01"
              value={filters.minPricePerMinute}
              onChange={(e) => setFilters({ ...filters, minPricePerMinute: e.target.value })}
              placeholder="Min"
              className="p-2 border rounded text-sm"
            />
            <input
              type="number"
              min="0"
              step="0.01"
              value={filters.maxPricePerMinute}
              onChange={(e) => setFilters({ ...filters, maxPricePerMinute: e.target.value })}
              placeholder="Max"
              className="p-2 border rounded text-sm"
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
      )}
      {visibleCars.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 text-lg">No cars match your filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {visibleCars.map((car) => (
            <div
              key={car.id}
              className={isMyCar(car) ? 'relative rounded border-2 border-blue-500 bg-blue-50 p-1' : 'relative'}
            >
              {isMyCar(car) && (
                <span className="absolute right-3 top-3 rounded-full bg-blue-600 px-2 py-1 text-xs font-semibold text-white">
                  Your car
                </span>
              )}
              {isAdmin && car.status === 'RENTED' && !isMyCar(car) && (
                <span className="absolute left-3 top-3 rounded-full bg-red-500 px-2 py-1 text-xs font-semibold text-white">
                  Rented
                </span>
              )}
              <CarCard
                car={car}
                onRent={goToCarDetails}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CarsList;
