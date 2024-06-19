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
import MapView, { Marker } from "react-native-maps";
import {
	requestForegroundPermissionsAsync,
	getCurrentPositionAsync,
	watchPositionAsync,
	LocationObject,
	LocationAccuracy,
} from "expo-location";
import axios from "axios";
import { mapStyles } from "./mapStyles";
import { format } from "date-fns-tz";
import { AuthContext } from "../../contexts/AuthContext";
import Loading from "../loading/Loading";

const iconMarker = require("../../../assets/connected-marker.png");

interface Attributes {
	batteryLevel?: number;
	blocked?: boolean;
	charge?: boolean;
	distance: number;
	hours: number;
	ignition: boolean;
	motion: boolean;
	rssi?: number;
	status?: number;
	totalDistance: number;
	odometer?: number;
	sat?: number;
}

interface Network {
	cellTowers?: any[];
	considerIp: boolean;
	radioType: string;
}

interface PositionData {
	accuracy: number;
	address: string | null;
	altitude: number;
	attributes: Attributes;
	course: number;
	deviceId: number;
	deviceTime: Date;
	fixTime: string;
	geofenceIds: any[] | null;
	id: number;
	latitude: number;
	longitude: number;
	network: Network | null;
	outdated: boolean;
	protocol: string;
	serverTime: string;
	speed: number;
	valid: boolean;
	name: string;
	vehiclePlate: string
	attributesDevice: any
}

interface VehicleData {
	id: number;
	groupId: number;
	calendarId: number;
	name: string;
	attributes: Attributes;
	uniqueId: number;
	deviceTime: string;
	status: string;
	lastUpdate: string;
	positionId: number;
	phone: string;
	model: string | null;
	contact: string | null;
	category: string | null;
	disabled: boolean;
	expirationTime: string | null;
}

const MapScreen: React.FC = () => {

	const { token } = React.useContext<any>(AuthContext);
	const [locationUser, setLocationUser] = useState<LocationObject | null>(null);
	const [locationData, setLocationData] = useState<PositionData[]>([]);
	const [loading, setLoading] = useState(true);
	const [viewNameOnMap, setViewNameOnMap] = useState(false);
	const [selectedMarker, setSelectedMarker] = useState<PositionData | null>(
		null
	);

	const [region, setRegion] = useState({
		latitude: -19.34009833333333,
		longitude:-40.05924777777778,
		latitudeDelta: 0.0922,
		longitudeDelta: 0.0421,
			});
	const [handlePress, setHandlePress] = useState(false);

		const onMarkerPress = (coordinate: any) => {
		setRegion({
			...coordinate,
			latitudeDelta: 0.01,
			longitudeDelta: 0.01,
		});
		setHandlePress(true)
			};


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
					getPositionsVehicles(token),
					getDevices(token)
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
				console.error('Error fetching data', error);
			} finally {
				setLoading(false);
			}
		};

		fetchData();

		const interval = setInterval(fetchData, 10000);
		return () => clearInterval(interval);
	}, [token]);


	async function getPositionsVehicles(token: string) {
		try {
			const response = await axios.get(
				`https://painel.rastremov.com.br/api/positions?token=${token}`
			);
			return response.data;
		} catch (error) {
			console.error("Failed to fetch data:", error);
			throw error;
		}
	}

	async function getDevices(token: string) {
		try {
			const response = await axios.get(
				`https://painel.rastremov.com.br/api/devices?token=${token}`
			);
			return response.data;
		} catch (error) {
			console.error("Failed to fetch data:", error);
			throw error;
		}
	}

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

			console.log(response);
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
		])
	};

	const handleUnblock = (deviceId: string | number) => {
		sendCommandBlock(deviceId, "engineResume")
		handleCloseModal();
	};

	const formatDateTime = (date: Date) => {
		// const addedDate = addHours(date, -3);
		return format(date, 'dd/MM/yyyy HH:mm', {
			timeZone: 'America/Sao_Paulo',
		});
	};

	const onRegionChangeComplete = (region: {latitudeDelta:number}) => {
		if (region.latitudeDelta < 0.8) {
			setViewNameOnMap(true);
		} else {
			setViewNameOnMap(false);
		}
	};

	return loading ? (<Loading />) : (
		<View style={mapStyles.container}>
			{locationData.length > 0 && (
				<MapView
					style={mapStyles.map}
					initialRegion={{
						latitude: locationData[0].latitude,
						longitude:locationData[0].longitude,
						latitudeDelta: locationData.length >= 2 ? 5 : 0.005,
						longitudeDelta: locationData.length >= 2 ? 5 : 0.005,
					}}
					onRegionChangeComplete={onRegionChangeComplete}
					region={handlePress ? region : {
						latitude: locationData[0].latitude,
						longitude:locationData[0].longitude,
						latitudeDelta: locationData.length >= 2 ? 5 : 0.005,
						longitudeDelta: locationData.length >= 2 ? 5 : 0.005,
					}}
				>
					{locationData.map((location, index) => (
						<Marker
							key={index}
							coordinate={{
								latitude: location.latitude,
								longitude: location.longitude,
							}}
							onPress={() => {handleMarkerPress(location); onMarkerPress({latitude: location.latitude, longitude: location.longitude})}}
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
								<TouchableOpacity
									style={mapStyles.buttonBlock}
									onPress={()=>{handleBlock(selectedMarker.deviceId)}}
								>
									<Text style={mapStyles.buttonText}>Bloquear</Text>
								</TouchableOpacity>
								<TouchableOpacity
									style={mapStyles.buttonUnblock}
									onPress={()=>{handleUnblock(selectedMarker.deviceId)}}
								>
									<Text style={mapStyles.buttonText}>Desbloquear</Text>
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
