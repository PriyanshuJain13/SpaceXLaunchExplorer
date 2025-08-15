import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Launch, Launchpad } from '../types/api';
import { spacexApi } from '../services/spacexApi';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { logger } from '../utils/logger';

interface Props {
  navigation: any;
  route: {
    params: {
      launch: Launch;
    };
  };
}

export const LaunchDetailScreen: React.FC<Props> = ({ navigation, route }) => {
  const { launch } = route.params;
  const [launchpad, setLaunchpad] = useState<Launchpad | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    navigation.setOptions({
      title: launch.name,
    });
  }, [navigation, launch.name]);

  useEffect(() => {
    const loadLaunchpad = async () => {
      try {
        setLoading(true);
        const launchpadData = await spacexApi.getLaunchpad(launch.launchpad);
        setLaunchpad(launchpadData);
        setError(null);
        logger.info('Launchpad loaded successfully', { launchpadId: launch.launchpad });
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load launchpad';
        setError(errorMessage);
        logger.error('Failed to load launchpad', err);
      } finally {
        setLoading(false);
      }
    };

    loadLaunchpad();
  }, [launch.launchpad]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (success: boolean | null) => {
    if (success === true) return '#4CAF50';
    if (success === false) return '#F44336';
    return '#FF9800';
  };

  const getStatusText = (success: boolean | null) => {
    if (success === true) return 'Success';
    if (success === false) return 'Failed';
    return 'Pending';
  };

  const openWebcast = () => {
    if (launch.links.webcast) {
      Linking.openURL(launch.links.webcast).catch(() => {
        Alert.alert('Error', 'Unable to open webcast link');
      });
    }
  };

  const openWikipedia = () => {
    if (launch.links.wikipedia) {
      Linking.openURL(launch.links.wikipedia).catch(() => {
        Alert.alert('Error', 'Unable to open Wikipedia link');
      });
    }
  };

  const navigateToMap = () => {
    if (launchpad) {
      navigation.navigate('Map', { launchpad });
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading launch details..." />;
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.retryButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Mission Patch */}
        <View style={styles.patchContainer}>
          {launch.links.patch.large ? (
            <Image
              source={{ uri: launch.links.patch.large }}
              style={styles.patchImage}
              resizeMode="contain"
            />
          ) : (
            <View style={styles.placeholderPatch}>
              <Text style={styles.placeholderText}>🚀</Text>
            </View>
          )}
        </View>

        {/* Mission Info */}
        <View style={styles.section}>
          <Text style={styles.missionName}>{launch.name}</Text>
          <Text style={styles.flightNumber}>Flight #{launch.flight_number}</Text>
          
          <View style={styles.statusContainer}>
            <View 
              style={[
                styles.statusIndicator, 
                { backgroundColor: getStatusColor(launch.success) }
              ]} 
            />
            <Text style={[styles.statusText, { color: getStatusColor(launch.success) }]}>
              {getStatusText(launch.success)}
            </Text>
          </View>
        </View>

        {/* Launch Date */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Launch Date</Text>
          <Text style={styles.dateText}>{formatDate(launch.date_utc)}</Text>
        </View>

        {/* Mission Details */}
        {launch.details && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Mission Details</Text>
            <Text style={styles.detailsText}>{launch.details}</Text>
          </View>
        )}

        {/* Launchpad Info */}
        {launchpad && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Launch Site</Text>
            <View style={styles.launchpadContainer}>
              <Text style={styles.launchpadName}>{launchpad.full_name}</Text>
              <Text style={styles.launchpadLocation}>
                {launchpad.locality}, {launchpad.region}
              </Text>
              <Text style={styles.launchpadStatus}>
                Status: {launchpad.status.charAt(0).toUpperCase() + launchpad.status.slice(1)}
              </Text>
              <Text style={styles.launchpadStats}>
                {launchpad.launch_successes}/{launchpad.launch_attempts} successful launches
              </Text>
              
              <TouchableOpacity style={styles.mapButton} onPress={navigateToMap}>
                <Text style={styles.mapButtonText}>📍 View on Map</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Links */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Links</Text>
          <View style={styles.linksContainer}>
            {launch.links.webcast && (
              <TouchableOpacity style={styles.linkButton} onPress={openWebcast}>
                <Text style={styles.linkButtonText}>🎥 Watch Webcast</Text>
              </TouchableOpacity>
            )}
            {launch.links.wikipedia && (
              <TouchableOpacity style={styles.linkButton} onPress={openWikipedia}>
                <Text style={styles.linkButtonText}>📖 Read on Wikipedia</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  scrollView: {
    flex: 1,
  },
  patchContainer: {
    alignItems: 'center',
    paddingVertical: 32,
    backgroundColor: '#fff',
  },
  patchImage: {
    width: 150,
    height: 150,
  },
  placeholderPatch: {
    width: 150,
    height: 150,
    backgroundColor: '#F0F0F0',
    borderRadius: 75,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 60,
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 12,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  missionName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  flightNumber: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  statusText: {
    fontSize: 18,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  dateText: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  detailsText: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  launchpadContainer: {
    borderRadius: 12,
    backgroundColor: '#F8F8F8',
    padding: 16,
  },
  launchpadName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  launchpadLocation: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  launchpadStatus: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  launchpadStats: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  mapButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  mapButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  linksContainer: {
    gap: 12,
  },
  linkButton: {
    backgroundColor: '#F0F0F0',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  linkButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
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