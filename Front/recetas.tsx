import React, { useState, useLayoutEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Pressable,
  ScrollView,
  Dimensions,
  Modal,
  TextInput,
  Animated,
  PanResponder,
} from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { Calendar } from 'react-native-calendars';
import { BarCodeScanner } from 'expo-barcode-scanner';

// Define el tipo de las pantallas para la navegación
type RootStackParamList = {
  Hoy: undefined;
  Plan: undefined;
  Recetas: undefined;
  Refri: undefined;
  Perfil: undefined;
};

// Obtener las dimensiones de la pantalla para hacer el diseño responsivo
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const EjemploCalendarioPersonalizado = () => {
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

  // Drag-and-drop state
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [draggingType, setDraggingType] = useState<'ingredient' | 'procedure' | null>(null);
  const ingredientPositions = useRef(ingredientInputs.map(() => new Animated.Value(0))).current;
  const procedurePositions = useRef(procedureInputs.map(() => new Animated.Value(0))).current;
  const dragOffset = useRef(new Animated.Value(0)).current;

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
              <Image source={require('../img/bHoy1.png')} style={sHead.headerIcon} />
            </Pressable>
            <Pressable onPress={() => navigateToScreen('Plan')}>
              <Image source={require('../img/bPlan1.png')} style={sHead.headerIcon} />
            </Pressable>
            <Pressable onPress={() => navigateToScreen('Recetas')}>
              <Image source={require('../img/bRecetas2.png')} style={sHead.headerIcon} />
            </Pressable>
            <Pressable onPress={() => navigateToScreen('Refri')}>
              <Image source={require('../img/bRefri1.png')} style={sHead.headerIcon} />
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

  const addIngredientInput = () => {
    setIngredientInputs([...ingredientInputs, '']);
    ingredientPositions.push(new Animated.Value(0));
  };

  const updateIngredientInput = (text: string, index: number) => {
    const updatedInputs = [...ingredientInputs];
    updatedInputs[index] = text;
    setIngredientInputs(updatedInputs);
  };

  const removeIngredientInput = (index: number) => {
    if (ingredientInputs.length > 1) {
      setIngredientInputs(ingredientInputs.filter((_, i) => i !== index));
      ingredientPositions.splice(index, 1);
    }
  };

  const addProcedureInput = () => {
    setProcedureInputs([...procedureInputs, '']);
    procedurePositions.push(new Animated.Value(0));
  };

  const updateProcedureInput = (text: string, index: number) => {
    const updatedInputs = [...procedureInputs];
    updatedInputs[index] = text;
    setProcedureInputs(updatedInputs);
  };

  const removeProcedureInput = (index: number) => {
    if (procedureInputs.length > 1) {
      setProcedureInputs(procedureInputs.filter((_, i) => i !== index));
      procedurePositions.splice(index, 1);
    }
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

  const createPanResponder = (index: number, type: 'ingredient' | 'procedure') => {
    const positions = type === 'ingredient' ? ingredientPositions : procedurePositions;
    const inputs = type === 'ingredient' ? ingredientInputs : procedureInputs;
    const setInputs = type === 'ingredient' ? setIngredientInputs : setProcedureInputs;

    return PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        setDraggingIndex(index);
        setDraggingType(type);
        dragOffset.setValue(0);
      },
      onPanResponderMove: (_, gestureState) => {
        dragOffset.setValue(gestureState.dy);

        const itemHeight = SCREEN_HEIGHT * 0.07;
        const relativePosition = gestureState.dy / itemHeight;
        const newIndex = Math.max(0, Math.min(inputs.length - 1, index + Math.round(relativePosition)));

        if (newIndex !== index) {
          const newInputs = [...inputs];
          const [movedItem] = newInputs.splice(index, 1);
          newInputs.splice(newIndex, 0, movedItem);
          setInputs(newInputs);

          const newPositions = [...positions];
          const [movedPosition] = newPositions.splice(index, 1);
          newPositions.splice(newIndex, 0, movedPosition);
          positions.forEach((pos, i) => pos.setValue(0));
          setDraggingIndex(newIndex);
        }
      },
      onPanResponderRelease: () => {
        setDraggingIndex(null);
        setDraggingType(null);
        dragOffset.setValue(0);
        positions.forEach((pos) => pos.setValue(0));
      },
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.fullScreenBox} contentContainerStyle={styles.scrollContent}>
        {ingredientes.map((_, index) => (
          <View key={index} style={styles.nuevoIngrediente}>
            <Image source={require('../img/ImgDefecto.png')} style={styles.defaultImage} />
            <View style={styles.textWrapper}>
              <Text style={styles.txtIngrediente}>Pastel</Text>
              <Text style={styles.porciones}>Porciones/10</Text>
            </View>
            <View style={styles.textWrappers}>
              <TouchableOpacity onPress={() => openEditModal(index)}>
                <Image source={require('../img/Editar.png')} style={styles.trashImage} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => removeNuevoIngrediente(index)}>
                <Image source={require('../img/Basura.png')} style={styles.trashImage} />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => {
          setIsModalVisible(true);
          slideIn();
        }}
      >
        <Image source={require('../img/MasCirculo.png')} style={styles.addIcon} />
      </TouchableOpacity>

      {/* Modal for MasIcon (Add) */}
      <Modal transparent={true} visible={isModalVisible} onRequestClose={slideOut}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPressOut={slideOut}>
          <Animated.View
            style={[styles.modalContainer, { transform: [{ translateY: slideAnim }] }]}
          >
            <View style={styles.modalHandle} />
            <View style={styles.inputRow}>
              <TextInput
                style={styles.nameInput}
                value={recipeName}
                onChangeText={setRecipeName}
                placeholder="Nombre"
                placeholderTextColor="#888"
              />
              <View style={styles.actionIcons}>
                <TouchableOpacity onPress={addExpiredProduct}>
                  <Image source={require('../img/Palomita.png')} style={styles.actionIcon} />
                </TouchableOpacity>
                <TouchableOpacity>
                  <Image source={require('../img/Sarten.png')} style={styles.actionIcon} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.panel}>
              <Text style={styles.panelTitle}>Ingredientes</Text>
              <ScrollView style={styles.panelScroll} nestedScrollEnabled={true}>
                {ingredientInputs.map((value, index) => (
                  <Animated.View
                    key={index}
                    style={[
                      styles.inputWithIcons,
                      {
                        transform: [
                          {
                            translateY:
                              draggingIndex === index && draggingType === 'ingredient'
                                ? dragOffset
                                : ingredientPositions[index],
                          },
                        ],
                        zIndex: draggingIndex === index && draggingType === 'ingredient' ? 10 : 0,
                        opacity: draggingIndex === index && draggingType === 'ingredient' ? 0.8 : 1,
                        backgroundColor:
                          draggingIndex === index && draggingType === 'ingredient'
                            ? '#f0f0f0'
                            : 'transparent',
                      },
                    ]}
                  >
                    <View
                      {...createPanResponder(index, 'ingredient').panHandlers}
                      style={styles.dragHandle}
                    >
                      <Image source={require('../img/Deslizador.png')} style={styles.dragIcon} />
                    </View>
                    <TextInput
                      style={styles.panelInput}
                      value={value}
                      onChangeText={(text) => updateIngredientInput(text, index)}
                      placeholder={`Ingrediente ${index + 1}`}
                      placeholderTextColor="#888"
                    />
                    <TouchableOpacity onPress={() => removeIngredientInput(index)}>
                      <Image source={require('../img/Basura.png')} style={styles.trashIcon} />
                    </TouchableOpacity>
                  </Animated.View>
                ))}
              </ScrollView>
              <TouchableOpacity style={styles.panelAddButton} onPress={addIngredientInput}>
                <Image source={require('../img/MasIcon.png')} style={styles.panelAddIcon} />
              </TouchableOpacity>
            </View>

            <View style={styles.panel}>
              <Text style={styles.panelTitle}>Procedimiento</Text>
              <ScrollView style={styles.panelScroll} nestedScrollEnabled={true}>
                {procedureInputs.map((value, index) => (
                  <Animated.View
                    key={index}
                    style={[
                      styles.inputWithIcons,
                      {
                        transform: [
                          {
                            translateY:
                              draggingIndex === index && draggingType === 'procedure'
                                ? dragOffset
                                : procedurePositions[index],
                          },
                        ],
                        zIndex: draggingIndex === index && draggingType === 'procedure' ? 10 : 0,
                        opacity: draggingIndex === index && draggingType === 'procedure' ? 0.8 : 1,
                        backgroundColor:
                          draggingIndex === index && draggingType === 'procedure'
                            ? '#f0f0f0'
                            : 'transparent',
                      },
                    ]}
                  >
                    <View
                      {...createPanResponder(index, 'procedure').panHandlers}
                      style={styles.dragHandle}
                    >
                      <Image source={require('../img/Deslizador.png')} style={styles.dragIcon} />
                    </View>
                    <TextInput
                      style={styles.panelInput}
                      value={value}
                      onChangeText={(text) => updateProcedureInput(text, index)}
                      placeholder={`Paso ${index + 1}`}
                      placeholderTextColor="#888"
                    />
                    <TouchableOpacity onPress={() => removeProcedureInput(index)}>
                      <Image source={require('../img/Basura.png')} style={styles.trashIcon} />
                    </TouchableOpacity>
                  </Animated.View>
                ))}
              </ScrollView>
              <TouchableOpacity style={styles.panelAddButton} onPress={addProcedureInput}>
                <Image source={require('../img/MasIcon.png')} style={styles.panelAddIcon} />
              </TouchableOpacity>
            </View>

            <View style={styles.bottomSection}>
              <Image source={require('../img/Compartir.png')} style={styles.bottomIcon} />
              <TextInput
                style={styles.bottomInput}
                value={portions}
                onChangeText={setPortions}
                placeholder="Porciones"
                placeholderTextColor="#888"
                keyboardType="numeric"
              />
              <TextInput
                style={styles.bottomInput}
                value={type}
                onChangeText={setType}
                placeholder="Tipo"
                placeholderTextColor="#888"
              />
            </View>
          </Animated.View>
        </TouchableOpacity>
      </Modal>

      {/* Modal for Editar (Edit) */}
      <Modal transparent={true} visible={isEditModalVisible} onRequestClose={slideOutEdit}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPressOut={slideOutEdit}>
          <Animated.View
            style={[styles.modalContainer, { transform: [{ translateY: slideAnim }] }]}
          >
            <View style={styles.modalHandle} />
            <View style={styles.inputRow}>
              <TextInput
                style={styles.nameInput}
                value={recipeName}
                onChangeText={setRecipeName}
                placeholder="Nombre"
                placeholderTextColor="#888"
              />
              <View style={styles.actionIcons}>
                <TouchableOpacity onPress={editIngrediente}>
                  <Image source={require('../img/Palomita.png')} style={styles.actionIcon} />
                </TouchableOpacity>
                <TouchableOpacity>
                  <Image source={require('../img/Sarten.png')} style={styles.actionIcon} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.panel}>
              <Text style={styles.panelTitle}>Ingredientes</Text>
              <ScrollView style={styles.panelScroll} nestedScrollEnabled={true}>
                {ingredientInputs.map((value, index) => (
                  <Animated.View
                    key={index}
                    style={[
                      styles.inputWithIcons,
                      {
                        transform: [
                          {
                            translateY:
                              draggingIndex === index && draggingType === 'ingredient'
                                ? dragOffset
                                : ingredientPositions[index],
                          },
                        ],
                        zIndex: draggingIndex === index && draggingType === 'ingredient' ? 10 : 0,
                        opacity: draggingIndex === index && draggingType === 'ingredient' ? 0.8 : 1,
                        backgroundColor:
                          draggingIndex === index && draggingType === 'ingredient'
                            ? '#f0f0f0'
                            : 'transparent',
                      },
                    ]}
                  >
                    <View
                      {...createPanResponder(index, 'ingredient').panHandlers}
                      style={styles.dragHandle}
                    >
                      <Image source={require('../img/Deslizador.png')} style={styles.dragIcon} />
                    </View>
                    <TextInput
                      style={styles.panelInput}
                      value={value}
                      onChangeText={(text) => updateIngredientInput(text, index)}
                      placeholder={`Ingrediente ${index + 1}`}
                      placeholderTextColor="#888"
                    />
                    <TouchableOpacity onPress={() => removeIngredientInput(index)}>
                      <Image source={require('../img/Basura.png')} style={styles.trashIcon} />
                    </TouchableOpacity>
                  </Animated.View>
                ))}
              </ScrollView>
              <TouchableOpacity style={styles.panelAddButton} onPress={addIngredientInput}>
                <Image source={require('../img/MasIcon.png')} style={styles.panelAddIcon} />
              </TouchableOpacity>
            </View>

            <View style={styles.panel}>
              <Text style={styles.panelTitle}>Procedimiento</Text>
              <ScrollView style={styles.panelScroll} nestedScrollEnabled={true}>
                {procedureInputs.map((value, index) => (
                  <Animated.View
                    key={index}
                    style={[
                      styles.inputWithIcons,
                      {
                        transform: [
                          {
                            translateY:
                              draggingIndex === index && draggingType === 'procedure'
                                ? dragOffset
                                : procedurePositions[index],
                          },
                        ],
                        zIndex: draggingIndex === index && draggingType === 'procedure' ? 10 : 0,
                        opacity: draggingIndex === index && draggingType === 'procedure' ? 0.8 : 1,
                        backgroundColor:
                          draggingIndex === index && draggingType === 'procedure'
                            ? '#f0f0f0'
                            : 'transparent',
                      },
                    ]}
                  >
                    <View
                      {...createPanResponder(index, 'procedure').panHandlers}
                      style={styles.dragHandle}
                    >
                      <Image source={require('../img/Deslizador.png')} style={styles.dragIcon} />
                    </View>
                    <TextInput
                      style={styles.panelInput}
                      value={value}
                      onChangeText={(text) => updateProcedureInput(text, index)}
                      placeholder={`Paso ${index + 1}`}
                      placeholderTextColor="#888"
                    />
                    <TouchableOpacity onPress={() => removeProcedureInput(index)}>
                      <Image source={require('../img/Basura.png')} style={styles.trashIcon} />
                    </TouchableOpacity>
                  </Animated.View>
                ))}
              </ScrollView>
              <TouchableOpacity style={styles.panelAddButton} onPress={addProcedureInput}>
                <Image source={require('../img/MasIcon.png')} style={styles.panelAddIcon} />
              </TouchableOpacity>
            </View>

            <View style={styles.bottomSection}>
              <Image source={require('../img/Compartir.png')} style={styles.bottomIcon} />
              <TextInput
                style={styles.bottomInput}
                value={portions}
                onChangeText={setPortions}
                placeholder="Porciones"
                placeholderTextColor="#888"
                keyboardType="numeric"
              />
              <TextInput
                style={styles.bottomInput}
                value={type}
                onChangeText={setType}
                placeholder="Tipo"
                placeholderTextColor="#888"
              />
            </View>
          </Animated.View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: SCREEN_WIDTH * 0.05,
    borderTopRightRadius: SCREEN_WIDTH * 0.05,
    padding: SCREEN_WIDTH * 0.05,
    paddingBottom: SCREEN_HEIGHT * 0.05,
    maxHeight: SCREEN_HEIGHT * 0.8,
  },
  modalHandle: {
    width: SCREEN_WIDTH * 0.1,
    height: SCREEN_HEIGHT * 0.005,
    backgroundColor: '#ccc',
    borderRadius: SCREEN_WIDTH * 0.01,
    marginBottom: SCREEN_HEIGHT * 0.02,
    alignSelf: 'center',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SCREEN_HEIGHT * 0.02,
  },
  nameInput: {
    flex: 1,
    height: SCREEN_HEIGHT * 0.05,
    backgroundColor: '#CAE2B5',
    borderColor: '#8CA966',
    borderWidth: SCREEN_WIDTH * 0.003,
    borderRadius: SCREEN_WIDTH * 0.02,
    paddingHorizontal: SCREEN_WIDTH * 0.03,
    fontSize: SCREEN_WIDTH * 0.04,
    color: '#000',
    marginRight: SCREEN_WIDTH * 0.02,
  },
  actionIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionIcon: {
    width: SCREEN_WIDTH * 0.06,
    height: SCREEN_WIDTH * 0.06,
    marginHorizontal: SCREEN_WIDTH * 0.01,
  },
  panel: {
    marginBottom: SCREEN_HEIGHT * 0.02,
  },
  panelTitle: {
    fontSize: SCREEN_WIDTH * 0.045,
    fontWeight: 'bold',
    color: '#40632F',
    marginBottom: SCREEN_HEIGHT * 0.01,
  },
  panelScroll: {
    minHeight: SCREEN_HEIGHT * 0.2,
    maxHeight: SCREEN_HEIGHT * 0.2,
    backgroundColor: '#CAE2B5',
    borderColor: '#8CA966',
    borderWidth: SCREEN_WIDTH * 0.003,
    borderRadius: SCREEN_WIDTH * 0.02,
    padding: SCREEN_WIDTH * 0.02,
  },
  panelInput: {
    flex: 1,
    height: SCREEN_HEIGHT * 0.05,
    backgroundColor: '#fff',
    borderRadius: SCREEN_WIDTH * 0.02,
    paddingHorizontal: SCREEN_WIDTH * 0.03,
    fontSize: SCREEN_WIDTH * 0.04,
    color: '#000',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  panelAddButton: {
    alignSelf: 'center',
    marginTop: SCREEN_HEIGHT * 0.01,
  },
  panelAddIcon: {
    width: SCREEN_WIDTH * 0.06,
    height: SCREEN_WIDTH * 0.06,
  },
  bottomSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bottomIcon: {
    width: SCREEN_WIDTH * 0.06,
    height: SCREEN_WIDTH * 0.06,
    marginRight: SCREEN_WIDTH * 0.02,
  },
  bottomInput: {
    flex: 1,
    height: SCREEN_HEIGHT * 0.05,
    backgroundColor: '#CAE2B5',
    borderColor: '#8CA966',
    borderWidth: SCREEN_WIDTH * 0.003,
    borderRadius: SCREEN_WIDTH * 0.02,
    paddingHorizontal: SCREEN_WIDTH * 0.03,
    fontSize: SCREEN_WIDTH * 0.04,
    color: '#000',
    marginHorizontal: SCREEN_WIDTH * 0.01,
  },
  inputWithIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SCREEN_HEIGHT * 0.01,
  },
  dragHandle: {
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SCREEN_WIDTH * 0.02,
  },
  dragIcon: {
    width: SCREEN_WIDTH * 0.06,
    height: SCREEN_WIDTH * 0.06,
  },
  trashIcon: {
    width: SCREEN_WIDTH * 0.06,
    height: SCREEN_WIDTH * 0.06,
    marginLeft: SCREEN_WIDTH * 0.02,
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

export default EjemploCalendarioPersonalizado;