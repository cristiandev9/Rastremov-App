import React from 'react';
import { View } from 'react-native';
import LottieView from 'lottie-react-native';
import { loadingStyles } from './loadingStyles';

const Loading: React.FC = () => {
  return (
    <View style={loadingStyles.container}>
      <LottieView
        source={require('../../../assets/loading.json')}
        autoPlay
        loop
        style={loadingStyles.lottie}
      />
    </View>
  );
};

export default Loading;
