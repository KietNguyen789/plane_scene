import React, { useRef, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber';
import { Matrix4, Quaternion, Vector3, DoubleSide } from 'three';
import * as THREE from 'three';
import { updatePlaneAxis } from './controls';
import { Environment, ContactShadows, RoundedBox, useTexture } from '@react-three/drei';

// --- CẤU HÌNH HỆ TRỤC ---
const x = new Vector3(1, 0, 0);
const y = new Vector3(0, 1, 0);
const z = new Vector3(0, 0, 1);
export const planePosition = new Vector3(0.5, 3.5, 7);
const delayedRotMatrix = new Matrix4();
const delayedQuaternion = new Quaternion();

// --- BIẾN ĐIỀU KHIỂN CHUỘT ---
let isMouseDown = false;
let theta = 0;
let phi = 60;
let targetTheta = 0;
let targetPhi = 60; // init vị trí camera góc phi = 60 độ trục song song với trục z
let onMouseDownTheta = 0;
let onMouseDownPhi = 0;
let onMouseDownPosition = { x: 0, y: 0 };
const radius = 0.3; // ban kinh duong tron
const widthW = window.innerWidth;
const heightH = window.innerHeight;
// --- SỰ KIỆN CHUỘT ---
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
    // 0.5 la hẹ số nhạy
    //uoc tinh thuc nghiẹm
    targetTheta = -((e.clientX - onMouseDownPosition.x) * 0.5) + onMouseDownTheta;
    targetPhi = ((e.clientY - onMouseDownPosition.y) * 0.5) + onMouseDownPhi;
    targetPhi = Math.min(180, Math.max(-90, targetPhi));
    // can tren 180, can duoi la -90
  }
});

// --- COMPONENT MÁY BAY ---
export function Airplane(props) {
  const groupRef = useRef();
  const helixMeshRef = useRef(); // Cánh quạt

  useFrame(({ camera }) => {
    // Logic di chuyển máy bay
    const dummyCorners = [new Vector3(0, 0, 0)];
    updatePlaneAxis(x, y, z, planePosition, camera, dummyCorners);

    const rotMatrix = new Matrix4().makeBasis(x, y, z);

    const matrix = new Matrix4()
      .multiply(new Matrix4().makeTranslation(planePosition.x, planePosition.y, planePosition.z))
      .multiply(rotMatrix);

    if (groupRef.current) {
      groupRef.current.matrixAutoUpdate = false;
      groupRef.current.matrix.copy(matrix);
      groupRef.current.matrixWorldNeedsUpdate = true;

    }


    // Camera follow logic
    const quaternionA = new Quaternion().copy(delayedQuaternion);
    const quaternionB = new Quaternion().setFromRotationMatrix(rotMatrix);

    const t = 0.175;
    const interpolated = new Quaternion().copy(quaternionA);
    interpolated.slerp(quaternionB, t);
    delayedQuaternion.copy(interpolated);

    delayedRotMatrix.identity().makeRotationFromQuaternion(delayedQuaternion);

    const smoothFactor = 0.09;
    theta += (targetTheta - theta) * smoothFactor;
    phi += (targetPhi - phi) * smoothFactor;

    const offsetX = radius * Math.sin(theta * Math.PI / 360) * Math.cos(phi * Math.PI / 360);
    const offsetY = radius * Math.sin(phi * Math.PI / 360);
    const offsetZ = radius * Math.cos(theta * Math.PI / 360) * Math.cos(phi * Math.PI / 360);

    const localOffset = new Vector3(offsetX, offsetY, offsetZ);
    localOffset.applyMatrix4(rotMatrix);

    camera.position.set(
      planePosition.x + localOffset.x,
      planePosition.y + localOffset.y,
      planePosition.z + localOffset.z
    );

    camera.lookAt(planePosition);
    camera.matrixAutoUpdate = false;
    camera.updateMatrix();
    camera.matrixWorldNeedsUpdate = true;

    // --- SỬA LOGIC QUAY CÁNH QUẠT ---
    if (helixMeshRef.current) {
      // Máy bay hướng theo trục X, nên cánh quạt phải quay quanh trục X
      helixMeshRef.current.rotation.x -= 5;
    }
  });

  // --- VẬT LIỆU (MATERIALS) ---
  const materials = {
    body: <meshStandardMaterial color="#eeeeee" metalness={0.6} roughness={0.2} envMapIntensity={1} />,
    glass: <meshStandardMaterial color="#111111" metalness={0.9} roughness={0.1} envMapIntensity={2} />,
    wing: <meshStandardMaterial color="#E74C3C" metalness={0.2} roughness={0.5} />,
    metal: <meshStandardMaterial color="#555555" metalness={1} roughness={0.3} />,
    blade: <meshStandardMaterial color="#333333" metalness={0.8} roughness={0.2} />, // Màu riêng cho cánh quạt
  };

  return (
    <group ref={groupRef}>
      {/* Container chính xoay cho đúng hướng trục */}
      <group {...props} dispose={null} scale={0.01} rotation={[0, Math.PI / 2, 0]}>

        {/* 1. THÂN MÁY BAY (FUSELAGE) */}
        <mesh rotation={[0, 0, Math.PI / 2]} castShadow receiveShadow>
          <cylinderGeometry args={[0.35, 0.25, 4, 32]} />
          {materials.body}
        </mesh>

        {/* Đầu máy bay (Engine Cowling) */}
        <mesh position={[2.1, 0, 0]} rotation={[0, 0, -Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.05, 0.35, 0.4, 32]} />
          {materials.metal}
        </mesh>

        {/* 2. BUỒNG LÁI (COCKPIT) */}
        <mesh position={[0.5, 0.35, 0]} castShadow>
          <sphereGeometry args={[0.35, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2]} />
          {materials.glass}
        </mesh>

        {/* 3. CÁNH CHÍNH (WINGS) */}
        <group position={[0.2, 0, 0]}>
          <RoundedBox args={[1.2, 0.1, 5]} radius={0.05} smoothness={4} castShadow receiveShadow>
            {materials.wing}
          </RoundedBox>
        </group>

        {/* 4. ĐUÔI (TAIL) */}
        {/* Đuôi ngang */}
        <group position={[-1.6, 0.1, 0]}>
          <RoundedBox args={[0.8, 0.1, 1.8]} radius={0.05} smoothness={4} castShadow>
            {materials.wing}
          </RoundedBox>
        </group>
        {/* Đuôi đứng */}
        <group position={[-1.6, 0.6, 0]}>
          <RoundedBox args={[0.6, 1.2, 0.1]} radius={0.05} smoothness={4} castShadow>
            {materials.wing}
          </RoundedBox>
        </group>

        {/* 5. CÁNH QUẠT (PROPELLER) - ĐÃ SỬA */}
        {/* Đặt group cánh quạt ở đầu mũi máy bay */}
        <group ref={helixMeshRef} position={[2.32, 0, 0]}>

          {/* Chóp cánh quạt (Spinner) */}
          <mesh rotation={[0, 0, -Math.PI / 2]} castShadow>
            {/* Cone hướng theo trục X */}
            <coneGeometry args={[0.1, 0.3, 32]} />
            {materials.wing}
          </mesh>

          {/* Cánh quạt 1 */}
          <mesh position={[0, 0.8, 0]} castShadow>
            {/* Box mỏng trục X, dài trục Y, rộng trục Z */}
            <boxGeometry args={[0.02, 1.6, 0.15]} />
            {materials.blade}
          </mesh>

          {/* Cánh quạt 2 */}
          <mesh position={[0, -0.8, 0]} castShadow>
            <boxGeometry args={[0.02, 1.6, 0.15]} />
            {materials.blade}
          </mesh>

          {/* Trục nối nhỏ giữa chóp và cánh để nhìn liền mạch hơn */}
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.05, 0.05, 0.1]} />
            {materials.blade}
          </mesh>

        </group>

        {/* 6. CÀNG ĐÁP (LANDING GEAR) */}
        {/* Bánh trái */}
        {/* <group position={[0.5, -0.6, 1]}>
          <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
            <torusGeometry args={[0.15, 0.08, 16, 32]} />
            {materials.glass}
          </mesh>
          <mesh position={[0, 0.3, 0]}>
            <cylinderGeometry args={[0.05, 0.05, 0.6]} />
            {materials.metal}
          </mesh>
        </group> */}
        {/* Bánh phải */}
        {/* <group position={[0.5, -0.6, -1]}>
          <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
            <torusGeometry args={[0.15, 0.08, 16, 32]} />
            {materials.glass}
          </mesh>
          <mesh position={[0, 0.3, 0]}>
            <cylinderGeometry args={[0.05, 0.05, 0.6]} />
            {materials.metal}
          </mesh>
        </group> */}

      </group>
    </group>
  );
}

export default function App() {
  return (
    <div style={{ width: '100vw', height: '100vh', background: '#111' }}>
      <Canvas shadows camera={{ position: [0, 3, 7], fov: 45 }}>
        {/* Môi trường và Ánh sáng */}
        <ambientLight intensity={0.7} />
        {/* <directionalLight
          position={[10, 10, 5]}
          intensity={1.5}
          castShadow
          shadow-mapSize={[1024, 1024]}
        /> */}

        {/* Environment giúp vật liệu kim loại phản chiếu đẹp hơn */}
        {/* <Environment preset="city" /> */}

        <Airplane />

        {/* Bóng đổ dưới mặt đất */}
        <ContactShadows
          position={[0, -2, 0]}
          opacity={0.5}
          scale={20}
          blur={2}
          far={4.5}
        />

        {/* Lưới hỗ trợ */}
        <gridHelper args={[50, 50, 0xff0000, 0x444444]} position={[0, -2, 0]} />
      </Canvas>
    </div>
  );
}