// Optional location for a screening, from the browser's geolocation (with the
// person's permission). Only an approximate position is kept: coordinates are
// rounded to 2 decimal places (about 1 km), never the exact GPS fix.
//
// The county is estimated on the device, so it works offline, by picking the
// nearest county headquarters. Near county borders this can name a neighbouring
// county; the stored coordinates allow a precise boundary lookup later.

export interface ApproxLocation {
  latitude: number;
  longitude: number;
  county: string | null; // null when the position is outside Kenya
}

export type LocationError = 'denied' | 'unavailable' | 'timeout' | 'unsupported';

// County headquarters (approximate coordinates).
const COUNTY_HQS: { county: string; lat: number; lng: number }[] = [
  { county: 'Baringo', lat: 0.49, lng: 35.74 },
  { county: 'Bomet', lat: -0.78, lng: 35.34 },
  { county: 'Bungoma', lat: 0.56, lng: 34.56 },
  { county: 'Busia', lat: 0.46, lng: 34.11 },
  { county: 'Elgeyo-Marakwet', lat: 0.67, lng: 35.51 },
  { county: 'Embu', lat: -0.53, lng: 37.45 },
  { county: 'Garissa', lat: -0.45, lng: 39.65 },
  { county: 'Homa Bay', lat: -0.53, lng: 34.46 },
  { county: 'Isiolo', lat: 0.35, lng: 37.58 },
  { county: 'Kajiado', lat: -1.85, lng: 36.79 },
  { county: 'Kakamega', lat: 0.28, lng: 34.75 },
  { county: 'Kericho', lat: -0.37, lng: 35.28 },
  { county: 'Kiambu', lat: -1.17, lng: 36.83 },
  { county: 'Kilifi', lat: -3.63, lng: 39.85 },
  { county: 'Kirinyaga', lat: -0.5, lng: 37.28 },
  { county: 'Kisii', lat: -0.68, lng: 34.77 },
  { county: 'Kisumu', lat: -0.09, lng: 34.77 },
  { county: 'Kitui', lat: -1.37, lng: 38.01 },
  { county: 'Kwale', lat: -4.17, lng: 39.45 },
  { county: 'Laikipia', lat: 0.27, lng: 36.54 },
  { county: 'Lamu', lat: -2.27, lng: 40.9 },
  { county: 'Machakos', lat: -1.52, lng: 37.26 },
  { county: 'Makueni', lat: -1.78, lng: 37.63 },
  { county: 'Mandera', lat: 3.94, lng: 41.86 },
  { county: 'Marsabit', lat: 2.33, lng: 37.99 },
  { county: 'Meru', lat: 0.05, lng: 37.65 },
  { county: 'Migori', lat: -1.06, lng: 34.47 },
  { county: 'Mombasa', lat: -4.05, lng: 39.67 },
  { county: "Murang'a", lat: -0.72, lng: 37.15 },
  { county: 'Nairobi', lat: -1.29, lng: 36.82 },
  { county: 'Nakuru', lat: -0.3, lng: 36.07 },
  { county: 'Nandi', lat: 0.2, lng: 35.1 },
  { county: 'Narok', lat: -1.08, lng: 35.87 },
  { county: 'Nyamira', lat: -0.56, lng: 34.94 },
  { county: 'Nyandarua', lat: -0.27, lng: 36.38 },
  { county: 'Nyeri', lat: -0.42, lng: 36.95 },
  { county: 'Samburu', lat: 1.1, lng: 36.7 },
  { county: 'Siaya', lat: 0.06, lng: 34.29 },
  { county: 'Taita-Taveta', lat: -3.4, lng: 38.36 },
  { county: 'Tana River', lat: -1.5, lng: 40.03 },
  { county: 'Tharaka-Nithi', lat: -0.33, lng: 37.65 },
  { county: 'Trans Nzoia', lat: 1.02, lng: 35.0 },
  { county: 'Turkana', lat: 3.12, lng: 35.6 },
  { county: 'Uasin Gishu', lat: 0.51, lng: 35.27 },
  { county: 'Vihiga', lat: 0.08, lng: 34.72 },
  { county: 'Wajir', lat: 1.75, lng: 40.06 },
  { county: 'West Pokot', lat: 1.24, lng: 35.11 },
];

// Rough bounding box of Kenya; positions outside it get no county.
const KENYA_BOUNDS = { minLat: -4.72, maxLat: 5.03, minLng: 33.9, maxLng: 41.91 };

export function estimateCounty(latitude: number, longitude: number): string | null {
  const { minLat, maxLat, minLng, maxLng } = KENYA_BOUNDS;
  if (latitude < minLat || latitude > maxLat || longitude < minLng || longitude > maxLng) return null;

  // Equirectangular distance is plenty for picking the nearest point this close to the equator.
  let nearest = COUNTY_HQS[0];
  let best = Infinity;
  for (const hq of COUNTY_HQS) {
    const d = (hq.lat - latitude) ** 2 + (hq.lng - longitude) ** 2;
    if (d < best) {
      best = d;
      nearest = hq;
    }
  }
  return nearest.county;
}

const coarsen = (value: number) => Math.round(value * 100) / 100;

/** Asks the browser for the person's location; the browser shows its own permission prompt. */
export function requestApproxLocation(): Promise<ApproxLocation> {
  return new Promise((resolve, reject: (reason: LocationError) => void) => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      reject('unsupported');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const latitude = coarsen(coords.latitude);
        const longitude = coarsen(coords.longitude);
        resolve({ latitude, longitude, county: estimateCounty(latitude, longitude) });
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) reject('denied');
        else if (error.code === error.TIMEOUT) reject('timeout');
        else reject('unavailable');
      },
      // Low accuracy is enough for a county and is faster and kinder to the battery.
      { enableHighAccuracy: false, timeout: 15000, maximumAge: 10 * 60 * 1000 }
    );
  });
}
