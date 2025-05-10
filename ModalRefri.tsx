import React, { Component } from 'react';
import { View, Text, StyleSheet, Pressable, Image, Modal, TextInput } from 'react-native';
import { Dimensions } from 'react-native';

// Obtener las dimensiones de la pantalla
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Error Boundary Component
class ModalErrorBoundary extends Component<{ children: React.ReactNode }, { hasError: boolean }> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error al renderizar el modal</Text>
        </View>
      );
    }
    return this.props.children;
  }
}

// Props for AddModal
interface AddModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: () => void;
  nombre: string;
  setNombre: (value: string) => void;
  cantidad: string;
  setCantidad: (value: string) => void;
  caducidad: string;
  setCaducidad: (value: string) => void;
}

export const AddModal: React.FC<AddModalProps> = ({
  visible,
  onClose,
  onSubmit,
  nombre,
  setNombre,
  cantidad,
  setCantidad,
  caducidad,
  setCaducidad,
}) => {
  return (
    <ModalErrorBoundary>
      <Modal
        animationType="fade"
        transparent={true}
        visible={visible}
        onRequestClose={onClose}
      >
        <Pressable style={styles.modalOverlay} onPress={onClose}>
          <View
            style={styles.modalContainer}
            onStartShouldSetResponder={() => true} // Captura el evento de toque
            onResponderRelease={() => {}} // Evita que el evento se propague
          >
            <View style={styles.titlePanel}>
              <Text style={styles.modalTitle}>Agregar ingrediente</Text>
            </View>
            <View style={styles.inputRow}>
              <Text style={styles.modalLabel}>Nombre:</Text>
              <TextInput
                style={styles.input}
                value={nombre}
                onChangeText={setNombre}
                placeholder="Escribe el nombre..."
                placeholderTextColor="#888"
              />
            </View>
            <View style={styles.inputRow}>
              <Text style={styles.modalLabel}>Cantidad:</Text>
              <TextInput
                style={styles.input}
                value={cantidad}
                onChangeText={setCantidad}
                placeholder="Escribe la cantidad..."
                placeholderTextColor="#888"
                keyboardType="numeric"
              />
            </View>
            <View style={styles.inputRow}>
              <Text style={styles.modalLabel}>Caducidad:</Text>
              <TextInput
                style={styles.input}
                value={caducidad}
                onChangeText={setCaducidad}
                placeholder="Escribe la caducidad..."
                placeholderTextColor="#888"
              />
            </View>
            <Pressable style={styles.submitButton} onPress={onSubmit}>
              <Image
                source={require('./img/Palomita.png')}
                style={styles.submitIcon}
                onError={() => console.error('Error loading Palomita.png')}
              />
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </ModalErrorBoundary>
  );
};

// Props for EditModal
interface EditModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: () => void;
  nombre: string;
  setNombre: (value: string) => void;
  cantidad: string;
  setCantidad: (value: string) => void;
  caducidad: string;
  setCaducidad: (value: string) => void;
}

export const EditModal: React.FC<EditModalProps> = ({
  visible,
  onClose,
  onSubmit,
  nombre,
  setNombre,
  cantidad,
  setCantidad,
  caducidad,
  setCaducidad,
}) => {
  return (
    <ModalErrorBoundary>
      <Modal
        animationType="fade"
        transparent={true}
        visible={visible}
        onRequestClose={onClose}
      >
        <Pressable style={styles.modalOverlay} onPress={onClose}>
          <View
            style={styles.modalContainer}
            onStartShouldSetResponder={() => true} // Captura el evento de toque
            onResponderRelease={() => {}} // Evita que el evento se propague
          >
            <View style={styles.titlePanel}>
              <Text style={styles.modalTitle}>Editar ingrediente</Text>
            </View>
            <View style={styles.inputRow}>
              <Text style={styles.modalLabel}>Nombre:</Text>
              <TextInput
                style={styles.input}
                value={nombre}
                onChangeText={setNombre}
                placeholder="Escribe el nombre..."
                placeholderTextColor="#888"
              />
            </View>
            <View style={styles.inputRow}>
              <Text style={styles.modalLabel}>Cantidad:</Text>
              <TextInput
                style={styles.input}
                value={cantidad}
                onChangeText={setCantidad}
                placeholder="Escribe la cantidad..."
                placeholderTextColor="#888"
                keyboardType="numeric"
              />
            </View>
            <View style={styles.inputRow}>
              <Text style={styles.modalLabel}>Caducidad:</Text>
              <TextInput
                style={styles.input}
                value={caducidad}
                onChangeText={setCaducidad}
                placeholder="Escribe la caducidad..."
                placeholderTextColor="#888"
              />
            </View>
            <Pressable style={styles.submitButton} onPress={onSubmit}>
              <Image
                source={require('./img/Palomita.png')}
                style={styles.submitIcon}
                onError={() => console.error('Error loading Palomita.png')}
              />
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </ModalErrorBoundary>
  );
};

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: SCREEN_WIDTH * 0.8,
    backgroundColor: '#fff',
    borderRadius: SCREEN_WIDTH * 0.05,
    padding: SCREEN_WIDTH * 0.05,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  titlePanel: {
    backgroundColor: '#8CA966',
    borderColor: '#8CA966',
    borderWidth: SCREEN_WIDTH * 0.003,
    width: '100%',
    paddingVertical: SCREEN_HEIGHT * 0.015,
    borderRadius: SCREEN_WIDTH * 0.02,
    marginBottom: SCREEN_HEIGHT * 0.02,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: SCREEN_WIDTH * 0.05,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: SCREEN_HEIGHT * 0.02,
  },
  modalLabel: {
    fontSize: SCREEN_WIDTH * 0.045,
    color: '#40632F',
    width: SCREEN_WIDTH * 0.25,
  },
  input: {
    flex: 1,
    height: SCREEN_HEIGHT * 0.05,
    backgroundColor: '#CAE2B5',
    borderColor: '#8CA966',
    borderWidth: SCREEN_WIDTH * 0.003,
    borderRadius: SCREEN_WIDTH * 0.02,
    paddingHorizontal: SCREEN_WIDTH * 0.03,
    fontSize: SCREEN_WIDTH * 0.04,
    color: '#000',
  },
  submitButton: {
    alignSelf: 'flex-end',
    marginTop: SCREEN_HEIGHT * 0.02,
  },
  submitIcon: {
    width: SCREEN_WIDTH * 0.07,
    height: SCREEN_WIDTH * 0.07,
  },
});