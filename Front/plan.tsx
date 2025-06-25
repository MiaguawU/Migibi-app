import React, { Component, useState, useRef, useLayoutEffect } from 'react';
import {
  StyleSheet,
  Text,
  Pressable,
  View,
  Image,
  TextInput,
  ScrollView,
  Dimensions,
  Animated,
} from 'react-native';
import { Provider } from '@ant-design/react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { BasicModal, AnimatedModal } from './Componentes/ModalPlan';
import { Picker } from '@react-native-picker/picker';

// Define el tipo de las pantallas para la navegación
type RootStackParamList = {
  Hoy: undefined;
  Plan: undefined;
  Recetas: undefined;
  Refri: undefined;
  Perfil: undefined;
};

// Obtener las dimensiones de la pantalla para hacer el diseño responsivo
export const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

type PlanScreenNavigationProp = NavigationProp<RootStackParamList, 'Plan'>;

// Error Boundary Component
class ErrorBoundary extends Component<{ children: React.ReactNode }, { hasError: boolean; error?: string }> {
  state = { hasError: false, error: undefined };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error: error.message };
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error: {this.state.error || 'Verifica la consola'}</Text>
        </View>
      );
    }
    return this.props.children;
  }
}

export default function Plan() {
  const navigation = useNavigation<PlanScreenNavigationProp>();
  // Estado para los botones horizontales
  const [selectedButtons, setSelectedButtons] = useState({
    faltante: false,
    caducar: false,
    desayuno: false,
    comida: false,
    cena: false,
  });

  // Estado para los modales
  const [basicModalVisible, setBasicModalVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [fecha, setFecha] = useState('');
  const [tipo, setTipo] = useState('opcion 1');
  const [porciones, setPorciones] = useState('');

  // Animación para el modal animado
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  // Función para abrir el modal animado con animación
  const openModal = () => {
    console.log('Opening AnimatedModal with props:', { fecha, tipo, porciones, slideAnim });
    setModalVisible(true);
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  // Función para cerrar el modal animado con animación
  const closeModal = () => {
    Animated.timing(slideAnim, {
      toValue: SCREEN_HEIGHT,
      duration: 300,
      useNativeDriver: true,
    }).start(() => setModalVisible(false));
  };

  // Función para abrir el modal básico
  const openBasicModal = () => {
    setBasicModalVisible(true);
  };

  // Función para cerrar el modal básico
  const closeBasicModal = () => {
    setBasicModalVisible(false);
  };

  // Función para cerrar el modal básico y abrir el modal animado
  const handleBasicModalOption = () => {
    closeBasicModal();
    openModal();
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerBackTitleVisible: true,
      headerTintColor: '#40632F',
      headerTitle: '',
      headerStyle: {
        height: SCREEN_HEIGHT * 0.15,
      },
      headerRight: () => (
        <View style={sHead.headerButtonsContainer}>
          <View style={sHead.naveAl}>
            <Pressable onPress={() => navigateToScreen('Hoy')}>
              <Image
                source={require('../img/bHoy1.png')}
                style={sHead.headerIcon}
                onError={() => console.error('Error loading bHoy1.png')}
              />
            </Pressable>
            <Pressable onPress={() => navigateToScreen('Plan')}>
              <Image
                source={require('../img/bPlan2.png')}
                style={sHead.headerIcon}
                onError={() => console.error('Error loading bPlan2.png')}
              />
            </Pressable>
            <Pressable onPress={() => navigateToScreen('Recetas')}>
              <Image
                source={require('../img/bRecetas1.png')}
                style={sHead.headerIcon}
                onError={() => console.error('Error loading bRecetas1.png')}
              />
            </Pressable>
            <Pressable onPress={() => navigateToScreen('Refri')}>
              <Image
                source={require('../img/bRefri1.png')}
                style={sHead.headerIcon}
                onError={() => console.error('Error loading bRefri1.png')}
              />
            </Pressable>
            <Pressable onPress={() => navigateToScreen('Perfil')} style={sHead.headerIconEs}>
              <Image
                source={require('../img/bPerfil.png')}
                style={sHead.headerIcon2}
                onError={() => console.error('Error loading bPerfil.png')}
              />
            </Pressable>
          </View>
        </View>
      ),
    });
  }, [navigation]);

  // Función para manejar el cambio de imagen al presionar un botón
  const navigateToScreen = (screenName: keyof RootStackParamList) => {
    navigation.navigate(screenName);
  };

  // Función para manejar el cambio de imagen al presionar un botón
  const handlePress = (button: keyof typeof selectedButtons) => {
    setSelectedButtons((prevState) => ({
      ...prevState,
      [button]: !prevState[button],
    }));
  };

  return (
    <Provider>
      <ErrorBoundary>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {/* Botones Horizontales */}
          <View style={bIn.botonesIn}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={bIn.scrollContainer}>
              <Pressable style={bIn.button} onPress={() => handlePress('faltante')}>
                <Image
                  source={selectedButtons.faltante ? require('../img/biFal2.png') : require('../img/biFal.png')}
                  style={bIn.imgbi}
                  onError={() => console.error('Error loading biFal.png or biFal2.png')}
                />
                <Text style={bIn.textbi}>Faltante</Text>
              </Pressable>
              <Pressable style={bIn.button} onPress={() => handlePress('caducar')}>
                <Image
                  source={selectedButtons.caducar ? require('../img/biCa2.png') : require('../img/biCa.png')}
                  style={bIn.imgbi}
                  onError={() => console.error('Error loading biCa.png or biCa2.png')}
                />
                <Text style={bIn.textbi}>Caducar</Text>
              </Pressable>
              <Pressable style={bIn.button} onPress={() => handlePress('desayuno')}>
                <Image
                  source={selectedButtons.desayuno ? require('../img/biDes2.png') : require('../img/biDes.png')}
                  style={bIn.imgbi}
                  onError={() => console.error('Error loading biDes.png or biDes2.png')}
                />
                <Text style={bIn.textbi}>Desayuno</Text>
              </Pressable>
              <Pressable style={bIn.button} onPress={() => handlePress('comida')}>
                <Image
                  source={selectedButtons.comida ? require('../img/biCom2.png') : require('../img/biCom.png')}
                  style={bIn.imgbi}
                  onError={() => console.error('Error loading biCom.png or biCom2.png')}
                />
                <Text style={bIn.textbi}>Comida</Text>
              </Pressable>
              <Pressable style={bIn.button} onPress={() => handlePress('cena')}>
                <Image
                  source={selectedButtons.cena ? require('../img/biCe2.png') : require('../img/biCe.png')}
                  style={bIn.imgbi}
                  onError={() => console.error('Error loading biCe.png or biCe2.png')}
                />
                <Text style={bIn.textbi}>Cena</Text>
              </Pressable>
            </ScrollView>
          </View>

          {/* Panel deslizable */}
          <View style={styles.panel}>
            <ScrollView contentContainerStyle={styles.panelScroll}>
              {/* Fila superior con imágenes y área de texto */}
              <View style={styles.panelHeader}>
                <Image
                  source={require('../img/fIzq.png')}
                  style={styles.panelIcon}
                  resizeMode="contain"
                  onError={() => console.error('Error loading fIzq.png')}
                />
                <TextInput
                  style={styles.panelTextInput}
                  placeholder="Escribe aquí..."
                  placeholderTextColor="#888"
                />
                <Image
                  source={require('../img/fDerecha.png')}
                  style={styles.panelIcon}
                  resizeMode="contain"
                  onError={() => console.error('Error loading fDerecha.png')}
                />
              </View>

              {/* Contenido estático del contenedor */}
              <View style={styles.inputColumn}>
                <View style={styles.sartenRow}>
                  <Image
                    source={require('../img/Sarten.png')}
                    style={styles.sartenIcon}
                    resizeMode="contain"
                    onError={() => console.error('Error loading Sarten.png')}
                  />
                  <TextInput
                    style={styles.inputMiddle}
                    placeholder="Editar..."
                    placeholderTextColor="#888"
                  />
                  <View style={styles.iconContainer}>
                    <Image
                      source={require('../img/Editar.png')}
                      style={styles.editIcon}
                      resizeMode="contain"
                      onError={() => console.error('Error loading Editar.png')}
                    />
                    <Pressable style={styles.trashButton}>
                      <Image
                        source={require('../img/Basura.png')}
                        style={styles.trashIcon}
                        resizeMode="contain"
                        onError={() => console.error('Error loading Basura.png')}
                      />
                    </Pressable>
                  </View>
                </View>
                <TextInput
                  style={styles.inputSmall}
                  placeholder="Porciones: "
                  placeholderTextColor="#888"
                />
              </View>
            </ScrollView>
          </View>

          {/* Imágenes inferiores */}
          <View style={styles.bottomIcons}>
            <View style={styles.bottomLeftIcons}>
              <Image
                source={require('../img/bComp.png')}
                style={styles.bottomIcon}
                resizeMode="contain"
                onError={() => console.error('Error loading bComp.png')}
              />
              <Image
                source={require('../img/bDesc.png')}
                style={styles.bottomIcon}
                resizeMode="contain"
                onError={() => console.error('Error loading bDesc.png')}
              />
            </View>
            <View style={styles.bottomRightIcons}>
              <Pressable onPress={openBasicModal}>
                <Image
                  source={require('../img/MasCirculo.png')}
                  style={styles.bottomCirculo}
                  resizeMode="contain"
                  onError={() => console.error('Error loading MasCirculo.png')}
                />
              </Pressable>
              <Image
                source={require('../img/bV2.png')}
                style={styles.bottomIcon}
                resizeMode="contain"
                onError={() => console.error('Error loading bV2.png')}
              />
            </View>
          </View>

          {/* Modals */}
          <BasicModal
            visible={basicModalVisible}
            onClose={closeBasicModal}
            onOptionSelect={handleBasicModalOption}
          />
          <AnimatedModal
            visible={modalVisible}
            onClose={closeModal}
            fecha={fecha}
            setFecha={setFecha}
            tipo={tipo}
            setTipo={setTipo}
            porciones={porciones}
            setPorciones={setPorciones}
            slideAnim={slideAnim}
          />
        </ScrollView>
      </ErrorBoundary>
    </Provider>
  );
}

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

const bIn = StyleSheet.create({
  button: {
    alignItems: 'center',
    marginHorizontal: SCREEN_WIDTH * 0.02,
  },
  imgbi: {
    width: SCREEN_WIDTH * 0.15,
    height: SCREEN_WIDTH * 0.15,
  },
  textbi: {
    fontFamily: 'Jomhuria',
    fontSize: SCREEN_WIDTH * 0.06,
    color: '#6B8762',
  },
  botonesIn: {
    marginTop: SCREEN_HEIGHT * 0.04,
    marginBottom: SCREEN_HEIGHT * 0.015,
    width: '100%',
  },
  scrollContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: SCREEN_WIDTH * 0.02,
  },
});

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
  scrollContainer: {
    flexGrow: 1,
    alignItems: 'center',
    paddingVertical: SCREEN_HEIGHT * 0.02,
  },
  panel: {
    flex: 1,
    width: '90%',
    backgroundColor: '#CAE2B5',
    borderColor: '#8CA966',
    borderWidth: 2,
    borderRadius: SCREEN_WIDTH * 0.03,
    marginTop: SCREEN_HEIGHT * 0.015,
    marginBottom: SCREEN_HEIGHT * 0.02,
  },
  panelScroll: {
    padding: SCREEN_WIDTH * 0.04,
  },
  panelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SCREEN_HEIGHT * 0.02,
  },
  panelIcon: {
    width: SCREEN_WIDTH * 0.060,
    height: SCREEN_WIDTH * 0.1,
  },
  panelTextInput: {
    flex: 1,
    height: SCREEN_HEIGHT * 0.05,
    backgroundColor: '#CAE2B5',
    borderColor: '#CAE2B5',
    borderWidth: 2,
    borderRadius: SCREEN_WIDTH * 0.03,
    paddingHorizontal: SCREEN_WIDTH * 0.03,
    fontSize: SCREEN_WIDTH * 0.04,
    marginHorizontal: SCREEN_WIDTH * 0.02,
  },
  inputColumn: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    width: '100%',
  },
  sartenRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SCREEN_HEIGHT * 0.005,
    width: '100%',
  },
  sartenIcon: {
    width: SCREEN_WIDTH * 0.1,
    height: SCREEN_WIDTH * 0.1,
    marginRight: SCREEN_WIDTH * 0.02,
  },
  inputMiddle: {
    width: SCREEN_WIDTH * 0.55,
    height: SCREEN_HEIGHT * 0.05,
    backgroundColor: 'white',
    borderColor: '#8CA966',
    borderWidth: 2,
    borderRadius: SCREEN_WIDTH * 0.05,
    paddingHorizontal: SCREEN_WIDTH * 0.03,
    fontSize: SCREEN_WIDTH * 0.04,
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editIcon: {
    width: SCREEN_WIDTH * 0.05,
    height: SCREEN_WIDTH * 0.05,
    marginRight: SCREEN_WIDTH * 0.02,
  },
  trashButton: {},
  trashIcon: {
    width: SCREEN_WIDTH * 0.05,
    height: SCREEN_WIDTH * 0.05,
  },
  inputSmall: {
    width: SCREEN_WIDTH * 0.3,
    height: SCREEN_HEIGHT * 0.03,
    backgroundColor: 'white',
    borderColor: '#8CA966',
    borderWidth: 2,
    borderRadius: SCREEN_WIDTH * 0.03,
    paddingHorizontal: SCREEN_WIDTH * 0.03,
    fontSize: SCREEN_WIDTH * 0.03,
    marginLeft: SCREEN_WIDTH * 0.12,
  },
  bottomIcons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '90%',
    marginBottom: SCREEN_HEIGHT * 0.02,
  },
  bottomLeftIcons: {
    flexDirection: 'row',
  },
  bottomRightIcons: {
    flexDirection: 'row',
  },
  bottomIcon: {
    width: SCREEN_WIDTH * 0.12,
    height: SCREEN_WIDTH * 0.12,
    marginRight: SCREEN_WIDTH * 0.02,
  },
  bottomCirculo: {
    marginTop: SCREEN_HEIGHT * 0.0055,
    width: SCREEN_WIDTH * 0.09,
    height: SCREEN_WIDTH * 0.09,
    marginRight: SCREEN_WIDTH * 0.03,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: SCREEN_WIDTH * 0.05,
    borderTopRightRadius: SCREEN_WIDTH * 0.05,
    padding: SCREEN_WIDTH * 0.05,
    height: SCREEN_HEIGHT * 0.5,
  },
  modalTop: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SCREEN_HEIGHT * 0.01,
  },
  modalBackButton: {
    padding: SCREEN_WIDTH * 0.02,
  },
  modalBackIcon: {
    width: SCREEN_WIDTH * 0.06,
    height: SCREEN_WIDTH * 0.06,
  },
  modalSeparator: {
    height: 1,
    backgroundColor: '#8CA966',
    marginBottom: SCREEN_HEIGHT * 0.02,
  },
  modalHeader: {
    backgroundColor: '#8CA966',
    paddingVertical: SCREEN_HEIGHT * 0.02,
    borderRadius: SCREEN_WIDTH * 0.03,
    alignItems: 'center',
    marginBottom: SCREEN_HEIGHT * 0.02,
  },
  modalHeaderText: {
    fontSize: SCREEN_WIDTH * 0.06,
    color: '#FFF',
    fontWeight: 'bold',
  },
  modalContent: {
    flex: 1,
  },
  modalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SCREEN_HEIGHT * 0.02,
  },
  modalLabel: {
    fontSize: SCREEN_WIDTH * 0.045,
    color: '#40632F',
    width: SCREEN_WIDTH * 0.2,
  },
  modalInput: {
    flex: 1,
    height: SCREEN_HEIGHT * 0.05,
    backgroundColor: 'white',
    borderColor: '#8CA966',
    borderWidth: 2,
    borderRadius: SCREEN_WIDTH * 0.03,
    paddingHorizontal: SCREEN_WIDTH * 0.03,
    fontSize: SCREEN_WIDTH * 0.04,
    marginRight: SCREEN_WIDTH * 0.02,
  },
  modalIcon: {
    width: SCREEN_WIDTH * 0.08,
    height: SCREEN_WIDTH * 0.08,
  },
  pickerContainer: {
    flex: 1,
    height: SCREEN_HEIGHT * 0.05,
    backgroundColor: 'white',
    borderColor: '#8CA966',
    borderWidth: 2,
    borderRadius: SCREEN_WIDTH * 0.03,
    justifyContent: 'center',
  },
  picker: {
    height: SCREEN_HEIGHT * 0.05,
    color: '#40632F',
  },
  modalButton: {
    alignSelf: 'flex-end',
    marginTop: SCREEN_HEIGHT * 0.02,
  },
  modalButtonIcon: {
    width: SCREEN_WIDTH * 0.08,
    height: SCREEN_WIDTH * 0.08,
  },
  basicModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  basicModalContainer: {
    backgroundColor: '#FFF',
    borderRadius: SCREEN_WIDTH * 0.05,
    padding: SCREEN_WIDTH * 0.05,
    width: SCREEN_WIDTH * 0.8,
    alignItems: 'center',
  },
  basicModalBackButton: {
    alignSelf: 'flex-start',
    padding: SCREEN_WIDTH * 0.02,
  },
  basicModalBackIcon: {
    width: SCREEN_WIDTH * 0.06,
    height: SCREEN_WIDTH * 0.06,
  },
  basicModalSeparator: {
    height: 1,
    backgroundColor: '#8CA966',
    width: '100%',
    marginVertical: SCREEN_HEIGHT * 0.02,
  },
  basicModalText: {
    fontSize: SCREEN_WIDTH * 0.045,
    color: '#40632F',
    textAlign: 'center',
    marginBottom: SCREEN_HEIGHT * 0.03,
  },
  basicModalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  basicModalButton: {
    flex: 1,
    paddingVertical: SCREEN_HEIGHT * 0.015,
    borderRadius: SCREEN_WIDTH * 0.03,
    alignItems: 'center',
    marginHorizontal: SCREEN_WIDTH * 0.02,
  },
  basicModalButtonNo: {
    backgroundColor: '#D9534F',
  },
  basicModalButtonYes: {
    backgroundColor: '#8CA966',
  },
  basicModalButtonText: {
    fontSize: SCREEN_WIDTH * 0.04,
    color: '#FFF',
    fontWeight: 'bold',
  },
});