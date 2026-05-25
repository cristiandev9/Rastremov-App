import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getSessionWithToken, login, checkOverdue } from "../../services/api-v1";
import { AuthContextType, OverdueInfo, User } from "./AuthContextInterfaces";

const TRACCAR_BASE_URL = "https://painel.rastremov.com.br";

const isMustChangePassword = (u: User | null): boolean => {
	const v = u?.attributes?.mustChangePassword;
	return v === true || v === 'true';
};

interface AuthState {
	user: User | null;
	isBlocked: boolean;
	overdueInfo: OverdueInfo | null;
}

export const AuthContext = createContext<AuthContextType>({
	auth: false,
	user: null,
	errorAuth: false,
	mustChangePassword: false,
	isBlocked: false,
	overdueInfo: null,
	signIn: async ({ email, password }) => {},
	signOut: () => {},
	setErrorAuth: (error: boolean) => {},
	changePassword: async (_newPassword: string) => {},
	retryPaymentCheck: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const [state, setState] = useState<AuthState>({ user: null, isBlocked: false, overdueInfo: null });
	const [errorAuth, setErrorAuth] = useState<boolean>(false);

	useEffect(() => {
		loadStoredData();
	}, []);

	async function checkPayment(loggedUser: User): Promise<{ isBlocked: boolean; overdueInfo: OverdueInfo | null }> {
		const customerId = loggedUser.attributes?.customerBankID || loggedUser.attributes?.customerIdBank;
		if (!customerId) return { isBlocked: false, overdueInfo: null };
		const result = await checkOverdue(customerId);
		return {
			isBlocked: result.blocked,
			overdueInfo: result.overduePayment ?? null,
		};
	}

	async function loadStoredData() {
		try {
			const [storagedToken, storagedUser] = await Promise.all([
				AsyncStorage.getItem('token'),
				AsyncStorage.getItem('user')
			]);

			if (storagedUser && storagedToken) {
				const parsedUser: User = JSON.parse(storagedUser);
				const fresh = await getSessionWithToken(storagedToken);
				const currentUser = fresh ?? parsedUser;
				const { isBlocked, overdueInfo } = await checkPayment(currentUser);
				// Atualiza user + blocked em um único setState (evita race condition)
				setState({ user: currentUser, isBlocked, overdueInfo });
				if (fresh) await AsyncStorage.setItem('user', JSON.stringify(fresh));
			} else {
				signOut();
			}
		} catch (error) {
			console.log("Failed to load storage data:", error);
			signOut();
		}
	}

	async function signIn({ email, password }: { email: string; password: string }) {
		try {
			const responseLogin = await login(email, password);
			const userData: User = responseLogin;
			const { isBlocked, overdueInfo } = await checkPayment(userData);
			// Atualiza tudo junto — auth + isBlocked no mesmo render
			setState({ user: userData, isBlocked, overdueInfo });
			await AsyncStorage.setItem('user', JSON.stringify(userData));
			setErrorAuth(false);
		} catch (error) {
			console.error("Login falhou:", error);
			setErrorAuth(true);
		}
	}

	async function retryPaymentCheck() {
		if (!state.user) return;
		const { isBlocked, overdueInfo } = await checkPayment(state.user);
		setState(prev => ({ ...prev, isBlocked, overdueInfo }));
	}

	function signOut() {
		setState({ user: null, isBlocked: false, overdueInfo: null });
		AsyncStorage.removeItem('user');
		AsyncStorage.removeItem('token');
	}

	async function changePassword(newPassword: string) {
		if (!state.user) throw new Error('Sessão inválida.');
		const updatedUser = {
			...state.user,
			password: newPassword,
			attributes: { ...(state.user.attributes || {}), mustChangePassword: false },
		};
		const res = await fetch(`${TRACCAR_BASE_URL}/api/users/${state.user.id}`, {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(updatedUser),
		});
		if (!res.ok) {
			const text = await res.text().catch(() => '');
			throw new Error(text || 'Falha ao salvar a senha.');
		}
		const data: User = await res.json();
		setState(prev => ({ ...prev, user: data }));
		await AsyncStorage.setItem('user', JSON.stringify(data));
	}

	return (
		<AuthContext.Provider
			value={{
				auth: !!state.user,
				user: state.user,
				errorAuth,
				mustChangePassword: isMustChangePassword(state.user),
				isBlocked: state.isBlocked,
				overdueInfo: state.overdueInfo,
				signIn,
				signOut,
				setErrorAuth,
				changePassword,
				retryPaymentCheck,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
};
