import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Launch, Launchpad } from '../types/api';
import { LaunchListScreen } from '../screens/LaunchListScreen';
import { LaunchDetailScreen } from '../screens/LaunchDetailScreen';
import { MapScreen } from '../screens/MapScreen';

export type RootStackParamList = {
  LaunchList: undefined;
  LaunchDetail: { launch: Launch };
  Map: { launchpad: Launchpad };
};

const Stack = createStackNavigator<RootStackParamList>();

export const AppNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="LaunchList"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#007AFF',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen
          name="LaunchList"
          component={LaunchListScreen}
          options={{
            title: 'SpaceX Launches',
          }}
        />
        <Stack.Screen
          name="LaunchDetail"
          component={LaunchDetailScreen}
          options={{
            title: 'Launch Details',
          }}
        />
        <Stack.Screen
          name="Map"
          component={MapScreen}
          options={{
            title: 'Launch Site',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};