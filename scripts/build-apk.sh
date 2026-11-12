#!/bin/bash
set -e

echo "=========================================="
echo "  Half-Life Calculator - Fast Local APK Build"
echo "=========================================="

# Auto-detect Java 17+ (React Native and Gradle 9 require Java 17+)
if [ -d "/opt/homebrew/Cellar/openjdk@17/17.0.13/libexec/openjdk.jdk/Contents/Home" ]; then
  export JAVA_HOME="/opt/homebrew/Cellar/openjdk@17/17.0.13/libexec/openjdk.jdk/Contents/Home"
elif command -v /usr/libexec/java_home &> /dev/null; then
  export JAVA_HOME="$(/usr/libexec/java_home -v 17 2>/dev/null || /usr/libexec/java_home)"
fi

# Auto-detect ANDROID_HOME if not set
if [ -z "$ANDROID_HOME" ]; then
  if [ -d "$HOME/Library/Android/sdk" ]; then
    export ANDROID_HOME="$HOME/Library/Android/sdk"
  fi
fi

# Ensure local.properties exists in android directory
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ANDROID_DIR="$PROJECT_ROOT/android"

mkdir -p "$ANDROID_DIR"
if [ ! -f "$ANDROID_DIR/local.properties" ] && [ -n "$ANDROID_HOME" ]; then
  echo "sdk.dir=$ANDROID_HOME" > "$ANDROID_DIR/local.properties"
fi

echo "✓ Using Java: $JAVA_HOME"
echo "✓ Using Android SDK: $ANDROID_HOME"

BUILD_TYPE="Release"
GRADLE_TASK="assembleRelease"

if [ "$1" == "--debug" ] || [ "$1" == "debug" ]; then
  BUILD_TYPE="Debug"
  GRADLE_TASK="assembleDebug"
fi

echo "==> Building Android $BUILD_TYPE APK locally (No EAS Cloud wait)..."
cd "$ANDROID_DIR"

./gradlew "$GRADLE_TASK" --no-daemon

APK_SRC=""
if [ "$BUILD_TYPE" == "Release" ]; then
  APK_SRC="$ANDROID_DIR/app/build/outputs/apk/release/app-release.apk"
  if [ ! -f "$APK_SRC" ]; then
    APK_SRC="$ANDROID_DIR/app/build/outputs/apk/release/app-release-unsigned.apk"
  fi
else
  APK_SRC="$ANDROID_DIR/app/build/outputs/apk/debug/app-debug.apk"
fi

if [ -f "$APK_SRC" ]; then
  APK_DEST="$PROJECT_ROOT/HalfLifeCalculator-${BUILD_TYPE}.apk"
  cp "$APK_SRC" "$APK_DEST"
  FILE_SIZE=$(ls -lh "$APK_DEST" | awk '{print $5}')
  echo ""
  echo "=========================================="
  echo "🎉 SUCCESS: APK Generated Successfully!"
  echo "=========================================="
  echo "  Output Location: $APK_DEST"
  echo "  Size:            $FILE_SIZE"
  echo "  Variant:         $BUILD_TYPE"
  echo "=========================================="
  echo "You can now install this APK on any Android phone:"
  echo "  adb install -r \"$APK_DEST\""
  echo "or transfer the file directly to your phone via USB/Drive."
  echo "=========================================="
else
  echo "❌ Error: Could not find generated APK at $APK_SRC"
  exit 1
fi
