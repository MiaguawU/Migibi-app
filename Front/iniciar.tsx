import React, { useLayoutEffect, useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Image } from 'react-native';
import { Button, WhiteSpace } from '@ant-design/react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { AntDesign, Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import PUERTO from '../config';

type IniciarScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Iniciar'>;

export default function LoginScreen() {
  const navigation = useNavigation<IniciarScreenNavigationProp>();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [serverMessage, setServerMessage] = useState('');


  const sesionNormal = async () => {
    try {
      const data = { identifier: email, password };
      const response = await axios.post(`${PUERTO}/login`, data, {
        headers: { 'Content-Type': 'application/json' },
      });
  
      const { id, username, foto_perfil, Cohabitantes, Email, message } = response.data;
  
      await AsyncStorage.setItem(
        'currentUser',
        JSON.stringify({ id, username, email: Email, foto_perfil, Cohabitantes })
      );
  
      setServerMessage(`Bienvenido, ${username}. ${message}`);
  
      navigation.navigate('Plan');
  
    } catch (error: unknown) {
      console.error('Error al iniciar sesión:', error);
  
      if (axios.isAxiosError(error)) {
        const errorMsg = error.response?.data || "Cuenta bloqueada temporalmente (15 min)";
        setServerMessage(errorMsg); // 👈 Mostrar mensaje del servidor
      } else {
        setServerMessage("Ocurrió un error inesperado.");
      }
    }
  };
  
  useEffect(() => {
    if (serverMessage !== '') {
      const timer = setTimeout(() => setServerMessage(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [serverMessage]);
  
  

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  return (
    <View style={styles.background}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <AntDesign name="arrowleft" size={24} color="#40632F" />
      </TouchableOpacity>

      <View style={styles.container}>
        {/* Espacio adicional arriba del título */}
        <WhiteSpace size="xl" />
        <WhiteSpace size="lg" />
        
        <Text style={styles.title}>¡Inicia Sesión!</Text>

        {/* Triple espacio vertical */}
        <WhiteSpace size="lg" />
        <WhiteSpace size="lg" />
        <WhiteSpace size="lg" />


        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Correo Electrónico"
            value={email}
            onChangeText={setEmail}
            placeholderTextColor="#888"
            keyboardType="email-address"
          />
        </View>
        <WhiteSpace size="xl" />

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Contraseña"
            placeholderTextColor="#888"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setShowPassword(!showPassword)}
          >
            <Feather
              name={showPassword ? 'eye' : 'eye-off'}
              size={20}
              color="#888"
            />
          </TouchableOpacity>
        </View>
        <WhiteSpace size="xl" />

        <Button
          style={styles.button}
          onPress={sesionNormal}
        >
          Iniciar Sesión
        </Button>
        <WhiteSpace size="xl" />

        {serverMessage !== '' && (
          <Text style={styles.message}>{serverMessage}</Text>
        )}

        <Image
          source={require('../img/IconoGoogle.png')}
          style={styles.googleIcon}
          resizeMode="contain"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: '#fff',
  },
  message: {
    color: '#d9534f', // rojo para errores
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
  },
  inputContainer: {
    width: '70%',
    position: 'relative',
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: 'white',
    borderColor: '#9CFF05',
    borderWidth: 2,
    borderRadius: 20,
    paddingHorizontal: 15,
    fontSize: 16,
  },
  eyeIcon: {
    position: 'absolute',
    right: 15,
    top: '50%',
    transform: [{ translateY: -10 }],
  },
  button: {
    backgroundColor: '#9CFF05',
    borderColor: '#6FB800',
    borderWidth: 2,
    borderRadius: 20,
    width: '70%',
    height: 50,
    justifyContent: 'center',
  },
  googleIcon: {
    width: 75,
    height: 75,
  },
});
