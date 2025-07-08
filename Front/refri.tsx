import React, { useState, useLayoutEffect, useEffect, Component, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    Pressable,
    ScrollView,
    Dimensions,
    TextInput,
    Animated,
    Alert,
} from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import * as ImagePicker from 'expo-image-picker';
import { CameraView } from 'expo-camera';
import { useCameraPermissions } from 'expo-camera';
import axios from 'axios';
import PUERTO from '../config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AddModal } from './Componentes/ModalRefri';
import { EditModal } from './Componentes/ModalEditarAlim';
import { ConsumoModal } from './Componentes/ModalConsumo';
import * as ImageManipulator from 'expo-image-manipulator';
import MinusButton from './Componentes/Elementos/BotonConsumir';
import { MaterialIcons } from '@expo/vector-icons'; // Import MaterialIcons for edit and delete icons

// Define the type for the navigation screens
type RootStackParamList = {
    Hoy: undefined;
    Plan: undefined;
    Recetas: undefined;
    Refri: undefined;
    Perfil: undefined;
};

// Define the data structure for food cards
interface CardData {
    id: number;
    ingrediente: string;
    cantidad: number;
    abreviatura: string;
    image: string;
    fecha: string;
    diasRestantes: string | number;
    caducidadPasada: boolean | null;
    Tipo: string;
    Activo: number;
    Id_Usuario_Alta: number;
}

// Type for ingredients (used for local state and modals)
type Ingrediente = {
    id: number;
    nombre: string;
    cantidad: string;
    caducidad: string;
};

// Interfaces for the backend's image recognition response
interface RecognizedFoodItem {
    name: string;
    quantity: number;
}

interface FoodRecognitionResponse {
    mensaje: string;
    recognizedFoodsDetailed: RecognizedFoodItem[];
}

interface AddModalProps {
    visible: boolean;
    onClose: () => void;
    // REVERTED: onSubmit receives original data structure
    onSubmit: (data: {
        nombre: string;
        cantidad: string;
        caducidad: string | null;
        unidadId: number | null;
        tipoId: number | null;
        imagenUri: string | null;
        codigoEscaneado?: string;
    }) => void;
    initialNombre?: string;
    initialCantidad?: string;
    initialCaducidad?: string;
    initialUnidadId?: number;
    initialTipoId?: number;
    initialImagenUri?: string;
    initialCodigoEscaneado?: string;
}

// Get screen dimensions
export const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Error Boundary Component to catch rendering errors
class ErrorBoundary extends Component<{ children: React.ReactNode }, { hasError: boolean }> {
    state = { hasError: false };

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    render() {
        if (this.state.hasError) {
            return (
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>Error al renderizar la pantalla. Verifica la consola.</Text>
                </View>
            );
        }
        return this.props.children;
    }
}

const Refri = () => {
    const [cameraPermission, requestPermission] = useCameraPermissions();
    const [scanned, setScanned] = useState(false);
    const [showCamera, setShowCamera] = useState(false);
    const [showScanner, setShowScanner] = useState(false);
    const [processingScan, setProcessingScan] = useState(false);

    const [alimentosPerecederos, setAlimentosPerecederos] = useState<CardData[]>([]);
    const [alimentosNoPerecederos, setAlimentosNoPerecederos] = useState<CardData[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [ingredientes, setIngredientes] = useState<Ingrediente[]>([]);
    const [edAlimento, setEdAlimento] = useState<number | null>(null);
    const [consAlimento, setConsAlimento] = useState<number | null>(null);

    const [isAddModalVisible, setIsAddModalVisible] = useState(false);
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [editIndex, setEditIndex] = useState<number | null>(null);
    const [nombre, setNombre] = useState('');
    const [cantidad, setCantidad] = useState('');
    const [caducidad, setCaducidad] = useState('');
    const [codigoEscaneadoParaModal, setCodigoEscaneadoParaModal] = useState<string>('');

    const [serverMessage, setServerMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const [scannedCode, setScannedCode] = useState<string>('');
    const [foodQueue, setFoodQueue] = useState<string[]>([]);
    const [currentFoodName, setCurrentFoodName] = useState<string>('');

    const cameraRef = useRef<CameraView>(null);

    const navigation = useNavigation<NavigationProp<RootStackParamList>>();

    const navigateToScreen = (screenName: keyof RootStackParamList) => {
        navigation.navigate(screenName);
    };

    useEffect(() => {
        if (serverMessage !== '') {
            const timer = setTimeout(() => setServerMessage(''), 5000);
            return () => clearTimeout(timer);
        }
    }, [serverMessage]);

    useEffect(() => {
        (async () => {
            const { status: mediaLibraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (mediaLibraryStatus !== 'granted') {
                console.warn('Permiso de galería no concedido. Algunas funcionalidades podrían no estar disponibles.');
            }
        })();
    }, []);

    useEffect(() => {
        if (foodQueue.length > 0 && !isAddModalVisible && currentFoodName) {
            setIsAddModalVisible(true);
        }
    }, [foodQueue, isAddModalVisible, currentFoodName]);

    const handleCloseAddModal = () => {
        setIsAddModalVisible(false);
        setProcessingScan(false);
        setScanned(false);
        setFoodQueue([]);
        setCurrentFoodName('');
        setScannedCode('');
        setCodigoEscaneadoParaModal('');
        setErrorMessage(null);
    };

    const handleBarCodeScanned = async ({ type, data }: { type: string; data: string }) => {
        if (processingScan) {
            console.log("Already processing a scan, ignoring new barcode.");
            return;
        }

        setScanned(true);
        setShowScanner(false);
        setProcessingScan(true);

        setCodigoEscaneadoParaModal(data);
        setIsLoading(true);
        setErrorMessage(null);

        try {
            const response = await axios.post(`${PUERTO}/alimento/scanner`, { codigo: data });

            if (response.status === 200 && response.data.nombreCompleto) {
                setServerMessage("Código escaneado correctamente. Datos recibidos del servidor.");
                setCurrentFoodName(response.data.nombreCompleto);
                setFoodQueue([response.data.nombreCompleto]);
            } else {
                setProcessingScan(false);
                setScanned(false);
                setServerMessage("No se encontraron resultados para este código de barras.");
                Alert.alert("Código no reconocido", "No se encontró un alimento para este código de barras. Intenta añadirlo manualmente.");
            }
        } catch (error: any) {
            setProcessingScan(false);
            setScanned(false);
            console.error("Error al enviar código escaneado:", error.response ? error.response.data : error.message);
            setServerMessage("No se pudo conectar con el servidor al escanear.");
            Alert.alert("Error de Conexión", "No se pudo conectar con el servidor para escanear el código. Intenta añadirlo manualmente.");
        } finally {
            setIsLoading(false);
        }
    };

    const takePhotoAndRecognize = async () => {
        if (cameraRef.current) {
            setIsLoading(true);
            setErrorMessage(null);
            setFoodQueue([]);
            setNombre(''); setCantidad(''); setCaducidad('');
            setScannedCode('');

            try {
                const photo = await cameraRef.current.takePictureAsync({
                    base64: true,
                    quality: 1,
                    exif: false,
                });

                setShowCamera(false);

                if (photo && photo.base64) {
                    const manipResult = await ImageManipulator.manipulateAsync(
                        photo.uri,
                        [{ resize: { width: 800 } }],
                        { compress: 0.7, format: ImageManipulator.SaveFormat.WEBP, base64: true }
                    );

                    if (manipResult.base64) {
                        const response = await axios.post<FoodRecognitionResponse>(`${PUERTO}/alimento/recognize-food-image`, {
                            image_b64: manipResult.base64,
                        });

                        if (response.data && response.data.recognizedFoodsDetailed && response.data.recognizedFoodsDetailed.length > 0) {
                            setServerMessage("Alimentos detectados exitosamente.");
                            const foodNames = response.data.recognizedFoodsDetailed.map(item => item.name);
                            setFoodQueue(foodNames);
                        } else {
                            setServerMessage("No se detectaron alimentos en la imagen.");
                            setFoodQueue(['']);
                        }
                    } else {
                        setErrorMessage("No se pudo obtener la imagen manipulada en formato Base64.");
                        setFoodQueue(['']);
                    }
                } else {
                    setErrorMessage("No se pudo obtener la imagen en formato Base64.");
                    setFoodQueue(['']);
                }
            } catch (error: any) {
                console.error('Error al tomar foto o enviar al servidor:', error.response ? error.response.data : error.message);
                let msg = 'Error al reconocer la imagen de alimentos.';
                if (axios.isAxiosError(error) && error.response) {
                    msg = error.response.data.mensaje || msg;
                }
                setErrorMessage(msg);
                setFoodQueue(['']);
            } finally {
                setIsLoading(false);
            }
        }
    };

    const resetAddModalState = () => {
        setCodigoEscaneadoParaModal('');
        setCurrentFoodName('');
        setFoodQueue([]);
        setProcessingScan(false);
        setScanned(false);
    };

    const eliminarAlimento = async (id: number | string) => {
        Alert.alert(
            "Confirmar eliminación",
            "¿Estás seguro de que quieres eliminar este alimento?",
            [
                {
                    text: "Cancelar",
                    style: "cancel"
                },
                {
                    text: "Eliminar",
                    onPress: async () => {
                        try {
                            const response = await axios.put(`${PUERTO}/alimentoInactivo/${id}`, { id });

                            if (response.status === 200) {
                                setServerMessage("Alimento eliminado exitosamente.");
                                datosAlimento();
                            } else {
                                setServerMessage("No se pudo eliminar el alimento.");
                            }
                        } catch (error) {
                            console.error("Error al eliminar alimento:", error);
                            setServerMessage("Ocurrió un error al intentar eliminar el alimento.");
                        }
                    },
                    style: "destructive"
                }
            ]
        );
    };

    const datosAlimento = async () => {
        try {
            const currentUserString = await AsyncStorage.getItem('currentUser');
            if (!currentUserString) {
                setServerMessage('No hay un usuario logueado actualmente.');
                return;
            }
            const currentUser = JSON.parse(currentUserString);
            const userId = currentUser.id;

            if (isNaN(userId)) {
                setServerMessage("ID de usuario inválido.");
                return;
            }

            const response = await axios.get(`${PUERTO}/alimento/${userId}`);
            const { Perecedero, NoPerecedero } = response.data as { Perecedero: any[], NoPerecedero: any[] };

            if (Array.isArray(Perecedero) && Array.isArray(NoPerecedero)) {
                const perecederos: CardData[] = Perecedero.filter(
                    (alimento: any) => alimento.Id_Usuario_Alta === userId && alimento.Activo > 0 && alimento.Cantidad > 0
                ).map((alimento: any) => {
                    const fechaCaducidad = alimento.Fecha_Caducidad ? new Date(alimento.Fecha_Caducidad) : null;
                    const caducidadPasada = fechaCaducidad ? fechaCaducidad < new Date() : null;
                    const diasRestantes = fechaCaducidad
                        ? Math.max(
                            0,
                            Math.ceil(
                                (fechaCaducidad.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
                            )
                        )
                        : 'No definida';
                    const fecha = fechaCaducidad ? fechaCaducidad.toLocaleDateString() : 'Fecha no disponible';

                    return {
                        id: alimento.id || 0,
                        ingrediente: alimento.Nombre || ' ',
                        cantidad: alimento.Cantidad || 1,
                        abreviatura: alimento.Unidad || ' ',
                        image: alimento.Imagen ? `${PUERTO}${alimento.Imagen}` : 'https://via.placeholder.com/150/8CA966/FFFFFF?text=Sin+Imagen',
                        fecha: caducidadPasada ? fecha : `${diasRestantes} días`,
                        diasRestantes,
                        caducidadPasada,
                        Tipo: alimento.Tipo_Alimento,
                        Activo: alimento.Activo,
                        Id_Usuario_Alta: alimento.Id_Usuario_Alta,
                    };
                });

                const noPerecederos: CardData[] = NoPerecedero.filter(
                    (alimento: any) => alimento.Id_Usuario_Alta === userId && alimento.Activo > 0 && alimento.Cantidad > 0
                ).map((alimento: any) => ({
                    id: alimento.id || 0,
                    ingrediente: alimento.Nombre || ' ',
                    cantidad: alimento.Cantidad || 0,
                    abreviatura: alimento.Unidad || ' ',
                    image: alimento.Imagen ? `${PUERTO}${alimento.Imagen}` : 'https://via.placeholder.com/150/8CA966/FFFFFF?text=Sin+Imagen',
                    fecha: '🎉 Indefinido',
                    diasRestantes: 'No aplica',
                    caducidadPasada: false,
                    Tipo: alimento.Tipo_Alimento,
                    Activo: alimento.Activo,
                    Id_Usuario_Alta: alimento.Id_Usuario_Alta,
                }));

                setAlimentosPerecederos(perecederos);
                setAlimentosNoPerecederos(noPerecederos);
                console.log("Alimentos obtenidos exitosamente");
            } else {
                throw new Error("Formato de datos inválido");
            }
        } catch (error) {
            console.error("Error al obtener alimentos", error);
            setServerMessage("No se pudo conectar con el servidor.");
        }
    };

    const handleSearch = (value: string) => {
        setSearchTerm(value.toLowerCase());
    };

    useEffect(() => {
        datosAlimento();
    }, []);

    const filteredAlimentos = [...alimentosPerecederos, ...alimentosNoPerecederos].filter((alimento) => {
        const nombre = alimento.ingrediente.toLowerCase();
        const tipo = alimento.Tipo.toLowerCase();
        const cantidad = alimento.cantidad.toString();
        return (
            (nombre.includes(searchTerm) ||
                tipo.includes(searchTerm) ||
                cantidad.includes(searchTerm))
        );
    });

    const animatedValues = filteredAlimentos.map(() => new Animated.Value(0));

    useEffect(() => {
        animatedValues.forEach((anim, index) => {
            Animated.timing(anim, {
                toValue: 1,
                duration: 500,
                delay: index * 100,
                useNativeDriver: true,
            }).start();
        });
    }, [filteredAlimentos]);

    useLayoutEffect(() => {
        navigation.setOptions({
            headerBackTitleVisible: false,
            headerTintColor: '#40632F',
            headerTitle: '',
            headerStyle: {
                height: SCREEN_HEIGHT * 0.15,
            },
            headerLeft: () => null,
            headerRight: () => (
                <View style={sHead.headerButtonsContainer}>
                    <View style={sHead.naveAl}>
                        <Pressable onPress={() => navigateToScreen('Hoy')}>
                            <Image source={require('../img/bHoy1.png')} style={sHead.headerIcon} />
                        </Pressable>
                        <Pressable onPress={() => navigateToScreen('Plan')}>
                            <Image source={require('../img/bPlan1.png')} style={sHead.headerIcon} />
                        </Pressable>
                        <Pressable onPress={() => navigateToScreen('Recetas')}>
                            <Image source={require('../img/bRecetas1.png')} style={sHead.headerIcon} />
                        </Pressable>
                        <Pressable onPress={() => navigateToScreen('Refri')}>
                            <Image source={require('../img/bRefri2.png')} style={sHead.headerIcon} />
                        </Pressable>
                        <Pressable onPress={() => navigateToScreen('Perfil')} style={sHead.headerIconEs}>
                            <Image source={require('../img/bPerfil.png')} style={sHead.headerIcon2} />
                        </Pressable>
                    </View>
                </View>
            ),
        });
    }, [navigation]);

    const onAddModalClose = () => {
        setIsAddModalVisible(false);
        resetAddModalState();
    };

    const removeNuevoIngrediente = (id: number) => {
        setIngredientes(ingredientes.filter((ing) => ing.id !== id));
    };

    const editIngrediente = () => {
        if (editIndex !== null) {
            const updatedIngredientes = ingredientes.map((ing, index) =>
                index === editIndex ? { ...ing, nombre, cantidad, caducidad } : ing
            );
            setIngredientes(updatedIngredientes);
        }
        setNombre('');
        setCantidad('');
        setCaducidad('');
        setIsEditModalVisible(false);
        setEditIndex(null);
        datosAlimento();
    };

    const openEditModal = (alimento: CardData) => {
        // Find the actual index of the item in the original `filteredAlimentos` list
        const indexToEdit = filteredAlimentos.findIndex(item => item.id === alimento.id);
        if (indexToEdit !== -1) {
            setEdAlimento(alimento.id); // Set the ID of the food to be edited
            setEditIndex(indexToEdit); // Set the index for the local state if needed for something else
            setNombre(alimento.ingrediente);
            setCantidad(alimento.cantidad.toString());
            // Format the date for display if it's a date string, otherwise use what's there
            // Ensure caducidad is a string that can be directly passed to the modal.
            // If it's "Fecha no disponible", etc., pass null or an empty string for the date picker.
            const initialCaducidadForModal = typeof alimento.fecha === 'string' && alimento.fecha.includes('/')
                ? alimento.fecha // Assuming 'DD/MM/YYYY' or similar
                : null; // Or use a specific default date if preferred
            setCaducidad(initialCaducidadForModal || ''); // Pass an empty string if no valid date

            setIsEditModalVisible(true);
        }
    };


    const openCamera = async () => {
        if (!cameraPermission?.granted) {
            const permissionResult = await requestPermission();
            if (!permissionResult.granted) {
                Alert.alert('Permiso Requerido', 'Necesitamos permiso para usar la cámara para tomar fotos.');
                return;
            }
        }
        setShowCamera(true);
        setScanned(false);
        setNombre(''); setCantidad(''); setCaducidad('');
        setFoodQueue([]);
        setScannedCode('');
    };

    const openScanner = async () => {
        if (!cameraPermission?.granted) {
            const permissionResult = await requestPermission();
            if (!permissionResult.granted) {
                Alert.alert('Permiso Requerido', 'Necesitamos permiso para usar la cámara para escanear códigos de barras.');
                return;
            }
        }
        setShowScanner(true);
        setScanned(false);
        setNombre(''); setCantidad(''); setCaducidad('');
        setFoodQueue([]);
        setScannedCode('');
        setProcessingScan(false);
        setCurrentFoodName('');
    };

    const renderCameraView = () => {
        if (cameraPermission === null) {
            return <Text style={styles.permissionText}>Solicitando permiso de cámara...</Text>;
        }
        if (!cameraPermission.granted) {
            return (
                <View style={styles.permissionContainer}>
                    <Text style={styles.permissionText}>No se tiene acceso a la cámara.</Text>
                    <TouchableOpacity onPress={requestPermission} style={styles.requestPermissionButton}>
                        <Text style={styles.requestPermissionButtonText}>Conceder Permiso</Text>
                    </TouchableOpacity>
                </View>
            );
        }

        return (
            <View style={styles.fullScreen}>
                <CameraView
                    style={styles.cameraFull}
                    ref={cameraRef}
                    facing={'back'}
                >
                    <View style={styles.cameraControls}>
                        <TouchableOpacity style={styles.captureButton} onPress={takePhotoAndRecognize}>
                            <Text style={styles.captureButtonText}>Capturar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={() => setShowCamera(false)}
                        >
                            <Text style={styles.closeText}>Cerrar</Text>
                        </TouchableOpacity>
                    </View>
                </CameraView>
            </View>
        );
    };

    const renderScannerView = () => {
        if (cameraPermission === null) {
            return <Text style={styles.permissionText}>Solicitando permiso de cámara...</Text>;
        }
        if (!cameraPermission.granted) {
            return (
                <View style={styles.permissionContainer}>
                    <Text style={styles.permissionText}>No se tiene acceso a la cámara para escanear.</Text>
                    <TouchableOpacity onPress={requestPermission} style={styles.requestPermissionButton}>
                        <Text style={styles.requestPermissionButtonText}>Conceder Permiso</Text>
                    </TouchableOpacity>
                </View>
            );
        }

        return (
            <View style={styles.fullScreen}>
                <BarCodeScanner
                    onBarCodeScanned={processingScan ? undefined : handleBarCodeScanned}
                    style={styles.cameraFull}
                    barCodeTypes={[
                        BarCodeScanner.Constants.BarCodeType.qr,
                        BarCodeScanner.Constants.BarCodeType.ean13,
                        BarCodeScanner.Constants.BarCodeType.ean8,
                    ]}
                />
                <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => {
                        setShowScanner(false);
                        setScanned(false);
                        setScannedCode('');
                        setProcessingScan(false);
                        setFoodQueue([]);
                        setCurrentFoodName('');
                    }}
                >
                    <Text style={styles.closeText}>Cerrar</Text>
                </TouchableOpacity>
            </View>
        );
    };

    if (showCamera) {
        return renderCameraView();
    }
    if (showScanner) {
        return renderScannerView();
    }

    return (
        <ErrorBoundary>
            <View style={styles.container}>
                {serverMessage !== '' && (
                    <Text style={styles.message}>{serverMessage}</Text>
                )}
                {errorMessage && (
                    <Text style={styles.errorMessage}>{errorMessage}</Text>
                )}
                {isLoading && (
                    <Text style={styles.loadingMessage}>Procesando imagen...</Text>
                )}

                <TextInput
                    placeholder="Buscar alimento..."
                    placeholderTextColor="#8CA966"
                    value={searchTerm}
                    onChangeText={(text) => setSearchTerm(text)}
                    style={styles.searchInput}
                />

                <ScrollView style={styles.fullScreenBox} contentContainerStyle={styles.scrollContent}>
                    {filteredAlimentos.length === 0 ? (
                        <Text style={styles.noFoodMessage}>No hay alimentos para mostrar. ¡Añade algunos!</Text>
                    ) : (
                        filteredAlimentos.map((alimento, index) => {
                            const translateY = animatedValues[index].interpolate({
                                inputRange: [0, 1],
                                outputRange: [20, 0],
                            });
                            const opacity = animatedValues[index];

                            const isExpired = alimento.caducidadPasada;
                            let daysRemainingText = 'No aplica';
                            let expiryDateStyle = styles.safeText;

                            if (alimento.Tipo === 'Perecedero') {
                                if (typeof alimento.diasRestantes === 'number') {
                                    daysRemainingText = `${alimento.diasRestantes} día${alimento.diasRestantes === 1 ? '' : 's'}`;
                                    if (isExpired) {
                                        expiryDateStyle = styles.expiredText;
                                    } else if (alimento.diasRestantes <= 3 && alimento.diasRestantes > 0) {
                                        expiryDateStyle = styles.expiringSoonText;
                                    } else {
                                        expiryDateStyle = styles.safeText;
                                    }
                                } else { // It's a string like 'No definida'
                                    daysRemainingText = alimento.diasRestantes;
                                    expiryDateStyle = styles.defaultExpiryText; // A neutral style for undefined/N/A
                                }
                            } else {
                                daysRemainingText = '🎉 Indefinido'; // For non-perishable
                                expiryDateStyle = styles.safeText; // Non-perishable are always 'safe'
                            }


                            return (
                                <Animated.View
                                    key={alimento.id}
                                    style={[
                                        styles.foodCard,
                                        { opacity, transform: [{ translateY }] },
                                    ]}
                                >
                                    <Image
                                        source={{ uri: alimento.image }}
                                        style={styles.foodImage}
                                        onError={(e) => console.log('Image loading error for ID', alimento.id, ':', e.nativeEvent.error)}
                                    />
                                    <View style={styles.foodDetails}>
                                        <Text style={styles.foodName}>{alimento.ingrediente}</Text>
                                        <Text style={styles.foodQuantity}>
                                            {alimento.cantidad} {alimento.abreviatura}
                                        </Text>
                                        <Text style={[styles.foodExpiry, expiryDateStyle]}>
                                            {alimento.Tipo === 'Perecedero' ? `Vence en: ${daysRemainingText}` : alimento.fecha}
                                        </Text>
                                    </View>
                                    <View style={styles.foodActions}>
                                        <MinusButton
                                            onPress={() => setConsAlimento(alimento.id)}
                                            size={26}
                                            color="#8CA966"
                                            style={styles.actionButton}
                                        />
                                        <TouchableOpacity onPress={() => openEditModal(alimento)} style={styles.actionButton}>
                                            <MaterialIcons name="edit" size={26} color="#4CAF50" />
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => eliminarAlimento(alimento.id)} style={styles.actionButton}>
                                            <MaterialIcons name="delete" size={26} color="#E57373" />
                                        </TouchableOpacity>
                                    </View>
                                </Animated.View>
                            );
                        })
                    )}
                </ScrollView>

                {/* Add/Scan/Photo buttons */}
                <View style={styles.bottomButtonsContainer}>
                    <TouchableOpacity onPress={() => setIsAddModalVisible(true)} style={styles.addButton}>
                        <MaterialIcons name="add" size={30} color="#fff" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={openScanner} style={styles.scanButton}>
                        <MaterialIcons name="qr-code-scanner" size={30} color="#fff" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={openCamera} style={styles.photoButton}>
                        <MaterialIcons name="camera-alt" size={30} color="#fff" />
                    </TouchableOpacity>
                </View>

                {/* Modals */}
                <AddModal
                    visible={isAddModalVisible}
                    onClose={handleCloseAddModal}
                    onSubmit={async (data) => {
                        console.log('Datos a enviar:', data);
                        try {
                            const currentUserString = await AsyncStorage.getItem('currentUser');
                            if (!currentUserString) {
                                Alert.alert('Error', 'No hay usuario autenticado.');
                                return;
                            }
                            const currentUser = JSON.parse(currentUserString);
                            const userId = currentUser.id;

                            const formData = new FormData();
                            formData.append('Nombre', data.nombre);
                            formData.append('Cantidad', data.cantidad);
                            if (data.caducidad) {
                                formData.append('Fecha_Caducidad', data.caducidad);
                            }
                            if (data.unidadId) {
                                formData.append('Id_Unidad_Medida', data.unidadId.toString());
                            }
                            if (data.tipoId) {
                                formData.append('Id_Tipo_Alimento', data.tipoId.toString());
                            }
                            formData.append('Id_Usuario_Alta', userId.toString());
                            if (data.codigoEscaneado) {
                                formData.append('Codigo_Barras', data.codigoEscaneado);
                            }

                            if (data.imagenUri) {
                                const fileExtension = data.imagenUri.split('.').pop();
                                const fileName = `image_${Date.now()}.${fileExtension}`;
                                formData.append('Imagen', {
                                    uri: data.imagenUri,
                                    name: fileName,
                                    type: `image/${fileExtension}`,
                                } as any);
                            }

                            const response = await axios.post(`${PUERTO}/alimento`, formData, {
                                headers: {
                                    'Content-Type': 'multipart/form-data',
                                },
                            });

                            if (response.status === 201) {
                                setServerMessage('Alimento agregado exitosamente.');
                                datosAlimento(); // Refresh the list
                                handleCloseAddModal(); // Close and reset the modal
                            } else {
                                setServerMessage('Error al agregar alimento.');
                            }
                        } catch (error: any) {
                            console.error('Error al agregar alimento:', error.response?.data || error.message);
                            setServerMessage(`Error al agregar alimento: ${error.response?.data?.mensaje || error.message}`);
                        }
                    }}
                    initialNombre={currentFoodName} // Pass the recognized food name to the modal
                    initialCodigoEscaneado={codigoEscaneadoParaModal}
                />
                <EditModal
                    visible={edAlimento !== null} // The modal is visible when edAlimento has a value
                    onClose={() => {
                        setEdAlimento(null); // <--- CHANGE THIS LINE: Set edAlimento to null to close the modal
                        // You can remove setIsEditModalVisible(false) here as it's not controlling this modal's visibility
                        datosAlimento(); // Still call to reload data
                    }}
                    onSubmit={datosAlimento}
                    IdStock={edAlimento}
                />
                
                <ConsumoModal
                    visible={consAlimento !== null} 
                    onClose={() => {
                        setConsAlimento(null); 
                        datosAlimento(); 
                    }}
                    onSubmit={datosAlimento}
                    IdStock={consAlimento}
                />
            </View>
        </ErrorBoundary>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F0F8F0', // Light green background
        padding: 20,
        paddingTop: SCREEN_HEIGHT * 0.05, // Adjust padding based on header height
    },
    fullScreenBox: {
        flex: 1,
        width: '100%',
    },
    scrollContent: {
        paddingBottom: 20, // Add padding to the bottom of the scroll view
    },
    message: {
        fontSize: 16,
        color: '#4CAF50', // Green for success messages
        textAlign: 'center',
        marginBottom: 10,
        fontWeight: 'bold',
    },
    errorMessage: {
        fontSize: 16,
        color: '#D32F2F', // Red for error messages
        textAlign: 'center',
        marginBottom: 10,
        fontWeight: 'bold',
    },
    loadingMessage: {
        fontSize: 16,
        color: '#1976D2', // Blue for loading messages
        textAlign: 'center',
        marginBottom: 10,
        fontWeight: 'bold',
    },
    searchInput: {
        backgroundColor: '#E8F5E9', // Lighter green for search input
        borderColor: '#8CA966',
        borderWidth: 1,
        borderRadius: 25, // More rounded corners
        paddingHorizontal: 15,
        paddingVertical: 10,
        marginBottom: 20,
        fontSize: 16,
        color: '#333',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    noFoodMessage: {
        fontSize: 18,
        color: '#555',
        textAlign: 'center',
        marginTop: 50,
        fontStyle: 'italic',
    },
    // --- Food Card Styles ---
    foodCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF', // White card background
        borderRadius: 15,
        padding: 15,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
        borderLeftWidth: 8,
        borderColor: '#A8D8B6', // Light green border
    },
    foodImage: {
        width: 70,
        height: 70,
        borderRadius: 35, // Circular image
        marginRight: 15,
        borderWidth: 2,
        borderColor: '#8CA966', // Green border for image
        resizeMode: 'cover',
    },
    foodDetails: {
        flex: 1,
        justifyContent: 'center',
    },
    foodName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#388E3C', // Darker green for food name
        marginBottom: 4,
    },
    foodQuantity: {
        fontSize: 15,
        color: '#66BB6A', // Medium green for quantity
        marginBottom: 2,
    },
    foodExpiry: {
        fontSize: 14,
        fontWeight: '600',
    },
    safeText: {
        color: '#4CAF50', // Green for fresh/good
    },
    expiringSoonText: {
        color: '#FF9800', // Orange for expiring soon
    },
    expiredText: {
        color: '#D32F2F', // Red for expired
        fontWeight: 'bold',
    },
    defaultExpiryText: { // Added for 'No definida' cases
        color: '#757575', // Grey/neutral for undefined
    },
    foodActions: {
        flexDirection: 'column',
        alignItems: 'center',
        marginLeft: 10,
    },
    actionButton: {
        padding: 5,
        marginTop: 5,
        borderRadius: 8,
    },
    // --- Bottom Action Buttons ---
    bottomButtonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingTop: 15,
        borderTopWidth: 1,
        borderTopColor: '#E0E0E0',
        backgroundColor: '#F0F8F0', // Match container background
    },
    addButton: {
        backgroundColor: '#4CAF50', // Green
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    scanButton: {
        backgroundColor: '#8BC34A', // Lighter green
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    photoButton: {
        backgroundColor: '#689F38', // Even lighter green
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },

    // --- General Camera/Scanner Styles (kept from original) ---
    fullScreen: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'black',
    },
    cameraFull: {
        width: '100%',
        height: '100%',
    },
    cameraControls: {
        position: 'absolute',
        bottom: 40,
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        paddingHorizontal: 20,
    },
    captureButton: {
        backgroundColor: '#FFF',
        padding: 15,
        borderRadius: 50,
        width: 100,
        alignItems: 'center',
    },
    captureButtonText: {
        fontSize: 16,
        color: 'black',
        fontWeight: 'bold',
    },
    closeButton: {
        position: 'absolute',
        top: 60,
        right: 20,
        backgroundColor: 'rgba(0,0,0,0.5)',
        padding: 10,
        borderRadius: 5,
    },
    closeText: {
        color: 'white',
        fontSize: 16,
    },
    permissionContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    permissionText: {
        fontSize: 18,
        textAlign: 'center',
        marginBottom: 20,
        color: '#333',
    },
    requestPermissionButton: {
        backgroundColor: '#4CAF50',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 10,
    },
    requestPermissionButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFEBEE',
    },
    errorText: {
        color: '#D32F2F',
        fontSize: 18,
        textAlign: 'center',
        marginHorizontal: 20,
    },
});

// Styles for the header (assuming sHead is defined elsewhere or will be here)
const sHead = StyleSheet.create({
  headerButtonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.15,
  },
  headerIcon: {
    width: SCREEN_WIDTH * 0.15,
    height: SCREEN_HEIGHT * 0.07,
    marginHorizontal: SCREEN_WIDTH * 0.01,
    resizeMode: 'contain',
  },
  headerIcon2: {
    width: SCREEN_WIDTH * 0.16,
    height: SCREEN_HEIGHT * 0.08,
    resizeMode: 'contain',
  },
  headerIconEs: {
    marginHorizontal: SCREEN_WIDTH * 0.01,
  },
  naveAl: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#9FAF7D',
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.07,
    top: SCREEN_HEIGHT * 0.06,
    paddingHorizontal: SCREEN_WIDTH * 0.02,
  },
});

export default Refri;