import React, { useContext, useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, Image } from 'react-native';
import { AuthContext } from '../../contexts/auth/AuthContext';
import { loginStyles } from './LoginScreenStyles';
import { AuthContextType } from './LoginScreenInterfaces';

const logo = require('../../../assets/logo.png');

const LoginScreen: React.FC = () => {
	const { signIn, errorAuth, setErrorAuth } = useContext(AuthContext) as AuthContextType;
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');

	useEffect(() => {
		if (errorAuth) {
			setTimeout(() => {
				setErrorAuth(false);
			}, 4000);
		}
	}, [errorAuth]);

	const handleLogin = () => {
		signIn({ email, password });
	};

	const handleForgotPassword = () => {
		Alert.alert('Estamos trabalhando para ajustar essa funcionalidade. Entre em contato com a Rastremov.')
	};
	const handleNewUser = () => {
		Alert.alert('Estamos trabalhando para ajustar essa funcionalidade. Entre em contato com a Rastremov.')
	};

	return (
		<View style={loginStyles.container}>
			<TouchableOpacity onPress={handleLogin} style={{width: '100%', height:200, marginBottom: -30, marginTop: -80}}>
				<Image source={logo} style={loginStyles.logo} />
			</TouchableOpacity>
			<TextInput
				style={loginStyles.input}
				placeholder="E-mail"
				value={email}
				onChangeText={setEmail}
				placeholderTextColor="#ccc"
				autoCapitalize="none" 
				autoCorrect={false}
			/>
			<TextInput
				style={loginStyles.input}
				placeholder="Senha"
				value={password}
				onChangeText={setPassword}
				secureTextEntry
				placeholderTextColor="#ccc"
			/>
			<TouchableOpacity onPress={handleLogin} style={{width: '100%'}}>
				<Text style={loginStyles.textForgotPassword} onPress={handleForgotPassword}>Esqueci minha senha</Text>
			</TouchableOpacity>
			{errorAuth && <Text style={loginStyles.error}>E-mail ou senha incorretos.</Text>}

			<TouchableOpacity style={loginStyles.button} onPress={handleLogin}>
				<Text style={loginStyles.buttonText}>Entrar</Text>
			</TouchableOpacity>

			<TouchableOpacity onPress={handleNewUser}>
				<Text style={loginStyles.text}>Ainda não tem cadastro? <Text style={loginStyles.textNewUser}>Cadastrar agora</Text></Text>
			</TouchableOpacity>

			{/* <Text style={loginStyles.textTerms} onPress={handleForgotPassword}>Ao acessar você concorda com nossos termos e serviços</Text> */}
		</View>
	);
};



export default LoginScreen;
