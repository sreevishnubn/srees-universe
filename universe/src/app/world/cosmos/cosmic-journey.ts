import * as THREE from 'three';

export class CosmicJourney {
  readonly group = new THREE.Group();

  private readonly blackHole = new THREE.Group();
  private readonly milkyWay = new THREE.Group();
  private readonly solarSystem = new THREE.Group();
  private readonly sunLight = new THREE.PointLight(0xffd08a, 0, 90, 2);
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
    this.solarSystem.rotation.y += 0.0007;

    const planets = this.solarSystem.userData['planets'] as THREE.Object3D[];
    planets.forEach((orbit, index) => {
      const speed = orbit.userData['speed'] as number;
      orbit.rotation.y = this.elapsed * speed + index * 0.8;

      const planet = orbit.children[0];
      if (planet) planet.rotation.y += 0.004;
    });

    this.earth.rotation.y += 0.002;
  }

  setVisibility(blackHole: number, galaxy: number, solar: number): void {
    this.setGroupOpacity(this.blackHole, blackHole);
    this.setGroupOpacity(this.milkyWay, galaxy);
    this.setSolarOpacity(solar);
  }

  setGalaxyOpacity(opacity: number): void {
    this.setGroupOpacity(this.milkyWay, opacity);
  }

  setBlackHoleOpacity(opacity: number): void {
    this.setGroupOpacity(this.blackHole, opacity);
  }

  setSolarOpacity(opacity: number): void {
    this.setGroupOpacity(this.solarSystem, opacity);
    this.sunLight.intensity = opacity > 0 ? 3.2 * opacity : 0;
  }

  getEarth(): THREE.Mesh {
    return this.earth;
  }

  dispose(): void {
    this.group.traverse((object) => {
      if (!(object instanceof THREE.Mesh) && !(object instanceof THREE.Points) && !(object instanceof THREE.LineLoop)) return;
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
        color: 0xff9b4a,
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
        color: 0xffb35c,
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
      new THREE.SphereGeometry(2.15, 64, 64),
      new THREE.MeshBasicMaterial({ color: 0xffc45c, transparent: true, opacity: 0 }),
    );
    this.solarSystem.add(sun);
    this.sunLight.position.copy(sun.position);
    this.solarSystem.add(this.sunLight);

    const configs = [
      [0.24, 3.1, 0x9d958a, 1.7],
      [0.42, 4.15, 0xd7a16f, 1.3],
      [0.46, 5.25, 0x4f79a8, 1.0],
      [0.32, 6.45, 0xa95f45, 0.78],
      [1.05, 8.4, 0xb99068, 0.42],
      [0.88, 10.7, 0xb8aa88, 0.31],
      [0.65, 12.7, 0x79a9bf, 0.22],
      [0.62, 14.6, 0x4968a0, 0.16],
    ] as const;

    const planets: THREE.Object3D[] = [];
    configs.forEach(([size, radius, color, speed], index) => {
      const orbit = new THREE.Group();
      orbit.userData['speed'] = speed;
      orbit.rotation.y = index * 0.8;

      const planet = new THREE.Mesh(
        new THREE.SphereGeometry(size, 32, 32),
        new THREE.MeshStandardMaterial({ color, roughness: 0.86, metalness: 0, transparent: true, opacity: 0 }),
      );
      planet.position.x = radius;
      planet.userData['radius'] = radius;
      if (index === 2) planet.name = 'earth';
      orbit.add(planet);
      this.solarSystem.add(orbit);
      planets.push(orbit);

      const orbitLine = new THREE.LineLoop(
        new THREE.BufferGeometry().setFromPoints(this.circlePoints(radius)),
        new THREE.LineBasicMaterial({ color: 0x647080, transparent: true, opacity: 0.055 }),
      );
      this.solarSystem.add(orbitLine);

      if (index === 5) {
        const rings = new THREE.Mesh(
          new THREE.RingGeometry(size * 1.35, size * 2.15, 64),
          new THREE.MeshBasicMaterial({ color: 0xc9b895, transparent: true, opacity: 0, side: THREE.DoubleSide }),
        );
        rings.rotation.x = Math.PI / 2;
        planet.add(rings);
      }

      if (index === 2) {
        const moon = new THREE.Mesh(
          new THREE.SphereGeometry(0.12, 20, 20),
          new THREE.MeshStandardMaterial({ color: 0xb8b8b8, roughness: 0.9, transparent: true, opacity: 0 }),
        );
        moon.position.x = size * 2.5;
        planet.add(moon);
      }
    });

    this.solarSystem.userData['planets'] = planets;
    this.solarSystem.position.set(0, 0, -22);
  }

  private circlePoints(radius: number): THREE.Vector3[] {
    return Array.from({ length: 128 }, (_, index) => {
      const angle = (index / 128) * Math.PI * 2;
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
