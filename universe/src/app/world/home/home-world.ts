import * as THREE from 'three';

type SmokeParticle = { mesh: THREE.Mesh; seed: number };
type Car = { group: THREE.Group; speed: number; offset: number; smoke: SmokeParticle[] };

export class HomeWorld {
  readonly group = new THREE.Group();

  private readonly trackCurve: THREE.CatmullRomCurve3;
  private readonly cars: Car[] = [];
  private elapsed = 0;
  private opacity = 0;

  constructor() {
    // Keep the existing camera angle. The track is composed in front of it.
    this.group.position.set(0, -2.2, 0);

    this.trackCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-11, 0, -28),
      new THREE.Vector3(-5, 0, -34),
      new THREE.Vector3(5, 0, -30),
      new THREE.Vector3(10, 0, -18),
      new THREE.Vector3(9, 0, 2),
      new THREE.Vector3(6, 0, 25),
      new THREE.Vector3(1, 0, 31),
      new THREE.Vector3(-5, 0, 25),
      new THREE.Vector3(-8, 0, 5),
      new THREE.Vector3(-10, 0, -12),
    ], true, 'catmullrom', 0.38);

    this.createEnvironment();
    this.createTrack();
    this.createCar(0, 0xffb347, 0.105, 0.52);
    this.createCar(1, 0xe7edf7, 0.091, 0.32);
    this.setOpacity(0);
  }

  update(): void {
    this.elapsed += 0.016;

    this.cars.forEach((car, carIndex) => {
      const t = (this.elapsed * car.speed + car.offset) % 1;
      const position = this.trackCurve.getPointAt(t);
      const tangent = this.trackCurve.getTangentAt(t).normalize();

      car.group.position.copy(position);
      car.group.rotation.y = Math.atan2(tangent.x, tangent.z);

      // Smoke is positioned in world space so it remains behind the car.
      car.smoke.forEach((particle, particleIndex) => {
        const life = (this.elapsed * 0.58 + particle.seed + carIndex * 0.17) % 1;
        const distance = 0.8 + life * 4.6;
        const side = Math.sin((particleIndex + 1) * 7.13) * 0.52;
        const depth = Math.cos((particleIndex + 2) * 5.31) * 0.38;

        particle.mesh.position.set(
          position.x - tangent.x * distance + side,
          0.1 + life * 1.2,
          position.z - tangent.z * distance + depth,
        );
        particle.mesh.scale.setScalar(0.12 + life * 0.7);
        particle.mesh.rotation.z += 0.01;

        const material = particle.mesh.material;
        if (!Array.isArray(material)) {
          material.opacity = this.opacity * 0.34 * (1 - life);
        }
      });
    });
  }

  setOpacity(opacity: number): void {
    this.opacity = THREE.MathUtils.clamp(opacity, 0, 1);

    this.group.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) return;
      const material = object.material;
      if (Array.isArray(material)) {
        material.forEach((item) => {
          item.transparent = true;
          item.opacity = this.opacity * 0.95;
        });
      } else if (material !== undefined) {
        material.transparent = true;
        // Smoke gets its animated opacity from update().
        if (object.geometry.type !== 'SphereGeometry' || !this.isSmoke(object)) {
          material.opacity = this.opacity * 0.95;
        }
      }
    });
  }

  dispose(): void {
    this.group.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) return;
      object.geometry.dispose();
      const material = object.material;
      if (Array.isArray(material)) material.forEach((item) => item.dispose());
      else material.dispose();
    });
  }

  private isSmoke(object: THREE.Mesh): boolean {
    return this.cars.some((car) => car.smoke.some((particle) => particle.mesh === object));
  }

  private createTrack(): void {
    const road = new THREE.Mesh(
      new THREE.TubeGeometry(this.trackCurve, 280, 2.35, 14, true),
      new THREE.MeshStandardMaterial({
        color: 0x101318,
        roughness: 0.74,
        metalness: 0.25,
        transparent: true,
        opacity: 0,
      }),
    );
    road.scale.y = 0.1;
    this.group.add(road);

    const lane = new THREE.LineLoop(
      new THREE.BufferGeometry().setFromPoints(this.trackCurve.getPoints(280)),
      new THREE.LineBasicMaterial({ color: 0xe8e2d5, transparent: true, opacity: 0 }),
    );
    lane.position.y = 0.27;
    lane.scale.setScalar(0.82);
    this.group.add(lane);

    const edge = new THREE.LineLoop(
      new THREE.BufferGeometry().setFromPoints(this.trackCurve.getPoints(280)),
      new THREE.LineBasicMaterial({ color: 0xffb347, transparent: true, opacity: 0 }),
    );
    edge.position.y = 0.31;
    edge.scale.setScalar(0.94);
    this.group.add(edge);

    for (let i = 0; i < 34; i += 1) {
      const t = i / 34;
      const point = this.trackCurve.getPointAt(t);
      const tangent = this.trackCurve.getTangentAt(t).normalize();
      const normal = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize();
      const lamp = new THREE.Mesh(
        new THREE.BoxGeometry(0.09, 0.8, 0.09),
        new THREE.MeshBasicMaterial({
          color: i % 4 === 0 ? 0xffb347 : 0xdbe5ff,
          transparent: true,
          opacity: 0,
        }),
      );
      lamp.position.copy(point).addScaledVector(normal, 3.2);
      lamp.position.y = 0.2;
      this.group.add(lamp);
    }
  }

  private createEnvironment(): void {
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(100, 100),
      new THREE.MeshStandardMaterial({
        color: 0x040609,
        roughness: 0.95,
        metalness: 0.05,
        transparent: true,
        opacity: 0,
      }),
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.4;
    this.group.add(ground);

    const light = new THREE.PointLight(0xffb347, 12, 45, 2);
    light.position.set(0, 7, 18);
    this.group.add(light);
  }

  private createCar(index: number, color: number, speed: number, offset: number): void {
    const group = new THREE.Group();
    const bodyMaterial = new THREE.MeshStandardMaterial({ color, roughness: 0.18, metalness: 0.82, transparent: true, opacity: 0 });

    const body = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.4, 3.5), bodyMaterial);
    body.position.y = 0.55;

    const cabin = new THREE.Mesh(
      new THREE.BoxGeometry(1.12, 0.34, 1.45),
      new THREE.MeshStandardMaterial({ color: 0x05070a, roughness: 0.08, metalness: 0.55, transparent: true, opacity: 0 }),
    );
    cabin.position.set(0, 0.86, 0.12);

    const nose = new THREE.Mesh(new THREE.BoxGeometry(1.45, 0.2, 0.72), bodyMaterial.clone());
    nose.position.set(0, 0.48, -1.45);

    const headlights = new THREE.Mesh(
      new THREE.BoxGeometry(1.08, 0.06, 0.08),
      new THREE.MeshBasicMaterial({ color: 0xfff7df, transparent: true, opacity: 0 }),
    );
    headlights.position.set(0, 0.61, -1.78);

    group.add(body, cabin, nose, headlights);

    const wheelMaterial = new THREE.MeshStandardMaterial({ color: 0x030303, roughness: 0.9, metalness: 0.1, transparent: true, opacity: 0 });
    [-0.82, 0.82].forEach((x) => [-1.1, 1.1].forEach((z) => {
      const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.16, 20), wheelMaterial);
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(x, 0.31, z);
      group.add(wheel);
    }));

    this.group.add(group);

    const smoke: SmokeParticle[] = [];
    for (let i = 0; i < 22; i += 1) {
      const particle = new THREE.Mesh(
        new THREE.SphereGeometry(0.3, 10, 10),
        new THREE.MeshBasicMaterial({ color: 0xd8d2c7, transparent: true, opacity: 0, depthWrite: false }),
      );
      this.group.add(particle);
      smoke.push({ mesh: particle, seed: i / 22 });
    }

    this.cars.push({ group, speed, offset, smoke });
  }
}
