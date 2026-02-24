import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ImageBackground,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';

const backgroundImg = require('../assets/images/backgrounds/background.png');

// ─── Main AR Game Screen ──────────────────────────────────────────────────────
interface ARGameScreenProps {
  onBack: () => void;
}

export default function ARGameScreen({onBack}: ARGameScreenProps) {
  const insets = useSafeAreaInsets();

  return (
    <ImageBackground source={backgroundImg} style={styles.container} resizeMode="cover">
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Back Button */}
      <View style={[styles.backButtonContainer, {top: insets.top + 14}]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={onBack}
          activeOpacity={0.7}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
      </View>

      {/* AR Coming Soon Content */}
      <View style={styles.contentContainer}>
        <LinearGradient
          colors={['rgba(139, 0, 139, 0.3)', 'rgba(255, 0, 255, 0.3)']}
          style={styles.card}>
          <Text style={styles.title}>🎮 AR Game Mode</Text>
          <Text style={styles.subtitle}>Coming Soon!</Text>
          
          <View style={styles.featuresList}>
            <Text style={styles.featureItem}>📱 Scan physical cards</Text>
            <Text style={styles.featureItem}>🎯 Place 3D characters on surfaces</Text>
            <Text style={styles.featureItem}>⚡ Real-time AR battles</Text>
            <Text style={styles.featureItem}>🎨 Interactive AR effects</Text>
          </View>

          <Text style={styles.note}>
            AR functionality requires additional setup.
            Stay tuned for updates!
          </Text>
        </LinearGradient>
      </View>
    </ImageBackground>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backButtonContainer: {
    position: 'absolute',
    left: 24,
    zIndex: 10,
  },
  backButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Outfit-Bold',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    padding: 32,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#ff00ff',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    fontFamily: 'Outfit-ExtraBold',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 24,
    fontWeight: '700',
    fontFamily: 'Outfit-Bold',
    color: '#ff00ff',
    marginBottom: 32,
    textAlign: 'center',
  },
  featuresList: {
    width: '100%',
    marginBottom: 32,
    gap: 16,
  },
  featureItem: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Outfit-SemiBold',
    color: '#fff',
    textAlign: 'left',
  },
  note: {
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'Outfit-Medium',
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    lineHeight: 20,
  },
});
