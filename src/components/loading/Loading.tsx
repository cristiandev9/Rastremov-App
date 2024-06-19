import React from 'react';
import { View } from 'react-native';
import LottieView from 'lottie-react-native';
import { StyleSheet } from "react-native";

export const loadingStyles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#000',
    },
    lottie: {
      width: 150,
      height: 150,
    },
  });

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
