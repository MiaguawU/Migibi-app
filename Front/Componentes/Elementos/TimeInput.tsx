import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons'; // Asegúrate de que esta importación funcione

interface CustomTimeInputProps {
    label: string;
    initialHours?: number;
    initialMinutes?: number;
    initialSeconds?: number;
    onTimeChange: (hours: number, minutes: number, seconds: number) => void;
}

export const CustomTimeInput: React.FC<CustomTimeInputProps> = ({
    label,
    initialHours = 0,
    initialMinutes = 0,
    initialSeconds = 0,
    onTimeChange,
}) => {
    const [hours, setHours] = useState(initialHours);
    const [minutes, setMinutes] = useState(initialMinutes);
    const [seconds, setSeconds] = useState(initialSeconds);

    // CAMBIO 1: useEffect para sincronizar los estados internos con las props iniciales
    // Esto asegura que cuando initialHours/Minutes/Seconds cambian desde el padre (ej. en reset),
    // los estados internos de este componente se actualicen.
    useEffect(() => {
        setHours(initialHours);
        setMinutes(initialMinutes);
        setSeconds(initialSeconds);
    }, [initialHours, initialMinutes, initialSeconds]); // Dependencias: se ejecuta cuando estas props cambian

    // Función para manejar el incremento/decremento de un valor
    const adjustTimeValue = useCallback((
        currentValue: number,
        setter: React.Dispatch<React.SetStateAction<number>>,
        max: number,
        min: number,
        increment: number
    ) => {
        let newValue = currentValue + increment;
        if (newValue > max) {
            newValue = min; // Vuelve al mínimo si excede el máximo
        } else if (newValue < min) {
            newValue = max; // Vuelve al máximo si va por debajo del mínimo
        }
        setter(newValue);
    }, []);

    // Efecto para llamar a onTimeChange cuando los valores internos cambien
    useEffect(() => {
        onTimeChange(hours, minutes, seconds);
    }, [hours, minutes, seconds, onTimeChange]);

    return (
        <View style={styles.container}>
            <Text style={styles.label}>{label}</Text>
            <View style={styles.timeInputGroup}>

                <View style={styles.timeUnitContainer}>
                    <TouchableOpacity
                        onPress={() => adjustTimeValue(hours, setHours, 23, 0, 1)}
                        style={styles.adjustButton}
                    >
                        <MaterialCommunityIcons name="plus" size={20} color="#345532" />
                    </TouchableOpacity>
                    <TextInput
                        style={styles.timeInput}
                        keyboardType="numeric"
                        maxLength={2}
                        value={String(hours).padStart(2, '0')}
                        onChangeText={(text) => {
                            const num = parseInt(text, 10);
                            if (!isNaN(num) && num >= 0 && num <= 23) {
                                setHours(num);
                            } else if (text === '') {
                                setHours(0); // Permite borrar el número
                            }
                        }}
                    />
                    <TouchableOpacity
                        onPress={() => adjustTimeValue(hours, setHours, 23, 0, -1)}
                        style={styles.adjustButton}
                    >
                        <MaterialCommunityIcons name="minus" size={20} color="#345532" />
                    </TouchableOpacity>
                    <Text style={styles.unitLabel}>H</Text>
                </View>

                <Text style={styles.separator}>:</Text>

                {/* Minutos */}
                <View style={styles.timeUnitContainer}>
                    <TouchableOpacity
                        onPress={() => adjustTimeValue(minutes, setMinutes, 59, 0, 1)}
                        style={styles.adjustButton}
                    >
                        <MaterialCommunityIcons name="plus" size={20} color="#345532" />
                    </TouchableOpacity>
                    <TextInput
                        style={styles.timeInput}
                        keyboardType="numeric"
                        maxLength={2}
                        value={String(minutes).padStart(2, '0')}
                        onChangeText={(text) => {
                            const num = parseInt(text, 10);
                            if (!isNaN(num) && num >= 0 && num <= 59) {
                                setMinutes(num);
                            } else if (text === '') {
                                setMinutes(0);
                            }
                        }}
                    />
                    <TouchableOpacity
                        onPress={() => adjustTimeValue(minutes, setMinutes, 59, 0, -1)}
                        style={styles.adjustButton}
                    >
                        <MaterialCommunityIcons name="minus" size={20} color="#345532" />
                    </TouchableOpacity>
                    <Text style={styles.unitLabel}>M</Text>
                </View>

                <Text style={styles.separator}>:</Text>

                {/* Segundos */}
                <View style={styles.timeUnitContainer}>
                    <TouchableOpacity
                        onPress={() => adjustTimeValue(seconds, setSeconds, 59, 0, 1)}
                        style={styles.adjustButton}
                    >
                        <MaterialCommunityIcons name="plus" size={20} color="#345532" />
                    </TouchableOpacity>
                    <TextInput
                        style={styles.timeInput}
                        keyboardType="numeric"
                        maxLength={2}
                        value={String(seconds).padStart(2, '0')}
                        onChangeText={(text) => {
                            const num = parseInt(text, 10);
                            if (!isNaN(num) && num >= 0 && num <= 59) {
                                setSeconds(num);
                            } else if (text === '') {
                                setSeconds(0);
                            }
                        }}
                    />
                    <TouchableOpacity
                        onPress={() => adjustTimeValue(seconds, setSeconds, 59, 0, -1)}
                        style={styles.adjustButton}
                    >
                        <MaterialCommunityIcons name="minus" size={20} color="#345532" />
                    </TouchableOpacity>
                    <Text style={styles.unitLabel}>S</Text>
                </View>

            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 15,
        width: '100%',
        paddingHorizontal: 10,
    },
    label: {
        fontSize: 16,
        color: '#345532',
        marginBottom: 5,
        fontWeight: 'bold',
    },
    timeInputGroup: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#CFE8D7',
        paddingVertical: 10,
        paddingHorizontal: 5,
    },
    timeUnitContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        marginHorizontal: 5,
    },
    adjustButton: {
        padding: 5,
        borderRadius: 5,
        backgroundColor: '#E6F3EA',
        marginBottom: 5,
    },
    timeInput: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center',
        width: 60,
        paddingVertical: Platform.OS === 'ios' ? 8 : 4,
        borderBottomWidth: 1,
        borderBottomColor: '#CCC',
        marginBottom: 5,
    },
    unitLabel: {
        fontSize: 14,
        color: '#666',
        fontWeight: 'bold',
    },
    separator: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#333',
        marginHorizontal: 5,
        alignSelf: 'center',
    },
});
