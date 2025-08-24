# syntax=docker/dockerfile:1.4
FROM dart:stable

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    git \
    bash \
    unzip \
    xz-utils \
    zip \
    libglu1-mesa \
    wget \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Install Flutter
ENV FLUTTER_HOME="/opt/flutter"
ENV PATH="$FLUTTER_HOME/bin:$PATH"
ENV PATH="/root/.pub-cache/bin:$PATH"

# Download Flutter SDK (3.35.1 includes Dart 3.9.x)
RUN cd /opt && \
    wget -O flutter.tar.xz https://storage.googleapis.com/flutter_infra_release/releases/stable/linux/flutter_linux_3.35.1-stable.tar.xz && \
    tar xf flutter.tar.xz && \
    rm flutter.tar.xz && \
    git config --global --add safe.directory /opt/flutter

# Verify Flutter install (skip heavy precache during build)
RUN $FLUTTER_HOME/bin/flutter --version && dart --version

# Lightweight static server for built web app
RUN dart pub global activate dhttpd

# Skip Chrome installation; use Flutter web-server device to avoid heavy deps

# Set working directory
WORKDIR /app

# Copy pubspec files
COPY pubspec.yaml pubspec.lock ./

# Get dependencies (cache pub cache between builds)
RUN --mount=type=cache,target=/root/.pub-cache \
    $FLUTTER_HOME/bin/flutter pub get --no-example

# Copy source code
COPY . .

# Generate Hive files (commented out due to mockito issues)
# RUN $FLUTTER_HOME/bin/flutter packages pub run build_runner clean && \
#     $FLUTTER_HOME/bin/flutter packages pub run build_runner build --delete-conflicting-outputs || \
#     echo "Build runner completed with warnings"

# Expose ports
EXPOSE 8080 3001

# Start the application (run Dart directly)
CMD ["dart", "run", "bin/api.dart"]
