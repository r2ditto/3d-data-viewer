import { useMemo } from "react";
import * as THREE from "three";
import { extend } from "@react-three/fiber";

// Extend Three.js elements for JSX
extend({ Points: THREE.Points });

interface PointCloudProps {
  points: Float32Array;
  pointSize: number;
}

export function PointCloud({ points, pointSize }: PointCloudProps) {
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
