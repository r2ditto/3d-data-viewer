import { useEffect, useRef, useState } from "react";
import type { Map as MapboxMap } from "mapbox-gl";
import type { GeoJSON } from "geojson";

interface FeatureInfo {
  properties: Record<string, unknown>;
  coordinates: [number, number];
  pixelCoordinates: { x: number; y: number };
}

export function useMapbox(geojson?: GeoJSON) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<MapboxMap | null>(null);
  const [selectedFeature, setSelectedFeature] = useState<FeatureInfo | null>(
    null
  );
  const [mapboxgl, setMapboxgl] = useState<typeof import("mapbox-gl")>();

  // Load Mapbox dynamically
  useEffect(() => {
    import("mapbox-gl").then((module) => {
      module.default.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";
      setMapboxgl(module);
    });
  }, []);

  // Update popover position when map moves
  useEffect(() => {
    if (!map.current || !selectedFeature) return;

    const updatePosition = () => {
      const point = map.current!.project(selectedFeature.coordinates);
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
    if (!mapContainer.current || !mapboxgl) return;

    async function setupMap() {
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
            const point = map.current!.project(coordinates);

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
    }

    setupMap();

    // Cleanup
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [geojson, mapboxgl]);

  return {
    mapContainer,
    selectedFeature,
  };
}
