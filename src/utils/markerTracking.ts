/**
 * Marker Tracking Algorithm
 * Implements Kalman filter for smooth marker position tracking
 */

export interface TrackedMarker {
  markerName: string;
  position: { x: number; y: number; z: number };
  velocity: { x: number; y: number; z: number };
  lastUpdate: number;
  confidence: number;
}

/**
 * Kalman Filter for smooth position tracking
 */
class KalmanFilter {
  private x: number; // Position
  private v: number; // Velocity
  private p: number; // Position variance
  private q: number; // Process noise
  private r: number; // Measurement noise

  constructor(processNoise = 0.01, measurementNoise = 0.1) {
    this.x = 0;
    this.v = 0;
    this.p = 1;
    this.q = processNoise;
    this.r = measurementNoise;
  }

  update(measurement: number, dt: number): number {
    'worklet';
    
    // Prediction
    this.x = this.x + this.v * dt;
    this.p = this.p + this.q;

    // Update
    const k = this.p / (this.p + this.r);
    this.x = this.x + k * (measurement - this.x);
    this.v = (1 - k) * this.v + k * ((measurement - this.x) / dt);
    this.p = (1 - k) * this.p;

    return this.x;
  }

  reset() {
    'worklet';
    this.x = 0;
    this.v = 0;
    this.p = 1;
  }
}

/**
 * Marker Tracker with Kalman filtering
 */
export class MarkerTracker {
  private trackedMarkers: Map<string, TrackedMarker>;
  private filters: Map<string, { x: KalmanFilter; y: KalmanFilter; z: KalmanFilter }>;
  private lastUpdateTime: number;

  constructor() {
    this.trackedMarkers = new Map();
    this.filters = new Map();
    this.lastUpdateTime = Date.now();
  }

  /**
   * Update marker position with Kalman filtering
   */
  updateMarker(
    markerName: string,
    rawPosition: { x: number; y: number; z: number },
    confidence: number
  ): TrackedMarker {
    const now = Date.now();
    const dt = (now - this.lastUpdateTime) / 1000; // Convert to seconds
    this.lastUpdateTime = now;

    // Initialize filters if new marker
    if (!this.filters.has(markerName)) {
      this.filters.set(markerName, {
        x: new KalmanFilter(),
        y: new KalmanFilter(),
        z: new KalmanFilter(),
      });
    }

    const filters = this.filters.get(markerName)!;

    // Apply Kalman filter to each axis
    const smoothedPosition = {
      x: filters.x.update(rawPosition.x, dt),
      y: filters.y.update(rawPosition.y, dt),
      z: filters.z.update(rawPosition.z, dt),
    };

    // Calculate velocity
    const prevMarker = this.trackedMarkers.get(markerName);
    const velocity = prevMarker
      ? {
          x: (smoothedPosition.x - prevMarker.position.x) / dt,
          y: (smoothedPosition.y - prevMarker.position.y) / dt,
          z: (smoothedPosition.z - prevMarker.position.z) / dt,
        }
      : { x: 0, y: 0, z: 0 };

    const trackedMarker: TrackedMarker = {
      markerName,
      position: smoothedPosition,
      velocity,
      lastUpdate: now,
      confidence,
    };

    this.trackedMarkers.set(markerName, trackedMarker);
    return trackedMarker;
  }

  /**
   * Remove marker from tracking
   */
  removeMarker(markerName: string) {
    this.trackedMarkers.delete(markerName);
    const filters = this.filters.get(markerName);
    if (filters) {
      filters.x.reset();
      filters.y.reset();
      filters.z.reset();
    }
  }

  /**
   * Get all tracked markers
   */
  getTrackedMarkers(): TrackedMarker[] {
    return Array.from(this.trackedMarkers.values());
  }

  /**
   * Get specific tracked marker
   */
  getMarker(markerName: string): TrackedMarker | undefined {
    return this.trackedMarkers.get(markerName);
  }

  /**
   * Clear all tracked markers
   */
  reset() {
    this.trackedMarkers.clear();
    this.filters.forEach(filter => {
      filter.x.reset();
      filter.y.reset();
      filter.z.reset();
    });
  }
}
