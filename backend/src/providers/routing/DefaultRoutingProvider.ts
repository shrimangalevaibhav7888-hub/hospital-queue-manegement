import { IRoutingProvider, RouteCalculationInput, RouteCalculationResult } from './IRoutingProvider';

export class DefaultRoutingProvider implements IRoutingProvider {
  async calculateTravelTime(input: RouteCalculationInput): Promise<RouteCalculationResult> {
    // Default smart deterministic estimator based on transportation mode
    let baseMinutes = 25;
    let distanceKm = 12.5;

    if (input.transportMode === 'TRANSIT') {
      baseMinutes = 40;
    } else if (input.transportMode === 'WALKING') {
      baseMinutes = 60;
      distanceKm = 4.0;
    }

    // Slight hour-of-day traffic weighting (e.g. peak hours 8-10am or 5-7pm)
    const currentHour = input.currentTime.getHours();
    let trafficDelay = 0;
    if ((currentHour >= 8 && currentHour <= 10) || (currentHour >= 17 && currentHour <= 19)) {
      trafficDelay = input.transportMode === 'DRIVING' ? 5 : 2;
    }

    return {
      estimatedDurationMinutes: baseMinutes + trafficDelay,
      distanceKilometers: distanceKm,
      providerName: 'CareFlow-SmartRoute-Default',
      trafficDelayMinutes: trafficDelay,
    };
  }
}
