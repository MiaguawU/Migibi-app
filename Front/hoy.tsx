import React, { useState, useLayoutEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  ScrollView,
  Dimensions,
  TextInput,
  Modal,
  TouchableOpacity,
} from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { Calendar } from 'react-native-calendars';
import { Provider, Button } from '@ant-design/react-native';

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
  const [selectedDate, setSelectedDate] = useState<string | undefined>(undefined);
  const [showCalendar, setShowCalendar] = useState(false);
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  // Estados del primer código
  const [containers, setContainers] = useState([0]);
  const [selectedButtons, setSelectedButtons] = useState({
    faltante: false,
    caducar: false,
    desayuno: false,
    comida: false,
    cena: false,
  });
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [comida, setComida] = useState('');
  const [editar, setEditar] = useState('');
  const [porciones, setPorciones] = useState('');

  const navigateToScreen = (screenName: keyof RootStackParamList) => {
    navigation.navigate(screenName);
  };

  const handlePress = (button: keyof typeof selectedButtons) => {
    setSelectedButtons((prevState) => ({
      ...prevState,
      [button]: !prevState[button],
    }));
  };

  const addContainer = () => {
    setContainers([...containers, containers.length]);
    setComida('');
    setEditar('');
    setPorciones('');
    setIsModalVisible(false);
  };

  const removeContainer = (index: number) => {
    setContainers(containers.filter((_, i) => i !== index));
  };

  const editContainer = () => {
    // Clear inputs and close modal without adding a new container
    setComida('');
    setEditar('');
    setPorciones('');
    setIsEditModalVisible(false);
    setEditIndex(null);
  };

  const openEditModal = (index: number) => {
    setEditIndex(index);
    // Pre-fill with placeholder data since containers is just indices
    setComida('Comida');
    setEditar('Editar...');
    setPorciones('Porciones: ');
    setIsEditModalVisible(true);
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
              <Image source={require('../img/bHoy2.png')} style={sHead.headerIcon} />
            </Pressable>
            <Pressable onPress={() => navigateToScreen('Plan')}>
              <Image source={require('../img/bPlan1.png')} style={sHead.headerIcon} />
            </Pressable>
            <Pressable onPress={() => navigateToScreen('Recetas')}>
              <Image source={require('../img/bRecetas1.png')} style={sHead.headerIcon} />
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
  }, [navigation]);

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
    <Provider>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={bIn.botonesIn}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={bIn.scrollContainer}>
            <Pressable style={bIn.button} onPress={() => handlePress('faltante')}>
              <Image
                source={selectedButtons.faltante ? require('../img/biFal2.png') : require('../img/biFal.png')}
                style={bIn.imgbi}
              />
              <Text style={bIn.textbi}>Faltante</Text>
            </Pressable>
            <Pressable style={bIn.button} onPress={() => handlePress('caducar')}>
              <Image
                source={selectedButtons.caducar ? require('../img/biCa2.png') : require('../img/biCa.png')}
                style={bIn.imgbi}
              />
              <Text style={bIn.textbi}>Caducar</Text>
            </Pressable>
            <Pressable style={bIn.button} onPress={() => handlePress('desayuno')}>
              <Image
                source={selectedButtons.desayuno ? require('../img/biDes2.png') : require('../img/biDes.png')}
                style={bIn.imgbi}
              />
              <Text style={bIn.textbi}>Desayuno</Text>
            </Pressable>
            <Pressable style={bIn.button} onPress={() => handlePress('comida')}>
              <Image
                source={selectedButtons.comida ? require('../img/biCom2.png') : require('../img/biCom.png')}
                style={bIn.imgbi}
              />
              <Text style={bIn.textbi}>Comida</Text>
            </Pressable>
            <Pressable style={bIn.button} onPress={() => handlePress('cena')}>
              <Image
                source={selectedButtons.cena ? require('../img/biCe2.png') : require('../img/biCe.png')}
                style={bIn.imgbi}
              />
              <Text style={bIn.textbi}>Cena</Text>
            </Pressable>
          </ScrollView>
        </View>

        {containers.map((_, index) => (
          <View key={index} style={styles.container}>
            <TextInput
              style={styles.inputTop}
              placeholder="Comida"
              placeholderTextColor="#888"
              value={comida}
              onChangeText={setComida}
            />
            <View style={styles.inputColumn}>
              <View style={styles.sartenRow}>
                <Image
                  source={require('../img/Sarten.png')}
                  style={styles.sartenIcon}
                  resizeMode="contain"
                />
                <TextInput
                  style={styles.inputMiddle}
                  placeholder="Nombre..."
                  placeholderTextColor="#888"
                  value={editar}
                  onChangeText={setEditar}
                />
                <View style={styles.iconContainer}>
                  <TouchableOpacity onPress={() => openEditModal(index)}>
                    <Image
                      source={require('../img/Editar.png')}
                      style={styles.editIcon}
                      resizeMode="contain"
                    />
                  </TouchableOpacity>
                  <Pressable onPress={() => removeContainer(index)} style={styles.trashButton}>
                    <Image
                      source={require('../img/Basura.png')}
                      style={styles.trashIcon}
                      resizeMode="contain"
                    />
                  </Pressable>
                </View>
              </View>
              <TextInput
                style={styles.inputSmall}
                placeholder="Porciones: "
                placeholderTextColor="#888"
                value={porciones}
                onChangeText={setPorciones}
              />
            </View>
          </View>
        ))}

        <Pressable onPress={() => setIsModalVisible(true)} style={styles.addButton}>
          <Image
            source={require('../img/MasCirculo.png')}
            style={styles.addIcon}
            resizeMode="contain"
          />
        </Pressable>

        {/* Modal for MasCirculo (Add) */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={isModalVisible}
          onRequestClose={() => setIsModalVisible(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPressOut={() => setIsModalVisible(false)}
          >
            <View style={styles.modalContainer}>
              <View style={styles.titlePanel}>
                <Text style={styles.modalTitle}>Agregar comida</Text>
              </View>
              <View style={styles.inputRow}>
                <Text style={styles.inputLabel}>Comida:</Text>
                <TextInput
                  style={styles.modalInput}
                  value={comida}
                  onChangeText={setComida}
                  placeholderTextColor="#888"
                />
              </View>
              <View style={styles.inputRow}>
                <Text style={styles.inputLabel}>Nombre:</Text>
                <TextInput
                  style={styles.modalInput}
                  value={editar}
                  onChangeText={setEditar}
                  placeholderTextColor="#888"
                />
              </View>
              <View style={styles.inputRow}>
                <Text style={styles.inputLabel}>Porciones:</Text>
                <TextInput
                  style={styles.modalInput}
                  value={porciones}
                  onChangeText={setPorciones}
                  placeholderTextColor="#888"
                />
              </View>
              <TouchableOpacity
                style={styles.submitButton}
                onPress={addContainer}
              >
                <Image
                  source={require('../img/Palomita.png')}
                  style={styles.submitIcon}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>

        {/* Modal for Editar (Edit) */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={isEditModalVisible}
          onRequestClose={() => setIsEditModalVisible(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPressOut={() => setIsEditModalVisible(false)}
          >
            <View style={styles.modalContainer}>
              <View style={styles.titlePanel}>
                <Text style={styles.modalTitle}>Editar comida</Text>
              </View>
              <View style={styles.inputRow}>
                <Text style={styles.inputLabel}>Comida:</Text>
                <TextInput
                  style={styles.modalInput}
                  value={comida}
                  onChangeText={setComida}
                  placeholder="Comida"
                  placeholderTextColor="#888"
                />
              </View>
              <View style={styles.inputRow}>
                <Text style={styles.inputLabel}>Editar:</Text>
                <TextInput
                  style={styles.modalInput}
                  value={editar}
                  onChangeText={setEditar}
                  placeholder="Editar..."
                  placeholderTextColor="#888"
                />
              </View>
              <View style={styles.inputRow}>
                <Text style={styles.inputLabel}>Porciones:</Text>
                <TextInput
                  style={styles.modalInput}
                  value={porciones}
                  onChangeText={setPorciones}
                  placeholder="Porciones: "
                  placeholderTextColor="#888"
                />
              </View>
              <TouchableOpacity
                style={styles.submitButton}
                onPress={editContainer}
              >
                <Image
                  source={require('../img/Palomita.png')}
                  style={styles.submitIcon}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>
      </ScrollView>
    </Provider>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    alignItems: 'center',
    paddingVertical: SCREEN_HEIGHT * 0.02,
  },
  innerContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: SCREEN_HEIGHT * 0.02,
  },
  container: {
    width: '90%',
    backgroundColor: '#CAE2B5',
    borderColor: '#8CA966',
    borderWidth: 2,
    borderRadius: SCREEN_WIDTH * 0.03,
    padding: SCREEN_WIDTH * 0.04,
    marginBottom: SCREEN_HEIGHT * 0.01,
    marginTop: SCREEN_HEIGHT * 0.015,
    alignItems: 'flex-start',
  },
  inputTop: {
    width: '50%',
    height: SCREEN_HEIGHT * 0.05,
    backgroundColor: 'white',
    borderColor: '#8CA966',
    borderWidth: 2,
    borderRadius: SCREEN_WIDTH * 0.03,
    paddingHorizontal: SCREEN_WIDTH * 0.03,
    fontSize: SCREEN_WIDTH * 0.04,
    marginBottom: SCREEN_HEIGHT * 0.01,
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
  trashButton: {
    // No se necesita margen adicional
  },
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
  addButton: {
    position: 'absolute',
    bottom: SCREEN_HEIGHT * 0.02,
    right: SCREEN_WIDTH * 0.05,
  },
  addIcon: {
    width: SCREEN_WIDTH * 0.12,
    height: SCREEN_WIDTH * 0.12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: SCREEN_WIDTH * 0.8,
    backgroundColor: '#fff',
    borderRadius: SCREEN_WIDTH * 0.05,
    padding: SCREEN_WIDTH * 0.05,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  titlePanel: {
    backgroundColor: '#8CA966',
    borderColor: '#8CA966',
    borderWidth: SCREEN_WIDTH * 0.003,
    width: '100%',
    paddingVertical: SCREEN_HEIGHT * 0.015,
    borderRadius: SCREEN_WIDTH * 0.02,
    marginBottom: SCREEN_HEIGHT * 0.02,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: SCREEN_WIDTH * 0.05,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: SCREEN_HEIGHT * 0.02,
  },
  inputLabel: {
    fontSize: SCREEN_WIDTH * 0.04,
    color: '#000',
    width: SCREEN_WIDTH * 0.25,
  },
  modalInput: {
    flex: 1,
    height: SCREEN_HEIGHT * 0.05,
    backgroundColor: '#CAE2B5',
    borderColor: '#8CA966',
    borderWidth: SCREEN_WIDTH * 0.003,
    borderRadius: SCREEN_WIDTH * 0.02,
    paddingHorizontal: SCREEN_WIDTH * 0.03,
    fontSize: SCREEN_WIDTH * 0.04,
    color: '#000',
  },
  submitButton: {
    alignSelf: 'flex-end',
    marginTop: SCREEN_HEIGHT * 0.02,
  },
  submitIcon: {
    width: SCREEN_WIDTH * 0.07,
    height: SCREEN_WIDTH * 0.07,
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