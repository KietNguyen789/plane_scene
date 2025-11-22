import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber';
import { Matrix4, Quaternion, Vector3 } from 'three';
import { updatePlaneAxis } from './controls';
import * as THREE from 'three';
const x = new Vector3(1, 0, 0);
const y = new Vector3(0, 1, 0);
const z = new Vector3(0, 0, 1);
export const planePosition = new Vector3(0, 3, 7);

const delayedRotMatrix = new Matrix4();
const delayedQuaternion = new Quaternion();

export function Airplane(props) {

  const groupRef = useRef();
  const helixMeshRef = useRef();

  useFrame(({ camera }) => {
    updatePlaneAxis(x, y, z, planePosition, camera);

    const rotMatrix = new Matrix4().makeBasis(x, y, z);

    const matrix = new Matrix4()
      .multiply(new Matrix4().makeTranslation(planePosition.x, planePosition.y, planePosition.z))
      .multiply(rotMatrix);

    groupRef.current.matrixAutoUpdate = false;
    groupRef.current.matrix.copy(matrix);
    groupRef.current.matrixWorldNeedsUpdate = true;

    const quaternionA = new Quaternion().copy(delayedQuaternion);
    const quaternionB = new Quaternion().setFromRotationMatrix(rotMatrix);

    const t = 0.175;
    const interpolated = new Quaternion().copy(quaternionA);
    interpolated.slerp(quaternionB, t);
    delayedQuaternion.copy(interpolated);

    delayedRotMatrix.identity().makeRotationFromQuaternion(delayedQuaternion);

    const cameraMatrix = new Matrix4()
      .multiply(new Matrix4().makeTranslation(planePosition.x, planePosition.y, planePosition.z))
      .multiply(delayedRotMatrix)
      .multiply(new Matrix4().makeRotationX(-0.2))
      .multiply(new Matrix4().makeTranslation(0, 0.015, 0.3));

    camera.matrixAutoUpdate = false;
    camera.matrix.copy(cameraMatrix);
    camera.matrixWorldNeedsUpdate = true;

    if (helixMeshRef.current) {
      helixMeshRef.current.rotation.z -= 1.0;
    }
  });

  // MATERIALS
  const bodyMaterial = { color: '#ffffff' };
  const wingMaterial = { color: '#0044ff' };

  return (
    <group ref={groupRef}>
      {/* Scale giống như model gốc */}
      <group {...props} dispose={null} scale={0.01} rotation={[0, Math.PI / 2, 0]}>

        {/* BODY — Fuselage */}
        <mesh
          geometry={new THREE.CylinderGeometry(0.3, 0.3, 4, 32)}
          material={new THREE.MeshStandardMaterial(bodyMaterial)}
          rotation={[0, 0, Math.PI / 2]}
        />

        {/* NOSE */}
        <mesh
          geometry={new THREE.ConeGeometry(0.3, 1, 32)}
          material={new THREE.MeshStandardMaterial(bodyMaterial)}
          position={[2.5, 0, 0]}
          rotation={[0, 0, Math.PI / 2 + Math.PI]}
        />

        {/* WINGS */}
        <mesh
          geometry={new THREE.BoxGeometry(6, 0.1, 1)}
          material={new THREE.MeshStandardMaterial(wingMaterial)}
          position={[0, 0.2, 0]}
          rotation={[0, Math.PI / 2, 0]}
        />

        {/* TAIL HORIZONTAL */}
        <mesh
          geometry={new THREE.BoxGeometry(2, 0.1, 0.5)}
          material={new THREE.MeshStandardMaterial(wingMaterial)}
          position={[-2, 0.2, 0]}
        />

        {/* TAIL VERTICAL */}
        <mesh
          geometry={new THREE.BoxGeometry(0.1, 1, 0.5)}
          material={new THREE.MeshStandardMaterial(wingMaterial)}
          position={[-2, 0, 0]}
          rotation={[0, Math.PI / 2, 0]}
        />

        {/* PROPELLER — optional nếu muốn */}
        <mesh ref={helixMeshRef} rotation={[0, Math.PI / 2, 0]} position={[3.0, 0, 0]}>
          <boxGeometry args={[0.05, 2, 0.1]} />
          <meshStandardMaterial color="white" />
        </mesh>

      </group>
    </group>
  )
}
