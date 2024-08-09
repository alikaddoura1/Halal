import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { useState, useRef } from 'react';
import { Button, StyleSheet, Text, TouchableOpacity, View, SafeAreaView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Entypo from '@expo/vector-icons/Entypo';


export default function Camera() {
    const [facing, setFacing] = useState('back');
    const [permission, requestPermission] = useCameraPermissions();
    const [image, setImage] = useState(null);
    const cameraRef = useRef(null);
  
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
      } else {
        console.log("didnt work")
      }
      
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
  });

