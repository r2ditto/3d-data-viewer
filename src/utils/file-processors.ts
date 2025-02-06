import { load } from "@loaders.gl/core";
import { PCDLoader } from "@loaders.gl/pcd";

export async function processPCDFile(file: File) {
  const data = await load(file, PCDLoader);
  if (!data.attributes?.POSITION?.value) {
    throw new Error("PCD file does not contain position data");
  }
  const rawPositions = data.attributes.POSITION.value;
  return new Float32Array(rawPositions);
}

export async function processGeoJSONFile(file: File) {
  const text = await file.text();
  return JSON.parse(text);
}
