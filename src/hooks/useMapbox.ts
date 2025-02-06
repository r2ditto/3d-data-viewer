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

  useEffect(() => {
    if (!mapContainer.current) return;

    async function initializeMap(mapboxgl: any) {
      if (!map.current) {
        map.current = new mapboxgl.default.Map({
          container: mapContainer.current!,
          style: "mapbox://styles/mapbox/satellite-v9",
          center: [0, 0],
          zoom: 2,
          pitch: 45,
        });
      }
    }

    function removeExistingLayers() {
      if (!map.current) return;

      ["points", "lines", "polygons"].forEach((layerId) => {
        if (map.current?.getLayer(layerId)) {
          map.current.removeLayer(layerId);
        }
      });

      if (map.current.getSource("geojson")) {
        map.current.removeSource("geojson");
      }
    }

    function addLayerToMap(layerId: string, layerConfig: any) {
      map.current?.addLayer({
        id: layerId,
        source: "geojson",
        ...layerConfig,
      });
    }

    function setupLayerInteractions(layerId: string) {
      if (!map.current) return;

      map.current.on("mouseenter", layerId, () => {
        if (map.current) map.current.getCanvas().style.cursor = "pointer";
      });

      map.current.on("mouseleave", layerId, () => {
        if (map.current) map.current.getCanvas().style.cursor = "";
      });

      map.current.on("click", layerId, (e) => {
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
    }

    function fitMapToBounds(mapboxgl: any) {
      if (!map.current || !geojson || !("features" in geojson)) return;

      const bounds = new mapboxgl.default.LngLatBounds();

      geojson.features.forEach((feature) => {
        const addCoordToBounds = (coord: [number, number]) =>
          bounds.extend(coord);

        switch (feature.geometry.type) {
          case "Point":
            addCoordToBounds(feature.geometry.coordinates as [number, number]);
            break;
          case "LineString":
            feature.geometry.coordinates.forEach(addCoordToBounds);
            break;
          case "Polygon":
            feature.geometry.coordinates[0].forEach(addCoordToBounds);
            break;
        }
      });

      if (!bounds.isEmpty()) {
        map.current.fitBounds(bounds, { padding: 50 });
      }
    }

    async function setupMap() {
      const mapboxgl = await import("mapbox-gl");
      mapboxgl.default.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

      await initializeMap(mapboxgl);

      const addData = () => {
        if (!map.current || !geojson) return;

        removeExistingLayers();

        map.current.addSource("geojson", {
          type: "geojson",
          data: geojson,
        });

        // Add layers with their configurations
        addLayerToMap("points", {
          type: "circle",
          filter: ["==", ["geometry-type"], "Point"],
          paint: {
            "circle-radius": 6,
            "circle-color": "#ff0000",
            "circle-opacity": 0.8,
          },
        });

        addLayerToMap("lines", {
          type: "line",
          filter: ["==", ["geometry-type"], "LineString"],
          paint: {
            "line-color": "#00ff00",
            "line-width": 2,
          },
        });

        addLayerToMap("polygons", {
          type: "fill",
          filter: ["==", ["geometry-type"], "Polygon"],
          paint: {
            "fill-color": "#0000ff",
            "fill-opacity": 0.4,
            "fill-outline-color": "#0000ff",
          },
        });

        ["points", "lines", "polygons"].forEach(setupLayerInteractions);

        map.current.on("click", (e) => {
          const features = map.current?.queryRenderedFeatures(e.point, {
            layers: ["points", "lines", "polygons"],
          });
          if (!features?.length) {
            setSelectedFeature(null);
          }
        });

        fitMapToBounds(mapboxgl);
      };

      if (map.current?.isStyleLoaded()) {
        addData();
      } else if (map.current) {
        map.current.once("style.load", addData);
      }
    }

    setupMap();

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [geojson]);

  return {
    mapContainer,
    selectedFeature,
  };
}
