import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import type { GeoJSON, Feature, Position } from "geojson";

import "mapbox-gl/dist/mapbox-gl.css";
interface GISViewerProps {
  geojson: GeoJSON;
}

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

export function GISViewer({ geojson }: GISViewerProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/satellite-v9",
      center: [0, 0],
      zoom: 2,
      pitch: 45,
    });

    map.current.addControl(new mapboxgl.NavigationControl());

    map.current.on("style.load", () => {
      setMapLoaded(true);
    });

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    // Remove existing layers and sources
    ["points", "lines", "polygons"].forEach((layerId) => {
      if (map.current?.getLayer(layerId)) {
        map.current.removeLayer(layerId);
      }
    });
    if (map.current.getSource("geojson")) {
      map.current.removeSource("geojson");
    }

    // Add new source
    map.current.addSource("geojson", {
      type: "geojson",
      data: geojson,
    });

    // Add point layer
    map.current.addLayer({
      id: "points",
      type: "circle",
      source: "geojson",
      filter: ["==", ["geometry-type"], "Point"],
      paint: {
        "circle-radius": 6,
        "circle-color": "#ff0000",
        "circle-opacity": 0.8,
      },
    });

    // Add line layer
    map.current.addLayer({
      id: "lines",
      type: "line",
      source: "geojson",
      filter: ["==", ["geometry-type"], "LineString"],
      paint: {
        "line-color": "#00ff00",
        "line-width": 2,
      },
    });

    // Add polygon layer
    map.current.addLayer({
      id: "polygons",
      type: "fill",
      source: "geojson",
      filter: ["==", ["geometry-type"], "Polygon"],
      paint: {
        "fill-color": "#0000ff",
        "fill-opacity": 0.4,
        "fill-outline-color": "#0000ff",
      },
    });

    // Fit bounds to features
    const bounds = new mapboxgl.LngLatBounds();
    geojson.features.forEach((feature: Feature) => {
      if (feature.geometry.type === "Point") {
        bounds.extend(feature.geometry.coordinates as [number, number]);
      } else if (feature.geometry.type === "LineString") {
        feature.geometry.coordinates.forEach((coord: Position) => {
          bounds.extend(coord as [number, number]);
        });
      } else if (feature.geometry.type === "Polygon") {
        feature.geometry.coordinates[0].forEach((coord: Position) => {
          bounds.extend(coord as [number, number]);
        });
      }
    });

    if (!bounds.isEmpty()) {
      map.current.fitBounds(bounds, { padding: 50 });
    }
  }, [geojson, mapLoaded]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="w-full h-full" />

      {/* Legend */}
      <div className="absolute bottom-4 right-4 z-10 bg-background/80 backdrop-blur-sm p-4 rounded-lg shadow-lg">
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium">Features</span>
          <div className="space-y-1 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-red-500" />
              <span>Points</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500" />
              <span>Lines</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 bg-opacity-40" />
              <span>Polygons</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
