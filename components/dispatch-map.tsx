"use client";

import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Circle, MapContainer, Marker, Polyline, Popup, TileLayer } from "react-leaflet";

// Fix Leaflet's default marker icon paths when bundled. Leaflet hard-codes
// relative URLs that don't resolve through Next's bundler.
delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: () => string })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

export type Verdict = "TAKE" | "MAYBE" | "RISKY";

export type CandidateLoadPin = {
  id: string;
  pickup: [number, number] | null;
  pickupLabel: string;
  deliveryLabel: string;
  payoutLabel: string;
  verdict: Verdict;
};

export type ActiveLoadRoute = {
  pickup: [number, number] | null;
  delivery: [number, number] | null;
  pickupLabel: string;
  deliveryLabel: string;
};

export type DispatchMapProps = {
  driverPosition: [number, number] | null;
  driverName: string | null;
  driverLocationLabel: string | null;
  activeRoute: ActiveLoadRoute | null;
  candidateLoads: CandidateLoadPin[];
};

const VERDICT_COLOR: Record<Verdict, string> = {
  TAKE: "#34d399",
  MAYBE: "#fbbf24",
  RISKY: "#f87171",
};

// 80 miles in meters (1 mile = 1609.344 m).
const EMPTY_RADIUS_METERS = 80 * 1609.344;

// Geographic center of the contiguous US — fallback when we have no points.
const FALLBACK_CENTER: [number, number] = [39.0997, -94.5786];

function pinIcon(color: string) {
  return L.divIcon({
    className: "",
    html: `<div style="width:18px;height:18px;border-radius:50%;background:${color};border:2px solid white;box-shadow:0 0 0 2px rgba(0,0,0,0.4);"></div>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  });
}

const truckIcon = L.divIcon({
  className: "",
  html: '<div style="width:28px;height:28px;border-radius:8px;background:#0ea5e9;border:2px solid white;box-shadow:0 0 0 2px rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center;font-size:14px;line-height:1;">🚛</div>',
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

const emptyEndIcon = L.divIcon({
  className: "",
  html: '<div style="width:20px;height:20px;border-radius:50%;background:#fbbf24;border:2px solid white;box-shadow:0 0 0 2px rgba(0,0,0,0.4);"></div>',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

function computeBounds(points: Array<[number, number]>): L.LatLngBoundsLiteral | null {
  if (points.length === 0) return null;
  let minLat = points[0][0];
  let maxLat = points[0][0];
  let minLng = points[0][1];
  let maxLng = points[0][1];
  for (const [lat, lng] of points) {
    if (lat < minLat) minLat = lat;
    if (lat > maxLat) maxLat = lat;
    if (lng < minLng) minLng = lng;
    if (lng > maxLng) maxLng = lng;
  }
  return [
    [minLat, minLng],
    [maxLat, maxLng],
  ];
}

export function DispatchMap({
  driverPosition,
  driverName,
  driverLocationLabel,
  activeRoute,
  candidateLoads,
}: DispatchMapProps) {
  // Collect every known point so we can frame the map to fit them all.
  const allPoints: Array<[number, number]> = [];
  if (driverPosition) allPoints.push(driverPosition);
  if (activeRoute?.pickup) allPoints.push(activeRoute.pickup);
  if (activeRoute?.delivery) allPoints.push(activeRoute.delivery);
  for (const load of candidateLoads) {
    if (load.pickup) allPoints.push(load.pickup);
  }

  const bounds = computeBounds(allPoints);
  const center: [number, number] = allPoints[0] ?? FALLBACK_CENTER;

  return (
    <MapContainer
      bounds={bounds ?? undefined}
      center={bounds ? undefined : center}
      zoom={bounds ? undefined : 6}
      style={{ height: "520px", width: "100%", borderRadius: "1.25rem" }}
      scrollWheelZoom
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {driverPosition ? (
        <Marker position={driverPosition} icon={truckIcon}>
          <Popup>
            <strong>{driverName ?? "Driver"}</strong>
            {driverLocationLabel ? (
              <>
                <br />
                {driverLocationLabel}
              </>
            ) : null}
          </Popup>
        </Marker>
      ) : null}

      {activeRoute?.pickup && activeRoute?.delivery ? (
        <>
          <Polyline
            positions={[activeRoute.pickup, activeRoute.delivery]}
            pathOptions={{ color: "#0ea5e9", weight: 3, opacity: 0.85 }}
          />
          <Marker position={activeRoute.delivery} icon={emptyEndIcon}>
            <Popup>
              <strong>Empty after delivery</strong>
              <br />
              {activeRoute.deliveryLabel}
            </Popup>
          </Marker>
          <Circle
            center={activeRoute.delivery}
            radius={EMPTY_RADIUS_METERS}
            pathOptions={{
              color: "#fbbf24",
              weight: 1.5,
              fillColor: "#fbbf24",
              fillOpacity: 0.05,
              dashArray: "8 6",
            }}
          />
        </>
      ) : null}

      {candidateLoads.map((load) =>
        load.pickup ? (
          <Marker
            key={load.id}
            position={load.pickup}
            icon={pinIcon(VERDICT_COLOR[load.verdict])}
          >
            <Popup>
              <strong>
                {load.pickupLabel} → {load.deliveryLabel}
              </strong>
              <br />
              Payout: {load.payoutLabel}
              <br />
              Verdict: {load.verdict}
              <br />
              <a href={`/loads/${load.id}`}>Open load</a>
            </Popup>
          </Marker>
        ) : null,
      )}
    </MapContainer>
  );
}
