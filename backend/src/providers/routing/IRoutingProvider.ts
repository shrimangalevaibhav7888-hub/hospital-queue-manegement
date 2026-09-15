export interface RouteCalculationInput {
  originAddress?: string | null;
  destinationAddress: string;
  transportMode: 'DRIVING' | 'TRANSIT' | 'WALKING';
  currentTime: Date;
}

export interface RouteCalculationResult {
  estimatedDurationMinutes: number;
  distanceKilometers: number;
  providerName: string;
  trafficDelayMinutes?: number;
}

/**
 * Interface for routing providers (Google Maps, Mapbox, OSRM, etc.)
 */
export interface IRoutingProvider {
  calculateTravelTime(input: RouteCalculationInput): Promise<RouteCalculationResult>;
}
