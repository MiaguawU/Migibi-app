import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Modal,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { Picker } from '@react-native-picker/picker'; // Si vas a usar un Picker para la cantidad (ej. unidades, gramos)
import { MaterialCommunityIcons } from '@expo/vector-icons'; // Para el ícono de "check"

interface AddIngredientModalProps {
    isVisible: boolean;
    onClose: () => void;
    id_receta: number | null;
}

export const AddIngredientModal: React.FC<AddIngredientModalProps> = ({
    isVisible,
    onClose,
    id_receta,
}) => {
    const [ingredientName, setIngredientName] = useState('');
    const [ingredientQuantity, setIngredientQuantity] = useState('');
    const [quantityUnit, setQuantityUnit] = useState('g'); // Estado para la unidad de cantidad, si usas Picker

    const handleAdd = () => {
        if (ingredientName.trim() === '' || ingredientQuantity.trim() === '') {
            alert('Por favor, introduce el nombre y la cantidad del ingrediente.');
            return;
        }
        
        setIngredientName('');
        setIngredientQuantity('');
        setQuantityUnit('g'); // Resetear unidad
        onClose();
    };

    return (
        <Modal
            animationType="fade" // O "slide"
            transparent={true}
            visible={isVisible}
            onRequestClose={onClose}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.centeredView}
            >
                <View style={styles.modalView}>
                    <View style={styles.headerBubble}>
                        <Text style={styles.headerText}>Agregar ingrediente</Text>
                    </View>

                    <View style={styles.formContainer}>
                        <Text style={styles.label}>Nombre</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Ej. Manzanas"
                            placeholderTextColor="#A9A9A9"
                            value={ingredientName}
                            onChangeText={setIngredientName}
                        />

                        <Text style={styles.label}>Cantidad</Text>
                        <View style={styles.quantityInputContainer}>
                            <TextInput
                                style={[styles.input, styles.quantityTextInput]}
                                placeholder="Ej. 300"
                                placeholderTextColor="#A9A9A9"
                                keyboardType="numeric"
                                value={ingredientQuantity}
                                onChangeText={setIngredientQuantity}
                            />
                            {/* Puedes usar un Picker para la unidad o simplemente dejar un TextInput */}
                            <View style={styles.pickerContainer}>
                                <Picker
                                    selectedValue={quantityUnit}
                                    onValueChange={(itemValue) => setQuantityUnit(itemValue)}
                                    style={styles.picker}
                                >
                                    <Picker.Item label="g" value="g" />
                                    <Picker.Item label="kg" value="kg" />
                                    <Picker.Item label="ml" value="ml" />
                                    <Picker.Item label="L" value="L" />
                                    <Picker.Item label="unid." value="unid." />
                                    <Picker.Item label="tazas" value="tazas" />
                                    <Picker.Item label="cucharadas" value="cucharadas" />
                                    <Picker.Item label="pizcas" value="pizcas" />
                                </Picker>
                            </View>
                        </View>
                    </View>

                    <TouchableOpacity style={styles.confirmButton} onPress={handleAdd}>
                        <MaterialCommunityIcons name="check-circle" size={40} color="#4B7B34" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.confirmButton} onPress={()=> onClose()}>
                        <MaterialCommunityIcons name="check-circle" size={40} color="#FFDA48" />
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)', // Fondo semitransparente
    },
    modalView: {
        width: '85%',
        backgroundColor: '#D9F7C2', // Color de fondo de la card similar
        borderRadius: 20,
        paddingTop: 35, // Espacio para la burbuja del encabezado
        paddingHorizontal: 20,
        paddingBottom: 20,
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
    headerBubble: {
        backgroundColor: '#7DBA61', // Color de la burbuja
        borderRadius: 15,
        paddingVertical: 8,
        paddingHorizontal: 25,
        position: 'absolute',
        top: -25, // Para que sobresalga
        zIndex: 1,
        flexDirection: 'row',
        justifyContent: 'center', // Centrar texto en la burbuja
        alignItems: 'center',
        width: '70%', // Ancho de la burbuja
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 5,
    },
    headerText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    formContainer: {
        width: '100%',
        marginTop: 15, // Espacio entre burbuja y campos
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        color: '#345532', // Verde oscuro para las etiquetas
        marginBottom: 5,
        fontWeight: 'bold',
    },
    input: {
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        padding: 12,
        marginBottom: 15,
        fontSize: 16,
        color: '#333',
        borderWidth: 1,
        borderColor: '#CFE8D7',
    },
    quantityInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    quantityTextInput: {
        flex: 1,
        marginBottom: 0, // Anular el marginBottom del input general
        marginRight: 10,
    },
    pickerContainer: {
        borderWidth: 1,
        borderColor: '#CFE8D7',
        borderRadius: 8,
        backgroundColor: '#FFFFFF',
        // Asegúrate de que el Picker no se vea demasiado grande o pequeño
        height: 50, // Altura del picker
        justifyContent: 'center',
        overflow: 'hidden', // Para contener bien el picker
        width: 100, // Ancho fijo para el picker de unidad
    },
    picker: {
        height: 50, // La altura del Picker debe coincidir con la del contenedor
        width: '100%',
    },
    confirmButton: {
        marginTop: 10,
        // Puedes ajustar el tamaño o estilo del botón de confirmación
        // si no quieres que sea solo un icono grande
    },
});