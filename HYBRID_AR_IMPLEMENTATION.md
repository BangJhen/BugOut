# Hybrid AR Implementation (Option B)
## Vision Camera + ViroReact for Marker Tracking

Date: February 28, 2026
Branch: `feature/ar-library-research`

---

## 🎯 Implementation Overview

**Approach:** Hybrid system combining Vision Camera for marker detection with ViroReact for 3D rendering.

### Architecture:

```
Vision Camera (Camera Feed)
        ↓
Frame Processor (Marker Detection)
        ↓
Kalman Filter (Smooth Tracking)
        ↓
ViroReact (3D Character Rendering)
```

---

## 📦 Installed Dependencies

```json
{
  "react-native-vision-camera": "^4.7.3",
  "react-native-worklets-core": "^1.6.3"
}
```

**Status:** ✅ Installed and configured

---

## 🏗️ Implementation Structure

### 1. **Marker Detection Utility** (`src/utils/markerDetection.ts`)

**Purpose:** Frame processor for detecting markers in camera feed

**Features:**
- Frame-by-frame marker detection
- Screen to world coordinate conversion
- Marker center calculation

**Status:** ⚠️ Placeholder - needs CV implementation

**Next Steps:**
- Integrate OpenCV.js or ML Kit
- Implement template matching for markers
- Add feature detection algorithm

---

### 2. **Marker Tracking Algorithm** (`src/utils/markerTracking.ts`)

**Purpose:** Smooth marker position tracking with Kalman filter

**Features:**
- ✅ Kalman filter for X, Y, Z axes
- ✅ Velocity calculation
- ✅ Multi-marker tracking
- ✅ Smooth position updates

**Implementation:**
```typescript
class KalmanFilter {
  - Prediction step
  - Update step with measurement
  - Process noise: 0.01
  - Measurement noise: 0.1
}

class MarkerTracker {
  - Track multiple markers simultaneously
  - Apply Kalman filter per axis
  - Calculate velocity
  - Remove lost markers
}
```

**Status:** ✅ Complete and ready

---

### 3. **Hybrid AR Screen** (`src/screens/ARGameScreenHybrid.tsx`)

**Purpose:** Main AR screen combining Vision Camera + ViroReact

**Architecture:**
```typescript
<View>
  {/* Vision Camera - Bottom layer */}
  <Camera frameProcessor={detectMarkers} />
  
  {/* ViroReact - AR overlay */}
  <ViroARSceneNavigator>
    <ARScene trackedMarkers={markers} />
  </ViroARSceneNavigator>
  
  {/* UI Overlay - Top layer */}
  <Header />
  <ScanningFrame />
  <ConfirmButton />
</View>
```

**Features:**
- ✅ Vision Camera integration
- ✅ Frame processor setup
- ✅ ViroReact AR overlay
- ✅ Marker tracking state management
- ✅ Reset functionality
- ✅ Debug info display
- ⚠️ Marker detection algorithm (placeholder)

**Status:** ✅ Structure complete, needs CV integration

---

## 🔧 How It Works

### Detection Flow:

```
1. Vision Camera captures frame (60 FPS)
   ↓
2. Frame Processor analyzes frame
   - Detect marker patterns
   - Extract position and size
   - Calculate confidence
   ↓
3. Kalman Filter smooths position
   - Reduce jitter
   - Predict next position
   - Calculate velocity
   ↓
4. Update React state (runOnJS)
   - trackedMarkers array
   - UI status updates
   ↓
5. ViroReact renders 3D character
   - Position from tracked marker
   - Smooth movement
   - Proper scaling
```

---

## 🎨 Rendering Strategy

### Layer Stack (Bottom to Top):

1. **Vision Camera** - Real camera feed
2. **ViroReact AR Overlay** - 3D characters (transparent background)
3. **UI Overlay** - Scanning frame, buttons, status

**Key:** `pointerEvents="none"` on AR overlay to allow UI interaction

---

## 🚀 Next Steps to Complete

### Phase 1: Marker Detection (Critical)

**Option A: OpenCV.js**
```bash
npm install opencv-react-native
```
- Template matching for markers
- Feature detection (ORB, SIFT)
- Homography calculation

**Option B: ML Kit Object Detection**
```bash
npm install @infinitered/react-native-mlkit-object-detection
```
- Train custom model for 4 markers
- Fast on-device detection
- Good for production

**Option C: Custom Algorithm**
- Simple template matching
- Color-based detection
- QR-code style markers

**Recommendation:** Start with **Option B (ML Kit)** for fastest results

---

### Phase 2: Integration

1. **Implement marker detection in frame processor**
   ```typescript
   const frameProcessor = useFrameProcessor((frame) => {
     'worklet';
     const detections = detectMarkersInFrame(frame);
     const tracked = markerTracker.updateMarkers(detections);
     runOnJS(updateUI)(tracked);
   }, []);
   ```

2. **Convert screen coords to AR world coords**
   - Use camera intrinsics
   - Calculate marker pose
   - Transform to ViroReact coordinate system

3. **Test with real markers**
   - Print arena.png, firewall.png, etc.
   - Test detection accuracy
   - Tune Kalman filter parameters

---

### Phase 3: Optimization

1. **Performance tuning**
   - Reduce frame processor frequency if needed
   - Optimize detection algorithm
   - Cache marker templates

2. **Tracking improvements**
   - Adjust Kalman filter noise parameters
   - Add prediction for lost markers
   - Implement marker persistence

3. **UI/UX polish**
   - Show detection confidence
   - Visual feedback for tracking quality
   - Better error handling

---

## 📊 Expected Improvements vs ViroReact

| Metric | ViroReact Only | Hybrid (Vision Camera) |
|--------|----------------|------------------------|
| **Detection Speed** | Moderate | Fast ⚡ |
| **Tracking Smoothness** | Jittery ❌ | Smooth ✅ (Kalman) |
| **Marker Sensitivity** | Poor | Excellent ✅ |
| **Customization** | Limited | Full Control ✅ |
| **Performance** | Heavy | Optimized ✅ |
| **Multi-marker** | Issues | Reliable ✅ |

---

## 🧪 Testing Plan

### Test 1: Camera Setup
- ✅ Vision Camera initializes
- ✅ Permissions granted
- ✅ Frame processor runs

### Test 2: Marker Detection (TODO)
- [ ] Detect arena marker
- [ ] Detect firewall marker
- [ ] Detect portal marker
- [ ] Detect start-base marker
- [ ] Multi-marker detection

### Test 3: Tracking Quality (TODO)
- [ ] Smooth position updates
- [ ] No jitter
- [ ] Accurate positioning
- [ ] Proper scaling

### Test 4: 3D Rendering (TODO)
- [ ] Character spawns on marker
- [ ] Character follows marker smoothly
- [ ] Character disappears when marker lost
- [ ] Multiple characters (if needed)

---

## 🔍 Current Status

### ✅ Completed:
- Vision Camera installation
- Kalman filter implementation
- Marker tracking system
- Hybrid screen structure
- UI components
- Reset functionality

### ⚠️ In Progress:
- Marker detection algorithm
- Frame processor implementation
- Coordinate transformation

### ⏳ TODO:
- ML Kit or OpenCV integration
- Real marker detection
- Testing with physical markers
- Performance optimization

---

## 💡 Key Advantages

1. **Full Control** - Custom detection algorithm
2. **Better Performance** - Optimized for specific use case
3. **Smooth Tracking** - Kalman filter eliminates jitter
4. **Scalable** - Easy to add more markers
5. **Production-Ready** - Vision Camera is battle-tested

---

## 📚 References

- Vision Camera Docs: https://react-native-vision-camera.com/
- Frame Processors: https://react-native-vision-camera.com/docs/guides/frame-processors
- Kalman Filter: https://en.wikipedia.org/wiki/Kalman_filter
- ML Kit: https://developers.google.com/ml-kit

---

## 🎯 Recommendation

**Next Immediate Action:**
1. Choose marker detection method (ML Kit recommended)
2. Implement detection in frame processor
3. Test with one marker first
4. Expand to all 4 markers
5. Fine-tune tracking parameters

**Timeline:**
- Marker detection: 2-3 days
- Integration & testing: 2-3 days
- Optimization: 1-2 days
- **Total: ~1 week**

---

## 🚨 Important Notes

- Frame processors run on separate thread (worklet)
- Use `runOnJS()` to update React state
- Keep frame processor logic minimal for performance
- Test on real device (not simulator)
- ViroReact AR overlay must be transparent
- Coordinate systems need careful transformation

---

**Status:** Foundation complete, ready for CV integration
**Branch:** `feature/ar-library-research`
**Next:** Implement marker detection algorithm
