import * as THREE from 'three';

export class UniverseRenderer {
  private readonly renderer: THREE.WebGLRenderer;

  constructor(canvas: HTMLCanvasElement) {
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance',
    });

    this.renderer.setPixelRatio(
      Math.min(window.devicePixelRatio, 2),
    );

    this.renderer.setSize(
      window.innerWidth,
      window.innerHeight,
      false,
    );

    this.renderer.outputColorSpace =
      THREE.SRGBColorSpace;
  }

  resize(): void {
    this.renderer.setSize(
      window.innerWidth,
      window.innerHeight,
      false,
    );
  }

  render(
    scene: THREE.Scene,
    camera: THREE.Camera,
  ): void {
    this.renderer.render(scene, camera);
  }

  dispose(): void {
    this.renderer.dispose();
  }
}