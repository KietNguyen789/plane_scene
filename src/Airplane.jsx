import React, { useRef, useState, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Matrix4, Quaternion, Vector3 } from 'three';
import * as THREE from 'three';
import { updatePlaneAxis } from './controls';
import { useGLTF } from '@react-three/drei';
import TriangleGeometry from './myTriangle';
const x = new Vector3(1, 0, 0);
const y = new Vector3(0, 1, 0);
const z = new Vector3(0, 0, 1);
export const planePosition = new Vector3(0, 3, 7);
const delayedRotMatrix = new Matrix4();
const delayedQuaternion = new Quaternion();

// Biến toàn cục cho mouse control
let isMouseDown = false;
let theta = 0;
let phi = 60;
let targetTheta = 0;
let targetPhi = 60;
let onMouseDownTheta = 0;
let onMouseDownPhi = 0;
let onMouseDownPosition = { x: 0, y: 0 };
const radius = 0.3;



// Mouse event listeners
window.addEventListener("mousedown", (e) => {
  isMouseDown = true;
  onMouseDownPosition = { x: e.clientX, y: e.clientY };
  onMouseDownTheta = theta;
  onMouseDownPhi = phi;
});

window.addEventListener("mouseup", () => {
  isMouseDown = false;
});

window.addEventListener("mousemove", (e) => {
  if (isMouseDown) {
    targetTheta = -((e.clientX - onMouseDownPosition.x) * 0.5) + onMouseDownTheta;
    targetPhi = ((e.clientY - onMouseDownPosition.y) * 0.5) + onMouseDownPhi;
    targetPhi = Math.min(180, Math.max(-90, targetPhi));
  }
});

export function Airplane(props) {
  const [corners, setCorner] = useState()
  const { nodes, materials } = useGLTF("assets/models/scene.glb");

  useEffect(() => {
    // Giả sử model nằm trong nodes.Model
    const mesh = nodes.Model || nodes.Scene || nodes.YourMeshName;

    const box = new THREE.Box3().setFromObject(mesh);
    const min = box.min;  // góc min (x-, y-, z-)
    const max = box.max;  // góc max (x+, y+, z+)



    // 8 điểm góc của bounding box
    setCorner(

      new THREE.Vector3(min.x, min.y, min.z),
    );


  }, [nodes]);
  const groupRef = useRef();
  const helixMeshRef = useRef();


  useFrame(({ camera }) => {
    // Cập nhật vị trí và hướng máy bay
    updatePlaneAxis(x, y, z, planePosition, camera, corners);

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

    // Smooth interpolation cho camera rotation
    const smoothFactor = 0.09;
    theta += (targetTheta - theta) * smoothFactor;
    phi += (targetPhi - phi) * smoothFactor;

    // Tính offset camera theo spherical coordinates
    const offsetX = radius * Math.sin(theta * Math.PI / 360) * Math.cos(phi * Math.PI / 360);
    const offsetY = radius * Math.sin(phi * Math.PI / 360);
    const offsetZ = radius * Math.cos(theta * Math.PI / 360) * Math.cos(phi * Math.PI / 360);

    // Transform offset theo hệ tọa độ local của máy bay
    const localOffset = new Vector3(offsetX, offsetY, offsetZ);
    localOffset.applyMatrix4(rotMatrix);

    // Đặt vị trí camera theo máy bay + offset
    camera.position.set(
      planePosition.x + localOffset.x,
      planePosition.y + localOffset.y,
      planePosition.z + localOffset.z
    );

    camera.lookAt(planePosition);
    camera.matrixAutoUpdate = false;
    camera.updateMatrix();
    camera.matrixWorldNeedsUpdate = true;

    if (helixMeshRef.current) {
      helixMeshRef.current.rotation.z -= 1.0;
    }
  });

  const bodyMaterial = {
    color: new THREE.Color("#ccc"),
    metalness: 1,
    roughness: 0.1,
    envMapIntensity: 2
  };
  const wingMaterial = { color: '#0044ff' };
  const tailMaterial = { color: '#000' };
  return (
    <group ref={groupRef}>
      <group {...props} dispose={null} scale={0.01} rotation={[0, Math.PI / 2, 0]}>
        <mesh
          geometry={new THREE.CylinderGeometry(0.3, 0.3, 4, 32)}
          material={new THREE.MeshStandardMaterial(bodyMaterial)}
          rotation={[0, 0, Math.PI / 2]}
        />

        <mesh
          geometry={new THREE.ConeGeometry(0.3, 1, 32)}
          material={new THREE.MeshStandardMaterial(bodyMaterial)}
          position={[2.5, 0, 0]}
          rotation={[0, 0, Math.PI / 2 + Math.PI]}
        />

        <mesh
          geometry={new THREE.BoxGeometry(4, 0.1, 1)}
          material={new THREE.MeshStandardMaterial(wingMaterial)}
          position={[0, 0.2, 0]}
          rotation={[0, Math.PI / 2, 0]}
        />
        {/* tam giac trai */}
        <group position={[-0.2, 0.1, -2]} scale={1} rotation={[0, Math.PI / 4, 0]}>
          <mesh>
            <TriangleGeometry p1={[0, 0, 0]}
              p2={[1, 0, 0]}
              p3={[0, 0, 0.5]} />
            <meshStandardMaterial color="white" side={THREE.DoubleSide} />
          </mesh>
        </group>
        {/* tam giac phai */}
        <group position={[-0.2, 0.1, 2]} scale={1} rotation={[0, -Math.PI / 4, 0]}>
          <mesh>
            <TriangleGeometry p1={[0, 0, 0]}
              p2={[1, 0, 0]}
              p3={[0, 0, 0.5]} />
            <meshStandardMaterial color="white" side={THREE.DoubleSide} />
          </mesh>
        </group>

        {/* tail */}
        <mesh
          geometry={new THREE.BoxGeometry(2, 0.1, 0.5)}
          material={new THREE.MeshStandardMaterial(tailMaterial)}
          position={[-2, 0.2, 0]}
        />

        <mesh
          geometry={new THREE.BoxGeometry(0.1, 1, 0.5)}
          material={new THREE.MeshStandardMaterial(tailMaterial)}
          position={[-2, 0, 0]}
          rotation={[0, Math.PI / 2, 0]}
        />

        <mesh ref={helixMeshRef} rotation={[0, Math.PI / 2, 0]} position={[3.0, 0, 0]}>
          <boxGeometry args={[0.05, 2, 0.1]} />
          <meshStandardMaterial color="white" />
        </mesh>
      </group>
    </group>
  );
}

export default function App() {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Canvas camera={{ position: [0, 3, 7], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <Airplane />
        <gridHelper args={[50, 50]} />
      </Canvas>
    </div>
  );
}