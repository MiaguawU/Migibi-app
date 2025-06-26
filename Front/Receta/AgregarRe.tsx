import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Button } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import axios from "axios";
import PUERTO from "../../config";
import AsyncStorage from '@react-native-async-storage/async-storage';

const AgReceta: React.FC = () => {
  const [nombreReceta, setNombreReceta] = useState('');
  const [tiempo, setTiempo] = useState('');
  const [tipoReceta, setTipoReceta] = useState('desayuno'); // Valor inicial
  const [porciones, setPorciones] = useState('');
  const [calorias, setCalorias] = useState('');
  // const [imagenSeleccionada, setImagenSeleccionada] = useState(null);

  const handleGuardar = () => {
    // Lógica para guardar la receta
    console.log('Receta guardada:', { nombreReceta, tiempo, tipoReceta, porciones, calorias /*, imagenSeleccionada*/ });
    // Aquí integrarías tu lógica de base de datos o API
  };

  const handleBorrarTodo = () => {
    // Lógica para resetear todos los campos
    setNombreReceta('');
    setTiempo('');
    setTipoReceta('desayuno');
    setPorciones('');
    setCalorias('');
    // setImagenSeleccionada(null);
  };

  // const pickImage = async () => {
  //   let result = await ImagePicker.launchImageLibraryAsync({
  //     mediaTypes: ImagePicker.MediaTypeOptions.Images,
  //     allowsEditing: true,
  //     aspect: [4, 3],
  //     quality: 1,
  //   });
  //   if (!result.canceled) {
  //     setImagenSeleccionada(result.assets[0].uri);
  //   }
  // };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Agregar Receta</Text>

      <TextInput
        style={styles.input}
        placeholder="Nombre de la Receta"
        value={nombreReceta}
        onChangeText={setNombreReceta}
      />

      <TextInput
        style={styles.input}
        placeholder="Tiempo (ej. 30 minutos)"
        value={tiempo}
        onChangeText={setTiempo}
        // keyboardType="numeric" // Si el formato es solo numérico
      />

      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={tipoReceta}
          onValueChange={(itemValue) => setTipoReceta(itemValue)}
          style={styles.picker}
        >
          <Picker.Item label="Desayuno" value="desayuno" />
          <Picker.Item label="Almuerzo" value="almuerzo" />
          <Picker.Item label="Cena" value="cena" />
          <Picker.Item label="Postre" value="postre" />
          <Picker.Item label="Bebida" value="bebida" />
          {/* Agrega más tipos de receta según sea necesario */}
        </Picker>
      </View>

      <TextInput
        style={styles.input}
        placeholder="Porciones"
        value={porciones}
        onChangeText={setPorciones}
        keyboardType="numeric"
      />

      <TextInput
        style={styles.input}
        placeholder="Calorías"
        value={calorias}
        onChangeText={setCalorias}
        keyboardType="numeric"
      />

      <TouchableOpacity style={styles.button} /*onPress={pickImage}*/>
        <Text style={styles.buttonText}>Seleccionar Imagen</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.modalPlaceholder} /*onPress={() => console.log('Abrir modal de ingredientes')}*/>
        <Text style={styles.modalPlaceholderText}>Espacio para Modal de Ingredientes</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.modalPlaceholder} /*onPress={() => console.log('Abrir modal de instrucciones')}*/>
        <Text style={styles.modalPlaceholderText}>Espacio para Modal de Instrucciones</Text>
      </TouchableOpacity>

      <View style={styles.buttonGroup}>
        <TouchableOpacity style={[styles.actionButton, styles.saveButton]} onPress={handleGuardar}>
          <Text style={styles.buttonText}>Guardar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionButton, styles.clearButton]} onPress={handleBorrarTodo}>
          <Text style={styles.buttonText}>Borrar Todo</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#CAE2B5', // Verde pastel
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 25,
    textAlign: 'center',
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#B0C4DE', // Un gris azulado suave
    padding: 12,
    marginBottom: 18,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    fontSize: 16,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#B0C4DE',
    borderRadius: 8,
    marginBottom: 18,
    backgroundColor: '#FFFFFF',
  },
  picker: {
    height: 50,
    width: '100%',
  },
  button: {
    backgroundColor: '#66CDAA', // Un verde menta suave
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalPlaceholder: {
    height: 80, // Un poco más pequeño para dejar espacio
    backgroundColor: '#F5F5DC', // Beige claro
    borderRadius: 8,
    marginBottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    borderWidth: 1,
    borderColor: '#D3D3D3',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  modalPlaceholderText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  actionButton: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    flex: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  saveButton: {
    backgroundColor: '#7CB342', // Verde más oscuro para guardar
    marginRight: 10,
  },
  clearButton: {
    backgroundColor: '#EF5350', // Rojo para borrar
  },
});

export default AgReceta;