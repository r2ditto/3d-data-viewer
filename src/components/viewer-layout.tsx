import { useRef } from "react";
import { load } from "@loaders.gl/core";
import { PCDLoader } from "@loaders.gl/pcd";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PointCloudViewer } from "@/components/point-cloud-viewer";
import { GISViewer } from "@/components/gis-viewer";
import { SystemLog } from "@/components/system-log";
import { useViewer, Tab } from "@/contexts/viewer-context";

export function ViewerLayout() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { activeTab, setActiveTab, fileState, setFileState, addLog } =
    useViewer();

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const isPCD = file.name.toLowerCase().endsWith(".pcd");
    const isJSON =
      file.name.toLowerCase().endsWith(".json") ||
      file.name.toLowerCase().endsWith(".geojson");

    addLog(`Attempting to upload ${file.name}`);

    if (activeTab === Tab.THREE_D && !isPCD) {
      addLog("Error: Invalid file type. Please upload a PCD file");
      alert("Please upload a PCD file");
      return;
    }

    if (activeTab === Tab.GIS && !isJSON) {
      addLog("Error: Invalid file type. Please upload a JSON or GeoJSON file");
      alert("Please upload a JSON or GeoJSON file");
      return;
    }

    try {
      if (isPCD) {
        addLog("Processing PCD file...");
        const data = await load(file, PCDLoader);

        if (!data.attributes?.POSITION?.value) {
          throw new Error("PCD file does not contain position data");
        }

        const rawPositions = data.attributes.POSITION.value;
        const points = new Float32Array(rawPositions);
        addLog(`Successfully loaded ${points.length / 3} points`);

        setFileState((prev) => ({
          ...prev,
          pcd: {
            points,
            name: file.name,
            size: file.size,
          },
        }));
      } else {
        addLog("Processing GeoJSON file...");
        const text = await file.text();
        const geojson = JSON.parse(text);
        const featureCount = geojson.features.length;
        addLog(`Successfully loaded ${featureCount} features`);

        setFileState((prev) => ({
          ...prev,
          gis: {
            geojson,
            name: file.name,
            size: file.size,
          },
        }));
      }
    } catch (error) {
      console.error("Error parsing file:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      const logMessage = `Error parsing ${
        activeTab === Tab.THREE_D ? "PCD" : "GeoJSON"
      } file: ${errorMessage}`;
      addLog(logMessage);
      alert(logMessage);
    }
  };

  const handleUploadClick = () => fileInputRef.current?.click();

  const getAcceptedFileTypes = () => {
    return activeTab === Tab.THREE_D ? ".pcd" : ".json,.geojson";
  };

  return (
    <main className="p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <Tabs
          value={activeTab}
          onValueChange={(value: string) => {
            setActiveTab(value as Tab);
            addLog(`Switched to ${value} viewer`);
          }}
          className="w-[400px]"
        >
          <TabsList>
            <TabsTrigger value={Tab.THREE_D}>3D Viewer</TabsTrigger>
            <TabsTrigger value={Tab.GIS}>GIS</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="mt-8 border p-8 rounded-xl">
        <input
          type="file"
          accept={getAcceptedFileTypes()}
          ref={fileInputRef}
          onChange={handleFileUpload}
          className="hidden"
        />

        {activeTab === Tab.THREE_D && (
          <div className="w-full h-[600px]">
            <PointCloudViewer
              points={fileState.pcd?.points}
              fileName={fileState.pcd?.name}
              fileSize={fileState.pcd?.size}
              onUploadClick={() => {
                handleUploadClick();
                addLog("Initiated PCD file upload");
              }}
            />
          </div>
        )}
        {activeTab === Tab.GIS && (
          <div className="w-full h-[600px]">
            <GISViewer
              geojson={fileState.gis?.geojson}
              fileName={fileState.gis?.name}
              fileSize={fileState.gis?.size}
              onUploadClick={() => {
                handleUploadClick();
                addLog("Initiated GeoJSON file upload");
              }}
            />
          </div>
        )}
      </div>

      <SystemLog />
    </main>
  );
}
