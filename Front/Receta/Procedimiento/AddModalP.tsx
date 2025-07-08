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
    Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface AddInstructionModalProps {
    isVisible: boolean;
    onClose: () => void;
    id_receta: number | null;
}

export const AddInstructionModal: React.FC<AddInstructionModalProps> = ({
    isVisible,
    onClose,
    id_receta,
}) => {
    const [instructionText, setInstructionText] = useState('');

    const handleAdd = () => {
        if (instructionText.trim() === '') {
            Alert.alert('Error', 'Por favor, introduce el texto de la instrucción.');
            return;
        }
        setInstructionText(''); // Limpia el campo después de agregar
        onClose(); // Cierra el modal
    };

    return (
        <Modal
            animationType="fade" // O "slide"
            transparent={true}
            visible={isVisible}
            onRequestClose={onClose} // Permite cerrar el modal presionando fuera en Android
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.centeredView}
            >
                <View style={styles.modalView}>
                    <View style={styles.headerBubble}>
                        <Text style={styles.headerText}>Agregar instrucción</Text>
                    </View>

                    <View style={styles.formContainer}>
                        <TextInput
                            style={styles.input}
                            placeholder="Escribe aquí tu instrucción..."
                            placeholderTextColor="#A9A9A9"
                            value={instructionText}
                            onChangeText={setInstructionText}
                            multiline // Permite múltiples líneas
                            numberOfLines={5} // Sugerir 5 líneas visibles
                            textAlignVertical="top" // Alinea el texto en la parte superior para multiline
                        />
                    </View>

                    <TouchableOpacity style={styles.confirmButton} onPress={handleAdd}>
                        <MaterialCommunityIcons name="check-circle" size={40} color="#4B7B34" />
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
        justifyContent: 'center',
        alignItems: 'center',
        width: '75%', // Ancho de la burbuja
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
        marginTop: 15, // Espacio entre burbuja y campo
        marginBottom: 20,
    },
    input: {
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        color: '#333',
        borderWidth: 1,
        borderColor: '#CFE8D7',
        minHeight: 100, // Altura mínima para el área de texto
    },
    confirmButton: {
        marginTop: 10,
    },
});