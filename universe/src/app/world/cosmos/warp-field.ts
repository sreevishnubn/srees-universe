import * as THREE from 'three';

export class WarpField {
  readonly points: THREE.Points;

  private readonly positions: Float32Array;
  private readonly geometry: THREE.BufferGeometry;

  private speed = 0;
  private active = false;

  constructor(count = 2200) {
    this.positions =
      new Float32Array(count * 3);

    this.geometry =
      new THREE.BufferGeometry();

    for (let i = 0; i < count; i += 1) {
      const index = i * 3;

      this.positions[index] =
        (Math.random() - 0.5) * 28;

      this.positions[index + 1] =
        (Math.random() - 0.5) * 18;

      this.positions[index + 2] =
        Math.random() * 60 - 20;
    }

    this.geometry.setAttribute(
      'position',
      new THREE.BufferAttribute(
        this.positions,
        3,
      ),
    );

    const material =
      new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.035,
        transparent: true,
        opacity: 0,
        depthWrite: false,
      });

    this.points =
      new THREE.Points(
        this.geometry,
        material,
      );
  }

  setActive(active: boolean): void {
    this.active = active;
  }

  setSpeed(speed: number): void {
    this.speed = speed;
  }

  setOpacity(opacity: number): void {
    const material =
      this.points.material as
        THREE.PointsMaterial;

    material.opacity = opacity;
  }

  update(): void {
    if (!this.active || this.speed <= 0) {
      return;
    }

    const position =
      this.geometry.attributes[
        'position'
      ] as THREE.BufferAttribute;

    for (
      let i = 0;
      i < this.positions.length;
      i += 3
    ) {
      this.positions[i + 2] +=
        this.speed;

      if (
        this.positions[i + 2] > 20
      ) {
        this.positions[i + 2] = -20;

        this.positions[i] =
          (Math.random() - 0.5) * 28;

        this.positions[i + 1] =
          (Math.random() - 0.5) * 18;
      }
    }

    position.needsUpdate = true;
  }

  dispose(): void {
    this.geometry.dispose();

    const material =
      this.points.material;

    if (Array.isArray(material)) {
      material.forEach((item) =>
        item.dispose(),
      );
    } else {
      material.dispose();
    }
  }
}