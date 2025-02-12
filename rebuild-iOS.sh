#!/bin/bash

echo "🚀 Cleaning and rebuilding iOS app..."

# Load environment variables
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi

# Navigate to project root
cd "$(dirname "$0")"

# Step 1: Clean dependencies
rm -rf node_modules package-lock.json yarn.lock ios/Pods ios/Podfile.lock ios/build

# Step 2: Reinstall dependencies
npm install
cd ios
pod install --verbose
cd ..

# Step 3: Reset Metro Bundler cache
npx react-native start --reset-cache &

# Step 4: Run iOS app
npx react-native run-ios

echo "✅ iOS app rebuilt successfully!"