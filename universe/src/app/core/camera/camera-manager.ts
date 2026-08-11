import * as THREE from 'three';

export class CameraManager {
  readonly camera: THREE.PerspectiveCamera;

  constructor() {
    this.camera = new THREE.PerspectiveCamera(
      55,
      window.innerWidth / window.innerHeight,
      0.1,
      2000,
    );

    this.camera.position.set(0, 2, 28);
    this.camera.lookAt(0, 0, 0);
  }

  resize(): void {
    this.camera.aspect =
      window.innerWidth / window.innerHeight;

    this.camera.updateProjectionMatrix();
  }
}