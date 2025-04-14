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
  const [showCalendar, setShowCalendar] = useState(false); // Estado para mostrar/ocultar el calendario
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  // Estados del primer código
  const [containers, setContainers] = useState([0]); // Estado para manejar múltiples contenedores
  const [selectedButtons, setSelectedButtons] = useState({
    faltante: false,
    caducar: false,
    desayuno: false,
    comida: false,
    cena: false,
  });

  const navigateToScreen = (screenName: keyof RootStackParamList) => {
    navigation.navigate(screenName);
  };

  // Función para manejar el cambio de imagen al presionar un botón
  const handlePress = (button: keyof typeof selectedButtons) => {
    setSelectedButtons((prevState) => ({
      ...prevState,
      [button]: !prevState[button], // Cambia el estado de la imagen (presionado o no)
    }));
  };

  // Función para agregar un nuevo contenedor
  const addContainer = () => {
    setContainers([...containers, containers.length]);
  };

  // Función para eliminar un contenedor
  const removeContainer = (index: number) => {
    setContainers(containers.filter((_, i) => i !== index));
  };

  // Configuración de la barra de navegación
  useLayoutEffect(() => {
    navigation.setOptions({
      headerBackTitleVisible: true, // Mantiene el botón de regresar visible
      headerTintColor: '#40632F',
      headerTitle: '', // Oculta el título
      headerStyle: {
        height: SCREEN_HEIGHT * 0.15, // Altura responsiva (15% de la altura de la pantalla)
      },
      headerRight: () => (
        <View style={sHead.headerButtonsContainer}>
          <View style={sHead.naveAl}>
            <Pressable onPress={() => navigateToScreen('Hoy')}>
              <Image source={require('./img/bHoy2.png')} style={sHead.headerIcon} />
            </Pressable>
            <Pressable onPress={() => navigateToScreen('Plan')}>
              <Image source={require('./img/bPlan1.png')} style={sHead.headerIcon} />
            </Pressable>
            <Pressable onPress={() => navigateToScreen('Recetas')}>
              <Image source={require('./img/bRecetas1.png')} style={sHead.headerIcon} />
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
  }, [navigation]);

  const onDayPress = (day: any) => {
    setSelectedDate(day.dateString);
    setShowCalendar(false); // Ocultar el calendario al seleccionar una fecha
  };

  // Si selectedDate está definido, lo usamos; de lo contrario, pasamos un objeto vacío.
  const markedDates = selectedDate
    ? {
        [selectedDate]: { selected: true, selectedColor: '#CEDFAD' }, // Selección con color
      }
    : {};

  return (
    <Provider>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Botones Horizontales */}
        <View style={bIn.botonesIn}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={bIn.scrollContainer}>
            <Pressable style={bIn.button} onPress={() => handlePress('faltante')}>
              <Image
                source={selectedButtons.faltante ? require('./img/biFal2.png') : require('./img/biFal.png')}
                style={bIn.imgbi}
              />
              <Text style={bIn.textbi}>Faltante</Text>
            </Pressable>
            <Pressable style={bIn.button} onPress={() => handlePress('caducar')}>
              <Image
                source={selectedButtons.caducar ? require('./img/biCa2.png') : require('./img/biCa.png')}
                style={bIn.imgbi}
              />
              <Text style={bIn.textbi}>Caducar</Text>
            </Pressable>
            <Pressable style={bIn.button} onPress={() => handlePress('desayuno')}>
              <Image
                source={selectedButtons.desayuno ? require('./img/biDes2.png') : require('./img/biDes.png')}
                style={bIn.imgbi}
              />
              <Text style={bIn.textbi}>Desayuno</Text>
            </Pressable>
            <Pressable style={bIn.button} onPress={() => handlePress('comida')}>
              <Image
                source={selectedButtons.comida ? require('./img/biCom2.png') : require('./img/biCom.png')}
                style={bIn.imgbi}
              />
              <Text style={bIn.textbi}>Comida</Text>
            </Pressable>
            <Pressable style={bIn.button} onPress={() => handlePress('cena')}>
              <Image
                source={selectedButtons.cena ? require('./img/biCe2.png') : require('./img/biCe.png')}
                style={bIn.imgbi}
              />
              <Text style={bIn.textbi}>Cena</Text>
            </Pressable>
          </ScrollView>
        </View>

        {/* Contenedores dinámicos */}
        {containers.map((_, index) => (
          <View key={index} style={styles.container}>
            {/* Primer TextInput ("Comida") */}
            <TextInput
              style={styles.inputTop}
              placeholder="Comida"
              placeholderTextColor="#888"
            />

            {/* Contenedor para alinear el segundo y tercer TextInput */}
            <View style={styles.inputColumn}>
              {/* Imagen Sarten.png y segundo TextInput */}
              <View style={styles.sartenRow}>
                <Image
                  source={require('./img/Sarten.png')}
                  style={styles.sartenIcon}
                  resizeMode="contain"
                />

                {/* Segundo TextInput (al lado de Sarten) con bordes curvos */}
                <TextInput
                  style={styles.inputMiddle}
                  placeholder="Editar..."
                  placeholderTextColor="#888"
                />

                {/* Imágenes Editar y Basura al lado derecho */}
                <View style={styles.iconContainer}>
                  <Image
                    source={require('./img/Editar.png')}
                    style={styles.editIcon}
                    resizeMode="contain"
                  />
                  <Pressable onPress={() => removeContainer(index)} style={styles.trashButton}>
                    <Image
                      source={require('./img/Basura.png')}
                      style={styles.trashIcon}
                      resizeMode="contain"
                    />
                  </Pressable>
                </View>
              </View>

              {/* Tercer TextInput (más pequeño, debajo del segundo) */}
              <TextInput
                style={styles.inputSmall}
                placeholder="Porciones: "
                placeholderTextColor="#888"
              />
            </View>
          </View>
        ))}

        {/* Imagen MasCirculo.png en la parte inferior derecha */}
        <Pressable onPress={addContainer} style={styles.addButton}>
          <Image
            source={require('./img/MasCirculo.png')}
            style={styles.addIcon}
            resizeMode="contain"
          />
        </Pressable>
      </ScrollView>
    </Provider>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    alignItems: 'center',
    paddingVertical: SCREEN_HEIGHT * 0.02, // 2% de la altura
  },
  innerContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: SCREEN_HEIGHT * 0.02,
  },
  container: {
    width: '90%', // 90% del ancho de la pantalla
    backgroundColor: '#CAE2B5',
    borderColor: '#8CA966',
    borderWidth: 2,
    borderRadius: SCREEN_WIDTH * 0.03, // 3% del ancho
    padding: SCREEN_WIDTH * 0.04, // 4% del ancho
    marginBottom: SCREEN_HEIGHT * 0.01, // Espacio entre contenedores
    marginTop: SCREEN_HEIGHT * 0.015, // Reducido de 0.03 a 0.015
    alignItems: 'flex-start',
  },
  inputTop: {
    width: '50%',
    height: SCREEN_HEIGHT * 0.05, // 5% de la altura
    backgroundColor: 'white',
    borderColor: '#8CA966',
    borderWidth: 2,
    borderRadius: SCREEN_WIDTH * 0.03, // 3% del ancho
    paddingHorizontal: SCREEN_WIDTH * 0.03, // 3% del ancho
    fontSize: SCREEN_WIDTH * 0.04, // 4% del ancho
    marginBottom: SCREEN_HEIGHT * 0.01, // 1% de la altura
  },
  inputColumn: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    width: '100%',
  },
  sartenRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', // Espacia los elementos
    marginBottom: SCREEN_HEIGHT * 0.005, // 0.5% de la altura
    width: '100%',
  },
  sartenIcon: {
    width: SCREEN_WIDTH * 0.1, // 10% del ancho
    height: SCREEN_WIDTH * 0.1, // Proporcional al ancho
    marginRight: SCREEN_WIDTH * 0.02, // 2% del ancho
  },
  inputMiddle: {
    width: SCREEN_WIDTH * 0.55, // 55% del ancho
    height: SCREEN_HEIGHT * 0.05, // 5% de la altura
    backgroundColor: 'white',
    borderColor: '#8CA966',
    borderWidth: 2,
    borderRadius: SCREEN_WIDTH * 0.05, // 5% del ancho
    paddingHorizontal: SCREEN_WIDTH * 0.03, // 3% del ancho
    fontSize: SCREEN_WIDTH * 0.04, // 4% del ancho
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editIcon: {
    width: SCREEN_WIDTH * 0.05, // 5% del ancho
    height: SCREEN_WIDTH * 0.05, // Proporcional al ancho
    marginRight: SCREEN_WIDTH * 0.02, // 2% del ancho
  },
  trashButton: {
    // No se necesita margen adicional
  },
  trashIcon: {
    width: SCREEN_WIDTH * 0.05, // 5% del ancho
    height: SCREEN_WIDTH * 0.05, // Proporcional al ancho
  },
  inputSmall: {
    width: SCREEN_WIDTH * 0.3, // 30% del ancho
    height: SCREEN_HEIGHT * 0.03, // 3% de la altura
    backgroundColor: 'white',
    borderColor: '#8CA966',
    borderWidth: 2,
    borderRadius: SCREEN_WIDTH * 0.03, // 3% del ancho
    paddingHorizontal: SCREEN_WIDTH * 0.03, // 3% del ancho
    fontSize: SCREEN_WIDTH * 0.03, // 3% del ancho
    marginLeft: SCREEN_WIDTH * 0.12, // Alineado debajo del segundo TextInput
  },
  addButton: {
    position: 'absolute',
    bottom: SCREEN_HEIGHT * 0.02, // 2% de la altura
    right: SCREEN_WIDTH * 0.05, // 5% del ancho
  },
  addIcon: {
    width: SCREEN_WIDTH * 0.12, // 12% del ancho
    height: SCREEN_WIDTH * 0.12, // Proporcional al ancho
  },
});

const bIn = StyleSheet.create({
  button: {
    alignItems: 'center',
    marginHorizontal: SCREEN_WIDTH * 0.02, // 2% del ancho
  },
  imgbi: {
    width: SCREEN_WIDTH * 0.15, // 15% del ancho
    height: SCREEN_WIDTH * 0.15, // Proporcional al ancho
  },
  textbi: {
    fontFamily: 'Jomhuria',
    fontSize: SCREEN_WIDTH * 0.06, // 6% del ancho
    color: '#6B8762',
  },
  botonesIn: {
    marginTop: SCREEN_HEIGHT * 0.04, // Separación del header
    marginBottom: SCREEN_HEIGHT * 0.015, // Reducido de 0.03 a 0.015
    width: '100%',
  },
  scrollContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: SCREEN_WIDTH * 0.02, // 2% del ancho
  },
});

const sHead = StyleSheet.create({
  headerButtonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: SCREEN_WIDTH, // Ocupa todo el ancho de la pantalla
    height: SCREEN_HEIGHT * 0.15, // Igual que la altura del header
  },
  headerIcon: {
    width: SCREEN_WIDTH * 0.15, // 15% del ancho de la pantalla
    height: SCREEN_HEIGHT * 0.07, // 7% de la altura de la pantalla
    marginHorizontal: SCREEN_WIDTH * 0.01, // 1% del ancho
    resizeMode: 'contain',
  },
  headerIcon2: {
    width: SCREEN_WIDTH * 0.16, // 16% del ancho de la pantalla
    height: SCREEN_HEIGHT * 0.08, // 8% de la altura de la pantalla
    resizeMode: 'contain',
  },
  headerIconEs: {
    marginHorizontal: SCREEN_WIDTH * 0.01, // 1% del ancho
  },
  naveAl: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', // Distribuye los íconos uniformemente
    backgroundColor: '#9FAF7D',
    width: SCREEN_WIDTH, // Ocupa todo el ancho de la pantalla
    height: SCREEN_HEIGHT * 0.07, // Altura proporcional
    top: SCREEN_HEIGHT * 0.06, // Posición ajustada
    paddingHorizontal: SCREEN_WIDTH * 0.02, // Padding para los íconos
  },
});

export default EjemploCalendarioPersonalizado;