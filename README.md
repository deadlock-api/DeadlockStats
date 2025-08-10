# DeadlockStats

> A comprehensive mobile application for tracking and analyzing Deadlock game statistics

DeadlockStats is a React Native application built with Expo that provides players with detailed statistics, match history, hero performance analytics, and teammate/enemy tracking for the game Deadlock. The app integrates with Steam authentication and the Deadlock API to deliver real-time data and insights.

## 🎯 Features

### 📊 Dashboard & Overview
- **Player Statistics Overview**: Quick access to key performance metrics
- **Recent Match History**: View your latest matches with detailed results
- **Win Rate Analytics**: Track your overall performance and improvement
- **KDA Statistics**: Monitor your Kill/Death/Assist ratios across matches

### 🎮 Match Tracking & Analysis
- **Detailed Match History**: Browse through all your past matches
- **Match Details**: In-depth analysis of individual matches including:
  - Team compositions
  - Individual player performance
  - Match duration and outcome
  - Detailed statistics for all players
- **Time Range Filtering**: Analyze performance over specific time periods
- **Match Sharing**: Share match details with other players

### 🦸 Hero Analytics
- **Hero Performance Stats**: Track your performance with each hero
- **Hero Win Rates**: See which heroes you perform best with
- **Hero Details**: Comprehensive information about each hero
- **Hero Comparison**: Compare your performance across different heroes

### 👥 Social Features
- **Teammate Analytics**: Track performance with frequent teammates
- **Enemy Analytics**: Analyze matchups against common opponents
- **Player Search**: Find and analyze other players' statistics
- **Profile Sharing**: Share your profile via deep links

### 🔧 Customization & Settings
- **Theme Support**: Light and dark theme options with automatic switching
- **Internationalization**: Multi-language support (i18n)
- **Time Range Selection**: Customize analysis periods
- **Offline Support**: Access cached data when offline

## 🏗️ Technical Architecture

### Frontend Stack
- **React Native**: Cross-platform mobile development
- **Expo**: Development platform and deployment tools
- **TypeScript**: Type-safe development
- **React Navigation**: Navigation library with stack and tab navigators
- **React Query (TanStack Query)**: Data fetching and caching

### State Management
- **React Hooks Global States**: Global state management for player selection and time ranges
- **React Query**: Server state management and caching
- **Local Storage**: Persistent storage for user preferences

### Authentication & Deep Linking
- **Steam OpenID**: Secure authentication via Steam
- **Deep Linking**: Custom URL schemes for sharing and navigation
- **Auto-verification**: Verified deep links for seamless user experience

### UI/UX
- **Custom Theme System**: Comprehensive theming with light/dark modes
- **Responsive Design**: Optimized for various screen sizes
- **Safe Area Support**: Proper handling of device-specific UI elements
- **Keyboard Handling**: Enhanced keyboard interaction support

### Development Tools
- **Biome**: Fast linting and formatting
- **Jest**: Unit testing framework
- **Maestro**: End-to-end testing
- **EAS Build**: Cloud and local build system

## 📱 Platform Support

- **iOS**: Native iOS builds with proper App Store compliance
- **Android**: Native Android builds with Google Play Store support
- **Development Builds**: Local simulator and device testing
- **Preview Builds**: Internal testing and distribution

## 🚀 Getting Started

### Prerequisites
- Node.js (18+)
- pnpm package manager
- Expo CLI
- iOS Simulator (for iOS development)
- Android Studio (for Android development)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd DeadlockStats

# Install dependencies
pnpm install

# Start the development server
pnpm run start
```

### Development Builds

#### iOS Development
```bash
# Build for iOS Simulator
pnpm run build:ios:sim

# Build for iOS Device (Development)
pnpm run build:ios:dev

# Build for iOS Device (Production)
pnpm run build:ios:prod
```

#### Android Development
```bash
# Build for Android Emulator/Device
pnpm run build:android:sim

# Build for Android Device (Development)
pnpm run build:android:dev

# Build for Android Device (Production)
pnpm run build:android:prod
```

### Development Workflow

```bash
# Run linting
pnpm run lint

# Format code
pnpm run fmt

# Run tests
pnpm run test

# Run tests in watch mode
pnpm run test:watch

# Type checking
pnpm run compile
```

## 📂 Project Structure

```
app/
├── components/           # Reusable UI components
│   ├── heroes/          # Hero-related components
│   ├── matches/         # Match-related components
│   ├── profile/         # Profile and player components
│   ├── select/          # Selection components
│   └── ui/              # Base UI components
├── config/              # Configuration files
├── hooks/               # Custom React hooks
├── i18n/                # Internationalization
├── navigators/          # Navigation configuration
├── screens/             # Screen components
│   ├── Dashboard/       # Dashboard screens
│   ├── Heroes/          # Hero-related screens
│   ├── Matches/         # Match-related screens
│   └── Mates/           # Teammate/enemy screens
├── services/            # API services and types
├── theme/               # Theme configuration
└── utils/               # Utility functions

assets/
├── heroes/              # Hero images and assets
├── images/              # General images
└── ranks/               # Rank badges and images
```

## 🔌 API Integration

The app integrates with the Deadlock API to fetch:
- Player profiles and statistics
- Match history and details
- Hero information and assets
- Rank and badge data

### Key API Endpoints
- `/match-history/{account_id}` - Player match history
- `/steam-profile/{account_id}` - Steam profile information
- Hero and asset endpoints for game data

## 🌐 Deep Linking

The app supports deep linking for:
- **Welcome Flow**: `deadlockstats://welcome`
- **Steam Auth Callback**: `deadlockstats://auth/steam/callback`
- **Profile Sharing**: `deadlockstats://share/{accountId}`
- **Match Details**: `deadlockstats://matches/{matchId}`
- **Hero Details**: `deadlockstats://heroes/{heroId}`

## 🛠️ Configuration

### Environment Configuration
- `config.dev.ts` - Development environment settings
- `config.prod.ts` - Production environment settings
- `config.base.ts` - Shared configuration

### Build Configuration
- `eas.json` - EAS Build configuration
- `app.config.ts` - Expo configuration
- `metro.config.js` - Metro bundler configuration

## 📊 Analytics & Utilities

### Match Analytics
- Win rate calculations
- KDA analysis
- Hero performance metrics
- Time-based filtering
- Statistical comparisons

### Data Management
- Offline-first approach with React Query
- Intelligent caching strategies
- Background data synchronization
- Error handling and retry logic

## 🚀 Deployment

### EAS Build Profiles
- **Development**: Local testing with development builds
- **Preview**: Internal testing and distribution
- **Production**: App store releases

### Platform-Specific Features
- **Android**: Edge-to-edge display, intent filters for deep linking
- **iOS**: Native navigation, proper safe area handling

## 🤝 Contributing

This project follows Infinite Red's React Native boilerplate structure and best practices. When contributing:

1. Follow the established code style using Biome
2. Write tests for new functionality
3. Update documentation as needed
4. Use TypeScript for type safety
5. Follow the component organization patterns

## 📄 License

This project is private and proprietary.

## 🎮 About Deadlock

DeadlockStats is designed specifically for players of Deadlock, providing comprehensive statistics and analytics to help players improve their gameplay and track their progress over time.
