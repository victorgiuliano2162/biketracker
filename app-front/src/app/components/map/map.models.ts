import { ElevationProfile } from '../../services/gpx/elevation.service';

export interface RouteNode {
  name: string;
  id?: string;
  coordinates?: [number, number][];
  elevations?: number[];
  color?: string;
  isSaved?: boolean;
  savedId?: string;
  children?: RouteNode[];
}

export interface FlatRouteNode {
  expandable: boolean;
  name: string;
  level: number;
  id?: string;
  coordinates?: [number, number][];
  elevations?: number[];
  color?: string;
  isSaved?: boolean;
  savedId?: string;
}

export interface GpxStats {
  activeId: string;
  name: string;
  points: number;
  distanceKm: number;
  elevationGainM: number | null;
  loadingElevation: boolean;
  elevationProfile: ElevationProfile | null;
}
