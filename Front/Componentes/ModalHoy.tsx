import React, { Component } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Modal,
  TextInput,
  Dimensions,
} from 'react-native';

// Obtener las dimensiones de la pantalla para hacer el diseño responsivo
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Error Boundary Component
class ModalErrorBoundary extends Component<{ children: React.ReactNode }, { hasError: boolean; error?: string }> {
  state = { hasError: false, error: undefined };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error: error.message };
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error: {this.state.error || 'Verifica la consola'}</Text>
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
  comida: string;
  setComida: (value: string) => void;
  editar: string;
  setEditar: (value: string) => void;
  porciones: string;
  setPorciones: (value: string) => void;
}

// Add Modal Component
export const AddModal: React.FC<AddModalProps> = ({
  visible,
  onClose,
  onSubmit,
  comida,
  setComida,
  editar,
  setEditar,
  porciones,
  setPorciones,
}) => {
  // Log props for debugging
  React.useEffect(() => {
    if (visible) {
      console.log('AddModal props:', { visible, comida, editar, porciones });
    }
  }, [visible, comida, editar, porciones]);

  return (
    <ModalErrorBoundary>
      <Modal
        animationType="fade"
        transparent={true}
        visible={visible}
        onRequestClose={onClose}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={onClose}
        >
          {/* Stop propagation to prevent closing when clicking inside */}
          <View
            style={styles.modalContainer}
            onStartShouldSetResponder={() => true}
            onResponderGrant={() => {}}
          >
            <View style={styles.titlePanel}>
              <Text style={styles.modalTitle}>Agregar comida</Text>
            </View>
            <View style={styles.inputRow}>
              <Text style={styles.inputLabel}>Comida:</Text>
              <TextInput
                style={styles.modalInput}
                value={comida}
                onChangeText={setComida}
                placeholder="Comida"
                placeholderTextColor="#888"
              />
            </View>
            <View style={styles.inputRow}>
              <Text style={styles.inputLabel}>Nombre:</Text>
              <TextInput
                style={styles.modalInput}
                value={editar}
                onChangeText={setEditar}
                placeholder="Editar..."
                placeholderTextColor="#888"
              />
            </View>
            <View style={styles.inputRow}>
              <Text style={styles.inputLabel}>Porciones:</Text>
              <TextInput
                style={styles.modalInput}
                value={porciones}
                onChangeText={setPorciones}
                placeholder="Porciones: "
                placeholderTextColor="#888"
              />
            </View>
            <TouchableOpacity style={styles.submitButton} onPress={onSubmit}>
              <Image
                source={require('../../img/Palomita.png')}
                style={styles.submitIcon}
                resizeMode="contain"
                onError={() => console.error('Error loading Palomita.png')}
              />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </ModalErrorBoundary>
  );
};

// Props for EditModal
interface EditModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: () => void;
  comida: string;
  setComida: (value: string) => void;
  editar: string;
  setEditar: (value: string) => void;
  porciones: string;
  setPorciones: (value: string) => void;
}

// Edit Modal Component
export const EditModal: React.FC<EditModalProps> = ({
  visible,
  onClose,
  onSubmit,
  comida,
  setComida,
  editar,
  setEditar,
  porciones,
  setPorciones,
}) => {
  // Log props for debugging
  React.useEffect(() => {
    if (visible) {
      console.log('EditModal props:', { visible, comida, editar, porciones });
    }
  }, [visible, comida, editar, porciones]);

  return (
    <ModalErrorBoundary>
      <Modal
        animationType="fade"
        transparent={true}
        visible={visible}
        onRequestClose={onClose}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={onClose}
        >
          {/* Stop propagation to prevent closing when clicking inside */}
          <View
            style={styles.modalContainer}
            onStartShouldSetResponder={() => true}
            onResponderGrant={() => {}}
          >
            <View style={styles.titlePanel}>
              <Text style={styles.modalTitle}>Editar comida</Text>
            </View>
            <View style={styles.inputRow}>
              <Text style={styles.inputLabel}>Comida:</Text>
              <TextInput
                style={styles.modalInput}
                value={comida}
                onChangeText={setComida}
                placeholder="Comida"
                placeholderTextColor="#888"
              />
            </View>
            <View style={styles.inputRow}>
              <Text style={styles.inputLabel}>Editar:</Text>
              <TextInput
                style={styles.modalInput}
                value={editar}
                onChangeText={setEditar}
                placeholder="Editar..."
                placeholderTextColor="#888"
              />
            </View>
            <View style={styles.inputRow}>
              <Text style={styles.inputLabel}>Porciones:</Text>
              <TextInput
                style={styles.modalInput}
                value={porciones}
                onChangeText={setPorciones}
                placeholder="Porciones: "
                placeholderTextColor="#888"
              />
            </View>
            <TouchableOpacity style={styles.submitButton} onPress={onSubmit}>
              <Image
                source={require('../../img/Palomita.png')}
                style={styles.submitIcon}
                resizeMode="contain"
                onError={() => console.error('Error loading Palomita.png')}
              />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
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
  inputLabel: {
    fontSize: SCREEN_WIDTH * 0.04,
    color: '#000',
    width: SCREEN_WIDTH * 0.25,
  },
  modalInput: {
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