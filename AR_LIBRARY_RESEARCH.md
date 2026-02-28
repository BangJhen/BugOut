# React Native AR Library Research
## Objective: Find Best AR Library for Marker Tracking

Date: February 28, 2026
Branch: `feature/ar-library-research`

---

## 🎯 Requirements

1. **Image Marker Tracking** - Detect printed markers (arena, firewall, portal, start-base)
2. **3D Model Rendering** - Display GLB/GLTF 3D characters on markers
3. **Smooth Tracking** - Stable, low-jitter tracking performance
4. **React Native Compatible** - Works with RN 0.84.0
5. **Active Maintenance** - Regular updates and community support
6. **iOS & Android Support** - Cross-platform compatibility

---

## 📊 Library Comparison

### 1. **ViroReact (@reactvision/react-viro)** ⭐ CURRENT

**Version:** 2.43.0 (Published 16 days ago)  
**Downloads:** 1,459/week  
**License:** MIT  
**Maintainer:** ReactVision (acquired by Morrow in 2025)

#### Pros:
- ✅ Built specifically for AR/VR in React Native
- ✅ Image marker tracking via ARKit/ARCore
- ✅ 3D model support (GLB, GLTF, OBJ)
- ✅ Recently acquired - active development
- ✅ Comprehensive AR features (planes, anchors, image detection)
- ✅ Good documentation
- ✅ TypeScript support

#### Cons:
- ❌ **Current Issues:** Tracking not smooth, marker sensitivity poor
- ❌ Heavy library (169 MB unpacked)
- ❌ Complex setup with native dependencies
- ❌ Performance issues with multiple markers
- ❌ Limited control over tracking parameters

#### Verdict:
**Current solution but problematic** - Tracking quality issues persist despite optimizations.

---

### 2. **React Native Vision Camera** ⭐⭐⭐ RECOMMENDED

**Version:** 4.6.4  
**Downloads:** High (67 dependents)  
**License:** MIT  
**Maintainer:** Marc Rousavy (active, professional)

#### Pros:
- ✅ **Frame Processors** - Run custom CV algorithms in JS/C++
- ✅ High performance camera access
- ✅ GPU accelerated (OpenGL pipeline)
- ✅ Actively maintained (published 2 months ago)
- ✅ Large community (used by major apps)
- ✅ Customizable FPS, resolution, devices
- ✅ Can integrate with ML Kit, TensorFlow, custom CV
- ✅ **Best for custom marker tracking implementation**

#### Cons:
- ⚠️ Requires custom marker tracking implementation
- ⚠️ Need to integrate with CV library (OpenCV, ML Kit)
- ⚠️ More development work required
- ⚠️ Need to handle 3D rendering separately

#### Implementation Approach:
1. Use Vision Camera for camera feed
2. Frame Processor with OpenCV/ML Kit for marker detection
3. React Native Skia or Three.js for 3D rendering
4. Custom tracking algorithm for smooth positioning

#### Verdict:
**Best for production-grade custom solution** - More work but full control over tracking quality.

---

### 3. **React Native ARKit** (iOS only)

**Version:** Unmaintained  
**Stars:** 1.7k  
**Status:** ⚠️ LOOKING FOR MAINTAINERS

#### Pros:
- ✅ Direct ARKit binding
- ✅ Image detection support
- ✅ 3D primitives and models

#### Cons:
- ❌ **Not maintained** - last update years ago
- ❌ iOS only (no Android)
- ❌ Outdated, doesn't work with modern RN
- ❌ Recommends using ViroReact instead

#### Verdict:
**Not recommended** - Unmaintained, iOS only.

---

### 4. **MindAR** (Web-based)

**Version:** 1.2.5  
**Downloads:** 309/week  
**Platform:** Web AR (not React Native)

#### Pros:
- ✅ Image tracking and face tracking
- ✅ Pure JavaScript
- ✅ GPU accelerated (WebGL)
- ✅ Good tracking algorithm

#### Cons:
- ❌ **Web only** - not React Native
- ❌ Would need WebView wrapper
- ❌ Performance overhead from WebView
- ❌ Not native mobile AR

#### Verdict:
**Not suitable** - Web-based, not native React Native.

---

### 5. **Custom Solution: Vision Camera + ML Kit + Skia**

**Approach:** Build custom marker tracking system

#### Stack:
- **Camera:** React Native Vision Camera (frame access)
- **Detection:** ML Kit Object Detection or OpenCV
- **Tracking:** Custom algorithm with Kalman filter
- **Rendering:** React Native Skia or Expo GL

#### Pros:
- ✅ **Full control** over tracking algorithm
- ✅ Can optimize for specific use case
- ✅ Best performance potential
- ✅ Modern, maintained libraries
- ✅ Can fine-tune sensitivity and smoothness
- ✅ Lighter weight than ViroReact

#### Cons:
- ⚠️ Significant development time
- ⚠️ Need CV expertise
- ⚠️ More complex architecture
- ⚠️ Need to handle ARKit/ARCore integration manually

#### Verdict:
**Best long-term solution** - Most work but best results.

---

## 🏆 Recommendation

### **Option A: Improve ViroReact (Short-term)** ⏱️ 1-2 days

**Approach:**
- Fine-tune existing ViroReact implementation
- Adjust tracking parameters more aggressively
- Implement better state management
- Add performance optimizations

**Pros:** Quick, minimal code changes  
**Cons:** Limited by ViroReact's capabilities

---

### **Option B: Vision Camera + Custom Tracking (Medium-term)** ⏱️ 1-2 weeks

**Approach:**
1. Keep ViroReact for 3D rendering
2. Use Vision Camera for marker detection
3. Pass detected marker positions to ViroReact
4. Custom tracking algorithm for smoothness

**Pros:** Better tracking, keep 3D rendering  
**Cons:** Hybrid approach, some complexity

---

### **Option C: Full Custom Solution (Long-term)** ⏱️ 3-4 weeks

**Approach:**
1. React Native Vision Camera (camera feed)
2. ML Kit or OpenCV (marker detection)
3. React Native Skia (3D rendering)
4. Custom tracking with Kalman filter

**Pros:** Best quality, full control, production-grade  
**Cons:** Most development time

---

## 💡 My Recommendation: **Option B (Hybrid)**

### Why?
1. **Immediate improvement** - Better marker detection
2. **Leverage existing work** - Keep ViroReact 3D rendering
3. **Balanced effort** - Not starting from scratch
4. **Production-ready** - Vision Camera is battle-tested
5. **Flexible** - Can migrate to full custom later

### Implementation Plan:

```typescript
// 1. Vision Camera for marker detection
import { Camera, useFrameProcessor } from 'react-native-vision-camera';
import { detectMarkers } from './markerDetection'; // ML Kit or OpenCV

function ARScreen() {
  const frameProcessor = useFrameProcessor((frame) => {
    'worklet';
    const markers = detectMarkers(frame);
    // Pass to ViroReact or render directly
  }, []);

  return <Camera frameProcessor={frameProcessor} />;
}

// 2. ViroReact for 3D rendering (or migrate to Skia)
// 3. Custom tracking algorithm for smooth positioning
```

---

## 📦 Required Packages (Option B)

```json
{
  "dependencies": {
    "react-native-vision-camera": "^4.6.4",
    "@infinitered/react-native-mlkit-object-detection": "^3.1.0",
    "@reactvision/react-viro": "^2.43.0", // Keep for 3D rendering
    "react-native-worklets-core": "latest" // For frame processors
  }
}
```

---

## 🎯 Next Steps

1. ✅ Create research branch
2. ⏳ Implement Vision Camera proof of concept
3. ⏳ Test marker detection quality
4. ⏳ Integrate with ViroReact 3D rendering
5. ⏳ Compare tracking smoothness
6. ⏳ Make final decision

---

## 📚 References

- Vision Camera: https://github.com/mrousavy/react-native-vision-camera
- ML Kit Object Detection: https://www.npmjs.com/package/@infinitered/react-native-mlkit-object-detection
- ViroReact: https://github.com/ReactVision/viro
- React Native Skia: https://shopify.github.io/react-native-skia/

---

## ⚠️ Important Notes

- ViroReact tracking issues are **fundamental to the library**, not just configuration
- Vision Camera gives **direct frame access** for custom algorithms
- ML Kit provides **fast, on-device marker detection**
- Custom solution requires **more code but better results**
- Hybrid approach is **best balance** of effort vs quality
