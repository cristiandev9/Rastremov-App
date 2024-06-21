import React, { useEffect, useState } from "react";
import {
	Image,
	View,
	Modal,
	Text,
	TouchableOpacity,
	Alert,
	Platform
} from "react-native";
import MapView, { Marker, Circle } from "react-native-maps";
import {
	requestForegroundPermissionsAsync,
	getCurrentPositionAsync,
	watchPositionAsync,
	LocationObject,
	LocationAccuracy,
} from "expo-location";
import { mapStyles } from "./MapScreenStyles";
import { format } from "date-fns-tz";
import Loading from "../../components/loading/Loading";
import { getDevices, getPositionsVehicles } from "../../services/api-v1";
import { PositionData, VehicleData } from "./MapScreenInterfaces";
import * as turf from '@turf/turf';

const iconMarker = require("../../../assets/connected-marker.png");

const MapScreen: React.FC = () => {
	const [locationUser, setLocationUser] = useState<LocationObject | null>(null);
	const [locationData, setLocationData] = useState<PositionData[]>([]);
	const [loading, setLoading] = useState(true);
	const [viewNameOnMap, setViewNameOnMap] = useState(false);
	const [selectedMarker, setSelectedMarker] = useState<PositionData | null>(null);
	const [region, setRegion] = useState({
		latitude: -19.34009833333333,
		longitude: -40.05924777777778,
		latitudeDelta: 0.1,
		longitudeDelta: 0.1,
	});
	const [handlePress, setHandlePress] = useState(false);
	const [initialLoadComplete, setInitialLoadComplete] = useState(false);

	const [geofences, setGeofences] = useState<{
		[markerId: string]: { center: { latitude: number; longitude: number }; radius: number };
	}>({});

	useEffect(() => {
		async function requestPermission() {
			const { status } = await requestForegroundPermissionsAsync();
			if (status === "granted") {
				const currentPosition = await getCurrentPositionAsync({});
				setLocationUser(currentPosition);
			} else {
				console.log("Location permission denied");
			}
		}
		requestPermission();
	}, []);

	useEffect(() => {
		const fetchData = async () => {
			try {
				const [positions, arrDevices] = await Promise.all([
					getPositionsVehicles(),
					getDevices()
				]);

				const allPositions = positions.map((pos: PositionData) => {
					const device = arrDevices.find((deviceItem: VehicleData) => deviceItem.id === pos.deviceId);
					return {
						...pos,
						...device,
						attributes: pos.attributes,
						attributesDevice: device.attributes,
						deviceId: device.id,
						vehiclePlate: device.attributes.vehiclePlate
					};
				});

				if (arrDevices.length <= 1) {
					setViewNameOnMap(true);
				}
				setLocationData(allPositions);
			} catch (error) {
				console.error('Ocorreu um erro ao buscar dados: ', error);
			} finally {
				setLoading(false);
			}
		};

		fetchData();

		const interval = setInterval(fetchData, 10000);
		return () => clearInterval(interval);
	}, []);

	useEffect(() => {
		const watcher = watchPositionAsync(
			{
				accuracy: LocationAccuracy.Highest,
				timeInterval: 1000,
				distanceInterval: 1,
			},
			(response) => {
				setLocationUser(response);
			}
		);
	}, []);

	const handleMarkerPress = (location: PositionData) => {
		setSelectedMarker(location);
		setViewNameOnMap(true);
	};

	const onMarkerPress = (coordinate: any) => {
		setRegion({
			...coordinate,
			latitudeDelta: 0.01,
			longitudeDelta: 0.01,
		});
		setHandlePress(true)
			};

	const handleCloseModal = () => {
		setSelectedMarker(null);
	};

	const sendCommandBlock = async (deviceId: string | number, commandBlock = 'engineResume') => {
		const data = {
			attributes: {},
			deviceId: deviceId,
			type: commandBlock,
		};
		const response = await fetch(`/api/commands/send`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(data),
		});
	}

	const handleBlock = (deviceId: string | number) => {
		Alert.alert(
			'Atenção!!!',
			'Deseja realmente bloquear a ignição deste veículo?',
			[
				{
					text: 'Enviar comando',
					onPress: () => {
						sendCommandBlock(deviceId, "engineStop")
						Alert.alert('Comando enviado!')
						handleCloseModal();
					},
				},
				{
					text: 'Cancelar',
					onPress: () => {
						handleCloseModal();
					},
				},
			]
		);
	};

	const handleUnblock = (deviceId: string | number) => {
		sendCommandBlock(deviceId, "engineResume")
		handleCloseModal();
	};

	const formatDateTime = (date: Date) => {
		return format(date, 'dd/MM/yyyy HH:mm', {
			timeZone: 'America/Sao_Paulo',
		});
	};

	const onRegionChangeComplete = (region: { latitudeDelta: number }) => {
		if (region.latitudeDelta < 0.8) {
			setViewNameOnMap(true);
		} else {
			setViewNameOnMap(false);
		}
	};

	const handleMapLongPress = (coordinate: { latitude: number, longitude: number }, markerId: string|number) => {
		const newGeofence = {
			center: coordinate,
			radius: 100,
		};
		setGeofences(prevGeofences => ({
			...prevGeofences,
			[markerId]: newGeofence,
		}));
	};

	const handleRemoveGeofence = (markerId: string | number) => {
		setGeofences(prevGeofences => {
			const newGeofences = { ...prevGeofences };
			delete newGeofences[markerId];
			return newGeofences;
		});
	};

	const calculateZoom = (markers: PositionData[]) => {

		let minLat = markers[0].latitude;
		let maxLat = markers[0].latitude;
		let minLng = markers[0].longitude;
		let maxLng = markers[0].longitude;


		if (markers.length === 0) {
			return {
				center: {
					latitude: -19.34009833333333,
					longitude: -40.05924777777778,
				},
				latitudeDelta: 0.1,
				longitudeDelta: 0.1,
			};
		} else if (markers.length === 1){
			return {
				center: {
					latitude: minLat,
					longitude: minLng,
				},
				latitudeDelta: 0.015,
				longitudeDelta: 0.015,
			};
		}

		markers.forEach(marker => {
			minLat = Math.min(minLat, marker.latitude);
			maxLat = Math.max(maxLat, marker.latitude);
			minLng = Math.min(minLng, marker.longitude);
			maxLng = Math.max(maxLng, marker.longitude);
		});

		const latitudeDelta = Math.abs(maxLat - minLat) * 1.5; 
		const longitudeDelta = Math.abs(maxLng - minLng) * 1.5; 

		const center = {
			latitude: (minLat + maxLat) / 2,
			longitude: (minLng + maxLng) / 2,
		};

		return {
			center,
			latitudeDelta,
			longitudeDelta,
		};
	};

	const addGeofence = async (position:PositionData) => {
		const { longitude, latitude, deviceId } = position;
		const radius = 100;
		const options = { units: "meters" };
		const circle = turf.circle([longitude, latitude], radius, options);

		const polygonCoordinates = circle.geometry.coordinates[0]
		.map((coord:any) => coord.join(" ").split(" ").reverse().join(" "))
		.join(", ");
		const polygonString = `POLYGON ((${polygonCoordinates}))`;

		const geofenceToSave = {
			attributes: {},
			calendarId: 0,
			name: `device-safety-area-${deviceId}`,
			description: null,
			area: polygonString,
		};

		try {
			const response = await fetch("https://painel.rastremov.com.br/api/geofences", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(geofenceToSave),
			});

				if (!response.ok) {
					throw new Error("Failed to save geofence");
				} else {
				const updatedDevices = locationData.map((device) =>
					device.deviceId === deviceId
					? { ...device, attributes: { ...device.attributes, securityAreaGeofence: "sim" } }
					: device

			);
			handleMapLongPress({
				latitude: position.latitude,
				longitude: position.longitude
			}, position.id);
			handleCloseModal();
			setLocationData(updatedDevices);
		}
		} catch (error) {
			Alert.alert('A área segura não foi configurada corretamente.');
			console.error("Error saving geofence:", error);
		}
	};

	const removeSecurityArea = async (device:PositionData) => {
		try {
			const response = await fetch(`https://painel.rastremov.com.br/api/geofences`);
			const data = await response.json();

			const areaIdRemove = data.find((item:any) => item.name === `device-safety-area-${device.deviceId}`).id;

			const resp = await fetch(`https://painel.rastremov.com.br/api/geofences/${areaIdRemove}`, {
				method: "DELETE",
				headers: {
					"Content-Type": "application/json",
				}
			});

				if (resp.ok) {
				const updatedDevices = locationData.map((dev) =>
					dev.deviceId === device.deviceId
					? { ...dev, attributes: { ...dev.attributes, securityAreaGeofence: "nao" } }
					: dev
				);
				handleRemoveGeofence(device.id);
				handleCloseModal();
				setLocationData(updatedDevices);
				} else {
					throw new Error("Failed to remove geofence");
				}
		} catch (error) {
			console.error("Error removing geofence:", error);
			Alert.alert('Ocorreu um erro ao remover área segura.')
		}
	};

	useEffect(() => {
		if (!initialLoadComplete && locationData.length > 0) {
			const { center, latitudeDelta, longitudeDelta } = calculateZoom(locationData);
			setRegion({
				...center,
				latitudeDelta,
				longitudeDelta,
			});
			setInitialLoadComplete(true);
		}
		}, [locationData]);


	return loading ? (<Loading />) : (
		<View style={mapStyles.container}>
			{locationData.length > 0 && (
				<MapView
					style={mapStyles.map}
					initialRegion={{
						latitude: region.latitude,
						longitude: region.longitude,
						latitudeDelta: region.latitudeDelta,
						longitudeDelta: region.longitudeDelta,
					}}
					onRegionChangeComplete={onRegionChangeComplete}
					region={handlePress ? region : {
						latitude: region.latitude,
						longitude: region.longitude,
						latitudeDelta: region.latitudeDelta,
						longitudeDelta: region.longitudeDelta,
					}}
				>
					{locationData.map((location, index) => (
						<React.Fragment key={index}>
							<Marker
								coordinate={{
									latitude: location.latitude,
									longitude: location.longitude,
								}}
								onPress={() => {
									handleMarkerPress(location);
									onMarkerPress({
										latitude: location.latitude,
										longitude: location.longitude,
									});
								}}
							>
								<View style={mapStyles.markerContainer}>
									<Image
										source={iconMarker}
										style={{ width: 33, height: 33 }}
										resizeMode="contain"
									/>
									{viewNameOnMap && Platform.OS === "ios" && (<Text style={mapStyles.markerText}>
										{location.name}
									</Text>)}
								</View>
							</Marker>
							{geofences[location.id] && (
								<Circle
									key={`circle_${index}`}
									center={geofences[location.id].center}
									radius={geofences[location.id].radius}
									strokeColor="#F00"
									fillColor="rgba(255,0,0,0.2)"
									strokeWidth={2}
								/>
							)}
						</React.Fragment>
					))}
				</MapView>
			)}

			<Modal
				animationType="slide"
				transparent={true}
				visible={selectedMarker !== null}
				onRequestClose={handleCloseModal}
			>
				<View style={mapStyles.modalContainer}>
					<View style={mapStyles.modalContent}>
						{selectedMarker && (
							<>
								<Text style={mapStyles.modalTitle}>
									{selectedMarker.name}
								</Text>
								<Text style={mapStyles.modalText}>
								{selectedMarker.vehiclePlate}
								</Text>
								<Text style={mapStyles.modalText}>
									Ignição {selectedMarker.attributesDevice.statusBlocked}
								</Text>
								<Text style={mapStyles.modalText}>
									{formatDateTime(selectedMarker.deviceTime)}
								</Text>

								{geofences[selectedMarker.id] ? (
									<TouchableOpacity
										style={mapStyles.buttonRemoveGeofence}
										onPress={() => {
											removeSecurityArea(selectedMarker);
										}}
									>
										<Text style={mapStyles.buttonText}>Remover área segura</Text>
									</TouchableOpacity>
								) : (<TouchableOpacity
									style={mapStyles.buttonSecurityArea}
									onPress={() => {
										addGeofence(selectedMarker);
									}}
								>
									<Text style={mapStyles.buttonText}>Criar área segura</Text>
								</TouchableOpacity>)}
								<TouchableOpacity
									style={mapStyles.buttonBlock}
									onPress={() => {
										handleBlock(selectedMarker.deviceId);
									}}
								>
									<Text style={mapStyles.buttonText}>Bloquear Ignição</Text>
								</TouchableOpacity>
								<TouchableOpacity
									style={mapStyles.buttonUnblock}
									onPress={() => {
										handleUnblock(selectedMarker.deviceId);
									}}
								>
									<Text style={mapStyles.buttonText}>Desbloquear Ignição</Text>
								</TouchableOpacity>
							</>
						)}
						<TouchableOpacity
							style={mapStyles.closeButton}
							onPress={handleCloseModal}
						>
							<Text style={mapStyles.closeButtonText}>Fechar</Text>
						</TouchableOpacity>
					</View>
				</View>
			</Modal>
		</View>
	);
};

export default MapScreen;
