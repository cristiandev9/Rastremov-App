import React, { useContext, useState } from 'react';
import { View, Text, TouchableOpacity, Linking, ActivityIndicator, StyleSheet } from 'react-native';
import { AuthContext } from '../../contexts/auth/AuthContext';

const BlockedScreen: React.FC = () => {
	const { overdueInfo, retryPaymentCheck, signOut } = useContext(AuthContext);
	const [checking, setChecking] = useState(false);

	const paymentLink = overdueInfo?.invoiceUrl || overdueInfo?.bankSlipUrl;
	const value = overdueInfo?.value
		? overdueInfo.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
		: null;

	const handleRetry = async () => {
		setChecking(true);
		await retryPaymentCheck();
		setChecking(false);
	};

	const handleOpenPayment = () => {
		if (paymentLink) Linking.openURL(paymentLink);
	};

	return (
		<View style={styles.container}>
			<Text style={styles.icon}>🔒</Text>
			<Text style={styles.title}>Acesso suspenso</Text>
			<Text style={styles.description}>
				Identificamos um pagamento em atraso na sua conta. Para continuar usando o rastreamento, regularize sua situação.
			</Text>

			{value && (
				<View style={styles.valueBox}>
					<Text style={styles.valueLabel}>Valor em aberto</Text>
					<Text style={styles.value}>{value}</Text>
				</View>
			)}

			{paymentLink && (
				<TouchableOpacity style={styles.payButton} onPress={handleOpenPayment}>
					<Text style={styles.payButtonText}>Pagar agora</Text>
				</TouchableOpacity>
			)}

			<TouchableOpacity
				style={[styles.retryButton, checking && styles.retryButtonDisabled]}
				onPress={handleRetry}
				disabled={checking}
			>
				{checking ? (
					<ActivityIndicator color="#fff" size="small" />
				) : (
					<Text style={styles.retryButtonText}>Já paguei — verificar acesso</Text>
				)}
			</TouchableOpacity>

			<TouchableOpacity onPress={signOut}>
				<Text style={styles.logoutText}>Sair da conta</Text>
			</TouchableOpacity>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#000',
		alignItems: 'center',
		justifyContent: 'center',
		paddingHorizontal: 32,
	},
	icon: {
		fontSize: 56,
		marginBottom: 16,
	},
	title: {
		color: '#fff',
		fontSize: 24,
		fontWeight: 'bold',
		marginBottom: 12,
		textAlign: 'center',
	},
	description: {
		color: '#aaa',
		fontSize: 15,
		textAlign: 'center',
		lineHeight: 22,
		marginBottom: 28,
	},
	valueBox: {
		backgroundColor: '#1a1a1a',
		borderRadius: 12,
		paddingVertical: 16,
		paddingHorizontal: 32,
		alignItems: 'center',
		marginBottom: 28,
		width: '100%',
	},
	valueLabel: {
		color: '#888',
		fontSize: 13,
		marginBottom: 4,
	},
	value: {
		color: '#ff4444',
		fontSize: 28,
		fontWeight: 'bold',
	},
	payButton: {
		backgroundColor: '#22c55e',
		borderRadius: 12,
		paddingVertical: 16,
		width: '100%',
		alignItems: 'center',
		marginBottom: 12,
	},
	payButtonText: {
		color: '#fff',
		fontSize: 16,
		fontWeight: 'bold',
	},
	retryButton: {
		backgroundColor: '#333',
		borderRadius: 12,
		paddingVertical: 16,
		width: '100%',
		alignItems: 'center',
		marginBottom: 24,
	},
	retryButtonDisabled: {
		opacity: 0.6,
	},
	retryButtonText: {
		color: '#fff',
		fontSize: 15,
	},
	logoutText: {
		color: '#555',
		fontSize: 14,
	},
});

export default BlockedScreen;
