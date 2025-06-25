import React, { useState, useEffect } from "react";
import { View, StyleSheet, FlatList, TouchableOpacity, Text } from "react-native";
import { TextInput } from "react-native-paper";

type Opcion = { label: string; value: string };

interface Props {
  options: Opcion[];
  onSelect: (value: string) => void;
  defaultValue?: string;
}

export const AutocompleteSelect = ({ options, onSelect, defaultValue}: Props) => {
  const [query, setQuery] = useState(defaultValue || "");
  const [showList, setShowList] = useState(false);

  useEffect(() => {
  if (defaultValue !== undefined && defaultValue !== null && defaultValue !== query) {
    setQuery(defaultValue);
    onSelect(defaultValue); // <-- KEY CHANGE: Immediately trigger onSelect
    setShowList(true); // Show the list
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
    setShowList(false);
    onSelect(item);
  };

  return (
    <View style={{ marginBottom: 16 }}>
      <TextInput
        label="Buscar o escribir alimento"
        value={query}
        onChangeText={(text) => {
          setQuery(text);
          setShowList(true);
        }}
        onFocus={() => setShowList(true)}
        mode="outlined"
      />

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
                onPress={() => handleSelect(query)}
              >
                <Text>➕ Usar "{query}" (Nuevo Alimento)</Text>
              </TouchableOpacity>
            ) : null // Render null if the condition is false
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  dropdown: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    maxHeight: 150,
    backgroundColor: "#fff",
    zIndex: 10,
    position: "absolute",
    width: "100%",
    top: 65,
  },
  item: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
});
