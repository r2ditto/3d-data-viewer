import { useState, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Grid, Stats } from "@react-three/drei";
import * as THREE from "three";
import { Button } from "@/components/ui/button";
import { PointCloudControls } from "@/components/point-cloud-controls";
import { PointCloud } from "@/components/point-cloud";

interface PointCloudViewerProps {
  points?: Float32Array;
  fileName?: string;
  fileSize?: number;
  onUploadClick?: () => void;
}

export function PointCloudViewer({
  points,
  fileName,
  fileSize,
  onUploadClick,
}: PointCloudViewerProps) {
  const [pointSize, setPointSize] = useState(0.015);

  const boundingBox = useMemo(() => {
    if (!points) return undefined;

    const min: [number, number, number] = [Infinity, Infinity, Infinity];
    const max: [number, number, number] = [-Infinity, -Infinity, -Infinity];

    for (let i = 0; i < points.length; i += 3) {
      const x = points[i];
      const y = points[i + 1];
      const z = points[i + 2];

      if (isFinite(x) && !isNaN(x)) {
        min[0] = Math.min(min[0], x);
        max[0] = Math.max(max[0], x);
      }
      if (isFinite(y) && !isNaN(y)) {
        min[1] = Math.min(min[1], y);
        max[1] = Math.max(max[1], y);
      }
      if (isFinite(z) && !isNaN(z)) {
        min[2] = Math.min(min[2], z);
        max[2] = Math.max(max[2], z);
      }
    }

    return { min, max };
  }, [points]);

  if (!points) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-black">
        <div className="text-center space-y-4">
          <p className="text-lg text-gray-400">No point cloud data loaded</p>
          <Button
            onClick={onUploadClick}
            className="bg-primary hover:bg-primary/90"
          >
            Upload PCD File
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative bg-black">
      <Canvas
        camera={{
          position: [2, 2, 2],
          fov: 50,
          near: 0.1,
          far: 1000,
        }}
        gl={{ antialias: true }}
        dpr={window.devicePixelRatio}
        onCreated={({ gl }) => {
          gl.setClearColor(new THREE.Color(0x000000));
        }}
      >
        <PointCloud points={points} pointSize={pointSize} />

        <Grid
          position={[0, -1, 0]}
          args={[10, 10]}
          cellSize={0.5}
          cellThickness={0.5}
          cellColor="#333333"
          sectionSize={1}
          fadeDistance={30}
          fadeStrength={1}
        />

        <OrbitControls
          makeDefault
          minDistance={0.5}
          maxDistance={10}
          enableDamping={true}
          dampingFactor={0.05}
          screenSpacePanning={false}
        />

        <Stats />
      </Canvas>

      <PointCloudControls
        fileName={fileName}
        fileSize={fileSize}
        pointCount={points.length / 3}
        pointSize={pointSize}
        boundingBox={boundingBox}
        onPointSizeChange={setPointSize}
        onUploadClick={onUploadClick || (() => {})}
      />
    </div>
  );
}
