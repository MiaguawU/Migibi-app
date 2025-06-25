const dotenv = require('dotenv');
dotenv.config();

module.exports = {
  expo: {
    name: 'migibi',
    slug: 'migibi',
    version: '1.0.0',
    orientation: 'portrait',
    platforms: ['android', 'web'],
    icon: './assets/icon.png',
    userInterfaceStyle: 'light',
    splash: {
      image: './assets/splash.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff',
    },
    scheme: 'migibi',
    extra: {
      ANDROID_CLIENT_ID: process.env.ANDROID_CLIENT_ID,
      WEB_CLIENT_ID: process.env.WEB_CLIENT_ID,
      eas: {
        projectId: 'd36f3d38-c986-4960-9d9c-1b950975e477',
      },
    },
    build: {
      preview: {
        android: {
          buildType: 'apk',
        },
      },
    },
    android: {
      package: 'com.cincode.migibi',
      versionCode: 6,
      googleServicesFile: './google-services.json',
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#ffffff',
      },
      useNextNotificationsApi: true,
    },
    web: {
      favicon: './assets/favicon.png',
      bundler: 'metro',
    },
    plugins: [
      'expo-font',
      [
        'expo-build-properties',
        {
          android: {
            usesCleartextTraffic: true,
          },
        },
      ],
      'expo-barcode-scanner',
    ],
    owner: 'isisf',
  },
};
