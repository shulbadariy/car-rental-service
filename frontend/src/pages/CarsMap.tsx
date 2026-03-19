import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import L from 'leaflet';
import { Circle, MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import toast from 'react-hot-toast';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';

interface User {
	id: string;
	email: string;
	role: string;
}

interface Car {
	id: string;
	brand: string;
	model: string;
	year: number;
	startPrice: number;
	pricePerMinute: number;
	status: 'AVAILABLE' | 'RENTED';
	lat: number;
	lng: number;
}

const defaultCenter: [number, number] = [48.8566, 2.3522];

const greenIcon = new L.Icon({
	iconUrl: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png',
	iconSize: [32, 32],
	iconAnchor: [16, 32],
	popupAnchor: [0, -32],
});

const redIcon = new L.Icon({
	iconUrl: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
	iconSize: [32, 32],
	iconAnchor: [16, 32],
	popupAnchor: [0, -32],
});

const blueIcon = new L.Icon({
	iconUrl: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
	iconSize: [32, 32],
	iconAnchor: [16, 32],
	popupAnchor: [0, -32],
});

const myCarIcon = new L.Icon({
	iconUrl: 'https://maps.google.com/mapfiles/ms/icons/purple-dot.png',
	iconSize: [40, 40],
	iconAnchor: [20, 40],
	popupAnchor: [0, -40],
});

const RecenterMap = ({ center }: { center: [number, number] }) => {
	const map = useMap();

	useEffect(() => {
		map.setView(center);
	}, [center, map]);

	return null;
};

function getDistance(lat1: number, lng1: number, lat2: number, lng2: number) {
	const earthRadiusKm = 6371;
	const dLat = ((lat2 - lat1) * Math.PI) / 180;
	const dLng = ((lng2 - lng1) * Math.PI) / 180;

	const a =
		Math.sin(dLat / 2) * Math.sin(dLat / 2) +
		Math.cos((lat1 * Math.PI) / 180) *
			Math.cos((lat2 * Math.PI) / 180) *
			Math.sin(dLng / 2) *
			Math.sin(dLng / 2);

	const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

	return earthRadiusKm * c;
}

const CarsMap = () => {
	const navigate = useNavigate();
	const { user: authUser, token } = useAuth();
	const isAuthenticated = Boolean(token);
	const [searchParams] = useSearchParams();
	const latParam = parseFloat(searchParams.get('lat') ?? '');
	const lngParam = parseFloat(searchParams.get('lng') ?? '');
	const targetCenter =
		Number.isFinite(latParam) && Number.isFinite(lngParam)
			? ([latParam, lngParam] as [number, number])
			: null;

	const [cars, setCars] = useState<Car[]>([]);
	const [user, setUser] = useState<User | null>(null);
	const [center, setCenter] = useState<[number, number]>(targetCenter ?? defaultCenter);
	const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
	const [radius, setRadius] = useState(5);
	const [radiusInput, setRadiusInput] = useState(5);
	const [isRadiusEnabled, setIsRadiusEnabled] = useState(true);
	const [myRental, setMyRental] = useState<string | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');

	useEffect(() => {
		if (targetCenter) {
			setCenter(targetCenter);
		}
	}, [targetCenter]);

	useEffect(() => {
		const fetchData = async () => {
			setLoading(true);
			setError('');

			try {
				let currentUser: User | null = null;

				if (token) {
					try {
						const userRes = await api.get('/users/me');
						currentUser = userRes.data;
						setUser(currentUser);
					} catch {
						// If token is invalid/expired, continue in guest mode without surfacing an error.
						currentUser = null;
						setUser(null);
					}
				} else {
					setUser(null);
				}

				const effectiveRole = currentUser?.role ?? authUser?.role;
				const isAdmin = effectiveRole === 'ADMIN' || effectiveRole === 'SUPERADMIN';
				const carsRes = await api.get(isAdmin && token ? '/admin/cars' : '/cars');
				setCars(carsRes.data);
			} catch {
				setError("We couldn't load the map. Please try again.");
				setCars([]);
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, [authUser?.role, token]);

	useEffect(() => {
		const fetchMyRental = async () => {
			try {
				const res = await api.get('/rentals/my');
				const active = res.data?.currentRental;
				setMyRental(active?.car?.id || null);
			} catch {
				setMyRental(null);
			}
		};

		fetchMyRental();
	}, []);

	useEffect(() => {
		const fetchMyCar = async () => {
			if (!myRental) return;

			try {
				const res = await api.get(`/cars/${myRental}`);
				setCars((prev) => {
					const exists = prev.some((c) => c.id === res.data?.id);
					if (exists || !res.data?.id) return prev;
					return [...prev, res.data];
				});
			} catch {
				// If car fetch fails, map can still render available cars.
			}
		};

		fetchMyCar();
	}, [myRental]);

	const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPERADMIN';

	const visibleCars = useMemo(
		() => cars.filter((car) => isAdmin || car.status === 'AVAILABLE' || car.id === myRental),
		[cars, isAdmin, myRental],
	);

	const filteredCars = useMemo(
		() =>
			visibleCars.filter((car) => {
				if (!userLocation) {
					return true;
				}

				if (car.id === myRental) {
					return true;
				}

				if (!isRadiusEnabled) {
					return true;
				}

				const distance = getDistance(userLocation.lat, userLocation.lng, car.lat, car.lng);
				return distance <= radius;
			}),
		[visibleCars, userLocation, radius, isRadiusEnabled, myRental],
	);

	const selectedCar = useMemo(() => {
		if (!targetCenter) return null;
		const [selectedLat, selectedLng] = targetCenter;

		return cars.find(
			(car) =>
				Math.abs(car.lat - selectedLat) < 0.000001 &&
				Math.abs(car.lng - selectedLng) < 0.000001,
		) ?? null;
	}, [cars, targetCenter]);

	useEffect(() => {
		setRadiusInput(radius);
	}, [radius]);

	const getUserLocation = () => {
		if (!isAuthenticated) {
			toast('Login to use location features');
			return;
		}

		if (!navigator.geolocation) return;

		navigator.geolocation.getCurrentPosition(
			(position) => {
				const { latitude, longitude } = position.coords;
				setUserLocation({ lat: latitude, lng: longitude });
				setCenter([latitude, longitude]);
			},
			() => {
				toast.error("We couldn't access your location. Please check browser permissions.");
			},
		);
	};

	useEffect(() => {
		if (!isAuthenticated) return;
		getUserLocation();
	}, [isAuthenticated]);

	if (loading) {
		return <div className="text-center p-6">Loading map...</div>;
	}

	if (error) {
		return <div className="text-center p-6 text-red-600">{error}</div>;
	}

	return (
		<div className="container mx-auto p-6 space-y-6">
			<div className="flex items-center justify-between gap-4 flex-wrap">
				<div>
					<h1 className="text-3xl font-bold text-gray-900">Cars Map</h1>
					<p className="text-gray-600 text-sm mt-1">Showing available cars near you</p>
				</div>
				<div className="flex items-center gap-2 flex-wrap">
					<button
						onClick={getUserLocation}
						className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg shadow-sm"
					>
						Show my location
					</button>
				</div>
			</div>

			<div className="bg-white rounded-xl shadow-sm p-4 space-y-3">
				<div className="flex items-center justify-between gap-4 flex-wrap">
					<p className="text-gray-800 font-medium">
						Radius: <span className="font-semibold">{isRadiusEnabled ? `${radiusInput.toFixed(1)} km` : 'OFF'}</span>
					</p>
					<label className="flex items-center gap-2 text-sm text-gray-600">
						Radius Filter
						<input
							type="checkbox"
							checked={isRadiusEnabled}
							onChange={(e) => setIsRadiusEnabled(e.target.checked)}
						/>
					</label>
				</div>
				<div className="relative z-10">
					<input
						type="range"
						min="1"
						max="20"
						step="0.1"
						value={radiusInput}
						onChange={(e) => {
							setRadiusInput(Number(e.target.value));
							setIsRadiusEnabled(true);
						}}
						onMouseUp={() => setRadius(radiusInput)}
						onTouchEnd={() => setRadius(radiusInput)}
						className="w-full"
					/>
				</div>
			</div>

			<div className="bg-white rounded-xl shadow-md p-3">
				<MapContainer center={center} zoom={13} style={{ height: '500px', width: '100%' }}>
					<RecenterMap center={center} />
					<TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

					{isAuthenticated && userLocation && isRadiusEnabled && radius > 0 && (
						<Circle
							center={[userLocation.lat, userLocation.lng]}
							radius={radius * 1000}
							pathOptions={{
								color: 'black',
								weight: 1,
								opacity: 0.5,
								fill: false,
								dashArray: '4 4',
							}}
						/>
					)}

					{isAuthenticated && userLocation && (
						<Marker position={[userLocation.lat, userLocation.lng]} icon={blueIcon}>
							<Popup>
								<div>
									<strong>Your location</strong>
									<br />
									Radius filter: {isRadiusEnabled ? `${radius.toFixed(1)} km` : 'OFF'}
								</div>
							</Popup>
						</Marker>
					)}

					{filteredCars.map((car) => {
						const isSelected = selectedCar?.id === car.id;

						const isRented = car.status === 'RENTED';
						const isMine = car.id === myRental;
						const distance = userLocation
							? getDistance(userLocation.lat, userLocation.lng, car.lat, car.lng).toFixed(2)
							: null;
						const icon = isSelected ? myCarIcon : isMine ? myCarIcon : isRented ? redIcon : greenIcon;

						return (
							<Marker
								key={car.id}
								position={[car.lat, car.lng]}
								icon={icon}
							>
								<Popup>
									<div className="space-y-1 min-w-[180px]">
										<strong className="text-lg font-semibold text-gray-900">{car.brand} {car.model}</strong>
										<p className="text-sm text-gray-600">Year: {car.year}</p>
										<p className="text-sm text-gray-600">Start: <span className="text-green-600 font-semibold">${car.startPrice.toFixed(2)}</span></p>
										<p className="text-sm text-gray-600">Per min: <span className="text-green-600 font-semibold">${car.pricePerMinute.toFixed(2)}</span></p>
										{isMine ? (
											<p style={{ color: 'purple' }}>YOUR CAR</p>
										) : (
											<p style={{ color: isRented ? 'red' : 'green' }}>
												{isRented ? 'IN USE' : 'AVAILABLE'}
											</p>
										)}
										{distance && (
											<p className="text-sm text-gray-600">Distance: {distance} km</p>
										)}
										<button
											onClick={() => navigate(`/cars/${car.id}`)}
											className="mt-2 bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-1 rounded"
										>
											View
										</button>
									</div>
								</Popup>
							</Marker>
						);
					})}
				</MapContainer>
			</div>
		</div>
	);
};

export default CarsMap;
