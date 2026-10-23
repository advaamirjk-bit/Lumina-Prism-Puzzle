#!/usr/bin/env bash
set -e

echo "=== Step 1: Checking and Installing OpenJDK 17 ==="
if ! command -v java &>/dev/null; then
  apt-get update -qq
  apt-get install -y -qq openjdk-17-jdk-headless
fi

export JAVA_HOME="/usr/lib/jvm/java-17-openjdk-amd64"
export PATH="$JAVA_HOME/bin:$PATH"
java -version

echo "=== Step 2: Setting up Android SDK in persistent directory ==="
SDK_DIR="/app/applet/.android-sdk"
mkdir -p "$SDK_DIR/cmdline-tools"

if [ ! -d "$SDK_DIR/cmdline-tools/latest" ]; then
  echo "Downloading Android Commandline Tools..."
  curl -s -L -o /tmp/cmdline-tools.zip https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip
  unzip -q /tmp/cmdline-tools.zip -d "$SDK_DIR/cmdline-tools"
  mv "$SDK_DIR/cmdline-tools/cmdline-tools" "$SDK_DIR/cmdline-tools/latest"
  rm -f /tmp/cmdline-tools.zip
fi

export ANDROID_HOME="$SDK_DIR"
export PATH="$SDK_DIR/cmdline-tools/latest/bin:$SDK_DIR/platform-tools:$PATH"

echo "=== Step 3: Accepting licenses and installing Platform 36 & Build-Tools ==="
yes | "$SDK_DIR/cmdline-tools/latest/bin/sdkmanager" --sdk_root="$SDK_DIR" --licenses > /dev/null 2>&1 || true

if [ ! -d "$SDK_DIR/platforms/android-36" ]; then
  "$SDK_DIR/cmdline-tools/latest/bin/sdkmanager" --sdk_root="$SDK_DIR" "platform-tools" "platforms;android-36" "build-tools;35.0.0" > /dev/null
fi

echo "sdk.dir=$SDK_DIR" > /app/applet/android/local.properties

echo "=== Step 4: Ensuring Keystore exists ==="
if [ ! -f /app/applet/android/android.keystore ]; then
  keytool -genkeypair -v -keystore /app/applet/android/android.keystore -alias android -keyalg RSA -keysize 2048 -validity 10000 -storepass lumina123 -keypass lumina123 -dname "CN=Lumina Prism, OU=Games, O=Lumina, L=San Francisco, ST=CA, C=US"
fi

echo "=== Step 5: Building bundleRelease ==="
cd /app/applet/android
chmod +x gradlew
./gradlew bundleRelease

echo "=== Step 6: Exporting release AAB package ==="
AAB_PATH=$(find /app/applet/android/app/build -name "*.aab" | head -n 1)

if [ -n "$AAB_PATH" ] && [ -f "$AAB_PATH" ]; then
  mkdir -p /app/applet/public
  cp "$AAB_PATH" /app/applet/Lumina-release-v2.aab
  cp "$AAB_PATH" /app/applet/public/Lumina-release-v2.aab
  echo "SUCCESS! AAB generated at:"
  ls -lh /app/applet/Lumina-release-v2.aab
  ls -lh /app/applet/public/Lumina-release-v2.aab
else
  echo "Error: AAB file not found after build!"
  exit 1
fi
