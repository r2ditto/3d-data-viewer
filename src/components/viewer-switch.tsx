import { Tab } from "@/contexts/viewer-context";
import { GISViewer } from "./gis-viewer";
import { PointCloudViewer } from "./point-cloud-viewer";

import type { FileState } from "@/contexts/viewer-context";

const viewers = {
  [Tab.THREE_D]: PointCloudViewer,
  [Tab.GIS]: GISViewer,
};

interface ViewerSwitchProps {
  onUploadClick: () => void;
  fileState: FileState;
  activeTab: Tab;
}

export function ViewerSwitch({
  activeTab,
  fileState,
  onUploadClick,
}: ViewerSwitchProps) {
  const Viewer = viewers[activeTab];
  const viewerProps =
    activeTab === Tab.THREE_D
      ? {
          points: fileState.pcd?.points,
          fileName: fileState.pcd?.name,
          fileSize: fileState.pcd?.size,
          onUploadClick,
        }
      : {
          geojson: fileState.gis?.geojson,
          fileName: fileState.gis?.name,
          fileSize: fileState.gis?.size,
          onUploadClick,
        };

  return (
    <div className="w-full h-[600px]">
      <Viewer {...viewerProps} />
    </div>
  );
}
