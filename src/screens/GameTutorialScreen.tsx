import React, {useState, useRef, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  StatusBar,
  Dimensions,
  FlatList,
  Image,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
} from 'react-native-reanimated';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Colors} from '../constants/theme';

const {width: SCREEN_WIDTH} = Dimensions.get('window');
const backgroundImg = require('../assets/images/background.png');
const robotImg = require('../assets/images/robot_mascot.png');
const glitchyImg = require('../assets/images/Glitchy.png');

// ─── Tutorial Data ────────────────────────────────────────────────────────────
const TUTORIAL_STEPS = [
  {
    id: '1',
    title: "What's Your Mission?",
    description: 'Catch Glitchy by building the right strategy with your cards.',
    image: 'mission',
  },
  {
    id: '2',
    title: 'Setup Your Game',
    description: 'Choose your robot color, scan the board, and place your tokens on starting positions.',
    image: 'setup',
  },
  {
    id: '3',
    title: 'Game Phases',
    description: 'Plan your moves, execute cards, watch Glitchy move, then refill and repeat!',
    image: 'phases',
  },
  {
    id: '4',
    title: 'Strategy Tips',
    description: 'Conserve RAM for battles, avoid walls, and predict opponent movements.',
    image: 'strategy',
  },
  {
    id: '5',
    title: 'Ready to Play?',
    description: "You're all set! Tap 'Start Game' to begin your adventure.",
    image: 'ready',
  },
];

// ─── Tutorial Slide ───────────────────────────────────────────────────────────
interface TutorialSlideProps {
  item: typeof TUTORIAL_STEPS[0];
  index: number;
}

function TutorialSlide({item, index}: TutorialSlideProps) {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.9);

  useEffect(() => {
    opacity.value = withDelay(200, withSpring(1));
    scale.value = withDelay(200, withSpring(1, {stiffness: 200, damping: 22}));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{scale: scale.value}],
  }));

  return (
    <View style={styles.slide}>
      {/* Image Section */}
      <Animated.View style={[styles.imageSection, animStyle]}>
        <View style={styles.imageContainer}>
          {index === 0 && (
            <>
              <Image source={robotImg} style={styles.robotImage} resizeMode="contain" />
              <Image source={glitchyImg} style={styles.glitchyImage} resizeMode="contain" />
            </>
          )}
          {index > 0 && (
            <View style={styles.placeholderImage}>
              <Text style={styles.placeholderText}>Step {index + 1}</Text>
            </View>
          )}
        </View>
      </Animated.View>

      {/* Text Section */}
      <Animated.View style={[styles.textSection, animStyle]}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.description}>{item.description}</Text>
      </Animated.View>
    </View>
  );
}

// ─── Pagination Dots ──────────────────────────────────────────────────────────
interface PaginationDotsProps {
  activeIndex: number;
  totalSteps: number;
}

function PaginationDots({activeIndex, totalSteps}: PaginationDotsProps) {
  return (
    <View style={styles.pagination}>
      {Array.from({length: totalSteps}).map((_, index) => (
        <View
          key={index}
          style={[
            styles.dot,
            index === activeIndex ? styles.dotActive : styles.dotInactive,
          ]}
        />
      ))}
    </View>
  );
}

// ─── Main Game Tutorial Screen ────────────────────────────────────────────────
interface GameTutorialScreenProps {
  onComplete: () => void;
  onSkip: () => void;
}

export default function GameTutorialScreen({onComplete, onSkip}: GameTutorialScreenProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const insets = useSafeAreaInsets();

  const handleNext = () => {
    if (currentIndex < TUTORIAL_STEPS.length - 1) {
      const nextIndex = currentIndex + 1;
      flatListRef.current?.scrollToIndex({index: nextIndex, animated: true});
      setCurrentIndex(nextIndex);
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    onSkip();
  };

  const onViewableItemsChanged = useRef(({viewableItems}: any) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index || 0);
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  return (
    <ImageBackground source={backgroundImg} style={styles.container} resizeMode="cover">
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Status bar spacer */}
      <View style={{height: insets.top}} />

      {/* Carousel */}
      <FlatList
        ref={flatListRef}
        data={TUTORIAL_STEPS}
        renderItem={({item, index}) => <TutorialSlide item={item} index={index} />}
        keyExtractor={item => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        scrollEventThrottle={16}
        style={styles.carousel}
      />

      {/* Bottom Section */}
      <View style={[styles.bottomSection, {paddingBottom: insets.bottom + 32}]}>
        <PaginationDots activeIndex={currentIndex} totalSteps={TUTORIAL_STEPS.length} />

        <View style={styles.buttonSection}>
          <TouchableOpacity style={styles.nextButton} onPress={handleNext} activeOpacity={0.85}>
            <Text style={styles.nextButtonText}>
              {currentIndex === TUTORIAL_STEPS.length - 1 ? 'Start Game' : 'Next'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleSkip} activeOpacity={0.7}>
            <Text style={styles.skipText}>
              Do you understand? <Text style={styles.skipLink}>Skip</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  carousel: {
    flex: 1,
  },
  slide: {
    width: SCREEN_WIDTH,
    flex: 1,
    paddingHorizontal: 32,
  },
  // Image Section
  imageSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
  },
  imageContainer: {
    width: SCREEN_WIDTH - 64,
    height: 300,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  robotImage: {
    width: 180,
    height: 180,
    position: 'absolute',
    left: 20,
    top: 20,
  },
  glitchyImage: {
    width: 140,
    height: 140,
    position: 'absolute',
    right: 20,
    bottom: 20,
  },
  placeholderImage: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255,0,255,0.1)',
    borderWidth: 2,
    borderColor: 'rgba(255,0,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    fontSize: 24,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.3)',
  },
  // Text Section
  textSection: {
    paddingHorizontal: 8,
    paddingVertical: 40,
  },
  title: {
    fontWeight: '700',
    fontSize: 24,
    color: 'white',
    textAlign: 'center',
    lineHeight: 32,
    marginBottom: 16,
  },
  description: {
    fontWeight: '400',
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 12,
  },
  // Bottom Section
  bottomSection: {
    paddingHorizontal: 32,
    paddingTop: 20,
  },
  pagination: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 24,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  dotActive: {
    width: 24,
    backgroundColor: Colors.primary,
  },
  dotInactive: {
    width: 8,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  // Buttons
  buttonSection: {
    gap: 16,
  },
  nextButton: {
    backgroundColor: Colors.primary,
    borderRadius: 9999,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
  nextButtonText: {
    fontWeight: '700',
    fontSize: 20,
    color: 'white',
    letterSpacing: 0.5,
  },
  skipText: {
    fontWeight: '400',
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
  },
  skipLink: {
    fontWeight: '600',
    color: Colors.green,
  },
});
