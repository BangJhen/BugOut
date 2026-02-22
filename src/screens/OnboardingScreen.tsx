import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Image,
  StatusBar,
  ImageBackground,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import {Colors} from '../constants/theme';

const {width: SCREEN_WIDTH} = Dimensions.get('window');

const logoImg = require('../assets/images/backgrounds/logo.png');
const backgroundImg = require('../assets/images/backgrounds/background.png');

interface LoadingBarProps {
  progress: number;
}

function LoadingBar({progress}: LoadingBarProps) {
  const animatedWidth = useSharedValue(0);

  useEffect(() => {
    animatedWidth.value = withTiming(progress, {
      duration: 300,
      easing: Easing.ease,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progress]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${animatedWidth.value}%`,
  }));

  return (
    <View style={styles.loadingContainer}>
      {/* Track */}
      <View style={styles.loadingTrack}>
        {/* Fill */}
        <Animated.View style={[styles.loadingFill, fillStyle]} />
      </View>
      {/* Label */}
      <Text style={styles.loadingLabel}>
        {progress >= 100 ? 'READY!' : 'LOADING...'}
      </Text>
    </View>
  );
}

interface OnboardingScreenProps {
  onComplete?: () => void;
}

export default function OnboardingScreen({onComplete}: OnboardingScreenProps) {
  const [progress, setProgress] = useState(0);
  const fadeOpacity = useSharedValue(0);

  const fadeStyle = useAnimatedStyle(() => ({
    opacity: fadeOpacity.value,
  }));

  useEffect(() => {
    const intervals = [
      {delay: 200, value: 12},
      {delay: 500, value: 28},
      {delay: 900, value: 45},
      {delay: 1400, value: 63},
      {delay: 1900, value: 78},
      {delay: 2400, value: 90},
      {delay: 2900, value: 100},
    ];

    const timers = intervals.map(({delay, value}) =>
      setTimeout(() => {
        setProgress(value);
        if (value >= 100) {
          setTimeout(() => {
            fadeOpacity.value = withTiming(1, {duration: 500});
            setTimeout(() => onComplete?.(), 600);
          }, 400);
        }
      }, delay),
    );

    return () => timers.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ImageBackground
      source={backgroundImg}
      style={styles.container}
      resizeMode="cover">
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Center content */}
      <View style={styles.centerContent}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Image
            source={logoImg}
            style={styles.logoImage}
            resizeMode="contain"
          />
          {/* Tagline */}
          <Text style={styles.tagline}>Think Smart. Move Smart.</Text>
        </View>

        {/* Loading bar */}
        <LoadingBar progress={progress} />
      </View>

      {/* Fade overlay */}
      <Animated.View
        style={[styles.fadeOverlay, fadeStyle]}
        pointerEvents="none"
      />
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 176,
  },
  logoContainer: {
    alignItems: 'center',
    width: SCREEN_WIDTH * 0.7,
    gap: 4,
  },
  logoImage: {
    width: '100%',
    height: undefined,
    aspectRatio: 734 / 156,
  },
  tagline: {
    fontWeight: '400',
    fontSize: 18,
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: 0.45,
    lineHeight: 28,
    textAlign: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
    gap: 10,
    width: 192,
  },
  loadingTrack: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    height: 4,
    width: '100%',
    borderRadius: 999,
    overflow: 'hidden',
  },
  loadingFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    borderRadius: 999,
    backgroundColor: Colors.pink,
    shadowColor: Colors.pink,
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 1,
    shadowRadius: 10,
  },
  loadingLabel: {
    fontWeight: '700',
    fontSize: 12,
    letterSpacing: 1.2,
    color: 'rgba(255,255,255,0.4)',
    textAlign: 'center',
    textTransform: 'uppercase',
    lineHeight: 16,
  },
  fadeOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.background,
  },
});
