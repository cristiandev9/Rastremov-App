import { StyleSheet } from "react-native";

export const loginStyles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: '#000',
		padding: 16,
		
	},
	error: {
		color: 'red',
		marginBottom: 5,
		textAlign: 'center',
		marginTop:30
	},
	input: {
		height: 50,
		width: '100%',
		borderColor: '#282828',
		borderWidth: 1,
		marginBottom: 16,
		paddingLeft: 20,
		paddingHorizontal: 8,
		backgroundColor: '#282828',
		color: '#fff',
		borderRadius: 30,
	},
	button: {
		marginTop: 25,
		width: '100%',
		backgroundColor: '#1EA765',
		padding: 14,
		alignItems: 'center',
		borderRadius: 30,
	},
	buttonText: {
		fontSize: 18,
		color: '#fff',
	},
	text:{
		color:'#fff',
		marginTop: 35,
	},
	textForgotPassword:{
		color:'#fff',
		position: 'absolute',
		right: 5,
		fontSize:12,
		top:-4
	},
	textTerms:{
		textAlign: 'center',
		position: 'absolute',
		bottom: 50,
		color:'#fff'
	},
	textNewUser:{
		color: "#1EA765",
		fontWeight: 'bold'
	},
	logo: {
		width: "100%",
		height: 200,
		resizeMode: 'contain',
	},
});