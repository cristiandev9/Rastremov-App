import { StyleSheet } from 'react-native';
export const accountStyles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		padding: 16,
	},
	userName: {
		fontSize: 24,
		marginBottom: 8,
		textAlign: 'center',
	},
	email: {
		fontSize: 16,
		marginBottom: 8,
		textAlign: 'center',
	},
	deviceCount: {
		fontSize: 16,
		marginBottom: 16,
		textAlign: 'center',
	},
	logoutButton: {
		backgroundColor: '#FF0000',
		padding: 12,
		borderRadius: 8,
		alignItems: 'center',
		marginTop: 16,
	},
	logoutButtonText: {
		color: '#FFFFFF',
		fontSize: 16,
	},
	errorText: {
		fontSize: 16,
		color: 'red',
	},
});