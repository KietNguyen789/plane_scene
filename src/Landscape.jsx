import React, { useEffect, useMemo, useRef } from "react";
import { MeshReflectorMaterial, useGLTF } from "@react-three/drei";
import { Color, MeshStandardMaterial } from "three";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { Targets } from "./Targets";
// Component cho trạm quan sát
function ObservationTower({ position, rotation = [0, 0, 0], scale = 1 }) {
  const woodMaterial = new THREE.MeshStandardMaterial({
    color: new Color("#5a4a3a"),
    roughness: 0.8,
    metalness: 0.1,
  });

  const roofMaterial = new THREE.MeshStandardMaterial({
    color: new Color("#8b4513"),
    roughness: 0.6,
    metalness: 0.2,
  });

  const glassMaterial = new THREE.MeshStandardMaterial({
    color: new Color("#87ceeb"),
    roughness: 0.1,
    metalness: 0.5,
    transparent: true,
    opacity: 0.2,
    side: THREE.DoubleSide,
  });

  const interiorWoodMaterial = new THREE.MeshStandardMaterial({
    color: new Color("#4a3a2a"),
    roughness: 0.9,
    metalness: 0,
  });

  const metalMaterial = new THREE.MeshStandardMaterial({
    color: new Color("#666666"),
    roughness: 0.4,
    metalness: 0.8,
  });

  const fabricMaterial = new THREE.MeshStandardMaterial({
    color: new Color("#8b0000"),
    roughness: 0.9,
    metalness: 0,
  });
  const soilMaterial = new THREE.MeshStandardMaterial({
    color: new Color("#3d2817"),
    roughness: 1,
    metalness: 0,
  });
  const flowerBoxRef = useRef();
  const flowersRef = useRef([]);

  // Animation cho hoa đung đưa
  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();

    flowersRef.current.forEach((flower, index) => {
      if (flower) {
        const offset = index * 0.5; // Mỗi bông lệchpha
        flower.rotation.z = Math.sin(time * 1.5 + offset) * 0.3;
        flower.rotation.x = Math.cos(time * 1.2 + offset) * 0.25;
      }
    });
  });
  const flowerColors = [
    new Color("#ff1744"), // Đỏ
    new Color("#ffeb3b"), // Vàng
    new Color("#e91e63"), // Hồng
    new Color("#9c27b0"), // Tím
    new Color("#ff9800"), // Cam
  ];
  return (
    <group position={position} rotation={rotation} scale={scale}>
      {/* Chân trụ chính - 4 cột gỗ */}
      <mesh position={[-0.15, 0.5, -0.15]} material={woodMaterial} castShadow>
        <boxGeometry args={[0.08, 1, 0.01]} />
      </mesh>
      <mesh position={[0.15, 0.5, -0.15]} material={woodMaterial} castShadow>
        <boxGeometry args={[0.08, 1, 0.01]} />
      </mesh>
      <mesh position={[-0.15, 0.5, 0.15]} material={woodMaterial} castShadow>
        <boxGeometry args={[0.08, 1, 0.01]} />
      </mesh>
      <mesh position={[0.15, 0.5, 0.15]} material={woodMaterial} castShadow>
        <boxGeometry args={[0.08, 1, 0.01]} />
      </mesh>

      {/* Sàn quan sát */}
      <mesh position={[0, 1, 0]} material={woodMaterial} castShadow receiveShadow>
        <boxGeometry args={[0.5, 0.05, 0.5]} />
      </mesh>

      {/* dãy hoa */}
      <group ref={flowerBoxRef} position={[0.3, 1.06, -0.12]} rotation={[0, - Math.PI / 2, 0]}>
        {/* Đáy khay */}
        <mesh position={[0, 0, 0]} material={woodMaterial} castShadow receiveShadow>
          <boxGeometry args={[0.15, 0.02, 0.08]} />
        </mesh>

        {/* Thành khay - 4 mặt */}
        <mesh position={[0, 0.025, 0.04]} material={woodMaterial} castShadow>
          <boxGeometry args={[0.15, 0.05, 0.01]} />
        </mesh>
        <mesh position={[0, 0.025, -0.04]} material={woodMaterial} castShadow>
          <boxGeometry args={[0.15, 0.05, 0.01]} />
        </mesh>
        <mesh position={[0.075, 0.025, 0]} material={woodMaterial} castShadow>
          <boxGeometry args={[0.01, 0.05, 0.08]} />
        </mesh>
        <mesh position={[-0.075, 0.025, 0]} material={woodMaterial} castShadow>
          <boxGeometry args={[0.01, 0.05, 0.08]} />
        </mesh>

        {/* Đất trong khay */}
        <mesh position={[0, 0.015, 0]} material={soilMaterial} receiveShadow>
          <boxGeometry args={[0.13, 0.025, 0.06]} />
        </mesh>

        {/* Hoa - 5 bông */}
        {[-0.05, -0.025, 0, 0.025, 0.05].map((xPos, index) => (
          <group
            key={index}
            position={[xPos, 0.03, (index % 2 === 0) ? 0.01 : -0.01]}
            ref={(el) => (flowersRef.current[index] = el)}
          >
            {/* Thân cây */}
            <mesh material={new THREE.MeshStandardMaterial({
              color: new Color("#2d5016"),
              roughness: 0.8,
            })}>
              <cylinderGeometry args={[0.002, 0.002, 0.04, 6]} />
            </mesh>

            {/* Lá */}
            <mesh
              position={[0.005, 0.01, 0]}
              rotation={[0, 0, Math.PI / 4]}
              material={new THREE.MeshStandardMaterial({
                color: new Color("#4caf50"),
                roughness: 0.7,
              })}
            >
              <boxGeometry args={[0.01, 0.003, 0.005]} />
            </mesh>
            <mesh
              position={[-0.005, 0.01, 0]}
              rotation={[0, 0, -Math.PI / 4]}
              material={new THREE.MeshStandardMaterial({
                color: new Color("#4caf50"),
                roughness: 0.7,
              })}
            >
              <boxGeometry args={[0.01, 0.003, 0.005]} />
            </mesh>

            {/* Cánh hoa - 5 cánh */}
            {[0, 1, 2, 3, 4].map((petalIndex) => {
              const angle = (petalIndex * Math.PI * 2) / 5;
              return (
                <mesh
                  key={petalIndex}
                  position={[
                    Math.cos(angle) * 0.006,
                    0.025,
                    Math.sin(angle) * 0.006,
                  ]}
                  rotation={[Math.PI / 3, angle, 0]}
                  material={new THREE.MeshStandardMaterial({
                    color: flowerColors[index % flowerColors.length],
                    roughness: 0.5,
                    side: THREE.DoubleSide,
                  })}
                >
                  <circleGeometry args={[0.006, 8]} />
                </mesh>
              );
            })}

            {/* Nhụy hoa */}
            <mesh
              position={[0, 0.025, 0]}
              material={new THREE.MeshStandardMaterial({
                color: new Color("#ffeb3b"),
                emissive: new Color("#ffeb3b"),
                emissiveIntensity: 0.3,
              })}
            >
              <sphereGeometry args={[0.003, 8, 8]} />
            </mesh>
          </group>
        ))}
      </group>

      {/* Tường cabin quan sát - CHỈ GIỮ LẠI KHUNG, KHÔNG CÓ TƯỜNG ĐẶC */}
      {/* Khung tường dưới */}
      <mesh position={[0, 1.05, 0.23]} material={woodMaterial} castShadow>
        <boxGeometry args={[0.45, 0.03, 0.03]} />
      </mesh>
      <mesh position={[0, 1.05, -0.23]} material={woodMaterial} castShadow>
        <boxGeometry args={[0.45, 0.03, 0.03]} />
      </mesh>
      <mesh position={[0.23, 1.05, 0]} material={woodMaterial} castShadow>
        <boxGeometry args={[0.03, 0.03, 0.45]} />
      </mesh>
      <mesh position={[-0.23, 1.05, 0]} material={woodMaterial} castShadow>
        <boxGeometry args={[0.03, 0.03, 0.45]} />
      </mesh>

      {/* Khung tường trên */}
      <mesh position={[0, 1.4, 0.23]} material={woodMaterial} castShadow>
        <boxGeometry args={[0.45, 0.03, 0.03]} />
      </mesh>
      <mesh position={[0, 1.4, -0.23]} material={woodMaterial} castShadow>
        <boxGeometry args={[0.45, 0.03, 0.03]} />
      </mesh>
      <mesh position={[0.23, 1.4, 0]} material={woodMaterial} castShadow>
        <boxGeometry args={[0.03, 0.03, 0.45]} />
      </mesh>
      <mesh position={[-0.23, 1.4, 0]} material={woodMaterial} castShadow>
        <boxGeometry args={[0.03, 0.03, 0.45]} />
      </mesh>

      {/* Cột đứng 4 góc */}
      <mesh position={[0.23, 1.2, 0.23]} material={woodMaterial} castShadow>
        <boxGeometry args={[0.03, 0.35, 0.03]} />
      </mesh>
      <mesh position={[-0.23, 1.2, 0.23]} material={woodMaterial} castShadow>
        <boxGeometry args={[0.03, 0.35, 0.03]} />
      </mesh>
      <mesh position={[0.23, 1.2, -0.23]} material={woodMaterial} castShadow>
        <boxGeometry args={[0.03, 0.35, 0.03]} />
      </mesh>
      <mesh position={[-0.23, 1.2, -0.23]} material={woodMaterial} castShadow>
        <boxGeometry args={[0.03, 0.35, 0.03]} />
      </mesh>

      {/* Cửa sổ - 4 mặt */}
      <mesh position={[0, 1.2, 0.23]} material={glassMaterial}>
        <boxGeometry args={[0.5, 0.3, 0.01]} />
      </mesh>
      <mesh position={[0, 1.2, -0.23]} material={glassMaterial}>
        <boxGeometry args={[0.5, 0.3, 0.01]} />
      </mesh>
      {/* <mesh position={[0.23, 1.2, 0]} material={glassMaterial}>
        <boxGeometry args={[0.01, 0.3, 0.5]} />
      </mesh> */}
      <mesh position={[-0.23, 1.2, 0]} material={glassMaterial}>
        <boxGeometry args={[0.01, 0.3, 0.5]} />
      </mesh>

      {/* ========== NỘI THẤT BÊN TRONG ========== */}

      {/* Sàn gỗ bên trong */}
      <mesh position={[0, 1.02, 0]} material={interiorWoodMaterial} receiveShadow>
        <boxGeometry args={[0.4, 0.02, 0.4]} />
      </mesh>

      {/* Bàn làm việc nhỏ */}
      <mesh position={[0.1, 1.1, 0]} material={interiorWoodMaterial}>
        <boxGeometry args={[0.15, 0.02, 0.1]} />
      </mesh>
      <mesh position={[0.05, 1.06, 0]} material={interiorWoodMaterial}>
        <boxGeometry args={[0.02, 0.08, 0.02]} />
      </mesh>
      <mesh position={[0.15, 1.06, 0]} material={interiorWoodMaterial}>
        <boxGeometry args={[0.02, 0.08, 0.02]} />
      </mesh>

      {/* Ghế gỗ */}
      <mesh position={[0.1, 1.08, 0.08]} material={interiorWoodMaterial}>
        <boxGeometry args={[0.06, 0.02, 0.06]} />
      </mesh>
      <mesh position={[0.1, 1.12, 0.05]} material={interiorWoodMaterial}>
        <boxGeometry args={[0.06, 0.08, 0.02]} />
      </mesh>

      {/* Ống nhòm trên bàn */}
      <mesh position={[0.08, 1.12, -0.02]} rotation={[0, Math.PI / 4, 0]} material={metalMaterial}>
        <cylinderGeometry args={[0.008, 0.008, 0.04, 8]} />
      </mesh>
      <mesh position={[0.12, 1.12, -0.02]} rotation={[0, Math.PI / 4, 0]} material={metalMaterial}>
        <cylinderGeometry args={[0.008, 0.008, 0.04, 8]} />
      </mesh>

      {/* Bản đồ trên tường */}
      <mesh position={[0, 1.25, -0.22]} material={fabricMaterial}>
        <boxGeometry args={[0.12, 0.15, 0.01]} />
      </mesh>

      {/* Kệ sách nhỏ */}
      <mesh position={[-0.15, 1.15, -0.2]} material={interiorWoodMaterial}>
        <boxGeometry args={[0.08, 0.15, 0.04]} />
      </mesh>

      {/* Sách trên kệ */}
      <mesh position={[-0.15, 1.18, -0.19]} material={fabricMaterial}>
        <boxGeometry args={[0.06, 0.08, 0.015]} />
      </mesh>
      <mesh position={[-0.15, 1.12, -0.19]} material={interiorWoodMaterial}>
        <boxGeometry args={[0.05, 0.06, 0.015]} />
      </mesh>

      {/* Đèn lồng treo trần */}
      <mesh position={[0, 1.38, 0]} material={metalMaterial}>
        <cylinderGeometry args={[0.02, 0.03, 0.05, 6]} />
      </mesh>
      <mesh position={[0, 1.36, 0]} material={new THREE.MeshStandardMaterial({
        color: new Color("#ffff88"),
        emissive: new Color("#ffff88"),
        emissiveIntensity: 0.5,
        transparent: true,
        opacity: 0.7,
      })}>
        <sphereGeometry args={[0.02, 8, 8]} />
      </mesh>

      {/* Radio/Walkie-talkie trên bàn */}
      <mesh position={[0.15, 1.115, 0.03]} material={metalMaterial}>
        <boxGeometry args={[0.02, 0.03, 0.015]} />
      </mesh>
      <mesh position={[0.15, 1.13, 0.03]} material={metalMaterial}>
        <cylinderGeometry args={[0.003, 0.003, 0.015, 6]} />
      </mesh>

      {/* Mái nhọn */}
      <mesh position={[0, 1.5, 0]} rotation={[0, Math.PI / 4, 0]} material={roofMaterial} castShadow>
        <coneGeometry args={[0.35, 0.3, 4]} />
      </mesh>

      {/* Lan can xung quanh sàn */}
      <mesh position={[0, 1.05, 0.28]} material={woodMaterial}>
        <boxGeometry args={[0.5, 0.03, 0.03]} />
      </mesh>
      <mesh position={[0, 1.05, -0.28]} material={woodMaterial}>
        <boxGeometry args={[0.5, 0.03, 0.03]} />
      </mesh>
      <mesh position={[0.28, 1.05, 0]} material={woodMaterial}>
        <boxGeometry args={[0.03, 0.03, 0.5]} />
      </mesh>
      <mesh position={[-0.28, 1.05, 0]} material={woodMaterial}>
        <boxGeometry args={[0.03, 0.03, 0.5]} />
      </mesh>

      {/* Thang leo */}
      <mesh position={[0.25, 0.5, 0]} material={woodMaterial}>
        <boxGeometry args={[0.03, 1, 0.03]} />
      </mesh>
      <mesh position={[0.35, 0.5, 0]} material={woodMaterial}>
        <boxGeometry args={[0.03, 1, 0.03]} />
      </mesh>
      {[0.2, 0.4, 0.6, 0.8].map((y, i) => (
        <mesh key={i} position={[0.3, y, 0]} material={woodMaterial}>
          <boxGeometry args={[0.12, 0.02, 0.02]} />
        </mesh>
      ))}
    </group>
  );
}

function LandscapeTile({ position, rotation, nodes, materials, lightsMaterial, waterMaterial }) {


  return (
    <group position={position} rotation={rotation}>
      <mesh
        geometry={nodes.landscape_gltf.geometry}
        material={materials["Material.009"]}
        castShadow
        receiveShadow
      />
      <mesh
        geometry={nodes.landscape_borders.geometry}
        material={materials["Material.010"]}
      />
      <mesh
        geometry={nodes.trees_light.geometry}
        material={materials["Material.008"]}
        castShadow
        receiveShadow
      />

      {/* Ao nước */}
      <mesh
        position={[-2.536, 1.272, 0.79]}
        rotation={[-Math.PI * 0.5, 0, 0]}
        scale={[1.285, 1.285, 1]}
      >
        <planeGeometry args={[1, 1]} />
        {waterMaterial}
      </mesh>
      <mesh
        position={[1.729, 0.943, 2.709]}
        rotation={[-Math.PI * 0.5, 0, 0]}
        scale={[3, 3, 1]}
      >
        <planeGeometry args={[1, 1]} />
        {waterMaterial}
      </mesh>
      <mesh
        position={[0.415, 1.588, -2.275]}
        rotation={[-Math.PI * 0.5, 0, 0]}
        scale={[3.105, 2.405, 1]}
      >
        <planeGeometry args={[1, 1]} />
        {waterMaterial}
      </mesh>

      <mesh
        geometry={nodes.lights.geometry}
        material={lightsMaterial}
        castShadow
      />
      {/* TRẠM QUAN SÁT */}
      {/* Trạm 1 - Góc tây bắc */}
      <ObservationTower
        position={[-3, 1.2, -3]}
        rotation={[0, Math.PI / 6, 0]}
        scale={0.8}
      />

      {/* Trạm 2 - Góc đông bắc */}
      <ObservationTower
        position={[3.5, 1.5, -2.5]}
        rotation={[0, -Math.PI / 4, 0]}
        scale={1}
      />

      {/* Trạm 3 - Góc nam */}
      <ObservationTower
        position={[0, 0.8, 4]}
        rotation={[0, Math.PI / 3, 0]}
        scale={0.9}
      />

      {/* Trạm 4 - Trung tâm */}
      <ObservationTower
        position={[-1, 1.3, 1]}
        rotation={[0, -Math.PI / 8, 0]}
        scale={1.1}
      />
      <Targets />
    </group>
  );
}

export function Landscape(props) {
  const { nodes, materials } = useGLTF("./assets/models/scene.glb");

  const material = new MeshStandardMaterial({
    envMapIntensity: 0,
    color: new Color("#ea6619"),
    roughness: 0,
    metalness: 0,
    emissive: new Color("#f6390f").multiplyScalar(1),
    opacity: 1,
  });
  material.visible = false;

  const [lightsMaterial, waterMaterial] = useMemo(() => {
    return [
      material,
      <MeshReflectorMaterial
        transparent={true}
        opacity={0.6}
        color={"#23281b"}
        roughness={0}
        blur={[10, 10]}
        mixBlur={1}
        mixStrength={20}
        mixContrast={1.2}
        resolution={512}
        mirror={0}
        depthScale={0}
        minDepthThreshold={0}
        maxDepthThreshold={0.1}
        depthToBlurRatioBias={0.0025}
        debug={0}
        reflectorOffset={0.0}
      />,
    ];
  }, []);

  useEffect(() => {
    const landscapeMat = materials["Material.009"];
    landscapeMat.envMapIntensity = 0.75;

    const treesMat = materials["Material.008"];
    treesMat.color = new Color("#2f2f13");
    treesMat.envMapIntensity = 0.3;
    treesMat.roughness = 1;
    treesMat.metalness = 0;
  }, [materials]);

  // const { tiles, towers } = useMemo(() => {
  //     const tilesData = [];
  //     const towersData = [];

  //     const gridSize = 2; // 3x3
  //     // !!! QUAN TRỌNG: Cần chỉnh số này khớp với kích thước thật của model landscape.
  //     // Dựa vào toạ độ nước (khoảng 2-3 unit) và cây cối, tôi ước lượng model rộng khoảng 10 unit.
  //     // Nếu bị chồng lấn hoặc hở, hãy chỉnh số này (ví dụ: 8 hoặc 12).
  //     const tileSize = 12; 

  //     const offset = (gridSize - 1) * tileSize / 2;

  //     let idCounter = 0;

  //     for (let i = 0; i < gridSize; i++) {

  //         const x = i * tileSize - offset;
  //         const z = j * tileSize - offset;

  //         // 1. Setup cho ô đất
  //         // Xoay ngẫu nhiên 0, 90, 180, 270 độ để các ô trông khác nhau nhưng vẫn khớp cạnh vuông
  //         const randomRotationY = Math.floor(Math.random() * 4) * (Math.PI / 2);

  //         tilesData.push({
  //           id: `tile-${idCounter}`,
  //           position: [x, 0, z],
  //           rotation: [0, randomRotationY, 0]
  //         });

  //         // 2. Setup cho tháp quan sát (Ngẫu nhiên có hoặc không)
  //         // 50% cơ hội xuất hiện tháp trên mỗi ô đất
  //         if (Math.random() > 0.3) { 
  //           // Tạo vị trí ngẫu nhiên TRONG PHẠM VI ô đất đó
  //           const towerOffsetX = (Math.random() - 0.5) * (tileSize * 0.6); // Random trong khoảng 60% diện tích tile
  //           const towerOffsetZ = (Math.random() - 0.5) * (tileSize * 0.6);
  //           const towerRotY = Math.random() * Math.PI * 2;

  //           towersData.push({
  //             id: `tower-${idCounter}`,
  //             position: [x + towerOffsetX, 1.2, z + towerOffsetZ], // y=1.2 để chỉnh độ cao chân tháp
  //             rotation: [0, towerRotY, 0],
  //             scale: 0.8 + Math.random() * 0.4 // Scale ngẫu nhiên
  //           });
  //         }
  //         idCounter++;

  //     }
  //     return { tiles: tilesData, towers: towersData };
  //   }, []);


  return (
    <group {...props} dispose={null}>

      <LandscapeTile key={'1'}
        position={[0, 0, 0]}

        nodes={nodes}
        materials={materials}
        lightsMaterial={lightsMaterial}
        waterMaterial={waterMaterial} />

      <LandscapeTile key={'2'}
        position={[0, 0, -10]}
        rotation={[0, 0, 0]}
        nodes={nodes}
        materials={materials}
        lightsMaterial={lightsMaterial}
        waterMaterial={waterMaterial} />

      {/* <LandscapeTile key={'2'}
        position={[0, 0, -20]}
        rotation={[0, 0, 0]}
        nodes={nodes}
        materials={materials}
        lightsMaterial={lightsMaterial}
        waterMaterial={waterMaterial} /> */}


    </group>
  );
}

useGLTF.preload("./assets/models/scene.glb");