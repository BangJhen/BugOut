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
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
} from 'react-native-reanimated';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../navigation/AppNavigator';
import {Colors} from '../constants/theme';

const backgroundImg = require('../assets/images/backgrounds/background.png');
const chipImg = require('../assets/images/players/chip-blue.png');
const glitchyImg = require('../assets/images/characters/Glitchy.png');

// Mock data for characters
const CHARACTERS = [
  {
    id: '1',
    type: 'CHIP',
    name: 'MegaByte',
    image: require('../assets/images/characters/robot_mascot.png'),
    category: 'chip',
    isUsed: true,
  },
  {
    id: '2',
    type: 'GLITCHY',
    name: 'GlitcPrime',
    image: glitchyImg,
    category: 'glitchy',
    isUsed: true,
  },
];

type FilterType = 'all' | 'chip' | 'glitchy';

// ─── Header ───────────────────────────────────────────────────────────────────
function CollectionHeader({insets}: {insets: {top: number}}) {
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
        <Text style={styles.headerTitle}>Collection</Text>
        
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

          {/* Search button */}
          <TouchableOpacity style={styles.searchButton} activeOpacity={0.7}>
            <SearchIcon size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
}

// ─── Filter Tabs ──────────────────────────────────────────────────────────────
interface FilterTabsProps {
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
}

function FilterTabs({activeFilter, onFilterChange}: FilterTabsProps) {
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
    <Animated.View style={[styles.filterContainer, animStyle]}>
      <TouchableOpacity
        style={[styles.filterTab, activeFilter === 'all' && styles.filterTabActive]}
        onPress={() => onFilterChange('all')}
        activeOpacity={0.7}>
        <Text style={[styles.filterText, activeFilter === 'all' && styles.filterTextActive]}>
          All
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.filterTab, activeFilter === 'chip' && styles.filterTabActive]}
        onPress={() => onFilterChange('chip')}
        activeOpacity={0.7}>
        <Text style={[styles.filterText, activeFilter === 'chip' && styles.filterTextActive]}>
          Chip
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.filterTab, activeFilter === 'glitchy' && styles.filterTabActive]}
        onPress={() => onFilterChange('glitchy')}
        activeOpacity={0.7}>
        <Text style={[styles.filterText, activeFilter === 'glitchy' && styles.filterTextActive]}>
          Glitchy
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ─── Character Card ───────────────────────────────────────────────────────────
interface CharacterCardProps {
  character: typeof CHARACTERS[0];
  index: number;
}

function CharacterCard({character, index}: CharacterCardProps) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(30);
  const scale = useSharedValue(0.9);

  useEffect(() => {
    const delay = 400 + index * 100;
    opacity.value = withDelay(delay, withSpring(1));
    translateY.value = withDelay(delay, withSpring(0, {stiffness: 200, damping: 22}));
    scale.value = withDelay(delay, withSpring(1, {stiffness: 200, damping: 22}));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{translateY: translateY.value}, {scale: scale.value}],
  }));

  return (
    <Animated.View style={[styles.characterCard, animStyle]}>
      {character.isUsed && (
        <View style={styles.usedBadge}>
          <Text style={styles.usedText}>Used</Text>
        </View>
      )}
      
      <View style={styles.characterImageContainer}>
        <Image
          source={character.image}
          style={styles.characterImage}
          resizeMode="contain"
        />
      </View>
      
      <View style={styles.characterInfo}>
        <Text style={styles.characterType}>{character.type}</Text>
        <Text style={styles.characterName}>{character.name}</Text>
      </View>
    </Animated.View>
  );
}

// ─── Shop Button ──────────────────────────────────────────────────────────────
function ShopButton() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.8);

  useEffect(() => {
    opacity.value = withDelay(600, withSpring(1));
    scale.value = withDelay(600, withSpring(1, {stiffness: 200, damping: 15}));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{scale: scale.value}],
  }));

  const handleShopPress = () => {
    navigation.navigate('Shop');
  };

  return (
    <Animated.View style={[styles.shopButtonContainer, animStyle]}>
      <TouchableOpacity style={styles.shopButton} activeOpacity={0.85} onPress={handleShopPress}>
        <ShoppingBagIcon size={20} color="white" />
        <Text style={styles.shopButtonText}>Shop</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ─── Search Icon ──────────────────────────────────────────────────────────────
function SearchIcon({size = 24, color = '#fff'}: {size?: number; color?: string}) {
  return (
    <View style={{width: size, height: size}}>
      <View style={[
        styles.searchIconCircle,
        {
          width: size * 0.7,
          height: size * 0.7,
          borderRadius: size * 0.35,
          borderWidth: 2,
          borderColor: color,
        },
      ]} />
      <View style={[
        styles.searchIconHandle,
        {
          width: size * 0.35,
          height: 2,
          backgroundColor: color,
        },
      ]} />
    </View>
  );
}

// ─── Shopping Bag Icon (SVG) ─────────────────────────────────────────────────
function ShoppingBagIcon({size = 24, color = '#fff'}: {size?: number; color?: string}) {
  return (
    <View style={{width: size, height: size}}>
      <View style={[
        styles.bagBody,
        {
          width: size * 0.75,
          height: size * 0.65,
          borderWidth: 2,
          borderColor: color,
          borderRadius: size * 0.1,
          marginTop: size * 0.25,
          marginLeft: size * 0.125,
        },
      ]} />
      <View style={[
        styles.bagHandle,
        {
          width: size * 0.45,
          height: size * 0.35,
          borderWidth: 2,
          borderColor: color,
          borderRadius: size * 0.25,
          borderBottomWidth: 0,
          position: 'absolute',
          top: size * 0.05,
          left: size * 0.275,
        },
      ]} />
    </View>
  );
}

// ─── Main Collection Screen ───────────────────────────────────────────────────
export default function CollectionScreen() {
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const insets = useSafeAreaInsets();

  const filteredCharacters = CHARACTERS.filter(char => {
    if (activeFilter === 'all') return true;
    return char.category === activeFilter;
  });

  return (
    <ImageBackground source={backgroundImg} style={styles.container} resizeMode="cover">
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      <CollectionHeader insets={insets} />
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, {paddingBottom: insets.bottom + 120}]}
        showsVerticalScrollIndicator={false}>
        
        <FilterTabs activeFilter={activeFilter} onFilterChange={setActiveFilter} />
        
        <View style={styles.characterGrid}>
          {filteredCharacters.map((character, index) => (
            <CharacterCard key={character.id} character={character} index={index} />
          ))}
        </View>
      </ScrollView>
      
      <ShopButton />
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
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 14,
  },
  headerTitle: {
    fontWeight: '700',
    fontSize: 16,
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
  searchButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(31,41,55,0.5)',
    borderWidth: 1,
    borderColor: 'rgba(55,65,81,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchIconCircle: {
    position: 'absolute',
    top: 2,
    left: 2,
  },
  searchIconHandle: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    transform: [{rotate: '45deg'}],
  },
  bagBody: {},
  bagHandle: {},
  // Scroll View
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 16,
  },
  // Filter Tabs
  filterContainer: {
    flexDirection: 'row',
    marginHorizontal: 24,
    marginTop: 16,
    marginBottom: 24,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    padding: 7,
    gap: 7,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterTabActive: {
    backgroundColor: Colors.primary,
  },
  filterText: {
    fontWeight: '700',
    fontSize: 14,
    color: 'rgba(255,255,255,0.4)',
    lineHeight: 20,
  },
  filterTextActive: {
    color: 'white',
  },
  // Character Grid
  characterGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 24,
    gap: 12,
  },
  characterCard: {
    width: '48%',
    backgroundColor: '#1b1c2b',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.green,
    padding: 12,
    gap: 11,
  },
  usedBadge: {
    alignSelf: 'flex-end',
    backgroundColor: 'rgba(153,255,0,0.1)',
    borderWidth: 1,
    borderColor: Colors.green,
    borderRadius: 24,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  usedText: {
    fontWeight: '400',
    fontSize: 12,
    color: Colors.green,
    lineHeight: 16,
  },
  characterImageContainer: {
    width: '100%',
    aspectRatio: 126 / 102,
    alignItems: 'center',
    justifyContent: 'center',
  },
  characterImage: {
    width: '100%',
    height: '100%',
  },
  characterInfo: {
    gap: 0,
  },
  characterType: {
    fontWeight: '600',
    fontSize: 14,
    color: '#24b8cf',
    lineHeight: 16,
  },
  characterName: {
    fontWeight: '600',
    fontSize: 18,
    color: 'white',
    lineHeight: 28,
  },
  // Shop Button
  shopButtonContainer: {
    position: 'absolute',
    bottom: 30,
    right: 24,
    zIndex: 20,
  },
  shopButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 9999,
    shadowColor: Colors.primary,
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
  shopButtonText: {
    fontWeight: '600',
    fontSize: 20,
    color: 'white',
    lineHeight: 24,
  },
});
