import React, { useLayoutEffect } from 'react';
import { WhiteSpace } from '@ant-design/react-native';
import { Text, TouchableOpacity, Button, Image, ImageBackground, StyleSheet, View } from 'react-native';
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
        <Image 
          source={require('../img/mobile.png')}
          style={styles.icon}
          resizeMode="contain" />
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.buttonIniciar} onPress={() => navigation.navigate('Iniciar')} activeOpacity={1}>
          <Text style={styles.buttonText}>Iniciar Sesión</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.buttonRegistrarse} onPress={() => navigation.navigate('Reg')} activeOpacity={1}>
          <Text style={styles.buttonText}>Registrarme</Text>
        </TouchableOpacity>
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
    display: 'flex',
    justifyContent: 'space-evenly',
    gap: 10,
  },
  buttonIniciar: {
    backgroundColor: '#9CFF05',
    fontFamily: 'Poppins-Medium',
    borderColor: '#6FB800',
    borderWidth: 2,
    borderRadius: 20,
    width: '70%', // Hace los botones más alargados
    height: 50,   // Asegura que ambos botones tengan la misma altura
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonRegistrarse: {
    backgroundColor: '#D3FF90',
    fontFamily: 'Poppins-Medium',
    borderColor: '#D3FF90',
    borderWidth: 2,
    borderRadius: 20,
    width: '70%', // Hace los botones más alargados
    height: 50,   // Asegura que ambos botones tengan la misma altura
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 18,
    color: '#000',
  },
});