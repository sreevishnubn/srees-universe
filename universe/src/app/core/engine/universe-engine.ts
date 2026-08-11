import { CameraManager } from '../camera/camera-manager';
import { LightingManager } from '../lighting/lighting-manager';
import { UniverseRenderer } from '../renderer/universe-renderer';
import { SceneManager } from '../scene/scene-manager';

import { Galaxy } from '../../world/cosmos/galaxy';
import { WarpField } from '../../world/cosmos/warp-field';
import { HomeWorld } from '../../world/home/home-world';

export class UniverseEngine {
  private animationFrameId = 0;

  readonly sceneManager = new SceneManager();
  readonly cameraManager = new CameraManager();
  readonly renderer: UniverseRenderer;

  readonly galaxy = new Galaxy();
  readonly warpField = new WarpField();
  readonly homeWorld = new HomeWorld();

  private readonly lightingManager = new LightingManager();

  constructor(canvas: HTMLCanvasElement) {
    this.renderer = new UniverseRenderer(canvas);

    this.sceneManager.add(this.galaxy.group);
    this.sceneManager.add(this.warpField.points);
    this.sceneManager.add(this.homeWorld.group);

    this.lightingManager.setup(this.sceneManager.scene);

    window.addEventListener('resize', this.handleResize);
  }

  start(): void {
    this.animate();
  }

  stop(): void {
    cancelAnimationFrame(this.animationFrameId);
  }

  dispose(): void {
    this.stop();

    window.removeEventListener('resize', this.handleResize);

    this.galaxy.dispose();
    this.warpField.dispose();
    this.homeWorld.dispose();
    this.renderer.dispose();
  }

  private animate = (): void => {
    this.animationFrameId = requestAnimationFrame(this.animate);

    this.galaxy.update();
    this.warpField.update();
    this.homeWorld.update();

    this.renderer.render(
      this.sceneManager.scene,
      this.cameraManager.camera,
    );
  };

  private handleResize = (): void => {
    this.renderer.resize();
    this.cameraManager.resize();
  };
}
