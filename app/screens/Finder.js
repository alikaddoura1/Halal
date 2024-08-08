import * as React from 'react';
import { Text, View, TextInput, StyleSheet } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';  // Ensure this is installed

export default function Finder() {
  const [searchText, setSearchText] = React.useState('');

  const handleFocus = () => {
    setSearchText('');  // Clear the text when the input is focused
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <FontAwesome name="search" size={20} color="purple" style={styles.searchIcon} />
        <TextInput
          placeholder="Search"
          placeholderTextColor="gray"  // Ensures the placeholder is visible in gray
          value={searchText}
          onFocus={handleFocus}  // Clears the text when input is focused
          onChangeText={text => setSearchText(text)}
          style={styles.searchInput}
        />
      </View>
      <Text>Home!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',  // Align items to the top
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingTop: 40,  // Adjusted to move the search bar further to the top
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 25,
    width: '90%',
    height: 40,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    color: 'black',  // Sets the font color to black
  },
});