import { useViewer } from "@/contexts/viewer-context";
import { validateFileType, fileValidators } from "@/utils/file-validators";
import { processPCDFile, processGeoJSONFile } from "@/utils/file-processors";

export function useFileHandler() {
  const { activeTab, setFileState, addLog } = useViewer();

  const handleFile = async (file: File) => {
    try {
      validateFileType(file, activeTab);
      addLog(`Processing ${file.name}...`);

      if (fileValidators.isPCD(file.name)) {
        const points = await processPCDFile(file);
        addLog(`Successfully loaded ${points.length / 3} points`);
        setFileState((prev) => ({
          ...prev,
          pcd: { points, name: file.name, size: file.size },
        }));
      } else {
        const geojson = await processGeoJSONFile(file);
        addLog(`Successfully loaded ${geojson.features.length} features`);
        setFileState((prev) => ({
          ...prev,
          gis: { geojson, name: file.name, size: file.size },
        }));
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      addLog(`Error processing file: ${errorMessage}`);
      throw error;
    }
  };

  return { handleFile };
}
