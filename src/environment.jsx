import * as THREE from "three";
import { useMemo } from "react";

export function myEnvironment() {

    // Sky Dome (bán cầu trời)
    const skyMaterial = useMemo(
        () =>
            new THREE.MeshBasicMaterial({
                color: "#87CEEB", // xanh trời
                side: THREE.BackSide,
            }),
        []
    );

    // Ground (mặt đất)
    const groundMaterial = useMemo(
        () =>
            new THREE.MeshStandardMaterial({
                color: "#6B8E23", // xanh olive giống rừng
                roughness: 1,
                metalness: 0,
            }),
        []
    );

    return (
        <group>

            {/* Sky Dome */}
            <mesh>
                <sphereGeometry args={[500, 32, 32]} />
                <primitive object={skyMaterial} attach="material" />
            </mesh>

            {/* Ground */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -5, 0]}>
                <planeGeometry args={[2000, 2000]} />
                <primitive object={groundMaterial} attach="material" />
            </mesh>

        </group>
    );
}
