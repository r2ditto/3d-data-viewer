import { Slider } from "@/components/ui/slider";
import { ViewerControls } from "@/components/viewer-controls";

interface PointCloudControlsProps {
  fileName?: string;
  fileSize?: number;
  pointCount?: number;
  pointSize: number;
  boundingBox?: {
    min: [number, number, number];
    max: [number, number, number];
  };
  onPointSizeChange: (value: number) => void;
  onUploadClick: () => void;
}

export function PointCloudControls({
  fileName,
  fileSize,
  pointCount,
  pointSize,
  boundingBox,
  onPointSizeChange,
  onUploadClick,
}: PointCloudControlsProps) {
  return (
    <ViewerControls
      fileName={fileName}
      fileSize={fileSize}
      onUploadClick={onUploadClick}
    >
      <div className="text-sm space-y-1">
        {/* Point Size Control */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <h3 className="font-medium">Point Size</h3>
            <span className="text-sm text-muted-foreground">
              {pointSize.toFixed(3)}
            </span>
          </div>
          <Slider
            value={[pointSize]}
            onValueChange={([value]) => onPointSizeChange(value)}
            min={0.001}
            max={0.05}
            step={0.001}
            className="w-full"
          />
        </div>
        <p className="text-muted-foreground pt-2">Points: {pointCount || 0}</p>
      </div>

      {/* Bounding Box Dimensions */}
      {boundingBox && (
        <div className="space-y-2">
          <h3 className="font-medium">Bounding Box</h3>
          <div className="text-sm space-y-1">
            <div className="grid grid-cols-2 gap-2">
              <span className="text-muted-foreground">Width:</span>
              <span className="text-right">
                {(boundingBox.max[0] - boundingBox.min[0]).toFixed(2)}m
              </span>
              <span className="text-muted-foreground">Length:</span>
              <span className="text-right">
                {(boundingBox.max[1] - boundingBox.min[1]).toFixed(2)}m
              </span>
              <span className="text-muted-foreground">Height:</span>
              <span className="text-right">
                {(boundingBox.max[2] - boundingBox.min[2]).toFixed(2)}m
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Color Legend */}
      <div className="space-y-2">
        <h3 className="font-medium">Height Color Scale</h3>
        <div className="h-4 w-full rounded-sm bg-gradient-to-r from-[#0066ff] via-[#00ffff] via-[#00ff00] via-[#ffff00] to-[#ff00ff]" />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Low</span>
          <span>High</span>
        </div>
      </div>
    </ViewerControls>
  );
}
