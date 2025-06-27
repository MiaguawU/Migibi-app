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
    Platform, // Though not explicitly used here, good practice for RN projects
} from 'react-native';
import { Picker } from '@react-native-picker/picker'; // For Select equivalent
import axios from "axios";
import PUERTO from "../../config"; // Ensure this path is correct for React Native
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define props for the modal
export interface ConsumeModalProps {
    visible: boolean;
    onClose: () => void;
    onSubmit: () => void; // Callback to refresh parent data after consumption
    IdStock: number | null; // ID of the stock item to be consumed (renamed from alimentoId for consistency)
}

// Interface for unit data from backend
interface Unidad {
    Id_Unidad_Medida: number;
    Unidad_Medida: string;
}

// Interface for the detailed food item data from backend's /alUn/:id endpoint
interface AlimentoStockDetalles {
    Nombre: string;
    Cantidad: number; // Current quantity in stock
    id_unidad: number;
    // Add other relevant properties if needed from this endpoint
}

export const ConsumoModal: React.FC<ConsumeModalProps> = ({
    visible,
    onClose,
    onSubmit,
    IdStock,
}) => {
    // State variables for form fields
    const [nombre, setNombre] = useState<string>(''); // Name of the food item
    const [cantidadActual, setCantidadActual] = useState<number>(0); // Max quantity available to consume
    const [cantidadConsumir, setCantidadConsumir] = useState<string>(''); // Quantity user wants to consume (text input)
    const [unidadId, setUnidadId] = useState<number | null>(null); // Selected unit ID

    // State for units data
    const [Unidades, setUnidades] = useState<Unidad[]>([]);

    // Effect hook to load data when modal becomes visible or IdStock changes
    useEffect(() => {
        if (visible) {
            // Reset states when modal opens
            setNombre('');
            setCantidadActual(0);
            setCantidadConsumir('');
            setUnidadId(null);
            setUnidades([]); // Clear units before fetching

            obtenerUnidad(); // Always fetch units
            if (IdStock) {
                obtenerAlimento(IdStock); // Fetch specific food details if IdStock is provided
            } else {
                // If no IdStock, it's an error or unintended use for this modal
                Alert.alert("Error", "No se ha proporcionado un ID de alimento para consumir.");
                onClose(); // Close modal if no valid ID
            }
        }
    }, [visible, IdStock]);

    // Function to fetch details of the specific food item from stock
    const obtenerAlimento = async (id: number) => {
        try {
            const response = await axios.get(`${PUERTO}/alUn/${id}`);
            const alimento: AlimentoStockDetalles = response.data;

            setNombre(alimento.Nombre);
            setCantidadActual(alimento.Cantidad);
            setUnidadId(alimento.id_unidad);
            setCantidadConsumir(''); // Start with empty for consumption input
        } catch (error) {
            Alert.alert("Error", "No se pudo cargar el alimento para consumo.");
            console.error("Error fetching food for consumption:", error);
            onClose(); // Close modal on error
        }
    };

    // Function to fetch available units
    const obtenerUnidad = async () => {
        try {
            const response = await axios.get(`${PUERTO}/unidad`);
            setUnidades(response.data);
        } catch (error) {
            Alert.alert("Error", "No se pudieron cargar las unidades.");
            console.error("Error fetching units:", error);
        }
    };

    // Function to handle form submission
    const handleSubmit = async () => {
        const currentUserString = await AsyncStorage.getItem("currentUser");
        if (!currentUserString) {
            Alert.alert("Advertencia", "No hay un usuario logueado actualmente.");
            return;
        }
        const currentUser = JSON.parse(currentUserString); // Assuming it's a JSON string with an 'id' property
        const idUsuario = currentUser.id;

        // Basic form validation
        const consumedQuantity = Number(cantidadConsumir);

        if (!cantidadConsumir.trim() || isNaN(consumedQuantity) || consumedQuantity <= 0) {
            Alert.alert("Error", "La cantidad a consumir debe ser un número válido y mayor que cero.");
            return;
        }
        if (consumedQuantity > cantidadActual) {
            Alert.alert("Error", `La cantidad a consumir no puede ser mayor que la cantidad actual (${cantidadActual}).`);
            return;
        }
        if (unidadId === null) {
            Alert.alert("Error", "Por favor, selecciona una unidad.");
            return;
        }
        if (IdStock === null) {
            Alert.alert("Error", "ID de stock no válido para consumo.");
            return;
        }

        const payload = {
            id_stock: IdStock, // The stock ID being updated
            id_unidad: unidadId,
            cantidad: consumedQuantity, // The amount being consumed
            Id_Usuario_Alta: idUsuario // User performing the action
        };

        try {
            // Your Ant Design code used PUT to /alimento/:alimentoId with payload
            // This assumes the backend endpoint for consumption is `PUT /alimento/:id` and expects a JSON body
            const response = await axios.put(`${PUERTO}/alimento/${IdStock}`, payload, {
                headers: { 'Content-Type': 'application/json' },
            });

            Alert.alert("Éxito", 'Producto consumido/actualizado exitosamente.');
            onClose(); // Close modal
            onSubmit(); // Notify parent to refresh data
        } catch (error: any) {
            console.error("Error en la solicitud de consumo:", error);
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

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.centeredView}>
                <View style={styles.modalView}>
                    <Text style={styles.modalTitle}>Consumir Producto</Text>
                    <ScrollView style={styles.formScroll}>
                        {/* Display Food Name */}
                        <Text style={styles.label}>Nombre:</Text>
                        <Text style={styles.displayValue}>{nombre}</Text>

                        {/* Current Quantity Display */}
                        <Text style={styles.label}>Cantidad Actual:</Text>
                        <Text style={styles.displayValue}>{cantidadActual} {Unidades.find(u => u.Id_Unidad_Medida === unidadId)?.Unidad_Medida || ''}</Text>

                        {/* Quantity to Consume Input */}
                        <Text style={styles.label}>Cantidad a Consumir:</Text>
                        <TextInput
                            style={styles.input}
                            onChangeText={setCantidadConsumir}
                            value={cantidadConsumir}
                            keyboardType="numeric"
                            placeholder={`Introduce la cantidad (máx ${cantidadActual})`}
                        />

                        {/* Unit Selector */}
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

                    </ScrollView>
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity style={styles.saveButton} onPress={handleSubmit}>
                            <Text style={styles.buttonText}>Confirmar Consumo</Text>
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
        backgroundColor: 'rgba(0,0,0,0.5)', // Semi-transparent backdrop
    },
    modalView: {
        width: '90%',
        maxHeight: '80%', // Adjusted for mobile screen real estate
        backgroundColor: '#F0FDF4', // Light green background
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
        elevation: 5, // Android shadow
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#3E7E1E', // Darker green for title
    },
    formScroll: {
        width: '100%',
    },
    label: {
        fontSize: 18,
        color: '#758B63', // Muted green for labels
        marginBottom: 5,
        marginTop: 10,
        fontWeight: 'bold',
    },
    displayValue: {
        fontSize: 18,
        color: '#333333',
        marginBottom: 10,
        padding: 10,
        borderWidth: 1,
        borderColor: '#A0CF4B', // Primary green border
        borderRadius: 8,
        backgroundColor: '#FFFFFF', // White background for display fields
        width: '100%',
    },
    input: {
        borderWidth: 1,
        borderColor: '#A0CF4B', // Primary green border
        borderRadius: 8,
        padding: 10,
        fontSize: 16,
        width: '100%',
        backgroundColor: '#FFFFFF', // White background
        color: '#333333',
    },
    pickerContainer: {
        borderWidth: 1,
        borderColor: '#A0CF4B', // Primary green border
        borderRadius: 8,
        width: '100%',
        backgroundColor: '#FFFFFF', // White background
        justifyContent: 'center',
        overflow: 'hidden', // Ensures picker content stays within rounded corners
    },
    picker: {
        width: '100%',
        height: 50, // Standard height for Picker
        color: '#333333',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        marginTop: 20,
    },
    saveButton: {
        backgroundColor: '#A0CF4B', // Primary green button
        padding: 12,
        borderRadius: 8,
        flex: 1,
        marginHorizontal: 5,
        alignItems: 'center',
        shadowColor: '#000', // Subtle shadow for depth
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 3,
    },
    cancelButton: {
        backgroundColor: '#D9534F', // Red for cancel
        padding: 12,
        borderRadius: 8,
        flex: 1,
        marginHorizontal: 5,
        alignItems: 'center',
        shadowColor: '#000', // Subtle shadow for depth
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 3,
    },
    buttonText: {
        color: '#FFFFFF', // White text on buttons
        fontSize: 18,
        fontWeight: 'bold',
    },
});
