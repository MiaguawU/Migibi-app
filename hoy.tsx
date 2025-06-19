import React, { Component, useState, useLayoutEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  ScrollView,
  Dimensions,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { Calendar } from 'react-native-calendars';
import { Provider } from '@ant-design/react-native';
import { AddModal, EditModal } from './ModalHoy';

// Define el tipo de las pantallas para la navegación
type RootStackParamList = {
  Hoy: undefined;
  Plan: undefined;
  Recetas: undefined;
  Refri: undefined;
  Perfil: undefined;
  Caducar: undefined;
  Faltante: undefined;
};

// Obtener las dimensiones de la pantalla para hacer el diseño responsivo
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

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

export default function EjemploCalendarioPersonalizado() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  // Calendar state
  const [selectedDate, setSelectedDate] = useState<string | undefined>(undefined);
  const [showCalendar, setShowCalendar] = useState(false);

  // Container and modal state
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
    console.log('Adding container with:', { comida, editar, porciones });
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
    console.log('Editing container with:', { comida, editar, porciones, editIndex });
    setComida('');
    setEditar('');
    setPorciones('');
    setIsEditModalVisible(false);
    setEditIndex(null);
  };

  const openEditModal = (index: number) => {
    setEditIndex(index);
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
              <Image
                source={require('./img/bHoy2.png')}
                style={sHead.headerIcon}
                onError={() => console.error('Error loading bHoy2.png')}
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
                source={require('./img/bRecetas1.png')}
                style={sHead.headerIcon}
                onError={() => console.error('Error loading bRecetas1.png')}
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
      <ErrorBoundary>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={bIn.botonesIn}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={bIn.scrollContainer}>
              <Pressable style={bIn.button} onPress={() => navigateToScreen('Faltante')}>
                <Image
                  source={selectedButtons.faltante ? require('./img/biFal2.png') : require('./img/biFal.png')}
                  style={bIn.imgbi}
                  onError={() => console.error('Error loading biFal.png or biFal2.png')}
                />
                <Text style={bIn.textbi}>Faltante</Text>
              </Pressable>
              <Pressable style={bIn.button} onPress={() => navigateToScreen('Caducar')}>
                <Image
                  source={selectedButtons.caducar ? require('./img/biCa2.png') : require('./img/biCa.png')}
                  style={bIn.imgbi}
                  onError={() => console.error('Error loading biCa.png or biCa2.png')}
                />
                <Text style={bIn.textbi}>Caducar</Text>
              </Pressable>
              <Pressable style={bIn.button} onPress={() => handlePress('desayuno')}>
                <Image
                  source={selectedButtons.desayuno ? require('./img/biDes2.png') : require('./img/biDes.png')}
                  style={bIn.imgbi}
                  onError={() => console.error('Error loading biDes.png or biDes2.png')}
                />
                <Text style={bIn.textbi}>Desayuno</Text>
              </Pressable>
              <Pressable style={bIn.button} onPress={() => handlePress('comida')}>
                <Image
                  source={selectedButtons.comida ? require('./img/biCom2.png') : require('./img/biCom.png')}
                  style={bIn.imgbi}
                  onError={() => console.error('Error loading biCom.png or biCom2.png')}
                />
                <Text style={bIn.textbi}>Comida</Text>
              </Pressable>
              <Pressable style={bIn.button} onPress={() => handlePress('cena')}>
                <Image
                  source={selectedButtons.cena ? require('./img/biCe2.png') : require('./img/biCe.png')}
                  style={bIn.imgbi}
                  onError={() => console.error('Error loading biCe.png or biCe2.png')}
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
                    source={require('./img/Sarten.png')}
                    style={styles.sartenIcon}
                    resizeMode="contain"
                    onError={() => console.error('Error loading Sarten.png')}
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
                        source={require('./img/Editar.png')}
                        style={styles.editIcon}
                        resizeMode="contain"
                        onError={() => console.error('Error loading Editar.png')}
                      />
                    </TouchableOpacity>
                    <Pressable onPress={() => removeContainer(index)} style={styles.trashButton}>
                      <Image
                        source={require('./img/Basura.png')}
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
                  value={porciones}
                  onChangeText={setPorciones}
                />
              </View>
            </View>
          ))}

          <Pressable onPress={() => setIsModalVisible(true)} style={styles.addButton}>
            <Image
              source={require('./img/MasCirculo.png')}
              style={styles.addIcon}
              resizeMode="contain"
              onError={() => console.error('Error loading MasCirculo.png')}
            />
          </Pressable>

          {/* Modals */}
          <AddModal
            visible={isModalVisible}
            onClose={() => setIsModalVisible(false)}
            onSubmit={addContainer}
            comida={comida}
            setComida={setComida}
            editar={editar}
            setEditar={setEditar}
            porciones={porciones}
            setPorciones={setPorciones}
          />
          <EditModal
            visible={isEditModalVisible}
            onClose={() => setIsEditModalVisible(false)}
            onSubmit={editContainer}
            comida={comida}
            setComida={setComida}
            editar={editar}
            setEditar={setEditar}
            porciones={porciones}
            setPorciones={setPorciones}
          />
        </ScrollView>
      </ErrorBoundary>
    </Provider>
  );
}

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