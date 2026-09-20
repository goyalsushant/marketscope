import {
  CircleMarker,
  MapContainer,
  Popup,
  TileLayer,
  useMap,
  Rectangle
} from "react-leaflet";

import {
  useEffect
} from "react";

import type { BoundingBox } from "../types";

import "leaflet/dist/leaflet.css";
import "./BoundaryMap.css";

import { EditableBoundary } from "./EditableBoundary";

export interface PortfolioMapStore {
  id: string;
  storeName: string;
  address: string;
  category: string;
  latitude: string | null;
  longitude: string | null;
  insideBoundary: boolean;
}

export interface DiscoveredMapStore {
  id: string;
  name: string;
  category: string;
  latitude: string;
  longitude: string;
  address?: string;
}

interface Props {
  bounds: BoundingBox;

  onBoundsChange?: (
    bounds: BoundingBox
  ) => void;

  portfolioInside?: PortfolioMapStore[];

  portfolioOutside?: PortfolioMapStore[];

  discoveredStores?: DiscoveredMapStore[];
}

function MapViewport({
  bounds
}: {
  bounds: BoundingBox;
}) {
  const map = useMap();

  useEffect(() => {
    map.fitBounds([
      [bounds.south, bounds.west],
      [bounds.north, bounds.east]
    ]);
  }, [
    map,
    bounds.south,
    bounds.west,
    bounds.north,
    bounds.east
  ]);

  return null;
}

function PortfolioMarkers({
  stores,
  discoveredStores,
  color
}: {
  stores: PortfolioMapStore[];
  discoveredStores?: DiscoveredMapStore[];
  color: string;
}) {
  return (
    <>
      {stores.map((store) => {
        if (
          store.latitude === null ||
          store.longitude === null
        ) {
          return null;
        }

        const latitude =
          Number(store.latitude);

        const longitude =
          Number(store.longitude);

        if (
          !Number.isFinite(latitude) ||
          !Number.isFinite(longitude)
        ) {
          return null;
        }

        return (
          <CircleMarker
            key={store.id}
            center={[
              latitude,
              longitude
            ]}
            radius={7}
            pathOptions={{
              color: "#ffffff",
              weight: 2,
              fillColor: color,
              fillOpacity: 1
            }}
          >
            <Popup>
              <div className="portfolio-marker-popup">
                <strong>
                  {store.storeName}
                </strong>

                <div>
                  {store.category}
                </div>

                <p>
                  {store.address}
                </p>

                <small>
                  {store.insideBoundary
                    ? "Inside market boundary"
                    : "Outside market boundary"}
                </small>
              </div>
            </Popup>
          </CircleMarker>
        );
      })}

      {discoveredStores && discoveredStores.map((store) => (
        <CircleMarker
          key={`discovered-${store.id}`}
          center={[
            Number(store.latitude),
            Number(store.longitude)
          ]}
          radius={6}
          pathOptions={{
            color: "#ffffff",
            weight: 2,
            fillColor: "#f97316",
            fillOpacity: 1
          }}
        >
          <Popup>
            <div className="portfolio-marker-popup">
              <strong>
                {store.name}
              </strong>

              <div>
                {store.category}
              </div>

              <p>
                {store.address}
              </p>

              {/* <small>
                {store.insideBoundary
                  ? "Inside market boundary"
                  : "Outside market boundary"}
              </small> */}
              <small>
                Discovered store
              </small>
            </div>
          </Popup>
        </CircleMarker>
      ))}
    </>
  );
}

export function BoundaryMap({
  bounds,
  onBoundsChange,
  portfolioInside = [],
  portfolioOutside = [],
  discoveredStores = []
}: Props) {
  const center: [
    number,
    number
  ] = [
      (bounds.south + bounds.north) / 2,
      (bounds.west + bounds.east) / 2
    ];

  const leafletBounds: [
    [number, number],
    [number, number]
  ] = [
      [bounds.south, bounds.west],
      [bounds.north, bounds.east]
    ];

  return (
    <div className="boundary-map">
      <MapContainer
        center={center}
        zoom={12}
        scrollWheelZoom
        style={{
          height: "500px",
          width: "100%"
        }}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapViewport
          bounds={bounds}
        />

        <Rectangle
          bounds={leafletBounds}
          pathOptions={{
            color: "#2563eb",
            weight: 2,
            fillColor: "#2563eb",
            fillOpacity: 0.15
          }}
        />

        {onBoundsChange && (
          <EditableBoundary
            bounds={bounds}
            onBoundsChange={
              onBoundsChange
            }
          />
        )}
        <PortfolioMarkers
          stores={portfolioInside}
          discoveredStores={discoveredStores}
          color="#2563eb"
        />

        <PortfolioMarkers
          stores={portfolioOutside}
          color="#64748b"
        />
      </MapContainer>
    </div>
  );
}

// export function BoundaryMap({
//   bounds,
//   onBoundsChange,
//   insideStores = [],
//   outsideStores = []
// }: Props) {
//   const center: [number, number] = [
//     (bounds.south + bounds.north) / 2,
//     (bounds.west + bounds.east) / 2
//   ];

//   return (
//     <div className="boundary-map">
//       <MapContainer
//         center={center}
//         zoom={12}
//         scrollWheelZoom
//         style={{
//           height: "500px",
//           width: "100%"
//         }}
//       >
//         <TileLayer
//           attribution="&copy; OpenStreetMap contributors"
//           url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//         />

//         <MapViewport
//           bounds={bounds}
//         />

//         <EditableBoundary
//           bounds={bounds}
//           onBoundsChange={
//             onBoundsChange ??
//             (() => {})
//           }
//         />

//         <PortfolioMarkers
//           stores={insideStores}
//           color="#16a34a"
//         />

//         <PortfolioMarkers
//           stores={outsideStores}
//           color="#dc2626"
//         />
//       </MapContainer>
//     </div>
//   );
// }

