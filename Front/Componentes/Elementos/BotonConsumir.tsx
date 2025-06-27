// components/MinusButton.tsx
import React from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle, TextStyle, Text, Pressable } from 'react-native'; // Importa Text para el label
import { MaterialCommunityIcons } from '@expo/vector-icons'; // Asegúrate de tener @expo/vector-icons instalado

interface MinusButtonProps {
    onPress: () => void;
    size?: number;
    color?: string;
    style?: ViewStyle;
    iconStyle?: TextStyle;
    label?: string; // Opcional: si quieres un texto junto al icono
}

const MinusButton: React.FC<MinusButtonProps> = ({
    onPress,
    size = 20, // Tamaño por defecto del icono, más pequeño como pediste
    color = '#DC3545', // Color rojo para acción de eliminar
    style,
    iconStyle,
    label,
}) => {
    return (
        <Pressable style={[styles.button, style]} onPress={onPress}>
            {/* El icono 'minus-box' es similar a MinusSquareOutlined */}
            <MaterialCommunityIcons name="minus-box" size={size} color={color} style={iconStyle} />
            {label && <Text style={[styles.label, { color }]}>{label}</Text>}
        </Pressable>
    );
};

const styles = StyleSheet.create({
    button: {
        flexDirection: 'row', // Permite que el icono y el texto estén en línea
        alignItems: 'center',
        justifyContent: 'center',
        padding: 2, // Espaciado interno más pequeño
        borderRadius: 5,
    },
    label: {
        marginLeft: 4, // Espacio entre icono y texto
        fontSize: 12,
        fontWeight: 'bold',
    },
});

export default MinusButton;
