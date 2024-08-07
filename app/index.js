import * as React from 'react';
import { Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
const Tab = createBottomTabNavigator();

import Finder from './Finder';
import Camera from './Camera';

export default function App() {
  return (
    
      <Tab.Navigator>
        <Tab.Screen name="Finder" component={Finder} />
        <Tab.Screen name="Camera" component={Camera} />
      </Tab.Navigator>
    
  );
}