import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { useState, useRef } from 'react';
import { Button, StyleSheet, Text, TouchableOpacity, View, SafeAreaView, Modal } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Entypo from '@expo/vector-icons/Entypo';


export default function Camera() {
    const [facing, setFacing] = useState('back');
    const [permission, requestPermission] = useCameraPermissions();
    const [image, setImage] = useState(null);
    const cameraRef = useRef(null);

    // Pop-Up related consts
    const [popupVisible, setPopupVisible] = useState(false); 
    const [isSuccess, setIsSuccess] = useState(true);
    const [haramIngredient, setHaramIngredient] = useState('');


    
  
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
        console.log(" worked")

        const randomOutcome = Math.random() > 0.5;
        let foundHaramIngredient;

        if (randomOutcome) {
          foundHaramIngredient = 'Gelatin';
        } else {
          foundHaramIngredient = null;
        }

        if (foundHaramIngredient) {
          setIsSuccess(false);
          setHaramIngredient(foundHaramIngredient);
        } else {
          setIsSuccess(true);
          setHaramIngredient('');
        }

        setPopupVisible(true);
      } else {
        console.log("didnt work")
      }
    }

    function closePopup() {
      setPopupVisible(false);
    }
  
    return (
      <View style={styles.container}>
        <CameraView style={styles.camera} facing={facing} ref = {cameraRef}>
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button} onPress={toggleCameraFacing}>
              <MaterialCommunityIcons name='camera-flip-outline' color="white" size={40}/>
            </TouchableOpacity>
          </View>

          <View style = {styles.captureContainer}>
            <TouchableOpacity style={styles.button} onPress={takePicture}>
              <Entypo name='circle' color="white" size={100}/>
            </TouchableOpacity>
          </View>
          
        </CameraView>

        <Modal
        animationType="fade"
        transparent={true}
        visible={popupVisible}
        onRequestClose={closePopup}
      >
        <View style={styles.popupOverlay}>
          <View style={styles.popup}>
            {/* 'X' Button to Close Popup */}
            <TouchableOpacity style={styles.closeButton} onPress={closePopup}>
              <Entypo name="cross" size={30} color="black" />
            </TouchableOpacity>

            {/* Conditional rendering based on success or failure */}
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
  });