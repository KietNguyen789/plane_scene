

function easeOutQuad(x) {
  return 1 - (1 - x) * (1 - x);
}
// controls = new THREE.OrbitControls(camera, window);
// camera.position.set(0, 20, 100);
// controls.update();
// export function animate() {
//   // required if controls.enableDamping or controls.autoRotate are set to true
//   controls.update();
//   renderer.render(scene, camera);
// }
export let controls = {};


// Keyboard events (unchanged)
window.addEventListener("keydown", (e) => {
  controls[e.key.toLowerCase()] = true;
});
window.addEventListener("keyup", (e) => {
  controls[e.key.toLowerCase()] = false;
});

// New: Mouse drag for rotation
// let isDragging = false;
// let previousMouseX = 0;
// let previousMouseY = 0;
// const mouseSensitivity = 0.002;  // Adjust this value for more/less rotation per pixel (smaller = slower)

// window.addEventListener('mousedown', (e) => {
//   isDragging = true;
//   previousMouseX = e.clientX;
//   previousMouseY = e.clientY;
// });

// window.addEventListener('mouseup', () => {
//   isDragging = false;
// });

// window.addEventListener('mousemove', (e) => {
//   if (!isDragging) return;

//   const deltaX = e.clientX - previousMouseX;
//   const deltaY = e.clientY - previousMouseY;
//   previousMouseX = e.clientX;
//   previousMouseY = e.clientY;


//   const yaw = -deltaX * mouseSensitivity;  
//   const pitch = -deltaY * mouseSensitivity; 


//   x.applyAxisAngle(z, yaw);
//   y.applyAxisAngle(z, yaw);

//   // Apply pitch (rotation around x)
//   y.applyAxisAngle(x, pitch);
//   z.applyAxisAngle(x, pitch);

//   // Normalize axes (essential after rotations)
//   x.normalize();
//   y.normalize();
//   z.normalize();
// });

let maxVelocity = 0.04;
let jawVelocity = 0;
let pitchVelocity = 0;
let planeSpeed = 0.006;
export let turbo = 0;

export function updatePlaneAxis(x, y, z, planePosition, camera) {
  jawVelocity *= 0.95;
  pitchVelocity *= 0.95;

  if (Math.abs(jawVelocity) > maxVelocity)
    jawVelocity = Math.sign(jawVelocity) * maxVelocity;

  if (Math.abs(pitchVelocity) > maxVelocity)
    pitchVelocity = Math.sign(pitchVelocity) * maxVelocity;

  if (controls["a"]) {
    jawVelocity += 0.0025;
  }

  if (controls["d"]) {
    jawVelocity -= 0.0025;
  }

  if (controls["w"]) {
    pitchVelocity -= 0.0025;
  }

  if (controls["s"]) {
    pitchVelocity += 0.0025;
  }

  if (controls["r"]) {
    jawVelocity = 0;
    pitchVelocity = 0;
    turbo = 0;
    x.set(1, 0, 0);
    y.set(0, 1, 0);
    z.set(0, 0, 1);
    planePosition.set(0, 3, 7);
  }

  x.applyAxisAngle(z, jawVelocity);
  y.applyAxisAngle(z, jawVelocity);

  y.applyAxisAngle(x, pitchVelocity);
  z.applyAxisAngle(x, pitchVelocity);

  x.normalize();
  y.normalize();
  z.normalize();

  // Plane position & velocity (unchanged)
  if (controls.shift) {
    turbo += 0.025;
  } else {
    turbo *= 0.95;
  }
  turbo = Math.min(Math.max(turbo, 0), 1);

  let turboSpeed = easeOutQuad(turbo) * 0.02;

  camera.fov = 45 + turboSpeed * 900;
  camera.updateProjectionMatrix();

  planePosition.add(z.clone().multiplyScalar(-planeSpeed - turboSpeed));
}