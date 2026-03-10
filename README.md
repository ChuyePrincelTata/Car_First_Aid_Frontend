# Car First Aid - Frontend

This is the React Native frontend for the Car Fault Diagnosis mobile application built with Expo.

## Features

- 🚗 AI-powered car fault diagnosis
- 📸 Dashboard light analysis via camera
- 🎵 Engine sound analysis via microphone
- 👨‍🔧 Connect with verified mechanics
- 📱 Cross-platform (iOS & Android)
- 🌙 Dark/Light theme support
- 🔐 JWT Authentication

## Tech Stack

- **React Native** with Expo
- **Expo Router** for navigation
- **TypeScript** for type safety
- **Lucide React Native** for icons
- **Expo Linear Gradient** for UI effects
- **React Native Reanimated** for animations

## Getting Started

1. **Install dependencies:**
   \`\`\`bash
   npm install
   \`\`\`

2. **Start the development server:**
   \`\`\`bash
   npm start
   \`\`\`

3. **Run on device/simulator:**
   \`\`\`bash
   npm run ios     # iOS simulator
   npm run android # Android emulator
   npm run web     # Web browser
   \`\`\`

## Project Structure

\`\`\`
frontend/
├── app/                    # App screens (Expo Router)
│   ├── (auth)/            # Authentication screens
│   ├── (tabs)/            # Main tab navigation
│   ├── (mechanic)/        # Mechanic-specific screens
│   └── _layout.tsx        # Root layout
├── components/            # Reusable components
├── context/              # React Context providers
├── constants/            # App constants
├── hooks/                # Custom hooks
├── services/             # API services
├── types/                # TypeScript types
└── assets/               # Images, fonts, etc.
\`\`\`

## Key Features

### Authentication
- User registration and login
- Role-based access (User/Mechanic)
- JWT token management
- Secure storage with Expo SecureStore

### Diagnosis Features
- **Dashboard Light Analysis**: Take photos of warning lights
- **Engine Sound Analysis**: Record engine sounds for AI analysis
- **Manual Input**: Describe problems in text
- **History Tracking**: View past diagnoses

### Mechanic Features
- **Find Mechanics**: Search and filter verified mechanics
- **Ratings & Reviews**: View mechanic ratings and feedback
- **Direct Contact**: Message mechanics directly

### UI/UX
- **Responsive Design**: Works on all screen sizes
- **Theme Support**: Light and dark mode
- **Smooth Animations**: React Native Reanimated
- **Intuitive Navigation**: Tab-based navigation with Expo Router

## Configuration

The app connects to the backend API. Update the API base URL in:
\`\`\`typescript
// context/AuthContext.tsx
const API_BASE_URL = "http://localhost:8000/api"
\`\`\`

## Building for Production

1. **Build for iOS:**
   \`\`\`bash
   expo build:ios
   \`\`\`

2. **Build for Android:**
   \`\`\`bash
   expo build:android
   \`\`\`

## Environment Setup

Make sure you have:
- Node.js 18+
- Expo CLI
- iOS Simulator (for iOS development)
- Android Studio (for Android development)
