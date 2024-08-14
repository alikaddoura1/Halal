import * as React from 'react';
import { Text, View, TextInput, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, StatusBar, Modal, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFonts, BubblegumSans_400Regular } from '@expo-google-fonts/bubblegum-sans';
import * as SplashScreen from 'expo-splash-screen';

const HARAM_INGREDIENTS = [
  'pork',
  'gelatin',
  'alcohol',
  'lard',
  'carmine',
  'vanilla extract',
  'rennet',
  'pepsin',
  // Add more ingredients as needed
];

export default function Finder() {
  const [fontsLoaded] = useFonts({
    BubblegumSans_400Regular,
  });

  React.useEffect(() => {
    async function prepare() {
      await SplashScreen.preventAutoHideAsync();
    }
    prepare();
  }, []);

  React.useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  const [searchText, setSearchText] = React.useState('');
  const [filteredData, setFilteredData] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [productDetails, setProductDetails] = React.useState(null);
  const [modalVisible, setModalVisible] = React.useState(false);
  const [isFocused, setIsFocused] = React.useState(false);
  const [containsHaram, setContainsHaram] = React.useState(false);

  const handleSearch = async (text) => {
    setSearchText(text);
    if (text.trim()) {
      setLoading(true);
      try {
        const response = await fetch(`https://api.nal.usda.gov/fdc/v1/foods/search?query=${text}&dataType=Branded&pageSize=10&api_key=aKojxpzuUPIpEV6rYUaUpK5I3oACBArkdacsc6Es`);
        const data = await response.json();

        const items = data.foods.map(item => ({
          name: item.description,
          id: item.fdcId,  // Use FDC ID to get more details
        })).filter(item => item.name);

        setFilteredData(items);
      } catch (error) {
        console.error("Error fetching data from USDA API", error.message);
      } finally {
        setLoading(false);
      }
    } else {
      setFilteredData([]);
    }
  };

  const handleProductSelect = async (product) => {
    Keyboard.dismiss();
    setLoading(true);
    try {
      const response = await fetch(`https://api.nal.usda.gov/fdc/v1/food/${product.id}?api_key=aKojxpzuUPIpEV6rYUaUpK5I3oACBArkdacsc6Es`);
      const data = await response.json();

      if (response.ok) {
        const { highlightedIngredients, hasHaram } = highlightHaramIngredients(data.ingredients);
        setProductDetails({ ...data, highlightedIngredients });
        setContainsHaram(hasHaram);
        setModalVisible(true);
      } else {
        console.error("Failed to fetch product details:", response.status, response.statusText);
      }
    } catch (error) {
      console.error("Error fetching product details from USDA API", error.message);
    } finally {
      setLoading(false);
    }
  };

  const highlightHaramIngredients = (ingredientsText) => {
    const ingredients = ingredientsText.split(/,|\s*;\s*/);
    let hasHaram = false;

    const highlightedIngredients = ingredients.map((ingredient, index) => {
      const lowerCaseIngredient = ingredient.trim().toLowerCase();
      const isHaram = HARAM_INGREDIENTS.some(haramItem => lowerCaseIngredient.includes(haramItem));
      if (isHaram) {
        hasHaram = true;
      }
      return (
        <Text key={index} style={isHaram ? styles.haramIngredient : styles.normalIngredient}>
          {ingredient.trim()}{index < ingredients.length - 1 ? ', ' : ''}
        </Text>
      );
    });

    return { highlightedIngredients, hasHaram };
  };

  const renderSuggestion = ({ item }) => {
    const regex = new RegExp(`(${searchText})`, 'gi');
    const suggestionParts = item.name.split(regex);

    return (
      <View style={styles.suggestionItem}>
        <View style={{ flex: 1 }}>
          <Text style={styles.suggestionText}>
            {suggestionParts.map((part, index) =>
              part.toLowerCase() === searchText.toLowerCase() ? (
                <Text key={index} style={{ fontWeight: 'bold' }}>{part}</Text>
              ) : (
                <Text key={index}>{part}</Text>
              )
            )}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.viewButton}
          onPress={() => handleProductSelect(item)}
        >
          <Text style={styles.viewButtonText}>View</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const handleBlur = () => {
    if (!isFocused) {
      setFilteredData([]);
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleOutsidePress = () => {
    setIsFocused(false);
    setFilteredData([]);
    Keyboard.dismiss();
  };

  if (!fontsLoaded) {
    return null;
  }

  return (
    <TouchableWithoutFeedback onPress={handleOutsidePress}>
      <LinearGradient colors={['#6DD5FA', '#FFFFFF']} style={styles.container}>
        <StatusBar backgroundColor="#6DD5FA" barStyle="dark-content" />

        <View style={styles.searchContainer}>
          <FontAwesome name="search" size={20} color="purple" style={styles.searchIcon} />
          <TextInput
            placeholder="Search"
            placeholderTextColor="gray"
            value={searchText}
            onFocus={handleFocus}
            onChangeText={text => handleSearch(text)}
            onBlur={handleBlur}
            style={styles.searchInput}
          />
        </View>

        {loading && <ActivityIndicator size="large" color="#0000ff" style={{ marginTop: 20 }} />}

        {filteredData.length > 0 && (
          <FlatList
            data={filteredData}
            renderItem={renderSuggestion}
            keyExtractor={(item, index) => index.toString()}
            style={styles.suggestionsContainer}
          />
        )}

        <View style={styles.titleContainer}>
          <Text style={styles.titleHalal}>Halal</Text>
          <Text style={styles.titleCheck}>Check</Text>
        </View>

        <Modal
          visible={modalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            {productDetails ? (
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>{productDetails.description}</Text>
                {containsHaram ? (
                  <View style={styles.statusContainer}>
                    <Text style={styles.haramStatus}>Haram</Text>
                    <FontAwesome name="times-circle" size={24} color="red" />
                  </View>
                ) : (
                  <View style={styles.statusContainer}>
                    <Text style={styles.halalStatus}>Halal</Text>
                    <FontAwesome name="check-circle" size={24} color="green" />
                  </View>
                )}
                <Text style={styles.modalSubtitle}>Ingredients:</Text>
                <Text style={styles.modalText}>
                  {productDetails.ingredients
                    ? productDetails.highlightedIngredients
                    : 'No ingredients available'}
                </Text>
                <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
                  <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <ActivityIndicator size="large" color="#0000ff" />
            )}
          </View>
        </Modal>
      </LinearGradient>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 30,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 25,
    width: '90%',
    height: 50,
    marginBottom: 20,
    paddingHorizontal: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  titleContainer: {
    alignItems: 'center',
    marginTop: 'auto',
    marginBottom: 'auto',
  },
  titleHalal: {
    fontSize: 100,
    color: 'blue',
    fontFamily: 'BubblegumSans_400Regular',
  },
  titleCheck: {
    fontSize: 60,
    color: 'white',
    marginTop: -10,
    fontFamily: 'BubblegumSans_400Regular',
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    color: 'black',
    fontSize: 18,
  },
  suggestionsContainer: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    position: 'absolute',
    top: 100,
    zIndex: 1,
    maxHeight: 200,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  suggestionText: {
    fontSize: 16,
    color: '#333',
  },
  viewButton: {
    backgroundColor: '#B3DDF2',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  viewButtonText: {
    color: '#000',
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 25,
    width: '85%',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
    color: '#666',
  },
  modalText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  closeButton: {
    backgroundColor: '#6DD5FA',
    padding: 10,
    borderRadius: 10,
  },
  closeButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
  haramIngredient: {
    color: 'red',
    fontWeight: 'bold',
  },
  normalIngredient: {
    color: 'black',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  halalStatus: {
    color: 'green',
    fontSize: 20,
    fontWeight: 'bold',
    marginRight: 10,
  },
  haramStatus: {
    color: 'red',
    fontSize: 20,
    fontWeight: 'bold',
    marginRight: 10,
  },
});