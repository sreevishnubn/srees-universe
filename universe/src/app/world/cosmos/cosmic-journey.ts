import * as THREE from 'three';

interface RaceCar {
  group: THREE.Group;
  speed: number;
  start: number;
  smoke: THREE.Mesh[];
}

export class CosmicJourney {
  readonly group = new THREE.Group();

  private readonly track = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-11, 0, -34), new THREE.Vector3(-7, 0, -28),
    new THREE.Vector3(-2.5, 0, -23), new THREE.Vector3(0, 0, -17),
    new THREE.Vector3(0, 0, -10), new THREE.Vector3(0, 0, -4),
    new THREE.Vector3(0, 0, 4), new THREE.Vector3(3, 0, 10),
    new THREE.Vector3(10, 0, 15), new THREE.Vector3(14, 0, 8),
    new THREE.Vector3(12, 0, -1), new THREE.Vector3(8, 0, -10),
    new THREE.Vector3(2, 0, -18), new THREE.Vector3(-6, 0, -26),
  ], false, 'catmullrom', 0.45);

  private readonly cars: RaceCar[] = [];
  private elapsed = 0;
  private opacity = 0;

  constructor() {
    this.group.position.set(0, -1.9, 0);
    this.createGround();
    this.createTrack();
    this.createTrackDetails();
    this.createCar(0, 0xd7d9dc, 0.16, 0.0);
    this.createCar(1, 0x9c6b43, 0.145, 0.055);
    this.setOpacity(0);
  }

  update(): void {
    this.elapsed += 0.016;
    this.cars.forEach((car, carIndex) => {
      const t = Math.min(this.elapsed * car.speed + car.start, 1.14);
      car.group.visible = t < 1.02;
      if (!car.group.visible) return;

      const trackT = Math.min(t, 0.999);
      const position = this.track.getPointAt(trackT);
      const tangent = this.track.getTangentAt(trackT).normalize();
      car.group.position.copy(position);
      car.group.rotation.y = Math.atan2(tangent.x, tangent.z);

      const nearCamera = THREE.MathUtils.smoothstep(t, 0.86, 1.0);
      car.group.scale.setScalar((carIndex === 0 ? 1 : 0.9) + nearCamera * 0.95);

      car.smoke.forEach((particle, index) => {
        const life = (this.elapsed * 0.85 + index * 0.065 + carIndex * 0.18) % 1;
        const spread = Math.sin(index * 6.7) * 0.55;
        const rear = tangent.clone().multiplyScalar(-(0.8 + life * 3.2));
        particle.position.copy(rear);
        particle.position.x += spread;
        particle.position.y += 0.15 + life * 0.85;
        particle.position.z += Math.cos(index * 4.1) * 0.38;
        particle.scale.setScalar(0.08 + life * 0.58);
        (particle.material as THREE.MeshBasicMaterial).opacity = this.opacity * 0.22 * (1 - life);
      });
    });
  }

  setOpacity(value: number): void {
    this.opacity = THREE.MathUtils.clamp(value, 0, 1);
    this.group.traverse((object) => {
      if (!(object instanceof THREE.Mesh) && !(object instanceof THREE.Line)) return;
      const material = object.material;
      if (Array.isArray(material)) material.forEach((item) => { item.transparent = true; item.opacity = this.opacity; });
      else { material.transparent = true; material.opacity = this.opacity; }
    });
  }

  setRaceOpacity(value: number): void { this.setOpacity(value); }

  getSmokeOpacity(): number { return this.opacity; }

  dispose(): void {
    this.group.traverse((object) => {
      if (!(object instanceof THREE.Mesh) && !(object instanceof THREE.Line)) return;
      object.geometry.dispose();
      const material = object.material;
      if (Array.isArray(material)) material.forEach((item) => item.dispose());
      else material.dispose();
    });
  }

  private createGround(): void {
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(110, 110), new THREE.MeshStandardMaterial({ color: 0x050608, roughness: 0.98, metalness: 0.02, transparent: true, opacity: 0 }));
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.42;
    this.group.add(ground);
  }

  private createTrack(): void {
    const road = new THREE.Mesh(new THREE.TubeGeometry(this.track, 260, 2.15, 16, false), new THREE.MeshStandardMaterial({ color: 0x111318, roughness: 0.72, metalness: 0.18, transparent: true, opacity: 0 }));
    road.scale.y = 0.09;
    road.position.y = 0.03;
    this.group.add(road);

    const center = new THREE.Line(new THREE.BufferGeometry().setFromPoints(this.track.getPoints(260)), new THREE.LineBasicMaterial({ color: 0xf2eee4, transparent: true, opacity: 0 }));
    center.position.y = 0.27;
    center.scale.setScalar(0.83);
    this.group.add(center);
  }

  private createTrackDetails(): void {
    const points = this.track.getPoints(34);
    points.forEach((point, index) => {
      const tangent = this.track.getTangentAt(index / 34).normalize();
      const normal = new THREE.Vector3(-tangent.z, 0, tangent.x);
      [-1, 1].forEach((side) => {
        const curb = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.12, 1.15), new THREE.MeshStandardMaterial({ color: index % 2 === 0 ? 0xe7e3d9 : 0x292c31, roughness: 0.75, transparent: true, opacity: 0 }));
        curb.position.copy(point).addScaledVector(normal, side * 2.45);
        curb.position.y = 0.05;
        curb.rotation.y = Math.atan2(tangent.x, tangent.z);
        this.group.add(curb);
      });
    });
  }

  private createCar(index: number, color: number, speed: number, start: number): void {
    const car = new THREE.Group();
    const bodyMaterial = new THREE.MeshStandardMaterial({ color, roughness: 0.22, metalness: 0.72, transparent: true, opacity: 0 });
    const darkMaterial = new THREE.MeshStandardMaterial({ color: 0x090b0e, roughness: 0.12, metalness: 0.5, transparent: true, opacity: 0 });

    const body = new THREE.Mesh(new THREE.BoxGeometry(1.65, 0.38, 3.2), bodyMaterial);
    body.position.y = 0.48;
    const hood = new THREE.Mesh(new THREE.BoxGeometry(1.48, 0.2, 1.0), bodyMaterial);
    hood.position.set(0, 0.57, -1.05);
    const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.05, 0.38, 1.25), darkMaterial);
    cabin.position.set(0, 0.78, 0.15);
    const spoiler = new THREE.Mesh(new THREE.BoxGeometry(1.35, 0.08, 0.18), darkMaterial);
    spoiler.position.set(0, 0.72, 1.35);
    car.add(body, hood, cabin, spoiler);

    [-0.78, 0.78].forEach((x) => [-1.03, 1.03].forEach((z) => {
      const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.18, 18), darkMaterial);
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(x, 0.28, z);
      car.add(wheel);
    }));

    const smoke: THREE.Mesh[] = [];
    for (let i = 0; i < 18; i += 1) {
      const particle = new THREE.Mesh(new THREE.SphereGeometry(0.25, 10, 10), new THREE.MeshBasicMaterial({ color: 0xbcb7ae, transparent: true, opacity: 0, depthWrite: false }));
      particle.position.y = 0.18;
      car.add(particle);
      smoke.push(particle);
    }

    this.group.add(car);
    this.cars.push({ group: car, speed, start, smoke });
  }
}
