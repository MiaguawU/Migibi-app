import React, { Component, useState, useLayoutEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Pressable,
  ScrollView,
  Dimensions,
  Animated,
} from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { Calendar } from 'react-native-calendars';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { AddModal, EditModal } from './ModalRecetas';

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

const Recetas = () => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [ingredientes, setIngredientes] = useState<number[]>([0]);
  const [selectedDate, setSelectedDate] = useState<string | undefined>(undefined);
  const [showCalendar, setShowCalendar] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [recipeName, setRecipeName] = useState('');
  const [ingredientInputs, setIngredientInputs] = useState<string[]>(['']);
  const [procedureInputs, setProcedureInputs] = useState<string[]>(['']);
  const [portions, setPortions] = useState('');
  const [type, setType] = useState('');
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const navigateToScreen = (screenName: keyof RootStackParamList) => {
    navigation.navigate(screenName);
  };

  const slideIn = () => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const slideOut = () => {
    Animated.timing(slideAnim, {
      toValue: SCREEN_HEIGHT,
      duration: 300,
      useNativeDriver: true,
    }).start(() => setIsModalVisible(false));
  };

  const slideOutEdit = () => {
    Animated.timing(slideAnim, {
      toValue: SCREEN_HEIGHT,
      duration: 300,
      useNativeDriver: true,
    }).start(() => setIsEditModalVisible(false));
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
              <Image
                source={require('./img/bHoy1.png')}
                style={sHead.headerIcon}
                onError={() => console.error('Error loading bHoy1.png')}
              />
            </Pressable>
            <Pressable onPress={() => navigateToScreen('Plan')}>
              <Image
                source={require('./img/bPlan1.png')}
                style={sHead.headerIcon}
                onError={() => console.error('Error loading bPlan1.png')}
              />
            </Pressable>
            <Pressable onPress={() => navigateToScreen('Recetas')}>
              <Image
                source={require('./img/bRecetas2.png')}
                style={sHead.headerIcon}
                onError={() => console.error('Error loading bRecetas2.png')}
              />
            </Pressable>
            <Pressable onPress={() => navigateToScreen('Refri')}>
              <Image
                source={require('./img/bRefri1.png')}
                style={sHead.headerIcon}
                onError={() => console.error('Error loading bRefri1.png')}
              />
            </Pressable>
            <Pressable onPress={() => navigateToScreen('Perfil')} style={sHead.headerIconEs}>
              <Image
                source={require('./img/bPerfil.png')}
                style={sHead.headerIcon2}
                onError={() => console.error('Error loading bPerfil.png')}
              />
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
    setIngredientes([...ingredientes, ingredientes.length]);
  };

  const removeNuevoIngrediente = (index: number) => {
    setIngredientes(ingredientes.filter((_, i) => i !== index));
  };

  const addExpiredProduct = () => {
    setScanned(false);
    addNuevoIngrediente();
    setRecipeName('');
    setIngredientInputs(['']);
    setProcedureInputs(['']);
    setPortions('');
    setType('');
    slideOut();
  };

  const editIngrediente = () => {
    setRecipeName('');
    setIngredientInputs(['']);
    setProcedureInputs(['']);
    setPortions('');
    setType('');
    slideOutEdit();
    setEditIndex(null);
  };

  const openEditModal = (index: number) => {
    setEditIndex(index);
    setRecipeName('Pastel'); // Placeholder
    setIngredientInputs(['']);
    setProcedureInputs(['']);
    setPortions('10'); // Placeholder
    setType('');
    setIsEditModalVisible(true);
    slideIn();
  };

  const onDayPress = (day: any) => {
    setSelectedDate(day.dateString);
    setShowCalendar(false);
  };

  const markedDates = selectedDate
    ? {
        [selectedDate]: { selected: true, selectedColor: '#CEDFAD' },
      }
    : {};

  return (
    <ErrorBoundary>
      <View style={styles.container}>
        <ScrollView style={styles.fullScreenBox} contentContainerStyle={styles.scrollContent}>
          {ingredientes.map((_, index) => (
            <View key={index} style={styles.nuevoIngrediente}>
              <Image
                source={require('./img/ImgDefecto.png')}
                style={styles.defaultImage}
                onError={() => console.error('Error loading ImgDefecto.png')}
              />
              <View style={styles.textWrapper}>
                <Text style={styles.txtIngrediente}>Pastel</Text>
                <Text style={styles.porciones}>Porciones/10</Text>
              </View>
              <View style={styles.textWrappers}>
                <TouchableOpacity onPress={() => openEditModal(index)}>
                  <Image
                    source={require('./img/Editar.png')}
                    style={styles.trashImage}
                    onError={() => console.error('Error loading Editar.png')}
                  />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => removeNuevoIngrediente(index)}>
                  <Image
                    source={require('./img/Basura.png')}
                    style={styles.trashImage}
                    onError={() => console.error('Error loading Basura.png')}
                  />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>

        <TouchableOpacity
          style={styles.addButton}
          onPress={() => {
            console.log('Opening AddModal with props:', {
              visible: isModalVisible,
              recipeName,
              ingredientInputs,
              procedureInputs,
              portions,
              type,
            });
            setIsModalVisible(true);
            slideIn();
          }}
        >
          <Image
            source={require('./img/MasCirculo.png')}
            style={styles.addIcon}
            onError={() => console.error('Error loading MasCirculo.png')}
          />
        </TouchableOpacity>

        <AddModal
          visible={isModalVisible}
          onClose={slideOut}
          onSubmit={addExpiredProduct}
          recipeName={recipeName}
          setRecipeName={setRecipeName}
          ingredientInputs={ingredientInputs}
          setIngredientInputs={setIngredientInputs}
          procedureInputs={procedureInputs}
          setProcedureInputs={setProcedureInputs}
          portions={portions}
          setPortions={setPortions}
          type={type}
          setType={setType}
          slideAnim={slideAnim}
        />

        <EditModal
          visible={isEditModalVisible}
          onClose={slideOutEdit}
          onSubmit={editIngrediente}
          recipeName={recipeName}
          setRecipeName={setRecipeName}
          ingredientInputs={ingredientInputs}
          setIngredientInputs={setIngredientInputs}
          procedureInputs={procedureInputs}
          setProcedureInputs={setProcedureInputs}
          portions={portions}
          setPortions={setPortions}
          type={type}
          setType={setType}
          slideAnim={slideAnim}
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
    marginBottom: SCREEN_HEIGHT * 0.09, // Space for add button
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
  addButton: {
    position: 'absolute',
    bottom: SCREEN_HEIGHT * 0.03,
    right: SCREEN_WIDTH * 0.05,
    backgroundColor: '#CEDFAD',
    padding: SCREEN_WIDTH * 0.025,
    borderRadius: SCREEN_WIDTH * 0.012,
    zIndex: 10,
  },
  addIcon: {
    width: SCREEN_WIDTH * 0.08,
    height: SCREEN_WIDTH * 0.08,
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
    height: SCREEN_WIDTH * 0.16,
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

export default Recetas;