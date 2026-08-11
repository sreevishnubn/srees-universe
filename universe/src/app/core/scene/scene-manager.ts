import * as THREE from 'three';

export class SceneManager {
  readonly scene = new THREE.Scene();

  constructor() {
    this.scene.background = new THREE.Color(
      0x020306,
    );
  }

  add(object: THREE.Object3D): void {
    this.scene.add(object);
  }

  remove(object: THREE.Object3D): void {
    this.scene.remove(object);
  }
}