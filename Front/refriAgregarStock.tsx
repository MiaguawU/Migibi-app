import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  Pressable,
  View,
  Image,
  TextInput,
  Dimensions,
  ScrollView,
} from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';

type RootStackParamList = {
    Hoy: undefined;
    Plan: undefined;
    Recetas: undefined;
    Refri: undefined;
    Perfil: undefined;
    refriAgregarStock: undefined;
    refriEditarStock: undefined;
  };

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function RefriAgregarStock() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const [nombre, setNombre] = useState('');
  const [cantidad, setCantidad] = useState('');
  const [caducidad, setCaducidad] = useState('');
  const [tipo, setTipo] = useState('');
  const [unidad, setUnidad] = useState('');


  return (
    <View style={styles.container}>
        <View style={styles.overlay}>
            <Pressable
            style={styles.background}
            onPress={() => {}}
            />
            <View style={styles.panel}>
            <Text style={styles.title}>Agregar ingrediente</Text>

            <View style={styles.row}>
                <Text style={styles.label}>Nombre:</Text>
                <TextInput
                style={styles.input}
                value={nombre}
                onChangeText={setNombre}
                placeholder="Escribe el nombre..."
                placeholderTextColor="#888"
                />
            </View>

            <View style={styles.row}>
                <Text style={styles.label}>Cantidad:</Text>
                <TextInput
                style={styles.input}
                value={cantidad}
                onChangeText={setCantidad}
                placeholder="Escribe la cantidad..."
                placeholderTextColor="#888"
                keyboardType="numeric"
                />
            </View>

            <View style={styles.row}>
                <Text style={styles.label}>Caducidad:</Text>
                <TextInput
                style={styles.input}
                value={caducidad}
                onChangeText={setCaducidad}
                placeholder="Escribe la fecha..."
                placeholderTextColor="#888"
                />
            </View>

            <View style={styles.row}>
                <Text style={styles.label}>Tipo:</Text>
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

            <View style={styles.row}>
                <Text style={styles.label}>Unidad:</Text>
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

            <Pressable style={styles.submitButton} onPress={() => navigation.navigate('Refri')}>
                <Image
                source={require('../img/Palomita.png')}
                style={styles.submitIcon}
                />
            </Pressable>
            </View>
        </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  background: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  panel: {
    width: SCREEN_WIDTH,
    backgroundColor: '#fff',
    padding: SCREEN_WIDTH * 0.05,
    height: SCREEN_HEIGHT,
  },
  title: {
    fontSize: SCREEN_WIDTH * 0.05,
    fontWeight: 'bold',
    color: '#40632F',
    textAlign: 'center',
    marginBottom: SCREEN_HEIGHT * 0.02,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SCREEN_HEIGHT * 0.015,
  },
  label: {
    width: SCREEN_WIDTH * 0.25,
    fontSize: SCREEN_WIDTH * 0.04,
    color: '#40632F',
  },
  input: {
    flex: 1,
    height: SCREEN_HEIGHT * 0.05,
    backgroundColor: '#CAE2B5',
    borderColor: '#8CA966',
    borderWidth: 1,
    borderRadius: SCREEN_WIDTH * 0.02,
    paddingHorizontal: SCREEN_WIDTH * 0.03,
    fontSize: SCREEN_WIDTH * 0.04,
    color: '#000',
  },
  pickerContainer: {
    flex: 1,
    backgroundColor: '#CAE2B5',
    borderColor: '#8CA966',
    borderWidth: 1,
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
