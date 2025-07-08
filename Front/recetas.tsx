import React, { useState, useLayoutEffect, useEffect } from 'react'; // Eliminado useRef ya que no se usa
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
    Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack'; // Se mantiene para StackNavigationProp
import { BarCodeScanner } from 'expo-barcode-scanner'; // Se mantiene por si se usa en el futuro, aunque la lógica se quitó
import axios from 'axios';
import PUERTO from '../config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialIcons } from '@expo/vector-icons';
import { RootStackParamList } from '../types'; // Importa RootStackParamList desde tu archivo de tipos

// Define el tipo de navegación para esta pantalla específica
type RecetasScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Recetas'>;

interface CardData {
    id: number;
    title: string;
    portions: string;
    calories: string;
    time: string;
    editar: boolean;
    image: string;
    Activo: number;
    Id_Usuario_Alta: number;
}

// Obtener las dimensiones de la pantalla
export const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const Recetas = () => {
    const [hasPermission, setHasPermission] = useState<boolean | null>(null); // Se mantiene por si se usa el escáner
    const [scanned, setScanned] = useState(false); // Se mantiene por si se usa el escáner
    const [recipes, setRecipes] = useState<CardData[]>([]);
    const [serverMessage, setServerMessage] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredRecipes, setFilteredRecipes] = useState<CardData[]>([]);
    const [userId, setUserId] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);

    // Tipado correcto para useNavigation
    const navigation = useNavigation<RecetasScreenNavigationProp>();

    // Función genérica para navegar a pantallas, ahora correctamente tipada
    const navigateToScreen = <T extends keyof RootStackParamList>(
        screen: T,
        params?: RootStackParamList[T]
    ) => {
        // La aserción 'as any' o 'as StackNavigationProp<RootStackParamList>'
        // permite que TypeScript no se queje por la sobrecarga compleja.
        // Es un "escape" controlado para situaciones como esta.
        (navigation.navigate as any)(screen, params);
    };

    useLayoutEffect(() => {
        navigation.setOptions({
            headerBackTitleVisible: false,
            headerTintColor: '#40632F',
            headerTitle: '',
            headerStyle: {
                height: SCREEN_HEIGHT * 0.15,
            },
            headerLeft: () => null, // Remove the back arrow
            headerRight: () => (
                <View style={sHead.headerButtonsContainer}>
                    <View style={sHead.naveAl}>
                        <Pressable onPress={() => navigateToScreen('Hoy')}>
                            <Image
                                source={require('../img/bHoy1.png')}
                                style={sHead.headerIcon}
                                onError={(e) => console.error('Error loading bHoy1.png:', e.nativeEvent.error)}
                            />
                        </Pressable>
                        <Pressable onPress={() => navigateToScreen('Plan')}>
                            <Image
                                source={require('../img/bPlan1.png')}
                                style={sHead.headerIcon}
                                onError={(e) => console.error('Error loading bPlan1.png:', e.nativeEvent.error)}
                            />
                        </Pressable>
                        <Pressable onPress={() => navigateToScreen('Recetas')}>
                            <Image
                                source={require('../img/bRecetas2.png')}
                                style={sHead.headerIcon}
                                onError={(e) => console.error('Error loading bRecetas2.png:', e.nativeEvent.error)}
                            />
                        </Pressable>
                        <Pressable onPress={() => navigateToScreen('Refri')}>
                            <Image
                                source={require('../img/bRefri1.png')}
                                style={sHead.headerIcon}
                                onError={(e) => console.error('Error loading bRefri1.png:', e.nativeEvent.error)}
                            />
                        </Pressable>
                        <Pressable onPress={() => navigateToScreen('Perfil')} style={sHead.headerIconEs}>
                            <Image
                                source={require('../img/bPerfil.png')}
                                style={sHead.headerIcon2}
                                onError={(e) => console.error('Error loading bPerfil.png:', e.nativeEvent.error)}
                            />
                        </Pressable>
                    </View>
                </View>
            ),
        });
    }, [navigation]);

    // Mover la solicitud de permisos de BarCodeScanner a useEffect
    useEffect(() => {
        (async () => {
            const { status } = await BarCodeScanner.requestPermissionsAsync();
            setHasPermission(status === 'granted');
        })();
    }, []); // Dependencia vacía para que se ejecute solo una vez al montar

    const datosReceta = async () => {
        setLoading(true);
        try {
            const currentUserString = await AsyncStorage.getItem('currentUser');
            if (!currentUserString) {
                setServerMessage('No hay un usuario logueado actualmente.');
                return;
            }
            const currentUser = JSON.parse(currentUserString);
            const currentUserId = currentUser.id;
            setUserId(currentUserId);

            if (isNaN(currentUserId)) {
                setServerMessage('ID de usuario inválido.');
                return;
            }

            const response = await axios.get(`${PUERTO}/recetaGeneral`);
            if (response.data) {
                const recData = response.data
                    .filter(
                        (receta: any) =>
                            receta.Activo > 0 && (receta.Id_Usuario_Alta === currentUserId || receta.Id_Usuario_Alta === 1)
                    )
                    .map((receta: any) => {
                        const isDefault = receta.Id_Usuario_Alta === 1;
                        const puedeEditar = !isDefault || currentUserId === 1;

                        return {
                            id: receta.Id_Receta || 0,
                            title: receta.Nombre || '',
                            portions: receta.Porciones || '',
                            calories: String(receta.Calorias || '0'),
                            time: String(receta.Tiempo || '0'),
                            image: receta.Imagen_receta ? `${PUERTO}${receta.Imagen_receta}` : 'https://via.placeholder.com/150/8CA966/FFFFFF?text=Sin+Imagen',
                            Activo: receta.Activo,
                            Id_Usuario_Alta: receta.Id_Usuario_Alta,
                            editar: puedeEditar,
                        };
                    });

                setRecipes(recData);
                console.log('Recetas obtenidas exitosamente');
            }
        } catch (error) {
            console.error('Error al obtener recetas', error);
            setServerMessage('No se pudo conectar con el servidor o ID de usuario inválido.');
        } finally {
            setLoading(false);
        }
    };

    const eliminarReceta = async (id: number) => {
        Alert.alert(
            "Confirmar eliminación",
            "¿Estás seguro de que quieres eliminar esta receta?",
            [
                {
                    text: "Cancelar",
                    style: "cancel"
                },
                {
                    text: "Eliminar",
                    onPress: async () => {
                        try {
                            const response = await axios.put(`${PUERTO}/recetaGeneral/${id}`);
                            if (response.status === 200) {
                                setServerMessage(`Receta eliminada exitosamente.`);
                                datosReceta();
                            } else {
                                setServerMessage('No se pudo eliminar la receta.');
                            }
                        } catch (error) {
                            console.error('Error al eliminar receta:', error);
                            setServerMessage('Ocurrió un error al intentar eliminar la receta.');
                        }
                    },
                    style: "destructive"
                }
            ]
        );
    };

    useEffect(() => {
        datosReceta();
    }, []);

    useEffect(() => {
        const filtered = recipes.filter((recipe) => {
            const title = recipe.title.toLowerCase();
            return (
                (title.includes(searchTerm.toLowerCase()) ||
                    recipe.calories.includes(searchTerm.toLowerCase()) ||
                    recipe.time.includes(searchTerm.toLowerCase())) &&
                recipe.Activo > 0
            );
        });
        setFilteredRecipes(filtered);
    }, [searchTerm, recipes]);

    const handleSearch = (value: string) => {
        setSearchTerm(value.toLowerCase());
    };

    useEffect(() => {
        if (serverMessage !== '') {
            const timer = setTimeout(() => setServerMessage(''), 5000);
            return () => clearTimeout(timer);
        }
    }, [serverMessage]);

    const addExpiredProduct = (data: {
        recipeName: string;
        ingredientInputs: string[];
        procedureInputs: string[];
        portions: string;
        type: string;
    }) => {
        console.log('New recipe added/submitted:', data);
        datosReceta();
    };

    // La función editExistingRecipe no se usa directamente para la navegación a EdReceta,
    // pero se mantiene si es parte de otra lógica de onSubmit para AgReceta
    const editExistingRecipe = (data: {
        recipeName: string;
        ingredientInputs: string[];
        procedureInputs: string[];
        portions: string;
        type: string;
    }, id: number) => {
        console.log(`Recipe edited (ID: ${id}):`, data);
        datosReceta();
    };

    const editar = (recipeId: number) => {
        // Navega a la pantalla EdReceta pasando el idReceta
        navigation.navigate('EdReceta', { idReceta: recipeId });
    };

    return (
        <View style={styles.container}>
            {serverMessage !== '' && (
                <Text style={styles.message}>{serverMessage}</Text>
            )}
            {loading && (
                <Text style={styles.loadingText}>Cargando recetas...</Text>
            )}
            <TextInput
                placeholder="Buscar receta..."
                placeholderTextColor="#8CA966"
                value={searchTerm}
                onChangeText={handleSearch}
                style={styles.searchInput}
            />
            <ScrollView style={styles.fullScreenBox} contentContainerStyle={styles.scrollContent}>
                {filteredRecipes.length === 0 ? (
                    <Text style={styles.noRecipesMessage}>No hay recetas para mostrar. ¡Añade una!</Text>
                ) : (
                    filteredRecipes.map((recipe, index) => (
                        <View key={recipe.id} style={styles.recipeCard}>
                            <Image
                                source={{ uri: recipe.image }}
                                style={styles.recipeImage}
                                onError={(e) => {
                                    console.error('Error loading recipe image for ID', recipe.id, ':', e.nativeEvent.error);
                                    // Puedes poner una imagen de fallback aquí si lo deseas
                                }}
                            />
                            <View style={styles.recipeDetails}>
                                <Text style={styles.recipeTitle}>{recipe.title}</Text>
                                <Text style={styles.recipeInfo}>Porciones: {recipe.portions}</Text>
                                <Text style={styles.recipeInfo}>Calorías: {recipe.calories}</Text>
                                <Text style={styles.recipeInfo}>Tiempo: {recipe.time} min</Text>
                            </View>
                            {recipe.editar && (
                                <View style={styles.recipeActions}>
                                    <TouchableOpacity
                                        onPress={() => editar(recipe.id)} // Llama a la función editar con el ID de la receta
                                        style={styles.actionButton}
                                    >
                                        <MaterialIcons name="edit" size={24} color="#4CAF50" />
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={() => eliminarReceta(recipe.id)}
                                        style={styles.actionButton}
                                    >
                                        <MaterialIcons name="delete" size={24} color="#E57373" />
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>
                    ))
                )}
            </ScrollView>

            <TouchableOpacity
                onPress={() => {
                    console.log('Pressed Add Recipe');
                    // Navega a AgReceta para agregar una nueva receta
                    // Asegúrate de que los parámetros de AgReceta sean los que esperas
                    navigation.navigate('AgReceta');
                }}
                style={styles.floatingAddButton}
            >
                <MaterialIcons name="add" size={30} color="#fff" />
            </TouchableOpacity>
        </View>
    );
};

// --- STYLESHEET ---
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F0F8F0',
        padding: 20,
        paddingTop: SCREEN_HEIGHT * 0.05,
    },
    message: {
        fontSize: 16,
        color: '#4CAF50',
        textAlign: 'center',
        marginBottom: 10,
        fontWeight: 'bold',
    },
    loadingText: {
        fontSize: 16,
        color: '#1976D2',
        textAlign: 'center',
        marginBottom: 10,
        fontWeight: 'bold',
    },
    searchInput: {
        backgroundColor: '#E8F5E9',
        borderColor: '#8CA966',
        borderWidth: 1,
        borderRadius: 25,
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
    fullScreenBox: {
        flex: 1,
        backgroundColor: '#CAE2B5',
        borderRadius: 15,
        borderWidth: 2,
        borderColor: '#8CA966',
        marginBottom: 20,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 10,
    },
    scrollContent: {
        padding: 15,
        paddingBottom: 20,
    },
    noRecipesMessage: {
        fontSize: 18,
        color: '#555',
        textAlign: 'center',
        marginTop: 50,
        fontStyle: 'italic',
    },
    recipeCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 15,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 6,
        borderLeftWidth: 6,
        borderColor: '#A8D8B6',
    },
    recipeImage: {
        width: 80,
        height: 80,
        borderRadius: 40,
        marginRight: 15,
        borderWidth: 2,
        borderColor: '#8CA966',
        resizeMode: 'cover',
    },
    recipeDetails: {
        flex: 1,
        justifyContent: 'center',
    },
    recipeTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#388E3C',
        marginBottom: 4,
    },
    recipeInfo: {
        fontSize: 14,
        color: '#66BB6A',
        marginBottom: 2,
    },
    recipeActions: {
        flexDirection: 'column',
        alignItems: 'center',
        marginLeft: 10,
    },
    actionButton: {
        padding: 5,
        marginTop: 5,
        borderRadius: 8,
    },
    floatingAddButton: {
        position: 'absolute',
        bottom: 30,
        right: 30,
        backgroundColor: '#4CAF50',
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
});

const sHead = StyleSheet.create({
    headerButtonsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        justifyContent: 'flex-end',
        paddingRight: 5,
    },
    naveAl: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        backgroundColor: '#8CA966',
        borderRadius: 25,
        paddingVertical: 5,
        paddingHorizontal: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.25,
        shadowRadius: 5,
        elevation: 6,
        width: '100%',
        height: SCREEN_HEIGHT * 0.08,
    },
    headerIcon: {
        width: 50,
        height: 50,
        marginHorizontal: 2,
        resizeMode: 'contain',
    },
    headerIcon2: {
        width: 50,
        height: 50,
        resizeMode: 'contain',
    },
    headerIconEs: {
        marginLeft: 2,
    },
});

export default Recetas;
