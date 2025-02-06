import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import type { GeoJSON } from "geojson";
import { Button } from "@/components/ui/button";
import { GISControls } from "@/components/gis-controls";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import "mapbox-gl/dist/mapbox-gl.css";

interface GISViewerProps {
  geojson?: GeoJSON;
  fileName?: string;
  fileSize?: number;
  onUploadClick?: () => void;
}

interface FeatureInfo {
  properties: Record<string, unknown>;
  coordinates: [number, number];
  pixelCoordinates: { x: number; y: number };
}

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

export function GISViewer({
  geojson,
  fileName,
  fileSize,
  onUploadClick,
}: GISViewerProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [selectedFeature, setSelectedFeature] = useState<FeatureInfo | null>(
    null
  );

  // Calculate feature counts
  const featureCounts = geojson
    ? {
        points:
          "features" in geojson
            ? geojson.features.filter((f) => f.geometry.type === "Point").length
            : 0,
        lines:
          "features" in geojson
            ? geojson.features.filter((f) => f.geometry.type === "LineString")
                .length
            : 0,
        polygons:
          "features" in geojson
            ? geojson.features.filter((f) => f.geometry.type === "Polygon")
                .length
            : 0,
      }
    : { points: 0, lines: 0, polygons: 0 };

  // Update popover position when map moves
  useEffect(() => {
    if (!map.current || !selectedFeature) return;

    const updatePosition = () => {
      const point = map.current!.project(
        selectedFeature.coordinates as mapboxgl.LngLatLike
      );
      setSelectedFeature({
        ...selectedFeature,
        pixelCoordinates: { x: point.x, y: point.y },
      });
    };

    map.current.on("move", updatePosition);
    return () => {
      map.current?.off("move", updatePosition);
    };
  }, [selectedFeature]);

  // Initialize map and handle data
  useEffect(() => {
    if (!mapContainer.current) return;

    // Initialize map if it doesn't exist
    if (!map.current) {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/satellite-v9",
        center: [0, 0],
        zoom: 2,
        pitch: 45,
      });
    }

    // Function to add data to map
    const addData = () => {
      if (!map.current || !geojson) return;

      // Remove existing layers and source
      ["points", "lines", "polygons"].forEach((layerId) => {
        if (map.current?.getLayer(layerId)) {
          map.current.removeLayer(layerId);
        }
      });

      if (map.current.getSource("geojson")) {
        map.current.removeSource("geojson");
      }

      // Add new source and layers
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

      // Add click and hover effects
      ["points", "lines", "polygons"].forEach((layerId) => {
        // Hover effects
        map.current?.on("mouseenter", layerId, () => {
          if (map.current) map.current.getCanvas().style.cursor = "pointer";
        });

        map.current?.on("mouseleave", layerId, () => {
          if (map.current) map.current.getCanvas().style.cursor = "";
        });

        // Click handler
        map.current?.on("click", layerId, (e) => {
          if (!e.features?.[0]) return;

          const feature = e.features[0];
          const coordinates = e.lngLat.toArray() as [number, number];
          const point = map.current!.project(
            coordinates as mapboxgl.LngLatLike
          );

          setSelectedFeature({
            properties: feature.properties || {},
            coordinates,
            pixelCoordinates: { x: point.x, y: point.y },
          });
        });
      });

      // Close popover when clicking elsewhere on the map
      map.current.on("click", (e) => {
        const features = map.current?.queryRenderedFeatures(e.point, {
          layers: ["points", "lines", "polygons"],
        });

        if (!features?.length) {
          setSelectedFeature(null);
        }
      });

      // Fit bounds to data
      if ("features" in geojson && geojson.features.length > 0) {
        const bounds = new mapboxgl.LngLatBounds();
        geojson.features.forEach((feature) => {
          if (feature.geometry.type === "Point") {
            bounds.extend(feature.geometry.coordinates as [number, number]);
          } else if (feature.geometry.type === "LineString") {
            feature.geometry.coordinates.forEach((coord) => {
              bounds.extend(coord as [number, number]);
            });
          } else if (feature.geometry.type === "Polygon") {
            feature.geometry.coordinates[0].forEach((coord) => {
              bounds.extend(coord as [number, number]);
            });
          }
        });

        if (!bounds.isEmpty()) {
          map.current.fitBounds(bounds, { padding: 50 });
        }
      }
    };

    // Add data when style is loaded
    if (map.current.isStyleLoaded()) {
      addData();
    } else {
      map.current.once("style.load", addData);
    }

    // Cleanup
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [geojson]);

  if (!geojson) {
    return (
      <div className="relative w-full h-full flex flex-col items-center justify-center bg-black/90">
        <div className="text-center space-y-4">
          <p className="text-lg text-gray-400">No GeoJSON data loaded</p>
          <Button
            onClick={onUploadClick}
            className="bg-primary hover:bg-primary/90"
          >
            Upload GeoJSON File
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="w-full h-full" />

      <GISControls
        fileName={fileName}
        fileSize={fileSize}
        featureCounts={featureCounts}
        onUploadClick={onUploadClick || (() => {})}
      />

      {selectedFeature && (
        <div
          style={{
            position: "absolute",
            left: `${selectedFeature.pixelCoordinates.x}px`,
            top: `${selectedFeature.pixelCoordinates.y}px`,
          }}
        >
          <Popover open={true}>
            <PopoverTrigger asChild>
              <div />
            </PopoverTrigger>
            <PopoverContent
              className="w-80"
              side="right"
              align="start"
              sideOffset={5}
            >
              <div className="space-y-2">
                <h3 className="font-medium">Feature Properties</h3>
                <div className="space-y-1">
                  {Object.entries(selectedFeature.properties).map(
                    ([key, value]) => (
                      <div key={key} className="grid grid-cols-2 gap-2">
                        <span className="text-sm font-medium">{key}:</span>
                        <span className="text-sm text-muted-foreground">
                          {String(value)}
                        </span>
                      </div>
                    )
                  )}
                </div>
                <div className="text-xs text-muted-foreground pt-2 border-t">
                  <div>
                    Longitude: {selectedFeature.coordinates[0].toFixed(6)}
                  </div>
                  <div>
                    Latitude: {selectedFeature.coordinates[1].toFixed(6)}
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      )}
    </div>
  );
}
