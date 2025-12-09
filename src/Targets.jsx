import { useState, useMemo } from "react";
import { Quaternion, SphereGeometry, Vector3 } from "three";
import { mergeBufferGeometries } from "three-stdlib";
import { useFrame } from "@react-three/fiber";
import { planePosition } from "./Airplane";

function randomPoint(scale) {
  return new Vector3(
    Math.random() * 2 - 1,
    Math.random() * 2 - 1,
    Math.random() * 2 - 1
  ).multiply(scale || new Vector3(1, 1, 1));
}

function createCloudGeometry(center) {
  const geometries = [];

  // Main cloud body - 4-6 overlapping spheres
  const numSpheres = 4 + Math.floor(Math.random() * 3);
  const mainRadius = 0.15;

  for (let i = 0; i < numSpheres; i++) {
    const radius = mainRadius * (0.6 + Math.random() * 0.7);
    const offsetX = (Math.random() - 0.5) * mainRadius * 2;
    const offsetY = (Math.random() - 0.5) * mainRadius * 1.2;
    const offsetZ = (Math.random() - 0.5) * mainRadius * 0.8;

    const sphere = new SphereGeometry(radius, 10, 10);
    sphere.translate(
      center.x + offsetX,
      center.y + offsetY,
      center.z + offsetZ
    );
    geometries.push(sphere);
  }

  return mergeBufferGeometries(geometries);
}

const TARGET_RAD = 0.25;

export function Targets() {
  const [targets, setTargets] = useState(() => {
    const arr = [];
    for (let i = 0; i < 20; i++) {
      arr.push({
        center: randomPoint(new Vector3(4, 1, 4)).add(
          new Vector3(0, 2 + Math.random() * 2, 0)
        ),
        direction: randomPoint().normalize(),
        hit: false,
      });
    }

    return arr;
  });

  const geometry = useMemo(() => {
    let geo;

    targets.forEach((target) => {
      const cloudGeo = createCloudGeometry(target.center);

      if (!geo) geo = cloudGeo;
      else geo = mergeBufferGeometries([geo, cloudGeo]);
    });

    return geo;
  }, [targets]);

  useFrame(() => {
    targets.forEach((target, i) => {
      const v = planePosition.clone().sub(target.center);
      const dist = target.direction.dot(v);
      const projected = planePosition
        .clone()
        .sub(target.direction.clone().multiplyScalar(dist));

      const hitDist = projected.distanceTo(target.center);
      if (hitDist < TARGET_RAD) {
        target.hit = true;
      }
    });

    const atLeastOneHit = targets.find((target) => target.hit);
    if (atLeastOneHit) {
      setTargets(targets.filter((target) => !target.hit));
    }
  });

  return (
    <mesh geometry={geometry}>
      <meshStandardMaterial
        color="#b8d8f0"
        roughness={0.9}
        metalness={0.1}
        opacity={0.5}
        transparent
      />
    </mesh>
  );
}