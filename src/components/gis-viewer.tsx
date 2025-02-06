import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

interface GISViewerProps {
  points: Float32Array;
}

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

export function GISViewer({ points }: GISViewerProps) {
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
    if (!map.current || !mapLoaded || !points.length) return;

    const features = [];
    for (let i = 0; i < points.length; i += 3) {
      features.push({
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [points[i], points[i + 1]],
        },
        properties: {
          height: points[i + 2],
        },
      });
    }

    if (map.current.getLayer("points")) {
      map.current.removeLayer("points");
    }
    if (map.current.getSource("points")) {
      map.current.removeSource("points");
    }

    map.current.addSource("points", {
      type: "geojson",
      data: {
        type: "FeatureCollection",
        features,
      },
    });

    map.current.addLayer({
      id: "points",
      type: "circle",
      source: "points",
      paint: {
        "circle-radius": 4,
        "circle-color": [
          "interpolate",
          ["linear"],
          ["get", "height"],
          ["min", ["get", "height"]],
          "#0000ff",
          ["max", ["get", "height"]],
          "#ff0000",
        ],
        "circle-opacity": 0.8,
      },
    });

    const coordinates = features.map((f) => f.geometry.coordinates);
    const bounds = coordinates.reduce(
      (bounds, coord) => bounds.extend(coord as [number, number]),
      new mapboxgl.LngLatBounds(coordinates[0], coordinates[0])
    );
    map.current.fitBounds(bounds, { padding: 50 });
  }, [points, mapLoaded]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="w-full h-full" />

      {/* Legend */}
      <div className="absolute bottom-4 right-4 z-10 bg-background/80 backdrop-blur-sm p-4 rounded-lg shadow-lg">
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium">Height</span>
          <div className="w-32 h-4 bg-gradient-to-r from-blue-500 to-red-500 rounded" />
          <div className="flex justify-between text-xs">
            <span>Low</span>
            <span>High</span>
          </div>
        </div>
      </div>
    </div>
  );
}
