interface CarCardProps {
  car: {
    id: string;
    brand: string;
    model: string;
    year: number;
    dailyRate: number;
  };
}

const CarCard = ({ car }: CarCardProps) => {
  return (
    <div className="bg-white p-4 rounded shadow-md hover:shadow-lg transition">
      <h2 className="text-xl font-bold">{car.brand} {car.model}</h2>
      <p className="text-gray-600">Year: {car.year}</p>
      <p className="text-green-600 font-semibold">${car.dailyRate}/day</p>
    </div>
  );
};

export default CarCard;