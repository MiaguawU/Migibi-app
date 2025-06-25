import React, { useState, useEffect } from 'react';
import {
    Modal,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Alert, // For messages instead of Ant Design's message
    Platform, // To handle platform-specific date picker
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker'; // For date picker
import { Picker } from '@react-native-picker/picker'; // For Select equivalent
import * as ImagePicker from 'expo-image-picker'; // Or react-native-image-picker
import axios from "axios";
import PUERTO from "../../config"; // Ensure this path is correct for React Native
import { AutocompleteSelect } from './AutoCompleteSelect'; // ajusta ruta si es necesario
import AsyncStorage from '@react-native-async-storage/async-storage';

// --- INTERFACES (UNCHANGED, BUT REPEATED FOR CONTEXT) ---
interface AddModalProps {
    visible: boolean;
    onClose: () => void;
    onSubmit: (data: {
        nombre: string;
        cantidad: string;
        caducidad: string | null;
        unidadId: number | null;
        tipoId: number | null;
        imagenUri: string | null;
        codigoEscaneado?: string;
    }) => void;
    initialNombre?: string;
    initialCantidad?: string;
    initialCaducidad?: string;
    initialUnidadId?: number;
    initialTipoId?: number;
    initialImagenUri?: string;
    initialCodigoEscaneado?: string;
}

export interface EditModalProps { // Assuming this is also used in Refri.tsx
    visible: boolean;
    onClose: () => void;
    onSubmit: (data: {
        idAlimento: number;
        nombre: string;
        cantidad: string;
        caducidad: string | null;
        unidadId: number | null;
        tipoId: number | null;
        imagenUri: string | null;
        codigoEscaneado?: string;
    }) => void;
    initialData: {
        idAlimento: number;
        nombre: string;
        cantidad: string;
        caducidad: string | null;
        unidadId: number;
        tipoId: number;
        imagenUri: string | null;
        codigoEscaneado?: string;
    };
}

interface Tipo {
    Id_Tipo_Alimento: number;
    Tipo_Alimento: string;
}

interface Unidad {
    Id_Unidad_Medida: number;
    Unidad_Medida: string;
}

// --- AddModal (Mobile React Native Version) ---
// This is a new component, not just changes to the Ant Design one.
// The logic will be similar but the UI implementation is different.
export const AddModal: React.FC<AddModalProps> = ({
    visible,
    onClose,
    onSubmit,
    initialNombre,
    initialCodigoEscaneado,
}) => {
    // --- STATE CHANGES (NOW HANDLED MANUALLY OR WITH A FORM LIBRARY) ---
    const [nombre, setNombre] = useState(initialNombre || '');
    const [cantidad, setCantidad] = useState('');
    const [caducidad, setCaducidad] = useState<Date | null>(null);
    const [unidadId, setUnidadId] = useState<number | null>(null);
    const [tipoId, setTipoId] = useState<number | null>(null);
    const [imagenUri, setImagenUri] = useState<string | null>(null);
    const [codigoEscaneado, setCodigoEscaneado] = useState(initialCodigoEscaneado || '');

    const [Tipos, setTipos] = useState<Tipo[]>([]);
    const [Unidades, setUnidad] = useState<Unidad[]>([]);
    const [alimentos, setAlimentos] = useState<any[]>([]); // For existing food suggestions
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [esNuevo, setEsNuevo] = useState(false);
    const [esPerecedero, setEsPerecedero] = useState<boolean | undefined>(undefined);
    const [alimentoSeleccionadoDetalles, setAlimentoSeleccionadoDetalles] = useState<any | null>(null); // To store details of selected existing food

    const [showDatePicker, setShowDatePicker] = useState(false);
    const [isPerecederoQuestionModalVisible, setIsPerecederoQuestionModalVisible] = useState(false);

    // --- EFFECTS ---
    useEffect(() => {
        if (visible) {
            // Reset form when modal opens
            setNombre(initialNombre || '');
            setCantidad('');
            setCaducidad(null);
            setUnidadId(null);
            setTipoId(null);
            setImagenUri(null);
            setCodigoEscaneado(initialCodigoEscaneado || '');
            setSearchTerm(initialNombre || ''); // Initialize search term with initialNombre
            setEsNuevo(false); // Assume not new until confirmed
            setEsPerecedero(undefined); // Reset perecedero status

            obtenerTipos();
            obtenerUnidad();
            fetchAlimentos();
        }
    }, [visible, initialNombre, initialCodigoEscaneado]);

    // --- DATA FETCHING FUNCTIONS (SIMILAR TO ANT DESIGN VERSION) ---
    const obtenerTipos = async () => {
        try {
            const response = await axios.get(`${PUERTO}/tipoA`);
            setTipos(response.data);
        } catch (error) {
            Alert.alert("Error", "No se pudieron cargar los tipos.");
            console.error("Error fetching types:", error);
        }
    };

    const obtenerUnidad = async () => {
        try {
            const response = await axios.get(`${PUERTO}/unidad`);
            setUnidad(response.data);
        } catch (error) {
            Alert.alert("Error", "No se pudieron cargar las unidades.");
            console.error("Error fetching units:", error);
        }
    };

    const fetchAlimentos = async () => {
        try {
            const response = await axios.get(`${PUERTO}/cat_ali/nombres`);
            setAlimentos(response.data);
        } catch (error) {
            Alert.alert("Error", "Error al obtener los alimentos.");
            console.error("Error fetching existing foods:", error);
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
        }
    };

    // --- FORM SUBMISSION ---
    const handleSubmit = async () => {
        if (!nombre || !cantidad || !unidadId || (esNuevo && !tipoId) || (esPerecedero && !caducidad)) {
            Alert.alert('Error', 'Por favor, completa todos los campos requeridos.');
            return;
        }

        const currentUserStr = await AsyncStorage.getItem('currentUser');
              if (!currentUserStr) {
                return;
              }
        
              const currentUser = JSON.parse(currentUserStr);
              const userId = currentUser.id;
        let idUsuario: number | null = null;
        idUsuario = userId;

        if (currentUser) {
            const parsedUserId = Number(currentUser);
            if (!isNaN(parsedUserId) && parsedUserId > 0) { // Check if it's a valid positive number
                idUsuario = parsedUserId;
            }
        }

        if (idUsuario === null) {
            Alert.alert("Advertencia", "No se pudo obtener un ID de usuario válido. Por favor, inicia sesión de nuevo.");
            // Consider redirecting to login or similar
            return;
        }

        const formData = new FormData();
        if (esNuevo) {
            formData.append('nombre', nombre);
        } else {
            // If it's an existing food, use its ID. Ensure `alimentoSeleccionadoDetalles` is correctly set.
            formData.append('id_alimento', alimentoSeleccionadoDetalles ? String(alimentoSeleccionadoDetalles.Id_Alimento) : '0');
        }

        if (esNuevo && tipoId !== null) { // Only append type if new food and type is selected
            formData.append('tipo', String(tipoId));
        }
        if (unidadId !== null) {
            formData.append('id_unidad', String(unidadId));
        }
        formData.append('cantidad', cantidad); // Convert to string if necessary for backend
        if (esPerecedero && caducidad) {
            formData.append('fecha_caducidad', caducidad.toISOString().split('T')[0]); // Format YYYY-MM-DD
        }
        formData.append('Id_Usuario_Alta', idUsuario.toString());
        if (imagenUri) {
            // For React Native, you need to append the image correctly for FormData
            const uriParts = imagenUri.split('.');
            const fileType = uriParts[uriParts.length - 1];
            formData.append('image', {
                uri: imagenUri,
                name: `photo.${fileType}`,
                type: `image/${fileType}`,
            } as any); // Type assertion might be needed depending on FormData library
        }
        if (codigoEscaneado) {
            formData.append('codigo_escaneado', codigoEscaneado);
        }

        let query = "";
        esNuevo ? query += "nuevoAlimento" : query += "alimento";
        esPerecedero ? query += "EsPerecedero" : query += "NoPerecedero";

        try {
            const response = await axios.post(`${PUERTO}/alimento/${query}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            Alert.alert('Éxito', 'Producto agregado correctamente.');
            onSubmit({
                nombre,
                cantidad,
                caducidad: caducidad ? caducidad.toISOString().split('T')[0] : null,
                unidadId,
                tipoId,
                imagenUri,
                codigoEscaneado,
            }); // Notify parent component
            onClose(); // Close the modal
        } catch (error: any) {
            console.error("Error submitting food:", error);
            if (error.response && error.response.data && error.response.data.error) {
                Alert.alert('Error', error.response.data.error);
            } else {
                Alert.alert('Error', 'Error de conexión con el servidor o al agregar el producto.');
            }
        }
    };

    const handleNameChange = (text: string) => {
        setNombre(text);
        setSearchTerm(text); // Update search term as user types
        setEsNuevo(false); // Reset to false until a match is found or not
        setAlimentoSeleccionadoDetalles(null); // Clear selection details
        setEsPerecedero(undefined); // Clear perecedero status
        setTipoId(null); // Clear type for new food

        const alimentoFound = alimentos.find(
            (al) => al.Alimento.toLowerCase().trim() === text.toLowerCase().trim()
        );

        if (alimentoFound) {
            setAlimentoSeleccionadoDetalles(alimentoFound);
            setEsNuevo(false);
            setEsPerecedero(alimentoFound.Es_Perecedero === 1);
            // Pre-fill type/unit if available from existing food, but allow override
            if (alimentoFound.Id_Tipo_Alimento) setTipoId(alimentoFound.Id_Tipo_Alimento);
            if (alimentoFound.Id_Unidad_Medida) setUnidadId(alimentoFound.Id_Unidad_Medida);
        } else {
            setEsNuevo(true);
            setIsPerecederoQuestionModalVisible(true); // Ask if new food is perishable
        }
    };

    const onDateChange = (event: any, selectedDate: Date | undefined) => {
        setShowDatePicker(Platform.OS === 'ios'); // Keep picker open on iOS
        const currentDate = selectedDate || caducidad;
        setCaducidad(currentDate);
    };

    const confirmPerecedero = (isPerecederoStatus: boolean) => {
        setIsPerecederoQuestionModalVisible(false);
        setEsPerecedero(isPerecederoStatus);
        if (!isPerecederoStatus) {
            setCaducidad(null); // Clear date if not perishable
        }
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
                    <Text style={styles.modalTitle}>Agregar Producto</Text>
                    <ScrollView style={styles.formScroll}>
                        {/* Alimento */}
                        <Text style={styles.label}>Alimento:</Text>
<AutocompleteSelect
  options={alimentos.map((al) => ({
    label: al.Alimento,
    value: al.Alimento,
  }))}
  onSelect={(value) => {
    setNombre(value);
    setSearchTerm(value);
    setAlimentoSeleccionadoDetalles(null);
    setEsNuevo(false);
    setEsPerecedero(undefined);
    setTipoId(null);

    const alimentoFound = alimentos.find(
      (al) => al.Alimento.toLowerCase().trim() === value.toLowerCase().trim()
    );

    if (alimentoFound) {
      setAlimentoSeleccionadoDetalles(alimentoFound);
      setEsNuevo(false);
      setEsPerecedero(alimentoFound.Es_Perecedero === 1);
      if (alimentoFound.Id_Tipo_Alimento) setTipoId(alimentoFound.Id_Tipo_Alimento);
      if (alimentoFound.Id_Unidad_Medida) setUnidadId(alimentoFound.Id_Unidad_Medida);
    } else {
      setEsNuevo(true);
      setIsPerecederoQuestionModalVisible(true);
    }
  }}
  defaultValue={initialNombre || ''}
/>

                        {/* Fecha de caducidad (conditional) */}
                        {esPerecedero !== undefined && esPerecedero && (
                            <>
                                <Text style={styles.label}>Fecha de caducidad:</Text>
                                <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.datePickerButton}>
                                    <Text style={styles.datePickerText}>
                                        {caducidad ? caducidad.toISOString().split('T')[0] : 'Selecciona una fecha'}
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

                        {/* Cantidad */}
                        <Text style={styles.label}>Cantidad:</Text>
                        <TextInput
                            style={styles.input}
                            onChangeText={setCantidad}
                            value={cantidad}
                            keyboardType="numeric"
                            placeholder="Introduce la cantidad"
                        />

                        {/* Unidad */}
                        <Text style={styles.label}>Unidad:</Text>
                        <View style={styles.pickerContainer}>
                            <Picker
                                selectedValue={unidadId}
                                onValueChange={(itemValue) => setUnidadId(itemValue)}
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

                        {/* Tipo (conditional for new food) */}
                        {esNuevo && (
                            <>
                                <Text style={styles.label}>Tipo:</Text>
                                <View style={styles.pickerContainer}>
                                    <Picker
                                        selectedValue={tipoId}
                                        onValueChange={(itemValue) => setTipoId(itemValue)}
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

                        {/* Imagen */}
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

            {/* Modal for "Is it perishable?" question */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={isPerecederoQuestionModalVisible}
                onRequestClose={() => setIsPerecederoQuestionModalVisible(false)}
            >
                <View style={styles.centeredView}>
                    <View style={styles.questionModalView}>
                        <Text style={styles.questionModalText}>¿Es este producto perecedero?</Text>
                        <View style={styles.questionModalButtons}>
                            <TouchableOpacity style={styles.questionButtonYes} onPress={() => confirmPerecedero(true)}>
                                <Text style={styles.buttonText}>Sí</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.questionButtonNo} onPress={() => confirmPerecedero(false)}>
                                <Text style={styles.buttonText}>No</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </Modal>
    );
};

// --- EditModal (Mobile React Native Version) ---
// This is also a new component, mirroring the AddModal structure for editing.
export const EditModal: React.FC<EditModalProps> = ({
    visible,
    onClose,
    onSubmit,
    initialData,
}) => {
    // --- STATE INITIALIZATION WITH initialData ---
    const [nombre, setNombre] = useState(initialData.nombre);
    const [cantidad, setCantidad] = useState(initialData.cantidad);
    const [caducidad, setCaducidad] = useState<Date | null>(initialData.caducidad ? new Date(initialData.caducidad) : null);
    const [unidadId, setUnidadId] = useState<number | null>(initialData.unidadId);
    const [tipoId, setTipoId] = useState<number | null>(initialData.tipoId);
    const [imagenUri, setImagenUri] = useState<string | null>(initialData.imagenUri);
    const [codigoEscaneado, setCodigoEscaneado] = useState(initialData.codigoEscaneado || '');

    const [Tipos, setTipos] = useState<Tipo[]>([]);
    const [Unidades, setUnidad] = useState<Unidad[]>([]);
    const [showDatePicker, setShowDatePicker] = useState(false);

    // Determine if it's perecedero based on initialData.caducidad presence or type from backend
    const [esPerecedero, setEsPerecedero] = useState(initialData.caducidad !== null);

    // --- EFFECTS ---
    useEffect(() => {
        if (visible) {
            // Re-initialize state when modal becomes visible or initialData changes
            setNombre(initialData.nombre);
            setCantidad(initialData.cantidad);
            setCaducidad(initialData.caducidad ? new Date(initialData.caducidad) : null);
            setUnidadId(initialData.unidadId);
            setTipoId(initialData.tipoId);
            setImagenUri(initialData.imagenUri);
            setCodigoEscaneado(initialData.codigoEscaneado || '');
            setEsPerecedero(initialData.caducidad !== null);

            obtenerTipos();
            obtenerUnidad();
        }
    }, [visible, initialData]);

    // --- DATA FETCHING FUNCTIONS (SHARED WITH ADDMOBAL) ---
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

    // --- IMAGE PICKER (SHARED WITH ADDMOBAL) ---
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
        }
    };

    const onDateChange = (event: any, selectedDate: Date | undefined) => {
        setShowDatePicker(Platform.OS === 'ios'); // Keep picker open on iOS
        const currentDate = selectedDate || caducidad;
        setCaducidad(currentDate);
    };

    // --- FORM SUBMISSION FOR EDIT ---
    const handleEditSubmit = async () => {
        if (!nombre || !cantidad || !unidadId || !tipoId || (esPerecedero && !caducidad)) {
            Alert.alert('Error', 'Por favor, completa todos los campos requeridos.');
            return;
        }

        const currentUser = localStorage.getItem("currentUser");
        if (!currentUser) {
            Alert.alert("Advertencia", "No hay un usuario logueado actualmente.");
            return;
        }
        const idUsuario = Number(currentUser);

        const formData = new FormData();
        formData.append('idAlimento', String(initialData.idAlimento)); // IMPORTANT: Send the ID
        formData.append('nombre', nombre);
        formData.append('id_unidad', String(unidadId));
        formData.append('cantidad', cantidad);
        formData.append('id_tipo', String(tipoId)); // Assuming you send type for existing food on edit too
        if (esPerecedero && caducidad) {
            formData.append('fecha_caducidad', caducidad.toISOString().split('T')[0]);
        } else {
            formData.append('fecha_caducidad', ''); // Explicitly send empty if not perishable
        }
        formData.append('Id_Usuario_Modifica', idUsuario.toString()); // Assuming a "modifying user" ID

        if (imagenUri && imagenUri !== initialData.imagenUri) { // Only send image if changed
             const uriParts = imagenUri.split('.');
            const fileType = uriParts[uriParts.length - 1];
            formData.append('image', {
                uri: imagenUri,
                name: `photo.${fileType}`,
                type: `image/${fileType}`,
            } as any);
        }
        if (codigoEscaneado) {
            formData.append('codigo_escaneado', codigoEscaneado);
        }

        try {
            // Use PUT request for updating
            const response = await axios.put(`${PUERTO}/alimento/actualizarAlimento`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            Alert.alert('Éxito', 'Producto actualizado correctamente.');
            onSubmit({
                idAlimento: initialData.idAlimento,
                nombre,
                cantidad,
                caducidad: caducidad ? caducidad.toISOString().split('T')[0] : null,
                unidadId,
                tipoId,
                imagenUri,
                codigoEscaneado,
            });
            onClose();
        } catch (error: any) {
            console.error("Error updating food:", error);
            if (error.response && error.response.data && error.response.data.error) {
                Alert.alert('Error', error.response.data.error);
            } else {
                Alert.alert('Error', 'Error de conexión con el servidor o al actualizar el producto.');
            }
        }
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
                    <Text style={styles.modalTitle}>Editar Producto</Text>
                    <ScrollView style={styles.formScroll}>
                        {/* Nombre del alimento (can be edited) */}
                        <Text style={styles.label}>Alimento:</Text>
                        <TextInput
                            style={styles.input}
                            onChangeText={setNombre}
                            value={nombre}
                            placeholder="Nombre del alimento"
                        />

                        {/* Fecha de caducidad (conditional) */}
                        <Text style={styles.label}>Es perecedero:</Text>
                        <View style={styles.checkboxContainer}>
                            <TouchableOpacity
                                style={styles.checkbox}
                                onPress={() => setEsPerecedero(!esPerecedero)}
                            >
                                {esPerecedero ? <Text style={styles.checkedBox}>✓</Text> : <Text style={styles.uncheckedBox}></Text>}
                            </TouchableOpacity>
                            <Text>Sí</Text>
                        </View>

                        {esPerecedero && (
                            <>
                                <Text style={styles.label}>Fecha de caducidad:</Text>
                                <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.datePickerButton}>
                                    <Text style={styles.datePickerText}>
                                        {caducidad ? caducidad.toISOString().split('T')[0] : 'Selecciona una fecha'}
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

                        {/* Cantidad */}
                        <Text style={styles.label}>Cantidad:</Text>
                        <TextInput
                            style={styles.input}
                            onChangeText={setCantidad}
                            value={cantidad}
                            keyboardType="numeric"
                            placeholder="Introduce la cantidad"
                        />

                        {/* Unidad */}
                        <Text style={styles.label}>Unidad:</Text>
                        <View style={styles.pickerContainer}>
                            <Picker
                                selectedValue={unidadId}
                                onValueChange={(itemValue) => setUnidadId(itemValue)}
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

                        {/* Tipo */}
                        <Text style={styles.label}>Tipo:</Text>
                        <View style={styles.pickerContainer}>
                            <Picker
                                selectedValue={tipoId}
                                onValueChange={(itemValue) => setTipoId(itemValue)}
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

                        {/* Imagen */}
                        <Text style={styles.label}>Imagen:</Text>
                        <TouchableOpacity style={styles.imagePickerButton} onPress={pickImage}>
                            <Text style={styles.imagePickerButtonText}>Subir Nueva Imagen</Text>
                        </TouchableOpacity>
                        {imagenUri && <Text style={styles.imageUriText}>{imagenUri.split('/').pop()}</Text>}
                        {/* Optionally show current image */}
                        {initialData.imagenUri && initialData.imagenUri !== "/imagenes/defIng.png" && (
                             <Text style={styles.imageUriText}>Imagen actual: {initialData.imagenUri.split('/').pop()}</Text>
                        )}
                        {/* For simplicity, QR code field is not shown, assuming it's not editable by user */}

                    </ScrollView>
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity style={styles.saveButton} onPress={handleEditSubmit}>
                            <Text style={styles.buttonText}>Actualizar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                            <Text style={styles.buttonText}>Cancelar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

// --- STYLES ---
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
        height: 50, // Standard height for Picker
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
    suggestionsContainer: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        maxHeight: 150,
        overflow: 'hidden',
        marginTop: 5,
    },
    suggestionItem: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    suggestionText: {
        fontSize: 16,
        color: '#333',
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderWidth: 2,
        borderColor: '#3E7E1E',
        borderRadius: 4,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    checkedBox: {
        color: '#3E7E1E',
        fontSize: 18,
        fontWeight: 'bold',
    },
    uncheckedBox: {
        width: 18,
        height: 18,
        backgroundColor: '#fff',
    },
});