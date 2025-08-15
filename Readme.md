# SpaceX Launch Explorer

A React Native mobile app built with Expo that provides a maps-first experience for exploring SpaceX launches and launch sites.

## Tech Stack

- **React Native** with **Expo SDK 53**
- **TypeScript** for type safety
- **React Navigation** for screen navigation
- **React Native Maps** for map functionality
- **Expo Location** for GPS and permissions
- **SpaceX API** for launch data

## Installation & Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npx expo start
   ```
4. Run on device/simulator:
   ```bash
   npx expo start --ios
   npx expo start --android
   ```

## Map Implementation

The app uses `react-native-maps` for map functionality:
- Custom markers for launch sites and user location
- Automatic map region fitting
- Distance calculations using Haversine formula
- Native maps integration for turn-by-turn directions

## Permission Handling

Location permissions are handled gracefully:
- Request permissions when needed
- Clear UI feedback for permission status
- Fallback functionality when permissions denied
- Settings deep-link for permission management

## Architecture

- **Component-based architecture** with reusable UI components
- **Custom hooks** for data fetching and state management  
- **Error boundaries** for crash prevention
- **TypeScript interfaces** for API response typing
- **Performance optimizations** with React.memo and FlatList

## API Integration

Integrates with SpaceX public APIs:
- `/v5/launches` for launch data with pagination
- `/v4/launchpads/:id` for launch site details
- Robust error handling and retry logic
- TypeScript interfaces for all responses

## Performance Features

- Memoized FlatList items to prevent unnecessary re-renders
- `getItemLayout` for smooth scrolling
- Optimized image loading with placeholder states
- Efficient search with client-side filtering
- Proper cleanup of async operations
```