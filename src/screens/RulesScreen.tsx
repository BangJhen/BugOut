import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  StatusBar,
  ScrollView,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Colors} from '../constants/theme';
import Svg, {Path} from 'react-native-svg';

const backgroundImg = require('../assets/images/background.png');

// ─── SVG Icons ────────────────────────────────────────────────────────────────
function SearchIcon({size = 20, color = '#fff'}: {size?: number; color?: string}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM21 21l-4.35-4.35"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function ChevronDownIcon({size = 20, color = '#fff'}: {size?: number; color?: string}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M6 9l6 6 6-6"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

// ─── Q&A Data ─────────────────────────────────────────────────────────────────
const QA_DATA = [
  {
    id: '1',
    question: 'What is BugOut?',
    answer: 'BugOut is a strategic programming board game powered by Augmented Reality (AR). Players act as robot engineers trying to capture Glitchy, a rogue digital virus moving unpredictably across the motherboard.',
  },
  {
    id: '2',
    question: 'How many players can play?',
    answer: '2-4 players. Each player selects one robot color (Red, Blue, Green, or Yellow) and starts with full HP and default RAM capacity.',
  },
  {
    id: '3',
    question: 'What is the objective?',
    answer: 'Capture Glitchy! A player wins the round immediately when their robot ends a movement cycle on the same tile as Glitchy.',
  },
  {
    id: '4',
    question: 'How do I set up the game?',
    answer: 'Tap PLAY GAME, select number of players (2-4), choose robot colors, place tokens on starting positions, scan the physical board for calibration, and place Glitchy token on the instructed coordinate.',
  },
  {
    id: '5',
    question: 'What are the 4 game phases?',
    answer: '1. Planning (Coding) - Arrange command cards\n2. Compiling (Execution) - Cards are resolved\n3. Glitch Walk (AI Movement) - Glitchy moves\n4. Refill & Evaluation - Prepare next round',
  },
  {
    id: '6',
    question: 'How does the Planning Phase work?',
    answer: 'Secretly arrange up to 5 command cards face down in order. Each card costs 1 RAM. Place RAM tokens equal to the number of cards used. Cards cannot be changed once all players confirm.',
  },
  {
    id: '7',
    question: 'What happens during Compiling Phase?',
    answer: 'Cards are revealed one at a time. All players scan their cards. Movement is processed in order. System checks for wall collisions (CRASH - lose 1 HP) and robot collisions (BATTLE - compare RAM).',
  },
  {
    id: '8',
    question: 'How does Glitchy move?',
    answer: 'If no player captures Glitchy during Compiling Phase, Glitchy moves 1 tile randomly (North, South, East, or West). Players must manually move the physical token to match AR instruction.',
  },
  {
    id: '9',
    question: 'What is RAM and how does it work?',
    answer: 'Each command card costs 1 RAM. RAM determines battle advantage - robot with more RAM wins clashes. Efficient RAM management increases winning chances.',
  },
  {
    id: '10',
    question: 'What happens when HP reaches 0?',
    answer: 'Robot becomes inactive and cannot move in next round (until reset if game mode allows). Robots lose 1 HP when crashing into walls.',
  },
  {
    id: '11',
    question: 'What are the game modes?',
    answer: 'Quick Mode (1 Round - first capture wins), Standard Mode (Best of 3 Rounds), Competitive Mode (Limited RAM, no HP refill between rounds).',
  },
  {
    id: '12',
    question: 'Strategy tips?',
    answer: 'Plan movement sequences carefully, predict opponent positioning, conserve RAM for battles, avoid walls in early cycles, and anticipate Glitchy\'s escape routes.',
  },
];

// ─── Header ───────────────────────────────────────────────────────────────────
function RulesHeader({insets}: {insets: {top: number}}) {
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
        <Text style={styles.headerTitle}>Rules & Tutorial</Text>
        <TouchableOpacity style={styles.searchButton} activeOpacity={0.7}>
          <SearchIcon size={18} color="white" />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

// ─── Video Tutorial Card ──────────────────────────────────────────────────────
function VideoTutorialCard() {
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
    <Animated.View style={[styles.videoSection, animStyle]}>
      <Text style={styles.videoTitle}>Game Tutorial</Text>
      <TouchableOpacity style={styles.videoCard} activeOpacity={0.8}>
        <View style={styles.videoPlaceholder}>
          <View style={styles.playIconCircle}>
            <Text style={styles.playIconText}>▶</Text>
          </View>
          <Text style={styles.videoLabel}>How To Play BugOut</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ─── Q&A Item (Accordion) ─────────────────────────────────────────────────────
interface QAItemProps {
  question: string;
  answer: string;
  delay: number;
}

function QAItem({question, answer, delay}: QAItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const opacity = useSharedValue(0);
  const translateX = useSharedValue(-20);
  const heightValue = useSharedValue(0);
  const rotateValue = useSharedValue(0);

  useEffect(() => {
    opacity.value = withDelay(delay, withSpring(1));
    translateX.value = withDelay(delay, withSpring(0, {stiffness: 200, damping: 22}));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    heightValue.value = withTiming(isExpanded ? 1 : 0, {duration: 300});
    rotateValue.value = withTiming(isExpanded ? 180 : 0, {duration: 300});
  }, [isExpanded, heightValue, rotateValue]);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{translateX: translateX.value}],
  }));

  const answerStyle = useAnimatedStyle(() => ({
    opacity: heightValue.value,
    maxHeight: heightValue.value === 0 ? 0 : 1000,
  }));

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{rotate: `${rotateValue.value}deg`}],
  }));

  return (
    <Animated.View style={[styles.qaItem, animStyle]}>
      <TouchableOpacity
        style={styles.qaQuestion}
        onPress={() => setIsExpanded(!isExpanded)}
        activeOpacity={0.7}>
        <Text style={styles.qaQuestionText}>{question}</Text>
        <Animated.View style={iconStyle}>
          <ChevronDownIcon size={20} color={Colors.primary} />
        </Animated.View>
      </TouchableOpacity>
      
      {isExpanded && (
        <Animated.View style={[styles.qaAnswer, answerStyle]}>
          <Text style={styles.qaAnswerText}>{answer}</Text>
        </Animated.View>
      )}
    </Animated.View>
  );
}

// ─── Main Rules Screen ────────────────────────────────────────────────────────
export default function RulesScreen() {
  const insets = useSafeAreaInsets();

  return (
    <ImageBackground source={backgroundImg} style={styles.container} resizeMode="cover">
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <RulesHeader insets={insets} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, {paddingBottom: insets.bottom + 120}]}
        showsVerticalScrollIndicator={false}>
        
        <VideoTutorialCard />

        <View style={styles.qaSection}>
          {QA_DATA.map((qa, index) => (
            <QAItem
              key={qa.id}
              question={qa.question}
              answer={qa.answer}
              delay={300 + index * 50}
            />
          ))}
        </View>
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
  // Scroll View
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 16,
    paddingHorizontal: 24,
  },
  // Video Section
  videoSection: {
    marginBottom: 24,
  },
  videoTitle: {
    fontWeight: '700',
    fontSize: 16,
    color: 'white',
    lineHeight: 28,
    marginBottom: 12,
  },
  videoCard: {
    backgroundColor: '#1b1c2b',
    borderRadius: 12,
    overflow: 'hidden',
    height: 208,
  },
  videoPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  playIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,0,255,0.2)',
    borderWidth: 2,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playIconText: {
    fontSize: 24,
    color: Colors.primary,
    marginLeft: 4,
  },
  videoLabel: {
    fontWeight: '600',
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
  },
  // Q&A Section
  qaSection: {
    gap: 12,
  },
  qaItem: {
    backgroundColor: '#1b1c2b',
    borderRadius: 12,
    overflow: 'hidden',
  },
  qaQuestion: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  qaQuestionText: {
    flex: 1,
    fontWeight: '600',
    fontSize: 15,
    color: 'white',
    lineHeight: 22,
    marginRight: 12,
  },
  qaAnswer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    overflow: 'hidden',
  },
  qaAnswerText: {
    fontWeight: '400',
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    lineHeight: 22,
  },
});
