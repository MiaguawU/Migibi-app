import React, { useState, useEffect } from "react";
import { View, StyleSheet, FlatList, TouchableOpacity, Text } from "react-native";
import { TextInput } from "react-native-paper";

// Opcion ahora puede incluir propiedades adicionales si es necesario pasarlas al seleccionar
interface AutocompleteOpcion {
  label: string;
  value: string;
  Id_Alimento: number; // ID del alimento en el catálogo
  Es_Perecedero: number; // Indica si el alimento es perecedero (0 o 1)
  Id_Tipo_Alimento?: number; // ID del tipo de alimento en el catálogo
  Id_Unidad_Medida?: number; // ID de la unidad de medida en el catálogo
  ImagenURL?: string; // URL de la imagen del alimento en el catálogo
}

interface Props {
  options: AutocompleteOpcion[]; // Las opciones ahora pueden tener más detalles
  onSelect: (value: string) => void;
  defaultValue?: string;
}

export const AutocompleteSelect = ({ options, onSelect, defaultValue }: Props) => {
  const [query, setQuery] = useState(defaultValue || "");
  const [showList, setShowList] = useState(false);

  useEffect(() => {
    // Este efecto solo inicializa el 'query' interno cuando 'defaultValue' cambia.
    // Es crucial que NO llame a 'onSelect' aquí para evitar disparar la lógica de "nuevo alimento"
    // cuando el modal de edición simplemente se abre con un valor preexistente.
    // TAMPOCO abre la lista automáticamente.
    if (defaultValue !== undefined && defaultValue !== null && defaultValue !== query) {
      setQuery(defaultValue);
      // No llamar onSelect(defaultValue) aquí.
      // No poner setShowList(true) aquí.
    } else if (defaultValue === null || defaultValue === undefined) {
      setQuery("");
      setShowList(false);
    }
  }, [defaultValue]);

  const filtered = options.filter((item) =>
    item.label.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (itemValue: string) => {
    setQuery(itemValue);
    setShowList(false); // Ocultar la lista inmediatamente al seleccionar
    onSelect(itemValue); // Llamar al callback del padre con el valor seleccionado
  };

  const renderItem = ({ item }: { item: AutocompleteOpcion }) => (
    <TouchableOpacity
      style={styles.item}
      onPress={() => handleSelect(item.value)}
    >
      <Text>{item.label}</Text>
    </TouchableOpacity>
  );

  const renderListEmptyComponent = () => {
    // Mostrar la opción "Añadir Nuevo" solo si la consulta no está vacía
    // y no hay una coincidencia exacta en las opciones existentes.
    if (query.trim().length > 0 && !options.some(opt => opt.label.toLowerCase().trim() === query.toLowerCase().trim())) {
      return (
        <TouchableOpacity
          style={styles.item}
          onPress={() => handleSelect(query)} // Permite seleccionar el texto tecleado como un nuevo alimento
        >
          <Text>➕ Usar "{query}" (Nuevo Alimento)</Text>
        </TouchableOpacity>
      );
    }
    return null;
  };

  return (
    <View style={{ marginBottom: 16 }}>
      <TextInput
        label="Buscar o escribir alimento"
        value={query}
        onChangeText={(text) => {
          setQuery(text);
          setShowList(true); // Mostrar la lista tan pronto como el usuario empieza a escribir
        }}
        onFocus={() => setShowList(true)} // Mostrar la lista cuando el input gana foco
        // Retrasar el ocultamiento para permitir que los eventos de toque en los ítems de la lista se registren
        onBlur={() => setTimeout(() => setShowList(false), 200)}
        mode="outlined"
        style={styles.input}
      />

      {/* Mostrar la lista solo si 'showList' es verdadero y hay algo en el 'query' */}
      {showList && query.length > 0 && (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.value}
          style={styles.dropdown}
          renderItem={renderItem}
          ListEmptyComponent={renderListEmptyComponent}
          keyboardShouldPersistTaps="always" // CRÍTICO: Permite los toques en los ítems de la lista sin cerrar el teclado
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  input: {
    backgroundColor: 'white',
    marginBottom: 16,
    fontSize: 16,
    color: '#333',
    minHeight: 56,
  },
  dropdown: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    maxHeight: 150,
    backgroundColor: "#fff",
    zIndex: 1000,
    position: "absolute",
    width: "100%",
    top: 56,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  item: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
});
