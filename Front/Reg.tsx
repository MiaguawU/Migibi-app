import React, { useLayoutEffect, useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, TextInput } from 'react-native';
import { Button, WhiteSpace } from '@ant-design/react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { AntDesign, Feather } from '@expo/vector-icons';
import axios from 'axios';
import PUERTO from '../config';

type RegScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Reg'>;

export default function EjemploCalendarioPersonalizado() {
  const navigation = useNavigation<RegScreenNavigationProp>();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [serverMessage, setServerMessage] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  useEffect(() => {
      if (serverMessage !== '') {
        const timer = setTimeout(() => setServerMessage(''), 5000);
        return () => clearTimeout(timer);
      }
    }, [serverMessage]);

  const validateEmailFormat = (email: string): boolean => {
    // Expresión regular para validar correos de Gmail correctamente formateados
    const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    return gmailRegex.test(email);
  };
  
  const correctEmailFormat = (email: string): string => {
    // Elimina espacios en blanco, corrige errores menores como "@gmial.com" → "@gmail.com"
    return email
      .trim()
      .replace(/\s+/g, '') // Elimina espacios
      .replace(/@gmai\.com$/, '@gmail.com') // Corrige errores comunes
      .toLowerCase(); // Normaliza a minúsculas
  };
  
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const correctedEmail = correctEmailFormat(e.target.value);
    setEmail(correctedEmail);
  };

  const validateUsername = (username: string): boolean => {
    return username.length >= 4;
  };

  const validatePassword = (password: string): boolean => {
    const hasTwoUppercase = (password.match(/[A-Z]/g) || []).length >= 2;
    const hasTwoLowercase = (password.match(/[a-z]/g) || []).length >= 2;
    const hasTwoNumbers = (password.match(/[0-9]/g) || []).length >= 2;
    return password.length >= 8 && hasTwoUppercase && hasTwoLowercase && hasTwoNumbers;
  };

  const registro = async () => {
    // Validaciones del frontend
    if (!validateUsername(username)) {
      setServerMessage("El nombre de usuario debe tener al menos 4 caracteres.");
      return;
    }
  
    if (!validateEmailFormat(email)) {
      setServerMessage("Ingrese un correo de Gmail válido.");
      return;
    }
  
    if (!validatePassword(password)) {
      setServerMessage("La contraseña debe tener al menos 8 caracteres, incluyendo 2 mayúsculas, 2 minúsculas y 2 números.");
      return;
    }
  
    if (password !== confirmPassword) {
      setServerMessage("Las contraseñas no coinciden.");
      return;
    }
  
    const data = { username, email, password };
  
    try {
      const response = await axios.post(`${PUERTO}/registro`, data, {
        headers: { "Content-Type": "application/json" },
      });
  
      // Registro exitoso
      setServerMessage("Correo de confirmación enviado");
    } catch (error) {
      console.error("Error en registro():", error);
  
      // Manejamos errores que vienen de axios
      if (axios.isAxiosError(error)) {
        if (error.response) {
          const backendMessage = error.response.data?.message;
  
          // Si el backend manda un mensaje específico
          if (backendMessage) {
            setServerMessage(backendMessage);
          } else if (error.response.status === 400) {
            setServerMessage("Solicitud incorrecta. Verifica los datos ingresados.");
          } else if (error.response.status === 409) {
            setServerMessage("El correo o usuario ya existe.");
          } else {
            setServerMessage(`Error del servidor (${error.response.status}).`);
          }
        } else if (error.request) {
          // Error de red, no se obtuvo respuesta
          setServerMessage("No se pudo conectar al servidor. Revisa tu conexión a internet.");
        } else {
          // Otro tipo de error
          setServerMessage("Error desconocido al intentar registrarse.");
        }
      } else {
        // Error que no es de Axios
        setServerMessage("Error inesperado. Intenta de nuevo.");
      }
    }
  };
  
  

  return (
    <View style={styles.background}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <AntDesign name="arrowleft" size={24} color="#40632F" />
      </TouchableOpacity>

      <View style={styles.container}>
        <Image
          source={require('../img/IconoRegistrarse.png')}
          style={styles.icon}
          resizeMode="contain"
        />
        <Text style={styles.title}>¡Regístrate!</Text>
        <WhiteSpace size="lg" />

        {/* Campo de Nombre */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Nombre"
            value={username}
            onChangeText={setUsername}
            placeholderTextColor="#888"
          />
        </View>
        <WhiteSpace size="md" />

        {/* Campo de Correo Electrónico */}
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
        <WhiteSpace size="md" />

        {/* Campo de Contraseña con ojito */}
        <View style={styles.inputContainer}>
        <TextInput
            style={styles.input}
            placeholder="Contraseña"
            value={password}
            onChangeText={setPassword}
            placeholderTextColor="#888"
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
        <WhiteSpace size="md" />

        {/* Campo de Repetir Contraseña con ojito */}
        <View style={styles.inputContainer}>
        <TextInput
            style={styles.input}
            placeholder="Repetir Contraseña"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholderTextColor="#888"
            secureTextEntry={!showConfirmPassword}
          />
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            <Feather
              name={showConfirmPassword ? 'eye' : 'eye-off'}
              size={20}
              color="#888"
            />
          </TouchableOpacity>
        </View>
        <WhiteSpace size="md" />

        <Button
          style={styles.button}
          onPress={registro}
        >
          Registrarme
        </Button>
        <WhiteSpace size="md" />
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
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 1,
  },
  message: {
    color: '#d9534f', // rojo para errores
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
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
  },
  googleIcon: {
    width: 75,
    height: 75,
  },
});