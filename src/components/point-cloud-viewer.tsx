import { useMemo, useState } from "react";
import { Canvas, extend } from "@react-three/fiber";
import { OrbitControls, Grid, Stats } from "@react-three/drei";
import * as THREE from "three";
import { Button } from "@/components/ui/button";
import { PointCloudControls } from "@/components/point-cloud-controls";

// Extend Three.js elements for JSX
extend({ Points: THREE.Points });

interface PointCloudViewerProps {
  points?: Float32Array;
  fileName?: string;
  fileSize?: number;
  onUploadClick?: () => void;
}

function PointCloud({
  points,
  pointSize,
}: {
  points: Float32Array;
  pointSize: number;
}) {
  const { positions, colors } = useMemo(() => {
    // Process and normalize points
    const validPoints: number[] = [];
    let minX = Infinity,
      maxX = -Infinity;
    let minY = Infinity,
      maxY = -Infinity;
    let minZ = Infinity,
      maxZ = -Infinity;

    // Collect valid points and find bounds
    for (let i = 0; i < points.length; i += 3) {
      const x = points[i];
      const y = points[i + 1];
      const z = points[i + 2];

      if (
        isFinite(x) &&
        isFinite(y) &&
        isFinite(z) &&
        !isNaN(x) &&
        !isNaN(y) &&
        !isNaN(z)
      ) {
        validPoints.push(x, y, z);
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);
        minZ = Math.min(minZ, z);
        maxZ = Math.max(maxZ, z);
      }
    }

    // Calculate center and scale
    const center = new THREE.Vector3(
      (minX + maxX) / 2,
      (minY + maxY) / 2,
      (minZ + maxZ) / 2
    );

    const size = new THREE.Vector3(maxX - minX, maxY - minY, maxZ - minZ);

    const maxDim = Math.max(size.x, size.y, size.z);
    const scale = maxDim > 0 ? 2 / maxDim : 1;

    // Create normalized points and calculate colors
    const positions = new Float32Array(validPoints.length);
    const colors = new Float32Array(validPoints.length);

    for (let i = 0; i < validPoints.length; i += 3) {
      // Normalize positions
      positions[i] = (validPoints[i] - center.x) * scale;
      positions[i + 1] = (validPoints[i + 1] - center.y) * scale;
      positions[i + 2] = (validPoints[i + 2] - center.z) * scale;

      // Calculate color based on normalized height (y-coordinate)
      const heightRatio = (positions[i + 1] + 1) / 2; // Map from [-1, 1] to [0, 1]

      // Enhanced color contrast with vibrant colors
      if (heightRatio < 0.25) {
        // Lowest quarter: Electric blue to cyan
        const t = heightRatio * 4;
        colors[i] = 0; // Red
        colors[i + 1] = t; // Green
        colors[i + 2] = 1.0; // Blue
      } else if (heightRatio < 0.5) {
        // Lower middle: Cyan to bright green
        const t = (heightRatio - 0.25) * 4;
        colors[i] = 0; // Red
        colors[i + 1] = 1.0; // Green
        colors[i + 2] = 1.0 - t; // Blue
      } else if (heightRatio < 0.75) {
        // Upper middle: Green to yellow
        const t = (heightRatio - 0.5) * 4;
        colors[i] = t; // Red
        colors[i + 1] = 1.0; // Green
        colors[i + 2] = 0; // Blue
      } else {
        // Highest quarter: Yellow to magenta
        const t = (heightRatio - 0.75) * 4;
        colors[i] = 1.0; // Red
        colors[i + 1] = 1.0 - t; // Green
        colors[i + 2] = t; // Blue
      }
    }

    return { positions, colors };
  }, [points]);

  const geometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(positions, 3)
    );
    geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
    return geometry;
  }, [positions, colors]);

  const material = useMemo(() => {
    return new THREE.PointsMaterial({
      size: pointSize,
      sizeAttenuation: true,
      vertexColors: true,
      transparent: false,
      depthWrite: true,
    });
  }, [pointSize]);

  // @ts-ignore Three.js elements
  return (
    <points>
      <primitive object={geometry} attach="geometry" />
      <primitive object={material} attach="material" />
    </points>
  );
}

export function PointCloudViewer({
  points,
  fileName,
  fileSize,
  onUploadClick,
}: PointCloudViewerProps) {
  const [pointSize, setPointSize] = useState(0.015);

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
        onPointSizeChange={setPointSize}
        onUploadClick={onUploadClick || (() => {})}
      />
    </div>
  );
}
