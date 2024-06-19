import axios from "axios";
import dayjs from "dayjs";

export async function getPositionsVehicles(token: string) {
	if (!token) return;
	try {
		const response = await axios.get(
			`https://painel.rastremov.com.br/api/positions?token=${token}`
		);
		return response.data;
	} catch (error) {
		console.error("Ocorreu um erro ao buscar posições de dispositivos:", error);
		throw error;
	}
}

export async function getDevices(token: string) {
	if (!token) return;
	try {

		const response = await axios.get(
			`https://painel.rastremov.com.br/api/devices?token=${token}`
		);
		return response.data;
	} catch (error) {
		console.error("Ocorreu um erro ao buscar dispositivos:", error);
		throw error;
	}
}

export async function login(email: string, password: string) {
	const response = await axios.post(
		"https://painel.rastremov.com.br/api/session",
		new URLSearchParams({
			email: email,
			password: password,
		}).toString(),
		{
			headers: {
				"Content-Type": "application/x-www-form-urlencoded",
			},
		}
		);
		return response.data;
}
export async function getTokenUser() {
	const expirationDate = dayjs().add(6, 'month').toISOString();
	const response = await axios.post(
		"https://painel.rastremov.com.br/api/session/token",
		new URLSearchParams({
			expiration: expirationDate,
		}).toString(),
		{
			headers: {
				"Content-Type": "application/x-www-form-urlencoded",
			},
		}
		);

		return response.data;

}
