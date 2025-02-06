import type { GeoJSON } from "geojson";
import { Button } from "@/components/ui/button";
import { GISControls } from "@/components/gis-controls";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useMapbox } from "@/hooks/useMapbox";
import "mapbox-gl/dist/mapbox-gl.css";

interface GISViewerProps {
  geojson?: GeoJSON;
  fileName?: string;
  fileSize?: number;
  onUploadClick?: () => void;
}

export function GISViewer({
  geojson,
  fileName,
  fileSize,
  onUploadClick,
}: GISViewerProps) {
  const { mapContainer, selectedFeature } = useMapbox(geojson);

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
