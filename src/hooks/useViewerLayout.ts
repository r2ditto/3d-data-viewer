import { useRef } from "react";
import { useViewer, Tab } from "@/contexts/viewer-context";
import { useFileHandler } from "@/hooks/useFileHandler";

export function useViewerLayout() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { activeTab, setActiveTab, fileState, addLog } = useViewer();
  const { handleFile } = useFileHandler();

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    addLog(`Attempting to upload ${file.name}`);
    try {
      await handleFile(file);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      addLog(errorMessage, "error");
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
    addLog(
      `Initiated ${activeTab === Tab.THREE_D ? "PCD" : "GeoJSON"} file upload`
    );
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value as Tab);
    addLog(`Switched to ${value} viewer`);
  };

  const getAcceptedFileTypes = () =>
    activeTab === Tab.THREE_D ? ".pcd" : ".json,.geojson";

  return {
    fileInputRef,
    activeTab,
    fileState,
    handleFileUpload,
    handleUploadClick,
    handleTabChange,
    getAcceptedFileTypes,
  };
}
