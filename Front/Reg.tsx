import React, { useLayoutEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, TextInput } from 'react-native';
import { Button, WhiteSpace } from '@ant-design/react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from './types';
import { AntDesign, Feather } from '@expo/vector-icons';

type RegScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Reg'>;

export default function EjemploCalendarioPersonalizado() {
  const navigation = useNavigation<RegScreenNavigationProp>();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
        <Image
          source={require('./img/IconoRegistrarse.png')}
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
            placeholderTextColor="#888"
          />
        </View>
        <WhiteSpace size="md" />

        {/* Campo de Correo Electrónico */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Correo Electrónico"
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
          onPress={() => navigation.navigate('Hoy')}
        >
          Registrarme
        </Button>
        <WhiteSpace size="md" />
        <Image
          source={require('./img/IconoGoogle.png')}
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