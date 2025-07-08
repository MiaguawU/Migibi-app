import React, { useState, useEffect, useCallback } from 'react'; // Importar useCallback
import { Alert, View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import axios from "axios";
import PUERTO from "../../config";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { IngredientesCard } from './Ingredientes/CardAgEdIng';
import { InstruccionesCard } from './Procedimiento/CardAgEdPro';
import { CustomTimeInput } from '../Componentes/Elementos/TimeInput';
import dayjs, { Dayjs } from 'dayjs';
import duration from 'dayjs/plugin/duration';
import * as ImagePicker from 'expo-image-picker';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../types';

dayjs.extend(duration);
dayjs.extend(advancedFormat);
const defaultImagePlaceholder = '../../img/FotoPerfil.png'

interface RecetaFormData {
    Nombre: string;
    Imagen: string;
    TiempoPreparacion: Dayjs | null;
    id_Tipo: number;
    Porciones: number;
    Calorias: number;
}

interface Tipo {
    Id_Tipo_Consumo: number;
    Tipo_Consumo: string;
}

type IniciarScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Iniciar'>;

const AgReceta: React.FC = () => {
    const navigation = useNavigation<IniciarScreenNavigationProp>();
    const [Tipos, setTipos] = useState<Tipo[]>([]);
    const [id, setId] = useState<number | null>(null); // ID de la receta generada/obtenida del backend
    const [imagenUri, setImagenUri] = useState<string | null>(null); // URI de la imagen seleccionada

    // CAMBIO 1: Reintroducir los estados individuales para las horas, minutos y segundos de preparación
    const [preparationHours, setPreparationHours] = useState(0);
    const [preparationMinutes, setPreparationMinutes] = useState(0); // Inicializado a 0
    const [preparationSeconds, setPreparationSeconds] = useState(0);

    // Estas variables no se usan en el formData, se mantienen si son para otra lógica
    const [cookingHours, setCookingHours] = useState(1);
    const [cookingMinutes, setCookingMinutes] = useState(15);
    const [cookingSeconds, setCookingSeconds] = useState(0);

    const [formData, setFormData] = useState<RecetaFormData>({
        Nombre: '',
        Imagen: defaultImagePlaceholder,
        // CAMBIO 2: Inicializar TiempoPreparacion con los valores iniciales de los estados individuales
        TiempoPreparacion: dayjs().hour(0).minute(0).second(0),
        id_Tipo: 0, // Se inicializará con el primer tipo obtenido o un valor por defecto
        Porciones: 1,
        Calorias: 0,
    });

    // useEffect para inicializar la receta y obtener el ID
    useEffect(() => {
        const initializeRecipeAndId = async () => {
            await agregar(); // Crea la receta inicial en el backend
            await obtenerId(); // Obtiene el ID de la receta recién creada
        };
        initializeRecipeAndId();
    }, []); // Se ejecuta solo una vez al montar el componente

    // useEffect para obtener los tipos de consumo una vez que el componente se monta
    useEffect(() => {
        obtenerTipos();
    }, []); // Se ejecuta solo una vez al montar el componente

    // Función genérica para manejar cambios en los campos del formulario
    const handleChange = (field: keyof RecetaFormData, value: any) => {
        setFormData(prevData => ({
            ...prevData,
            [field]: value,
        }));
    };

    // Función para crear una nueva receta general en el backend
    const agregar = async () => {
        try {
            const currentUserStr = await AsyncStorage.getItem('currentUser');
            if (!currentUserStr) {
                Alert.alert("Advertencia", "No hay un usuario logueado actualmente.");
                return;
            }

            const currentUser = JSON.parse(currentUserStr);
            const userId = currentUser.id; // Asumiendo que el objeto currentUser tiene una propiedad 'id'

            const response = await axios.post(`${PUERTO}/RecetaGeneral/${userId}`, {}, {
                headers: { "Content-Type": "application/json" },
            });

            if (response.status === 200) {
                console.log("Receta creada correctamente.");
            } else {
                Alert.alert("Error", `Error al crear la receta: ${response.statusText}`);
                console.error("Error al crear la receta:", response.data);
            }
        } catch (error) {
            console.error("Error al crear la receta:", error);
            Alert.alert("Error", "Ocurrió un error al intentar crear la receta.");
        }
    };

    // Función para obtener el ID de la receta recién creada
    const obtenerId = async () => {
        try {
            const response = await axios.get(`${PUERTO}/agReceta`, {
                headers: { "Content-Type": "application/json" },
            });

            if (response.status === 200 && response.data?.id) {
                const newId = response.data.id;
                setId(newId); // Establece el ID real de la receta
                console.log("ID de nueva receta:", newId);
            } else {
                Alert.alert("Error", "No se pudo obtener el ID de la receta.");
                console.error("Error al obtener el ID:", response.data);
            }
        } catch (error) {
            console.error("Error al obtener el ID:", error);
            Alert.alert("Error", "Ocurrió un error al obtener el ID de la receta.");
        }
    };

    // Función para seleccionar una imagen de la galería
    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permiso requerido', 'Necesitamos permiso para acceder a tu galería de fotos.');
            return;
        }

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
            const selectedUri = result.assets[0].uri;
            setImagenUri(selectedUri); // Guarda la URI de la imagen seleccionada
            handleChange('Imagen', selectedUri); // Actualiza formData con la URI de la imagen
        }
    };

    // Función para obtener los tipos de consumo del backend
    const obtenerTipos = async () => {
        try {
            const response = await axios.get(`${PUERTO}/tipoC`, {
                headers: { "Content-Type": "application/json" },
            });
            if (response.status === 200) {
                setTipos(response.data);
                // Si hay tipos, establece el primer tipo como valor por defecto en formData
                if (response.data.length > 0) {
                    handleChange('id_Tipo', response.data[0].Id_Tipo_Consumo);
                }
                console.log("Tipos recibidos:", response.data);
            } else {
                Alert.alert("Error", `No se pudieron cargar los tipos de receta: ${response.statusText}`);
                console.log("No hay datos en los tipos");
            }
        } catch (error) {
            console.error("Error al cargar tipos:", error);
            Alert.alert("Error", "No se pudo cargar los tipos.");
        }
    };

    // CAMBIO 3: handlePreparationTimeChange actualiza los estados individuales y luego formData
    const handlePreparationTimeChange = useCallback((hours: number, minutes: number, seconds: number) => {
        setPreparationHours(hours);
        setPreparationMinutes(minutes);
        setPreparationSeconds(seconds);
        const newTime = dayjs().hour(hours).minute(minutes).second(seconds);
        handleChange('TiempoPreparacion', newTime);
    }, []); // Dependencias vacías para memoizar la función

    // Esta función `handleTimeChange` no se usa directamente en el JSX para CustomTimeInput
    // Si no se usa en ningún otro lugar, puede ser eliminada.
    const handleTimeChange = (field: 'TiempoPreparacion', hours: number, minutes: number, seconds: number) => {
        const newTime = dayjs().hour(hours).minute(minutes).second(seconds);
        setFormData(prevData => ({
            ...prevData,
            [field]: newTime,
        }));
        console.log(`${field} actualizado en estado: ${newTime.format('HH:mm:ss')}`);
    };

    const handleGuardar = async () => {
        
        if (!formData.Nombre.trim()) {
            Alert.alert('Error', 'Por favor, introduce el nombre de la receta.');
            return;
        }
        if (!formData.id_Tipo) {
            Alert.alert('Error', 'Por favor, selecciona un tipo de receta.');
            return;
        }
        if (id === null) {
            Alert.alert('Error', 'No se ha podido obtener el ID de la receta. Intenta recargar la aplicación.');
            return;
        }

        const currentUserStr = await AsyncStorage.getItem('currentUser');
        if (!currentUserStr) {
            Alert.alert("Advertencia", "No hay un usuario logueado actualmente.");
            return;
        }
        const currentUser = JSON.parse(currentUserStr);
        const userId = currentUser.id;

        const datosForm = new FormData();
        datosForm.append("nombre", formData.Nombre);
        datosForm.append("tiempo", formData.TiempoPreparacion?.format('HH:mm:ss') || '00:00:00');
        datosForm.append("porciones", String(formData.Porciones));
        datosForm.append("calorias", String(formData.Calorias));
        datosForm.append("id_tipo_consumo", String(formData.id_Tipo));
        datosForm.append("id_usu", String(userId));

        if (imagenUri) {
            const filename = imagenUri.split('/').pop();
            const match = /\.(\w+)$/.exec(filename || '');
            const type = match ? `image/${match[1]}` : `image/jpeg`; // Tipo MIME por defecto si no se puede inferir

            datosForm.append('imagen', {
                uri: imagenUri,
                name: filename || 'upload.jpg',
                type: type,
            } as any); // 'as any' es necesario para la compatibilidad de tipos de FormData en React Native
        }

        try {
            const response = await axios.put(`${PUERTO}/recetaCRUD/${id}`, datosForm, {
                headers: {
                    'Content-Type': 'multipart/form-data', // Importante para enviar FormData
                },
            });

            if (response.status === 200) { // 200 OK para actualizaciones
                Alert.alert('Éxito', 'Receta guardada correctamente!');
                console.log('Receta guardada:', response.data);
                handleBorrarTodo(); // Limpiar formulario después de guardar
                navigation.navigate('Recetas');
            } else {
                Alert.alert('Error', `Hubo un problema al guardar la receta: ${response.statusText}`);
                console.error('Error al guardar receta, status:', response.status, response.data);
            }
        } catch (error: any) {
            console.error('Error al enviar la receta:', error);
            if (axios.isAxiosError(error)) {
                if (error.response) {
                    console.error('Datos del error:', error.response.data);
                    Alert.alert('Error del servidor', `Mensaje: ${error.response.data.message || 'Error desconocido'}`);
                } else if (error.request) {
                    Alert.alert('Error de conexión', 'No se pudo conectar con el servidor. ¿Está funcionando el backend?');
                } else {
                    Alert.alert('Error', `Ocurrió un error inesperado: ${error.message}`);
                }
            } else {
                Alert.alert('Error', `Ocurrió un error inesperado: ${error.message}`);
            }
        }
    };

    const handleBorrarTodo = () => {
        setFormData({
            Nombre: '',
            Imagen: defaultImagePlaceholder,
            TiempoPreparacion: dayjs().startOf('day'), // Reinicia a 00:00:00
            id_Tipo: Tipos.length > 0 ? Tipos[0].Id_Tipo_Consumo : 0, // Restablece al primer tipo o 0
            Porciones: 1,
            Calorias: 0,
        });
        setImagenUri(null); // Limpia la URI de la imagen // Resetea el ID de la receta para que se genere uno nuevo al volver a usar el formulario
        // CAMBIO 4: Resetea los estados individuales de tiempo a 0
        setPreparationHours(0);
        setPreparationMinutes(0);
        setPreparationSeconds(0);
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>Agregar Receta</Text>

            <TextInput
                style={styles.input}
                placeholder="Nombre de la Receta"
                value={formData.Nombre}
                onChangeText={(text) => handleChange('Nombre', text)}
            />

            <CustomTimeInput
                label="Tiempo de preparación"
                // CAMBIO 5: Pasar los estados individuales de tiempo como props iniciales
                initialHours={preparationHours}
                initialMinutes={preparationMinutes}
                initialSeconds={preparationSeconds}
                onTimeChange={handlePreparationTimeChange} // Usa la función memoizada
            />

            <View style={styles.pickerContainer}>
                <Picker
                    selectedValue={formData.id_Tipo}
                    onValueChange={(itemValue) => handleChange('id_Tipo', itemValue as number)}
                    style={styles.picker}
                >
                    {Tipos.length > 0 ? (
                        Tipos.map((tipo) => (
                            <Picker.Item
                                key={tipo.Id_Tipo_Consumo}
                                label={tipo.Tipo_Consumo}
                                value={tipo.Id_Tipo_Consumo}
                            />
                        ))
                    ) : (
                        <Picker.Item label="Cargando tipos..." value={0} />
                    )}
                </Picker>
            </View>

            <TextInput
                style={styles.input}
                placeholder="Porciones"
                value={String(formData.Porciones)} // Convierte a string para TextInput
                onChangeText={(text) => handleChange('Porciones', Number(text))} // Convierte a número
                keyboardType="numeric"
            />

            <TextInput
                style={styles.input}
                placeholder="Calorías"
                value={String(formData.Calorias)} // Convierte a string para TextInput
                onChangeText={(text) => handleChange('Calorias', Number(text))} // Convierte a número
                keyboardType="numeric"
            />

            <TouchableOpacity style={styles.button} onPress={pickImage}>
                <Text style={styles.buttonText}>Seleccionar Imagen</Text>
            </TouchableOpacity>

            <View style={styles.ingredientsCardWrapper}>
                <IngredientesCard
                    id_receta={id} // Pasa el ID real de la receta
                />
            </View>

            <View style={styles.ingredientsCardWrapper}>
                <InstruccionesCard
                    id_receta={id} // Pasa el ID real de la receta
                />
            </View>

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
        backgroundColor: '#CAE2B5',
        padding: 20,
        paddingBottom: 40,
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
        borderColor: '#B0C4DE',
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
        backgroundColor: '#66CDAA',
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
    ingredientsCardWrapper: {
        marginTop: 40,
        marginBottom: 20,
        width: '100%',
    },
    modalPlaceholder: {
        height: 80,
        backgroundColor: '#F5F5DC',
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
        marginBottom: 20,
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
        backgroundColor: '#7CB342',
        marginRight: 10,
    },
    clearButton: {
        backgroundColor: '#EF5350',
    },
});

export default AgReceta;
