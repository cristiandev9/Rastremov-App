import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getSessionWithToken, login } from "../../services/api-v1";
import { AuthContextType, User } from "./AuthContextInterfaces";

export const AuthContext = createContext<AuthContextType>({
	auth: false,
	user: null,
	errorAuth: false,
	signIn: async ({ email, password }) => {},
	signOut: () => {},
	setErrorAuth: (error: boolean) => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const [user, setUser] = useState<User | null>(null);
	const [errorAuth, setErrorAuth] = useState<boolean>(false);

	useEffect(() => {
		loadStoredData();
	}, []);

	async function loadStoredData() {
		try {
			const [storagedToken, storagedUser] = await Promise.all([
				AsyncStorage.getItem('token'),
				AsyncStorage.getItem('user')
			]);

			if (storagedUser && storagedToken) {
				const parsedUser: User = JSON.parse(storagedUser);
				await getSessionWithToken(storagedToken);
				setUser(parsedUser);
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

			setUser(userData);

			await AsyncStorage.setItem('user', JSON.stringify(userData));

			setErrorAuth(false);
		} catch (error) {
			console.error("Login falhou:", error);
			setErrorAuth(true);
		}
	}

	function signOut() {
		setUser(null);
		AsyncStorage.removeItem('user');
		AsyncStorage.removeItem('token');
	}

	return (
		<AuthContext.Provider
			value={{
				auth: !!user,
				user,
				errorAuth,
				signIn,
				signOut,
				setErrorAuth,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
};
