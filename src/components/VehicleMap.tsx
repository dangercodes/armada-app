import React, { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

import {
  formatCoordinates,
  formatDateTime,
  formatRelativeTime,
  humanizeStatus,
  normalizeHexColor,
} from '../utils/formatters';

// Fix Leaflet default icon asset resolution in Vite bundler
delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
});

export interface VehicleMapProps {
  latitude: number | null | undefined;
  longitude: number | null | undefined;
  bearing?: number | null;
  label: string;
  status?: string | null;
  routeColor?: string | null;
  routeShortName?: string | null;
  updatedAt?: string | null;
  className?: string;
}

function createVehicleMarkerIcon(
  bearing: number | null | undefined,
  routeColor: string,
): L.DivIcon {
  const hasBearing = bearing !== null && bearing !== undefined && !Number.isNaN(bearing);
  const rotation = hasBearing ? bearing : 0;

  const html = `
    <div style="position: relative; width: 48px; height: 48px; display: flex; align-items: center; justify-content: center;">
      <!-- Ambient pulsing aura in route color -->
      <div style="position: absolute; inset: 4px; border-radius: 50%; background-color: ${routeColor}; opacity: 0.28; animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
      
      ${hasBearing
      ? `
        <!-- Directional heading pointer orbiting in bearing angle -->
        <div style="position: absolute; inset: 0; transform: rotate(${rotation}deg); transform-origin: center center; pointer-events: none; z-index: 5;">
          <div style="position: absolute; top: 0px; left: 50%; transform: translateX(-50%); width: 0; height: 0; border-left: 5px solid transparent; border-right: 5px solid transparent; border-bottom: 8px solid ${routeColor}; filter: drop-shadow(0 2px 2px rgba(0,0,0,0.3));"></div>
        </div>
      `
      : ''
    }

      <!-- Center bus marker badge -->
      <div style="position: relative; z-index: 10; width: 36px; height: 36px; border-radius: 50%; background-color: #ffffff; border: 2.5px solid ${routeColor}; box-shadow: 0 4px 12px rgba(15, 23, 42, 0.25); display: flex; align-items: center; justify-content: center;">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="${routeColor}" style="filter: drop-shadow(0 1px 1px rgba(0,0,0,0.12));">
          <path d="M4 16c0 .88.39 1.67 1 2.22V20c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h8v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1.78c.61-.55 1-1.34 1-2.22V6c0-3.5-3.58-4-8-4s-8 .5-8 4v10zm3.5 1c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm9 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm1.5-6H6V6h12v5z"/>
        </svg>
      </div>
    </div>
  `;

  return L.divIcon({
    className: 'vehicle-leaflet-icon',
    html,
    iconSize: [48, 48],
    iconAnchor: [24, 24],
    popupAnchor: [0, -24],
  });
}

/**
 * Helper to dynamically re-center and resize Leaflet map tiles when coordinates change or modal animates in.
 */
function MapController({ center, zoom = 15 }: { center: [number, number]; zoom?: number }) {
  const map = useMap();

  useEffect(() => {
    map.setView(center, zoom, { animate: true });
    // Invalidate map size after a slight delay to ensure container transition has finished
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 250);
    return () => clearTimeout(timer);
  }, [center, zoom, map]);

  return null;
}

export const VehicleMap: React.FC<VehicleMapProps> = ({
  latitude,
  longitude,
  bearing,
  label,
  status,
  routeColor,
  routeShortName,
  updatedAt,
  className = '',
}) => {
  // Validate coordinates
  const isValidCoord =
    typeof latitude === 'number' &&
    typeof longitude === 'number' &&
    !Number.isNaN(latitude) &&
    !Number.isNaN(longitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180;

  const hexColor = normalizeHexColor(routeColor, '#0B3C8C');
  const markerIcon = useMemo(() => {
    return createVehicleMarkerIcon(bearing, hexColor);
  }, [bearing, hexColor]);

  // Graceful fallback for missing or invalid coordinates
  if (!isValidCoord) {
    return (
      <div
        role="region"
        aria-label="Peta Posisi Armada"
        className={`w-full h-full min-h-[300px] flex flex-col items-center justify-center p-6 bg-slate-50 border border-dashed border-slate-300 rounded-2xl text-center ${className}`}
      >
        <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3 shadow-2xs">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <h4 className="text-sm font-bold text-slate-800 mb-1">Peta Tidak Tersedia</h4>
        <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
          Koordinat GPS latitude dan longitude tidak dilaporkan untuk armada {label} saat ini.
        </p>
      </div>
    );
  }

  const position: [number, number] = [latitude as number, longitude as number];
  const coordinatesText = formatCoordinates(latitude, longitude);
  const statusText = humanizeStatus(status);
  const relativeTime = formatRelativeTime(updatedAt);
  const fullTime = formatDateTime(updatedAt);

  return (
    <div
      role="region"
      aria-label={`Peta Posisi Armada ${label}`}
      className={`relative w-full h-full min-h-[320px] rounded-2xl overflow-hidden border border-slate-200/90 shadow-xs isolate ${className}`}
    >
      <MapContainer
        center={position}
        zoom={15}
        scrollWheelZoom={true}
        className="w-full h-full min-h-[320px] z-10"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> kontributor'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />

        <Marker position={position} icon={markerIcon}>
          <Popup className="custom-leaflet-popup">
            <div className="p-1 max-w-[220px]">
              <div className="flex items-center gap-2 mb-1.5 pb-1.5 border-b border-slate-100">
                <div
                  className="w-5 h-5 rounded-md flex items-center justify-center text-white shrink-0 shadow-2xs"
                  style={{ backgroundColor: hexColor }}
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M4 16c0 .88.39 1.67 1 2.22V20c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h8v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1.78c.61-.55 1-1.34 1-2.22V6c0-3.5-3.58-4-8-4s-8 .5-8 4v10zm3.5 1c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm9 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm1.5-6H6V6h12v5z" />
                  </svg>
                </div>
                <span className="font-bold text-slate-900 text-xs truncate">
                  Armada {label}
                </span>
                {routeShortName && (
                  <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-slate-100 text-slate-700 ml-auto shrink-0">
                    {routeShortName}
                  </span>
                )}
              </div>

              <div className="space-y-1 text-[11px] text-slate-600">
                <div>
                  <span className="text-slate-400 font-medium">Status: </span>
                  <strong className="text-slate-800">{statusText}</strong>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Koordinat: </span>
                  <span className="font-mono text-slate-700">{coordinatesText}</span>
                </div>
                {bearing !== null && bearing !== undefined && (
                  <div>
                    <span className="text-slate-400 font-medium">Arah: </span>
                    <span className="font-mono text-slate-700">{bearing}&deg;</span>
                  </div>
                )}
                <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-100 mt-1" title={fullTime}>
                  Update: {relativeTime}
                </div>
              </div>
            </div>
          </Popup>
        </Marker>

        <MapController center={position} zoom={15} />
      </MapContainer>

      {/* Floating GPS Coordinates Pill Badge on Map */}
      <div className="absolute top-3 left-3 z-[400] bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-200/80 shadow-xs flex items-center gap-2 text-xs">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span className="font-mono text-[11px] font-medium text-slate-700">
          {latitude?.toFixed(5)}, {longitude?.toFixed(5)}
        </span>
      </div>
    </div>
  );
};
