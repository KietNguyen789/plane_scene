import * as THREE from 'three';

function easeOutQuad(x) {
  return 1 - (1 - x) * (1 - x);
}

export let controls = {};

window.addEventListener("keydown", (e) => {
  controls[e.key.toLowerCase()] = true;
  if (e.key === "ArrowUp") controls["arrowup"] = true;
  if (e.key === "ArrowDown") controls["arrowdown"] = true;
});
window.addEventListener("keyup", (e) => {
  controls[e.key.toLowerCase()] = false;
  if (e.key === "ArrowUp") controls["arrowup"] = false;
  if (e.key === "ArrowDown") controls["arrowdown"] = false;
});

let maxVelocity = 0.04;
let rollVelocity = 0;
let pitchVelocity = 0;
let yawVelocity = 0;
let planeSpeed = 0.0099;
export let turbo = 0;

// [MỚI] Biến theo dõi góc roll hiện tại và giới hạn (90 độ = PI/2)
let currentRoll = 0;
const MAX_ROLL = Math.PI / 4;

export function updatePlaneAxis(x, y, z, planePosition, camera, corners) {
  // --- 1. GIẢM TỐC ĐỘ XOAY TỰ ĐỘNG (DAMPING) ---
  rollVelocity *= 0.95;
  pitchVelocity *= 0.95;
  yawVelocity *= 0.95;

  if (Math.abs(rollVelocity) > maxVelocity) rollVelocity = Math.sign(rollVelocity) * maxVelocity;
  if (Math.abs(pitchVelocity) > maxVelocity) pitchVelocity = Math.sign(pitchVelocity) * maxVelocity;
  if (Math.abs(yawVelocity) > maxVelocity) yawVelocity = Math.sign(yawVelocity) * maxVelocity;

  // --- 2. XỬ LÝ PHÍM BẤM ---
  if (controls["a"]) {

    yawVelocity += 0.001;

  }
  if (controls["q"]) {
    rollVelocity += 0.001;

  }
  if (controls["d"]) {

    yawVelocity -= 0.001;

  }
  if (controls["e"]) {

    rollVelocity -= 0.001;
  }

  if (controls["arrowdown"]) {
    pitchVelocity -= 0.0020;
  }
  if (controls["arrowup"]) {
    pitchVelocity += 0.0020;
  }

  // if (controls["w"]) {
  //   planeSpeed = 0.09;
  // } else if (controls["s"]) {
  //   planeSpeed = 0.009;
  // } else {
  //   planeSpeed = 0.01;
  // }

  if (controls["r"]) planePosition.y -= 0.001;
  if (controls["t"]) planePosition.y += 0.001;



  if (controls["b"]) {
    resetPlane(x, y, z, planePosition);
  }
  ``
  if (planePosition.z < -18) {

    resetPlane(x, y, z, planePosition);

  }

  // --- 3. ÁP DỤNG VẬT LÝ XOAY ---

  // [LOGIC MỚI] Xử lý giới hạn Roll 90 độ
  // Tính toán góc dự kiến tiếp theo
  let proposedRoll = currentRoll + rollVelocity;

  // Kẹp giá trị (Clamp) trong khoảng -90 đến 90 độ
  if (proposedRoll > MAX_ROLL) {
    proposedRoll = MAX_ROLL;
    rollVelocity = 0; // Dừng lực quay nếu chạm giới hạn
  } else if (proposedRoll < -MAX_ROLL) {
    proposedRoll = -MAX_ROLL;
    rollVelocity = 0;
  }

  // Tính toán lượng thay đổi thực tế cần áp dụng cho khung hình này
  // Thay vì cộng rollVelocity, ta chỉ cộng phần chênh lệch để đạt tới giới hạn
  let deltaRoll = proposedRoll - currentRoll;

  // Cập nhật lại góc hiện tại
  currentRoll = proposedRoll;

  const worldUp = new THREE.Vector3(0, 1, 0); // Trục đứng của thế giới

  const yawQuat = new THREE.Quaternion().setFromAxisAngle(worldUp, yawVelocity);
  const pitchQuat = new THREE.Quaternion().setFromAxisAngle(x, pitchVelocity);
  const rollQuat = new THREE.Quaternion().setFromAxisAngle(z, deltaRoll);

  // Kết hợp các Quaternion: 
  // Quan trọng: Áp dụng yawQuat (World) trước, sau đó mới đến Pitch và Roll (Local)
  const finalQuat = new THREE.Quaternion();
  finalQuat.multiply(yawQuat);   // Xoay hướng theo chân trời (Khóa trục chúi mũi)
  finalQuat.multiply(pitchQuat); // Xoay lên/xuống theo mũi máy bay
  finalQuat.multiply(rollQuat);  // Xoay nghiêng theo thân máy bay

  // Áp dụng cho các trục hệ cơ sở
  x.applyQuaternion(finalQuat);
  y.applyQuaternion(finalQuat);
  z.applyQuaternion(finalQuat);

  // --- 5. CHUẨN HÓA & KHỬ SAI SỐ (Bắt buộc để không bị méo trục) ---
  z.normalize();
  x.crossVectors(y, z).normalize(); // Ép X vuông góc với Y và Z
  y.crossVectors(z, x).normalize(); // Ép Y vuông góc với Z và X



  // --- 4. DI CHUYỂN MÁY BAY ---
  if (controls.shift) {
    turbo += 0.05;
  } else {
    turbo *= 0.95;
  }
  turbo = Math.min(Math.max(turbo, 0), 1);
  let turboSpeed = easeOutQuad(turbo) * 0.1;

  camera.fov = 45 + turboSpeed * 200;
  camera.updateProjectionMatrix();

  planePosition.add(z.clone().multiplyScalar(-(planeSpeed + turboSpeed)));
}

function resetPlane(x, y, z, planePosition) {
  rollVelocity = 0;
  pitchVelocity = 0;
  yawVelocity = 0;
  turbo = 0;

  // [MỚI] Reset góc nghiêng về 0
  currentRoll = 0;

  x.set(1, 0, 0);
  y.set(0, 1, 0);
  z.set(0, 0, 1);

  planePosition.set(0, 3, 7);
}