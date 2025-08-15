import * as Location from 'expo-location';
import * as Linking from 'expo-linking';
import { Alert, Platform } from 'react-native';
import { UserLocation } from '../types/api';

export async function requestLocationPermission(): Promise<boolean> {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('Error requesting location permission:', error);
    return false;
  }
}

export async function getCurrentLocation(): Promise<UserLocation | null> {
  try {
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) {
      return null;
    }

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    };
  } catch (error) {
    console.error('Error getting current location:', error);
    return null;
  }
}

export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return d;
}

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}

export function openNativeMaps(latitude: number, longitude: number, label: string) {
  const scheme = Platform.select({ ios: 'maps:', android: 'geo:' });
  const latLng = `${latitude},${longitude}`;
  const url = Platform.select({
    ios: `${scheme}${latLng}?q=${label}`,
    android: `${scheme}${latLng}?q=${latLng}(${label})`,
  });

  Linking.canOpenURL(url!).then((supported) => {
    if (supported) {
      return Linking.openURL(url!);
    } else {
      Alert.alert(
        'Error',
        'Unable to open maps application',
        [{ text: 'OK' }]
      );
    }
  });
}

export function showLocationPermissionAlert() {
  Alert.alert(
    'Location Permission Required',
    'This app needs location access to show your distance from launch sites and provide directions.',
    [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Open Settings', onPress: () => Linking.openSettings() },
    ]
  );
}