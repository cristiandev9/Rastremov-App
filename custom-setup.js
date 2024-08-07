import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

// Transforma a raiz do aplicativo em GestureHandlerRootView
const appWithGestureHandler = () => (
  <GestureHandlerRootView>
    <App />
  </GestureHandlerRootView>
);

// Registra o componente raiz do aplicativo
AppRegistry.registerComponent(appName, () => appWithGestureHandler);
