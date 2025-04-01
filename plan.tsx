import React, { useState } from 'react';
import { Modal, StyleSheet, Text, Pressable, View, Image, TextInput, ScrollView } from 'react-native';
import { Button, Provider } from '@ant-design/react-native';
import { Calendar } from 'react-native-calendars';
import DropDownPicker from 'react-native-dropdown-picker';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from './types';
import { createStackNavigator } from '@react-navigation/stack';

type PlanScreenNavigationProp = NavigationProp<RootStackParamList, 'Plan'>;

export default function Plan() {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | undefined>(undefined);
  const [selectedPorDate, setSelectedPorDate] = useState<string | undefined>(undefined); // Fecha para "Por"
  const [showCalendar, setShowCalendar] = useState(false);
  const navigation = useNavigation<PlanScreenNavigationProp>();
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('option1');
  const [items, setItems] = useState([
    { label: 'Opción 1', value: 'option1' },
    { label: 'Opción 2', value: 'option2' },
    { label: 'Opción 3', value: 'option3' },
  ]);
  const [porciones, setPorciones] = useState('');  // Estado para el valor de las porciones

  const navigateToScreen = (screenName: keyof RootStackParamList) => {
    navigation.navigate(screenName);
  };

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerBackTitleVisible: true, // Mantiene el botón de regresar visible
      headerTintColor: '#40632F',
      headerTitle: '', // Oculta el título de "Plan"
      headerStyle: {
        height: 150, // Aumenta la altura de la cabecera a 100
      },
      headerRight: () => (
        <View style={sHead.headerButtonsContainer}>
          <View style={sHead.naveAl}  >
          <Pressable onPress={() => navigateToScreen('Hoy')} >
            <Image source={require('./img/bHoy1.png')} style={sHead.headerIcon} />
          </Pressable>
          <Pressable onPress={() => navigateToScreen('Plan')}>
            <Image source={require('./img/bPlan2.png')} style={sHead.headerIcon} />
          </Pressable>
          <Pressable onPress={() => navigateToScreen('Recetas')}>
            <Image source={require('./img/bRecetas1.png')} style={sHead.headerIcon} />
          </Pressable>
          <Pressable onPress={() => navigateToScreen('Refri')}>
            <Image source={require('./img/bRefri1.png')} style={sHead.headerIcon} />
          </Pressable>
          </View>
          <Pressable onPress={() => navigateToScreen('Perfil')} style={sHead.headerIconEs} >
            <Image source={require('./img/bPerfil.png')} style={sHead.headerIcon2} />
          </Pressable>
        </View>
      ),
    });
  }, [navigation]);

  const toggleModal = () => {
    setModalVisible(!modalVisible);
  };
  // Estados para controlar si cada botón ha sido presionado
  const [selectedButtons, setSelectedButtons] = useState({
    faltante: false,
    caducar: false,
    desayuno: false,
    comida: false,
    cena: false,
  });

  const onDayPress = (day: any) => {
    setSelectedDate(day.dateString);
    setShowCalendar(false);
  };

  const onPorDayPress = (day: any) => {
    setSelectedPorDate(day.dateString);
    setShowCalendar(false);
  };

  

  const markedDates = selectedDate
    ? {
        [selectedDate]: { selected: true, selectedColor: '#CEDFAD' },
      }
    : {};

  const markedPorDates = selectedPorDate
    ? {
        [selectedPorDate]: { selected: true, selectedColor: '#CEDFAD' },
      }
    : {};

  

  // Función para manejar el cambio de imagen al presionar un botón
  const handlePress = (button: keyof typeof selectedButtons) => {
    setSelectedButtons((prevState) => ({
      ...prevState,
      [button]: !prevState[button], // Cambia el estado de la imagen (presionado o no)
    }));
  };

  return (
    <Provider>
      <View style={styles.centeredView}>
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={toggleModal}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <View style={styles.dragIndicator} />

              {/* Botón de Cerrar */}
              <Pressable style={styles.closeButtonContainer} onPress={toggleModal}>
                <Image
                  source={require('./img/AbajoF.png')} // Ruta de la imagen
                  style={styles.closeButtonImage}
                />
              </Pressable>

              {/* Selector de Fecha y Botón */}
              <View style={styles.dateSelectorContainer}>
                <Text style={styles.dateText}>Fecha</Text>
                <Text style={styles.selectedDateText}>
                  {selectedDate ? selectedDate : 'No seleccionada'}
                </Text>
                <Button onPress={() => setShowCalendar(true)} style={bIn.selectButton}>
                  <Image
                    source={require('./img/CalenIcon.png')} 
                  />
                </Button>
              </View>

              {/* Calendario */}
              {showCalendar && (
                <Calendar
                  onDayPress={onDayPress}
                  markedDates={markedDates}
                  theme={{
                    selectedDayBackgroundColor: '#3E7E1E',
                    todayTextColor: '#CEDFAD',
                    dayTextColor: '#3E7E1E',
                    arrowColor: '#3E7E1E',
                    monthTextColor: '#3E7E1E',
                    textSectionTitleColor: '#9FAF7D',
                  }}
                />
              )}

              {/* Dropdown Selector */}
              <View style={styles.selectContainer}>
                <View style={styles.dropdownWrapper}>
                  <Text style={styles.modalText}>Seleccionar Opción</Text>
                  <DropDownPicker
                    open={open}
                    value={value}
                    items={items}
                    setOpen={setOpen}
                    setValue={setValue}
                    setItems={setItems}
                    containerStyle={styles.dropdownContainer}
                    style={styles.dropdownStyle}
                  />
                </View>
              </View>

              {/* Input para las porciones */}
              <View style={styles.porcionesContainer}>
                <Text style={styles.modalText}>Porciones</Text>
                <TextInput
                  style={styles.input}
                  value={porciones}
                  onChangeText={setPorciones}
                  keyboardType="numeric"
                  placeholder="Porciones"
                />
              </View>
            </View>
          </View>
        </Modal>

        {/* Botones Horizontales */}
        <View style={bIn.botonesIn}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={bIn.scrollContainer}>
            <Pressable style={bIn.button} onPress={() => handlePress('faltante')}>
              <Image
                source={selectedButtons.faltante ? require('./img/biFal2.png') : require('./img/biFal.png')}
                style={bIn.imgbi}
              />
              <Text style={bIn.textbi} >Faltante</Text>
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

        <View>
          <View style={bIn.scrollContainer}>
            <Pressable>
              <Image
                source={require('./img/fIzq.png') }
                style={bIn.imgbi}
              />
            </Pressable>
            <Text style={styles.selectedDateText}>
              {selectedDate ? selectedDate : 'Jueves 4 de Noviembre'}
            </Text>
            <Pressable onPress={() => setShowCalendar(true)} style={bIn.selectButton}>
              <Text>Por</Text>
            </Pressable>
            <Pressable>
              <Image
                source={require('./img/fDerecha.png') }
                style={bIn.imgbi}
              />
            </Pressable>
          </View>

          {/* Calendario flotante */}
          {showCalendar && (
            <View style={styles.calendarContainer}>
              <Calendar
                onDayPress={onPorDayPress}
                markedDates={markedPorDates}
                theme={{
                  selectedDayBackgroundColor: '#3E7E1E',
                  todayTextColor: '#CEDFAD',
                  dayTextColor: '#3E7E1E',
                  arrowColor: '#3E7E1E',
                  monthTextColor: '#3E7E1E',
                  textSectionTitleColor: '#9FAF7D',
                }}
              />
            </View>
          )}
        </View>

        <View style={styles.botAbajo} >
          <Pressable style={styBA.botAbS} >
            <Image  
              source={require('./img/bComp.png')}
              style={styBA.imgbA}
            />
          </Pressable>
          <Pressable style={styBA.botAbS} >
            <Image  
              source={require('./img/bDesc.png')}
              style={styBA.imgbA}
            />
          </Pressable>
          <Pressable style={styBA.botAbS2}>
            <Image  
              source={require('./img/bV2.png')}
              style={styBA.imgbA}
            />
          </Pressable>
        </View>

        <Pressable style={styles.bottomBar} onPress={toggleModal}>
          <Image source={require('./img/MasIcon.png')}  />
        </Pressable>
      </View>
    </Provider>
  );
}

const sHead = StyleSheet.create({
  headerButtonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
  },
  headerIcon: {
    width: 69,
    height: 56,
    marginHorizontal: 5,
    resizeMode: 'contain',
    left:4,
  },
  headerIcon2: {
    width: 72,
    height: 67,
    marginHorizontal: 5,
    resizeMode: 'contain',
    left:20,
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
  }
})

const bIn = StyleSheet.create({
  button: {
    alignItems: 'center',
    marginHorizontal: 10,
  },
  imgbi: {
    width: 66,
    height: 66,
  },
  textbi: {
    fontFamily: 'Jomhuria',
    fontSize: 25,
    color: '#6B8762',
  },
  botonesIn: {
    marginTop: 20,
    width: '100%',
    bottom: 220,
    position: 'relative',
  },
  scrollContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  selectButton: {
    marginLeft: 10,
  },
})

const PlanS = StyleSheet.create({

}) 

const styBA = StyleSheet.create({
  botAbS:{
    marginRight: 5, 
    marginLeft:5,
    right:66,
    top: 190,
  },
  botAbS2:{
    marginRight: 10, 
    marginLeft:40,
    left:70,
    top: 190,
  },
  imgbA: {
    width: 59,
    height: 44,
  }
})

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 10,
    height: '80%',
  },
  dragIndicator: {
    width: 40,
    height: 5,
    backgroundColor: '#ccc',
    borderRadius: 3,
    marginBottom: 15,
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
  },
  selectedDateText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 10,
    marginRight: 10,
  },
  dateSelectorContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
    top: 15,
  },
  botAbajo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  
  dateText: {
    fontSize: 16,
    color: '#333',
  },
  
  bottomBar: {
    backgroundColor: '#CEDFAC',
    height: 40,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 0,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  calendarContainer: {
    position: 'absolute',
    top: 70,
    zIndex: 1000,
    right: 10,
    backgroundColor: 'white',
    paddingTop: 10,
  },
  bottomBarText: {
    color: 'white',
    fontWeight: 'bold',
  },
  
  
  
  closeButtonContainer: {
    position: 'absolute',
    top: 20,
    right: 25,
    width: 30,
    height: 30,
  },
  closeButtonImage: {
    width: '70%',
    height: '70%',
    resizeMode: 'contain',
  },
  selectContainer: {
    marginTop: 20,
    justifyContent: 'flex-start',
    width: '100%',
  },
  dropdownWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  dropdownContainer: {
    width: '50%',
  },
  dropdownStyle: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    padding: 5,
  },
  porcionesContainer: {
    marginTop: 20,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row',
  },
  
  input: {
    width: '60%',
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingLeft: 10,
    marginTop: 10,
  },
  
});
