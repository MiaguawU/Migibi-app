import React, { useState, useEffect } from 'react';
import {
    Modal,
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Alert,
    Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons'; // Para los checkboxes

// Define la interfaz para un elemento de alimento individual
interface FoodItem {
    id: string; // Un ID único para el alimento
    name: string;
    daysRemaining: number | null; // null si no aplica o no se sabe
    isPerishable: boolean; // Indica si tiene fecha de caducidad
}

// Propiedades que el modal recibirá
interface ExpiringFoodModalProps {
    visible: boolean;
    onClose: () => void;
}

export const CaducarModal: React.FC<ExpiringFoodModalProps> = ({
    visible,
    onClose,
}) => {
    // Datos mock para simular alimentos por caducar
    const [foodItems, setFoodItems] = useState<
        (FoodItem & { isSelected: boolean })[]
    >([]);

    const [selectedFoodIds, setSelectedFoodIds] = useState<string[]>([]);
    const [actionButtonEnabled, setActionButtonEnabled] = useState(false);

    // Cargar datos mock y resetear estados cuando el modal se abre
    useEffect(() => {
        if (visible) {
            // Reiniciar la selección y cargar datos mock
            setSelectedFoodIds([]);
            setActionButtonEnabled(false);
            setFoodItems([
                { id: '1', name: 'Manzanas', daysRemaining: 2, isPerishable: true, isSelected: false },
                { id: '2', name: 'Pepinos', daysRemaining: 5, isPerishable: true, isSelected: false },
                { id: '3', name: 'Arroz', daysRemaining: null, isPerishable: false, isSelected: false }, // No perecedero
                { id: '4', name: 'Pollo', daysRemaining: 1, isPerishable: true, isSelected: false },
                { id: '5', name: 'Pasta', daysRemaining: null, isPerishable: false, isSelected: false }, // No perecedero
                { id: '6', name: 'Leche', daysRemaining: 3, isPerishable: true, isSelected: false },
                { id: '7', name: 'Pan', daysRemaining: 4, isPerishable: true, isSelected: false },
            ]);
        }
    }, [visible]);

    // Actualizar el estado del botón de acción cuando cambia la selección
    useEffect(() => {
        setActionButtonEnabled(selectedFoodIds.length > 0);
    }, [selectedFoodIds]);

    // Función para manejar la selección/deselección de un alimento
    const toggleSelectFood = (id: string) => {
        setFoodItems(prevItems =>
            prevItems.map(item =>
                item.id === id ? { ...item, isSelected: !item.isSelected } : item
            )
        );

        setSelectedFoodIds(prevSelectedIds =>
            prevSelectedIds.includes(id)
                ? prevSelectedIds.filter(selectedId => selectedId !== id)
                : [...prevSelectedIds, id]
        );
    };

    // Función para manejar la acción (ej. "Marcar como consumido")
    const handleActionButtonPress = () => {
        if (selectedFoodIds.length === 0) {
            Alert.alert('Advertencia', 'Por favor, selecciona al menos un alimento.');
            return;
        }
        
        const selectedNames = foodItems
            .filter(item => selectedFoodIds.includes(item.id))
            .map(item => item.name)
            .join(', ');

        Alert.alert(
            'Acción',
            `Has seleccionado para acción: ${selectedNames}. Aquí iría la lógica para eliminar/marcar como consumido.`,
            [
                { text: 'OK', onPress: onClose } // Cierra el modal después de la acción
            ]
        );
        // Aquí iría tu lógica para enviar los IDs seleccionados al backend, etc.
        // Después de la acción, podrías refrescar la lista o cerrar el modal.
    };

    return (
        <Modal
            animationType="fade" // O "slide" o "none"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.centeredView}>
                <View style={styles.modalContainer}>
                    {/* Header: "Por caducar" */}
                    <View style={styles.headerBubble}>
                        <Text style={styles.headerText}>Por caducar</Text>
                    </View>

                    {/* Botón de acción global */}
                    <TouchableOpacity
                        style={[
                            styles.actionButton,
                            !actionButtonEnabled && styles.actionButtonDisabled,
                        ]}
                        onPress={handleActionButtonPress}
                        disabled={!actionButtonEnabled}
                    >
                        <Text style={styles.actionButtonText}>
                            Marcar seleccionados como consumidos
                        </Text>
                    </TouchableOpacity>

                    {/* Contenedor de la lista de alimentos */}
                    <View style={styles.foodListContainer}>
                        <ScrollView showsVerticalScrollIndicator={false}>
                            {foodItems.map((food, index) => (
                                <View key={food.id} style={styles.foodItemRow}>
                                    <Text style={styles.foodItemText}>
                                        {food.name}
                                        {food.isPerishable && food.daysRemaining !== null && food.daysRemaining >= 0 && (
                                            <Text style={styles.daysText}>
                                                {` / ${food.daysRemaining} día${food.daysRemaining !== 1 ? 's' : ''}`}
                                            </Text>
                                        )}
                                        {food.isPerishable && food.daysRemaining !== null && food.daysRemaining < 0 && (
                                            <Text style={styles.expiredText}>
                                                {` / Caducado`}
                                            </Text>
                                        )}
                                    </Text>
                                    <TouchableOpacity onPress={() => toggleSelectFood(food.id)}>
                                        <MaterialCommunityIcons
                                            // ¡CAMBIO AQUÍ! Nombres de íconos cuadrados
                                            name={food.isSelected ? 'checkbox-marked' : 'checkbox-blank-outline'}
                                            size={28}
                                            color={food.isSelected ? styles.checkboxChecked.color : styles.checkboxUnchecked.color}
                                            style={styles.checkbox}
                                        />
                                    </TouchableOpacity>
                                </View>
                            ))}
                        </ScrollView>
                    </View>

                    {/* Botón de cerrar el modal */}
                    <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                        <Text style={styles.closeButtonText}>Cerrar</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.4)', // Fondo semitransparente oscuro
    },
    modalContainer: {
        width: '85%',
        padding: 20,
        backgroundColor: '#7DBA61', // Verde de fondo principal
        borderRadius: 20, // Bordes redondeados
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 8,
    },
    headerBubble: {
        backgroundColor: '#D9F7C2', // Verde más claro para el título
        borderRadius: 15, // Bordes redondeados para la burbuja
        paddingVertical: 8,
        paddingHorizontal: 25,
        position: 'absolute', // Posiciona el título en la parte superior del modal
        top: -25, // Ajusta para que sobresalga
        zIndex: 1, // Asegura que esté por encima de otros elementos
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
        fontSize: 20,
        fontWeight: 'bold',
        color: '#4B7B34', // Color del texto del título
    },
    actionButton: {
        backgroundColor: '#4CAF50', // Verde para el botón de acción
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 10,
        marginTop: 30, // Espacio desde el título
        marginBottom: 15,
        alignSelf: 'stretch', // Ocupa todo el ancho disponible
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    actionButtonDisabled: {
        backgroundColor: '#A5D6A7', // Un verde más claro cuando está deshabilitado
    },
    actionButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    foodListContainer: {
        width: '100%',
        maxHeight: 250, // Limita la altura para que sea scrollable
        backgroundColor: '#E8F5E9', // Fondo muy claro para la lista
        borderRadius: 15,
        paddingHorizontal: 15,
        paddingVertical: 10,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.15,
        shadowRadius: 2,
        elevation: 3,
    },
    foodItemRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#CFE8D7', // Línea divisoria sutil
    },
    foodItemText: {
        fontSize: 18,
        color: '#345532', // Color del texto del alimento
        flex: 1, // Permite que el texto ocupe el espacio restante
    },
    daysText: {
        fontSize: 16,
        color: '#8BC34A', // Color para los días restantes
        fontWeight: 'bold',
    },
    expiredText: {
        fontSize: 16,
        color: '#D32F2F', // Rojo para "Caducado"
        fontWeight: 'bold',
    },
    checkbox: {
        // Puedes ajustar el tamaño si usas un icono diferente
    },
    // Definimos los colores del checkbox aquí para usarlos con MaterialCommunityIcons
    checkboxChecked: {
        color: '#4CAF50', // Color cuando está marcado
    },
    checkboxUnchecked: {
        color: '#8BC34A', // Color cuando está desmarcado
    },
    closeButton: {
        backgroundColor: '#FF6F61', // Rojo suave para cerrar
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 10,
        marginTop: 10,
    },
    closeButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});