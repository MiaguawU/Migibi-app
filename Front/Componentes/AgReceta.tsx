import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  Image,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';

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
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

type AgRecetaRouteProp = RouteProp<RootStackParamList, 'AgReceta'>;

const AgReceta = () => {
  const navigation = useNavigation();
  const route = useRoute<AgRecetaRouteProp>();
  const {
    isEdit = false,
    editIndex,
    recipeName: initialRecipeName = '',
    ingredientInputs: initialIngredientInputs = [''],
    procedureInputs: initialProcedureInputs = [''],
    portions: initialPortions = '',
    type: initialType = '',
    onSubmit,
  } = route.params;

  const [recipeName, setRecipeName] = useState(initialRecipeName);
  const [ingredientInputs, setIngredientInputs] = useState<string[]>(initialIngredientInputs);
  const [procedureInputs, setProcedureInputs] = useState<string[]>(initialProcedureInputs);
  const [portions, setPortions] = useState(initialPortions);
  const [type, setType] = useState(initialType);

  const addIngredientInput = () => {
    setIngredientInputs([...ingredientInputs, '']);
  };

  const removeIngredientInput = (index: number) => {
    setIngredientInputs(ingredientInputs.filter((_, i) => i !== index));
  };

  const updateIngredientInput = (index: number, value: string) => {
    const newInputs = [...ingredientInputs];
    newInputs[index] = value;
    setIngredientInputs(newInputs);
  };

  const addProcedureInput = () => {
    setProcedureInputs([...procedureInputs, '']);
  };

  const removeProcedureInput = (index: number) => {
    setProcedureInputs(procedureInputs.filter((_, i) => i !== index));
  };

  const updateProcedureInput = (index: number, value: string) => {
    const newInputs = [...procedureInputs];
    newInputs[index] = value;
    setProcedureInputs(newInputs);
  };

  const handleSubmit = () => {
    const data = {
      recipeName: recipeName || '',
      ingredientInputs: ingredientInputs.filter((input) => input.trim() !== ''),
      procedureInputs: procedureInputs.filter((input) => input.trim() !== ''),
      portions: portions || '',
      type: type || '',
    };
    console.log('Submitting data:', data);
    onSubmit(data);
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>{isEdit ? 'Editar Receta' : 'Agregar Receta'}</Text>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Nombre de la receta</Text>
          <TextInput
            style={styles.input}
            value={recipeName}
            onChangeText={setRecipeName}
            placeholder="Ej. Pastel de chocolate"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Ingredientes</Text>
          {ingredientInputs.map((input, index) => (
            <View key={index} style={styles.inputRow}>
              <TextInput
                style={[styles.input, styles.flexInput]}
                value={input}
                onChangeText={(value) => updateIngredientInput(index, value)}
                placeholder={`Ingrediente ${index + 1}`}
              />
              <Pressable onPress={() => removeIngredientInput(index)} style={styles.removeButton}>
                <Image
                  source={require('./img/Basura.png')}
                  style={styles.removeIcon}
                  onError={(e) => console.error('Error loading Basura.png:', e.nativeEvent.error)}
                />
              </Pressable>
            </View>
          ))}
          <Pressable onPress={addIngredientInput} style={styles.addFieldButton}>
            <Text style={styles.addFieldButtonText}>+ Agregar ingrediente</Text>
          </Pressable>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Procedimiento</Text>
          {procedureInputs.map((input, index) => (
            <View key={index} style={styles.inputRow}>
              <TextInput
                style={[styles.input, styles.flexInput]}
                value={input}
                onChangeText={(value) => updateProcedureInput(index, value)}
                placeholder={`Paso ${index + 1}`}
              />
              <Pressable onPress={() => removeProcedureInput(index)} style={styles.removeButton}>
                <Image
                  source={require('./img/Basura.png')}
                  style={styles.removeIcon}
                  onError={(e) => console.error('Error loading Basura.png:', e.nativeEvent.error)}
                />
              </Pressable>
            </View>
          ))}
          <Pressable onPress={addProcedureInput} style={styles.addFieldButton}>
            <Text style={styles.addFieldButtonText}>+ Agregar paso</Text>
          </Pressable>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Porciones</Text>
          <TextInput
            style={styles.input}
            value={portions}
            onChangeText={setPortions}
            placeholder="Ej. 10"
            keyboardType="numeric"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Tipo</Text>
          <TextInput
            style={styles.input}
            value={type}
            onChangeText={setType}
            placeholder="Ej. Postre"
          />
        </View>
      </ScrollView>

      <Pressable
        onPress={handleSubmit}
        style={({ pressed }) => [styles.submitButton, { opacity: pressed ? 0.5 : 1 }]}
      >
        <Image
          source={require('./img/Palomita.png')}
          style={styles.submitIcon}
          onError={(e) => console.error('Error loading Palomita.png:', e.nativeEvent.error)}
        />
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#CAE2B5',
    padding: SCREEN_WIDTH * 0.05,
  },
  scrollContent: {
    paddingBottom: SCREEN_HEIGHT * 0.15,
  },
  title: {
    fontSize: SCREEN_WIDTH * 0.06,
    fontWeight: 'bold',
    color: '#40632F',
    marginBottom: SCREEN_HEIGHT * 0.03,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: SCREEN_HEIGHT * 0.02,
  },
  label: {
    fontSize: SCREEN_WIDTH * 0.04,
    color: '#000',
    marginBottom: SCREEN_HEIGHT * 0.01,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: SCREEN_WIDTH * 0.02,
    padding: SCREEN_WIDTH * 0.03,
    fontSize: SCREEN_WIDTH * 0.04,
    borderWidth: 1,
    borderColor: '#8CA966',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SCREEN_HEIGHT * 0.01,
  },
  flexInput: {
    flex: 1,
    marginRight: SCREEN_WIDTH * 0.02,
  },
  removeButton: {
    borderWidth: 1,
    borderColor: '#8CA966',
    borderRadius: SCREEN_WIDTH * 0.02,
    padding: SCREEN_WIDTH * 0.02,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeIcon: {
    width: SCREEN_WIDTH * 0.04,
    height: SCREEN_WIDTH * 0.04,
  },
  addFieldButton: {
    marginTop: SCREEN_HEIGHT * 0.01,
  },
  addFieldButtonText: {
    color: '#40632F',
    fontSize: SCREEN_WIDTH * 0.04,
    fontWeight: 'bold',
  },
  submitButton: {
    position: 'absolute',
    bottom: SCREEN_HEIGHT * 0.03,
    right: SCREEN_WIDTH * 0.05,
    backgroundColor: '#CEDFAD',
    padding: SCREEN_WIDTH * 0.025,
    borderRadius: SCREEN_WIDTH * 0.012,
    zIndex: 10,
  },
  submitIcon: {
    width: SCREEN_WIDTH * 0.08,
    height: SCREEN_WIDTH * 0.08,
  },
});

export default AgReceta;
