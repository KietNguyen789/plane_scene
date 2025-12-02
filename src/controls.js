function easeOutQuad(x) {
  return 1 - (1 - x) * (1 - x);
}

export let controls = {};

window.addEventListener("keydown", (e) => {
  controls[e.key.toLowerCase()] = true;
});
window.addEventListener("keyup", (e) => {
  controls[e.key.toLowerCase()] = false;
});


let maxVelocity = 0.04;
let jawVelocity = 0;
let pitchVelocity = 0;
let planeSpeed = 0.00001;
export let turbo = 0;

export function updatePlaneAxis(x, y, z, planePosition, camera, corners) {
  jawVelocity *= 0.95;
  pitchVelocity *= 0.95;

  if (Math.abs(jawVelocity) > maxVelocity)
    jawVelocity = Math.sign(jawVelocity) * maxVelocity;

  if (Math.abs(pitchVelocity) > maxVelocity)
    pitchVelocity = Math.sign(pitchVelocity) * maxVelocity;

  if (controls["a"]) {
    jawVelocity += 0.0025;
    //planePosition.ro
  }

  if (controls["d"]) {
    jawVelocity -= 0.0025;
  }

  // if (controls["w"]) {
  //   pitchVelocity -= 0.09;
  // }

  if (controls["s"]) {
    // pitchVelocity += 0.0025;
    planePosition.add(z.clone().multiplyScalar(0.02)); // lùi lại
  }

  if (controls["w"]) {
    // pitchVelocity += 0.0025;
    planePosition.add(z.clone().multiplyScalar(-0.02)); // lùi lại
  }

  if (controls["r"]) {

    planePosition.y -= 0.1 * 0.1;
  }//aaaaaaaaaaaaaaaaaa

  if (controls["t"]) {

    planePosition.y += 0.1 * 0.1;
  }

  if (corners) {
    const target = corners;  // điểm max bạn lưu

    const dist = planePosition.z - corners.z;

    if (dist < 0.9) { // khoảng cách trigger reset
      // === RESET GIỐNG PHÍM R ===

      jawVelocity = 0;
      pitchVelocity = 0;
      turbo = 0;

      x.set(1, 0, 0);
      y.set(0, 1, 0);
      z.set(0, 0, 1);

      planePosition.set(0, 3, 7);

    }

  }

  x.applyAxisAngle(y, jawVelocity);
  z.applyAxisAngle(y, jawVelocity);

  y.applyAxisAngle(z, pitchVelocity);
  x.applyAxisAngle(z, pitchVelocity);

  x.normalize();
  y.normalize();
  z.normalize();

  // Plane position & velocity (unchanged)
  if (controls.shift) {
    turbo += 4;
  } else {
    turbo *= 0.95;
  }
  turbo = Math.min(Math.max(turbo, 0), 1);

  let turboSpeed = easeOutQuad(turbo) * 0.02;

  camera.fov = 45 + turboSpeed * 900;
  camera.updateProjectionMatrix();

  planePosition.add(z.clone().multiplyScalar(-planeSpeed - turboSpeed));
}