import React, { useState, useLayoutEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Pressable, ScrollView } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { BarCodeScanner } from 'expo-barcode-scanner';

// Define el tipo de las pantallas para la navegación
type RootStackParamList = {
  Hoy: undefined;
  Plan: undefined;
  Recetas: undefined;
  Refri: undefined;
  Perfil: undefined;
};

const EjemploCalendarioPersonalizado = () => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [showCamera, setShowCamera] = useState(false); // Estado para la cámara "Camara"
  const [showScanner, setShowScanner] = useState(false); // Estado para la cámara "Scaner"
  const [ingredientes, setIngredientes] = useState<number[]>([0]); // Estado para manejar los contenedores "nuevoIngrediente"
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const navigateToScreen = (screenName: keyof RootStackParamList) => {
    navigation.navigate(screenName);
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerBackTitleVisible: false,
      headerTintColor: '#40632F',
      headerTitle: '', // Oculta el título por defecto
      headerStyle: {
        height: 150, // Aumenta la altura de la cabecera
      },
      headerRight: () => (
        <View style={sHead.headerButtonsContainer}>
          <View style={sHead.naveAl}>
            <Pressable onPress={() => navigateToScreen('Hoy')}>
              <Image source={require('./img/bHoy1.png')} style={sHead.headerIcon} />
            </Pressable>
            <Pressable onPress={() => navigateToScreen('Plan')}>
              <Image source={require('./img/bPlan2.png')} style={sHead.headerIcon} />
            </Pressable>
            <Pressable onPress={() => navigateToScreen('Recetas')}>
              <Image source={require('./img/bRecetas1.png')} style={sHead.headerIcon} />
            </Pressable>
            <Pressable onPress={() => navigateToScreen('Refri')}>
              <Image source={require('./img/bRefri2.png')} style={sHead.headerIconActive} />
            </Pressable>
          </View>
          <Pressable onPress={() => navigateToScreen('Perfil')} style={sHead.headerIconEs}>
            <Image source={require('./img/bPerfil.png')} style={sHead.headerIcon2} />
          </Pressable>
        </View>
      ),
    });

    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, [navigation]);

  const handleBarCodeScanned = ({ type, data }: { type: string; data: string }) => {
    setScanned(true);
    alert(`Product code ${data} has been scanned!`);
  };

  // Función para agregar un nuevo contenedor "nuevoIngrediente"
  const addNuevoIngrediente = () => {
    setIngredientes([...ingredientes, ingredientes.length]);
  };

  // Función para eliminar un contenedor "nuevoIngrediente" por su índice
  const removeNuevoIngrediente = (index: number) => {
    setIngredientes(ingredientes.filter((_, i) => i !== index));
  };

  const addExpiredProduct = () => {
    setScanned(false);
    setShowCamera(false); // Cierra la cámara "Camara"
    setShowScanner(false); // Cierra la cámara "Scaner"
    addNuevoIngrediente(); // Agrega un nuevo contenedor al hacer clic en "MasIcon.png"
  };

  // Función para abrir la cámara "Camara"
  const openCamera = () => {
    if (hasPermission === true) {
      setShowCamera(true);
      setScanned(false); // Resetea el estado de escaneo
    } else {
      alert('No se tiene permiso para usar la cámara');
    }
  };

  // Función para abrir la cámara "Scaner"
  const openScanner = () => {
    if (hasPermission === true) {
      setShowScanner(true);
      setScanned(false); // Resetea el estado de escaneo
    } else {
      alert('No se tiene permiso para usar la cámara');
    }
  };

  // Si showCamera es true, muestra la cámara "Camara" en pantalla completa
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
          <TouchableOpacity style={styles.scanAgainButtonFull} onPress={() => setScanned(false)}>
            <Text style={styles.scanAgainText}>Scan Again</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.closeButton} onPress={() => setShowCamera(false)}>
          <Text style={styles.closeText}>Cerrar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.addButtonFull} onPress={addExpiredProduct}>
          <Image
            source={require('./img/MasIcon.png')} // Asegúrate de que la ruta sea correcta
            style={styles.addIcon}
          />
        </TouchableOpacity>
      </View>
    );
  }

  // Si showScanner es true, muestra la cámara "Scaner" en pantalla completa
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
          <TouchableOpacity style={styles.scanAgainButtonFull} onPress={() => setScanned(false)}>
            <Text style={styles.scanAgainText}>Scan Again</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.closeButton} onPress={() => setShowScanner(false)}>
          <Text style={styles.closeText}>Cerrar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.addButtonFull} onPress={addExpiredProduct}>
          <Image
            source={require('./img/MasIcon.png')} // Asegúrate de que la ruta sea correcta
            style={styles.addIcon}
          />
        </TouchableOpacity>
      </View>
    );
  }

  // Vista principal con el contenedor de texto e iconos
  return (
    <View style={styles.container}>
      {/* Panel con ScrollView para los contenedores "nuevoIngrediente" */}
      <ScrollView style={styles.fullScreenBox} contentContainerStyle={styles.scrollContent}>
        {ingredientes.map((_, index) => (
          <View key={index} style={styles.nuevoIngrediente}>
            <Image
              source={require('./img/ImgDefecto.png')} // Imagen a la izquierda
              style={styles.defaultImage}
            />
            <View style={styles.textWrapper}>
              <Text style={styles.txtIngrediente}>Pastel</Text>
              <Text style={styles.porciones}>Porciones/10</Text>
            </View>
            <TouchableOpacity onPress={() => removeNuevoIngrediente(index)}>
              <Image
                source={require('./img/Basura.png')} // Imagen a la derecha
                style={styles.trashImage}
              />
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      {/* Contenedor para los iconos, superpuesto al panel */}
      <View style={styles.bottomIconsContainer}>
        <View style={styles.leftIcons}>
          <TouchableOpacity style={styles.iconButton} onPress={openCamera}>
            <Image
              source={require('./img/Camara.png')} // Asegúrate de que la ruta sea correcta
              style={styles.cameraImage}
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={openScanner}>
            <Image
              source={require('./img/Scanner.png')} // Nueva imagen para "Scaner"
              style={styles.scannerImage}
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.addButton} onPress={addExpiredProduct}>
          <Image
            source={require('./img/MasIcon.png')} // Asegúrate de que la ruta sea correcta
            style={styles.addIcon}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 20,
    padding: 20,
  },
  fullScreenBox: {
    flex: 1,
    backgroundColor: '#CAE2B5',
    borderRadius: 20, // Esquinas redondeadas
  },
  scrollContent: {
    padding: 20, // Espacio en la parte superior e inferior del contenido del ScrollView
    paddingBottom: 80, // Espacio adicional en la parte inferior para que coincida con el espacio superior
  },
  nuevoIngrediente: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 10,
    marginBottom: 20,
  },
  defaultImage: {
    width: 30,
    height: 30,
    marginRight: 10,
  },
  trashImage: {
    width: 20,
    height: 20,
    marginLeft: 10,
  },
  textWrapper: {
    flex: 1,
    justifyContent: 'center',
  },
  txtIngrediente: {
    backgroundColor: '#E0E0E0', // Gris claro
    color: '#000000',
    fontSize: 14,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 5,
    marginBottom: 5,
  },
  porciones: {
    backgroundColor: '#E0E0E0', // Gris claro
    color: '#000000',
    fontSize: 7,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 5,
    alignSelf: 'flex-start',
  },
  bottomIconsContainer: {
    position: 'absolute',
    bottom: 20, // Ajustado para que esté más dentro del panel
    left: 40, // Ajustado para alinearse con el padding del contenedor
    right: 40, // Ajustado para alinearse con el padding del contenedor
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leftIcons: {
    flexDirection: 'row',
  },
  iconButton: {
    backgroundColor: '#CEDFAD',
    padding: 10,
    borderRadius: 5,
    marginRight: 10, // Espacio entre los iconos de Camara y Scaner
  },
  cameraImage: {
    width: 30,
    height: 30,
  },
  scannerImage: {
    width: 30,
    height: 30,
  },
  addButton: {
    backgroundColor: '#CEDFAD',
    padding: 10,
    borderRadius: 5,
  },
  addIcon: {
    width: 30,
    height: 30,
  },
  fullScreen: {
    flex: 1,
  },
  cameraFull: {
    flex: 1,
  },
  scanAgainButtonFull: {
    position: 'absolute',
    bottom: 80,
    alignSelf: 'center',
    backgroundColor: '#CEDFAD',
    padding: 10,
    borderRadius: 5,
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 10,
    borderRadius: 5,
  },
  closeText: {
    color: '#fff',
    fontSize: 16,
  },
  addButtonFull: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    backgroundColor: '#CEDFAD',
    padding: 10,
    borderRadius: 5,
  },
  scanAgainText: {
    color: '#40632F',
    fontWeight: 'bold',
  },
});

const sHead = StyleSheet.create({
  headerButtonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#40632F',
    marginRight: 20,
    marginLeft: 10,
  },
  headerIcon: {
    width: 69,
    height: 56,
    marginHorizontal: 5,
    resizeMode: 'contain',
    left: 4,
  },
  headerIconActive: {
    width: 69,
    height: 56,
    marginHorizontal: 5,
    resizeMode: 'contain',
    left: 4,
    borderWidth: 2,
    borderColor: '#40632F',
  },
  headerIcon2: {
    width: 72,
    height: 67,
    marginHorizontal: 5,
    resizeMode: 'contain',
    left: 20,
  },
  headerIconEs: {
    position: 'absolute',
    zIndex: 10,
    marginHorizontal: 5,
    right: 10,
    bottom: -65,
  },
  naveAl: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
    backgroundColor: '#9FAF7D',
    position: 'absolute',
    right: -28,
    top: 24,
    width: 420,
  },
  headerButtonTextInactive: {
    color: '#FFFFFF', // Color blanco para botones inactivos (Hoy, Plan, Recetas)
    textAlign: 'center',
    fontSize: 16,
  },
  headerButtonTextActive: {
    color: '#40632F', // Color verde oscuro para el botón activo (Refri)
    textAlign: 'center',
    fontSize: 16,
  },
});

export default EjemploCalendarioPersonalizado;