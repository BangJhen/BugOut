import React, {useEffect, useState} from 'react';
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
import LinearGradient from 'react-native-linear-gradient';
import {Colors} from '../constants/theme';

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');

const robotImg = require('../assets/images/robot_mascot.png');
const userAvatar = require('../assets/images/user_avatar.png');

// ─── Types ────────────────────────────────────────────────────────────────────
type Tab = 'home' | 'collection' | 'rules' | 'settings';

// ─── Header ───────────────────────────────────────────────────────────────────
function Header({insets}: {insets: {top: number}}) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(-20);

  useEffect(() => {
    opacity.value = withDelay(100, withSpring(1));
    translateY.value = withDelay(
      100,
      withSpring(0, {stiffness: 200, damping: 22}),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{translateY: translateY.value}],
  }));

  return (
    <Animated.View
      style={[styles.header, {paddingTop: insets.top + 8}, animStyle]}>
      {/* User row */}
      <View style={styles.headerRow}>
        {/* Avatar + name */}
        <View style={styles.userInfo}>
          <LinearGradient
            colors={['#22d3ee', '#ff00ff']}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}
            style={styles.avatarRing}>
            <View style={styles.avatarInner}>
              <Image
                source={userAvatar}
                style={styles.avatarImage}
                resizeMode="cover"
              />
            </View>
          </LinearGradient>
          <Text style={styles.userName}>Michael Pratama</Text>
        </View>

        {/* Coin + bell */}
        <View style={styles.headerRight}>
          {/* Coin badge */}
          <View style={styles.coinBadge}>
            <View style={styles.coinIcon}>
              <View style={styles.coinCircle}>
                <Text style={styles.coinSymbol}>$</Text>
              </View>
            </View>
            <Text style={styles.coinText}>563</Text>
          </View>

          {/* Bell button */}
          <TouchableOpacity style={styles.bellButton} activeOpacity={0.7}>
            <Text style={styles.bellIcon}>🔔</Text>
            <View style={styles.notificationDot} />
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
interface StatCardProps {
  label: string;
  value: string;
  borderColor: string;
  delay?: number;
}

function StatCard({label, value, borderColor, delay = 0}: StatCardProps) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(24);

  useEffect(() => {
    opacity.value = withDelay(delay * 1000, withSpring(1));
    translateY.value = withDelay(
      delay * 1000,
      withSpring(0, {stiffness: 200, damping: 22}),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{translateY: translateY.value}],
  }));

  return (
    <Animated.View
      style={[
        styles.statCard,
        {borderColor, borderBottomWidth: 2, borderBottomColor: borderColor},
        animStyle,
      ]}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </Animated.View>
  );
}

// ─── Play Button ──────────────────────────────────────────────────────────────
function PlayButton() {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(28);
  const pulseScale = useSharedValue(1);
  const pulseOpacity = useSharedValue(0.6);

  useEffect(() => {
    opacity.value = withDelay(600, withSpring(1));
    translateY.value = withDelay(
      600,
      withSpring(0, {stiffness: 220, damping: 22}),
    );
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.08, {duration: 1000, easing: Easing.inOut(Easing.ease)}),
        withTiming(1, {duration: 1000, easing: Easing.inOut(Easing.ease)}),
      ),
      -1,
      true,
    );
    pulseOpacity.value = withRepeat(
      withSequence(
        withTiming(0, {duration: 1000, easing: Easing.inOut(Easing.ease)}),
        withTiming(0.6, {duration: 1000, easing: Easing.inOut(Easing.ease)}),
      ),
      -1,
      true,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{translateY: translateY.value}],
  }));

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{scale: pulseScale.value}],
    opacity: pulseOpacity.value,
  }));

  return (
    <Animated.View style={[styles.playButtonWrapper, animStyle]}>
      {/* Pulse ring */}
      <Animated.View style={[styles.pulseRing, pulseStyle]} />

      <TouchableOpacity style={styles.playButton} activeOpacity={0.85}>
        <LinearGradient
          colors={['#cc00cc', '#ff00ff', '#ff44ff']}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          style={styles.playButtonGradient}>
          <Text style={styles.playIcon}>▶</Text>
          <Text style={styles.playText}>PLAY GAME</Text>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ─── Bottom Nav ───────────────────────────────────────────────────────────────
interface NavButtonProps {
  icon: string;
  label: string;
  active?: boolean;
  onPress: () => void;
}

function NavButton({icon, label, active, onPress}: NavButtonProps) {
  return (
    <TouchableOpacity
      style={styles.navButton}
      onPress={onPress}
      activeOpacity={0.7}>
      <Text
        style={[
          styles.navIcon,
          {color: active ? Colors.primary : Colors.navInactive},
        ]}>
        {icon}
      </Text>
      <Text
        style={[
          styles.navLabel,
          {color: active ? Colors.primary : Colors.navInactive},
        ]}>
        {label}
      </Text>
      {active && <View style={styles.navIndicator} />}
    </TouchableOpacity>
  );
}

function BottomNav({
  activeTab,
  onTabChange,
  bottomInset,
}: {
  activeTab: Tab;
  onTabChange: (t: Tab) => void;
  bottomInset: number;
}) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(40);

  useEffect(() => {
    opacity.value = withDelay(200, withSpring(1));
    translateY.value = withDelay(
      200,
      withSpring(0, {stiffness: 200, damping: 24}),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{translateY: translateY.value}],
  }));

  return (
    <Animated.View
      style={[styles.bottomNav, {paddingBottom: bottomInset + 8}, animStyle]}>
      <NavButton
        icon="🏠"
        label="HOME"
        active={activeTab === 'home'}
        onPress={() => onTabChange('home')}
      />
      <NavButton
        icon="📚"
        label="COLLECTION"
        active={activeTab === 'collection'}
        onPress={() => onTabChange('collection')}
      />
      <NavButton
        icon="📋"
        label="RULES"
        active={activeTab === 'rules'}
        onPress={() => onTabChange('rules')}
      />
      <NavButton
        icon="⚙️"
        label="SETTINGS"
        active={activeTab === 'settings'}
        onPress={() => onTabChange('settings')}
      />
    </Animated.View>
  );
}

// ─── Tab Content Placeholder ──────────────────────────────────────────────────
function TabPlaceholder({label}: {label: string}) {
  return (
    <View style={styles.placeholderContainer}>
      <Text style={styles.placeholderText}>{label}</Text>
    </View>
  );
}

// ─── Home Tab Content ─────────────────────────────────────────────────────────
function HomeContent() {
  const robotOpacity = useSharedValue(0);
  const robotTranslateY = useSharedValue(30);
  const floatY = useSharedValue(0);

  useEffect(() => {
    robotOpacity.value = withDelay(300, withSpring(1));
    robotTranslateY.value = withDelay(
      300,
      withSpring(0, {stiffness: 200, damping: 22}),
    );
    floatY.value = withRepeat(
      withSequence(
        withTiming(-10, {duration: 2000, easing: Easing.inOut(Easing.ease)}),
        withTiming(0, {duration: 2000, easing: Easing.inOut(Easing.ease)}),
      ),
      -1,
      true,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const robotStyle = useAnimatedStyle(() => ({
    opacity: robotOpacity.value,
    transform: [{translateY: robotTranslateY.value + floatY.value}],
  }));

  return (
    <View style={styles.homeContent}>
      {/* Gradient overlay behind robot */}
      <LinearGradient
        colors={['rgba(22,78,99,0)', 'rgba(22,78,99,0.1)', '#0a0c10']}
        style={styles.gradientOverlay}
      />

      {/* Robot mascot */}
      <Animated.View style={[styles.homeRobotContainer, robotStyle]}>
        <Image
          source={robotImg}
          style={styles.homeRobotImage}
          resizeMode="contain"
        />
      </Animated.View>

      {/* Pink glow under mascot */}
      <View style={styles.pinkGlow} />

      {/* Stat cards */}
      <View style={styles.statsRow}>
        <StatCard
          label="BADGE"
          value="121"
          borderColor="rgba(0,242,255,0.5)"
          delay={0.4}
        />
        <StatCard
          label="VICTORY"
          value="12x"
          borderColor="rgba(255,0,255,0.5)"
          delay={0.5}
        />
        <StatCard
          label="ACCURACY"
          value="76.6%"
          borderColor="rgba(204,255,0,0.5)"
          delay={0.6}
        />
      </View>

      {/* Play Game button */}
      <View style={styles.playSection}>
        <PlayButton />
      </View>
    </View>
  );
}

// ─── Main Home Screen ─────────────────────────────────────────────────────────
interface HomeScreenProps {
  onLogout?: () => void;
}

export default function HomeScreen({onLogout}: HomeScreenProps) {
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <Header insets={insets} />

      {/* Content area */}
      <View style={styles.contentArea}>
        {activeTab === 'home' && <HomeContent />}
        {activeTab === 'collection' && <TabPlaceholder label="COLLECTION" />}
        {activeTab === 'rules' && <TabPlaceholder label="RULES" />}
        {activeTab === 'settings' && (
          <View style={styles.settingsContent}>
            <TabPlaceholder label="SETTINGS" />
            {onLogout && (
              <TouchableOpacity
                style={styles.logoutButton}
                onPress={onLogout}
                activeOpacity={0.7}>
                <Text style={styles.logoutText}>Logout</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      <BottomNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        bottomInset={insets.bottom}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  // Header
  header: {
    backgroundColor: Colors.background,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    zIndex: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,242,255,0.2)',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 14,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarRing: {
    width: 44,
    height: 44,
    borderRadius: 22,
    padding: 3,
  },
  avatarInner: {
    flex: 1,
    backgroundColor: '#111827',
    borderRadius: 20,
    padding: 2,
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 18,
  },
  userName: {
    fontWeight: '700',
    fontSize: 14,
    color: 'white',
    lineHeight: 20,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  coinBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 5,
    paddingRight: 13,
    paddingVertical: 5,
    borderRadius: 9999,
    gap: 8,
    backgroundColor: 'rgba(31,41,55,0.8)',
    borderWidth: 1,
    borderColor: 'rgba(55,65,81,0.5)',
  },
  coinIcon: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  coinCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.coin,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.coin,
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0.5,
    shadowRadius: 4,
  },
  coinSymbol: {
    fontWeight: '700',
    fontSize: 14,
    color: 'white',
  },
  coinText: {
    fontWeight: '700',
    fontSize: 14,
    color: 'white',
  },
  bellButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(31,41,55,0.5)',
    borderWidth: 1,
    borderColor: 'rgba(55,65,81,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellIcon: {
    fontSize: 16,
  },
  notificationDot: {
    position: 'absolute',
    right: 2,
    top: 2,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#ff00ff',
    shadowColor: '#ff00ff',
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0.8,
    shadowRadius: 5,
  },
  // Content Area
  contentArea: {
    flex: 1,
  },
  // Home Content
  homeContent: {
    flex: 1,
  },
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: -6,
    right: 0,
    height: SCREEN_HEIGHT * 0.45,
    zIndex: 0,
  },
  homeRobotContainer: {
    alignSelf: 'center',
    width: SCREEN_WIDTH * 0.78,
    height: SCREEN_HEIGHT * 0.3,
    marginTop: 20,
    zIndex: 1,
  },
  homeRobotImage: {
    width: '100%',
    height: '100%',
  },
  pinkGlow: {
    position: 'absolute',
    top: '22%',
    alignSelf: 'center',
    width: 150,
    height: 80,
    borderRadius: 999,
    backgroundColor: 'rgba(255,0,255,0.2)',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 6,
    marginTop: 10,
  },
  // Stat Card
  statCard: {
    flex: 1,
    backgroundColor: Colors.darkCard,
    borderRadius: 24,
    paddingVertical: 13,
    paddingHorizontal: 17,
    gap: 4,
    borderWidth: 1,
  },
  statLabel: {
    fontWeight: '400',
    fontSize: 10,
    color: Colors.gray,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  statValue: {
    fontWeight: '700',
    fontSize: 20,
    color: 'white',
    lineHeight: 32,
  },
  // Play Button
  playButtonWrapper: {
    alignItems: 'center',
    marginTop: 30,
  },
  pulseRing: {
    position: 'absolute',
    width: SCREEN_WIDTH * 0.78,
    height: 64,
    borderRadius: 74,
    borderWidth: 2,
    borderColor: 'rgba(255,0,255,0.5)',
  },
  playButton: {
    width: SCREEN_WIDTH * 0.78,
    height: 64,
    borderRadius: 74,
    overflow: 'hidden',
    shadowColor: '#ff00ff',
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0.45,
    shadowRadius: 28,
    elevation: 12,
  },
  playButtonGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  playIcon: {
    fontSize: 18,
    color: 'white',
  },
  playText: {
    fontWeight: '700',
    fontSize: 20,
    color: 'white',
    letterSpacing: 1,
  },
  playSection: {
    alignItems: 'center',
    marginTop: 20,
  },
  // Placeholder
  placeholderContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    fontWeight: '700',
    fontSize: 22,
    color: 'rgba(255,255,255,0.15)',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  // Settings
  settingsContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
  },
  logoutButton: {
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 9999,
    backgroundColor: 'rgba(255,0,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,0,255,0.35)',
  },
  logoutText: {
    fontWeight: '600',
    fontSize: 14,
    color: '#ff00ff',
    letterSpacing: 0.5,
  },
  // Bottom Nav
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 16,
    paddingHorizontal: 32,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,242,255,0.2)',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    backgroundColor: Colors.background,
  },
  navButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    gap: 4,
  },
  navIcon: {
    fontSize: 24,
  },
  navLabel: {
    fontWeight: '500',
    fontSize: 10,
    letterSpacing: -0.45,
    textTransform: 'uppercase',
  },
  navIndicator: {
    width: 32,
    height: 2,
    borderRadius: 1,
    backgroundColor: '#ff00ff',
    shadowColor: '#ff00ff',
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0.8,
    shadowRadius: 4,
    marginTop: 2,
  },
});
