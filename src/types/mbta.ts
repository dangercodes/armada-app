/**
 * MBTA V3 API TypeScript Type Definitions
 * Based on JSON:API specification and MBTA V3 Swagger documentation.
 */

// ---------------------------------------------------------------------------
// Core JSON:API Types
// ---------------------------------------------------------------------------

export interface MbtaResourceIdentifier<TType extends string = string> {
  id: string;
  type: TType;
}

export interface MbtaRelationship<TType extends string = string> {
  data: MbtaResourceIdentifier<TType> | null;
  links?: {
    self?: string;
    related?: string;
  };
}

export interface MbtaPaginationLinks {
  first?: string;
  last?: string;
  next?: string;
  prev?: string;
}

export interface MbtaErrorSource {
  parameter?: string;
  pointer?: string;
}

export interface MbtaErrorItem {
  status: string;
  code?: string;
  title?: string;
  detail?: string;
  source?: MbtaErrorSource;
}

export interface MbtaErrorResponse {
  errors: MbtaErrorItem[];
  jsonapi?: {
    version: string;
  };
}

export interface MbtaResponse<TData, TIncluded = MbtaIncludedResource> {
  data: TData;
  included?: TIncluded[];
  links?: MbtaPaginationLinks;
  jsonapi?: {
    version: string;
  };
}

// ---------------------------------------------------------------------------
// Vehicle Types
// ---------------------------------------------------------------------------

export type VehicleCurrentStatus =
  | 'IN_TRANSIT_TO'
  | 'STOPPED_AT'
  | 'INCOMING_AT'
  | string;

export interface MbtaVehicleAttributes {
  bearing: number | null;
  carriages?: unknown[] | null;
  current_status: VehicleCurrentStatus;
  current_stop_sequence: number | null;
  direction_id: 0 | 1 | null;
  label: string | null;
  latitude: number | null;
  longitude: number | null;
  occupancy_status: string | null;
  revenue: 'REVENUE' | 'NON_REVENUE' | string | null;
  speed: number | null;
  updated_at: string;
}

export interface MbtaVehicleRelationships {
  route?: MbtaRelationship<'route'>;
  stop?: MbtaRelationship<'stop'>;
  trip?: MbtaRelationship<'trip'>;
  [key: string]: MbtaRelationship | undefined;
}

export interface MbtaVehicleResource {
  id: string;
  type: 'vehicle';
  attributes: MbtaVehicleAttributes;
  relationships: MbtaVehicleRelationships;
  links?: {
    self?: string;
  };
}

// ---------------------------------------------------------------------------
// Route Types
// ---------------------------------------------------------------------------

export type MbtaRouteType =
  | 0 // Light Rail (e.g. Green Line, Mattapan)
  | 1 // Heavy Rail (Subway: Red, Orange, Blue)
  | 2 // Commuter Rail
  | 3 // Bus
  | 4 // Ferry
  | number;

export interface MbtaRouteAttributes {
  color: string;
  description: string;
  direction_destinations: string[];
  direction_names: string[];
  fare_class: string;
  listed_route: boolean;
  long_name: string;
  short_name: string;
  sort_order: number;
  text_color: string;
  type: MbtaRouteType;
}

export interface MbtaRouteRelationships {
  line?: MbtaRelationship<'line'>;
  patterns?: MbtaRelationship<'route_pattern'>;
  [key: string]: MbtaRelationship | undefined;
}

export interface MbtaRouteResource {
  id: string;
  type: 'route';
  attributes: MbtaRouteAttributes;
  relationships?: MbtaRouteRelationships;
  links?: {
    self?: string;
  };
}

// ---------------------------------------------------------------------------
// Trip Types
// ---------------------------------------------------------------------------

export interface MbtaTripAttributes {
  bikes_allowed: number; // 0 = No info, 1 = Allowed, 2 = Not allowed
  block_id: string;
  direction_id: 0 | 1;
  headsign: string;
  name: string;
  revenue: string;
  wheelchair_accessible: number; // 0 = No info, 1 = Accessible, 2 = Inaccessible
}

export interface MbtaTripRelationships {
  route?: MbtaRelationship<'route'>;
  route_pattern?: MbtaRelationship<'route_pattern'>;
  service?: MbtaRelationship<'service'>;
  shape?: MbtaRelationship<'shape'>;
  [key: string]: MbtaRelationship | undefined;
}

export interface MbtaTripResource {
  id: string;
  type: 'trip';
  attributes: MbtaTripAttributes;
  relationships?: MbtaTripRelationships;
  links?: {
    self?: string;
  };
}

// ---------------------------------------------------------------------------
// Stop Types
// ---------------------------------------------------------------------------

export interface MbtaStopAttributes {
  address: string | null;
  at_street: string | null;
  description: string | null;
  latitude: number;
  location_type: number;
  longitude: number;
  municipality: string | null;
  name: string;
  on_street: string | null;
  platform_code: string | null;
  platform_name: string | null;
  vehicle_type: number | null;
  wheelchair_boarding: number;
}

export interface MbtaStopRelationships {
  parent_station?: MbtaRelationship<'stop'>;
  zone?: MbtaRelationship<'zone'>;
  facilities?: {
    links?: {
      related?: string;
    };
  };
  [key: string]: unknown;
}

export interface MbtaStopResource {
  id: string;
  type: 'stop';
  attributes: MbtaStopAttributes;
  relationships?: MbtaStopRelationships;
  links?: {
    self?: string;
  };
}

// ---------------------------------------------------------------------------
// Included Discriminated Union
// ---------------------------------------------------------------------------

export type MbtaIncludedResource =
  | MbtaRouteResource
  | MbtaTripResource
  | MbtaStopResource;

// ---------------------------------------------------------------------------
// Query Parameter Interfaces
// ---------------------------------------------------------------------------

export interface MbtaPaginationParams {
  'page[limit]'?: number;
  'page[offset]'?: number;
}

export interface VehicleQueryParams {
  limit?: number;
  offset?: number;
  page?: number;
  pageSize?: number;
  routeIds?: string[];
  tripIds?: string[];
  include?: string[];
}

export interface RouteQueryParams {
  limit?: number;
  offset?: number;
  types?: (MbtaRouteType | string)[];
  ids?: string[];
  sort?: string;
}

export interface TripQueryParams {
  limit?: number;
  offset?: number;
  routeIds?: string[];
  tripIds?: string[];
  directionId?: 0 | 1;
}
