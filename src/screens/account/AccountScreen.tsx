import React, { useContext } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { AuthContext } from '../../contexts/auth/AuthContext';
import { accountStyles } from './AccountScreenStyles';

const AccountScreen: React.FC = () => {
	const { user, signOut } = useContext(AuthContext);

	const handleLogout = () => {
		signOut();
	};

	return (
		<View style={accountStyles.container}>
			{user ? (
				<>
					<Text style={accountStyles.userName}>{user.name}</Text>
					<Text style={accountStyles.email}>{user.email}</Text>
					<TouchableOpacity style={accountStyles.logoutButton} onPress={handleLogout}>
						<Text style={accountStyles.logoutButtonText}>Sair desta conta</Text>
					</TouchableOpacity>
				</>
			) : (
				<></>
			)}
		</View>
	);
};

export default AccountScreen;
