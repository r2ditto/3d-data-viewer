import { ViewerControls } from "@/components/viewer-controls";

interface GISControlsProps {
  fileName?: string;
  fileSize?: number;
  featureCounts: {
    points: number;
    lines: number;
    polygons: number;
  };
  onUploadClick: () => void;
}

export function GISControls({
  fileName,
  fileSize,
  featureCounts,
  onUploadClick,
}: GISControlsProps) {
  return (
    <ViewerControls
      fileName={fileName}
      fileSize={fileSize}
      onUploadClick={onUploadClick}
    >
      {/* Feature Statistics */}
      <div className="space-y-2">
        <h3 className="font-medium">Feature Statistics</h3>
        <div className="text-sm space-y-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <span className="text-muted-foreground">Points</span>
            </div>
            <span className="text-muted-foreground">
              {featureCounts.points}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500" />
              <span className="text-muted-foreground">Lines</span>
            </div>
            <span className="text-muted-foreground">{featureCounts.lines}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 bg-opacity-40" />
              <span className="text-muted-foreground">Polygons</span>
            </div>
            <span className="text-muted-foreground">
              {featureCounts.polygons}
            </span>
          </div>
          <div className="mt-1 pt-1 border-t border-border">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Features</span>
              <span className="text-muted-foreground">
                {featureCounts.points +
                  featureCounts.lines +
                  featureCounts.polygons}
              </span>
            </div>
          </div>
        </div>
      </div>
    </ViewerControls>
  );
}
