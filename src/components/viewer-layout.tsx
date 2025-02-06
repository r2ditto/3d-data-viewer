import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SystemLog } from "@/components/system-log";
import { ViewerSwitch } from "@/components/viewer-switch";
import { useViewerLayout } from "@/hooks/useViewerLayout";
import { Tab } from "@/contexts/viewer-context";

export function ViewerLayout() {
  const {
    fileInputRef,
    activeTab,
    fileState,
    handleFileUpload,
    handleUploadClick,
    handleTabChange,
    getAcceptedFileTypes,
  } = useViewerLayout();

  return (
    <main className="p-8 pt-6">
      {/* Tabs */}
      <div className="flex items-center justify-between space-y-2">
        <Tabs
          value={activeTab}
          onValueChange={handleTabChange}
          className="w-[400px]"
        >
          <TabsList>
            <TabsTrigger value={Tab.THREE_D}>3D Viewer</TabsTrigger>
            <TabsTrigger value={Tab.GIS}>GIS</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* 3d GIS Viewer */}
      <div className="mt-8 border p-8 rounded-xl">
        <input
          type="file"
          accept={getAcceptedFileTypes()}
          ref={fileInputRef}
          onChange={handleFileUpload}
          className="hidden"
        />
        <ViewerSwitch
          activeTab={activeTab}
          fileState={fileState}
          onUploadClick={handleUploadClick}
        />
      </div>

      {/* System Log */}
      <SystemLog />
    </main>
  );
}
