import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Launch } from '../types/api';

interface Props {
  launch: Launch;
  onPress: () => void;
}

export const LaunchItem: React.FC<Props> = React.memo(({ launch, onPress }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
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

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.imageContainer}>
        {launch.links.patch.small ? (
          <Image
            source={{ uri: launch.links.patch.small }}
            style={styles.patchImage}
            resizeMode="contain"
          />
        ) : (
          <View style={styles.placeholderImage}>
            <Text style={styles.placeholderText}>🚀</Text>
          </View>
        )}
      </View>
      
      <View style={styles.contentContainer}>
        <Text style={styles.missionName} numberOfLines={2}>
          {launch.name}
        </Text>
        <Text style={styles.flightNumber}>
          Flight #{launch.flight_number}
        </Text>
        <Text style={styles.date}>
          {formatDate(launch.date_utc)}
        </Text>
        
        <View style={styles.statusContainer}>
          <View 
            style={[
              styles.statusIndicator, 
              { backgroundColor: getStatusColor(launch.success) }
            ]} 
          />
          <Text style={styles.statusText}>
            {getStatusText(launch.success)}
          </Text>
        </View>
      </View>
      
      <View style={styles.chevron}>
        <Text style={styles.chevronText}>›</Text>
      </View>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  imageContainer: {
    marginRight: 16,
  },
  patchImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  placeholderImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 24,
  },
  contentContainer: {
    flex: 1,
  },
  missionName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  flightNumber: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  date: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
  },
  chevron: {
    marginLeft: 8,
  },
  chevronText: {
    fontSize: 20,
    color: '#C7C7CC',
  },
});