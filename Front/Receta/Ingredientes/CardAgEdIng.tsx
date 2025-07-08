import React, { useState, useEffect } from 'react';
import {
    View,
    Text, // Make sure Text is imported
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Alert,
    TextInput,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AddIngredientModal } from './AddModalIng'

// Define la interfaz para un elemento de ingrediente individual
interface IngredientItem {
    id: string; // Un ID único para el ingrediente
    name: string;
    quantity: string; // Ejemplo: "300 g", "2 unidades", "1 taza"
    isSelected: boolean; // Para el checkbox
}

// Propiedades que el componente recibirá
interface IngredientesCardProps {
    id_receta: number | null; // El ID de la receta a la que pertenecen los ingredientes
    // Si quieres que el card pueda notificar cambios a la receta padre
    // onIngredientsChange?: (ingredients: IngredientItem[]) => void;
}

export const IngredientesCard: React.FC<IngredientesCardProps> = ({
    id_receta,
    // onIngredientsChange,
}) => {
    const [newIngredientName, setNewIngredientName] = useState('');
    const [newIngredientQuantity, setNewIngredientQuantity] = useState('');
    const [ingredients, setIngredients] = useState<IngredientItem[]>([]);
    const [isAddModalVisible, setIsAddModalVisible] = useState(false);

    useEffect(() => {
        if (id_receta !== null) {
            setIngredients([
                { id: 'ing1', name: 'Manzanas', quantity: '300 g', isSelected: false },
                { id: 'ing2', name: 'Pepinos', quantity: '2 unidades', isSelected: false },
                { id: 'ing3', name: 'Arroz', quantity: '500 g', isSelected: false },
                { id: 'ing4', name: 'Pollo', quantity: '1 kg', isSelected: false },
                { id: 'ing5', name: 'Pasta', quantity: '250 g', isSelected: false },
            ]);
        } else {
            setIngredients([
                { id: 'ing1', name: 'Manzanas', quantity: '300 g', isSelected: false },
                { id: 'ing2', name: 'Pepinos', quantity: '2 unidades', isSelected: false },
                { id: 'ing3', name: 'Arroz', quantity: '500 g', isSelected: false },
                { id: 'ing4', name: 'Pollo', quantity: '1 kg', isSelected: false },
                { id: 'ing5', name: 'Pasta', quantity: '250 g', isSelected: false },
            ]);
        }
    }, [id_receta]);

    const toggleSelectIngredient = (id: string) => {
        setIngredients(prevIngredients =>
            prevIngredients.map(item =>
                item.id === id ? { ...item, isSelected: !item.isSelected } : item
            )
        );
    };

    const deleteIngredient = (id: string) => {
        Alert.alert(
            'Eliminar Ingrediente',
            '¿Estás seguro de que quieres eliminar este ingrediente?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Eliminar',
                    onPress: () => {
                        setIngredients(prevIngredients => prevIngredients.filter(item => item.id !== id));
                    },
                    style: 'destructive',
                },
            ]
        );
    };

    const addIngredient = () => {
        setIsAddModalVisible(true);
    };

    return (
        <View style={styles.modalContainer}>
            <View style={styles.headerBubble}>
                <Text style={styles.headerText}>Ingredientes</Text>
                <TouchableOpacity onPress={addIngredient} style={styles.addIngredientButton}>
                    <MaterialCommunityIcons name="plus-circle" size={30} color="#4B7B34" />
                </TouchableOpacity>
            </View>


            <View style={styles.ingredientListContainer}>
                <ScrollView showsVerticalScrollIndicator={false}>
                    {ingredients.length === 0 ? (
                        // This seems correct
                        <Text style={styles.noIngredientsText}>No hay ingredientes en la lista.</Text>
                    ) : (
                        ingredients.map(item => (
                            <View key={item.id} style={styles.ingredientItemRow}>
                                {/* This seems correct */}
                                <Text style={styles.ingredientItemText}>
                                    {item.name} / {item.quantity}
                                </Text>
                                <View style={styles.itemActions}>
                                    <TouchableOpacity onPress={() => deleteIngredient(item.id)} style={styles.deleteButton}>
                                        <MaterialCommunityIcons name="trash-can-outline" size={24} color="#D32F2F" />
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => toggleSelectIngredient(item.id)} style={styles.checkboxButton}>
                                        <MaterialCommunityIcons
                                            name={item.isSelected ? 'checkbox-marked' : 'checkbox-blank-outline'}
                                            size={28}
                                            color={item.isSelected ? styles.checkboxChecked.color : styles.checkboxUnchecked.color}
                                        />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ))
                    )}
                </ScrollView>
            </View>
            <AddIngredientModal
                isVisible={isAddModalVisible}
                onClose={() => setIsAddModalVisible(false)}
                id_receta={1}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        width: '100%',
        padding: 20,
        backgroundColor: '#D9F7C2',
        borderRadius: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        marginBottom: 20,
    },
    headerBubble: {
        backgroundColor: '#7DBA61',
        borderRadius: 15,
        paddingVertical: 8,
        paddingHorizontal: 25,
        position: 'absolute',
        top: -25,
        zIndex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '80%',
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
        color: '#FFFFFF',
    },
    addIngredientButton: {
        marginLeft: 10,
        padding: 5,
    },
    addIngredientForm: {
        width: '100%',
        marginTop: 35,
        marginBottom: 15,
        paddingHorizontal: 10,
    },
    input: {
        backgroundColor: 'white',
        borderRadius: 8,
        padding: 10,
        marginBottom: 10,
        fontSize: 16,
        color: '#333',
        borderWidth: 1,
        borderColor: '#CFE8D7',
    },
    ingredientListContainer: {
        width: '100%',
        //maxHeight: 200,
        backgroundColor: '#FFFFFF',
        borderRadius: 15,
        paddingHorizontal: 15,
        paddingVertical: 10,
        marginBottom: 5,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.15,
        shadowRadius: 2,
        elevation: 3,
    },
    noIngredientsText: {
        textAlign: 'center',
        paddingVertical: 20,
        color: '#666',
        fontSize: 16,
    },
    ingredientItemRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    ingredientItemText: {
        fontSize: 18,
        color: '#345532',
        flex: 1,
    },
    itemActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    deleteButton: {
        marginRight: 15,
        padding: 5,
    },
    checkboxButton: {
        padding: 5,
    },
    checkboxChecked: {
        color: '#4CAF50',
    },
    checkboxUnchecked: {
        color: '#8BC34A',
    },
});