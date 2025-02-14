#!/bin/bash

echo "🚀 Cleaning and rebuilding Android app..."

# Load environment variables
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi

# Navigate to project root
cd "$(dirname "$0")"

# Step 1: Clean dependencies
npm cache clean --force 
rm -rf node_modules package-lock.json yarn.lock android/app/build android/.gradle android/app/src/main/assets/index.android.bundle

# Step 2: Reinstall dependencies
npm install

# Step 3: Clean & Rebuild Android Project
cd android
./gradlew clean
cd ..

# Step 4: Reset Metro Bundler cache
npx react-native start --reset-cache &

# Step 5: Run Android app
npx react-native run-android

echo "✅ Android app rebuilt successfully!"
