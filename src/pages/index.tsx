import { useRef, useState } from "react";
import { load } from "@loaders.gl/core";
import { PCDLoader } from "@loaders.gl/pcd";

import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PointCloudViewer } from "@/components/point-cloud-viewer";
import { GISViewer } from "@/components/gis-viewer";

import type { GeoJSONData } from "@/types/geojson";

enum Tab {
  THREE_D = "3D",
  GIS = "GIS",
}

interface FileData {
  points: Float32Array;
  name: string;
  size: number;
}

export default function Home() {
  const [activeTab, setActiveTab] = useState(Tab.THREE_D);
  const [fileData, setFileData] = useState<FileData | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const isPCD = file.name.toLowerCase().endsWith(".pcd");
    const isJSON =
      file.name.toLowerCase().endsWith(".json") ||
      file.name.toLowerCase().endsWith(".geojson");

    if (activeTab === Tab.THREE_D && !isPCD) {
      alert("Please upload a PCD file");
      return;
    }

    if (activeTab === Tab.GIS && !isJSON) {
      alert("Please upload a JSON or GeoJSON file");
      return;
    }

    try {
      let points: Float32Array;

      if (isPCD) {
        const data = await load(file, PCDLoader);
        points = new Float32Array(data.attributes.POSITION.value);
      } else {
        const text = await file.text();
        const json = JSON.parse(text) as GeoJSONData;
        points = new Float32Array(
          json.features.flatMap((feature) => {
            const coords = feature.geometry.coordinates;
            return [coords[0], coords[1], feature.properties?.height || 0];
          })
        );
      }

      setFileData({
        points,
        name: file.name,
        size: file.size,
      });
    } catch (error) {
      console.error("Error parsing file:", error);
      alert(
        `Error parsing ${activeTab === Tab.THREE_D ? "PCD" : "GeoJSON"} file`
      );
    }
  };

  const handleUploadClick = () => fileInputRef.current?.click();

  const getAcceptedFileTypes = () => {
    return activeTab === Tab.THREE_D ? ".pcd" : ".json,.geojson";
  };

  const getUploadButtonLabel = () => {
    return activeTab === Tab.THREE_D
      ? "Upload PCD File"
      : "Upload GeoJSON File";
  };

  return (
    <>
      {/* // Header */}
      <div className="border-b">
        <div className="flex h-16 items-center px-4"></div>
      </div>

      <main className="p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <Tabs
            value={activeTab}
            onValueChange={(value: string) => setActiveTab(value as Tab)}
            className="w-[400px]"
          >
            <TabsList>
              <TabsTrigger value={Tab.THREE_D}>3D Viewer</TabsTrigger>
              <TabsTrigger value={Tab.GIS}>GIS</TabsTrigger>
            </TabsList>
          </Tabs>

          <div>
            <input
              type="file"
              accept={getAcceptedFileTypes()}
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
            />
            <Button onClick={handleUploadClick}>
              {getUploadButtonLabel()}
            </Button>
          </div>
        </div>

        <div className="mt-8 border p-8 rounded-xl">
          {activeTab === Tab.THREE_D && (
            <div>
              <div className="w-full h-[600px]">
                {fileData && (
                  <PointCloudViewer
                    points={fileData.points}
                    fileName={fileData.name}
                    fileSize={fileData.size}
                  />
                )}
              </div>
            </div>
          )}
          {activeTab === Tab.GIS && (
            <div className="w-full h-[600px]">
              {fileData && <GISViewer points={fileData.points} />}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
