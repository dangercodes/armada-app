import type {
  MbtaIncludedResource,
  MbtaRouteResource,
  MbtaStopResource,
  MbtaTripResource,
} from '../types/mbta';

export interface IncludedLookup {
  routes: Map<string, MbtaRouteResource>;
  trips: Map<string, MbtaTripResource>;
  stops: Map<string, MbtaStopResource>;
}

/**
 * Indexes the JSON:API `included` resources by type and ID for O(1) relation lookups.
 */
export function createIncludedLookup(
  included?: MbtaIncludedResource[] | null,
): IncludedLookup {
  const routes = new Map<string, MbtaRouteResource>();
  const trips = new Map<string, MbtaTripResource>();
  const stops = new Map<string, MbtaStopResource>();

  if (!included || !Array.isArray(included)) {
    return { routes, trips, stops };
  }

  for (const resource of included) {
    if (resource.type === 'route') {
      routes.set(resource.id, resource as MbtaRouteResource);
    } else if (resource.type === 'trip') {
      trips.set(resource.id, resource as MbtaTripResource);
    } else if (resource.type === 'stop') {
      stops.set(resource.id, resource as MbtaStopResource);
    }
  }

  return { routes, trips, stops };
}
