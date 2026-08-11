import * as THREE from 'three';

export class Galaxy {
  readonly group = new THREE.Group();

  private readonly galaxyStars: THREE.Points;
  private readonly backgroundStars: THREE.Points;
  private readonly core: THREE.Mesh;

  constructor() {
    /*
     * Keep the galaxy mostly facing the camera.
     * A tiny tilt gives it depth without creating
     * the previous flat horizontal-band effect.
     */
    this.group.rotation.x = 0.12;

    this.galaxyStars = this.createGalaxyStars();
    this.backgroundStars = this.createBackgroundStars();
    this.core = this.createCore();

    this.group.add(
      this.backgroundStars,
      this.galaxyStars,
      this.core,
    );
  }

  update(): void {
    /*
     * Slow rotation for life during the loading phase.
     */
    this.group.rotation.z += 0.00035;

    /*
     * Subtle independent motion prevents the
     * galaxy from feeling like one rigid object.
     */
    this.galaxyStars.rotation.z += 0.00008;
  }

  setOpacity(opacity: number): void {
    this.group.traverse((object) => {
      if (
        object instanceof THREE.Points ||
        object instanceof THREE.Mesh
      ) {
        const material = object.material;

        if (Array.isArray(material)) {
          material.forEach((item) => {
            item.transparent = true;
            item.opacity = opacity;
          });
        } else {
          material.transparent = true;
          material.opacity = opacity;
        }
      }
    });
  }

  dispose(): void {
    this.disposePoints(this.galaxyStars);
    this.disposePoints(this.backgroundStars);

    this.core.geometry.dispose();

    const material = this.core.material;

    if (Array.isArray(material)) {
      material.forEach((item) => item.dispose());
    } else {
      material.dispose();
    }
  }

  private createGalaxyStars(): THREE.Points {
    const count = 9000;
    const arms = 4;
    const radius = 15;

    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    const innerColor = new THREE.Color(0xffc36b);
    const outerColor = new THREE.Color(0xc9d8ff);

    for (let i = 0; i < count; i += 1) {
      const index = i * 3;

      /*
       * Concentrate more stars near the galactic core.
       */
      const distance =
        Math.pow(Math.random(), 1.55) * radius;

      /*
       * Determine which spiral arm this star belongs to.
       */
      const arm = i % arms;

      const armAngle =
        (arm / arms) * Math.PI * 2;

      /*
       * Spiral curvature.
       */
      const spiral = distance * 0.5;

      /*
       * Give each arm some organic variation.
       */
      const spread =
        (Math.random() - 0.5) *
        (0.35 + distance * 0.09);

      const angle =
        armAngle +
        spiral +
        spread;

      positions[index] =
        Math.cos(angle) * distance;

      positions[index + 1] =
        Math.sin(angle) * distance;

      /*
       * Small vertical thickness gives the galaxy
       * actual depth instead of a completely flat plane.
       */
      positions[index + 2] =
        (Math.random() - 0.5) *
        (0.15 + distance * 0.035);

      /*
       * Stars near the center are warmer.
       * Outer stars become cooler/whiter.
       */
      const mix = distance / radius;

      const color = innerColor
        .clone()
        .lerp(outerColor, mix);

      colors[index] = color.r;
      colors[index + 1] = color.g;
      colors[index + 2] = color.b;
    }

    const geometry = new THREE.BufferGeometry();

    geometry.setAttribute(
      'position',
      new THREE.BufferAttribute(positions, 3),
    );

    geometry.setAttribute(
      'color',
      new THREE.BufferAttribute(colors, 3),
    );

    const material = new THREE.PointsMaterial({
      size: 0.035,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    return new THREE.Points(
      geometry,
      material,
    );
  }

  private createBackgroundStars(): THREE.Points {
    const count = 2400;

    const positions = new Float32Array(count * 3);

    for (let i = 0; i < count; i += 1) {
      const index = i * 3;

      positions[index] =
        (Math.random() - 0.5) * 90;

      positions[index + 1] =
        (Math.random() - 0.5) * 90;

      positions[index + 2] =
        (Math.random() - 0.5) * 70;
    }

    const geometry = new THREE.BufferGeometry();

    geometry.setAttribute(
      'position',
      new THREE.BufferAttribute(positions, 3),
    );

    const material = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.018,
      transparent: true,
      opacity: 0.5,
      depthWrite: false,
    });

    return new THREE.Points(
      geometry,
      material,
    );
  }

  private createCore(): THREE.Mesh {
    const geometry = new THREE.SphereGeometry(
      1,
      32,
      32,
    );

    const material = new THREE.MeshBasicMaterial({
      color: 0xffb347,
      transparent: true,
      opacity: 0.9,
    });

    return new THREE.Mesh(
      geometry,
      material,
    );
  }

  private disposePoints(points: THREE.Points): void {
    points.geometry.dispose();

    const material = points.material;

    if (Array.isArray(material)) {
      material.forEach((item) => item.dispose());
    } else {
      material.dispose();
    }
  }
}