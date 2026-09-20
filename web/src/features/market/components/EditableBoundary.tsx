import {
  CircleMarker,
  Rectangle,
  useMap,
  useMapEvents
} from "react-leaflet";

import {
  useEffect,
  useMemo,
  useState
} from "react";

import type {
  LeafletMouseEvent
} from "leaflet";

import type { BoundingBox } from "../types";

interface Props {
  bounds: BoundingBox;
  onBoundsChange: (
    bounds: BoundingBox
  ) => void;
}

type DragMode =
  | "move"
  | "nw"
  | "ne"
  | "sw"
  | "se"
  | null;

interface Point {
  lat: number;
  lng: number;
}

export function EditableBoundary({
  bounds,
  onBoundsChange
}: Props) {
  const map = useMap();

  const [dragMode, setDragMode] =
    useState<DragMode>(null);

  const [dragStart, setDragStart] =
    useState<Point | null>(null);

  const [initialBounds, setInitialBounds] =
    useState<BoundingBox | null>(null);

  const corners = useMemo(
    () => ({
      nw: {
        lat: bounds.north,
        lng: bounds.west
      },

      ne: {
        lat: bounds.north,
        lng: bounds.east
      },

      sw: {
        lat: bounds.south,
        lng: bounds.west
      },

      se: {
        lat: bounds.south,
        lng: bounds.east
      }
    }),
    [bounds]
  );

  useEffect(() => {
    if (!dragMode) {
      return;
    }

    function handleMouseMove(
      event: LeafletMouseEvent
    ) {
      if (!dragStart || !initialBounds) {
        return;
      }

      const latDelta =
        event.latlng.lat -
        dragStart.lat;

      const lngDelta =
        event.latlng.lng -
        dragStart.lng;

      let next: BoundingBox;

      if (dragMode === "move") {
        next = {
          south:
            initialBounds.south +
            latDelta,

          north:
            initialBounds.north +
            latDelta,

          west:
            initialBounds.west +
            lngDelta,

          east:
            initialBounds.east +
            lngDelta
        };
      } else {
        next = {
          ...initialBounds
        };

        if (
          dragMode === "nw" ||
          dragMode === "sw"
        ) {
          next.west =
            initialBounds.west +
            lngDelta;
        }

        if (
          dragMode === "ne" ||
          dragMode === "se"
        ) {
          next.east =
            initialBounds.east +
            lngDelta;
        }

        if (
          dragMode === "nw" ||
          dragMode === "ne"
        ) {
          next.north =
            initialBounds.north +
            latDelta;
        }

        if (
          dragMode === "sw" ||
          dragMode === "se"
        ) {
          next.south =
            initialBounds.south +
            latDelta;
        }
      }

      if (
        next.north <= next.south ||
        next.east <= next.west
      ) {
        return;
      }

      onBoundsChange(next);
    }

    function handleMouseUp() {
      setDragMode(null);
      setDragStart(null);
      setInitialBounds(null);

      map.dragging.enable();
    }

    map.on(
      "mousemove",
      handleMouseMove
    );

    map.on(
      "mouseup",
      handleMouseUp
    );

    return () => {
      map.off(
        "mousemove",
        handleMouseMove
      );

      map.off(
        "mouseup",
        handleMouseUp
      );
    };
  }, [
    dragMode,
    dragStart,
    initialBounds,
    map,
    onBoundsChange
  ]);

  function startDrag(
    mode: Exclude<DragMode, null>,
    event: LeafletMouseEvent
  ) {
    event.originalEvent.preventDefault();
    event.originalEvent.stopPropagation();

    setDragMode(mode);

    setDragStart({
      lat: event.latlng.lat,
      lng: event.latlng.lng
    });

    setInitialBounds(bounds);

    map.dragging.disable();
  }

  return (
    <>
      <Rectangle
        bounds={[
          [bounds.south, bounds.west],
          [bounds.north, bounds.east]
        ]}
        pathOptions={{
          color: "#2563eb",
          weight: 2,
          fillColor: "#2563eb",
          fillOpacity: 0.15
        }}
        eventHandlers={{
          mousedown: (event) =>
            startDrag("move", event)
        }}
      />

      {(
        Object.entries(corners) as [
          Exclude<DragMode, "move" | null>,
          Point
        ][]
      ).map(([key, point]) => (
        <CircleMarker
          key={key}
          center={[
            point.lat,
            point.lng
          ]}
          radius={7}
          pathOptions={{
            color: "#ffffff",
            weight: 2,
            fillColor: "#2563eb",
            fillOpacity: 1
          }}
          eventHandlers={{
            mousedown: (event) =>
              startDrag(key, event)
          }}
        />
      ))}
    </>
  );
}
