# AR Marker Calibration Guide

## Problem
3D character spawn position tidak konsisten dari berbagai sudut dan jarak.

## Root Cause
`physicalWidth` di `ViroARTrackingTargets` harus **EXACTLY match** ukuran marker sebenarnya di dunia nyata.

## How to Fix

### Step 1: Measure Your Marker
1. Print atau display `arena.png` marker
2. **Ukur lebar marker dengan penggaris** (dalam centimeter)
3. Convert ke meter:
   - 10cm = 0.10 meter
   - 15cm = 0.15 meter (current setting)
   - 20cm = 0.20 meter
   - 25cm = 0.25 meter

### Step 2: Update physicalWidth
Edit `/src/screens/ARGameScreen.tsx` line 63:

```typescript
ViroARTrackingTargets.createTargets({
  arena: {
    source: require('../assets/images/markers/arena.png'),
    orientation: 'Up',
    physicalWidth: 0.XX, // ← Change this to your measured width in meters
    type: 'Image',
  },
});
```

### Step 3: Test & Debug
1. Run app dan point camera at marker
2. Check console logs:
   ```
   Arena marker found!
   Anchor position: [x, y, z]
   Anchor rotation: [x, y, z]
   ```
3. Test from different angles and distances
4. Character should spawn consistently on marker center

## Common Marker Sizes

| Print Size | physicalWidth | Use Case |
|------------|---------------|----------|
| A4 paper width | 0.21 | Standard print |
| Half A4 | 0.10-0.15 | Small marker |
| A5 paper | 0.148 | Medium marker |
| Custom | Measure it! | Any size |

## Tips for Best Tracking

### ✅ Good Practices:
- Use **high contrast** marker image
- Print on **flat, non-reflective** paper
- **Accurate physicalWidth** measurement
- **Good lighting** conditions
- Keep marker **fully visible**

### ❌ Avoid:
- Wrinkled or bent marker
- Reflective/glossy paper
- Incorrect physicalWidth
- Poor lighting
- Partially hidden marker

## Expected Behavior After Calibration

✅ Character spawns at **exact same position** on marker
✅ Consistent from **all angles** (front, side, top)
✅ Consistent from **all distances** (near, far)
✅ Character **follows marker smoothly**
✅ No repositioning needed

## Current Settings
- **physicalWidth**: 0.15m (15cm)
- **Character position**: [0, 0.05, 0] (5cm above marker)
- **Character scale**: [0.15, 0.15, 0.15]
- **numberOfTrackedImages**: 1 (continuous tracking enabled)
