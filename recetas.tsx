import React, { useState, useLayoutEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { BarCodeScanner } from 'expo-barcode-scanner';

// Define el tipo de las pantallas para la navegación
type RootStackParamList = {
  Hoy: undefined;
  Plan: undefined;
  Recetas: undefined;
  Refri: undefined;
  Perfil: undefined;
  AgReceta: {
    isEdit?: boolean;
    editIndex?: number;
    recipeName?: string;
    ingredientInputs?: string[];
    procedureInputs?: string[];
    portions?: string;
    type?: string;
    onSubmit: (data: {
      recipeName: string;
      ingredientInputs: string[];
      procedureInputs: string[];
      portions: string;
      type: string;
    }) => void;
  };
};

// Obtener las dimensiones de la pantalla
export const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const Recetas = () => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [ingredientes, setIngredientes] = useState<number[]>([0]);
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
              <Image
                source={require('./img/bHoy1.png')}
                style={sHead.headerIcon}
                onError={(e) => console.error('Error loading bHoy1.png:', e.nativeEvent.error)}
              />
            </Pressable>
            <Pressable onPress={() => navigateToScreen('Plan')}>
              <Image
                source={require('./img/bPlan1.png')}
                style={sHead.headerIcon}
                onError={(e) => console.error('Error loading bPlan1.png:', e.nativeEvent.error)}
              />
            </Pressable>
            <Pressable onPress={() => navigateToScreen('Recetas')}>
              <Image
                source={require('./img/bRecetas2.png')}
                style={sHead.headerIcon}
                onError={(e) => console.error('Error loading bRecetas2.png:', e.nativeEvent.error)}
              />
            </Pressable>
            <Pressable onPress={() => navigateToScreen('Refri')}>
              <Image
                source={require('./img/bRefri1.png')}
                style={sHead.headerIcon}
                onError={(e) => console.error('Error loading bRefri1.png:', e.nativeEvent.error)}
              />
            </Pressable>
            <Pressable onPress={() => navigateToScreen('Perfil')} style={sHead.headerIconEs}>
              <Image
                source={require('./img/bPerfil.png')}
                style={sHead.headerIcon2}
                onError={(e) => console.error('Error loading bPerfil.png:', e.nativeEvent.error)}
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

  const addExpiredProduct = (data: {
    recipeName: string;
    ingredientInputs: string[];
    procedureInputs: string[];
    portions: string;
    type: string;
  }) => {
    setScanned(false);
    addNuevoIngrediente();
    console.log('Receta agregada:', data);
  };

  const editIngrediente = (data: {
    recipeName: string;
    ingredientInputs: string[];
    procedureInputs: string[];
    portions: string;
    type: string;
  }, index: number) => {
    console.log(`Receta editada en índice ${index}:`, data);
  };

  const openEditScreen = (index: number) => {
    console.log('Navigating to AgReceta for edit, index:', index);
    navigation.navigate('AgReceta', {
      isEdit: true,
      editIndex: index,
      recipeName: 'Pastel',
      ingredientInputs: [''],
      procedureInputs: [''],
      portions: '10',
      type: '',
      onSubmit: (data) => editIngrediente(data, index),
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.fullScreenBox} contentContainerStyle={styles.scrollContent}>
        {ingredientes.map((_, index) => (
          <View key={index} style={styles.nuevoIngrediente}>
            <Image
              source={require('./img/ImgDefecto.png')}
              style={styles.defaultImage}
              onError={(e) => console.error('Error loading ImgDefecto.png:', e.nativeEvent.error)}
            />
            <View style={styles.textWrapper}>
              <Text style={styles.txtIngrediente}>Pastel</Text>
              <Text style={styles.porciones}>Porciones/10</Text>
            </View>
            <View style={styles.textWrappers}>
              <Pressable
                onPress={() => openEditScreen(index)}
                style={({ pressed }) => [{ opacity: pressed ? 0.5 : 1 }]}
              >
                <Image
                  source={require('./img/Editar.png')}
                  style={styles.trashImage}
                  onError={(e) => console.error('Error loading Editar.png:', e.nativeEvent.error)}
                />
              </Pressable>
              <Pressable
                onPress={() => {
                  console.log('Pressed Basura for index:', index);
                  removeNuevoIngrediente(index);
                }}
                style={({ pressed }) => [{ opacity: pressed ? 0.5 : 1 }]}
              >
                <Image
                  source={require('./img/Basura.png')}
                  style={styles.trashImage}
                  onError={(e) => console.error('Error loading Basura.png:', e.nativeEvent.error)}
                />
              </Pressable>
            </View>
          </View>
        ))}
      </ScrollView>

      <Pressable
        onPress={() => {
          console.log('Pressed MasCirculo');
          navigation.navigate('AgReceta', {
            isEdit: false,
            onSubmit: addExpiredProduct,
          });
        }}
        style={({ pressed }) => [styles.addButton, { opacity: pressed ? 0.5 : 1 }]}
      >
        <Image
          source={require('./img/MasCirculo.png')}
          style={styles.addIcon}
          onError={(e) => console.error('Error loading MasCirculo.png:', e.nativeEvent.error)}
        />
      </Pressable>
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
    marginBottom: SCREEN_HEIGHT * 0.09,
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
