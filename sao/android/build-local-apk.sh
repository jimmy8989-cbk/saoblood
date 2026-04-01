#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
TOOLCHAIN_DIR="$ROOT_DIR/.toolchain"
SDK_DIR="$TOOLCHAIN_DIR/android-sdk"
JDK_DIR="$TOOLCHAIN_DIR/jdk"
GRADLE_VERSION="8.7"
GRADLE_DIR="$TOOLCHAIN_DIR/gradle-$GRADLE_VERSION"
CMDLINE_TOOLS_VERSION="11076708"
CMDLINE_TOOLS_DIR="$SDK_DIR/cmdline-tools/latest"

mkdir -p "$TOOLCHAIN_DIR" "$SDK_DIR/cmdline-tools"

download_if_missing() {
    local url="$1"
    local dest="$2"
    if [ ! -f "$dest" ]; then
        echo "Descargando $(basename "$dest")..."
        curl -L --retry 3 --fail "$url" -o "$dest"
    fi
}

if [ ! -x "$JDK_DIR/bin/java" ]; then
    JDK_ARCHIVE="$TOOLCHAIN_DIR/jdk17.tar.gz"
    download_if_missing "https://api.adoptium.net/v3/binary/latest/17/ga/linux/x64/jdk/hotspot/normal/eclipse" "$JDK_ARCHIVE"
    rm -rf "$JDK_DIR" "$TOOLCHAIN_DIR"/jdk-extract
    mkdir -p "$TOOLCHAIN_DIR/jdk-extract"
    tar -xzf "$JDK_ARCHIVE" -C "$TOOLCHAIN_DIR/jdk-extract"
    EXTRACTED_JDK="$(find "$TOOLCHAIN_DIR/jdk-extract" -mindepth 1 -maxdepth 1 -type d | head -n 1)"
    mv "$EXTRACTED_JDK" "$JDK_DIR"
fi

if [ ! -x "$CMDLINE_TOOLS_DIR/bin/sdkmanager" ]; then
    TOOLS_ARCHIVE="$TOOLCHAIN_DIR/commandlinetools.zip"
    download_if_missing "https://dl.google.com/android/repository/commandlinetools-linux-${CMDLINE_TOOLS_VERSION}_latest.zip" "$TOOLS_ARCHIVE"
    rm -rf "$CMDLINE_TOOLS_DIR"
    mkdir -p "$CMDLINE_TOOLS_DIR"
    unzip -q -o "$TOOLS_ARCHIVE" -d "$SDK_DIR/cmdline-tools"
    if [ -d "$SDK_DIR/cmdline-tools/cmdline-tools" ]; then
        cp -R "$SDK_DIR/cmdline-tools/cmdline-tools/." "$CMDLINE_TOOLS_DIR/"
        rm -rf "$SDK_DIR/cmdline-tools/cmdline-tools"
    fi
fi

if [ ! -d "$GRADLE_DIR" ]; then
    GRADLE_ARCHIVE="$TOOLCHAIN_DIR/gradle-${GRADLE_VERSION}-bin.zip"
    download_if_missing "https://services.gradle.org/distributions/gradle-${GRADLE_VERSION}-bin.zip" "$GRADLE_ARCHIVE"
    rm -rf "$GRADLE_DIR"
    unzip -q -o "$GRADLE_ARCHIVE" -d "$TOOLCHAIN_DIR"
fi

export JAVA_HOME="$JDK_DIR"
export ANDROID_HOME="$SDK_DIR"
export ANDROID_SDK_ROOT="$SDK_DIR"
export PATH="$JAVA_HOME/bin:$CMDLINE_TOOLS_DIR/bin:$SDK_DIR/platform-tools:$GRADLE_DIR/bin:$PATH"

set +o pipefail
yes | sdkmanager --sdk_root="$SDK_DIR" --licenses >/dev/null
set -o pipefail

sdkmanager --sdk_root="$SDK_DIR" \
    "platform-tools" \
    "platforms;android-34" \
    "build-tools;34.0.0"

printf 'sdk.dir=%s\n' "$SDK_DIR" > "$ROOT_DIR/local.properties"

cd "$ROOT_DIR"
gradle --no-daemon assembleDebug

echo
echo "APK listo en: $ROOT_DIR/app/build/outputs/apk/debug/app-debug.apk"
