import * as React from 'react';
import { Text, View, TextInput, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';  // Ensure this is installed

export default function Finder() {
  const [searchText, setSearchText] = React.useState('');
  const [filteredData, setFilteredData] = React.useState([]);
  
  const data = [
    'Rice Crispies',
    'Rice Cakes',
    'Ricotta Cheese',
    'Rice Pudding',
    'Rich Tea Biscuits',
    'Riced Cauliflower',
    // Add more items here
  ];

  const handleSearch = (text) => {
    setSearchText(text);
    if (text) {
      const filtered = data.filter(item =>
        item.toLowerCase().startsWith(text.toLowerCase())
      );
      setFilteredData(filtered);
    } else {
      setFilteredData([]);
    }
  };

  const renderSuggestion = ({ item }) => (
    <TouchableOpacity onPress={() => setSearchText(item)}>
      <Text style={styles.suggestionItem}>{item}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <FontAwesome name="search" size={20} color="purple" style={styles.searchIcon} />
        <TextInput
          placeholder="Search"
          placeholderTextColor="gray"
          value={searchText}
          onFocus={() => setSearchText('')}
          onChangeText={text => handleSearch(text)}
          style={styles.searchInput}
        />
      </View>
      
      {filteredData.length > 0 && (
        <FlatList
          data={filteredData}
          renderItem={renderSuggestion}
          keyExtractor={(item) => item}
          style={styles.suggestionsContainer}
        />
      )}
      
      <Text>Home!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingTop: 40,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 25,
    width: '90%',
    height: 40,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    color: 'black',
  },
  suggestionsContainer: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 10,
    marginTop: 5,
    padding: 10,
  },
  suggestionItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
});