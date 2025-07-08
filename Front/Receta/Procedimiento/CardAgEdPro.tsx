import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Alert,
    TextInput,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import DraggableFlatList, {
    RenderItemParams,
    ScaleDecorator,
} from 'react-native-draggable-flatlist';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AddInstructionModal } from './AddModalP'

// Define la interfaz para un elemento de instrucción
interface InstructionItem {
    id: string;
    name: string;
    quantity: string;
    isSelected: boolean;
}

interface InstruccionesCardProps {
    id_receta: number | null;
}

export const InstruccionesCard: React.FC<InstruccionesCardProps> = ({
    id_receta,
}) => {
    const [instructions, setInstructions] = useState<InstructionItem[]>([]);
    const [newInstructionText, setNewInstructionText] = useState('');
    const [isAddingNew, setIsAddingNew] = useState(false);
    const [isAddModalVisible, setIsAddModalVisible] = useState(false);

    useEffect(() => {
        if (id_receta !== null) {
            setInstructions([
                { id: 'inst1', name: 'Precalentar el horno a 180°C.', quantity: 'Paso 1', isSelected: false },
                { id: 'inst2', name: 'Picar las manzanas en cubos pequeños.', quantity: 'Paso 2', isSelected: false },
                { id: 'inst3', name: 'Mezclar con azúcar y canela.', quantity: 'Paso 3', isSelected: false },
                { id: 'inst4', name: 'Colocar la mezcla en un molde.', quantity: 'Paso 4', isSelected: false },
                { id: 'inst5', name: 'Hornear por 25 minutos o hasta que doren.', quantity: 'Paso 5', isSelected: false },
                { id: 'inst6', name: 'Dejar enfriar antes de servir.', quantity: 'Paso 6', isSelected: false },
            ]);
        } else {
            setInstructions([
                { id: 'inst1', name: 'Precalentar el horno a 180°C.', quantity: 'Paso 1', isSelected: false },
                { id: 'inst2', name: 'Picar las manzanas en cubos pequeños.', quantity: 'Paso 2', isSelected: false },
                { id: 'inst3', name: 'Mezclar con azúcar y canela.', quantity: 'Paso 3', isSelected: false },
                { id: 'inst4', name: 'Colocar la mezcla en un molde.', quantity: 'Paso 4', isSelected: false },
                { id: 'inst5', name: 'Hornear por 25 minutos o hasta que doren.', quantity: 'Paso 5', isSelected: false },
                { id: 'inst6', name: 'Dejar enfriar antes de servir.', quantity: 'Paso 6', isSelected: false },
            ]);
        }
    }, [id_receta]);

    const toggleSelectInstruction = (id: string) => {
        setInstructions(prevInstructions =>
            prevInstructions.map(item =>
                item.id === id ? { ...item, isSelected: !item.isSelected } : item
            )
        );
    };

    const deleteInstruction = (id: string) => {
        Alert.alert(
            'Eliminar Instrucción',
            '¿Estás seguro de que quieres eliminar esta instrucción?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Eliminar',
                    onPress: () => {
                        setInstructions(prevInstructions => prevInstructions.filter(item => item.id !== id));
                    },
                    style: 'destructive',
                },
            ]
        );
    };

    const addInstruction = () => {
        if (newInstructionText.trim() === '') {
            Alert.alert('Error', 'Por favor, introduce el texto de la instrucción.');
            return;
        }

        const newId = `inst${Date.now()}`;
        setInstructions(prevInstructions => {
            const newOrder = prevInstructions.length + 1; // Podrías recalcular quantity en cada render si quieres que siempre sea el orden actual
            return [
                ...prevInstructions,
                {
                    id: newId,
                    name: newInstructionText.trim(),
                    quantity: `Paso ${newOrder}`,
                    isSelected: false,
                },
            ];
        });

        setNewInstructionText('');
        setIsAddingNew(false);
        Alert.alert('Éxito', 'Instrucción añadida correctamente.');
    };

    const renderItem = ({ item, drag, isActive }: RenderItemParams<InstructionItem>) => {
        return (
            <ScaleDecorator>
                <TouchableOpacity
                    onLongPress={drag}
                    disabled={isActive}
                    style={[
                        styles.instructionItemRow,
                        isActive && styles.activeRow,
                    ]}
                >
                    <Text style={styles.instructionStepText}>{item.quantity}</Text>
                    <Text style={styles.instructionItemText}>{item.name}</Text>
                    <View style={styles.itemActions}>
                        <TouchableOpacity onPress={() => deleteInstruction(item.id)} style={styles.deleteButton}>
                            <MaterialCommunityIcons name="trash-can-outline" size={24} color="#D32F2F" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => toggleSelectInstruction(item.id)} style={styles.checkboxButton}>
                            <MaterialCommunityIcons
                                name={item.isSelected ? 'checkbox-marked' : 'checkbox-blank-outline'}
                                size={28}
                                color={item.isSelected ? styles.checkboxChecked.color : styles.checkboxUnchecked.color}
                            />
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </ScaleDecorator>
        );
    };

    const ITEM_HEIGHT = 24 + 1 + 6;

    return (
        // Asegurarse de que no haya espacios o saltos de línea aquí,
        // directamente dentro de GestureHandlerRootView antes de View.
        <GestureHandlerRootView style={styles.flexOne}>
            <View style={styles.modalContainer}>
                <View style={styles.headerBubble}>
                    <Text style={styles.headerText}>Procedimiento</Text>
                    <TouchableOpacity onPress={() => setIsAddingNew(!isAddingNew)} style={styles.addIngredientButton}>
                        <MaterialCommunityIcons name="plus-circle" size={30} color="#4B7B34" />
                    </TouchableOpacity>
                </View>

                {isAddingNew && (
                    // Asegurarse de que no haya espacios o saltos de línea aquí
                    // entre KeyboardAvoidingView y TextInput/TouchableOpacity
                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                        style={styles.addInstructionForm}
                    >
                        <TextInput
                            style={styles.input}
                            placeholder="Añadir nueva instrucción"
                            placeholderTextColor="#999"
                            value={newInstructionText}
                            onChangeText={setNewInstructionText}
                            multiline
                            numberOfLines={3}
                        />
                        <TouchableOpacity onPress={addInstruction} style={styles.confirmAddButton}>
                            <MaterialCommunityIcons name="check-circle" size={35} color="#4B7B34" />
                        </TouchableOpacity>
                    </KeyboardAvoidingView>
                    // No poner texto aquí
                )}

                <View style={[styles.instructionListContainer, { maxHeight: ITEM_HEIGHT * 10 }]}>
                    {/* Asegurarse de que no haya espacios o saltos de línea aquí
                        entre View y DraggableFlatList/Text */}
                    {instructions.length === 0 ? (
                        <Text style={styles.noInstructionsText}>No hay instrucciones en la lista.</Text>
                    ) : (
                        <DraggableFlatList
                            data={instructions}
                            onDragEnd={({ data }) => setInstructions(data)}
                            keyExtractor={(item) => item.id}
                            renderItem={renderItem}
                            showsVerticalScrollIndicator={true}
                        />
                    )}
                    {/* No poner texto aquí */}
                </View>
                <AddInstructionModal
                                isVisible={isAddModalVisible}
                                onClose={() => setIsAddModalVisible(false)}
                                id_receta={1}
                            />
            </View>
        </GestureHandlerRootView>
        // No poner texto aquí
    );
};

const styles = StyleSheet.create({
    flexOne: {
        flex: 1,
    },
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
        marginTop: 30,
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
    addInstructionForm: {
        width: '100%',
        marginTop: 35,
        marginBottom: 15,
        paddingHorizontal: 10,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 15,
        padding: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 1,
        elevation: 2,
    },
    input: {
        flex: 1,
        backgroundColor: 'transparent',
        borderRadius: 8,
        padding: 10,
        fontSize: 16,
        color: '#333',
        marginRight: 10,
    },
    confirmAddButton: {
        padding: 5,
    },
    instructionListContainer: {
        width: '100%',
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
        marginTop: 15,
    },
    noInstructionsText: {
        textAlign: 'center',
        paddingVertical: 20,
        color: '#666',
        fontSize: 16,
    },
    instructionItemRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
        backgroundColor: '#FFFFFF',
        paddingLeft: 5,
    },
    activeRow: {
        backgroundColor: '#E6FFE6',
        opacity: 0.9,
    },
    instructionStepText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#345532',
        marginRight: 10,
        minWidth: 60,
    },
    instructionItemText: {
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