import { useRef, useState } from "react";
import { load } from "@loaders.gl/core";
import { PCDLoader } from "@loaders.gl/pcd";

import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PointCloudViewer } from "@/components/point-cloud-viewer";

enum Tab {
  THREE_D = "3D",
  GIS = "GIS",
}

export default function Home() {
  const [activeTab, setActiveTab] = useState(Tab.THREE_D);
  const [points, setPoints] = useState<Float32Array | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".pcd")) {
      alert("Please upload a PCD file");
      return;
    }

    try {
      const data = await load(file, PCDLoader);
      const positions = new Float32Array(data.attributes.POSITION.value);
      setPoints(positions);
    } catch (error) {
      console.error("Error parsing PCD file:", error);
      alert("Error parsing PCD file");
    }
  };

  const handleUploadClick = () => fileInputRef.current?.click();

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
              accept=".pcd"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
            />
            <Button onClick={handleUploadClick}>Upload PCD File</Button>
          </div>
        </div>

        <div className="mt-8 border p-8 rounded-xl">
          {activeTab === Tab.THREE_D && (
            <div>
              <h2 className="text-2xl font-bold mb-4">3D Point Cloud Viewer</h2>
              <div className="w-full h-[600px]">
                {points && <PointCloudViewer points={points} />}
              </div>
            </div>
          )}
          {activeTab === Tab.GIS && (
            <div>
              <h2 className="text-2xl font-bold">GIS Content</h2>
              <p>This is where your GIS component will go</p>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
