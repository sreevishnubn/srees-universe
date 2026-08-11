import * as THREE from 'three';
import { gsap } from 'gsap';

import { Galaxy } from './galaxy';
import { WarpField } from './warp-field';
import { HomeWorld } from '../home/home-world';

export interface ArrivalElements {
  loader: HTMLElement;
  loaderBar: HTMLElement;
  loaderPulse: HTMLElement;
  progress: HTMLElement;
  status: HTMLElement;
  readyGroup: HTMLElement;
  ready: HTMLElement;
  welcomeGroup: HTMLElement;
  title: HTMLElement;
  subtitle: HTMLElement;
  enterButton: HTMLButtonElement;
}

type UniversePhase = 'loading' | 'ready' | 'welcome' | 'entering' | 'home';

export class UniverseArrival {
  private phase: UniversePhase = 'loading';
  private loadingTimeline?: gsap.core.Timeline;
  private enterTimeline?: gsap.core.Timeline;

  playLoadingSequence(
    camera: THREE.PerspectiveCamera,
    galaxy: Galaxy,
    homeWorld: HomeWorld,
    elements: ArrivalElements,
  ): void {
    this.loadingTimeline?.kill();

    const { loader, loaderBar, loaderPulse, progress, status, readyGroup, welcomeGroup, title, subtitle, enterButton } = elements;

    this.phase = 'loading';
    gsap.set(loader, { autoAlpha: 1, scale: 1 });
    gsap.set(readyGroup, { autoAlpha: 0, y: 14 });
    gsap.set(welcomeGroup, { autoAlpha: 0, y: 28 });
    gsap.set(title, { y: 24, scale: 0.97 });
    gsap.set(subtitle, { y: 14 });
    gsap.set(enterButton, { y: 14 });

    // Do not rotate the camera. The same front-facing composition is retained.
    camera.position.set(0, 2, 28);
    camera.rotation.set(0, 0, 0);
    camera.lookAt(0, 0, 0);
    camera.fov = 55;
    camera.updateProjectionMatrix();

    // The galaxy is no longer part of the visual story.
    galaxy.setOpacity(0);
    homeWorld.setOpacity(0);
    homeWorld.group.scale.setScalar(1);

    const state = { value: 1 };
    this.loadingTimeline = gsap.timeline();

    // 1. LOADING — unchanged: clean 01% -> 100% boot sequence.
    this.loadingTimeline.to(state, {
      value: 100,
      duration: 5.5,
      ease: 'power1.inOut',
      onUpdate: () => {
        const value = Math.floor(state.value);
        progress.textContent = `${String(value).padStart(2, '0')}%`;
        loaderBar.style.width = `${value}%`;
        loaderPulse.style.left = `${value}%`;
      },
    });

    // 2. UNIVERSE READY.
    this.loadingTimeline.call(() => {
      this.phase = 'ready';
      status.textContent = 'UNIVERSE READY';
    });

    this.loadingTimeline.to(loader, {
      autoAlpha: 0,
      duration: 0.45,
      ease: 'power2.in',
    });

    this.loadingTimeline.to(readyGroup, {
      autoAlpha: 1,
      y: 0,
      duration: 0.6,
      ease: 'power2.out',
    });

    // Bring in the actual world behind READY: a race track, not a galaxy.
    this.loadingTimeline.to(homeWorld.group.scale, {
      x: 1,
      y: 1,
      z: 1,
      duration: 0.9,
      ease: 'power3.out',
      onStart: () => homeWorld.setOpacity(1),
    }, '-=0.25');

    this.loadingTimeline.to({}, { duration: 0.75 });

    this.loadingTimeline.to(readyGroup, {
      autoAlpha: 0,
      y: -10,
      duration: 0.45,
      ease: 'power2.in',
    });

    // 3. WELCOME — overlay on the race track.
    this.loadingTimeline.call(() => {
      this.phase = 'welcome';
    });

    this.loadingTimeline.to(welcomeGroup, {
      autoAlpha: 1,
      y: 0,
      duration: 0.75,
      ease: 'power3.out',
    });

    this.loadingTimeline.to(title, {
      y: 0,
      scale: 1,
      duration: 0.85,
      ease: 'power3.out',
    }, '-=0.45');

    this.loadingTimeline.to(subtitle, {
      y: 0,
      duration: 0.65,
      ease: 'power2.out',
    }, '-=0.45');

    this.loadingTimeline.to(enterButton, {
      y: 0,
      duration: 0.65,
      ease: 'back.out(1.25)',
    }, '-=0.3');
  }

  enterUniverse(
    camera: THREE.PerspectiveCamera,
    galaxy: Galaxy,
    warpField: WarpField,
    homeWorld: HomeWorld,
    elements: ArrivalElements,
  ): void {
    if (this.phase !== 'welcome') return;

    this.enterTimeline?.kill();
    this.phase = 'entering';
    elements.enterButton.disabled = true;

    this.enterTimeline = gsap.timeline();

    // 4. ENTER — the UI disappears, then the camera moves toward the track.
    this.enterTimeline.to(elements.welcomeGroup, {
      autoAlpha: 0,
      scale: 1.04,
      duration: 0.5,
      ease: 'power3.in',
    });

    this.enterTimeline.call(() => {
      galaxy.setOpacity(0);
      homeWorld.setOpacity(1);
      warpField.setActive(true);
      warpField.setSpeed(0.15);
    });

    // Cinematic approach: distance changes, camera orientation does not.
    this.enterTimeline.to(camera.position, {
      z: 14,
      y: 1.7,
      duration: 2.7,
      ease: 'power2.inOut',
    });

    this.enterTimeline.to(camera, {
      fov: 68,
      duration: 2.1,
      ease: 'power2.in',
      onUpdate: () => camera.updateProjectionMatrix(),
    }, '<');

    this.enterTimeline.to(warpField.points.material, {
      opacity: 0,
      duration: 1.0,
    }, '-=0.6');

    this.enterTimeline.to(camera, {
      fov: 55,
      duration: 1.2,
      ease: 'power2.out',
      onUpdate: () => camera.updateProjectionMatrix(),
    });

    this.enterTimeline.call(() => {
      warpField.setActive(false);
      warpField.setSpeed(0);
      this.phase = 'home';
    });
  }
}
