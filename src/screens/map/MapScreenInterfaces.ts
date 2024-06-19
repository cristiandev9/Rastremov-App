export interface Attributes {
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

export interface Network {
	cellTowers?: any[];
	considerIp: boolean;
	radioType: string;
}

export interface PositionData {
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

export interface VehicleData {
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