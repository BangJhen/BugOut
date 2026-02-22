import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  StatusBar,
  ScrollView,
  Image,
  Switch,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
} from 'react-native-reanimated';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import {Colors} from '../constants/theme';
import Svg, {Path, Circle} from 'react-native-svg';

const backgroundImg = require('../assets/images/background.png');
const userAvatar = require('../assets/images/user_avatar.png');

// ─── SVG Icons ────────────────────────────────────────────────────────────────
function NotificationOffIcon({size = 20, color = '#fff'}: {size?: number; color?: string}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M2 2L22 22"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </Svg>
  );
}

function FilterIcon({size = 20, color = '#fff'}: {size?: number; color?: string}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M4 6h16M7 12h10M10 18h4"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function DarkModeIcon({size = 20, color = '#fff'}: {size?: number; color?: string}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function LanguageIcon({size = 20, color = '#fff'}: {size?: number; color?: string}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" />
      <Path
        d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function QuestionIcon({size = 20, color = '#fff'}: {size?: number; color?: string}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" />
      <Path
        d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path d="M12 17h.01" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </Svg>
  );
}

function InfoIcon({size = 20, color = '#fff'}: {size?: number; color?: string}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" />
      <Path d="M12 16v-4M12 8h.01" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </Svg>
  );
}

function PolicyIcon({size = 20, color = '#fff'}: {size?: number; color?: string}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function ChevronRightIcon({size = 24, color = '#fff'}: {size?: number; color?: string}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M9 18l6-6-6-6"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

// ─── Header ───────────────────────────────────────────────────────────────────
function SettingsHeader({insets}: {insets: {top: number}}) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(-20);

  useEffect(() => {
    opacity.value = withDelay(100, withSpring(1));
    translateY.value = withDelay(100, withSpring(0, {stiffness: 200, damping: 22}));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{translateY: translateY.value}],
  }));

  return (
    <Animated.View style={[styles.header, {paddingTop: insets.top + 8}, animStyle]}>
      <View style={styles.headerRow}>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>
    </Animated.View>
  );
}

// ─── Profile Card ─────────────────────────────────────────────────────────────
function ProfileCard() {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);

  useEffect(() => {
    opacity.value = withDelay(200, withSpring(1));
    translateY.value = withDelay(200, withSpring(0, {stiffness: 200, damping: 22}));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{translateY: translateY.value}],
  }));

  return (
    <Animated.View style={[styles.profileCard, animStyle]}>
      <View style={styles.profileInfo}>
        <LinearGradient
          colors={['#22d3ee', '#ff00ff']}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          style={styles.avatarRing}>
          <View style={styles.avatarInner}>
            <Image source={userAvatar} style={styles.avatarImage} resizeMode="cover" />
          </View>
        </LinearGradient>
        <Text style={styles.profileName}>Michael Pratama</Text>
      </View>
      <ChevronRightIcon size={24} color="white" />
    </Animated.View>
  );
}

// ─── Menu Item ────────────────────────────────────────────────────────────────
interface MenuItemProps {
  icon: React.ReactNode;
  label: string;
  onPress?: () => void;
  showArrow?: boolean;
  showToggle?: boolean;
  toggleValue?: boolean;
  onToggleChange?: (value: boolean) => void;
  delay?: number;
}

function MenuItem({
  icon,
  label,
  onPress,
  showArrow = true,
  showToggle = false,
  toggleValue = false,
  onToggleChange,
  delay = 0,
}: MenuItemProps) {
  const opacity = useSharedValue(0);
  const translateX = useSharedValue(-20);

  useEffect(() => {
    opacity.value = withDelay(delay, withSpring(1));
    translateX.value = withDelay(delay, withSpring(0, {stiffness: 200, damping: 22}));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{translateX: translateX.value}],
  }));

  return (
    <Animated.View style={animStyle}>
      <TouchableOpacity
        style={styles.menuItem}
        onPress={onPress}
        activeOpacity={0.7}
        disabled={showToggle}>
        <View style={styles.menuLeft}>
          {icon}
          <Text style={styles.menuLabel}>{label}</Text>
        </View>
        {showToggle && (
          <Switch
            value={toggleValue}
            onValueChange={onToggleChange}
            trackColor={{false: '#3c3c3c', true: Colors.green}}
            thumbColor="white"
            ios_backgroundColor="#3c3c3c"
          />
        )}
        {showArrow && !showToggle && <ChevronRightIcon size={24} color="white" />}
      </TouchableOpacity>
    </Animated.View>
  );
}

// ─── Menu Section ─────────────────────────────────────────────────────────────
interface MenuSectionProps {
  children: React.ReactNode;
  delay?: number;
}

function MenuSection({children, delay = 0}: MenuSectionProps) {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.95);

  useEffect(() => {
    opacity.value = withDelay(delay, withSpring(1));
    scale.value = withDelay(delay, withSpring(1, {stiffness: 200, damping: 22}));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{scale: scale.value}],
  }));

  return <Animated.View style={[styles.menuSection, animStyle]}>{children}</Animated.View>;
}

// ─── Main Settings Screen ─────────────────────────────────────────────────────
export default function SettingsScreen() {
  const [pauseNotification, setPauseNotification] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const insets = useSafeAreaInsets();

  return (
    <ImageBackground source={backgroundImg} style={styles.container} resizeMode="cover">
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <SettingsHeader insets={insets} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, {paddingBottom: insets.bottom + 120}]}
        showsVerticalScrollIndicator={false}>
        
        <ProfileCard />

        <MenuSection delay={300}>
          <MenuItem
            icon={<NotificationOffIcon size={18} color="white" />}
            label="Pause Notification"
            showToggle
            toggleValue={pauseNotification}
            onToggleChange={setPauseNotification}
            delay={350}
          />
          <View style={styles.menuDivider} />
          <MenuItem
            icon={<FilterIcon size={18} color="white" />}
            label="General Settings"
            onPress={() => {}}
            delay={400}
          />
        </MenuSection>

        <MenuSection delay={450}>
          <MenuItem
            icon={<DarkModeIcon size={20} color="white" />}
            label="Dark Mode"
            showToggle
            toggleValue={darkMode}
            onToggleChange={setDarkMode}
            delay={500}
          />
          <View style={styles.menuDivider} />
          <MenuItem
            icon={<LanguageIcon size={24} color="white" />}
            label="Languange"
            onPress={() => {}}
            delay={550}
          />
        </MenuSection>

        <MenuSection delay={600}>
          <MenuItem
            icon={<QuestionIcon size={20} color="white" />}
            label="FAQ"
            onPress={() => {}}
            delay={650}
          />
          <View style={styles.menuDivider} />
          <MenuItem
            icon={<InfoIcon size={20} color="white" />}
            label="Term of Services"
            onPress={() => {}}
            delay={700}
          />
          <View style={styles.menuDivider} />
          <MenuItem
            icon={<PolicyIcon size={20} color="white" />}
            label="User Policy"
            onPress={() => {}}
            delay={750}
          />
        </MenuSection>
      </ScrollView>
    </ImageBackground>
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
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
  },
  headerTitle: {
    fontWeight: '700',
    fontSize: 16,
    color: 'white',
    lineHeight: 20,
  },
  // Scroll View
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 16,
    paddingHorizontal: 24,
    gap: 20,
  },
  // Profile Card
  profileCard: {
    backgroundColor: '#1b1c2b',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatarRing: {
    width: 49,
    height: 49,
    borderRadius: 25,
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInner: {
    width: 41,
    height: 41,
    backgroundColor: '#111827',
    borderRadius: 21,
    borderWidth: 2,
    borderColor: '#111827',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: {
    width: 37,
    height: 37,
    borderRadius: 19,
  },
  profileName: {
    fontWeight: '700',
    fontSize: 16,
    color: 'white',
    lineHeight: 28,
  },
  // Menu Section
  menuSection: {
    backgroundColor: '#1b1c2b',
    borderRadius: 12,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  menuLabel: {
    fontWeight: '500',
    fontSize: 16,
    color: 'white',
    lineHeight: 28,
  },
  menuDivider: {
    height: 1,
    backgroundColor: '#3c3c3c',
    marginHorizontal: 24,
  },
});
