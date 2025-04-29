import React, { useLayoutEffect } from 'react';
import { Button, WhiteSpace } from '@ant-design/react-native';
import { Image, ImageBackground, StyleSheet, View } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { RouteProp, useNavigation } from '@react-navigation/native';

type OmgScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Omg'>;

type Props = {
  navigation: OmgScreenNavigationProp;
  route: RouteProp<RootStackParamList, 'Omg'>;
};

export default function Omg({ navigation, route }: Props) {
  const nav = useNavigation<OmgScreenNavigationProp>();

  useLayoutEffect(() => {
    nav.setOptions({
      headerShown: false,
    });
  }, [nav]);

  return (
    <ImageBackground
      source={require('../img/FondoInicio.png')}
      style={styles.background}
    >
      <View style={styles.container}>
        <Image
          source={require('../img/IconoInicio.png')}
          style={styles.icon}
          resizeMode="contain"
        />
      </View>
      <View style={styles.buttonContainer}>
        <Button
          style={styles.button}
          onPress={() => navigation.navigate('Iniciar')} // Navega a la pantalla de Iniciar Sesión
        >
          Iniciar Sesión
        </Button>
        <WhiteSpace size="sm" />
        <Button
          style={styles.button}
          onPress={() => navigation.navigate('Reg')} // Navega a la pantalla de Registro
        >
          Registrarme
        </Button>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    maxWidth: '80%',
    maxHeight: '40%',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: '17%', // Aproximadamente 3/4 de la pantalla (1/4 desde la parte inferior)
    width: '100%',
    alignItems: 'center', // Centra los botones horizontalmente
  },
  button: {
    backgroundColor: '#96F20A',
    borderColor: '#6FB800',
    borderWidth: 2,
    borderRadius: 20,
    width: '70%', // Hace los botones más alargados
    height: 50,   // Asegura que ambos botones tengan la misma altura
  },
});