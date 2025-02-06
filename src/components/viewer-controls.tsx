import { Button } from "@/components/ui/button";

interface ViewerControlsProps {
  fileName?: string;
  fileSize?: number;
  onUploadClick: () => void;
  children?: React.ReactNode;
}

function formatFileSize(bytes?: number): string {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(1)} ${units[unitIndex]}`;
}

export function ViewerControls({
  fileName,
  fileSize,
  onUploadClick,
  children,
}: ViewerControlsProps) {
  return (
    <div className="absolute top-4 right-4 bg-background/80 backdrop-blur-sm p-4 rounded-lg shadow-lg w-64">
      <div className="space-y-4">
        {/* File Info */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <h3 className="font-medium">File Information</h3>
            <Button
              onClick={onUploadClick}
              variant="outline"
              size="sm"
              className="text-xs"
            >
              Change File
            </Button>
          </div>
          <div className="text-sm space-y-1">
            <p className="text-muted-foreground">
              Name: {fileName || "Untitled"}
            </p>
            <p className="text-muted-foreground">
              Size: {formatFileSize(fileSize)}
            </p>
          </div>
        </div>

        {children}
      </div>
    </div>
  );
}

export { formatFileSize };
