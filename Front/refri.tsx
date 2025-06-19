import React, { useState, useLayoutEffect, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Pressable,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import axios from 'axios';
import PUERTO from '../config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TextInput } from 'react-native';
import { Animated } from 'react-native';


// Define el tipo de las pantallas para la navegación
type RootStackParamList = {
  Hoy: undefined;
  Plan: undefined;
  Recetas: undefined;
  Refri: undefined;
  Perfil: undefined;
};

interface CardData {
  id: number;
  ingrediente: string;
  cantidad: number;
  abreviatura: string;
  image: string;
  fecha: string;
  diasRestantes: string | number;
  caducidadPasada: boolean | null;
  Tipo: string;
  Activo: number;
  Id_Usuario_Alta: number;
}

// Obtener las dimensiones de la pantalla para hacer el diseño responsivo
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const EjemploCalendarioPersonalizado = () => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [ingredientes, setIngredientes] = useState<number[]>([0]);
  const [alimentosPerecederos, setAlimentosPerecederos] = useState<CardData[]>([]);
  const [alimentosNoPerecederos, setAlimentosNoPerecederos] = useState<CardData[]>([]);
  const [serverMessage, setServerMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const navigateToScreen = (screenName: keyof RootStackParamList) => {
    navigation.navigate(screenName);
  };

  useEffect(() => {
    if (serverMessage !== '') {
      const timer = setTimeout(() => setServerMessage(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [serverMessage]);

  const handleBarCodeScanned = async ({ type, data }: { type: string; data: string }) => {
  setScanned(true);
  setShowScanner(false);
  setShowCamera(false);

  try {
    const response = await axios.post(`${PUERTO}/escaner`, { codigo: data });

    if (response.status === 200 && response.data.nombreCompleto) {
      setServerMessage("Código escaneado correctamente. Datos recibidos del servidor.");

      // Navegar a la pantalla del formulario con el nombre
      //navigation.navigate('refriAgregarStock', {nombreEscaneado: response.data.nombreCompleto,});
    } else {
      setServerMessage("El servidor no devolvió resultados para este código.");
    }
  } catch (error) {
    console.error("Error al enviar código escaneado:", error);
    setServerMessage("No se pudo conectar con el servidor al escanear.");
  }
};

  
  const eliminarAlimento = async (id: number) => {
    try {
      const response = await axios.put(`${PUERTO}/alimentoInactivo/${id}`, { id });
  
      if (response.status === 200) {
        setServerMessage("Alimento eliminado exitosamente.");
        datosAlimento(); 
      } else {
        setServerMessage("No se pudo eliminar el alimento.");
      }
    } catch (error) {
      console.error("Error al eliminar alimento:", error);
      setServerMessage("Ocurrió un error al intentar eliminar el alimento.");
    }
  };
  

  const datosAlimento = async () => {
    try {
      const currentUserString = await AsyncStorage.getItem('currentUser');
      if (!currentUserString) {
        setServerMessage('No hay un usuario logueado actualmente.');
        return;
      }
      const currentUser = JSON.parse(currentUserString);
      const userId = currentUser.id;

      if (isNaN(userId)) {
        setServerMessage("ID de usuario inválido.");
        return;
      }
  
      const response = await axios.get(`${PUERTO}/alimento/${userId}`);
      const { Perecedero, NoPerecedero } = response.data;
  
      if (Array.isArray(Perecedero) && Array.isArray(NoPerecedero)) {
        const perecederos = Perecedero.filter(
          (alimento) => alimento.Id_Usuario_Alta === userId
        ).map((alimento) => {
          const fechaCaducidad = alimento.Fecha_Caducidad ? new Date(alimento.Fecha_Caducidad) : null;
          const caducidadPasada = fechaCaducidad && fechaCaducidad < new Date();
          const diasRestantes = fechaCaducidad
            ? Math.max(
                0,
                Math.ceil(
                  (fechaCaducidad.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
                )
              )
            : 'No definida';
          const fecha = fechaCaducidad ? fechaCaducidad.toLocaleDateString() : 'Fecha no disponible';
  
          return {
            id: alimento.id || ' ',
            ingrediente: alimento.Nombre || ' ',
            cantidad: alimento.Cantidad || 1,
            abreviatura: alimento.Unidad || ' ',
            image: alimento.Imagen ? `${PUERTO}${alimento.Imagen}` : '/imagenes/defIng.png',
            fecha: caducidadPasada ? fecha : `${diasRestantes} días`,
            diasRestantes,
            caducidadPasada,
            Tipo: alimento.Tipo_Alimento,
            Activo: alimento.Activo,
            Id_Usuario_Alta: alimento.Id_Usuario_Alta,
          };
        });
  
        const noPerecederos = NoPerecedero.filter(
          (alimento) => alimento.Id_Usuario_Alta === userId
        ).map((alimento) => ({
          id: alimento.id || ' ',
          ingrediente: alimento.Nombre || ' ',
          cantidad: alimento.Cantidad || 0,
          abreviatura: alimento.Unidad || ' ',
          image: alimento.Imagen ? `${PUERTO}${alimento.Imagen}` : '/imagenes/defIng.png',
          fecha: '🧀',
          diasRestantes: 'No aplica',
          caducidadPasada: false,
          Tipo: alimento.Tipo_Alimento,
          Activo: alimento.Activo,
          Id_Usuario_Alta: alimento.Id_Usuario_Alta,
        }));
  
        setAlimentosPerecederos(perecederos);
        setAlimentosNoPerecederos(noPerecederos);
        console.log("Alimentos obtenidos exitosamente");
      } else {
        throw new Error("Formato de datos inválido");
      }
    } catch (error) {
      console.error("Error al obtener alimentos", error);
      setServerMessage("No se pudo conectar con el servidor.");
    } 
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value.toLowerCase());
  };

  useEffect(() => {
    datosAlimento();
  }, []);

  const filteredAlimentos = [...alimentosPerecederos, ...alimentosNoPerecederos].filter((alimento) => {
    const nombre = alimento.ingrediente.toLowerCase();
    const tipo = alimento.Tipo.toLowerCase();
    const cantidad = alimento.cantidad.toString();
    return (
      (nombre.includes(searchTerm) ||
        tipo.includes(searchTerm) ||
        cantidad.includes(searchTerm)) &&
      alimento.cantidad > 0 && alimento.Activo > 0
    );
  });  
  const animatedValues = filteredAlimentos.map(() => new Animated.Value(0));

  useEffect(() => {
    animatedValues.forEach((anim, index) => {
      Animated.timing(anim, {
        toValue: 1,
        duration: 500,
        delay: index * 100,
        useNativeDriver: true,
      }).start();
    });
  }, [filteredAlimentos]);
  

  useLayoutEffect(() => {
    navigation.setOptions({
      headerBackTitleVisible: false,
      headerTintColor: '#40632F',
      headerTitle: '',
      headerStyle: {
        height: SCREEN_HEIGHT * 0.15,
      },
      headerRight: () => (
        <View style={sHead.headerButtonsContainer}>
          <View style={sHead.naveAl}>
            <Pressable onPress={() => navigateToScreen('Hoy')}>
              <Image source={require('../img/bHoy1.png')} style={sHead.headerIcon} />
            </Pressable>
            <Pressable onPress={() => navigateToScreen('Plan')}>
              <Image source={require('../img/bPlan1.png')} style={sHead.headerIcon} />
            </Pressable>
            <Pressable onPress={() => navigateToScreen('Recetas')}>
              <Image source={require('../img/bRecetas1.png')} style={sHead.headerIcon} />
            </Pressable>
            <Pressable onPress={() => navigateToScreen('Refri')}>
              <Image source={require('../img/bRefri2.png')} style={sHead.headerIcon} />
            </Pressable>
            <Pressable onPress={() => navigateToScreen('Perfil')} style={sHead.headerIconEs}>
              <Image source={require('../img/bPerfil.png')} style={sHead.headerIcon2} />
            </Pressable>
          </View>
        </View>
      ),
    });

    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, [navigation]);
  

  const addNuevoIngrediente = () => {
    setIngredientes([...ingredientes, ingredientes.length]);
  };

  const removeNuevoIngrediente = (index: number) => {
    setIngredientes(ingredientes.filter((_, i) => i !== index));
  };

  const addExpiredProduct = () => {
    setScanned(false);
    setShowCamera(false);
    setShowScanner(false);
    addNuevoIngrediente();
  };

  const openCamera = () => {
    if (hasPermission === true) {
      setShowCamera(true);
      setScanned(false);
    } else {
      alert('No se tiene permiso para usar la cámara');
    }
  };

  const openScanner = () => {
    if (hasPermission === true) {
      setShowScanner(true);
      setScanned(false);
    } else {
      alert('No se tiene permiso para usar la cámara');
    }
  };

  if (showCamera) {
    if (hasPermission === null) {
      return <Text>Requesting camera permission</Text>;
    }
    if (hasPermission === false) {
      return <Text>No access to camera</Text>;
    }

    return (
      <View style={styles.fullScreen}>
        <BarCodeScanner
          onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
          style={styles.cameraFull}
          barCodeTypes={[BarCodeScanner.Constants.BarCodeType.qr]}
        />
        {scanned && (
          <TouchableOpacity
            style={styles.scanAgainButtonFull}
            onPress={() => setScanned(false)}
          >
            <Text style={styles.scanAgainText}>Scan Again</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.closeButton} onPress={() => setShowCamera(false)}>
          <Text style={styles.closeText}>Cerrar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.addButtonFull} onPress={addExpiredProduct}>
          <Image source={require('../img/MasIcon.png')} style={styles.addIcon} />
        </TouchableOpacity>
      </View>
    );
  }

  if (showScanner) {
    if (hasPermission === null) {
      return <Text>Requesting camera permission</Text>;
    }
    if (hasPermission === false) {
      return <Text>No access to camera</Text>;
    }

    return (
      <View style={styles.fullScreen}>
        <BarCodeScanner
          onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
          style={styles.cameraFull}
          barCodeTypes={[BarCodeScanner.Constants.BarCodeType.qr]}
        />
        {scanned && (
          <TouchableOpacity
            style={styles.scanAgainButtonFull}
            onPress={() => setScanned(false)}
          >
            <Text style={styles.scanAgainText}>Scan Again</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.closeButton} onPress={() => setShowScanner(false)}>
          <Text style={styles.closeText}>Cerrar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.addButtonFull} onPress={addExpiredProduct}>
          <Image source={require('../img/MasIcon.png')} style={styles.addIcon} />
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {serverMessage !== '' && (
                  <Text style={styles.message}>{serverMessage}</Text>
                )}
        <TextInput
            placeholder="Buscar alimento..."
            placeholderTextColor="#555"
            value={searchTerm}
            onChangeText={(text) => setSearchTerm(text)}
            style={{
              backgroundColor: 'white',
              borderColor: '#8CA966',
              borderWidth: 1,
              borderRadius: 10,
              paddingHorizontal: 12,
              paddingVertical: 8,
              marginBottom: 15,
              fontSize: 16,
            }}
          />
      <ScrollView style={styles.fullScreenBox} contentContainerStyle={styles.scrollContent}>
        


{filteredAlimentos.map((alimento, index) => {
 
 const translateY = animatedValues[index].interpolate({
  inputRange: [0, 1],
  outputRange: [20, 0],
});

const opacity = animatedValues[index];

  return (
    <Animated.View
      key={alimento.id}
      style={[
        styles.nuevoIngrediente,
        {
          opacity,
          transform: [{ translateY }],
        },
      ]}
    >
      <Image source={{ uri: alimento.image }} style={styles.defaultImage} />
      <View style={styles.textWrapper}>
        <Text style={styles.txtIngrediente}>{alimento.ingrediente}</Text>
        <Text style={styles.porciones}>
          {alimento.cantidad} {alimento.abreviatura}
        </Text>
        <Text style={{ fontSize: 12, color: alimento.caducidadPasada ? 'red' : 'green' }}>
          {alimento.fecha}
        </Text>
      </View>
      <TouchableOpacity onPress={() => eliminarAlimento(alimento.id)}>
        <Image source={require('../img/Basura.png')} style={styles.trashImage} />
      </TouchableOpacity>
    </Animated.View>
  );
})}



      </ScrollView>

      <View style={styles.bottomIconsContainer}>
        <View style={styles.leftIcons}>
          <TouchableOpacity style={styles.iconButton} onPress={openCamera}>
            <Image source={require('../img/Camara.png')} style={styles.cameraImage} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={openScanner}>
            <Image source={require('../img/Scanner.png')} style={styles.scannerImage} />
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={addExpiredProduct}>
          <Image source={require('../img/MasIcon.png')} style={styles.addIcon} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  message: {
    color: '#d9534f', // rojo para errores
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  container: {
    flex: 1,
    marginTop: SCREEN_HEIGHT * 0.04, // Aumentado de 0.02 a 0.04 para más separación
    padding: SCREEN_WIDTH * 0.05,
  },
  fullScreenBox: {
    flex: 1,
    backgroundColor: '#CAE2B5',
    borderRadius: SCREEN_WIDTH * 0.05,
    borderWidth: SCREEN_WIDTH * 0.005, 
    borderColor: '#8CA966',
  },
  scrollContent: {
    padding: SCREEN_WIDTH * 0.05,
    paddingBottom: SCREEN_HEIGHT * 0.15,
  },
  nuevoIngrediente: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#CAE2B5',
    borderRadius: SCREEN_WIDTH * 0.025,
    padding: SCREEN_WIDTH * 0.025,
    marginBottom: SCREEN_HEIGHT * 0.005,
  },
  defaultImage: {
    width: SCREEN_WIDTH * 0.08,
    height: SCREEN_WIDTH * 0.08,
    marginRight: SCREEN_WIDTH * 0.025,
  },
  trashImage: {
    width: SCREEN_WIDTH * 0.05,
    height: SCREEN_WIDTH * 0.05,
    marginLeft: SCREEN_WIDTH * 0.025,
  },
  textWrapper: {
    flex: 1,
    justifyContent: 'center',
  },
  txtIngrediente: {
    backgroundColor: 'white',
    color: '#000000',
    fontSize: SCREEN_WIDTH * 0.035,
    paddingHorizontal: SCREEN_WIDTH * 0.02,
    paddingVertical: SCREEN_HEIGHT * 0.005,
    borderRadius: SCREEN_WIDTH * 0.025,
    marginBottom: SCREEN_HEIGHT * 0.01,
  },
  porciones: {
    backgroundColor: '#E0E0E0',
    color: '#000000',
    fontSize: SCREEN_WIDTH * 0.018,
    paddingHorizontal: SCREEN_WIDTH * 0.012,
    paddingVertical: SCREEN_HEIGHT * 0.003,
    borderRadius: SCREEN_WIDTH * 0.012,
    alignSelf: 'flex-start',
  },
  bottomIconsContainer: {
    position: 'absolute',
    bottom: SCREEN_HEIGHT * 0.03,
    left: SCREEN_WIDTH * 0.1,
    right: SCREEN_WIDTH * 0.1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leftIcons: {
    flexDirection: 'row',
  },
  iconButton: {
    backgroundColor: '#CEDFAD',
    padding: SCREEN_WIDTH * 0.025,
    borderRadius: SCREEN_WIDTH * 0.012,
    marginRight: SCREEN_WIDTH * 0.025,
  },
  cameraImage: {
    width: SCREEN_WIDTH * 0.08,
    height: SCREEN_WIDTH * 0.08,
  },
  scannerImage: {
    width: SCREEN_WIDTH * 0.08,
    height: SCREEN_WIDTH * 0.08,
  },
  addButton: {
    backgroundColor: '#CEDFAD',
    padding: SCREEN_WIDTH * 0.025,
    borderRadius: SCREEN_WIDTH * 0.012,
  },
  addIcon: {
    width: SCREEN_WIDTH * 0.08,
    height: SCREEN_WIDTH * 0.08,
  },
  fullScreen: {
    flex: 1,
  },
  cameraFull: {
    flex: 1,
  },
  scanAgainButtonFull: {
    position: 'absolute',
    bottom: SCREEN_HEIGHT * 0.1,
    alignSelf: 'center',
    backgroundColor: '#CEDFAD',
    padding: SCREEN_WIDTH * 0.025,
    borderRadius: SCREEN_WIDTH * 0.012,
  },
  closeButton: {
    position: 'absolute',
    top: SCREEN_HEIGHT * 0.05,
    right: SCREEN_WIDTH * 0.05,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: SCREEN_WIDTH * 0.025,
    borderRadius: SCREEN_WIDTH * 0.012,
  },
  closeText: {
    color: '#fff',
    fontSize: SCREEN_WIDTH * 0.04,
  },
  addButtonFull: {
    position: 'absolute',
    bottom: SCREEN_HEIGHT * 0.03,
    alignSelf: 'center',
    backgroundColor: '#CEDFAD',
    padding: SCREEN_WIDTH * 0.025,
    borderRadius: SCREEN_WIDTH * 0.012,
  },
  scanAgainText: {
    color: '#40632F',
    fontWeight: 'bold',
    fontSize: SCREEN_WIDTH * 0.04,
  },
});

const sHead = StyleSheet.create({
  headerButtonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.15,
  },
  headerIcon: {
    width: SCREEN_WIDTH * 0.15,
    height: SCREEN_HEIGHT * 0.07,
    marginHorizontal: SCREEN_WIDTH * 0.01,
    resizeMode: 'contain',
  },
  headerIcon2: {
    width: SCREEN_WIDTH * 0.16,
    height: SCREEN_HEIGHT * 0.08,
    resizeMode: 'contain',
  },
  headerIconEs: {
    marginHorizontal: SCREEN_WIDTH * 0.01,
  },
  naveAl: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#9FAF7D',
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.07,
    top: SCREEN_HEIGHT * 0.06,
    paddingHorizontal: SCREEN_WIDTH * 0.02,
  },
});

export default EjemploCalendarioPersonalizado;