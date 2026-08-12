import * as THREE from 'three';

export class CosmicJourney {
  readonly group = new THREE.Group();

  private readonly blackHole = new THREE.Group();
  private readonly milkyWay = new THREE.Group();
  private readonly solarSystem = new THREE.Group();
  private readonly earth: THREE.Mesh;
  private elapsed = 0;

  constructor() {
    this.createBlackHole();
    this.createMilkyWay();
    this.createSolarSystem();
    this.earth = this.solarSystem.getObjectByName('earth') as THREE.Mesh;

    this.group.add(this.blackHole, this.milkyWay, this.solarSystem);
    this.setVisibility(0, 0, 0);
  }

  update(): void {
    this.elapsed += 0.016;
    this.blackHole.rotation.y += 0.002;
    this.milkyWay.rotation.z += 0.00008;

    const planets = this.solarSystem.userData['planets'] as THREE.Object3D[];
    planets.forEach((planet, index) => {
      const radius = planet.userData['radius'] as number;
      const speed = planet.userData['speed'] as number;
      const angle = this.elapsed * speed + (index * 0.8);
      planet.position.set(Math.cos(angle) * radius, 0, Math.sin(angle) * radius);
      planet.rotation.y += 0.008;
    });

    this.earth.rotation.y += 0.004;
  }

  setVisibility(blackHole: number, galaxy: number, solar: number): void {
    this.setGroupOpacity(this.blackHole, blackHole);
    this.setGroupOpacity(this.milkyWay, galaxy);
    this.setGroupOpacity(this.solarSystem, solar);
  }

  setGalaxyOpacity(opacity: number): void {
    this.setGroupOpacity(this.milkyWay, opacity);
  }

  setBlackHoleOpacity(opacity: number): void {
    this.setGroupOpacity(this.blackHole, opacity);
  }

  setSolarOpacity(opacity: number): void {
    this.setGroupOpacity(this.solarSystem, opacity);
  }

  getEarth(): THREE.Mesh {
    return this.earth;
  }

  dispose(): void {
    this.group.traverse((object) => {
      if (!(object instanceof THREE.Mesh) && !(object instanceof THREE.Points)) return;
      object.geometry.dispose();
      const material = object.material;
      if (Array.isArray(material)) material.forEach((item) => item.dispose());
      else material.dispose();
    });
  }

  private createBlackHole(): void {
    const core = new THREE.Mesh(
      new THREE.SphereGeometry(3.1, 64, 64),
      new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0 }),
    );

    const disk = new THREE.Mesh(
      new THREE.TorusGeometry(4.4, 0.72, 24, 160),
      new THREE.MeshBasicMaterial({
        color: 0xff8a3d,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    );
    disk.rotation.x = Math.PI / 2.2;

    const glow = new THREE.Mesh(
      new THREE.SphereGeometry(5.1, 48, 48),
      new THREE.MeshBasicMaterial({
        color: 0x7b3cff,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    );

    this.blackHole.add(glow, disk, core);
    this.blackHole.position.set(0, 0, -15);
  }

  private createMilkyWay(): void {
    const count = 18000;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const warm = new THREE.Color(0xffd49a);
    const cool = new THREE.Color(0xb9d4ff);

    for (let i = 0; i < count; i += 1) {
      const index = i * 3;
      const radius = Math.pow(Math.random(), 1.55) * 34;
      const arm = i % 4;
      const angle = arm * Math.PI / 2 + radius * 0.28 + (Math.random() - 0.5) * (0.18 + radius * 0.025);
      positions[index] = Math.cos(angle) * radius;
      positions[index + 1] = (Math.random() - 0.5) * (0.18 + radius * 0.018);
      positions[index + 2] = Math.sin(angle) * radius;

      const color = warm.clone().lerp(cool, radius / 34);
      colors[index] = color.r;
      colors[index + 1] = color.g;
      colors[index + 2] = color.b;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const stars = new THREE.Points(
      geometry,
      new THREE.PointsMaterial({ size: 0.055, vertexColors: true, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending }),
    );

    const background = new THREE.Points(
      this.createBackgroundStars(),
      new THREE.PointsMaterial({ color: 0xffffff, size: 0.028, transparent: true, opacity: 0, depthWrite: false }),
    );

    this.milkyWay.add(background, stars);
    this.milkyWay.position.set(0, 0, -34);
  }

  private createBackgroundStars(): THREE.BufferGeometry {
    const count = 4500;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i += 1) {
      const index = i * 3;
      positions[index] = (Math.random() - 0.5) * 110;
      positions[index + 1] = (Math.random() - 0.5) * 90;
      positions[index + 2] = (Math.random() - 0.5) * 90;
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geometry;
  }

  private createSolarSystem(): void {
    const sun = new THREE.Mesh(
      new THREE.SphereGeometry(2.1, 48, 48),
      new THREE.MeshBasicMaterial({ color: 0xffc15a, transparent: true, opacity: 0 }),
    );
    this.solarSystem.add(sun);

    const configs = [
      [0.35, 3.2, 0xaaa39a, 1.7], [0.55, 4.5, 0xd9a46d, 1.35],
      [0.62, 5.8, 0x4c8ed9, 1.05], [0.48, 7.0, 0xb86f51, 0.82],
      [1.45, 9.4, 0xd6a26d, 0.42], [1.2, 12.0, 0xd8bf91, 0.31],
      [0.92, 14.2, 0x8ac6e8, 0.22], [0.9, 16.2, 0x4f73d8, 0.16],
    ] as const;

    const planets: THREE.Object3D[] = [];
    configs.forEach(([size, radius, color, speed], index) => {
      const planet = new THREE.Mesh(
        new THREE.SphereGeometry(size, 32, 32),
        new THREE.MeshStandardMaterial({ color, roughness: 0.72, metalness: 0.04, transparent: true, opacity: 0 }),
      );
      planet.userData['radius'] = radius;
      planet.userData['speed'] = speed;
      if (index === 2) planet.name = 'earth';
      this.solarSystem.add(planet);
      planets.push(planet);

      const orbit = new THREE.LineLoop(
        new THREE.BufferGeometry().setFromPoints(this.circlePoints(radius)),
        new THREE.LineBasicMaterial({ color: 0x8c98aa, transparent: true, opacity: 0.18 }),
      );
      this.solarSystem.add(orbit);
    });

    this.solarSystem.userData['planets'] = planets;
    this.solarSystem.position.set(0, 0, -22);
  }

  private circlePoints(radius: number): THREE.Vector3[] {
    return Array.from({ length: 96 }, (_, index) => {
      const angle = (index / 96) * Math.PI * 2;
      return new THREE.Vector3(Math.cos(angle) * radius, 0, Math.sin(angle) * radius);
    });
  }

  private setGroupOpacity(group: THREE.Group, opacity: number): void {
    group.traverse((object) => {
      if (!(object instanceof THREE.Mesh) && !(object instanceof THREE.Points) && !(object instanceof THREE.LineLoop)) return;
      const material = object.material;
      if (Array.isArray(material)) material.forEach((item) => { item.transparent = true; item.opacity = opacity; });
      else { material.transparent = true; material.opacity = opacity; }
    });
  }
}
