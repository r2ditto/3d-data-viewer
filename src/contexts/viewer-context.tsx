import {
  createContext,
  useContext,
  useCallback,
  useState,
  ReactNode,
} from "react";
import type { GeoJSONData } from "@/types/geojson";

export enum Tab {
  THREE_D = "3D",
  GIS = "GIS",
}

interface PCDData {
  points: Float32Array;
  name: string;
  size: number;
}

interface GISData {
  geojson: GeoJSONData;
  name: string;
  size: number;
}

export interface FileState {
  pcd: PCDData | null;
  gis: GISData | null;
}

export type LogType = "info" | "error";

interface LogEntry {
  time: string;
  message: string;
  type: LogType;
}

interface ViewerContextType {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  fileState: FileState;
  setFileState: React.Dispatch<React.SetStateAction<FileState>>;
  logs: LogEntry[];
  addLog: (message: string, type?: LogType) => void;
  clearLogs: () => void;
}

const ViewerContext = createContext<ViewerContextType | null>(null);

export function ViewerProvider({ children }: { children: ReactNode }) {
  const [activeTab, setActiveTab] = useState(Tab.THREE_D);
  const [fileState, setFileState] = useState<FileState>({
    pcd: null,
    gis: null,
  });
  const [logs, setLogs] = useState<LogEntry[]>([]);

  const addLog = useCallback((message: string, type: LogType = "info") => {
    const time = new Date().toLocaleTimeString();
    setLogs((prev) => [...prev, { time, message, type }]);
  }, []);

  const clearLogs = useCallback(() => {
    setLogs([]);
    addLog("Log cleared");
  }, [addLog]);

  return (
    <ViewerContext.Provider
      value={{
        activeTab,
        setActiveTab,
        fileState,
        setFileState,
        logs,
        addLog,
        clearLogs,
      }}
    >
      {children}
    </ViewerContext.Provider>
  );
}

export function useViewer() {
  const context = useContext(ViewerContext);
  if (!context) {
    throw new Error("useViewer must be used within a ViewerProvider");
  }
  return context;
}
