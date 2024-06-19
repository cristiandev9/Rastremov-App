import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { FontAwesome } from '@expo/vector-icons';
import MapScreen from './src/components/map/MapScreen';
import AccountScreen from './src/components/account/AccountScreen';
import LoginScreen from './src/components/auth/LoginScreen';
import { AuthProvider, AuthContext } from './src/contexts/AuthContext';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const App: React.FC = () => {
  return (
    <AuthProvider>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
};

const AppNavigator: React.FC = () => {
  const { auth } = React.useContext(AuthContext);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {auth ? (
        <Stack.Screen name="Main" component={MainTabNavigator} />
      ) : (
        <Stack.Screen name="Login" component={LoginScreen} />
      )}
    </Stack.Navigator>
  );
};

const MainTabNavigator: React.FC = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color }) => {
        if (route.name === 'Mapa') {
          return <FontAwesome name={focused ? 'map' : 'map-o'} size={25} color={color} />;
        } else if (route.name === 'Conta') {
          return <FontAwesome name={focused ? 'user' : 'user-o'} size={25} color={color} />;
        }
      },
      tabBarStyle: {
        backgroundColor: 'black',
        borderTopColor: 'black',
        paddingTop: 20,
      },
      tabBarActiveTintColor: 'white',
      tabBarInactiveTintColor: 'gray',
      headerStyle: {
        backgroundColor: 'black',
        shadowColor: 'transparent',
        elevation: 0,
      },
      headerTintColor: 'white',
    })}
  >
    <Tab.Screen
      name="Mapa"
      component={MapScreen}
      options={{
        headerTitle: 'Mapa',
        tabBarLabel: () => null,
      }}
    />
    <Tab.Screen
      name="Conta"
      component={AccountScreen}
      options={{
        headerTitle: 'Conta',
        tabBarLabel: () => null,
      }}
    />
  </Tab.Navigator>
);

export default App;
