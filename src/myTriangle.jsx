import * as THREE from "three";
import { useMemo } from "react";

function TriangleGeometry({ p1, p2, p3 }) {
    const geometry = useMemo(() => {
        const geom = new THREE.BufferGeometry();
        const vertices = new Float32Array([
            p1[0], p1[1], p1[2],
            p2[0], p2[1], p2[2],
            p3[0], p3[1], p3[2],
        ]);
        geom.setAttribute("position", new THREE.BufferAttribute(vertices, 3));
        geom.computeVertexNormals();
        return geom;
    }, []);

    return <primitive object={geometry} />;
}

export default TriangleGeometry;
