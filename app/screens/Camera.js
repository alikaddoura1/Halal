import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { useState, useRef } from 'react';
import { Button, StyleSheet, Text, TouchableOpacity, View, SafeAreaView, Modal, Image, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Entypo from '@expo/vector-icons/Entypo';
import axios from 'axios';
import { GOOGLE_VISION_API_KEY } from '@env';

const VISION_API_URL = `https://vision.googleapis.com/v1/images:annotate?key=${GOOGLE_VISION_API_KEY}`;

const haramIngredients = [
  "gelatin",
  "lard",
  "pork",
  "alcohol",
  "vanilla extract",
  "casein",
  "rennet",
  "carmine ",
  "tallow",
  "anchovy paste",
  "shellfish",
  "certain emulsifiers",
];

export default function Camera() {
  const [facing, setFacing] = useState('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [image, setImage] = useState(null);
  const [confirmingImage, setConfirmingImage] = useState(false);
  const [popupVisible, setPopupVisible] = useState(false); 
  const [isSuccess, setIsSuccess] = useState(true);
  const [haramIngredient, setHaramIngredient] = useState('');
  const [loading, setLoading] = useState(false);
  const cameraRef = useRef(null);
  const [extractedText, setExtractedText] = useState('');

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.message}>We need your permission to show the camera</Text>
        <Button onPress={requestPermission} title="grant permission" />
      </SafeAreaView>
    );
  }

  function toggleCameraFacing() {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  }

  async function takePicture() {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync();
      setImage(photo.uri);
      console.log(photo.uri);
      setConfirmingImage(true);
    } else {
      console.log("didn't work");
    }
  }

  async function analyzeImage(uri) {
    setLoading(true);
    const response = await fetch(uri);
    const blob = await response.blob();
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onloadend = async () => {
      const base64data = reader.result.split(',')[1];

      try {
        const result = await axios.post(VISION_API_URL, {
          requests: [
            {
              image: {
                content: base64data,
              },
              features: [
                {
                  type: 'TEXT_DETECTION',
                },
              ],
            },
          ],
        });

        const detectedText = result.data.responses[0].fullTextAnnotation.text;
        console.log('Detected text:', detectedText);
        setExtractedText(detectedText);
        checkForHaramIngredients(detectedText);
      } catch (error) {
        console.error('Error analyzing image:', error);
      } finally {
        setLoading(false);
      }
    };
  }

  function checkForHaramIngredients(text) {
    const foundHaramIngredients = haramIngredients.filter(ingredient => text.toLowerCase().includes(ingredient.toLowerCase()));
    
    if (foundHaramIngredients.length > 0) {
      setIsSuccess(false);
      setHaramIngredient(foundHaramIngredients[0]); 
    } else {
      setIsSuccess(true);
      setHaramIngredient('');
    }

    setPopupVisible(true);
  }

  function acceptPicture() {
    setConfirmingImage(false);
    analyzeImage(image); // Process the image after confirmation
  }

  function retakePicture() {
    setImage(null);
    setConfirmingImage(false);
    setPopupVisible(false); 
  }

  function closePopup() {
    setPopupVisible(false);
  }

  return (
    <View style={styles.container}>
      {!confirmingImage ? (
        <CameraView style={styles.camera} facing={facing} ref={cameraRef}>
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button} onPress={toggleCameraFacing}>
              <MaterialCommunityIcons name='camera-flip-outline' color="white" size={40}/>
            </TouchableOpacity>
          </View>

          <View style={styles.captureContainer}>
            <TouchableOpacity style={styles.button} onPress={takePicture}>
              <Entypo name='circle' color="white" size={100}/>
            </TouchableOpacity>
          </View>
        </CameraView>
      ) : (
        <View style={styles.confirmationContainer}>
          <Image source={{ uri: image }} style={styles.capturedImage} />
          <View style={styles.confirmationButtons}>
            <TouchableOpacity style={styles.circleButton} onPress={retakePicture}>
              <Entypo name="cross" size={35} color="white" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.circleButton} onPress={acceptPicture}>
              <MaterialCommunityIcons name="check-bold" size={30} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#ffffff" />
          <Text style={styles.loadingText}>Analyzing...</Text>
        </View>
      )}

      <Modal
        animationType="fade"
        transparent={true}
        visible={popupVisible}
        onRequestClose={closePopup}
      >
        <View style={styles.popupOverlay}>
          <View style={styles.popup}>
            <TouchableOpacity style={styles.closeButton} onPress={closePopup}>
              <Entypo name="cross" size={30} color="black" />
            </TouchableOpacity>

            {isSuccess ? (
              <View style={styles.iconContainer}>
                <View style={styles.successIcon}>
                  <MaterialCommunityIcons name="check" size={50} color="white" />
                </View>
                <Text style={styles.popupText}>Halal</Text>
                <Text style={styles.popupSubText}>No Haram ingredients were found</Text>
              </View>
            ) : (
              <View style={styles.iconContainer}>
                <View style={styles.failureIcon}>
                  <Entypo name="cross" size={50} color="white" />
                </View>
                <Text style={styles.popupText}>Haram</Text>
                <Text style={styles.popupSubText}>{haramIngredient} was found making this food item Haram</Text>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  captureContainer: {
    position: "absolute",
    top: 575,
    right: 150,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  message: {
    textAlign: 'center',
    paddingBottom: 10,
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    position: 'absolute',
    top: 20,
    right: 20,
  },
  button: {
    alignItems: 'center',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  popupOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  popup: {
    width: 300,
    height: 200,
    backgroundColor: 'white',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  successIcon: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'green',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  failureIcon: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'red',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  popupText: {
    fontSize: 20,
  },
  popupSubText: {
    fontSize: 12,
    marginTop: 10,
    textAlign: 'center',
  },  
  confirmationContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  capturedImage: {
    width: '100%',
    height: '90%',
  },
  confirmationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '80%', // Adjusted width to make the box shorter
    paddingVertical: 10, // Adjusted padding to reduce height
  },
  circleButton: {
    backgroundColor: '#9c85a1', // Button color
    width: 60,
    height: 60,
    borderRadius: 30, // Makes the button circular
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  loadingText: {
    marginTop: 10,
    color: '#ffffff',
    fontSize: 18,
  },
});
