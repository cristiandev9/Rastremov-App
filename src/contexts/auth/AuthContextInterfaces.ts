export interface User {
	id: string;
	name: string;
	email: string;
	attributes?: Record<string, any>;
}

export interface OverdueInfo {
	value: number;
	dueDate: string;
	invoiceUrl?: string;
	bankSlipUrl?: string;
}

export interface AuthContextType {
	auth: boolean;
	user: User | null;
	errorAuth: boolean;
	mustChangePassword: boolean;
	isBlocked: boolean;
	overdueInfo: OverdueInfo | null;
	signIn: ({ email, password }: { email: string; password: string }) => Promise<void>;
	signOut: () => void;
	setErrorAuth: (error: boolean) => void;
	changePassword: (newPassword: string) => Promise<void>;
	retryPaymentCheck: () => Promise<void>;
}
