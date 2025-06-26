import React, { Component, useRef } from 'react';
import {View,Text,StyleSheet,TouchableOpacity,Image,Modal,TextInput,Animated,PanResponder,ScrollView,} from 'react-native';
import { SCREEN_WIDTH, SCREEN_HEIGHT } from '../recetas';

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

// Props for AddModal and EditModal
interface ModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: () => void;
  recipeName: string;
  setRecipeName: (value: string) => void;
  ingredientInputs: string[];
  setIngredientInputs: (value: string[]) => void;
  procedureInputs: string[];
  setProcedureInputs: (value: string[]) => void;
  portions: string;
  setPortions: (value: string) => void;
  type: string;
  setType: (value: string) => void;
  slideAnim: Animated.Value;
}

const createPanResponder = (
  index: number,
  type: 'ingredient' | 'procedure',
  ingredientInputs: string[],
  setIngredientInputs: (value: string[]) => void,
  procedureInputs: string[],
  setProcedureInputs: (value: string[]) => void,
  ingredientPositions: Animated.Value[],
  procedurePositions: Animated.Value[],
  setDraggingIndex: (value: number | null) => void,
  setDraggingType: (value: 'ingredient' | 'procedure' | null) => void,
  dragOffset: Animated.Value
) => {
  const positions = type === 'ingredient' ? ingredientPositions : procedurePositions;
  const inputs = type === 'ingredient' ? ingredientInputs : procedureInputs;
  const setInputs = type === 'ingredient' ? setIngredientInputs : setProcedureInputs;

  return PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderGrant: () => {
      setDraggingIndex(index);
      setDraggingType(type);
      dragOffset.setValue(0);
    },
    onPanResponderMove: (_, gestureState) => {
      dragOffset.setValue(gestureState.dy);

      const itemHeight = SCREEN_HEIGHT * 0.07;
      const relativePosition = gestureState.dy / itemHeight;
      const newIndex = Math.max(0, Math.min(inputs.length - 1, index + Math.round(relativePosition)));

      if (newIndex !== index) {
        const newInputs = [...inputs];
        const [movedItem] = newInputs.splice(index, 1);
        newInputs.splice(newIndex, 0, movedItem);
        setInputs(newInputs);

        const newPositions = [...positions];
        const [movedPosition] = newPositions.splice(index, 1);
        newPositions.splice(newIndex, 0, movedPosition);
        positions.forEach((pos) => pos.setValue(0));
        setDraggingIndex(newIndex);
      }
    },
    onPanResponderRelease: () => {
      setDraggingIndex(null);
      setDraggingType(null);
      dragOffset.setValue(0);
      positions.forEach((pos) => pos.setValue(0));
    },
  });
};

export const AddModal: React.FC<ModalProps> = ({
  visible,
  onClose,
  onSubmit,
  recipeName,
  setRecipeName,
  ingredientInputs,
  setIngredientInputs,
  procedureInputs,
  setProcedureInputs,
  portions,
  setPortions,
  type,
  setType,
  slideAnim,
}) => {
  const draggingIndex = useRef<number | null>(null);
  const draggingType = useRef<'ingredient' | 'procedure' | null>(null);
  const ingredientPositions = useRef(ingredientInputs.map(() => new Animated.Value(0))).current;
  const procedurePositions = useRef(procedureInputs.map(() => new Animated.Value(0))).current;
  const dragOffset = useRef(new Animated.Value(0)).current;

  const addIngredientInput = () => {
    setIngredientInputs([...ingredientInputs, '']);
    ingredientPositions.push(new Animated.Value(0));
  };

  const updateIngredientInput = (text: string, index: number) => {
    const updatedInputs = [...ingredientInputs];
    updatedInputs[index] = text;
    setIngredientInputs(updatedInputs);
  };

  const removeIngredientInput = (index: number) => {
    if (ingredientInputs.length > 1) {
      setIngredientInputs(ingredientInputs.filter((_, i) => i !== index));
      ingredientPositions.splice(index, 1);
    }
  };

  const addProcedureInput = () => {
    setProcedureInputs([...procedureInputs, '']);
    procedurePositions.push(new Animated.Value(0));
  };

  const updateProcedureInput = (text: string, index: number) => {
    const updatedInputs = [...procedureInputs];
    updatedInputs[index] = text;
    setProcedureInputs(updatedInputs);
  };

  const removeProcedureInput = (index: number) => {
    if (procedureInputs.length > 1) {
      setProcedureInputs(procedureInputs.filter((_, i) => i !== index));
      procedurePositions.splice(index, 1);
    }
  };

  return (
    <ModalErrorBoundary>
      <Modal transparent={true} visible={visible} onRequestClose={onClose}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPressOut={onClose}>
          <View
            style={styles.modalContentWrapper}
            onStartShouldSetResponder={() => true}
            onResponderGrant={() => {}}
          >
            <Animated.View
              style={[styles.modalContainer, { transform: [{ translateY: slideAnim }] }]}
            >
              <View style={styles.modalHandle} />
              <View style={styles.headerRow}>
                <Image
                  source={require('../../img/ImgDefecto.png')}
                  style={styles.headerImage}
                  onError={() => console.error('Error loading ImgDefecto.png')}
                />
                <View style={styles.headerInputContainer}>
                  <TextInput
                    style={styles.nameInput}
                    value={recipeName}
                    onChangeText={setRecipeName}
                    placeholder="Nombre"
                    placeholderTextColor="#888"
                  />
                  <View style={styles.actionIcons}>
                    <TouchableOpacity onPress={onSubmit}>
                      <Image
                        source={require('../../img/Palomita.png')}
                        style={styles.actionIcon}
                        onError={() => console.error('Error loading Palomita.png')}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity>
                      <Image
                        source={require('../../img/Sarten.png')}
                        style={styles.actionIcon}
                        onError={() => console.error('Error loading Sarten.png')}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              <View style={styles.panel}>
                <Text style={styles.panelTitle}>Ingredientes</Text>
                <ScrollView style={styles.panelScroll} nestedScrollEnabled={true}>
                  {ingredientInputs.map((value, index) => (
                    <Animated.View
                      key={index}
                      style={[
                        styles.inputWithIcons,
                        {
                          transform: [
                            {
                              translateY:
                                draggingIndex.current === index && draggingType.current === 'ingredient'
                                  ? dragOffset
                                  : ingredientPositions[index],
                            },
                          ],
                          zIndex:
                            draggingIndex.current === index && draggingType.current === 'ingredient'
                              ? 10
                              : 0,
                          opacity:
                            draggingIndex.current === index && draggingType.current === 'ingredient'
                              ? 0.8
                              : 1,
                          backgroundColor:
                            draggingIndex.current === index && draggingType.current === 'ingredient'
                              ? '#f0f0f0'
                              : 'transparent',
                        },
                      ]}
                    >
                      <View
                        {...createPanResponder(
                          index,
                          'ingredient',
                          ingredientInputs,
                          setIngredientInputs,
                          procedureInputs,
                          setProcedureInputs,
                          ingredientPositions,
                          procedurePositions,
                          (value) => (draggingIndex.current = value),
                          (value) => (draggingType.current = value),
                          dragOffset
                        ).panHandlers}
                        style={styles.dragHandle}
                      >
                        <Image
                          source={require('../../img/Deslizador.png')}
                          style={styles.dragIcon}
                          onError={() => console.error('Error loading Deslizador.png')}
                        />
                      </View>
                      <TextInput
                        style={styles.panelInput}
                        value={value}
                        onChangeText={(text) => updateIngredientInput(text, index)}
                        placeholder={`Ingrediente ${index + 1}`}
                        placeholderTextColor="#888"
                      />
                      <TouchableOpacity onPress={() => removeIngredientInput(index)}>
                        <Image
                          source={require('../../img/Basura.png')}
                          style={styles.trashIcon}
                          onError={() => console.error('Error loading Basura.png')}
                        />
                      </TouchableOpacity>
                    </Animated.View>
                  ))}
                </ScrollView>
                <TouchableOpacity style={styles.panelAddButton} onPress={addIngredientInput}>
                  <Image
                    source={require('../../img/MasIcon.png')}
                    style={styles.panelAddIcon}
                    onError={() => console.error('Error loading MasIcon.png')}
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.panel}>
                <Text style={styles.panelTitle}>Procedimiento</Text>
                <ScrollView style={styles.panelScroll} nestedScrollEnabled={true}>
                  {procedureInputs.map((value, index) => (
                    <Animated.View 
                      key={index}
                      style={[
                        styles.inputWithIcons,
                        {
                          transform: [
                            {
                              translateY:
                                draggingIndex.current === index && draggingType.current === 'procedure'
                                  ? dragOffset
                                  : procedurePositions[index],
                            },
                          ],
                          zIndex:
                            draggingIndex.current === index && draggingType.current === 'procedure'
                              ? 10
                              : 0,
                          opacity:
                            draggingIndex.current === index && draggingType.current === 'procedure'
                              ? 0.8
                              : 1,
                          backgroundColor:
                            draggingIndex.current === index && draggingType.current === 'procedure'
                              ? '#f0f0f0'
                              : 'transparent',
                        },
                      ]}
                    >
                      <View
                        {...createPanResponder(
                          index,
                          'procedure',
                          ingredientInputs,
                          setIngredientInputs,
                          procedureInputs,
                          setProcedureInputs,
                          ingredientPositions,
                          procedurePositions,
                          (value) => (draggingIndex.current = value),
                          (value) => (draggingType.current = value),
                          dragOffset
                        ).panHandlers}
                        style={styles.dragHandle}
                      >
                        <Image
                          source={require('../../img/Deslizador.png')}
                          style={styles.dragIcon}
                          onError={() => console.error('Error loading Deslizador.png')}
                        />
                      </View>
                      <TextInput
                        style={styles.panelInput}
                        value={value}
                        onChangeText={(text) => updateProcedureInput(text, index)}
                        placeholder={`Paso ${index + 1}`}
                        placeholderTextColor="#888"
                      />
                      <TouchableOpacity onPress={() => removeProcedureInput(index)}>
                        <Image
                          source={require('../../img/Basura.png')}
                          style={styles.trashIcon}
                          onError={() => console.error('Error loading Basura.png')}
                        />
                      </TouchableOpacity>
                    </Animated.View>
                  ))}
                </ScrollView>
                <TouchableOpacity style={styles.panelAddButton} onPress={addProcedureInput}>
                  <Image
                    source={require('../../img/MasIcon.png')}
                    style={styles.panelAddIcon}
                    onError={() => console.error('Error loading MasIcon.png')}
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.bottomSection}>
                <Image
                  source={require('../../img/Compartir.png')}
                  style={styles.bottomIcon}
                  onError={() => console.error('Error loading Compartir.png')}
                />
                <TextInput
                  style={styles.bottomInput}
                  value={portions}
                  onChangeText={setPortions}
                  placeholder="Porciones"
                  placeholderTextColor="#888"
                  keyboardType="numeric"
                />
                <TextInput
                  style={styles.bottomInput}
                  value={type}
                  onChangeText={setType}
                  placeholder="Tipo"
                  placeholderTextColor="#888"
                />
              </View>
            </Animated.View>
          </View>
        </TouchableOpacity>
      </Modal>
    </ModalErrorBoundary>
  );
};

export const EditModal: React.FC<ModalProps> = ({visible,onClose,onSubmit,recipeName,setRecipeName,ingredientInputs,setIngredientInputs,procedureInputs,setProcedureInputs,portions,setPortions,type,setType,slideAnim,}) => {
  const draggingIndex = useRef<number | null>(null);
  const draggingType = useRef<'ingredient' | 'procedure' | null>(null);
  const ingredientPositions = useRef(ingredientInputs.map(() => new Animated.Value(0))).current;
  const procedurePositions = useRef(procedureInputs.map(() => new Animated.Value(0))).current;
  const dragOffset = useRef(new Animated.Value(0)).current;

  const addIngredientInput = () => {
    setIngredientInputs([...ingredientInputs, '']);
    ingredientPositions.push(new Animated.Value(0));
  };

  const updateIngredientInput = (text: string, index: number) => {
    const updatedInputs = [...ingredientInputs];
    updatedInputs[index] = text;
    setIngredientInputs(updatedInputs);
  };

  const removeIngredientInput = (index: number) => {
    if (ingredientInputs.length > 1) {
      setIngredientInputs(ingredientInputs.filter((_, i) => i !== index));
      ingredientPositions.splice(index, 1);
    }
  };

  const addProcedureInput = () => {
    setProcedureInputs([...procedureInputs, '']);
    procedurePositions.push(new Animated.Value(0));
  };

  const updateProcedureInput = (text: string, index: number) => {
    const updatedInputs = [...procedureInputs];
    updatedInputs[index] = text;
    setProcedureInputs(updatedInputs);
  };

  const removeProcedureInput = (index: number) => {
    if (procedureInputs.length > 1) {
      setProcedureInputs(procedureInputs.filter((_, i) => i !== index));
      procedurePositions.splice(index, 1);
    }
  };

  return (
    <ModalErrorBoundary>
      <Modal transparent={true} visible={visible} onRequestClose={onClose}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPressOut={onClose}>
          <View
            style={styles.modalContentWrapper}
            onStartShouldSetResponder={() => true}
            onResponderGrant={() => {}}
          >
            <Animated.View
              style={[styles.modalContainer, { transform: [{ translateY: slideAnim }] }]}
            >
              <View style={styles.modalHandle} />
              <View style={styles.headerRow}>
                <Image
                  source={require('../../img/ImgDefecto.png')}
                  style={styles.headerImage}
                  onError={() => console.error('Error loading ImgDefecto.png')}
                />
                <View style={styles.headerInputContainer}>
                  <TextInput
                    style={styles.nameInput}
                    value={recipeName}
                    onChangeText={setRecipeName}
                    placeholder="Nombre"
                    placeholderTextColor="#888"
                  />
                  <View style={styles.actionIcons}>
                    <TouchableOpacity onPress={onSubmit}>
                      <Image
                        source={require('../../img/Palomita.png')}
                        style={styles.actionIcon}
                        onError={() => console.error('Error loading Palomita.png')}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity>
                      <Image
                        source={require('../../img/Sarten.png')}
                        style={styles.actionIcon}
                        onError={() => console.error('Error loading Sarten.png')}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              <View style={styles.panel}>
                <Text style={styles.panelTitle}>Ingredientes</Text>
                <ScrollView style={styles.panelScroll} nestedScrollEnabled={true}>
                  {ingredientInputs.map((value, index) => (
                    <Animated.View
                      key={index}
                      style={[
                        styles.inputWithIcons,
                        {
                          transform: [
                            {
                              translateY:
                                draggingIndex.current === index && draggingType.current === 'ingredient'
                                  ? dragOffset
                                  : ingredientPositions[index],
                            },
                          ],
                          zIndex:
                            draggingIndex.current === index && draggingType.current === 'ingredient'
                              ? 10
                              : 0,
                          opacity:
                            draggingIndex.current === index && draggingType.current === 'ingredient'
                              ? 0.8
                              : 1,
                          backgroundColor:
                            draggingIndex.current === index && draggingType.current === 'ingredient'
                              ? '#f0f0f0'
                              : 'transparent',
                        },
                      ]}
                    >
                      <View
                        {...createPanResponder(
                          index,
                          'ingredient',
                          ingredientInputs,
                          setIngredientInputs,
                          procedureInputs,
                          setProcedureInputs,
                          ingredientPositions,
                          procedurePositions,
                          (value) => (draggingIndex.current = value),
                          (value) => (draggingType.current = value),
                          dragOffset
                        ).panHandlers}
                        style={styles.dragHandle}
                      >
                        <Image
                          source={require('../../img/Deslizador.png')}
                          style={styles.dragIcon}
                          onError={() => console.error('Error loading Deslizador.png')}
                        />
                      </View>
                      <TextInput
                        style={styles.panelInput}
                        value={value}
                        onChangeText={(text) => updateIngredientInput(text, index)}
                        placeholder={`Ingrediente ${index + 1}`}
                        placeholderTextColor="#888"
                      />
                      <TouchableOpacity onPress={() => removeIngredientInput(index)}>
                        <Image
                          source={require('../../img/Basura.png')}
                          style={styles.trashIcon}
                          onError={() => console.error('Error loading Basura.png')}
                        />
                      </TouchableOpacity>
                    </Animated.View>
                  ))}
                </ScrollView>
                <TouchableOpacity style={styles.panelAddButton} onPress={addIngredientInput}>
                  <Image
                    source={require('../../img/MasIcon.png')}
                    style={styles.panelAddIcon}
                    onError={() => console.error('Error loading MasIcon.png')}
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.panel}>
                <Text style={styles.panelTitle}>Procedimiento</Text>
                <ScrollView style={styles.panelScroll} nestedScrollEnabled={true}>
                  {procedureInputs.map((value, index) => (
                    <Animated.View
                      key={index}
                      style={[
                        styles.inputWithIcons,
                        {
                          transform: [
                            {
                              translateY:
                                draggingIndex.current === index && draggingType.current === 'procedure'
                                  ? dragOffset
                                  : procedurePositions[index],
                            },
                          ],
                          zIndex:
                            draggingIndex.current === index && draggingType.current === 'procedure'
                              ? 10
                              : 0,
                          opacity:
                            draggingIndex.current === index && draggingType.current === 'procedure'
                              ? 0.8
                              : 1,
                          backgroundColor:
                            draggingIndex.current === index && draggingType.current === 'procedure'
                              ? '#f0f0f0'
                              : 'transparent',
                        },
                      ]}
                    >
                      <View
                        {...createPanResponder(
                          index,
                          'procedure',
                          ingredientInputs,
                          setIngredientInputs,
                          procedureInputs,
                          setProcedureInputs,
                          ingredientPositions,
                          procedurePositions,
                          (value) => (draggingIndex.current = value),
                          (value) => (draggingType.current = value),
                          dragOffset
                        ).panHandlers}
                        style={styles.dragHandle}
                      >
                        <Image
                          source={require('../../img/Deslizador.png')}
                          style={styles.dragIcon}
                          onError={() => console.error('Error loading Deslizador.png')}
                        />
                      </View>
                      <TextInput
                        style={styles.panelInput}
                        value={value}
                        onChangeText={(text) => updateProcedureInput(text, index)}
                        placeholder={`Paso ${index + 1}`}
                        placeholderTextColor="#888"
                      />
                      <TouchableOpacity onPress={() => removeProcedureInput(index)}>
                        <Image
                          source={require('../../img/Basura.png')}
                          style={styles.trashIcon}
                          onError={() => console.error('Error loading Basura.png')}
                        />
                      </TouchableOpacity>
                    </Animated.View>
                  ))}
                </ScrollView>
                <TouchableOpacity style={styles.panelAddButton} onPress={addProcedureInput}>
                  <Image
                    source={require('../../img/MasIcon.png')}
                    style={styles.panelAddIcon}
                    onError={() => console.error('Error loading MasIcon.png')}
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.bottomSection}>
                <Image
                  source={require('../../img/Compartir.png')}
                  style={styles.bottomIcon}
                  onError={() => console.error('Error loading Compartir.png')}
                />
                <TextInput
                  style={styles.bottomInput}
                  value={portions}
                  onChangeText={setPortions}
                  placeholder="Porciones"
                  placeholderTextColor="#888"
                  keyboardType="numeric"
                />
                <TextInput
                  style={styles.bottomInput}
                  value={type}
                  onChangeText={setType}
                  placeholder="Tipo"
                  placeholderTextColor="#888"
                />
              </View>
            </Animated.View>
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
    justifyContent: 'flex-end',
  },
  modalContentWrapper: {
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: SCREEN_WIDTH * 0.05,
    borderTopRightRadius: SCREEN_WIDTH * 0.05,
    padding: SCREEN_WIDTH * 0.05,
    paddingBottom: SCREEN_HEIGHT * 0.05,
    maxHeight: SCREEN_HEIGHT * 0.9,
    width: SCREEN_WIDTH,
  },
  modalHandle: {
    width: SCREEN_WIDTH * 0.1,
    height: SCREEN_HEIGHT * 0.005,
    backgroundColor: '#ccc',
    borderRadius: SCREEN_WIDTH * 0.01,
    marginBottom: SCREEN_HEIGHT * 0.02,
    alignSelf: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SCREEN_HEIGHT * 0.02,
  },
  headerImage: {
    width: SCREEN_WIDTH * 0.25,
    height: SCREEN_WIDTH * 0.25,
    marginRight: SCREEN_WIDTH * 0.02,
  },
  headerInputContainer: {
    flex: 1,
    flexDirection: 'column',
  },
  nameInput: {
    width: '100%',
    height: SCREEN_HEIGHT * 0.05,
    backgroundColor: '#CAE2B5',
    borderColor: '#8CA966',
    borderWidth: SCREEN_WIDTH * 0.003,
    borderRadius: SCREEN_WIDTH * 0.02,
    paddingHorizontal: SCREEN_WIDTH * 0.03,
    fontSize: SCREEN_WIDTH * 0.04,
    color: '#000',
    marginBottom: SCREEN_HEIGHT * 0.01,
  },
  actionIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  actionIcon: {
    width: SCREEN_WIDTH * 0.08,
    height: SCREEN_WIDTH * 0.08,
    marginHorizontal: SCREEN_WIDTH * 0.01,
  },
  panel: {
    marginBottom: SCREEN_HEIGHT * 0.02,
  },
  panelTitle: {
    fontSize: SCREEN_WIDTH * 0.045,
    fontWeight: 'bold',
    color: '#40632F',
    marginBottom: SCREEN_HEIGHT * 0.01,
  },
  panelScroll: {
    minHeight: SCREEN_HEIGHT * 0.2,
    maxHeight: SCREEN_HEIGHT * 0.2,
    backgroundColor: '#CAE2B5',
    borderColor: '#8CA966',
    borderWidth: SCREEN_WIDTH * 0.003,
    borderRadius: SCREEN_WIDTH * 0.02,
    padding: SCREEN_WIDTH * 0.02,
  },
  panelInput: {
    flex: 1,
    height: SCREEN_HEIGHT * 0.05,
    backgroundColor: '#fff',
    borderRadius: SCREEN_WIDTH * 0.02,
    paddingHorizontal: SCREEN_WIDTH * 0.03,
    fontSize: SCREEN_WIDTH * 0.04,
    color: '#000',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  panelAddButton: {
    alignSelf: 'center',
    marginTop: SCREEN_HEIGHT * 0.01,
  },
  panelAddIcon: {
    width: SCREEN_WIDTH * 0.06,
    height: SCREEN_WIDTH * 0.06,
  },
  bottomSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bottomIcon: {
    width: SCREEN_WIDTH * 0.06,
    height: SCREEN_WIDTH * 0.06,
    marginRight: SCREEN_WIDTH * 0.02,
  },
  bottomInput: {
    flex: 1,
    height: SCREEN_HEIGHT * 0.05,
    backgroundColor: '#CAE2B5',
    borderColor: '#8CA966',
    borderWidth: SCREEN_WIDTH * 0.003,
    borderRadius: SCREEN_WIDTH * 0.02,
    paddingHorizontal: SCREEN_WIDTH * 0.03,
    fontSize: SCREEN_WIDTH * 0.04,
    color: '#000',
    marginHorizontal: SCREEN_WIDTH * 0.01,
  },
  inputWithIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SCREEN_HEIGHT * 0.01,
  },
  dragHandle: {
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SCREEN_WIDTH * 0.02,
  },
  dragIcon: {
    width: SCREEN_WIDTH * 0.06,
    height: SCREEN_WIDTH * 0.06,
  },
  trashIcon: {
    width: SCREEN_WIDTH * 0.06,
    height: SCREEN_WIDTH * 0.06,
    marginLeft: SCREEN_WIDTH * 0.02,
  },
});