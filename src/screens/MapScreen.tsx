import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, Region, PROVIDER_GOOGLE } from 'react-native-maps';
import { Launchpad, UserLocation } from '../types/api';
import {
  getCurrentLocation,
  calculateDistance,
  openNativeMaps,
  showLocationPermissionAlert,
} from '../utils/permissions';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { logger } from '../utils/logger';

interface Props {
  navigation: any;
  route: {
    params: {
      launchpad: Launchpad;
    };
  };
}

export const MapScreen: React.FC<Props> = ({ navigation, route }) => {
  const { launchpad } = route.params;
  const mapRef = useRef<MapView>(null);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [loading, setLoading] = useState(true);
  const [mapReady, setMapReady] = useState(false);
  const [distance, setDistance] = useState<number | null>(null);
  const [locationPermissionDenied, setLocationPermissionDenied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    navigation.setOptions({
      title: launchpad.name,
    });
  }, [navigation, launchpad.name]);

  useEffect(() => {
    const loadUserLocation = async () => {
      try {
        console.log('Starting to load user location...');
        setLoading(true);
        setError(null);
        
        const location = await getCurrentLocation();
        console.log('Location result:', location);
        
        if (location) {
          setUserLocation(location);
          const dist = calculateDistance(
            location.latitude,
            location.longitude,
            launchpad.latitude,
            launchpad.longitude
          );
          setDistance(dist);
          setLocationPermissionDenied(false);
          logger.info('User location obtained', { location, distance: dist });
          console.log('Distance calculated:', dist);
        } else {
          setLocationPermissionDenied(true);
          logger.warn('Location permission denied or unavailable');
          console.log('Location permission denied');
        }
      } catch (error) {
        console.error('Error loading location:', error);
        logger.error('Failed to get user location', error);
        setLocationPermissionDenied(true);
        setError('Failed to load location');
      } finally {
        setLoading(false);
      }
    };

    loadUserLocation();
  }, [launchpad.latitude, launchpad.longitude]);

  const handleGetDirections = () => {
    console.log('Opening directions for:', launchpad.full_name);
    openNativeMaps(launchpad.latitude, launchpad.longitude, launchpad.full_name);
  };

  const handleRequestLocation = () => {
    showLocationPermissionAlert();
  };

  const handleFitToCoordinates = () => {
    if (!mapRef.current || !mapReady) {
      console.log('Map not ready or ref not available');
      return;
    }

    const coordinates = [
      {
        latitude: launchpad.latitude,
        longitude: launchpad.longitude,
      },
    ];

    if (userLocation) {
      coordinates.push({
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
      });
    }

    console.log('Fitting to coordinates:', coordinates);

    mapRef.current.fitToCoordinates(coordinates, {
      edgePadding: {
        top: 50,
        right: 50,
        bottom: 50,
        left: 50,
      },
      animated: true,
    });
  };

  const handleMapReady = () => {
    console.log('Map is ready!');
    setMapReady(true);
  };

  const handleRegionChangeComplete = (region: Region) => {
    console.log('Region changed:', region);
  };

  useEffect(() => {
    if (mapReady && !loading) {
      // Delay to ensure map is fully rendered
      const timer = setTimeout(() => {
        handleFitToCoordinates();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [mapReady, loading, userLocation]);

  // Create initial region with fallback values
  const initialRegion: Region = {
    latitude: launchpad?.latitude || 28.5618571, // Cape Canaveral as fallback
    longitude: launchpad?.longitude || -80.577366,
    latitudeDelta: userLocation ? 1.0 : 0.1,
    longitudeDelta: userLocation ? 1.0 : 0.1,
  };

  console.log('Rendering MapScreen with:', {
    loading,
    mapReady,
    launchpad: launchpad?.name,
    userLocation,
    distance,
    initialRegion
  });

  if (loading) {
    return <LoadingSpinner message="Loading map..." />;
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => {
              setError(null);
              setLoading(true);
            }}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Debug Info - Remove in production */}
      {__DEV__ && (
        <View style={styles.debugContainer}>
          <Text style={styles.debugText}>
            Map Ready: {mapReady ? '✓' : '✗'} | 
            Lat: {launchpad.latitude.toFixed(4)} | 
            Lng: {launchpad.longitude.toFixed(4)}
          </Text>
        </View>
      )}

      <MapView
        ref={mapRef}
        style={styles.map}
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
        initialRegion={initialRegion}
        showsUserLocation={!!userLocation}
        showsMyLocationButton={true}
        showsCompass={true}
        showsScale={true}
        onMapReady={handleMapReady}
        onRegionChangeComplete={handleRegionChangeComplete}
        mapType="satellite"
        pitchEnabled={true}
        rotateEnabled={true}
        scrollEnabled={true}
        zoomEnabled={true}
      >
        {/* Launchpad Marker */}
        <Marker
          coordinate={{
            latitude: launchpad.latitude,
            longitude: launchpad.longitude,
          }}
          title={launchpad.full_name}
          description={`${launchpad.locality}, ${launchpad.region}`}
          pinColor="#FF6B6B"
          identifier="launchpad"
        />

        {/* User Location Marker */}
        {userLocation && (
          <Marker
            coordinate={{
              latitude: userLocation.latitude,
              longitude: userLocation.longitude,
            }}
            title="Your Location"
            pinColor="#007AFF"
            identifier="user-location"
          />
        )}
      </MapView>

      {/* Map Controls */}
      <View style={styles.controlsContainer}>
        {distance && (
          <View style={styles.distanceContainer}>
            <Text style={styles.distanceText}>
              📍 {distance.toFixed(1)} km away
            </Text>
          </View>
        )}

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleFitToCoordinates}
            disabled={!mapReady}
          >
            <Text style={[
              styles.secondaryButtonText,
              !mapReady && styles.disabledButtonText
            ]}>
              🎯 Center Map
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleGetDirections}
          >
            <Text style={styles.primaryButtonText}>🧭 Get Directions</Text>
          </TouchableOpacity>
        </View>

        {locationPermissionDenied && (
          <View style={styles.permissionContainer}>
            <Text style={styles.permissionText}>
              Location access denied. Enable location services to see your distance and get directions.
            </Text>
            <TouchableOpacity
              style={styles.permissionButton}
              onPress={handleRequestLocation}
            >
              <Text style={styles.permissionButtonText}>Enable Location</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Launchpad Info Card */}
      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>{launchpad.full_name}</Text>
        <Text style={styles.infoSubtitle}>
          {launchpad.locality}, {launchpad.region}
        </Text>
        <Text style={styles.infoStatus}>
          Status: {launchpad.status.charAt(0).toUpperCase() + launchpad.status.slice(1)}
        </Text>
        {launchpad.details && (
          <Text style={styles.infoDetails} numberOfLines={3}>
            {launchpad.details}
          </Text>
        )}
        
        {/* Debug coordinates - Remove in production */}
        {__DEV__ && (
          <Text style={styles.debugCoordinates}>
            Coordinates: {launchpad.latitude.toFixed(6)}, {launchpad.longitude.toFixed(6)}
          </Text>
        )}
      </View>

      {/* Loading overlay for map */}
      {!mapReady && (
        <View style={styles.mapLoadingOverlay}>
          <Text style={styles.mapLoadingText}>Loading map...</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  map: {
    flex: 1,
    minHeight: 200, // Ensure minimum height
  },
  debugContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 8,
    zIndex: 1000,
  },
  debugText: {
    color: '#fff',
    fontSize: 12,
    textAlign: 'center',
  },
  debugCoordinates: {
    fontSize: 12,
    color: '#999',
    marginTop: 8,
    fontFamily: 'monospace',
  },
  controlsContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 100 : 80,
    right: 16,
    left: 16,
    zIndex: 1,
  },
  distanceContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'center',
    marginBottom: 16,
  },
  distanceText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: '#fff',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  secondaryButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButtonText: {
    color: '#999',
  },
  permissionContainer: {
    backgroundColor: '#FFF3CD',
    borderColor: '#FFEAA7',
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
  },
  permissionText: {
    fontSize: 14,
    color: '#856404',
    marginBottom: 12,
    textAlign: 'center',
  },
  permissionButton: {
    backgroundColor: '#FFC107',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  permissionButtonText: {
    color: '#212529',
    fontSize: 14,
    fontWeight: '600',
  },
  infoCard: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  infoTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  infoSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  infoStatus: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  infoDetails: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  mapLoadingOverlay: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -50 }, { translateY: -50 }],
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 20,
    borderRadius: 12,
  },
  mapLoadingText: {
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#F44336',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});