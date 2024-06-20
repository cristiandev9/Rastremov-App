export interface User {
	id: string;
	name: string;
	email: string;
}

export interface AuthContextType {
	auth: boolean;
	user: User | null;
	errorAuth: boolean;
	signIn: ({ email, password }: { email: string; password: string }) => Promise<void>;
	signOut: () => void;
	setErrorAuth: (error: boolean) => void;
}
