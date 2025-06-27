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
import * as ImagePicker from 'expo-image-picker'; // For camera and gallery picker
import { CameraView, CameraType } from 'expo-camera'; // Keep this as it is
import { useCameraPermissions } from 'expo-camera';
import axios from 'axios';
import PUERTO from '../config'; // Assumes this file exports the PUERTO constant
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AddModal, EditModal } from './Componentes/ModalRefri'; // ADJUST THIS PATH IF DIFFERENT!
import * as ImageManipulator from 'expo-image-manipulator';

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
    id: number | string; // Allow string type for ID if it comes from the API as non-numeric
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
    // If your local ingredient saving logic includes the barcode
    // codigoBarras?: string;
};

// Interfaces for the backend's image recognition response
// These must match what your Express server sends from the FatSecret API
interface RecognizedFoodItem {
    name: string;
    quantity: number;
}

interface FoodRecognitionResponse {
    mensaje: string;
    recognizedFoodsDetailed: RecognizedFoodItem[];
}

// Interfaces for your modal props (ensure these match your ModalRefri.tsx)
interface AddModalProps {
    visible: boolean;
    onClose: () => void;
    onSubmit: () => void;
    nombre: string;
    setNombre: (text: string) => void;
    cantidad: string;
    setCantidad: (text: string) => void;
    caducidad: string;
    setCaducidad: (text: string) => void;
    codigoEscaneado?: string; // New prop for the barcode
    setCodigoEscaneado?: (text: string) => void; // New prop for the barcode's setter
}

interface EditModalProps {
    visible: boolean;
    onClose: () => void;
    onSubmit: (data: {
        idAlimento: number;
        nombre: string;
        cantidad: string;
        caducidad: string | null;
        unidadId: number | null;
        tipoId: number | null;
        imagenUri: string | null;
        codigoEscaneado?: string;
    }) => void;
    initialData: {
        idAlimento: number;
        nombre: string;
        cantidad: string;
        caducidad: string | null;
        unidadId: number;
        tipoId: number;
        imagenUri: string | null;
        codigoEscaneado?: string;
    };
}

type InitialEditData = EditModalProps['initialData'];

// Get screen dimensions
export const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Error Boundary Component to catch rendering errors
class ErrorBoundary extends Component<{ children: React.ReactNode }, { hasError: boolean }> {
    state = { hasError: false };

    static getDerivedStateFromError() {
        // Update state so the next render shows the fallback UI
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
    // States for permissions and camera/scanner view control
     const [cameraPermission, requestPermission] = useCameraPermissions(); // Use the hook here
    const [scanned, setScanned] = useState(false);
    const [showCamera, setShowCamera] = useState(false);
    const [showScanner, setShowScanner] = useState(false);

    // States for food management in the UI
    const [alimentosPerecederos, setAlimentosPerecederos] = useState<CardData[]>([]);
    const [alimentosNoPerecederos, setAlimentosNoPerecederos] = useState<CardData[]>([]);
    const [searchTerm, setSearchTerm] = useState(''); // For search functionality
    const [ingredientes, setIngredientes] = useState<Ingrediente[]>([]); // Used for local management, if applicable

    // States for add/edit modal
    const [isModalVisible, setIsModalVisible] = useState(false); // Visibility of the add modal
    const [isEditModalVisible, setIsEditModalVisible] = useState(false); // Visibility of the edit modal
    const [editIndex, setEditIndex] = useState<number | null>(null); // Index of the food item to edit
    const [nombre, setNombre] = useState(''); // Name field of the modal
    const [cantidad, setCantidad] = useState(''); // Quantity field of the modal
    const [caducidad, setCaducidad] = useState(''); // Expiry date field of the modal
    const [isAddModalVisible, setIsAddModalVisible] = useState(false);
    const [selectedItemToEdit, setSelectedItemToEdit] = useState<InitialEditData | null>(null);

    // States for server communication and UI feedback
    const [serverMessage, setServerMessage] = useState(''); // Success/error messages from the server
    const [isLoading, setIsLoading] = useState(false); // Loading indicator for FatSecret requests
    const [errorMessage, setErrorMessage] = useState<string | null>(null); // Detailed error messages
    const [codigoEscaneadoParaModal, setCodigoEscaneadoParaModal] = useState<string>('');

    // States specific to the image recognition and scanning flow
    const [scannedCode, setScannedCode] = useState<string>(''); // NEW! Stores the scanned barcode
    const [foodQueue, setFoodQueue] = useState<string[]>([]); // Queue of food names detected by image/barcode
    const [currentFoodName, setCurrentFoodName] = useState<string>(''); // Current name displayed in the queue modal

    // Reference for the Camera component (from expo-camera)
    const cameraRef = useRef<CameraView>(null); // Using 'any' as a workaround for complex TypeScript typing of Expo Camera

    // Navigation hook
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();

    // Function to navigate between screens
    const navigateToScreen = (screenName: keyof RootStackParamList) => {
        navigation.navigate(screenName);
    };

    // Effect to clear server messages after a timeout
    useEffect(() => {
        if (serverMessage !== '') {
            const timer = setTimeout(() => setServerMessage(''), 5000);
            return () => clearTimeout(timer);
        }
    }, [serverMessage]);

    // Effect to request camera and media library permissions on component mount
    useEffect(() => {
        (async () => {
            // Keep only ImagePicker permission if you use it for gallery access
            const { status: mediaLibraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (mediaLibraryStatus !== 'granted') {
                console.warn('Permiso de galería no concedido. Algunas funcionalidades podrían no estar disponibles.');
            }
        })();
    }, []);

    // Effect to handle the food queue and open modals sequentially
    useEffect(() => {
        if (foodQueue.length > 0 && !isModalVisible && !isLoading) {
            const nextFood = foodQueue[0]; // Take the first food item from the queue
            setCurrentFoodName(nextFood); // Set the current name for the modal
            setNombre(nextFood); // Pre-fill the name input of the modal
            setCantidad(''); // Reset other fields (quantity)
            setCaducidad(''); // Reset other fields (expiry date)
            // `scannedCode` is managed in `handleBarCodeScanned` or `takePhotoAndRecognize`
            setIsModalVisible(true); // Open the add modal
        }
    }, [foodQueue, isModalVisible, isLoading]); // Re-runs when queue, modal visibility, or loading state changes

    // Function executed when BarCodeScanner detects a code
    const handleBarCodeScanned = async ({ type, data }: { type: string; data: string }) => {
        setScanned(true); // Mark as scanned to prevent repeated scans
        setShowScanner(false); // Close the scanner view

        setScannedCode(data); // NEW! Stores the scanned barcode in the state

        try {
            // Make the request to your server for barcode scanning
            const response = await axios.post(`${PUERTO}/alimento/scanner`, { codigo: data });

            if (response.status === 200 && response.data.nombreCompleto) {
                setServerMessage("Código escaneado correctamente. Datos recibidos del servidor.");
                // For scanner, usually only one product is expected, so the queue has a single element
                setFoodQueue([response.data.nombreCompleto]);
            } else {
                setServerMessage("El servidor no devolvió resultados para este código.");
                setFoodQueue(['']); // If not found, open an empty modal for manual entry
            }
        } catch (error: any) {
            console.error("Error al enviar código escaneado:", error.response ? error.response.data : error.message);
            setServerMessage("No se pudo conectar con el servidor al escanear.");
            setFoodQueue(['']); // Open an empty modal in case of connection error
        }
    };

    // Function to take a photo with the camera and send it to the server for recognition
    const takePhotoAndRecognize = async () => {
    // ... (código de permisos y estados iniciales)

    if (cameraRef.current) {
        setIsLoading(true);
        setErrorMessage(null);
        setFoodQueue([]);
        setNombre(''); setCantidad(''); setCaducidad('');
        setScannedCode('');

        try {
            const photo = await cameraRef.current.takePictureAsync({
                base64: true,
                quality: 1, // Toma la foto con la mejor calidad para manipularla después
                exif: false,
            });

            setShowCamera(false);

            if (photo && photo.base64) {
                // --- NUEVA LÓGICA DE MANIPULACIÓN DE IMAGEN ---
                // Dentro de takePhotoAndRecognize
const manipResult = await ImageManipulator.manipulateAsync(
    photo.uri,
    [{ resize: { width: 800 } }],
    // Prueba con WEBP si tu servidor lo soporta bien para mayor compresión
    { compress: 0.7, format: ImageManipulator.SaveFormat.WEBP, base64: true }
);

                if (manipResult.base64) {
                    const response = await axios.post<FoodRecognitionResponse>(`${PUERTO}/alimento/recognize-food-image`, {
                        image_b64: manipResult.base64, // ¡Aquí enviamos el Base64 de la imagen OPTIMIZADA!
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
                // --- FIN DE LA NUEVA LÓGICA ---

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

    // Function to delete a food item (assumes it connects to your backend)
    const eliminarAlimento = async (id: number | string) => {
        try {
            const response = await axios.put(`${PUERTO}/alimentoInactivo/${id}`, { id });

            if (response.status === 200) {
                setServerMessage("Alimento eliminado exitosamente.");
                datosAlimento(); // Reload food data after deletion
            } else {
                setServerMessage("No se pudo eliminar el alimento.");
            }
        } catch (error) {
            console.error("Error al eliminar alimento:", error);
            setServerMessage("Ocurrió un error al intentar eliminar el alimento.");
        }
    };

    // Function to get food data from the server
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
            // Use type assertions for the API response based on the expected structure
            const { Perecedero, NoPerecedero } = response.data as { Perecedero: any[], NoPerecedero: any[] };

            if (Array.isArray(Perecedero) && Array.isArray(NoPerecedero)) {
                const perecederos: CardData[] = Perecedero.filter(
                    (alimento: any) => alimento.Id_Usuario_Alta === userId
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
                        id: alimento.id || ' ',
                        ingrediente: alimento.Nombre || ' ',
                        cantidad: alimento.Cantidad || 1,
                        abreviatura: alimento.Unidad || ' ',
                        image: alimento.Imagen ? `${PUERTO}${alimento.Imagen}` : '/imagenes/defIng.png',
                        fecha: caducidadPasada ? fecha : `${diasRestantes} días`,
                        diasRestantes,
                        caducidadPasada,
                        Tipo: alimento.Tipo_Alimento,
                        Activo: alimento.Activo,
                        Id_Usuario_Alta: alimento.Id_Usuario_Alta,
                    };
                });

                const noPerecederos: CardData[] = NoPerecedero.filter(
                    (alimento: any) => alimento.Id_Usuario_Alta === userId
                ).map((alimento: any) => ({
                    id: alimento.id || ' ',
                    ingrediente: alimento.Nombre || ' ',
                    cantidad: alimento.Cantidad || 0,
                    abreviatura: alimento.Unidad || ' ',
                    image: alimento.Imagen ? `${PUERTO}${alimento.Imagen}` : '/imagenes/defIng.png',
                    fecha: '🧀', // Icon for non-perishable items
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

    // Handle search input
    const handleSearch = (value: string) => {
        setSearchTerm(value.toLowerCase());
    };

    // Load food items on component mount
    useEffect(() => {
        datosAlimento();
    }, []);

    // Filter food items based on search term
    const filteredAlimentos = [...alimentosPerecederos, ...alimentosNoPerecederos].filter((alimento) => {
        const nombre = alimento.ingrediente.toLowerCase();
        const tipo = alimento.Tipo.toLowerCase();
        const cantidad = alimento.cantidad.toString(); // Convert to string for search
        return (
            (nombre.includes(searchTerm) ||
                tipo.includes(searchTerm) ||
                cantidad.includes(searchTerm)) &&
            alimento.cantidad > 0 && alimento.Activo > 0 // Only show active and with quantity > 0
        );
    });

    // Animations for the food list
    const animatedValues = filteredAlimentos.map(() => new Animated.Value(0));

    useEffect(() => {
        animatedValues.forEach((anim, index) => {
            Animated.timing(anim, {
                toValue: 1,
                duration: 500,
                delay: index * 100, // Staggered delay for a fade-in effect
                useNativeDriver: true,
            }).start();
        });
    }, [filteredAlimentos]); // Re-run animation when filtered food items change


    // Navigation header configuration (adjusted to use hasCameraPermission)
    useLayoutEffect(() => {
        navigation.setOptions({
            headerBackTitleVisible: false,
            headerTintColor: '#40632F',
            headerTitle: '',
            headerStyle: {
                height: SCREEN_HEIGHT * 0.15,
            },
            headerRight: () => (
                // Header buttons container
                <View style={sHead.headerButtonsContainer}>
                    <View style={sHead.naveAl}>
                        {/* Navigation buttons */}
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
    }, [navigation]); // Depends on navigation


    // Function to add a new ingredient to the list (called from the modal)
    const addNuevoIngrediente = () => {
        const newIngrediente: Ingrediente = {
            id: ingredientes.length, // Temporary ID, adjust if you use backend IDs
            nombre,
            cantidad,
            caducidad,
            // If you want to save `scannedCode` with the ingredient, add it here
            // e.g., codigoBarras: scannedCode,
        };
        // Add the new ingredient to the local list
        setIngredientes([...ingredientes, newIngrediente]);

        // Modal queue management: remove the current food and close the modal
        setFoodQueue(prevQueue => prevQueue.slice(1)); // Remove the first element from the queue
        setIsModalVisible(false); // Close the current modal

        // Clear `scannedCode` only if this is the last or only entry in the queue
        if (foodQueue.length <= 1) {
            setScannedCode(''); // Clear the scanned code after processing the last queue
        }
        datosAlimento(); // Reload data to show the new ingredient in the list
    };

    // Function to remove an ingredient from the local list (not from the backend)
    const removeNuevoIngrediente = (id: number) => {
        setIngredientes(ingredientes.filter((ing) => ing.id !== id));
    };

    // Function to edit an existing ingredient
    const editIngrediente = () => {
        if (editIndex !== null) {
            // Update the ingredient in the local list
            const updatedIngredientes = ingredientes.map((ing, index) =>
                index === editIndex ? { ...ing, nombre, cantidad, caducidad } : ing
            );
            setIngredientes(updatedIngredientes);
        }
        // Clear fields and close the edit modal
        setNombre('');
        setCantidad('');
        setCaducidad('');
        setIsEditModalVisible(false);
        setEditIndex(null);
        datosAlimento(); // Reload data after editing
    };

    // Function to open the edit modal
    const openEditModal = (index: number) => {
        // Ensure that CardData and Ingrediente types match or convert
        const alimentoAEditar = filteredAlimentos[index];
        setEditIndex(index);
        setNombre(alimentoAEditar.ingrediente); // The existing ingredient's name
        setCantidad(alimentoAEditar.cantidad.toString()); // Ensure it's a string for TextInput
        setCaducidad(alimentoAEditar.fecha); // Or the original date field if you have it in a specific format
        setIsEditModalVisible(true);
    };


    // Function to open the camera view for taking photos
    const openCamera = async () => { // Function is now async
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

    // Function to open the barcode scanner view
    const openScanner = async () => { // Function is now async
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
    };

    const handleCloseAddModal = () => {
        setIsAddModalVisible(false);
        setScanned(false); // Reinicia el estado de escaneo (para permitir escanear de nuevo)
        setFoodQueue([]); // Limpia la cola de alimentos reconocidos
        setCurrentFoodName(''); // Limpia el nombre del alimento actual
        setScannedCode(''); // Limpia cualquier código escaneado almacenado
        setErrorMessage(null); // Limpia cualquier mensaje de error
    };

    // Camera view component for taking photos
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
            // === FIX FOR 'type' PROP ERROR ===
            // Use 'facing' prop instead of 'type'
            // Values are 'back' or 'front' strings.
            facing={'back'} // Explicitly use 'back' as a string
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
    // Barcode scanner view component
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
                    onBarCodeScanned={scanned ? undefined : handleBarCodeScanned} // Only scans if `scanned` is false
                    style={styles.cameraFull}
                    barCodeTypes={[
                        BarCodeScanner.Constants.BarCodeType.qr,
                        BarCodeScanner.Constants.BarCodeType.ean13,
                        BarCodeScanner.Constants.BarCodeType.ean8,
                        // Add other barcode types you need to scan
                    ]}
                />
                {scanned && ( // Button to re-scan if a code has been detected
                    <TouchableOpacity style={styles.scanAgainButtonFull} onPress={() => setScanned(false)}>
                        <Text style={styles.scanAgainText}>Tocar para Escanear de Nuevo</Text>
                    </TouchableOpacity>
                )}
                {/* Button to close scanner view */}
                <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => {
                        setShowScanner(false);
                        setScanned(false); // Reset scanned state when manually closing
                        setScannedCode(''); // NEW! Clear code when manually closing the scanner
                    }}
                >
                    <Text style={styles.closeText}>Cerrar</Text>
                </TouchableOpacity>
            </View>
        );
    };

    // Logic to conditionally render camera or scanner
    if (showCamera) {
        return renderCameraView();
    }
    if (showScanner) {
        return renderScannerView();
    }

    // Main render of the Refri component
    return (
        <ErrorBoundary>
            <View style={styles.container}>
                {serverMessage !== '' && ( // Show server messages
                    <Text style={styles.message}>{serverMessage}</Text>
                )}
                {errorMessage && ( // Show API error messages
                    <Text style={styles.errorMessage}>{errorMessage}</Text>
                )}
                {isLoading && ( // Show a loading indicator
                    <Text style={styles.loadingMessage}>Procesando imagen...</Text>
                )}

                {/* Search input field */}
                <TextInput
                    placeholder="Buscar alimento..."
                    placeholderTextColor="#555"
                    value={searchTerm}
                    onChangeText={(text) => setSearchTerm(text)}
                    style={{
                        backgroundColor: 'white',
                        borderColor: '#8CA966',
                        borderWidth: 1,
                        borderRadius: 10,
                        paddingHorizontal: 12,
                        paddingVertical: 8,
                        marginBottom: 15,
                        fontSize: 16,
                    }}
                />

                {/* Food list container */}
                <ScrollView style={styles.fullScreenBox} contentContainerStyle={styles.scrollContent}>
                    {filteredAlimentos.map((alimento, index) => {
                        // Animations for each list item
                        const translateY = animatedValues[index].interpolate({
                            inputRange: [0, 1],
                            outputRange: [20, 0],
                        });
                        const opacity = animatedValues[index];

                        return (
                            <Animated.View
                                key={alimento.id}
                                style={[
                                    styles.nuevoIngrediente,
                                    { opacity, transform: [{ translateY }] },
                                ]}
                            >
                                <Image source={{ uri: alimento.image }} style={styles.defaultImage} />
                                <View style={styles.textWrapper}>
                                    <Text style={styles.txtIngrediente}>{alimento.ingrediente}</Text>
                                    <Text style={styles.porciones}>
                                        {alimento.cantidad} {alimento.abreviatura}
                                    </Text>
                                    <Text style={{ fontSize: 12, color: alimento.caducidadPasada ? 'red' : 'green' }}>
                                        {alimento.fecha}
                                    </Text>
                                </View>
                                <View style={styles.textWrappers}>
                                    <Pressable onPress={() => openEditModal(index)}>
                                        <Image source={require('../img/Editar.png')} style={styles.trashImage} />
                                    </Pressable>
                                    <Pressable onPress={() => eliminarAlimento(alimento.id)}>
                                        <Image source={require('../img/Basura.png')} style={styles.trashImage} />
                                    </Pressable>
                                </View>
                            </Animated.View>
                        );
                    })}
                </ScrollView>

                {/* Bottom icons container */}
                <View style={styles.bottomIconsContainer}>
                    <View style={styles.leftIcons}>
                        {/* Button to open photo camera */}
                        <Pressable style={styles.iconButton} onPress={openCamera}>
                            <Image source={require('../img/Camara.png')} style={styles.cameraImage} />
                        </Pressable>
                        {/* Button to open barcode scanner */}
                        <Pressable style={styles.iconButton} onPress={openScanner}>
                            <Image source={require('../img/Scanner.png')} style={styles.scannerImage} />
                        </Pressable>
                    </View>
                    {/* Button to add food manually */}
                    <Pressable style={styles.addButton} onPress={() => {
                        setNombre('');
                        setCantidad('');
                        setCaducidad('');
                        setFoodQueue([]); // Clear queue if opening manually
                        setScannedCode(''); // Clear scanned code if opening manually
                        setIsModalVisible(true); // Open add modal
                    }}>
                        <Image source={require('../img/MasCirculo.png')} style={styles.addIcon} />
                    </Pressable>
                </View>

                <AddModal
                                               visible={isAddModalVisible}
                                               onClose={handleCloseAddModal}
                                               onSubmit={datosAlimento} // Tu función onSubmit recibe un objeto 'data'
                                               initialNombre={currentFoodName} // Pasa el nombre de la cola
                                               initialCodigoEscaneado={codigoEscaneadoParaModal} // Pasa el código escaneado
                                               // Ya no pasamos setNombre, setCantidad, setCaducidad, etc.
                                           />
                               
            </View>
        </ErrorBoundary>
    );
};

const styles = StyleSheet.create({
    permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0', // A light background
    padding: 20,
},
requestPermissionButton: {
    marginTop: 20,
    backgroundColor: '#40632F', // Your primary button color
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
},
requestPermissionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
},
  loadingMessage: { // Style for the loading indicator
        backgroundColor: '#cce5ff', // Light blue
        borderColor: '#b8daff',
        borderWidth: 1,
        borderRadius: 5,
        padding: 10,
        marginBottom: 15,
        textAlign: 'center',
        color: '#004085', // Dark blue
    },
  fullScreen: {
        flex: 1,
        backgroundColor: 'black',
        justifyContent: 'center',
        alignItems: 'center',
    },
    cameraFull: {
        flex: 1,
        width: '100%',
    },
    cameraControls: {
        position: 'absolute',
        bottom: SCREEN_HEIGHT * 0.05,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingHorizontal: SCREEN_WIDTH * 0.05,
    },
    captureButton: {
        backgroundColor: '#fff',
        borderRadius: (SCREEN_WIDTH * 0.15) / 2, // Larger circle
        padding: SCREEN_WIDTH * 0.04,
        borderWidth: 2,
        borderColor: '#ddd',
        width: SCREEN_WIDTH * 0.15,
        height: SCREEN_WIDTH * 0.15,
        justifyContent: 'center',
        alignItems: 'center',
    },
    captureButtonText: {
        fontSize: SCREEN_WIDTH * 0.035,
        color: '#333',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    closeButton: {
        backgroundColor: 'rgba(0,0,0,0.6)', // Darker background
        borderRadius: SCREEN_WIDTH * 0.02,
        padding: SCREEN_WIDTH * 0.025,
    },
    closeText: {
        color: '#fff',
        fontSize: SCREEN_WIDTH * 0.04,
    },
  scanAgainButtonFull: {
        position: 'absolute',
        bottom: SCREEN_HEIGHT * 0.15, // Elevated to avoid conflict with controls
        alignSelf: 'center',
        backgroundColor: 'rgba(0, 122, 255, 0.8)', // More solid blue
        paddingHorizontal: SCREEN_WIDTH * 0.05,
        paddingVertical: SCREEN_WIDTH * 0.025,
        borderRadius: SCREEN_WIDTH * 0.05,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3,
        elevation: 5,
    },
    scanAgainText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: SCREEN_WIDTH * 0.045,
    },
  permissionText: {
        color: 'white',
        fontSize: SCREEN_WIDTH * 0.05,
        textAlign: 'center',
    },
  errorMessage: { // Style for API error messages
        backgroundColor: '#f8d7da', // Light red
        borderColor: '#f5c6cb',
        borderWidth: 1,
        borderRadius: 5,
        padding: 10,
        marginBottom: 15,
        textAlign: 'center',
        color: '#721c24', // Dark red
    },
  message: {
    color: '#d9534f', // rojo para errores
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
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
  container: {
    flex: 1,
    marginTop: SCREEN_HEIGHT * 0.04,
    padding: SCREEN_WIDTH * 0.05,
  },
  fullScreenBox: {
    flex: 1,
    backgroundColor: '#CAE2B5',
    borderRadius: SCREEN_WIDTH * 0.05,
    borderWidth: SCREEN_WIDTH * 0.005,
    borderColor: '#8CA966',
  },
  scrollContent: {
    padding: SCREEN_WIDTH * 0.05,
    paddingBottom: SCREEN_HEIGHT * 0.05,
  },
  nuevoIngrediente: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#CAE2B5',
    borderRadius: SCREEN_WIDTH * 0.025,
    padding: SCREEN_WIDTH * 0.025,
    marginBottom: SCREEN_HEIGHT * 0.005,
  },
  defaultImage: {
    width: SCREEN_WIDTH * 0.08,
    height: SCREEN_WIDTH * 0.08,
    marginRight: SCREEN_WIDTH * 0.025,
  },
  trashImage: {
    width: SCREEN_WIDTH * 0.042,
    height: SCREEN_WIDTH * 0.042,
    marginLeft: SCREEN_WIDTH * 0.025,
  },
  textWrapper: {
    flex: 1,
    justifyContent: 'center',
  },
  textWrappers: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  txtIngrediente: {
    backgroundColor: 'white',
    color: '#000000',
    fontSize: SCREEN_WIDTH * 0.032,
    paddingHorizontal: SCREEN_WIDTH * 0.02,
    paddingVertical: SCREEN_HEIGHT * 0.005,
    borderRadius: SCREEN_WIDTH * 0.025,
    marginBottom: SCREEN_HEIGHT * 0.001,
  },
  porciones: {
    backgroundColor: '#E0E0E0',
    color: '#000000',
    fontSize: SCREEN_WIDTH * 0.018,
    paddingHorizontal: SCREEN_WIDTH * 0.012,
    paddingVertical: SCREEN_HEIGHT * 0.003,
    borderRadius: SCREEN_WIDTH * 0.012,
    alignSelf: 'flex-start',
  },
  bottomIconsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SCREEN_WIDTH * 0.05,
    marginTop: SCREEN_HEIGHT * 0.01,
    marginBottom: SCREEN_HEIGHT * 0.03,
  },
  leftIcons: {
    flexDirection: 'row',
    marginLeft: -SCREEN_WIDTH * 0.02,
  },
  iconButton: {
    backgroundColor: '#CEDFAD',
    padding: SCREEN_WIDTH * 0.025,
    borderRadius: SCREEN_WIDTH * 0.012,
    marginRight: SCREEN_WIDTH * 0.025,
  },
  cameraImage: {
    width: SCREEN_WIDTH * 0.08,
    height: SCREEN_WIDTH * 0.08,
  },
  scannerImage: {
    width: SCREEN_WIDTH * 0.08,
    height: SCREEN_WIDTH * 0.08,
  },
  addButton: {
    backgroundColor: '#CEDFAD',
    padding: SCREEN_WIDTH * 0.025,
    borderRadius: SCREEN_WIDTH * 0.012,
    marginRight: -SCREEN_WIDTH * 0.02,
  },
  addIcon: {
    width: SCREEN_WIDTH * 0.08,
    height: SCREEN_WIDTH * 0.08,
  },
  // --- ELIMINADO: addButtonFull ---
  // Este estilo ya no es necesario porque el botón de añadir se eliminó de la vista del escáner.
  /*
  addButtonFull: {
    position: 'absolute',
    bottom: SCREEN_HEIGHT * 0.03,
    alignSelf: 'center',
    backgroundColor: '#CEDFAD',
    padding: SCREEN_WIDTH * 0.025,
    borderRadius: SCREEN_WIDTH * 0.012,
  },
  */
});

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