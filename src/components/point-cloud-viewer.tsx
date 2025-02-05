import { useState } from "react";
import { BufferGeometry, BufferAttribute, Color } from "three";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Slider } from "@/components/ui/slider";

interface PointCloudViewerProps {
  points: Float32Array;
}

function PointCloud({
  points,
  pointSize,
}: {
  points: Float32Array;
  pointSize: number;
}) {
  const geometry = new BufferGeometry();
  const colors = new Float32Array(
    Array.from({ length: points.length / 3 }, () => [
      ...new Color("red").toArray(),
    ]).flat()
  );

  geometry.setAttribute("position", new BufferAttribute(points, 3));
  geometry.setAttribute("color", new BufferAttribute(colors, 3));

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
        {/* <gridHelper args={[10, 10]} />
        <axesHelper args={[5]} /> */}
      </Canvas>
    </div>
  );
}
