import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Image,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Svg, {Path} from 'react-native-svg';
import LinearGradient from 'react-native-linear-gradient';

const backgroundImg = require('../assets/images/backgrounds/background.png');
const coinIcon = require('../assets/images/icons/money.png');

// ─── Icons ────────────────────────────────────────────────────────────────────
function BackIcon({size = 24, color = '#fff'}: {size?: number; color?: string}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M19 12H5M12 19l-7-7 7-7"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function SearchIcon({size = 24, color = '#fff'}: {size?: number; color?: string}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function LockIcon({size = 24, color = 'rgba(255,255,255,0.3)'}: {size?: number; color?: string}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M19 11H5a2 2 0 00-2 2v7a2 2 0 002 2h14a2 2 0 002-2v-7a2 2 0 00-2-2zM7 11V7a5 5 0 0110 0v4"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

// ─── Mock Data ────────────────────────────────────────────────────────────────
const SHOP_ITEMS = [
  {
    id: '1',
    type: 'CHIP',
    name: 'Voltix',
    price: 563,
    image: require('../assets/images/players/chip-blue.png'),
    locked: false,
  },
  {
    id: '2',
    type: 'CHIP',
    name: 'Cyberon',
    price: 563,
    image: require('../assets/images/players/chip-red.png'),
    locked: false,
  },
  {
    id: '3',
    type: 'GLITCHY',
    name: 'BugZilla',
    price: 563,
    image: require('../assets/images/characters/Glitchy.png'),
    locked: false,
  },
  {
    id: '4',
    type: 'GLITCHY',
    name: 'Virex',
    price: 563,
    image: require('../assets/images/characters/Glitchy.png'),
    locked: false,
  },
  {
    id: '5',
    type: 'GLITCHY',
    name: 'NanoGlitch',
    price: 563,
    image: require('../assets/images/characters/Glitchy.png'),
    locked: false,
  },
  {
    id: '6',
    type: 'GLITCHY',
    name: 'ByteBite',
    price: 563,
    image: require('../assets/images/characters/Glitchy.png'),
    locked: true,
  },
  {
    id: '7',
    type: 'CHIP',
    name: 'BluSpark',
    price: 563,
    image: require('../assets/images/players/chip-green.png'),
    locked: true,
  },
  {
    id: '8',
    type: 'CHIP',
    name: 'HexaCore',
    price: 563,
    image: require('../assets/images/players/chip-yellow.png'),
    locked: true,
  },
];

// ─── Shop Item Card ───────────────────────────────────────────────────────────
interface ShopItemCardProps {
  item: typeof SHOP_ITEMS[0];
  onPress: () => void;
}

function ShopItemCard({item, onPress}: ShopItemCardProps) {
  return (
    <TouchableOpacity
      style={[styles.itemCard, item.locked && styles.itemCardLocked]}
      onPress={onPress}
      activeOpacity={0.8}
      disabled={item.locked}>
      {/* Price Badge */}
      <View style={styles.priceBadge}>
        <Image source={coinIcon} style={styles.coinIconSmall} />
        <Text style={styles.priceText}>{item.price}</Text>
      </View>

      {/* Character Image */}
      <View style={styles.itemImageContainer}>
        <Image
          source={item.image}
          style={[styles.itemImage, item.locked && styles.itemImageLocked]}
          resizeMode="contain"
        />
      </View>

      {/* Item Info */}
      <View style={styles.itemInfo}>
        <Text
          style={[
            styles.itemType,
            item.type === 'CHIP' ? styles.itemTypeChip : styles.itemTypeGlitchy,
          ]}>
          {item.type}
        </Text>
        <Text style={styles.itemName}>{item.name}</Text>
      </View>

      {/* Lock Overlay */}
      {item.locked && (
        <View style={styles.lockOverlay}>
          <LockIcon size={32} />
          <Text style={styles.lockedText}>LOCKED</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

// ─── Main Shop Screen ─────────────────────────────────────────────────────────
interface ShopScreenProps {
  onBack: () => void;
}

export default function ShopScreen({onBack}: ShopScreenProps) {
  const insets = useSafeAreaInsets();
  const [selectedFilter, setSelectedFilter] = useState<'All' | 'Chip' | 'Glitchy'>('All');
  const [userCoins] = useState(563);

  const filteredItems = SHOP_ITEMS.filter(item => {
    if (selectedFilter === 'All') return true;
    if (selectedFilter === 'Chip') return item.type === 'CHIP';
    if (selectedFilter === 'Glitchy') return item.type === 'GLITCHY';
    return true;
  });

  const handleItemPress = (item: typeof SHOP_ITEMS[0]) => {
    if (!item.locked) {
      console.log('Purchase item:', item.name);
      // TODO: Implement purchase logic
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      {/* Background */}
      <Image source={backgroundImg} style={styles.background} />

      {/* Header */}
      <View style={[styles.header, {paddingTop: insets.top + 14}]}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={onBack}
            activeOpacity={0.7}>
            <BackIcon size={26} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Shop</Text>
        </View>

        <View style={styles.headerRight}>
          {/* Coin Balance */}
          <View style={styles.coinBalance}>
            <Image source={coinIcon} style={styles.coinIcon} />
            <Text style={styles.coinText}>{userCoins}</Text>
          </View>

          {/* Search Button */}
          <TouchableOpacity style={styles.searchButton} activeOpacity={0.7}>
            <SearchIcon size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <View style={styles.filterTabs}>
          <TouchableOpacity
            style={[
              styles.filterTab,
              selectedFilter === 'All' && styles.filterTabActive,
            ]}
            onPress={() => setSelectedFilter('All')}
            activeOpacity={0.8}>
            <Text
              style={[
                styles.filterTabText,
                selectedFilter === 'All' && styles.filterTabTextActive,
              ]}>
              All
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterTab,
              selectedFilter === 'Chip' && styles.filterTabActive,
            ]}
            onPress={() => setSelectedFilter('Chip')}
            activeOpacity={0.8}>
            <Text
              style={[
                styles.filterTabText,
                selectedFilter === 'Chip' && styles.filterTabTextActive,
              ]}>
              Chip
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterTab,
              selectedFilter === 'Glitchy' && styles.filterTabActive,
            ]}
            onPress={() => setSelectedFilter('Glitchy')}
            activeOpacity={0.8}>
            <Text
              style={[
                styles.filterTabText,
                selectedFilter === 'Glitchy' && styles.filterTabTextActive,
              ]}>
              Glitchy
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Shop Items Grid */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View style={styles.itemsGrid}>
          {filteredItems.map(item => (
            <ShopItemCard
              key={item.id}
              item={item}
              onPress={() => handleItemPress(item)}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f1020',
  },
  background: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    opacity: 0.3,
  },
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 242, 255, 0.2)',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  backButton: {
    width: 26,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    fontFamily: 'Outfit-Bold',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  coinBalance: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(31, 41, 55, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(55, 65, 81, 0.5)',
    borderRadius: 9999,
    paddingLeft: 5,
    paddingRight: 13,
    paddingVertical: 5,
    height: 38,
  },
  coinIcon: {
    width: 24,
    height: 24,
    marginRight: 8,
  },
  coinText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
    fontFamily: 'Outfit-Bold',
  },
  searchButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Filter Tabs
  filterContainer: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
  },
  filterTabs: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 9999,
    padding: 7,
    gap: 0,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterTabActive: {
    backgroundColor: '#ff00ff',
  },
  filterTabText: {
    fontSize: 14,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.4)',
    fontFamily: 'Outfit-Bold',
  },
  filterTabTextActive: {
    color: '#fff',
  },
  // Items Grid
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  itemsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 20,
    justifyContent: 'space-between',
  },
  // Item Card
  itemCard: {
    width: '47%',
    backgroundColor: '#1b1c2b',
    borderWidth: 1,
    borderColor: '#24b8cf',
    borderRadius: 12,
    padding: 12,
    height: 230,
    position: 'relative',
  },
  itemCardLocked: {
    opacity: 0.25,
  },
  priceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(31, 41, 55, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(55, 65, 81, 0.5)',
    borderRadius: 9999,
    paddingHorizontal: 5,
    paddingVertical: 5,
    alignSelf: 'flex-end',
    height: 25,
    marginBottom: 11,
  },
  coinIconSmall: {
    width: 16,
    height: 16,
    marginRight: 4,
  },
  priceText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
    fontFamily: 'Outfit-Bold',
  },
  itemImageContainer: {
    width: '100%',
    height: 105,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 11,
  },
  itemImage: {
    width: '100%',
    height: '100%',
  },
  itemImageLocked: {
    opacity: 0.3,
  },
  itemInfo: {
    gap: 0,
  },
  itemType: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Outfit-SemiBold',
    lineHeight: 16,
  },
  itemTypeChip: {
    color: '#24b8cf',
  },
  itemTypeGlitchy: {
    color: '#7fff00',
  },
  itemName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    fontFamily: 'Outfit-SemiBold',
    lineHeight: 28,
  },
  lockOverlay: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{translateX: -40}, {translateY: -30}],
    alignItems: 'center',
    gap: 8,
  },
  lockedText: {
    fontSize: 10,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.3)',
    fontFamily: 'SpaceGrotesk-Bold',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
});
