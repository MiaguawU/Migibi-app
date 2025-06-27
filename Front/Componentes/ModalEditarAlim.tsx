import React, { useState, useEffect } from 'react';
import {
    Modal,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Alert,
    Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import axios from "axios";
import PUERTO from "../../config";
import { AutocompleteSelect } from './Elementos/AutoCompleteSelect'; // Adjust path if necessary
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';

export interface EditModalProps {
    visible: boolean;
    onClose: () => void;
    onSubmit: () => void;
    IdStock: number | null;
}

interface alimentos {
  Id_Alimento: number;
  Alimento: string;
  Activo: number;
  Es_Perecedero: number;
  // Add any other properties your backend sends for a single alimento fetch (alUn)
  Fecha?: string; // Optional, as it might not be present if not perecedero or if null
  Nombre: string; // The backend seems to return 'Nombre' for the specific item
  Cantidad: number;
  id_unidad: number;
  id_tipo: number;
  EsPerecedero: number; // The backend seems to use this for the single item fetch
}

interface Tipo {
    Id_Tipo_Alimento: number;
    Tipo_Alimento: string;
}

interface Unidad {
    Id_Unidad_Medida: number;
    Unidad_Medida: string;
}

interface Opcion { // Defined here again for clarity, but ideally in a common types file
    label: string;
    value: string;
}

interface AlimentoCatalogo {
    Id_Alimento: number;
    Alimento: string; // This is the name displayed
    Es_Perecedero: number; // 0 for false, 1 for true
    Id_Tipo_Alimento: number;
    Id_Unidad_Medida: number;
    ImagenURL?: string;
    // ... potentially other fields from your catalog
}

// Interface to represent the structure of an existing stock item (alUn/{id})
interface AlimentoStock {
    Id_Stock: number; // The stock ID
    Nombre: string; // Name of the food in stock
    Cantidad: number;
    Fecha?: string; // Expiration date, nullable
    id_unidad: number;
    id_tipo: number;
    EsPerecedero: number; // Perishable status for the stock item
    ImagenURL?: string;
    Id_Alimento?: number; // The catalog ID if it exists in the catalog
}

export const EditModal: React.FC<EditModalProps> = ({
    visible,
    onClose,
    onSubmit,
    IdStock,
}) => {
    // Form state variables
    const [nombre, setNombre] = useState('');
    const [cantidad, setCantidad] = useState<string>('');
    const [caducidad, setCaducidad] = useState<Date | null>(null);
    const [unidadId, setUnidadId] = useState<number | null>(null);
    const [tipoId, setTipoId] = useState<number | null>(null);
    const [imagenUri, setImagenUri] = useState<string | null>(null);

    // Data for selectors
    const [Tipos, setTipos] = useState<Tipo[]>([]);
    const [Unidades, setUnidad] = useState<Unidad[]>([]);
    const [alimentosSugerencia, setAlimentosSugerencia] = useState<any[]>([]); // Data for AutocompleteSelect

    // Flags and selected item details
    const [esNuevo, setEsNuevo] = useState(false);
    const [esPerecedero, setEsPerecedero] = useState<boolean | undefined>(undefined);
    const [alimentoSeleccionadoDetalles, setAlimentoSeleccionadoDetalles] = useState<any | null>(null);

    // Modals and pickers visibility
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [isPerecederoQuestionModalVisible, setIsPerecederoQuestionModalVisible] = useState(false);

    // State for image file to be sent to backend
    const [imagenFile, setImagenFile] = useState<any | null>(null);
    const [currentAlimentoData, setCurrentAlimentoData] = useState<alimentos | null>(null);
    const [alimentos, setAlimentos] = useState<any[]>([]);

    // Reset form fields when modal becomes visible or IdStock changes
    useEffect(() => {
    if (visible) {
        obtenerTipos();
        obtenerUnidad();
        fetchAlimentos();
        // Reinicia todos los campos del formulario para asegurar un estado limpio
        setNombre('');
        setCantidad('');
        setCaducidad(null);
        setUnidadId(null);
        setTipoId(null);
        setImagenUri(null);
        setImagenFile(null);
        setEsNuevo(false); // Default a no nuevo al abrir el modal de edición
        setEsPerecedero(undefined); // Reinicia el estado perecedero
        setAlimentoSeleccionadoDetalles(null);
        setIsPerecederoQuestionModalVisible(false); // Asegúrate de que esto sea falso al abrir inicialmente
        setShowDatePicker(false);

        if (IdStock) {
            // Si se proporciona un ID, obtiene los datos del alimento existente
            obtenerAlimentoExistente(IdStock);
        }
    }
}, [visible, IdStock]);

    const fetchAlimentos = async () => {
        try {
            const response = await axios.get(`${PUERTO}/cat_ali/nombres`);
            setAlimentosSugerencia(response.data);
            setAlimentos(response.data)
        } catch (error) {
            Alert.alert("Error", "Error al obtener los alimentos para sugerencias.");
            console.error("Error fetching food names:", error);
        }
    };

    const obtenerAlimentoExistente = async (id: number) => {
    try {
        const response = await axios.get(`${PUERTO}/alUn/${id}`);
        const alimento = response.data;

        setCurrentAlimentoData(alimento);

        // Establece los valores del formulario basándose en los datos obtenidos para el elemento existente
        setNombre(alimento.Nombre);
        setCantidad(String(alimento.Cantidad));
        setCaducidad(alimento.Fecha ? moment(alimento.Fecha).toDate() : null);
        setUnidadId(alimento.id_unidad);
        setTipoId(alimento.id_tipo);
        setEsPerecedero(alimento.EsPerecedero === 1);
        setAlimentoSeleccionadoDetalles(alimento);

        if (alimento.ImagenURL) {
             setImagenUri(alimento.ImagenURL);
        }

    } catch (error) {
        Alert.alert("Error", "No se pudo cargar el alimento para edición.");
        console.error("Error loading food for edit:", error);
    }
};

    const handleAutocompleteSelect = (selectedValue: string) => {
    setNombre(selectedValue);
    const alimentoFound = alimentosSugerencia.find( // Usa alimentosSugerencia aquí
        (al) => al.Alimento.toLowerCase().trim() === selectedValue.toLowerCase().trim()
    );

    if (alimentoFound) {
        setAlimentoSeleccionadoDetalles(alimentoFound);
        setEsNuevo(false); // Es un alimento existente
        setEsPerecedero(alimentoFound.Es_Perecedero === 1);
        if (alimentoFound.Id_Tipo_Alimento) setTipoId(alimentoFound.Id_Tipo_Alimento);
        if (alimentoFound.Id_Unidad_Medida) setUnidadId(alimentoFound.Id_Unidad_Medida);
        setImagenUri(alimentoFound.ImagenURL ? `${PUERTO}/images/${alimentoFound.ImagenURL}` : null); // Se ha cambiado aquí
    } else {
        // Es un nuevo alimento (no encontrado en el catálogo)
        setEsNuevo(true);
        setTipoId(null);
        setUnidadId(null);
        setEsPerecedero(undefined); // Pregunta al usuario si el nuevo alimento es perecedero
        setIsPerecederoQuestionModalVisible(true); // Activa el modal de pregunta
        setAlimentoSeleccionadoDetalles(null);
        setImagenUri(null);
    }
};

    // Handler for the "Is Perecedero?" question modal
    const handlePerecederoAnswer = (isPerishable: boolean) => {
    setEsPerecedero(isPerishable);
    setIsPerecederoQuestionModalVisible(false);
    if (!isPerishable) { 
        setCaducidad(null); // Limpia la fecha de caducidad si no es perecedero
    }
};

    const handleSubmit = async () => {
    const currentUserString = await AsyncStorage.getItem("currentUser"); 
    if (!currentUserString) {
        Alert.alert("Advertencia", "No hay un usuario logueado actualmente.");
        return;
    }
    const currentUser = JSON.parse(currentUserString);
    const idUsuario = currentUser.id;

    // VALIDACIÓN CRÍTICA EN EL FRONTEND 
    // Para una operación de edición, IdStock (el prop) DEBE ser siempre un número válido. 
    // Si llega a ser null o undefined, indica un error en cómo se abrió el modal.
    if (IdStock === null || IdStock === undefined) {
        Alert.alert("Error de Edición", "No se puede editar un alimento sin un ID de inventario válido. Por favor, intente de nuevo.");
        return; // Detiene la ejecución si el ID no es válido para edición.
    }

    // Validación básica del formulario antes de enviar
    if (!nombre.trim()) { Alert.alert("Error", "El nombre del alimento es requerido."); return; } 
    if (!cantidad.trim() || isNaN(Number(cantidad)) || Number(cantidad) <= 0) { Alert.alert("Error", "La cantidad debe ser un número válido y mayor que cero."); return; } 
    if (!unidadId) { Alert.alert("Error", "La unidad es requerida."); return; } 
    if (esNuevo && !tipoId) { Alert.alert("Error", "El tipo de alimento es requerido para nuevos alimentos."); return; } 
    // Para artículos perecederos, esPerecedero debe ser verdadero Y caducidad debe estar definida
    if (esPerecedero === undefined) { // Si la pregunta no ha sido respondida para un alimento nuevo
        Alert.alert("Error", "Por favor, indique si el alimento es perecedero."); return;
    }
    if (esPerecedero && !caducidad) { Alert.alert("Error", "La fecha de caducidad es requerida para alimentos perecederos."); return; } 


    const formData = new FormData();
    // id_stock: en el contexto de edición/actualización de stock, es siempre el ID del elemento de stock.
    // Como ya validamos IdStock, sabemos que es un número. 
    formData.append('id_stock', String(IdStock));


    if (esNuevo) {
        formData.append('nombre', nombre);
        formData.append('tipo', String(tipoId)); 
        // Cuando es un nuevo alimento en el catálogo (a través de la edición), no hay un IdStock_catalogo existente. 
    } else {
        // Cuando se actualiza un item de stock de un alimento existente en el catálogo, enviamos su ID de catálogo.
        if (alimentoSeleccionadoDetalles && alimentoSeleccionadoDetalles.IdStock) {
             formData.append('IdStock_catalogo', String(alimentoSeleccionadoDetalles.IdStock));
        }
        formData.append('nombre', nombre); // Enviar nombre para consistencia/validación si es necesario
        if (tipoId) formData.append('tipo', String(tipoId)); // Envía el tipo si se cambió o precargó
    }

    formData.append('id_unidad', String(unidadId));
    formData.append('cantidad', cantidad);

    if (esPerecedero && caducidad) {
        formData.append('fecha_caducidad', moment(caducidad).format("YYYY-MM-DD")); 
    } else {
        formData.append('fecha_caducidad', ''); // Envía una cadena vacía si no es perecedero o no hay fecha
    }
    formData.append('Id_Usuario_Alta', idUsuario.toString());

    if (imagenFile) {
        const uriParts = imagenFile.uri.split('.');
        const fileType = uriParts[uriParts.length - 1];
        formData.append('image', {
            uri: imagenFile.uri,
            name: `photo.${fileType}`,
            type: `image/${fileType}`,
        } as any);
    }

    let queryEndpoint = "";
    // Define el endpoint base según si es un alimento nuevo en el catálogo o existente
    if (esNuevo) { queryEndpoint = "nuevoAlimento"; } else { queryEndpoint = "alimento"; }
    // Agrega el sufijo de perecedero/no-perecedero
    if (esPerecedero) { queryEndpoint += "EsPerecedero"; } else { queryEndpoint += "NoPerecedero"; }

    // La URL final debe incluir el ID del elemento de stock que se está editando. 
    const requestUrl = `${PUERTO}/alUn/${queryEndpoint}/${IdStock}`;
    console.log("Submitting to:", requestUrl);
    console.log("FormData content:", formData);

    try {
        const response = await axios.put(requestUrl, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        Alert.alert("Éxito", 'Producto editado exitosamente.'); 
        onClose(); // Cierra el modal
        onSubmit(); // Notifica al padre para actualizar los datos
    } catch (error: any) {
        console.error("Error en la solicitud:", error);
        if (error.response) {
            if (error.response.data && error.response.data.error) {
                Alert.alert("Error", error.response.data.error);
            } else {
                Alert.alert("Error", `Error: ${error.response.status} - ${error.response.statusText}`);
            }
        } else { 
            Alert.alert("Error", 'Error de conexión con el servidor.'); 
        }
    }
};

    // --- DATA FETCHING FUNCTIONS ---
    const obtenerTipos = async () => { 
    try {
        const response = await axios.get(`${PUERTO}/tipoA`);
        setTipos(response.data);
    } catch (error) {
        Alert.alert("Error", "No se pudieron cargar los tipos.");
        console.error("Error fetching types for edit:", error);
    }
};

    const obtenerUnidad = async () => { 
    try {
        const response = await axios.get(`${PUERTO}/unidad`);
        setUnidad(response.data);
    } catch (error) {
        Alert.alert("Error", "No se pudieron cargar las unidades.");
        console.error("Error fetching units for edit:", error);
    }
};

    // --- IMAGE PICKER ---
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
        setImagenUri(result.assets[0].uri);
        setImagenFile(result.assets[0]);
    }
};

    const onDateChange = (event: any, selectedDate: Date | undefined) => {
        setShowDatePicker(Platform.OS === 'ios');
        const currentDate = selectedDate || caducidad;
        setCaducidad(currentDate);
    };

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.centeredView}>
                <View style={styles.modalView}>
                    <Text style={styles.modalTitle}>Editar Alimento</Text>
                    <ScrollView style={styles.formScroll}>
                        <Text style={styles.label}>Alimento:</Text>
                        <AutocompleteSelect 
                            options={alimentosSugerencia.map((al) => ({ 
                                label: al.Alimento, 
                                value: al.Alimento, 
                            }))}
                            onSelect={handleAutocompleteSelect}
                            defaultValue={nombre || ''}
                        />

                        {/* Conditional rendering for date of expiration */}
                        {esPerecedero !== undefined && esPerecedero && (
                            <>
                                <Text style={styles.label}>Fecha de caducidad:</Text>
                                <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.datePickerButton}>
                                    <Text style={styles.datePickerText}>
                                        {caducidad ? moment(caducidad).format("YYYY-MM-DD") : 'Selecciona una fecha'}
                                    </Text>
                                </TouchableOpacity>
                                {showDatePicker && (
                                    <DateTimePicker
                                        testID="datePicker"
                                        value={caducidad || new Date()}
                                        mode="date"
                                        display="default"
                                        onChange={onDateChange}
                                    />
                                )}
                            </>
                        )}

                        <Text style={styles.label}>Cantidad:</Text>
                        <TextInput
                            style={styles.input}
                            onChangeText={setCantidad}
                            value={cantidad}
                            keyboardType="numeric"
                            placeholder="Introduce la cantidad"
                        />

                        <Text style={styles.label}>Unidad:</Text>
                        <View style={styles.pickerContainer}>
                            <Picker
                                selectedValue={unidadId}
                                onValueChange={(itemValue: number | null) => setUnidadId(itemValue)}
                                style={styles.picker}
                            >
                                <Picker.Item label="Selecciona una unidad" value={null} />
                                {Unidades.map((unidad) => (
                                    <Picker.Item
                                        key={unidad.Id_Unidad_Medida}
                                        label={unidad.Unidad_Medida}
                                        value={unidad.Id_Unidad_Medida}
                                    />
                                ))}
                            </Picker>
                        </View>

                        {/* Conditional rendering for Type (only for new items) */}
                        {esNuevo && (
                            <>
                                <Text style={styles.label}>Tipo:</Text>
                                <View style={styles.pickerContainer}>
                                    <Picker
                                        selectedValue={tipoId}
                                        onValueChange={(itemValue: number | null) => setTipoId(itemValue)}
                                        style={styles.picker}
                                    >
                                        <Picker.Item label="Selecciona el tipo de alimento" value={null} />
                                        {Tipos.map((tipo) => (
                                            <Picker.Item
                                                key={tipo.Id_Tipo_Alimento}
                                                label={tipo.Tipo_Alimento}
                                                value={tipo.Id_Tipo_Alimento}
                                            />
                                        ))}
                                    </Picker>
                                </View>
                            </>
                        )}

                        <Text style={styles.label}>Imagen:</Text>
                        <TouchableOpacity style={styles.imagePickerButton} onPress={pickImage}>
                            <Text style={styles.imagePickerButtonText}>Subir Imagen</Text>
                        </TouchableOpacity>
                        {imagenUri && <Text style={styles.imageUriText}>{imagenUri.split('/').pop()}</Text>}

                    </ScrollView>
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity style={styles.saveButton} onPress={handleSubmit}>
                            <Text style={styles.buttonText}>Guardar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                            <Text style={styles.buttonText}>Cancelar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            {/* "Is Perecedero?" Question Modal */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={isPerecederoQuestionModalVisible}
                onRequestClose={() => handlePerecederoAnswer(false)} // Allow closing with backdrop and treat as 'No'
            >
                <View style={styles.centeredView}>
                    <View style={styles.questionModalView}> {/* Use specific style for question modal */}
                        <Text style={styles.questionModalText}>¿Es perecedero?</Text>
                        <Text style={{ marginBottom: 20 }}>Confirma si el producto es perecedero.</Text>
                        <View style={styles.questionModalButtons}> {/* Use specific style for question buttons */}
                            <TouchableOpacity style={styles.questionButtonYes} onPress={() => handlePerecederoAnswer(true)}>
                                <Text style={styles.buttonText}>Sí</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.questionButtonNo} onPress={() => handlePerecederoAnswer(false)}>
                                <Text style={styles.buttonText}>No</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </Modal>
    );
};

const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalView: {
        width: '90%',
        maxHeight: '85%',
        backgroundColor: '#CAE2B5',
        borderRadius: 20,
        padding: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#3E7E1E',
    },
    formScroll: {
        width: '100%',
    },
    label: {
        fontSize: 18,
        color: '#758B63',
        marginBottom: 5,
        marginTop: 10,
        fontWeight: 'bold',
    },
    input: {
        borderWidth: 1,
        borderColor: '#3E7E1E',
        borderRadius: 8,
        padding: 10,
        fontSize: 16,
        width: '100%',
        backgroundColor: '#FFFFFF',
    },
    datePickerButton: {
        borderWidth: 1,
        borderColor: '#3E7E1E',
        borderRadius: 8,
        padding: 10,
        width: '100%',
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'flex-start',
    },
    datePickerText: {
        fontSize: 16,
        color: '#000',
    },
    pickerContainer: {
        borderWidth: 1,
        borderColor: '#3E7E1E',
        borderRadius: 8,
        width: '100%',
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
    },
    picker: {
        width: '100%',
        height: 50,
    },
    imagePickerButton: {
        backgroundColor: '#3E7E1E',
        padding: 10,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
    },
    imagePickerButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    imageUriText: {
        marginTop: 5,
        fontSize: 14,
        color: '#555',
        textAlign: 'center',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        marginTop: 20,
    },
    saveButton: {
        backgroundColor: '#3E7E1E',
        padding: 12,
        borderRadius: 8,
        flex: 1,
        marginHorizontal: 5,
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: '#D9534F',
        padding: 12,
        borderRadius: 8,
        flex: 1,
        marginHorizontal: 5,
        alignItems: 'center',
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    questionModalView: {
        width: '80%',
        backgroundColor: '#CAE2B5',
        borderRadius: 20,
        padding: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    questionModalText: {
        fontSize: 20,
        marginBottom: 20,
        textAlign: 'center',
        color: '#3E7E1E',
        fontWeight: 'bold',
    },
    questionModalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
    },
    questionButtonYes: {
        backgroundColor: '#3E7E1E',
        padding: 10,
        borderRadius: 8,
        flex: 1,
        marginHorizontal: 5,
        alignItems: 'center',
    },
    questionButtonNo: {
        backgroundColor: '#D9534F',
        padding: 10,
        borderRadius: 8,
        flex: 1,
        marginHorizontal: 5,
        alignItems: 'center',
    },
    // The rest of the styles are not directly used in this component's new logic,
    // but are kept for completeness as they were in your original code.
    suggestionsContainer: { },
    suggestionItem: { },
    suggestionText: { },
    checkboxContainer: { },
    checkbox: { },
    checkedBox: { },
    uncheckedBox: { },
});
