import axios from "axios";
import dayjs from "dayjs";

export async function getPositionsVehicles() {
	try {
		const response = await axios.get(
			`https://painel.rastremov.com.br/api/positions`
		);
		return response.data;
	} catch (error) {
		console.error("Ocorreu um erro ao buscar posições de dispositivos:", error);
		throw error;
	}
}

export async function getDevices() {
	try {

		const response = await axios.get(
			`https://painel.rastremov.com.br/api/devices`
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

export async function getSessionWithToken(token: string) {
	if (!token) return;
	try {

		const response = await axios.get(
			`https://painel.rastremov.com.br/api/session?token=${token}`
		);

		return response.data;
	} catch (error) {
		console.error("Ocorreu um erro ao pegar sessão:", error);
		throw error;
	}
}