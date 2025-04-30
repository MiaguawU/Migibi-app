import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  Pressable,
  View,
  Image,
  TextInput,
  Dimensions,
} from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';

// Define el tipo de las pantallas para la navegación
type RootStackParamList = {
    Hoy: undefined;
    Plan: undefined;
    Recetas: undefined;
    Refri: undefined;
    Perfil: undefined;
    refriEditarStock: undefined;
    
  };
  
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

type PlanScreenNavigationProp = NavigationProp<RootStackParamList, 'refriEditarStock'>;

export default function RefriEditarStock() {
  const navigation = useNavigation<PlanScreenNavigationProp>();

  const [nombre, setNombre] = useState('');
  const [cantidad, setCantidad] = useState('');
  const [caducidad, setCaducidad] = useState('');
  const [tipo, setTipo] = useState('');
  const [unidad, setUnidad] = useState('');

  const editIngrediente = () => {
    // Acción al editar ingrediente
  };

  return (
    <View style={styles.modalOverlay}>
      <View style={styles.modalContainer}>
        <View style={styles.titlePanel}>
          <Text style={styles.modalTitle}>Editar ingrediente</Text>
        </View>

        <View style={styles.inputRow}>
          <Text style={styles.modalLabel}>Nombre:</Text>
          <TextInput
            style={styles.input}
            value={nombre}
            onChangeText={setNombre}
            placeholder="Escribe el nombre..."
            placeholderTextColor="#888"
          />
        </View>

        <View style={styles.inputRow}>
          <Text style={styles.modalLabel}>Cantidad:</Text>
          <TextInput
            style={styles.input}
            value={cantidad}
            onChangeText={setCantidad}
            placeholder="Escribe la cantidad..."
            placeholderTextColor="#888"
            keyboardType="numeric"
          />
        </View>

        <View style={styles.inputRow}>
          <Text style={styles.modalLabel}>Caducidad:</Text>
          <TextInput
            style={styles.input}
            value={caducidad}
            onChangeText={setCaducidad}
            placeholder="Escribe la caducidad..."
            placeholderTextColor="#888"
          />
        </View>

        <View style={styles.inputRow}>
          <Text style={styles.modalLabel}>Tipo:</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={tipo}
              onValueChange={(itemValue) => setTipo(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="Selecciona un tipo..." value="" />
              <Picker.Item label="Opción 1" value="opcion1" />
              <Picker.Item label="Opción 2" value="opcion2" />
            </Picker>
          </View>
        </View>

        <View style={styles.inputRow}>
          <Text style={styles.modalLabel}>Unidad:</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={unidad}
              onValueChange={(itemValue) => setUnidad(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="Selecciona una unidad..." value="" />
              <Picker.Item label="Opción 1" value="opcion1" />
              <Picker.Item label="Opción 2" value="opcion2" />
            </Picker>
          </View>
        </View>

        <Pressable style={styles.submitButton} onPress={editIngrediente}>
          <Image
            source={require('../img/Palomita.png')}
            style={styles.submitIcon}
          />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
  modalLabel: {
    fontSize: SCREEN_WIDTH * 0.045,
    color: '#40632F',
    width: SCREEN_WIDTH * 0.25,
  },
  input: {
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
  pickerContainer: {
    flex: 1,
    height: SCREEN_HEIGHT * 0.05,
    backgroundColor: '#CAE2B5',
    borderColor: '#8CA966',
    borderWidth: SCREEN_WIDTH * 0.003,
    borderRadius: SCREEN_WIDTH * 0.02,
    justifyContent: 'center',
  },
  picker: {
    height: SCREEN_HEIGHT * 0.05,
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