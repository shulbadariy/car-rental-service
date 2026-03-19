interface CarCardProps {
  car: {
    id: string;
    brand: string;
    model: string;
    year: number;
    startPrice: number;
    pricePerMinute: number;
  };
  onRent: (carId: string) => void;
}

const CarCard = ({ car, onRent }: CarCardProps) => {
  return (
    <div className="bg-white p-4 rounded shadow-md hover:shadow-lg transition">
      <h2 className="mb-2 text-xl font-semibold text-gray-900">{car.brand} {car.model}</h2>
      <p className="text-gray-600">Year: {car.year}</p>
      <p className="text-green-600 font-semibold">
        ${car.startPrice.toFixed(2)} + ${car.pricePerMinute.toFixed(2)}/min
      </p>
      <button
        onClick={() => onRent(car.id)}
        className="mt-3 w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded font-semibold transition-colors cursor-pointer"
      >
        View Info
      </button>
    </div>
  );
};

export default CarCard;