import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  TextInput,
  RefreshControl,
  Alert,
  Text,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Launch } from '../types/api';
import { spacexApi } from '../services/spacexApi';
import { LaunchItem } from '../components/LaunchItem';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { EmptyState } from '../components/EmptyState';
import { logger } from '../utils/logger';

interface Props {
  navigation: any;
}

const ITEMS_PER_PAGE = 20;

export const LaunchListScreen: React.FC<Props> = ({ navigation }) => {
  const [launches, setLaunches] = useState<Launch[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [hasReachedEnd, setHasReachedEnd] = useState(false);

  const filteredLaunches = useMemo(() => {
    if (!searchQuery.trim()) return launches;
    
    return launches.filter(launch =>
      launch.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [launches, searchQuery]);

  const loadLaunches = useCallback(async (offset = 0, append = false) => {
    try {
      const newLaunches = await spacexApi.getLaunches(ITEMS_PER_PAGE, offset);
      
      if (newLaunches.length < ITEMS_PER_PAGE) {
        setHasReachedEnd(true);
      }
      
      setLaunches(prev => append ? [...prev, ...newLaunches] : newLaunches);
      setError(null);
      logger.info('Launches loaded successfully', { count: newLaunches.length, offset });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load launches';
      setError(errorMessage);
      logger.error('Failed to load launches', err);
      
      if (!append) {
        Alert.alert('Error', errorMessage);
      }
    }
  }, []);

  const handleInitialLoad = useCallback(async () => {
    setLoading(true);
    await loadLaunches(0, false);
    setLoading(false);
  }, [loadLaunches]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    setHasReachedEnd(false);
    await loadLaunches(0, false);
    setRefreshing(false);
  }, [loadLaunches]);

  const handleLoadMore = useCallback(async () => {
    if (loadingMore || hasReachedEnd) return;
    
    setLoadingMore(true);
    await loadLaunches(launches.length, true);
    setLoadingMore(false);
  }, [loadLaunches, launches.length, loadingMore, hasReachedEnd]);

  const handleLaunchPress = useCallback((launch: Launch) => {
    navigation.navigate('LaunchDetail', { launch });
  }, [navigation]);

  const renderLaunchItem = useCallback(({ item }: { item: Launch }) => (
    <LaunchItem
      launch={item}
      onPress={() => handleLaunchPress(item)}
    />
  ), [handleLaunchPress]);

  const renderFooter = useCallback(() => {
    if (!loadingMore) return null;
    return <LoadingSpinner message="Loading more launches..." size="small" />;
  }, [loadingMore]);

  const renderEmpty = useCallback(() => {
    if (loading) return null;
    
    if (error) {
      return (
        <EmptyState
          title="Connection Error"
          message={error}
          buttonText="Try Again"
          onButtonPress={handleInitialLoad}
        />
      );
    }
    
    if (searchQuery && filteredLaunches.length === 0) {
      return (
        <EmptyState
          title="No Results"
          message={`No launches found for "${searchQuery}"`}
        />
      );
    }
    
    return (
      <EmptyState
        title="No Launches"
        message="No SpaceX launches available at the moment."
        buttonText="Refresh"
        onButtonPress={handleRefresh}
      />
    );
  }, [loading, error, searchQuery, filteredLaunches.length, handleInitialLoad, handleRefresh]);

  useEffect(() => {
    handleInitialLoad();
  }, [handleInitialLoad]);

  if (loading) {
    return <LoadingSpinner message="Loading SpaceX launches..." />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search missions..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          returnKeyType="search"
          clearButtonMode="while-editing"
        />
      </View>
      
      {searchQuery && (
        <Text style={styles.resultsCount}>
          {filteredLaunches.length} result{filteredLaunches.length !== 1 ? 's' : ''}
        </Text>
      )}

      <FlatList
        data={filteredLaunches}
        renderItem={renderLaunchItem}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#007AFF']}
            tintColor="#007AFF"
          />
        }
        onEndReached={searchQuery ? undefined : handleLoadMore}
        onEndReachedThreshold={0.1}
        ListFooterComponent={searchQuery ? null : renderFooter}
        ListEmptyComponent={renderEmpty}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={10}
        getItemLayout={(data, index) => ({
          length: 88,
          offset: 88 * index,
          index,
        })}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  searchInput: {
    height: 44,
    backgroundColor: '#F0F0F0',
    borderRadius: 10,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  resultsCount: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 14,
    color: '#666',
    backgroundColor: '#F8F8F8',
  },
});