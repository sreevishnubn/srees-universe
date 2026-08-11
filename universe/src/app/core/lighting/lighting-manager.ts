import * as THREE from 'three';

export class LightingManager {
  setup(scene: THREE.Scene): void {
    const ambient = new THREE.AmbientLight(
      0xffffff,
      0.15,
    );

    scene.add(ambient);
  }
}