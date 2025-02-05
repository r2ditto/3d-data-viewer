import { useMemo } from "react";
import { BufferGeometry, BufferAttribute, Color } from "three";

interface PointCloudProps {
  points: Float32Array;
}

export function PointCloud({ points }: PointCloudProps) {
  const [positions, colors] = useMemo<[Float32Array, Float32Array]>(() => {
    const colors = new Float32Array(
      Array.from({ length: points.length / 3 }, () => [
        ...new Color("red").toArray(),
      ]).flat()
    );

    return [points, colors];
  }, [points]);

  const geometry = useMemo(() => {
    const geometry = new BufferGeometry();
    geometry.setAttribute("position", new BufferAttribute(positions, 3));
    geometry.setAttribute("color", new BufferAttribute(colors, 3));
    return geometry;
  }, [positions, colors]);

  return (
    <points>
      <primitive object={geometry} />
      <pointsMaterial
        attach="material"
        vertexColors
        size={0.02}
        sizeAttenuation
      />
    </points>
  );
}
