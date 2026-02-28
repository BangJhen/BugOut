# Multi-Marker AR Game Design
## 16 Markers with Single Moving Character

Date: February 28, 2026
Branch: `feature/ar-library-research`

---

## 🎯 **Game Concept**

**Setup:**
- 16 physical markers placed on game board
- 1 3D character that spawns on designated marker
- Character moves between markers based on game logic
- Smooth animations during movement

---

## 📊 **Technical Feasibility**

### **ViroReact Capabilities:**

| Feature | Limit | Status |
|---------|-------|--------|
| Max markers defined | Unlimited | ✅ |
| Max simultaneous tracking | 25 (iOS ARKit 2.0+) | ✅ |
| Max simultaneous tracking | 20 (Android ARCore) | ✅ |
| **16 markers** | Well within limits | ✅ |
| Performance | Excellent | ✅ |

### **Physical Limitations:**

| Constraint | Impact | Solution |
|------------|--------|----------|
| Camera FOV | Can't see all 16 at once | Normal - track visible ones |
| Marker size | Must be distinguishable | Use 15cm markers |
| Lighting | Affects detection | Standard AR requirements |
| Distance | Affects tracking | Keep within 0.5-2m range |

**Verdict:** ✅ **Fully Feasible**

---

## 🏗️ **Architecture Design**

### **Approach: Single Character with Dynamic Positioning**

```
┌─────────────────────────────────────────┐
│     16 Markers Tracked Simultaneously   │
│  (All defined, only visible ones active)│
└──────────────┬──────────────────────────┘
               ↓
┌─────────────────────────────────────────┐
│      Active Marker State Management     │
│  - Track which marker has character     │
│  - Store all marker positions           │
└──────────────┬──────────────────────────┘
               ↓
┌─────────────────────────────────────────┐
│    Single 3D Character Rendering        │
│  - Rendered only on active marker       │
│  - Smooth animation between markers     │
└─────────────────────────────────────────┘
```

---

## 💻 **Implementation Strategy**

### **1. Marker Configuration**

```typescript
// Define all 16 markers
const GAME_MARKERS = [
  'start',      // Starting position
  'path1',      // Movement paths
  'path2',
  'path3',
  'path4',
  'path5',
  'path6',
  'path7',
  'path8',
  'path9',
  'path10',
  'arena',      // Special locations
  'firewall',
  'portal',
  'treasure',
  'goal',       // End position
];

// Create AR tracking targets
ViroARTrackingTargets.createTargets({
  start: {
    source: require('./markers/start.png'),
    physicalWidth: 0.15,
  },
  path1: {
    source: require('./markers/path1.png'),
    physicalWidth: 0.15,
  },
  // ... all 16 markers
});
```

### **2. State Management**

```typescript
interface MarkerPosition {
  x: number;
  y: number;
  z: number;
  isVisible: boolean;
}

const [activeMarker, setActiveMarker] = useState('start');
const [markerPositions, setMarkerPositions] = useState<Map<string, MarkerPosition>>(
  new Map()
);
const [isMoving, setIsMoving] = useState(false);
```

### **3. Character Movement Logic**

```typescript
function moveCharacterToMarker(targetMarker: string) {
  if (isMoving) return; // Prevent multiple moves
  
  const targetPosition = markerPositions.get(targetMarker);
  if (!targetPosition?.isVisible) {
    console.log('Target marker not visible');
    return;
  }
  
  setIsMoving(true);
  
  // Animate movement
  Animated.sequence([
    // Jump up
    Animated.timing(characterY, {
      toValue: 0.3, // 30cm high
      duration: 300,
    }),
    // Move to target
    Animated.parallel([
      Animated.timing(characterX, {
        toValue: targetPosition.x,
        duration: 500,
      }),
      Animated.timing(characterZ, {
        toValue: targetPosition.z,
        duration: 500,
      }),
    ]),
    // Land down
    Animated.timing(characterY, {
      toValue: 0.05, // Back to 5cm
      duration: 300,
    }),
  ]).start(() => {
    setActiveMarker(targetMarker);
    setIsMoving(false);
  });
}
```

### **4. Rendering Strategy**

**Option A: Single ViroNode (Recommended)**
```typescript
<ViroARScene>
  {/* Track all markers but only render character on active one */}
  {GAME_MARKERS.map(markerName => (
    <ViroARImageMarker
      key={markerName}
      target={markerName}
      onAnchorFound={() => handleMarkerFound(markerName)}
      onAnchorRemoved={() => handleMarkerLost(markerName)}>
      
      {/* Only render character on active marker */}
      {activeMarker === markerName && (
        <Viro3DObject
          source={require('./chip_character.glb')}
          position={[0, 0.05, 0]}
          scale={[0.15, 0.15, 0.15]}
          animation={{
            name: isMoving ? 'jump' : 'idle',
            run: true,
            loop: !isMoving,
          }}
        />
      )}
    </ViroARImageMarker>
  ))}
</ViroARScene>
```

**Option B: Separate Character Node**
```typescript
<ViroARScene>
  {/* Track all markers */}
  {GAME_MARKERS.map(markerName => (
    <ViroARImageMarker
      key={markerName}
      target={markerName}
      onAnchorFound={() => updateMarkerPosition(markerName)}
    />
  ))}
  
  {/* Single character node */}
  <ViroNode
    position={characterPosition}
    animation={{
      name: 'moveToMarker',
      run: isMoving,
    }}>
    <Viro3DObject
      source={require('./chip_character.glb')}
      scale={[0.15, 0.15, 0.15]}
    />
  </ViroNode>
</ViroARScene>
```

---

## 🎮 **Game Flow Example**

### **Scenario: Board Game with 16 Positions**

```
Start → Path1 → Path2 → Arena → Path3 → Firewall
  ↓                                        ↓
Path10 ← Path9 ← Path8 ← Portal ← Path4 ← Path5
  ↓                                        ↓
Treasure → Path7 → Path6 → Goal
```

**Movement Logic:**
```typescript
// Example: Dice roll determines movement
function handleDiceRoll(diceValue: number) {
  const currentIndex = GAME_MARKERS.indexOf(activeMarker);
  const targetIndex = currentIndex + diceValue;
  
  if (targetIndex < GAME_MARKERS.length) {
    const targetMarker = GAME_MARKERS[targetIndex];
    moveCharacterToMarker(targetMarker);
  }
}

// Example: Direct marker selection
function handleMarkerTap(markerName: string) {
  if (isValidMove(activeMarker, markerName)) {
    moveCharacterToMarker(markerName);
  }
}
```

---

## 🎨 **Animation System**

### **Character Animations:**

```typescript
const ANIMATIONS = {
  idle: {
    name: 'idle',
    loop: true,
    duration: 2000,
  },
  jump: {
    name: 'jump',
    loop: false,
    duration: 1000,
  },
  walk: {
    name: 'walk',
    loop: true,
    duration: 500,
  },
  celebrate: {
    name: 'celebrate',
    loop: false,
    duration: 2000,
  },
};

// Use based on state
<Viro3DObject
  animation={
    isMoving ? ANIMATIONS.jump :
    isWinning ? ANIMATIONS.celebrate :
    ANIMATIONS.idle
  }
/>
```

### **Movement Animation:**

```typescript
// Smooth arc movement between markers
function animateArcMovement(from: Position, to: Position) {
  const midPoint = {
    x: (from.x + to.x) / 2,
    y: 0.3, // Peak of arc
    z: (from.z + to.z) / 2,
  };
  
  // Bezier curve animation
  return Animated.sequence([
    Animated.timing(position, {
      toValue: midPoint,
      duration: 500,
      easing: Easing.out(Easing.quad),
    }),
    Animated.timing(position, {
      toValue: to,
      duration: 500,
      easing: Easing.in(Easing.quad),
    }),
  ]);
}
```

---

## 📊 **Performance Optimization**

### **Best Practices:**

1. **Marker Tracking:**
   - Only track visible markers
   - Use `numberOfTrackedImages={10}` for optimal performance
   - Prioritize markers near active marker

2. **Rendering:**
   - Single character instance (not 16)
   - Conditional rendering based on active marker
   - Reuse 3D model (don't load 16 times)

3. **State Updates:**
   - Debounce marker position updates
   - Batch state changes
   - Use React.memo for optimization

4. **Memory:**
   - Preload all marker images
   - Cache 3D model
   - Cleanup unused resources

---

## 🧪 **Testing Strategy**

### **Test 1: Marker Detection**
- Print all 16 markers
- Verify each marker detected correctly
- Check no marker confusion

### **Test 2: Character Spawn**
- Character spawns on 'start' marker
- Only 1 character visible
- Character positioned correctly

### **Test 3: Movement**
- Move character to adjacent marker
- Verify smooth animation
- Check character arrives at correct position

### **Test 4: Multiple Markers Visible**
- Show 3-4 markers simultaneously
- Character only on active marker
- Movement works correctly

### **Test 5: Performance**
- Track all 16 markers
- Monitor FPS (should stay 60fps)
- Check memory usage

---

## 💡 **Advanced Features**

### **1. Path Validation**
```typescript
// Only allow valid moves
const VALID_MOVES = {
  start: ['path1'],
  path1: ['start', 'path2'],
  path2: ['path1', 'arena'],
  // ...
};

function isValidMove(from: string, to: string): boolean {
  return VALID_MOVES[from]?.includes(to) ?? false;
}
```

### **2. Multiple Characters**
```typescript
// Support 2-4 players
const [player1Marker, setPlayer1Marker] = useState('start');
const [player2Marker, setPlayer2Marker] = useState('start');

// Different colored characters
<Viro3DObject
  source={getCharacterModel(playerColor)}
  position={getMarkerPosition(playerMarker)}
/>
```

### **3. Special Marker Effects**
```typescript
// Different effects per marker type
const MARKER_EFFECTS = {
  arena: { scale: 1.2, glow: true },
  firewall: { color: 'red', particles: true },
  portal: { rotation: true, sparkles: true },
};
```

---

## 📋 **Implementation Checklist**

- [ ] Create 16 unique marker images
- [ ] Define all markers in ViroARTrackingTargets
- [ ] Implement marker position tracking
- [ ] Create single character rendering logic
- [ ] Implement movement animation system
- [ ] Add movement validation
- [ ] Test with physical markers
- [ ] Optimize performance
- [ ] Add game logic integration
- [ ] Polish animations

---

## 🎯 **Recommended Next Steps**

1. **Create Marker Images** (1 day)
   - Design 16 distinct markers
   - Export at correct size (15cm physical)
   - Test detection quality

2. **Implement Core System** (2 days)
   - Set up 16 marker tracking
   - Single character rendering
   - Basic movement

3. **Add Animations** (1 day)
   - Jump animation
   - Movement transitions
   - Idle animations

4. **Game Logic** (2 days)
   - Movement rules
   - Turn system
   - Win conditions

5. **Testing & Polish** (1 day)
   - Performance testing
   - Bug fixes
   - UX improvements

**Total Timeline: ~1 week**

---

## ✅ **Conclusion**

**Is it possible?** ✅ **Absolutely YES!**

**Recommended Approach:**
- Use ViroReact native tracking (not hybrid)
- Single character with dynamic positioning
- Smooth animations between markers
- 16 markers well within ARKit/ARCore limits

**Performance:** Excellent (60fps expected)
**Complexity:** Medium (manageable)
**User Experience:** Great (smooth AR gameplay)

---

**Ready to implement?** Let me know and I'll create the complete implementation! 🚀
