import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';

interface Props {
  message?: string;
  size?: 'small' | 'large';
  color?: string;
  fullScreen?: boolean;
}

export const LoadingSpinner: React.FC<Props> = ({ 
  message = 'Loading...', 
  size = 'large',
  color = '#007AFF',
  fullScreen = true
}) => (
  <View style={[styles.container, !fullScreen && styles.inline]}>
    <ActivityIndicator size={size} color={color} />
    {message && <Text style={styles.message}>{message}</Text>}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  inline: {
    flex: 0,
    paddingVertical: 20,
    backgroundColor: 'transparent',
  },
  message: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

// Enhanced Loading Spinner with different variants
export const InlineLoadingSpinner: React.FC<Omit<Props, 'fullScreen'>> = (props) => (
  <LoadingSpinner {...props} fullScreen={false} />
);

// Overlay Loading Spinner
interface OverlayProps extends Props {
  visible: boolean;
}

export const OverlayLoadingSpinner: React.FC<OverlayProps> = ({ visible, ...props }) => {
  if (!visible) return null;
  
  return (
    <View style={overlayStyles.overlay}>
  <View style={overlayStyles.overlayContent}>
    <LoadingSpinner {...props} fullScreen={false} />
  </View>
</View>

  );
};

const overlayStyles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  overlayContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    minWidth: 120,
    alignItems: 'center',
  },
});

Object.assign(styles, overlayStyles);