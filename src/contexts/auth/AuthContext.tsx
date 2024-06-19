import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getTokenUser, login } from "../../services/api-v1";
import { AuthContextType, User } from "./AuthContextInterfaces";

export const AuthContext = createContext<AuthContextType>({
	auth: false,
	user: null,
	token: null,
	errorAuth: false,
	signIn: async ({ email, password }) => {},
	signOut: () => {},
	setErrorAuth: (error: boolean) => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const [user, setUser] = useState<User | null>(null);
	const [token, setToken] = useState<string | null>(null);
	const [errorAuth, setErrorAuth] = useState<boolean>(false);

	useEffect(() => {
		loadStoredData();
	}, []);

	async function loadStoredData() {
		try {
			const storagedUser = await AsyncStorage.getItem('user');
			const storagedToken = await AsyncStorage.getItem('token');

			if (storagedUser && storagedToken) {
				const parsedUser: User = JSON.parse(storagedUser);
				setUser(parsedUser);
				setToken(storagedToken);
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
			const responseGetToken = await getTokenUser();

			const userData: User = responseLogin;
			const token: string = responseGetToken;

			setUser(userData);
			setToken(token);

			await AsyncStorage.setItem('user', JSON.stringify(userData));
			await AsyncStorage.setItem('token', token);

			setErrorAuth(false);
		} catch (error) {
			console.error("Login falhou:", error);
			setErrorAuth(true);
		}
	}

	function signOut() {
		setUser(null);
		setToken(null);
		AsyncStorage.removeItem('user');
		AsyncStorage.removeItem('token');
	}

	return (
		<AuthContext.Provider
			value={{
				auth: !!user,
				user,
				token,
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
