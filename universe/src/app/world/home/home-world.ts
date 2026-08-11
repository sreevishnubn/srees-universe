import * as THREE from 'three';

export class HomeWorld {
  readonly group = new THREE.Group();

  private readonly planet: THREE.Mesh;
  private readonly atmosphere: THREE.Mesh;
  private readonly rings: THREE.Mesh[] = [];
  private readonly locations: THREE.Group[] = [];

  private opacity = 0;

  constructor() {
    this.group.position.set(0, -1.5, -18);
    this.group.scale.setScalar(0.001);

    this.planet = new THREE.Mesh(
      new THREE.SphereGeometry(4.2, 64, 64),
      new THREE.MeshStandardMaterial({
        color: 0x162033,
        roughness: 0.72,
        metalness: 0.12,
        transparent: true,
        opacity: 0,
      }),
    );

    this.atmosphere = new THREE.Mesh(
      new THREE.SphereGeometry(4.55, 64, 64),
      new THREE.MeshBasicMaterial({
        color: 0x6ea8ff,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    );

    this.group.add(this.planet, this.atmosphere);
    this.createRings();
    this.createLocations();
  }

  update(): void {
    this.group.rotation.y += 0.0007;

    this.rings.forEach((ring, index) => {
      ring.rotation.z += 0.0012 + index * 0.00035;
    });

    this.locations.forEach((location, index) => {
      const angle = performance.now() * 0.00008 + index;
      location.position.y += Math.sin(angle) * 0.00025;
      location.rotation.y += 0.001;
    });
  }

  setOpacity(opacity: number): void {
    this.opacity = THREE.MathUtils.clamp(opacity, 0, 1);

    const planetMaterial = this.planet.material;
    const atmosphereMaterial = this.atmosphere.material;

    if (!Array.isArray(planetMaterial)) {
      planetMaterial.opacity = this.opacity;
    }

    if (!Array.isArray(atmosphereMaterial)) {
      atmosphereMaterial.opacity = this.opacity * 0.18;
    }

    this.rings.forEach((ring) => {
      const material = ring.material;
      if (!Array.isArray(material)) {
        material.opacity = this.opacity * 0.22;
      }
    });

    this.locations.forEach((location) => {
      location.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          const material = object.material;
          if (!Array.isArray(material)) {
            material.opacity = this.opacity * 0.9;
          }
        }
      });
    });
  }

  dispose(): void {
    this.group.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) return;

      object.geometry.dispose();

      const material = object.material;
      if (Array.isArray(material)) {
        material.forEach((item) => item.dispose());
      } else {
        material.dispose();
      }
    });
  }

  private createRings(): void {
    const ringConfigs = [
      { radius: 6.2, tube: 0.018, rotation: 0.55 },
      { radius: 7.1, tube: 0.012, rotation: -0.42 },
    ];

    ringConfigs.forEach((config) => {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(
          config.radius,
          config.tube,
          8,
          160,
        ),
        new THREE.MeshBasicMaterial({
          color: 0x8db8ff,
          transparent: true,
          opacity: 0,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        }),
      );

      ring.rotation.x = Math.PI / 2 + config.rotation;
      this.rings.push(ring);
      this.group.add(ring);
    });
  }

  private createLocations(): void {
    const colors = [
      0xffb347,
      0x6ea8ff,
      0xb48cff,
      0x67e8c7,
      0xff7892,
      0xffffff,
    ];

    const radius = 7.8;

    for (let i = 0; i < 6; i += 1) {
      const location = new THREE.Group();
      const angle = (i / 6) * Math.PI * 2;

      location.position.set(
        Math.cos(angle) * radius,
        Math.sin(angle * 1.7) * 0.8,
        Math.sin(angle) * radius,
      );

      const platform = new THREE.Mesh(
        new THREE.CylinderGeometry(0.72, 0.9, 0.16, 20),
        new THREE.MeshStandardMaterial({
          color: 0x1b2538,
          roughness: 0.55,
          metalness: 0.35,
          transparent: true,
          opacity: 0,
        }),
      );

      const tower = new THREE.Mesh(
        new THREE.BoxGeometry(0.38, 1.25, 0.38),
        new THREE.MeshStandardMaterial({
          color: colors[i],
          emissive: colors[i],
          emissiveIntensity: 1.2,
          transparent: true,
          opacity: 0,
        }),
      );

      const beacon = new THREE.Mesh(
        new THREE.SphereGeometry(0.11, 16, 16),
        new THREE.MeshBasicMaterial({
          color: colors[i],
          transparent: true,
          opacity: 0,
        }),
      );

      beacon.position.y = 0.75;
      location.add(platform, tower, beacon);
      this.locations.push(location);
      this.group.add(location);
    }
  }
}
