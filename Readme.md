# SpaceX Launch Explorer

A React Native mobile app built with Expo that provides a maps-first experience for exploring SpaceX launches and launch sites for Tripare assesment ~ Priyanshu Jain

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

## API Integration

Integrates with SpaceX public APIs:
- `/v5/launches` for launch data with pagination
- `/v4/launchpads/:id` for launch site details

## Performance Features

- Memoized FlatList items to prevent unnecessary re-renders
- `getItemLayout` for smooth scrolling
- Optimized image loading with placeholder states
- Efficient search with client-side filtering

## Screenshots
![WhatsApp Image 2025-08-15 at 20 47 30 (1)](https://github.com/user-attachments/assets/c9da9d77-242a-45fe-8ffa-9ee333c19a4c)
![WhatsApp Image 2025-08-15 at 20 47 30](https://github.com/user-attachments/assets/1d32677c-b22d-494a-b361-1cb8412dac6f)
![WhatsApp Image 2025-08-15 at 20 47 31](https://github.com/user-attachments/assets/973ba310-3d59-419c-8f6b-8c8a9e7b9ef4)




