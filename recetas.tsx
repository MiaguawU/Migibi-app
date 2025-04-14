import React, { useState, useLayoutEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Pressable,
  ScrollView,
  Dimensions,
  Button,
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
              <Image source={require('./img/bRecetas2.png')} style={sHead.headerIcon} />
            </Pressable>
            <Pressable onPress={() => navigateToScreen('Refri')}>
              <Image source={require('./img/bRefri1.png')} style={sHead.headerIcon} />
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
    setIngredientes([...ingredientes, ingredientes.length]);
  };

  const removeNuevoIngrediente = (index: number) => {
    setIngredientes(ingredientes.filter((_, i) => i !== index));
  };

  const addExpiredProduct = () => {
    setScanned(false);
    addNuevoIngrediente();
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
    <View style={styles.container}>
      <ScrollView style={styles.fullScreenBox} contentContainerStyle={styles.scrollContent}>

        {/* Contenedores de ingredientes */}
        {ingredientes.map((_, index) => (
          <View key={index} style={styles.nuevoIngrediente}>
            <Image
              source={require('./img/ImgDefecto.png')}
              style={styles.defaultImage}
            />
            <View style={styles.textWrapper}>
              <Text style={styles.txtIngrediente}>Pastel</Text>
              <Text style={styles.porciones}>Porciones/10</Text>
            </View>
            <TouchableOpacity onPress={() => removeNuevoIngrediente(index)}>
              <Image source={require('./img/Basura.png')} style={styles.trashImage} />
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      {/* Botón de agregar */}
      <View style={styles.bottomIconsContainer}>
        <TouchableOpacity style={styles.addButton} onPress={addExpiredProduct}>
          <Image source={require('./img/MasIcon.png')} style={styles.addIcon} />
        </TouchableOpacity>
      </View>
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
  },
  scrollContent: {
    padding: SCREEN_WIDTH * 0.05,
    paddingBottom: SCREEN_HEIGHT * 0.15,
  },
  calendarContainer: {
    alignItems: 'center',
    marginBottom: SCREEN_HEIGHT * 0.02,
  },
  selectedDateText: {
    fontSize: SCREEN_WIDTH * 0.04,
    color: '#3E7E1E',
    marginTop: SCREEN_HEIGHT * 0.01,
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
    right: SCREEN_WIDTH * 0.1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
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