// App.tsx
import React from 'react';
import { useFonts } from 'expo-font';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Omg from './omg';
import Plan from './plan';
import Perfil from './perfil';
import Reg from './Reg';
import Hoy from './hoy';
import Recetas from './recetas';
import Refri from './refri';
import { RootStackParamList } from './types';

const Stack = createStackNavigator<RootStackParamList>();

export default function App() {
  const [fontsLoaded] = useFonts({
    antoutline: require('@ant-design/icons-react-native/fonts/antoutline.ttf'),
    'Jomhuria': require('./assets/fonts/Jomhuria-Regular.ttf'),
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Omg">
        <Stack.Screen name="Omg" component={Omg} />
        <Stack.Screen name="Plan" component={Plan} />
        <Stack.Screen name="Perfil" component={Perfil} />
        <Stack.Screen name="Reg" component={Reg} />
        <Stack.Screen name="Hoy" component={Hoy} />
        <Stack.Screen name="Recetas" component={Recetas} />
        <Stack.Screen name="Refri" component={Refri} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}