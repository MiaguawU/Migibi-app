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

export default function Caducar() {
  const navigation = useNavigation<PlanScreenNavigationProp>();
  // Estado para los botones horizontales
  const [selectedButtons, setSelectedButtons] = useState({
    faltante: false,
    caducar: false,
    desayuno: false,
    comida: false,
    cena: false,
  });
  // Estado para las filas del panel interno
  const [rows, setRows] = useState([{ id: 0 }]);

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

  // Función para eliminar una fila
  const deleteRow = (id: number) => {
    setRows(rows.filter((row) => row.id !== id));
  };

  // Función para agregar una nueva fila
  const addRow = () => {
    const newId = rows.length > 0 ? Math.max(...rows.map((row) => row.id)) + 1 : 0;
    setRows([...rows, { id: newId }]);
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
                source={require('../../img/bHoy1.png')}
                style={sHead.headerIcon}
                onError={() => console.error('Error loading bHoy1.png')}
              />
            </Pressable>
            <Pressable onPress={() => navigateToScreen('Plan')}>
              <Image
                source={require('../../img/bPlan1.png')}
                style={sHead.headerIcon}
                onError={() => console.error('Error loading bPlan1.png')}
              />
            </Pressable>
            <Pressable onPress={() => navigateToScreen('Recetas')}>
              <Image
                source={require('../../img/bRecetas1.png')}
                style={sHead.headerIcon}
                onError={() => console.error('Error loading bRecetas1.png')}
              />
            </Pressable>
            <Pressable onPress={() => navigateToScreen('Refri')}>
              <Image
                source={require('../../img/bRefri1.png')}
                style={sHead.headerIcon}
                onError={() => console.error('Error loading bRefri1.png')}
              />
            </Pressable>
            <Pressable onPress={() => navigateToScreen('Perfil')} style={sHead.headerIconEs}>
              <Image
                source={require('../../img/bPerfil.png')}
                style={sHead.headerIcon2}
                onError={() => console.error('Error loading bPerfil.png')}
              />
            </Pressable>
          </View>
        </View>
      ),
    });
  }, [navigation]);

  return (
    <Provider>
      <ErrorBoundary>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {/* Botones Horizontales */}
          <View style={bIn.botonesIn}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={bIn.scrollContainer}>
              <Pressable style={bIn.button} onPress={() => handlePress('faltante')}>
                <Image
                  source={selectedButtons.faltante ? require('../../img/biFal2.png') : require('../../img/biFal.png')}
                  style={bIn.imgbi}
                  onError={() => console.error('Error loading biFal.png or biFal2.png')}
                />
                <Text style={bIn.textbi}>Faltante</Text>
              </Pressable>
              <Pressable style={bIn.button} onPress={() => handlePress('caducar')}>
                <Image
                  source={selectedButtons.caducar ? require('../../img/biCa.png') : require('../../img/biCa2.png')}
                  style={bIn.imgbi}
                  onError={() => console.error('Error loading biCa.png or biCa2.png')}
                />
                <Text style={bIn.textbi}>Caducar</Text>
              </Pressable>
              <Pressable style={bIn.button} onPress={() => handlePress('desayuno')}>
                <Image
                  source={selectedButtons.desayuno ? require('../../img/biDes2.png') : require('../../img/biDes.png')}
                  style={bIn.imgbi}
                  onError={() => console.error('Error loading biDes.png or biDes2.png')}
                />
                <Text style={bIn.textbi}>Desayuno</Text>
              </Pressable>
              <Pressable style={bIn.button} onPress={() => handlePress('comida')}>
                <Image
                  source={selectedButtons.comida ? require('../../img/biCom2.png') : require('../../img/biCom.png')}
                  style={bIn.imgbi}
                  onError={() => console.error('Error loading biCom.png or biCom2.png')}
                />
                <Text style={bIn.textbi}>Comida</Text>
              </Pressable>
              <Pressable style={bIn.button} onPress={() => handlePress('cena')}>
                <Image
                  source={selectedButtons.cena ? require('../../img/biCe2.png') : require('../../img/biCe.png')}
                  style={bIn.imgbi}
                  onError={() => console.error('Error loading biCe.png or biCe2.png')}
                />
                <Text style={bIn.textbi}>Cena</Text>
              </Pressable>
            </ScrollView>
          </View>

          {/* Panel Por Caducar */}
          <View style={styles.panelPorCaducar}>
            <Text style={styles.panelTitle}>Por caducar</Text>
            <ScrollView style={styles.innerPanel} showsVerticalScrollIndicator={true}>
              {rows.map((row) => (
                <View key={row.id} style={styles.rowContainer}>
                  <View style={styles.textInputContainer}>
                    <TextInput
                      style={styles.textInput}
                      placeholder="Escribe aquí..."
                      placeholderTextColor="#888"
                    />
                    <Text style={styles.separator}>/</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="Escribe aquí..."
                      placeholderTextColor="#888"
                    />
                  </View>
                  <View style={styles.iconContainer}>
                    <Pressable onPress={() => deleteRow(row.id)}>
                      <Image
                        source={require('../../img/Basura.png')}
                        style={styles.icon}
                        resizeMode="contain"
                        onError={() => console.error('Error loading Basura.png')}
                      />
                    </Pressable>
                    <Pressable onPress={addRow}>
                      <Image
                        source={require('../../img/Palomita.png')}
                        style={styles.icon}
                        resizeMode="contain"
                        onError={() => console.error('Error loading Palomita.png')}
                      />
                    </Pressable>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
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
  panelPorCaducar: {
    flex: 1,
    width: '90%',
    backgroundColor: '#A0CF4B',
    borderColor: '#8CA966',
    borderWidth: 2,
    borderRadius: SCREEN_WIDTH * 0.03,
    marginTop: SCREEN_HEIGHT * 0.015,
    marginBottom: SCREEN_HEIGHT * 0.02,
    padding: SCREEN_WIDTH * 0.04,
  },
  panelTitle: {
    fontSize: SCREEN_WIDTH * 0.06,
    fontWeight: 'bold',
    color: '#40632F',
    textAlign: 'center',
    marginBottom: SCREEN_HEIGHT * 0.02,
  },
  innerPanel: {
    backgroundColor: '#d5e0d2',
    borderRadius: SCREEN_WIDTH * 0.03,
    padding: SCREEN_WIDTH * 0.04,
    maxHeight: SCREEN_HEIGHT * 0.5, // Limita la altura para activar el scroll
  },
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SCREEN_HEIGHT * 0.02,
  },
  textInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  textInput: {
    flex: 1,
    height: SCREEN_HEIGHT * 0.05,
    paddingHorizontal: SCREEN_WIDTH * 0.03,
    fontSize: SCREEN_WIDTH * 0.04,
    marginHorizontal: SCREEN_WIDTH * 0.01,
    color: '#fff',
  },
  separator: {
    fontSize: SCREEN_WIDTH * 0.06,
    color: '#fff',
    marginHorizontal: SCREEN_WIDTH * 0.02,
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    width: SCREEN_WIDTH * 0.05, // Tamaño reducido
    height: SCREEN_WIDTH * 0.05, // Tamaño reducido
    marginLeft: SCREEN_WIDTH * 0.02,
  },
});