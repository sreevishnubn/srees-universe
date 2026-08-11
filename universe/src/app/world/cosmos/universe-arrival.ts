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
  smokeTransition: HTMLElement;
}

type UniversePhase = 'loading' | 'track' | 'ready' | 'welcome' | 'entering' | 'home';

export class UniverseArrival {
  private phase: UniversePhase = 'loading';
  private loadingTimeline?: gsap.core.Timeline;
  private enterTimeline?: gsap.core.Timeline;

  playLoadingSequence(camera: THREE.PerspectiveCamera, galaxy: Galaxy, homeWorld: HomeWorld, elements: ArrivalElements): void {
    this.loadingTimeline?.kill();
    const { loader, loaderBar, loaderPulse, progress, status, readyGroup, welcomeGroup, title, subtitle, enterButton, smokeTransition } = elements;

    this.phase = 'loading';
    gsap.set(loader, { autoAlpha: 1 });
    gsap.set(readyGroup, { autoAlpha: 0, y: 14 });
    gsap.set(welcomeGroup, { autoAlpha: 0, y: 28 });
    gsap.set(smokeTransition, { autoAlpha: 0, scale: 0.96 });
    gsap.set(title, { y: 24, scale: 0.97 });
    gsap.set(subtitle, { y: 14 });
    gsap.set(enterButton, { y: 14 });

    camera.position.set(0, 2, 28);
    camera.rotation.set(0, 0, 0);
    camera.lookAt(0, 0, 0);
    camera.fov = 55;
    camera.updateProjectionMatrix();

    galaxy.setOpacity(0);
    homeWorld.setOpacity(0);

    const state = { value: 1 };
    this.loadingTimeline = gsap.timeline();

    // 1. LOAD: 01% -> 100%.
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

    // 2. Reveal the race track and let the cars perform the opening shot.
    this.loadingTimeline.call(() => {
      this.phase = 'track';
      status.textContent = 'SIGNAL ACQUIRED';
      homeWorld.setOpacity(1);
    });
    this.loadingTimeline.to(loader, { autoAlpha: 0, duration: 0.45, ease: 'power2.in' });
    this.loadingTimeline.to({}, { duration: 4.6 });

    // 3. Universe ready appears after the action, not before it.
    this.loadingTimeline.call(() => {
      this.phase = 'ready';
      status.textContent = 'UNIVERSE READY';
    });
    this.loadingTimeline.to(readyGroup, { autoAlpha: 1, y: 0, duration: 0.55, ease: 'power2.out' });
    this.loadingTimeline.to({}, { duration: 0.55 });
    this.loadingTimeline.to(readyGroup, { autoAlpha: 0, y: -10, duration: 0.35, ease: 'power2.in' });

    // 4. Smoke fills the screen as the cars pass the viewer.
    this.loadingTimeline.to(smokeTransition, {
      autoAlpha: 1,
      scale: 1.15,
      duration: 0.75,
      ease: 'power3.out',
    });
    this.loadingTimeline.call(() => { this.phase = 'welcome'; });
    this.loadingTimeline.to(welcomeGroup, { autoAlpha: 1, y: 0, duration: 0.7, ease: 'power3.out' });
    this.loadingTimeline.to(title, { y: 0, scale: 1, duration: 0.8, ease: 'power3.out' }, '-=0.4');
    this.loadingTimeline.to(subtitle, { y: 0, duration: 0.6, ease: 'power2.out' }, '-=0.4');
    this.loadingTimeline.to(enterButton, { y: 0, duration: 0.6, ease: 'back.out(1.2)' }, '-=0.25');
    this.loadingTimeline.to(smokeTransition, { autoAlpha: 0, scale: 1.08, duration: 1.1, ease: 'power2.out' }, '-=0.65');
  }

  enterUniverse(camera: THREE.PerspectiveCamera, galaxy: Galaxy, warpField: WarpField, homeWorld: HomeWorld, elements: ArrivalElements): void {
    if (this.phase !== 'welcome') return;

    this.enterTimeline?.kill();
    this.phase = 'entering';
    elements.enterButton.disabled = true;

    this.enterTimeline = gsap.timeline();
    this.enterTimeline.to(elements.welcomeGroup, { autoAlpha: 0, scale: 1.04, duration: 0.5, ease: 'power3.in' });

    this.enterTimeline.call(() => {
      galaxy.setOpacity(0);
      homeWorld.setOpacity(1);
      warpField.setActive(true);
      warpField.setSpeed(0.2);
    });

    // Preserve camera orientation; only distance and FOV change.
    this.enterTimeline.to(camera.position, { z: 10, y: 1.8, duration: 3.0, ease: 'power3.in' });
    this.enterTimeline.to(camera, {
      fov: 72,
      duration: 2.2,
      ease: 'power3.in',
      onUpdate: () => camera.updateProjectionMatrix(),
    }, '<');
    this.enterTimeline.to(warpField.points.material, { opacity: 0.85, duration: 0.55 }, '-=1.4');
    this.enterTimeline.to(warpField.points.material, { opacity: 0, duration: 0.9 });
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
