import * as THREE from 'three';

type SmokeParticle = {
  mesh: THREE.Mesh;
  seed: number;
};

type Car = {
  group: THREE.Group;
  speed: number;
  offset: number;
  smoke: SmokeParticle[];
};

export class HomeWorld {
  readonly group = new THREE.Group();

  private readonly trackCurve: THREE.CatmullRomCurve3;
  private readonly cars: Car[] = [];
  private readonly roadMaterial: THREE.MeshStandardMaterial;
  private readonly smokeMaterial: THREE.MeshBasicMaterial;
  private opacity = 0;
  private elapsed = 0;

  constructor() {
    this.group.position.set(0, -2.2, -10);

    this.trackCurve = new THREE.CatmullRomCurve3(
      [
        new THREE.Vector3(-13, 0, 5),
        new THREE.Vector3(-7, 0, -5),
        new THREE.Vector3(1, 0, -7),
        new THREE.Vector3(10, 0, -4),
        new THREE.Vector3(13, 0, 3),
        new THREE.Vector3(8, 0, 8),
        new THREE.Vector3(-2, 0, 9),
        new THREE.Vector3(-10, 0, 7),
      ],
      true,
      'catmullrom',
      0.45,
    );

    this.roadMaterial = new THREE.MeshStandardMaterial({
      color: 0x111318,
      roughness: 0.72,
      metalness: 0.28,
      transparent: true,
      opacity: 0,
    });

    this.smokeMaterial = new THREE.MeshBasicMaterial({
      color: 0xd9d5ca,
      transparent: true,
      opacity: 0.24,
      depthWrite: false,
    });

    this.createTrack();
    this.createEnvironment();
    this.createCar(0, 0xffb347, 0.105);
    this.createCar(1, 0xdce7f5, 0.092);
  }

  update(): void {
    this.elapsed += 0.016;

    this.cars.forEach((car, index) => {
      const t = (this.elapsed * car.speed + car.offset) % 1;
      const position = this.trackCurve.getPointAt(t);
      const tangent = this.trackCurve.getTangentAt(t).normalize();

      car.group.position.copy(position);
      car.group.rotation.y = Math.atan2(tangent.x, tangent.z);

      // Smoke is deliberately left behind the cars instead of being parented to them.
      car.smoke.forEach((particle, particleIndex) => {
        const life = (this.elapsed * 0.48 + particle.seed) % 1;
        const distance = 0.9 + life * 3.6;
        const side = Math.sin(particle.seed * 31.7) * 0.48;

        particle.mesh.position.set(
          position.x - tangent.x * distance + side,
          0.12 + life * 1.0,
          position.z - tangent.z * distance + Math.cos(particle.seed * 17.3) * 0.35,
        );

        const scale = 0.12 + life * 0.62;
        particle.mesh.scale.setScalar(scale);
        particle.mesh.rotation.z += 0.008 + index * 0.002;

        const material = particle.mesh.material;
        if (!Array.isArray(material)) {
          material.opacity = this.opacity * (0.26 * (1 - life));
        }
      });
    });

    this.group.rotation.y = Math.sin(this.elapsed * 0.08) * 0.012;
  }

  setOpacity(opacity: number): void {
    this.opacity = THREE.MathUtils.clamp(opacity, 0, 1);

    this.group.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) return;

      const material = object.material;
      if (Array.isArray(material)) {
        material.forEach((item) => {
          item.transparent = true;
          item.opacity = this.materialOpacity(item);
        });
      } else {
        material.transparent = true;
        material.opacity = this.materialOpacity(material);
      }
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

  private materialOpacity(material: THREE.Material): number {
    if (material === this.roadMaterial) return this.opacity * 0.92;
    if (material === this.smokeMaterial) return this.opacity * 0.24;
    return this.opacity * 0.95;
  }

  private createTrack(): void {
    const road = new THREE.Mesh(
      new THREE.TubeGeometry(this.trackCurve, 180, 2.05, 12, true),
      this.roadMaterial,
    );
    road.scale.y = 0.12;
    this.group.add(road);

    const laneMaterial = new THREE.MeshBasicMaterial({
      color: 0xc9c3b5,
      transparent: true,
      opacity: 0,
    });

    const lane = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(this.trackCurve.getPoints(220)),
      laneMaterial,
    );
    lane.position.y = 0.27;
    lane.scale.setScalar(0.72);
    this.group.add(lane);

    const curbMaterial = new THREE.MeshBasicMaterial({
      color: 0xffb347,
      transparent: true,
      opacity: 0,
    });

    const curb = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(this.trackCurve.getPoints(220)),
      curbMaterial,
    );
    curb.position.y = 0.31;
    curb.scale.setScalar(0.84);
    this.group.add(curb);

    const start = this.trackCurve.getPointAt(0);
    const finish = new THREE.Mesh(
      new THREE.BoxGeometry(4.2, 0.04, 0.12),
      new THREE.MeshBasicMaterial({
        color: 0xf5f1e8,
        transparent: true,
        opacity: 0,
      }),
    );
    finish.position.copy(start);
    finish.position.y = 0.34;
    finish.rotation.y = Math.atan2(
      this.trackCurve.getTangentAt(0).x,
      this.trackCurve.getTangentAt(0).z,
    );
    this.group.add(finish);
  }

  private createEnvironment(): void {
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(80, 80),
      new THREE.MeshStandardMaterial({
        color: 0x05070a,
        roughness: 0.9,
        metalness: 0.08,
        transparent: true,
        opacity: 0,
      }),
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.35;
    this.group.add(ground);

    for (let i = 0; i < 18; i += 1) {
      const light = new THREE.Mesh(
        new THREE.BoxGeometry(0.08, 0.55, 0.08),
        new THREE.MeshBasicMaterial({
          color: i % 3 === 0 ? 0xffb347 : 0xdde7ff,
          transparent: true,
          opacity: 0,
        }),
      );

      const t = i / 18;
      const point = this.trackCurve.getPointAt(t);
      const tangent = this.trackCurve.getTangentAt(t).normalize();
      const normal = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize();

      light.position.copy(point).addScaledVector(normal, 2.9);
      light.position.y = 0.15;
      this.group.add(light);
    }
  }

  private createCar(index: number, color: number, speed: number): void {
    const carGroup = new THREE.Group();

    const body = new THREE.Mesh(
      new THREE.BoxGeometry(1.7, 0.34, 3.1),
      new THREE.MeshStandardMaterial({
        color,
        roughness: 0.26,
        metalness: 0.72,
        transparent: true,
        opacity: 0,
      }),
    );
    body.position.y = 0.48;
    body.scale.x = 0.82;

    const cabin = new THREE.Mesh(
      new THREE.BoxGeometry(1.05, 0.28, 1.28),
      new THREE.MeshStandardMaterial({
        color: 0x080a0d,
        roughness: 0.12,
        metalness: 0.45,
        transparent: true,
        opacity: 0,
      }),
    );
    cabin.position.set(0, 0.78, 0.12);

    const nose = new THREE.Mesh(
      new THREE.BoxGeometry(1.25, 0.2, 0.65),
      new THREE.MeshStandardMaterial({
        color,
        roughness: 0.2,
        metalness: 0.75,
        transparent: true,
        opacity: 0,
      }),
    );
    nose.position.set(0, 0.42, -1.32);

    carGroup.add(body, cabin, nose);

    const wheelMaterial = new THREE.MeshStandardMaterial({
      color: 0x050505,
      roughness: 0.88,
      metalness: 0.12,
      transparent: true,
      opacity: 0,
    });

    [-0.72, 0.72].forEach((x) => {
      [-1.0, 1.0].forEach((z) => {
        const wheel = new THREE.Mesh(
          new THREE.CylinderGeometry(0.25, 0.25, 0.14, 18),
          wheelMaterial,
        );
        wheel.rotation.z = Math.PI / 2;
        wheel.position.set(x, 0.3, z);
        carGroup.add(wheel);
      });
    });

    this.group.add(carGroup);

    const smoke: SmokeParticle[] = [];
    for (let i = 0; i < 18; i += 1) {
      const particle = new THREE.Mesh(
        new THREE.SphereGeometry(0.24, 10, 10),
        this.smokeMaterial.clone(),
      );
      this.group.add(particle);
      smoke.push({
        mesh: particle,
        seed: i / 18,
      });
    }

    this.cars.push({
      group: carGroup,
      speed,
      offset: index === 0 ? 0.02 : 0.49,
      smoke,
    });
  }
}
