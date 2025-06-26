import React, { useState, useEffect } from "react";
import { View, StyleSheet, FlatList, TouchableOpacity, Text } from "react-native";
import { TextInput } from "react-native-paper";

type Opcion = { label: string; value: string };

interface Props {
  options: Opcion[];
  onSelect: (value: string) => void;
  defaultValue?: string;
}

export const AutocompleteSelect = ({ options, onSelect, defaultValue }: Props) => {
  // Initialize query with defaultValue.
  // It's important that this is the only place defaultValue sets query on mount.
  const [query, setQuery] = useState(defaultValue || "");
  const [showList, setShowList] = useState(false);

  // This useEffect ensures that if the parent passes a new defaultValue,
  // the input reflects it. It specifically DOES NOT call onSelect or setShowList(true).
  // onSelect should only be called by user interaction.
  useEffect(() => {
    if (defaultValue !== undefined && defaultValue !== null && defaultValue !== query) {
      setQuery(defaultValue);
      // Removed: onSelect(defaultValue); <--- THIS WAS THE PROBLEM FOR EDIT MODAL
      // Removed: setShowList(true);     <--- THIS WAS THE PROBLEM FOR DROPDOWN ON OPEN
    } else if (defaultValue === null || defaultValue === undefined) {
      setQuery("");
      setShowList(false);
    }
  }, [defaultValue]);

  const filtered = options.filter((item) =>
    item.label.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (item: string) => {
    setQuery(item);
    setShowList(false); // Hide list immediately on selection
    onSelect(item); // Call the parent's onSelect callback
  };

  return (
    <View style={{ marginBottom: 16 }}>
      <TextInput
        label="Buscar o escribir alimento"
        value={query}
        onChangeText={(text) => {
          setQuery(text);
          setShowList(true); // Show list as soon as user starts typing
        }}
        onFocus={() => setShowList(true)} // Show list when input is focused
        // Delay hiding to allow touch events on list items.
        // This is important for "tap and select" functionality.
        onBlur={() => setTimeout(() => setShowList(false), 200)}
        mode="outlined"
        style={styles.input} // Ensure custom input style is applied
      />

      {/* Only show the list if showList is true AND there's a query */}
      {showList && query.length > 0 && (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.value}
          style={styles.dropdown}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.item}
              onPress={() => handleSelect(item.value)}
            >
              <Text>{item.label}</Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            // Check if there's no exact match and render the "Add New" component
            !options.some(opt => opt.label.toLowerCase().trim() === query.toLowerCase().trim()) ? (
              <TouchableOpacity
                style={styles.item}
                onPress={() => handleSelect(query)} // Selects the user-typed query as a new item
              >
                <Text>➕ Usar "{query}" (Nuevo Alimento)</Text>
              </TouchableOpacity>
            ) : null // Render null if the condition is false
          }
          keyboardShouldPersistTaps="always" // CRITICAL: Ensures taps on list items are registered
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  input: {
    backgroundColor: 'white', // Ensure background is white for visibility
    marginBottom: 16,
    fontSize: 16,
    color: '#333',
    minHeight: 56, // Standard height for react-native-paper TextInput in outlined mode
  },
  dropdown: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    maxHeight: 150,
    backgroundColor: "#fff",
    zIndex: 1000, // Higher zIndex to ensure it's on top
    position: "absolute",
    width: "100%",
    top: 56, // Adjusted to sit right below the TextInput (assuming minHeight 56)
    elevation: 3, // Android shadow
    shadowColor: '#000', // iOS shadow
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
