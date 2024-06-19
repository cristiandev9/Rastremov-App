import React, { createContext, useState, useEffect } from "react";
import axios from "axios";
import dayjs from "dayjs";
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  auth: boolean;
  user: User | null;
  token: string | null;
  errorAuth: boolean;
  signIn: ({ email, password }: { email: string; password: string }) => Promise<void>;
  signOut: () => void;
  setErrorAuth: (error: boolean) => void;
}

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
      }
    } catch (error) {
      console.error("Failed to load storage data:", error);
    }
  }

  async function signIn({ email, password }: { email: string; password: string }) {
    try {
      const responseLogin = await axios.post(
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

      const expirationDate = dayjs().add(6, 'month').toISOString();

      const responseGetToken = await axios.post(
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

      const token = responseGetToken.data;
      setToken(token);

      const userData: User = responseLogin.data;
      setUser(userData);

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
