import React, { Component } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  Modal,
  Animated,
  TextInput,
  Dimensions,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';

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

// Props for BasicModal
interface BasicModalProps {
  visible: boolean;
  onClose: () => void;
  onOptionSelect: () => void;
}

// Basic Modal Component
export const BasicModal: React.FC<BasicModalProps> = ({ visible, onClose, onOptionSelect }) => {
  return (
    <ModalErrorBoundary>
      <Modal
        animationType="fade"
        transparent={true}
        visible={visible}
        onRequestClose={onClose}
      >
        <View style={styles.basicModalOverlay}>
          <View style={styles.basicModalContainer}>
            <Pressable onPress={onClose} style={styles.basicModalBackButton}>
              <Image
                source={require('../../img/fIzq.png')}
                style={styles.basicModalBackIcon}
                resizeMode="contain"
                onError={() => console.error('Error loading fIzq.png')}
              />
            </Pressable>
            <View style={styles.basicModalSeparator} />
            <Text style={styles.basicModalText}>
              ¿Quiere que solo aparezcan ingredientes que ya tiene en casa?
            </Text>
            <View style={styles.basicModalButtonContainer}>
              <Pressable
                style={[styles.basicModalButton, styles.basicModalButtonNo]}
                onPress={onOptionSelect}
              >
                <Text style={styles.basicModalButtonText}>No</Text>
              </Pressable>
              <Pressable
                style={[styles.basicModalButton, styles.basicModalButtonYes]}
                onPress={onOptionSelect}
              >
                <Text style={styles.basicModalButtonText}>Sí</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </ModalErrorBoundary>
  );
};

// Props for AnimatedModal
interface AnimatedModalProps {
  visible: boolean;
  onClose: () => void;
  fecha: string;
  setFecha: (value: string) => void;
  tipo: string;
  setTipo: (value: string) => void;
  porciones: string;
  setPorciones: (value: string) => void;
  slideAnim: Animated.Value;
}

// Animated Modal Component
export const AnimatedModal: React.FC<AnimatedModalProps> = ({
  visible,
  onClose,
  fecha,
  setFecha,
  tipo,
  setTipo,
  porciones,
  setPorciones,
  slideAnim,
}) => {
  // Log props for debugging
  React.useEffect(() => {
    if (visible) {
      console.log('AnimatedModal props:', { visible, fecha, tipo, porciones });
      console.log('slideAnim value:', slideAnim);
    }
  }, [visible, fecha, tipo, porciones, slideAnim]);

  // Explicitly type the style prop
  const animatedStyle: StyleProp<ViewStyle> = [
    styles.modalContainer,
    {
      transform: [{ translateY: slideAnim }],
    },
  ];

  return (
    <ModalErrorBoundary>
      <Modal
        animationType="none"
        transparent={true}
        visible={visible}
        onRequestClose={onClose}
      >
        <View style={styles.modalOverlay}>
          <Animated.View style={animatedStyle}>
            <View style={styles.modalTop}>
              <Pressable onPress={onClose} style={styles.modalBackButton}>
                <Image
                  source={require('../../img/fIzq.png')}
                  style={styles.modalBackIcon}
                  resizeMode="contain"
                  onError={() => console.error('Error loading fIzq.png')}
                />
              </Pressable>
            </View>
            <View style={styles.modalSeparator} />
            <View style={styles.modalHeader}>
              <Text style={styles.modalHeaderText}>Agregar plan</Text>
            </View>
            <View style={styles.modalContent}>
              {/* Fecha Row */}
              <View style={styles.modalRow}>
                <Text style={styles.modalLabel}>Fecha</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="Ingresa la fecha"
                  placeholderTextColor="#888"
                  value={fecha}
                  onChangeText={setFecha}
                />
                <Image
                  source={require('../../img/CalenIcon.png')}
                  style={styles.modalIcon}
                  resizeMode="contain"
                  onError={() => console.error('Error loading CalenIcon.png')}
                />
              </View>
              {/* Tipo Row */}
              <View style={styles.modalRow}>
                <Text style={styles.modalLabel}>Tipo</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={tipo}
                    onValueChange={(itemValue) => setTipo(itemValue)}
                    style={styles.picker}
                  >
                    <Picker.Item label="Selecciona una opcion..." value="" />
                    <Picker.Item label="Opción 1" value="opcion 1" />
                    <Picker.Item label="Opción 2" value="opcion 2" />
                  </Picker>
                </View>
              </View>
              {/* Porciones Row */}
              <View style={styles.modalRow}>
                <Text style={styles.modalLabel}>Porciones</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="Ingresa porciones"
                  placeholderTextColor="#888"
                  keyboardType="numeric"
                  value={porciones}
                  onChangeText={setPorciones}
                />
              </View>
            </View>
            <Pressable style={styles.modalButton} onPress={onClose}>
              <Image
                source={require('../../img/Palomita.png')}
                style={styles.modalButtonIcon}
                resizeMode="contain"
                onError={() => console.error('Error loading Palomita.png')}
              />
            </Pressable>
          </Animated.View>
        </View>
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
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: SCREEN_WIDTH * 0.05,
    borderTopRightRadius: SCREEN_WIDTH * 0.05,
    padding: SCREEN_WIDTH * 0.05,
    height: SCREEN_HEIGHT * 0.5,
  },
  modalTop: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SCREEN_HEIGHT * 0.01,
  },
  modalBackButton: {
    padding: SCREEN_WIDTH * 0.02,
  },
  modalBackIcon: {
    width: SCREEN_WIDTH * 0.06,
    height: SCREEN_WIDTH * 0.06,
  },
  modalSeparator: {
    height: 1,
    backgroundColor: '#8CA966',
    marginBottom: SCREEN_HEIGHT * 0.02,
  },
  modalHeader: {
    backgroundColor: '#8CA966',
    paddingVertical: SCREEN_HEIGHT * 0.02,
    borderRadius: SCREEN_WIDTH * 0.03,
    alignItems: 'center',
    marginBottom: SCREEN_HEIGHT * 0.02,
  },
  modalHeaderText: {
    fontSize: SCREEN_WIDTH * 0.06,
    color: '#FFF',
    fontWeight: 'bold',
  },
  modalContent: {
    flex: 1,
  },
  modalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SCREEN_HEIGHT * 0.02,
  },
  modalLabel: {
    fontSize: SCREEN_WIDTH * 0.045,
    color: '#40632F',
    width: SCREEN_WIDTH * 0.2,
  },
  modalInput: {
    flex: 1,
    height: SCREEN_HEIGHT * 0.05,
    backgroundColor: 'white',
    borderColor: '#8CA966',
    borderWidth: 2,
    borderRadius: SCREEN_WIDTH * 0.03,
    paddingHorizontal: SCREEN_WIDTH * 0.03,
    fontSize: SCREEN_WIDTH * 0.04,
    marginRight: SCREEN_WIDTH * 0.02,
  },
  modalIcon: {
    width: SCREEN_WIDTH * 0.08,
    height: SCREEN_WIDTH * 0.08,
  },
  pickerContainer: {
    flex: 1,
    height: SCREEN_HEIGHT * 0.05,
    backgroundColor: 'white',
    borderColor: '#8CA966',
    borderWidth: 2,
    borderRadius: SCREEN_WIDTH * 0.03,
    justifyContent: 'center',
  },
  picker: {
    height: SCREEN_HEIGHT * 0.05,
    color: '#40632F',
  },
  modalButton: {
    alignSelf: 'flex-end',
    marginTop: SCREEN_HEIGHT * 0.02,
  },
  modalButtonIcon: {
    width: SCREEN_WIDTH * 0.08,
    height: SCREEN_WIDTH * 0.08,
  },
  basicModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  basicModalContainer: {
    backgroundColor: '#FFF',
    borderRadius: SCREEN_WIDTH * 0.05,
    padding: SCREEN_WIDTH * 0.05,
    width: SCREEN_WIDTH * 0.8,
    alignItems: 'center',
  },
  basicModalBackButton: {
    alignSelf: 'flex-start',
    padding: SCREEN_WIDTH * 0.02,
  },
  basicModalBackIcon: {
    width: SCREEN_WIDTH * 0.06,
    height: SCREEN_WIDTH * 0.06,
  },
  basicModalSeparator: {
    height: 1,
    backgroundColor: '#8CA966',
    width: '100%',
    marginVertical: SCREEN_HEIGHT * 0.02,
  },
  basicModalText: {
    fontSize: SCREEN_WIDTH * 0.045,
    color: '#40632F',
    textAlign: 'center',
    marginBottom: SCREEN_HEIGHT * 0.03,
  },
  basicModalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  basicModalButton: {
    flex: 1,
    paddingVertical: SCREEN_HEIGHT * 0.015,
    borderRadius: SCREEN_WIDTH * 0.03,
    alignItems: 'center',
    marginHorizontal: SCREEN_WIDTH * 0.02,
  },
  basicModalButtonNo: {
    backgroundColor: '#D9534F',
  },
  basicModalButtonYes: {
    backgroundColor: '#8CA966',
  },
  basicModalButtonText: {
    fontSize: SCREEN_WIDTH * 0.04,
    color: '#FFF',
    fontWeight: 'bold',
  },
});