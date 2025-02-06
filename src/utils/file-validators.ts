import { Tab } from "@/contexts/viewer-context";

export const fileValidators = {
  isPCD: (fileName: string) => fileName.toLowerCase().endsWith(".pcd"),
  isGeoJSON: (fileName: string) =>
    fileName.toLowerCase().endsWith(".json") ||
    fileName.toLowerCase().endsWith(".geojson"),
};

export function validateFileType(file: File, tab: Tab) {
  if (tab === Tab.THREE_D && !fileValidators.isPCD(file.name)) {
    throw new Error("Please upload a PCD file");
  }
  if (tab === Tab.GIS && !fileValidators.isGeoJSON(file.name)) {
    throw new Error("Please upload a JSON or GeoJSON file");
  }
}
