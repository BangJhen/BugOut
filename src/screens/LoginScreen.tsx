import React, {useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
  StatusBar,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDelay,
  withRepeat,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Colors} from '../constants/theme';

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');

const robotImg = require('../assets/images/robot_mascot.png');
const googleIcon = require('../assets/images/google_icon.png');
const appleIcon = require('../assets/images/apple_icon.png');

// ─── Background Glows ─────────────────────────────────────────────────────────
function BackgroundGlows() {
  return (
    <>
      <View
        style={[
          styles.glow,
          {
            width: 400,
            height: 400,
            backgroundColor: 'rgba(255,46,149,0.13)',
            left: -150,
            top: '35%',
          },
        ]}
      />
      <View
        style={[
          styles.glow,
          {
            width: 250,
            height: 250,
            backgroundColor: 'rgba(153,255,0,0.06)',
            left: 20,
            bottom: -20,
          },
        ]}
      />
      <View
        style={[
          styles.glow,
          {
            width: 200,
            height: 200,
            backgroundColor: 'rgba(0,240,255,0.06)',
            left: -100,
            top: -30,
          },
        ]}
      />
    </>
  );
}

// ─── Speech Bubble ────────────────────────────────────────────────────────────
function SpeechBubble() {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.7);
  const translateY = useSharedValue(10);

  useEffect(() => {
    opacity.value = withDelay(600, withSpring(1));
    scale.value = withDelay(600, withSpring(1, {stiffness: 260, damping: 22}));
    translateY.value = withDelay(600, withSpring(0, {stiffness: 260, damping: 22}));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{scale: scale.value}, {translateY: translateY.value}],
  }));

  return (
    <Animated.View style={[styles.speechBubbleContainer, animStyle]}>
      <View style={styles.speechBubble}>
        <Text style={styles.speechText}>
          Hello!, Ready to{'\n'}Play BugOut?
        </Text>
      </View>
      {/* Tail */}
      <View style={styles.speechTail} />
    </Animated.View>
  );
}

// ─── Robot Mascot ─────────────────────────────────────────────────────────────
function RobotMascot() {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(30);
  const floatY = useSharedValue(0);

  useEffect(() => {
    opacity.value = withDelay(250, withSpring(1));
    translateY.value = withDelay(250, withSpring(0, {stiffness: 200, damping: 20}));
    floatY.value = withRepeat(
      withSequence(
        withTiming(-8, {duration: 1750, easing: Easing.inOut(Easing.ease)}),
        withTiming(0, {duration: 1750, easing: Easing.inOut(Easing.ease)}),
      ),
      -1,
      true,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{translateY: translateY.value + floatY.value}],
  }));

  return (
    <Animated.View style={[styles.robotContainer, animStyle]}>
      <Image source={robotImg} style={styles.robotImage} resizeMode="contain" />
    </Animated.View>
  );
}

// ─── Social Button ───────────────────────────────────────────────────────────
interface SocialButtonProps {
  icon: any;
  label: string;
  onPress?: () => void;
  delay?: number;
}

function SocialButton({icon, label, onPress, delay = 0}: SocialButtonProps) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);

  useEffect(() => {
    opacity.value = withDelay(delay * 1000, withSpring(1));
    translateY.value = withDelay(
      delay * 1000,
      withSpring(0, {stiffness: 220, damping: 22}),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{translateY: translateY.value}],
  }));

  return (
    <Animated.View style={animStyle}>
      <TouchableOpacity
        style={styles.socialButton}
        onPress={onPress}
        activeOpacity={0.85}>
        <Image source={icon} style={styles.socialIcon} resizeMode="contain" />
        <Text style={styles.socialLabel}>{label}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ─── Guest Button ─────────────────────────────────────────────────────────────
function GuestButton({onPress}: {onPress?: () => void}) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);

  useEffect(() => {
    opacity.value = withDelay(850, withSpring(1));
    translateY.value = withDelay(850, withSpring(0, {stiffness: 220, damping: 22}));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{translateY: translateY.value}],
  }));

  return (
    <Animated.View style={animStyle}>
      <TouchableOpacity
        style={styles.guestButton}
        onPress={onPress}
        activeOpacity={0.85}>
        <Text style={styles.guestLabel}>Enter as Guest</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ─── Or Divider ──────────────────────────────────────────────────────────────
function OrDivider() {
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withDelay(750, withTiming(1, {duration: 400}));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.dividerContainer, animStyle]}>
      <View style={styles.dividerLine} />
      <Text style={styles.dividerText}>Or</Text>
      <View style={styles.dividerLine} />
    </Animated.View>
  );
}

// ─── Sign Up Footer ───────────────────────────────────────────────────────────
function SignUpFooter() {
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withDelay(1000, withTiming(1, {duration: 400}));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.footerContainer, animStyle]}>
      <Text style={styles.footerText}>Don't have an account? </Text>
      <TouchableOpacity activeOpacity={0.7}>
        <Text style={styles.footerLink}>Sign up</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ─── Main Login Screen ───────────────────────────────────────────────────────
interface LoginScreenProps {
  onBack?: () => void;
  onLogin?: () => void;
}

export default function LoginScreen({onBack, onLogin}: LoginScreenProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <BackgroundGlows />
      <SpeechBubble />
      <RobotMascot />

      {/* Bottom card */}
      <View style={[styles.bottomCard, {paddingBottom: insets.bottom + 16}]}>
        <View style={styles.buttonsContainer}>
          <SocialButton
            icon={googleIcon}
            label="Continue with Google"
            delay={0.5}
            onPress={onLogin}
          />
          <SocialButton
            icon={appleIcon}
            label="Continue with Apple"
            delay={0.65}
            onPress={onLogin}
          />
        </View>
        <OrDivider />
        <GuestButton onPress={onLogin} />
        <SignUpFooter />
      </View>

      {/* Back button */}
      {onBack && (
        <TouchableOpacity
          style={[styles.backButton, {top: insets.top + 10}]}
          onPress={onBack}
          activeOpacity={0.7}>
          <Text style={styles.backArrow}>‹</Text>
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  glow: {
    position: 'absolute',
    borderRadius: 999,
  },
  // Speech Bubble
  speechBubbleContainer: {
    position: 'absolute',
    right: 30,
    top: SCREEN_HEIGHT * 0.16,
    zIndex: 10,
  },
  speechBubble: {
    backgroundColor: 'rgba(28,36,50,0.85)',
    borderWidth: 1.5,
    borderColor: '#00f2ff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderBottomRightRadius: 24,
    borderBottomLeftRadius: 4,
    paddingHorizontal: 17,
    paddingTop: 13,
    paddingBottom: 14,
    width: 135,
  },
  speechText: {
    fontWeight: '700',
    fontSize: 14,
    lineHeight: 20,
    color: 'white',
  },
  speechTail: {
    width: 0,
    height: 0,
    borderTopWidth: 10,
    borderTopColor: 'transparent',
    borderRightWidth: 12,
    borderRightColor: '#00f2ff',
    position: 'absolute',
    bottom: -10,
    left: 0,
  },
  // Robot
  robotContainer: {
    position: 'absolute',
    alignSelf: 'center',
    top: SCREEN_HEIGHT * 0.22,
    width: SCREEN_WIDTH * 0.88,
    height: SCREEN_HEIGHT * 0.3,
  },
  robotImage: {
    width: '100%',
    height: '100%',
  },
  // Bottom Card
  bottomCard: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 32,
  },
  buttonsContainer: {
    gap: 16,
    width: '100%',
  },
  // Social Button
  socialButton: {
    backgroundColor: 'white',
    height: 56,
    borderRadius: 74,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 10},
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 8,
  },
  socialIcon: {
    width: 23,
    height: 23,
  },
  socialLabel: {
    fontWeight: '500',
    fontSize: 16,
    color: 'black',
    lineHeight: 24,
  },
  // Guest Button
  guestButton: {
    height: 56,
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ff00ff',
    shadowColor: '#ff00ff',
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 10,
  },
  guestLabel: {
    fontWeight: '600',
    fontSize: 16,
    color: 'white',
    lineHeight: 24,
  },
  // Divider
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingVertical: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  dividerText: {
    paddingHorizontal: 16,
    fontWeight: '300',
    fontSize: 14,
    color: 'rgba(255,255,255,0.4)',
  },
  // Footer
  footerContainer: {
    paddingVertical: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerText: {
    fontWeight: '400',
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
  },
  footerLink: {
    fontWeight: '700',
    fontSize: 14,
    color: Colors.green,
  },
  // Back Button
  backButton: {
    position: 'absolute',
    left: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 9999,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  backArrow: {
    fontSize: 20,
    color: 'rgba(255,255,255,0.6)',
    marginTop: -2,
  },
  backText: {
    fontWeight: '500',
    fontSize: 13,
    color: 'rgba(255,255,255,0.5)',
  },
});
