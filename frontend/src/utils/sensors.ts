// Sensor utilities for GPS and Gyroscope
export interface GyroData {
  alpha: number | null; // Z-axis rotation (0-360)
  beta: number | null;  // X-axis rotation (-180 to 180)
  gamma: number | null; // Y-axis rotation (-90 to 90)
  acceleration: number; // Magnitude of acceleration
}

export interface GPSData {
  latitude: number;
  longitude: number;
  accuracy: number;
}

export interface AccelerometerData {
  x: number;
  y: number;
  z: number;
  magnitude: number;
}

/**
 * Request permission and start gyroscope/orientation tracking
 */
export async function startGyroscope(
  callback: (data: GyroData) => void
): Promise<() => void> {
  // Request permission for iOS 13+
  if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
    try {
      const permission = await (DeviceOrientationEvent as any).requestPermission();
      if (permission !== 'granted') {
        throw new Error('Gyroscope permission denied');
      }
    } catch (error) {
      console.error('Error requesting gyroscope permission:', error);
      throw error;
    }
  }

  let lastTime = Date.now();
  let lastAlpha = 0;

  const handleOrientation = (event: DeviceOrientationEvent) => {
    const currentTime = Date.now();
    const deltaTime = (currentTime - lastTime) / 1000;

    const alpha = event.alpha ?? 0;
    const beta = event.beta ?? 0;
    const gamma = event.gamma ?? 0;

    // Calculate rotation speed for shake detection
    const deltaAlpha = Math.abs(alpha - lastAlpha);
    const rotationSpeed = deltaAlpha / deltaTime;

    callback({
      alpha: event.alpha,
      beta: event.beta,
      gamma: event.gamma,
      acceleration: rotationSpeed
    });

    lastTime = currentTime;
    lastAlpha = alpha;
  };

  window.addEventListener('deviceorientation', handleOrientation);

  return () => {
    window.removeEventListener('deviceorientation', handleOrientation);
  };
}

/**
 * Start accelerometer tracking for shake detection
 */
export async function startAccelerometer(
  callback: (data: AccelerometerData) => void
): Promise<() => void> {
  // Request permission for iOS 13+
  if (typeof (DeviceMotionEvent as any).requestPermission === 'function') {
    try {
      const permission = await (DeviceMotionEvent as any).requestPermission();
      if (permission !== 'granted') {
        throw new Error('Accelerometer permission denied');
      }
    } catch (error) {
      console.error('Error requesting accelerometer permission:', error);
      throw error;
    }
  }

  const handleMotion = (event: DeviceMotionEvent) => {
    const acc = event.accelerationIncludingGravity;
    if (acc) {
      const x = acc.x ?? 0;
      const y = acc.y ?? 0;
      const z = acc.z ?? 0;
      const magnitude = Math.sqrt(x * x + y * y + z * z);

      callback({ x, y, z, magnitude });
    }
  };

  window.addEventListener('devicemotion', handleMotion);

  return () => {
    window.removeEventListener('devicemotion', handleMotion);
  };
}

/**
 * Get GPS location
 */
export async function getGPSLocation(): Promise<GPSData> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        });
      },
      (error) => {
        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  });
}

/**
 * Watch GPS location continuously
 */
export function watchGPSLocation(
  callback: (data: GPSData) => void,
  errorCallback?: (error: GeolocationPositionError) => void
): () => void {
  if (!navigator.geolocation) {
    throw new Error('Geolocation not supported');
  }

  const watchId = navigator.geolocation.watchPosition(
    (position) => {
      callback({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy
      });
    },
    errorCallback,
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    }
  );

  return () => {
    navigator.geolocation.clearWatch(watchId);
  };
}

/**
 * Calculate distance between two GPS coordinates (Haversine formula)
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}

/**
 * Calculate bearing/direction between two GPS coordinates
 */
export function calculateBearing(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x =
    Math.cos(φ1) * Math.sin(φ2) -
    Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
  const θ = Math.atan2(y, x);
  const bearing = ((θ * 180) / Math.PI + 360) % 360;

  return bearing;
}
