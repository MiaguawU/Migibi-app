import React, { useLayoutEffect, useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Image, Platform } from 'react-native';
import { Button, WhiteSpace } from '@ant-design/react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { AntDesign, Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google'
import * as AuthSession from 'expo-auth-session';
import axios from 'axios';
import PUERTO from '../config';
import Constants from 'expo-constants';

WebBrowser.maybeCompleteAuthSession();

type IniciarScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Iniciar'>;
{/**
  sessionNormal = navigation.navigate('Plan')
  */}
export default function LoginScreen() {
  const navigation = useNavigation<IniciarScreenNavigationProp>();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [serverMessage, setServerMessage] = useState('');

const redirectUri = AuthSession.makeRedirectUri({
  native: 'https://auth.expo.io/@isisf/migibi',
});



useEffect(() => {
    console.log("DEBUG: Generated Redirect URI:", redirectUri);
}, [redirectUri]);

type AppConfigExtra = {
  ANDROID_CLIENT_ID: string;
  WEB_CLIENT_ID: string;
};

const extra = (Constants.expoConfig?.extra ?? {}) as AppConfigExtra;

const [request, response, promptAsync] = Google.useAuthRequest({
  androidClientId: extra.ANDROID_CLIENT_ID,
  webClientId: extra.WEB_CLIENT_ID,
  scopes: ['profile', 'email'],
  redirectUri,
});

useEffect(() => {
    if (extra.ANDROID_CLIENT_ID) {
        console.log("DEBUG: Android Client ID:", extra.ANDROID_CLIENT_ID);
    } else {
        console.warn("WARNING: Android Client ID not found in Constants.expoConfig.extra!");
    }

    if (extra.WEB_CLIENT_ID) {
        console.log("DEBUG: Web Client ID:", extra.WEB_CLIENT_ID);
    } else {
        console.warn("WARNING: Web Client ID not found in Constants.expoConfig.extra!");
    }
}, [extra]);

  useEffect(() => {
    console.log("🔁 redirectUri:", redirectUri);

    if (response?.type === 'success') {
      const idToken = response.authentication?.idToken;
      if (idToken) {
        enviarTokenAlServidor(idToken);
      }
    }
  }, [response]);

  const enviarTokenAlServidor = async (idToken: string) => {
    try {
      const res = await axios.post(`${PUERTO}/auth/mobile/google`,
        { id_token: idToken },
        { headers: { 'Content-Type': 'application/json' } }
      );

      const user = res.data;
      await AsyncStorage.setItem('currentUser', JSON.stringify(user));
      navigation.navigate('Plan');
    } catch (err) {
      console.error('Error autenticando con backend:', err);
    }
  };

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
        setServerMessage(errorMsg);
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
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  return (
    <View style={styles.background}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <AntDesign name="arrowleft" size={24} color="#40632F" />
      </TouchableOpacity>

      <View style={styles.container}>
        <WhiteSpace size="xl" />
        <WhiteSpace size="lg" />

        <Text style={styles.title}>¡Inicia Sesión!</Text>

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

        <Button style={styles.button} onPress={sesionNormal}>
          Iniciar Sesión
        </Button>
        <WhiteSpace size="xl" />

        {serverMessage !== '' && (
          <Text style={styles.message}>{serverMessage}</Text>
        )}

        {request && (
          <TouchableOpacity onPress={() => promptAsync({ useProxy: true } as any)}>
            <Image
              source={require('../img/IconoGoogle.png')}
              style={styles.googleIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>
        )}
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
    color: '#d9534f',
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