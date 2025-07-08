import React, { useState, useEffect, useCallback } from 'react';
import { Alert, View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Platform, Image } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import axios from "axios";
import PUERTO from "../../config";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { IngredientesCard } from './Ingredientes/CardAgEdIng';
import { InstruccionesCard } from './Procedimiento/CardAgEdPro';
import { CustomTimeInput } from '../Componentes/Elementos/TimeInput'; // No se modifica este archivo
import dayjs, { Dayjs } from 'dayjs';
import duration from 'dayjs/plugin/duration';
import * as ImagePicker from 'expo-image-picker';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../types';
import utc from 'dayjs/plugin/utc';

dayjs.extend(duration);
dayjs.extend(advancedFormat);
dayjs.extend(utc);
const defaultImagePlaceholder = 'https://placehold.co/150x150/E0E0E0/666666?text=No+Image';

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

type EdRecetaRouteProp = RouteProp<RootStackParamList, 'EdReceta'>;
type IniciarScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Iniciar'>;

const EdReceta: React.FC = () => {
    const navigation = useNavigation<IniciarScreenNavigationProp>();
    const route = useRoute<EdRecetaRouteProp>();
    const { idReceta } = route.params;

    const [Tipos, setTipos] = useState<Tipo[]>([]);
    const [id, setId] = useState<number | null>(idReceta || null);
    const [imagenUri, setImagenUri] = useState<string | null>(null);

    const [preparationHours, setPreparationHours] = useState(0);
    const [preparationMinutes, setPreparationMinutes] = useState(0);
    const [preparationSeconds, setPreparationSeconds] = useState(0);

    const [recetaInicial, setRecetaInicial] = useState<RecetaFormData | null>(null);
    const [isTypesLoaded, setIsTypesLoaded] = useState(false);
    // NUEVO ESTADO: Bandera para controlar si estamos estableciendo el tiempo inicial
    const [isSettingInitialTime, setIsSettingInitialTime] = useState(false);

    const [formData, setFormData] = useState<RecetaFormData>({
        Nombre: '',
        Imagen: defaultImagePlaceholder,
        TiempoPreparacion: dayjs().hour(0).minute(0).second(0),
        id_Tipo: 0,
        Porciones: 1,
        Calorias: 0,
    });

    const handleChange = useCallback((field: keyof RecetaFormData, value: any) => {
        setFormData(prevData => ({
            ...prevData,
            [field]: value,
        }));
    }, []);

    // handlePreparationTimeChange ahora verifica la bandera isSettingInitialTime
    const handlePreparationTimeChange = useCallback((hours: number, minutes: number, seconds: number) => {
    // Si estamos en proceso de inicializar el tiempo, ignorar esta llamada
    if (isSettingInitialTime) {
        return;
    }
    setPreparationHours(hours);
    setPreparationMinutes(minutes);
    setPreparationSeconds(seconds);
    const newTime = dayjs().hour(hours).minute(minutes).second(seconds);
    handleChange('TiempoPreparacion', newTime);
}, [handleChange, isSettingInitialTime]); // Depende de isSettingInitialTime

    const handleBorrarTodo = useCallback(() => {
        setFormData({
            Nombre: '',
            Imagen: defaultImagePlaceholder,
            TiempoPreparacion: dayjs().startOf('day'),
            id_Tipo: Tipos.length > 0 ? Tipos[0].Id_Tipo_Consumo : 0,
            Porciones: 1,
            Calorias: 0,
        });
        setImagenUri(null);
        setPreparationHours(0);
        setPreparationMinutes(0);
        setPreparationSeconds(0);
    }, [Tipos]);

    const pickImage = useCallback(async () => {
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
            setImagenUri(selectedUri);
            handleChange('Imagen', selectedUri);
        }
    }, [handleChange]);

    const handleGuardar = useCallback(async () => {
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
            const type = match ? `image/${match[1]}` : `image/jpeg`;

            datosForm.append('imagen', {
                uri: imagenUri,
                name: filename || 'upload.jpg',
                type: type,
            } as any);
        }

        try {
            const response = await axios.put(`${PUERTO}/recetaCRUD/${id}`, datosForm, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.status === 200) {
                Alert.alert('Éxito', 'Receta guardada correctamente!');
                console.log('Receta guardada:', response.data);
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
    }, [formData, imagenUri, id, navigation]);

    const obtenerTipos = useCallback(async () => {
        try {
            const response = await axios.get(`${PUERTO}/tipoC`, {
                headers: { "Content-Type": "application/json" },
            });
            if (response.status === 200) {
                setTipos(response.data);
                setIsTypesLoaded(true);
                console.log("Tipos recibidos:", response.data);
            } else {
                Alert.alert("Error", `No se pudieron cargar los tipos de receta: ${response.statusText}`);
                console.log("No hay datos en los tipos");
            }
        } catch (error) {
            console.error("Error al cargar tipos:", error);
            Alert.alert("Error", "No se pudo cargar los tipos.");
        }
    }, []);

    // Función para obtener los datos de una receta específica
    const obtenerDatos = useCallback(async (currentRecetaId: number) => {
        if (currentRecetaId === null || currentRecetaId === undefined) {
            console.error('Error: ID de receta no proporcionado a obtenerDatos.');
            Alert.alert('Error', 'No se ha podido obtener el ID de la receta para cargar datos.');
            navigation.goBack();
            return;
        }

        const currentUserStr = await AsyncStorage.getItem('currentUser');
        if (!currentUserStr) {
            Alert.alert("Advertencia", "No hay un usuario logueado actualmente.");
            return;
        }
        const currentUser = JSON.parse(currentUserStr);
        const userId = currentUser.id;

        try {
            const response = await axios.get(`${PUERTO}/recetaCRUD/ed/${currentRecetaId}/${userId}`, {
                headers: { "Content-Type": "application/json" },
            });

            if (response.status === 200 && response.data && response.data.length > 0) {
                const receta = response.data[0];
                const tiempoPreparacionDayjs =
                receta.Tiempo && dayjs.utc(receta.Tiempo).isValid()
                    ? dayjs.utc(receta.Tiempo) // Asegúrate de parsear como UTC
                    : dayjs().startOf('day');

            console.log('Parsed dayjs object is valid:', tiempoPreparacionDayjs.isValid());
            console.log('Parsed dayjs object (formatted HH:mm:ss UTC):', tiempoPreparacionDayjs.utc().format('HH:mm:ss'));

            // CAMBIO CLAVE AQUÍ: Llama a .utc() antes de .hour(), .minute(), .second()
            const extractedHour = tiempoPreparacionDayjs.utc().hour();
            const extractedMinute = tiempoPreparacionDayjs.utc().minute();
            const extractedSecond = tiempoPreparacionDayjs.utc().second();

            console.log('Extracted Hour (UTC):', extractedHour);
            console.log('Extracted Minute (UTC):', extractedMinute);
            console.log('Extracted Second (UTC):', extractedSecond);
                const loadedReceta: RecetaFormData = {
                    Nombre: receta.Nombre || '',
                    Imagen: receta.Imagen?.startsWith("http")
                        ? receta.Imagen
                        : `${PUERTO}${receta.Imagen}` || defaultImagePlaceholder,
                    TiempoPreparacion: tiempoPreparacionDayjs,
                    id_Tipo: receta.id_Tipo || (Tipos.length > 0 ? Tipos[0].Id_Tipo_Consumo : 0),
                    Porciones: receta.Porciones || 1,
                    Calorias: receta.Calorias || 0,
                };

                setFormData(loadedReceta);
                setRecetaInicial(loadedReceta);

                // Establecer la bandera antes de actualizar los estados de tiempo
                setIsSettingInitialTime(true);
                setPreparationHours(tiempoPreparacionDayjs.hour());
                setPreparationMinutes(tiempoPreparacionDayjs.minute());
                setPreparationSeconds(tiempoPreparacionDayjs.second());
                // Restablecer la bandera después de un pequeño retraso para permitir que CustomTimeInput se sincronice
                setTimeout(() => setIsSettingInitialTime(false), 50); // Pequeño retraso
                
                if (receta.Imagen) {
                    setImagenUri(receta.Imagen.startsWith("http") ? receta.Imagen : `${PUERTO}${receta.Imagen}`);
                } else {
                    setImagenUri(null);
                }

                console.log('Receta cargada:', loadedReceta);

            } else {
                Alert.alert('Error', `No se pudo cargar la receta: ${response.statusText || 'Datos no encontrados'}`);
                console.error('Error al cargar receta, status:', response.status, response.data);
                navigation.goBack();
            }
        } catch (error: any) {
            console.error('Error al cargar la receta:', error);
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
            navigation.goBack();
        }
    }, [Tipos, navigation]);

    useEffect(() => {
        obtenerTipos();
    }, [obtenerTipos]);

    useEffect(() => {
        const loadRecipeForEdit = async () => {
            if (idReceta === undefined || idReceta === null) {
                Alert.alert("Error", "ID de receta no proporcionado para edición.");
                navigation.goBack();
                return;
            }

            if (!isTypesLoaded) {
                return;
            }

            // Solo cargar datos si el ID de la ruta es diferente al ID actual del estado,
            // o si los datos de la receta inicial aún no se han cargado para este ID.
            // Y asegurarnos de que no estamos ya en proceso de establecer el tiempo inicial
            if ((id !== idReceta || !recetaInicial) && !isSettingInitialTime) {
                setId(idReceta);
                await obtenerDatos(idReceta);
            }
        };
        loadRecipeForEdit();
    }, [idReceta, isTypesLoaded, obtenerDatos, id, recetaInicial, navigation, isSettingInitialTime]);


    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>Editar Receta</Text>

            <TextInput
                style={styles.input}
                placeholder="Nombre de la Receta"
                value={formData.Nombre}
                onChangeText={(text) => handleChange('Nombre', text)}
            />

            <CustomTimeInput
                label="Tiempo de preparación"
                initialHours={preparationHours} // Se mantiene 'initialHours'
                initialMinutes={preparationMinutes} // Se mantiene 'initialMinutes'
                initialSeconds={preparationSeconds} // Se mantiene 'initialSeconds'
                onTimeChange={handlePreparationTimeChange}
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
                value={String(formData.Porciones)}
                onChangeText={(text) => handleChange('Porciones', Number(text))}
                keyboardType="numeric"
            />

            <TextInput
                style={styles.input}
                placeholder="Calorías"
                value={String(formData.Calorias)}
                onChangeText={(text) => handleChange('Calorias', Number(text))}
                keyboardType="numeric"
            />

            <TouchableOpacity style={styles.button} onPress={pickImage}>
                <Text style={styles.buttonText}>Seleccionar Imagen</Text>
            </TouchableOpacity>

            {imagenUri ? (
                <Image source={{ uri: imagenUri }} style={styles.imagePreview} />
            ) : (
                <Image source={{ uri: defaultImagePlaceholder }} style={styles.imagePreview} />
            )}

            <View style={styles.ingredientsCardWrapper}>
                <IngredientesCard
                    id_receta={id}
                />
            </View>

            <View style={styles.ingredientsCardWrapper}>
                <InstruccionesCard
                    id_receta={id}
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
    imagePreview: {
        width: '100%',
        height: 200,
        resizeMode: 'contain',
        marginBottom: 20,
        borderRadius: 8,
        backgroundColor: '#E0E0E0',
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

export default EdReceta;
