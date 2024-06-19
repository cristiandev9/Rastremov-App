export interface AuthContextType {
	signIn: ({ email, password }: { email: string; password: string }) => Promise<void>;
	errorAuth: boolean | null;
	setErrorAuth: (error: string | null | boolean) => void;
}
