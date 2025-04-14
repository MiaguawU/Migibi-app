import React, { useLayoutEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, TextInput } from 'react-native';
import { WhiteSpace } from '@ant-design/react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from './types';
import { AntDesign } from '@expo/vector-icons';

type ProfileScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Perfil'>;

export default function ProfileScreen() {
  const navigation = useNavigation<ProfileScreenNavigationProp>();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  return (
    <View style={styles.background}>
      {/* Flecha de retroceso */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <AntDesign name="arrowleft" size={24} color="#40632F" />
      </TouchableOpacity>

      {/* Botón "Cerrar Sesión" */}
      <TouchableOpacity
        style={styles.logoutButton}
        onPress={() => navigation.navigate('Omg')}
      >
        <Text style={styles.logoutText}>Cerrar Sesión</Text>
      </TouchableOpacity>

      <View style={styles.container}>
        {/* Imagen "bPerfil" */}
        <Image
          source={require('./img/bPerfil.png')}
          style={styles.profileIcon}
          resizeMode="contain"
        />
        <WhiteSpace size="lg" />

        {/* Texto "Usuario" y "MasIcon" al lado */}
        <View style={styles.userContainer}>
          <Text style={styles.title}>Usuario</Text>
          <Image
            source={require('./img/MasIcon.png')}
            style={styles.masIcon}
            resizeMode="contain"
          />
        </View>
        <WhiteSpace size="xl" />

        {/* Contenedor 1: Tipos de alimentos (con botón "Ver") */}
        <View style={styles.infoContainer}>
          <Text style={styles.label}>Tipos de alimentos que no puedo comer</Text>
          <TouchableOpacity
            style={styles.viewButton}
            onPress={() => navigation.navigate('Nocome')}
          >
            <Text style={styles.viewButtonText}>Ver</Text>
          </TouchableOpacity>
        </View>
        <WhiteSpace size="lg" />

        {/* Contenedor 2: Cantidad de personas */}
        <View style={styles.infoContainer}>
          <Text style={styles.label}>Cantidad de personas que viven conmigo</Text>
          <TextInput
            style={styles.input}
            placeholder="Escribe aquí..."
            placeholderTextColor="#888"
            keyboardType="numeric"
          />
        </View>
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
  logoutButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 1,
    borderColor: 'black',
    borderWidth: 2,
    backgroundColor: '#FFD39E',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  logoutText: {
    fontSize: 16,
    color: '#000',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileIcon: {
    maxWidth: '80%',
    maxHeight: '40%',
  },
  userContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#000',
  },
  masIcon: {
    width: 30,
    height: 30,
    marginLeft: 10,
  },
  infoContainer: {
    width: '80%',
    backgroundColor: '#CAE2B5',
    borderColor: '#8CA966',
    borderWidth: 2,
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },
  label: {
    fontSize: 16,
    color: 'black',
    marginBottom: 10,
  },
  input: {
    width: '100%',
    height: 40,
    backgroundColor: 'white',
    borderColor: '#8CA966',
    borderWidth: 2,
    borderRadius: 10,
    paddingHorizontal: 10,
    fontSize: 16,
  },
  viewButton: {
    backgroundColor: 'white',
    borderColor: '#8CA966',
    borderWidth: 2,
    borderRadius: 10,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewButtonText: {
    fontSize: 16,
    color: '#000',
  },
});