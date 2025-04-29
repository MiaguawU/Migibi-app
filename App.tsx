// App.tsx
import React from 'react';
import { useFonts } from 'expo-font';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Omg from './Front/omg';
import Plan from './Front/plan';
import Perfil from './Front/perfil';
import Reg from './Front/Reg';
import Iniciar from './Front/iniciar'
import Hoy from './Front/hoy';
import Recetas from './Front/recetas';
import Refri from './Front/refri';
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
        <Stack.Screen name="Iniciar" component={Iniciar} />
        <Stack.Screen name="Perfil" component={Perfil} />
        <Stack.Screen name="Reg" component={Reg} />
        <Stack.Screen name="Hoy" component={Hoy} />
        <Stack.Screen name="Recetas" component={Recetas} />
        <Stack.Screen name="Refri" component={Refri} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}