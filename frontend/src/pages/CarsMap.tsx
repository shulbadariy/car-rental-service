import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import { Circle, MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import api from '../services/api';

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
	const [cars, setCars] = useState<Car[]>([]);
	const [user, setUser] = useState<User | null>(null);
	const [center, setCenter] = useState<[number, number]>(defaultCenter);
	const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
	const [radius, setRadius] = useState(5);
	const [isRadiusEnabled, setIsRadiusEnabled] = useState(true);
	const [myRental, setMyRental] = useState<string | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');

	useEffect(() => {
		const fetchData = async () => {
			setLoading(true);
			setError('');

			try {
				const userRes = await api.get('/users/me');
				const currentUser = userRes.data;
				setUser(currentUser);

				const isAdmin = currentUser?.role === 'ADMIN' || currentUser?.role === 'SUPERADMIN';
				const carsRes = await api.get(isAdmin ? '/admin/cars' : '/cars');
				setCars(carsRes.data);
			} catch (err: any) {
				setError(err.response?.data?.message || 'Failed to load map data');
				setCars([]);
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, []);

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

	const getLocation = () => {
		if (!navigator.geolocation) {
			alert('Geolocation is not supported in this browser');
			return;
		}

		navigator.geolocation.getCurrentPosition(
			(pos) => {
				const { latitude, longitude } = pos.coords;
				setUserLocation({ lat: latitude, lng: longitude });
				setCenter([latitude, longitude]);
			},
			() => {
				alert('Failed to get your location');
			},
		);
	};

	if (loading) {
		return <div className="text-center p-6">Loading map...</div>;
	}

	if (error) {
		return <div className="text-center p-6 text-red-600">{error}</div>;
	}

	return (
		<div className="container mx-auto p-6 space-y-4">
			<div className="flex items-center justify-between gap-4 flex-wrap">
				<div>
					<h1 className="text-3xl font-bold">Cars Map</h1>
					<p className="text-gray-600">
						{isAdmin
							? 'Admin view: green markers are available, red markers are rented.'
							: 'User view: only available cars are shown.'}
					</p>
				</div>
				<div className="flex items-center gap-2 flex-wrap">
					<button
						onClick={getLocation}
						className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
					>
						Use my location
					</button>
				</div>
			</div>

			<div className="bg-white rounded-xl shadow-md p-4 space-y-3">
				<div className="flex items-center justify-between gap-4 flex-wrap">
					<label className="font-medium text-slate-800">
						Radius: {isRadiusEnabled ? `${radius.toFixed(1)} km` : 'OFF'}
					</label>
					<label className="flex items-center gap-2 text-sm text-slate-800">
						Radius Filter
						<input
							type="checkbox"
							checked={isRadiusEnabled}
							onChange={(e) => setIsRadiusEnabled(e.target.checked)}
						/>
					</label>
				</div>
				<input
					type="range"
					min="0"
					max="25"
					step="0.1"
					value={radius}
					onChange={(e) => {
						setRadius(Number(e.target.value));
						setIsRadiusEnabled(true);
					}}
					className="w-full"
				/>
			</div>

			<div className="bg-white rounded-xl shadow-md p-3">
				<MapContainer center={center} zoom={13} style={{ height: '500px', width: '100%' }}>
					<RecenterMap center={center} />
					<TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

					{userLocation && isRadiusEnabled && radius > 0 && (
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

					{userLocation && (
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
						const isRented = car.status === 'RENTED';
						const isMine = car.id === myRental;
						const distance = userLocation
							? getDistance(userLocation.lat, userLocation.lng, car.lat, car.lng).toFixed(2)
							: null;
						const icon = isMine ? myCarIcon : isRented ? redIcon : greenIcon;

						return (
							<Marker
								key={car.id}
								position={[car.lat, car.lng]}
								icon={icon}
							>
								<Popup>
									<div className="space-y-1 min-w-[180px]">
										<strong>{car.brand} {car.model}</strong>
										<br />
										<span>Year: {car.year}</span>
										<br />
										<span>Start: ${car.startPrice.toFixed(2)}</span>
										<br />
										<span>Per min: ${car.pricePerMinute.toFixed(2)}</span>
										<br />
										{isMine ? (
											<span style={{ color: 'purple' }}>YOUR CAR</span>
										) : (
											<span style={{ color: isRented ? 'red' : 'green' }}>
												{isRented ? 'IN USE' : 'AVAILABLE'}
											</span>
										)}
										<br />
										{distance && (
											<>
												<span>Distance: {distance} km</span>
												<br />
											</>
										)}
										<button
											onClick={() => navigate(`/cars/${car.id}`)}
											className="mt-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded"
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
