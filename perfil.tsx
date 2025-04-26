import React, { useLayoutEffect, useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, TextInput } from 'react-native';
import { WhiteSpace } from '@ant-design/react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from './types';
import { AntDesign } from '@expo/vector-icons';
import axios from 'axios';
import PUERTO from './config';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ProfileScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Perfil'>;

export default function ProfileScreen() {
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const [serverMessage, setServerMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<{
    Nombre_Usuario: string;
    foto_perfil: { uri: string } | null;
    Cohabitantes: string;
    Email: string;
    FileImagen: File | null;
  }>({
    Nombre_Usuario: '',
    foto_perfil: null,
    Cohabitantes: '',
    Email: '',
    FileImagen: null,
  });
  


  useEffect(() => {
      if (serverMessage !== '') {
        const timer = setTimeout(() => setServerMessage(''), 5000);
        return () => clearTimeout(timer);
      }
    }, [serverMessage]);

    const datosPerfil = async () => {
      setLoading(true);
      try {
        const currentUserStr = await AsyncStorage.getItem('currentUser');
        if (!currentUserStr) {
          setServerMessage("No hay un usuario logueado actualmente.");
          return;
        }

        const currentUser = JSON.parse(currentUserStr);
        const userId = currentUser.id;

  
        const response = await axios.get(`${PUERTO}/usuarios`, {
          params: { id_us: userId },
          headers: { "Content-Type": "application/json" },
        });
  
        if (response.data.length > 0) {
          const userData = response.data[0];
          setFormData((prev) => ({
            ...prev,
            Nombre_Usuario: userData.Nombre_Usuario || "No info",
            foto_perfil: {
              uri: userData.foto_perfil?.startsWith("http")
                ? userData.foto_perfil
                : `${PUERTO}/${userData.foto_perfil}`
            },            
            Cohabitantes: userData.Cohabitantes || 0,
            Email: userData.Email || "No info",
          }));
          console.log("URI de la imagen de perfil:", userData.foto_perfil);

        } else {
          setServerMessage("No se encontró información del usuario.");
        }
      } catch (error) {
        console.error("Error al obtener usuario:", error);
        setServerMessage("No se pudo conectar con el servidor.");
      } finally {
        setLoading(false);
      }
    };
  

  useEffect(() => {
    datosPerfil();
  }, []);

  const logout = async () => {
    try {
      // Eliminar currentUser del AsyncStorage
      await AsyncStorage.removeItem('currentUser');
  
      // Puedes limpiar más datos si guardaste algo adicional
      // await AsyncStorage.clear(); // Si deseas limpiar todo el almacenamiento
  
      // Mensaje opcional
      setServerMessage("Sesión cerrada correctamente.");
  
      // Redirigir al login o pantalla de inicio
      navigation.navigate('Omg');
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      setServerMessage("No se pudo cerrar la sesión. Inténtalo de nuevo.");
    }
  };
  

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  return (
    <View style={styles.background}>
      {/* Mensaje del servidor */}
      {serverMessage !== '' && (
        <View style={{ padding: 10, backgroundColor: '#FFD39E', margin: 10, borderRadius: 10 }}>
          <Text style={{ color: '#000', textAlign: 'center' }}>{serverMessage}</Text>
        </View>
      )}

      {/* Flecha de retroceso */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <AntDesign name="arrowleft" size={24} color="#40632F" />
      </TouchableOpacity>

      {/* Botón "Cerrar Sesión" */}
      <TouchableOpacity style={styles.logoutButton} onPress={logout}>
        <Text style={styles.logoutText}>Cerrar Sesión</Text>
      </TouchableOpacity>


      <View style={styles.container}>
        {/* Imagen "bPerfil" */}
        {formData.foto_perfil?.uri ? (
        <Image
          source={{ uri: formData.foto_perfil.uri }}
          style={styles.profileIcon}
          resizeMode="contain"
        />
      ) : (
        <Text style={{ marginTop: 20, fontSize: 16, color: '#666' }}>Sin imagen de perfil</Text>
      )}


        <WhiteSpace size="lg" />

        {/* Texto "Usuario" y "MasIcon" al lado */}
        <View style={styles.userContainer}>
          <Text style={styles.title}>{formData.Nombre_Usuario}</Text>
          <Image source={require('./img/MasIcon.png')} style={styles.masIcon} resizeMode="contain" />
        </View>
        <WhiteSpace size="xl" />

        {/* Email */}
        <View style={styles.infoContainer}>
          <Text style={styles.label}>Correo electrónico</Text>
          <Text style={styles.input}>{formData.Email}</Text>
        </View>
        <WhiteSpace size="lg" />

        {/* Contenedor 1: Tipos de alimentos */}
        <View style={styles.infoContainer}>
          <Text style={styles.label}>Tipos de alimentos que no puedo comer</Text>
          <TouchableOpacity style={styles.viewButton} onPress={() => navigation.navigate('Perfil')}>
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
            value={formData.Cohabitantes}
            editable={false}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  message: {
    color: '#d9534f', // rojo para errores
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
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