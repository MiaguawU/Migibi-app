import React, { Component, useState, useLayoutEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Image, ScrollView, Dimensions } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { AddModal, EditModal } from './ModalRefri';

// Define el tipo de las pantallas para la navegación
type RootStackParamList = {
  Hoy: undefined;
  Plan: undefined;
  Recetas: undefined;
  Refri: undefined;
  Perfil: undefined;
};

// Tipo para los ingredientes
type Ingrediente = {
  id: number;
  nombre: string;
  cantidad: string;
  caducidad: string;
};

// Obtener las dimensiones de la pantalla
export const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Error Boundary Component
class ErrorBoundary extends Component<{ children: React.ReactNode }, { hasError: boolean }> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error al renderizar la pantalla. Verifica la consola.</Text>
        </View>
      );
    }
    return this.props.children;
  }
}

const Refri = () => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [ingredientes, setIngredientes] = useState<Ingrediente[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [nombre, setNombre] = useState('');
  const [cantidad, setCantidad] = useState('');
  const [caducidad, setCaducidad] = useState('');

  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const navigateToScreen = (screenName: keyof RootStackParamList) => {
    navigation.navigate(screenName);
  };

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
              <Image source={require('./img/bHoy1.png')} style={sHead.headerIcon} />
            </Pressable>
            <Pressable onPress={() => navigateToScreen('Plan')}>
              <Image source={require('./img/bPlan1.png')} style={sHead.headerIcon} />
            </Pressable>
            <Pressable onPress={() => navigateToScreen('Recetas')}>
              <Image source={require('./img/bRecetas1.png')} style={sHead.headerIcon} />
            </Pressable>
            <Pressable onPress={() => navigateToScreen('Refri')}>
              <Image source={require('./img/bRefri2.png')} style={sHead.headerIcon} />
            </Pressable>
            <Pressable onPress={() => navigateToScreen('Perfil')} style={sHead.headerIconEs}>
              <Image source={require('./img/bPerfil.png')} style={sHead.headerIcon2} />
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

  const handleBarCodeScanned = ({ type, data }: { type: string; data: string }) => {
    setScanned(true);
    alert(`Product code ${data} has been scanned!`);
  };

  const addNuevoIngrediente = () => {
    const newIngrediente: Ingrediente = {
      id: ingredientes.length,
      nombre,
      cantidad,
      caducidad,
    };
    setIngredientes([...ingredientes, newIngrediente]);
  };

  const removeNuevoIngrediente = (id: number) => {
    setIngredientes(ingredientes.filter((ing) => ing.id !== id));
  };

  const addExpiredProduct = () => {
    setScanned(false);
    setShowCamera(false);
    setShowScanner(false);
    addNuevoIngrediente();
    setNombre('');
    setCantidad('');
    setCaducidad('');
    setIsModalVisible(false);
  };

  const editIngrediente = () => {
    if (editIndex !== null) {
      const updatedIngredientes = ingredientes.map((ing, index) =>
        index === editIndex ? { ...ing, nombre, cantidad, caducidad } : ing
      );
      setIngredientes(updatedIngredientes);
    }
    setNombre('');
    setCantidad('');
    setCaducidad('');
    setIsEditModalVisible(false);
    setEditIndex(null);
  };

  const openEditModal = (index: number) => {
    const ingrediente = ingredientes[index];
    setEditIndex(index);
    setNombre(ingrediente.nombre);
    setCantidad(ingrediente.cantidad);
    setCaducidad(ingrediente.caducidad);
    setIsEditModalVisible(true);
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

  const renderCameraOrScanner = () => {
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
          <Pressable style={styles.scanAgainButtonFull} onPress={() => setScanned(false)}>
            <Text style={styles.scanAgainText}>Scan Again</Text>
          </Pressable>
        )}
        <Pressable
          style={styles.closeButton}
          onPress={() => (showCamera ? setShowCamera(false) : setShowScanner(false))}
        >
          <Text style={styles.closeText}>Cerrar</Text>
        </Pressable>
        <Pressable style={styles.addButtonFull} onPress={addExpiredProduct}>
          <Image source={require('./img/MasIcon.png')} style={styles.addIcon} />
        </Pressable>
      </View>
    );
  };

  if (showCamera || showScanner) {
    return renderCameraOrScanner();
  }

  return (
    <ErrorBoundary>
      <View style={styles.container}>
        <ScrollView style={styles.fullScreenBox} contentContainerStyle={styles.scrollContent}>
          {ingredientes.map((ingrediente, index) => (
            <View key={ingrediente.id} style={styles.nuevoIngrediente}>
              <Image source={require('./img/ImgDefecto.png')} style={styles.defaultImage} />
              <View style={styles.textWrapper}>
                <Text style={styles.txtIngrediente}>{ingrediente.nombre || 'Sin nombre'}</Text>
                <Text style={styles.porciones}>Porciones/{ingrediente.cantidad || '0'}</Text>
              </View>
              <View style={styles.textWrappers}>
                <Pressable onPress={() => openEditModal(index)}>
                  <Image source={require('./img/Editar.png')} style={styles.trashImage} />
                </Pressable>
                <Pressable onPress={() => removeNuevoIngrediente(ingrediente.id)}>
                  <Image source={require('./img/Basura.png')} style={styles.trashImage} />
                </Pressable>
              </View>
            </View>
          ))}
        </ScrollView>

        <View style={styles.bottomIconsContainer}>
          <View style={styles.leftIcons}>
            <Pressable style={styles.iconButton} onPress={openCamera}>
              <Image source={require('./img/Camara.png')} style={styles.cameraImage} />
            </Pressable>
            <Pressable style={styles.iconButton} onPress={openScanner}>
              <Image source={require('./img/Scanner.png')} style={styles.scannerImage} />
            </Pressable>
          </View>
          <Pressable style={styles.addButton} onPress={() => setIsModalVisible(true)}>
            <Image source={require('./img/MasCirculo.png')} style={styles.addIcon} />
          </Pressable>
        </View>

        <AddModal
          visible={isModalVisible}
          onClose={() => setIsModalVisible(false)}
          onSubmit={addExpiredProduct}
          nombre={nombre}
          setNombre={setNombre}
          cantidad={cantidad}
          setCantidad={setCantidad}
          caducidad={caducidad}
          setCaducidad={setCaducidad}
        />

        <EditModal
          visible={isEditModalVisible}
          onClose={() => setIsEditModalVisible(false)}
          onSubmit={editIngrediente}
          nombre={nombre}
          setNombre={setNombre}
          cantidad={cantidad}
          setCantidad={setCantidad}
          caducidad={caducidad}
          setCaducidad={setCaducidad}
        />
      </View>
    </ErrorBoundary>
  );
};

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
  },
  container: {
    flex: 1,
    marginTop: SCREEN_HEIGHT * 0.04,
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
    paddingBottom: SCREEN_HEIGHT * 0.05,
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
    width: SCREEN_WIDTH * 0.042,
    height: SCREEN_WIDTH * 0.042,
    marginLeft: SCREEN_WIDTH * 0.025,
  },
  textWrapper: {
    flex: 1,
    justifyContent: 'center',
  },
  textWrappers: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  txtIngrediente: {
    backgroundColor: 'white',
    color: '#000000',
    fontSize: SCREEN_WIDTH * 0.032,
    paddingHorizontal: SCREEN_WIDTH * 0.02,
    paddingVertical: SCREEN_HEIGHT * 0.005,
    borderRadius: SCREEN_WIDTH * 0.025,
    marginBottom: SCREEN_HEIGHT * 0.001,
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SCREEN_WIDTH * 0.05,
    marginTop: SCREEN_HEIGHT * 0.01,
    marginBottom: SCREEN_HEIGHT * 0.03,
  },
  leftIcons: {
    flexDirection: 'row',
    marginLeft: -SCREEN_WIDTH * 0.02,
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
    marginRight: -SCREEN_WIDTH * 0.02,
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
  scanAgainText: {
    color: '#40632F',
    fontWeight: 'bold',
    fontSize: SCREEN_WIDTH * 0.04,
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

export default Refri;