import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import { Provider as PaperProvider } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Finder from './screens/Finder';
import Camera from './screens/Camera';



const Tab = createMaterialBottomTabNavigator();

export default function App() {
  return (
    <Tab.Navigator
      initialRouteName="Finder"
      activeColor="#000000"
      inactiveColor="#3e2465"
      barStyle={{
        backgroundColor: "#ffffff" ,
        overflow: 'hidden',
        margin: 0,
        height: 50, // Adjust the height here
  
        paddingTop: 5, // Adjust the padding here
      }}
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color }) => {
          let iconName;

          if (route.name === 'Finder') {
            iconName = 'magnify';
          } else if (route.name === 'Camera') {
            iconName = 'camera';
          }

          return <MaterialCommunityIcons name={iconName} color={color} size={30} />;
        },
      })}
    >
      <Tab.Screen name="Finder" component={Finder} />
      <Tab.Screen name="Camera" component={Camera} />
    </Tab.Navigator>
  );
}
