import { useState, useMemo } from "react";
import { BufferGeometry, BufferAttribute, Color } from "three";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";

import { Slider } from "@/components/ui/slider";

interface PointCloudViewerProps {
  points: Float32Array;
}

function getColorForHeight(
  height: number,
  minHeight: number,
  maxHeight: number
): Color {
  const normalizedHeight = (height - minHeight) / (maxHeight - minHeight);

  if (normalizedHeight < 0.5) {
    const t = normalizedHeight * 2;
    return new Color(0, t, 1 - t);
  } else {
    const t = (normalizedHeight - 0.5) * 2;
    return new Color(t, 1 - t, 0);
  }
}

function PointCloud({
  points,
  pointSize,
}: {
  points: Float32Array;
  pointSize: number;
}) {
  const { geometry } = useMemo(() => {
    const geometry = new BufferGeometry();
    let minHeight = Infinity;
    let maxHeight = -Infinity;
    for (let i = 1; i < points.length; i += 3) {
      const height = points[i];
      minHeight = Math.min(minHeight, height);
      maxHeight = Math.max(maxHeight, height);
    }

    const colors = new Float32Array(points.length);
    for (let i = 0; i < points.length; i += 3) {
      const height = points[i + 1];
      const color = getColorForHeight(height, minHeight, maxHeight);
      colors[i] = color.r;
      colors[i + 1] = color.g;
      colors[i + 2] = color.b;
    }

    geometry.setAttribute("position", new BufferAttribute(points, 3));
    geometry.setAttribute("color", new BufferAttribute(colors, 3));

    return {
      geometry,
      heightRange: { min: minHeight, max: maxHeight },
    };
  }, [points]);

  return (
    <points>
      <primitive object={geometry} />
      <pointsMaterial
        attach="material"
        vertexColors
        size={pointSize}
        sizeAttenuation
      />
    </points>
  );
}

export function PointCloudViewer({ points }: PointCloudViewerProps) {
  const [pointSize, setPointSize] = useState(0.02);

  const handlePointSizeChange = (values: number[]) => {
    setPointSize(values[0]);
  };

  return (
    <div className="relative w-full h-full">
      <div className="absolute top-4 right-4 z-10 bg-background/80 backdrop-blur-sm p-4 rounded-lg shadow-lg">
        <div className="flex flex-col gap-2">
          <label htmlFor="point-size" className="text-sm font-medium">
            Point Size: {pointSize.toFixed(3)}
          </label>
          <Slider
            min={0.001}
            max={0.1}
            step={0.001}
            value={[pointSize]}
            onValueChange={handlePointSizeChange}
            className="w-[200px]"
          />
        </div>
      </div>

      {/* Color scale legend */}
      <div className="absolute bottom-4 right-4 z-10 bg-background/80 backdrop-blur-sm p-4 rounded-lg shadow-lg">
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium">Height</span>
          <div className="w-32 h-4 bg-gradient-to-r from-blue-500 via-green-500 to-red-500 rounded" />
          <div className="flex justify-between text-xs">
            <span>Low</span>
            <span>High</span>
          </div>
        </div>
      </div>

      <Canvas
        camera={{
          position: [5, 5, 5],
          fov: 75,
          near: 0.1,
          far: 1000,
        }}
        style={{ background: "#000000" }}
      >
        <PointCloud points={points} pointSize={pointSize} />
        <OrbitControls />
      </Canvas>
    </div>
  );
}
