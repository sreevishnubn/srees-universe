import * as THREE from 'three';
import { gsap } from 'gsap';
import { Galaxy } from './galaxy';
import { WarpField } from './warp-field';
import { CosmicJourney } from './cosmic-journey';
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

type UniversePhase = 'loading' | 'black-hole' | 'galaxy' | 'solar-system' | 'earth' | 'welcome' | 'entering' | 'home';

export class UniverseArrival {
  private phase: UniversePhase = 'loading';
  private loadingTimeline?: gsap.core.Timeline;
  private enterTimeline?: gsap.core.Timeline;

  playLoadingSequence(
    camera: THREE.PerspectiveCamera,
    galaxy: Galaxy,
    journey: CosmicJourney,
    homeWorld: HomeWorld,
    elements: ArrivalElements,
  ): void {
    this.loadingTimeline?.kill();
    const { loader, loaderBar, loaderPulse, progress, status, readyGroup, welcomeGroup, title, subtitle, enterButton } = elements;

    this.phase = 'loading';
    gsap.set(loader, { autoAlpha: 1 });
    gsap.set(readyGroup, { autoAlpha: 0 });
    gsap.set(welcomeGroup, { autoAlpha: 0, y: 28 });

    camera.position.set(0, 0, 24);
    camera.rotation.set(0, 0, 0);
    camera.lookAt(0, 0, 0);
    camera.fov = 55;
    camera.updateProjectionMatrix();

    galaxy.setOpacity(0);
    journey.setVisibility(0, 0, 0);
    homeWorld.setOpacity(0);

    const state = { value: 100 };
    this.loadingTimeline = gsap.timeline();

    this.loadingTimeline.to(state, {
      value: 0,
      duration: 5.5,
      ease: 'none',
      onUpdate: () => {
        const value = Math.ceil(state.value);
        progress.textContent = `${String(value).padStart(2, '0')}%`;
        loaderBar.style.width = `${value}%`;
        loaderPulse.style.left = `${value}%`;
      },
    });

    this.loadingTimeline.call(() => {
      this.phase = 'black-hole';
      status.textContent = 'ENTERING THE CORE';
      journey.setBlackHoleOpacity(1);
    });
    this.loadingTimeline.to(loader, { autoAlpha: 0, duration: 0.45 });
    this.loadingTimeline.to(camera.position, { z: 4.2, duration: 3.2, ease: 'power3.in' });
    this.loadingTimeline.to(journey.group.position, { z: 5, duration: 3.2, ease: 'power3.in' }, '<');

    this.loadingTimeline.call(() => {
      this.phase = 'galaxy';
      status.textContent = 'MILKY WAY';
      journey.setGalaxyOpacity(1);
      journey.setBlackHoleOpacity(0);
      camera.position.z = 8;
    });
    this.loadingTimeline.to(journey.group.position, { z: -8, duration: 4.2, ease: 'power2.out' });
    this.loadingTimeline.to(camera.position, { z: 16, duration: 4.2, ease: 'power2.out' }, '<');

    this.loadingTimeline.call(() => {
      this.phase = 'solar-system';
      status.textContent = 'SOLAR SYSTEM';
      journey.setSolarOpacity(1);
    });
    this.loadingTimeline.to(journey.group.position, { z: 10, duration: 3.6, ease: 'power2.inOut' });
    this.loadingTimeline.to(camera.position, { z: 11, duration: 3.6, ease: 'power2.inOut' }, '<');

    this.loadingTimeline.call(() => {
      this.phase = 'earth';
      status.textContent = 'EARTH';
    });
    this.loadingTimeline.to(camera.position, { x: 5.8, y: 2.2, z: 8, duration: 2.8, ease: 'power3.inOut' });
    this.loadingTimeline.to(journey.getEarth().scale, { x: 2.5, y: 2.5, z: 2.5, duration: 2.8, ease: 'power3.out' }, '<');

    this.loadingTimeline.call(() => {
      this.phase = 'welcome';
      status.textContent = "WELCOME TO SREE'S EARTH";
    });
    this.loadingTimeline.to(welcomeGroup, { autoAlpha: 1, y: 0, duration: 0.8, ease: 'power3.out' });
    this.loadingTimeline.to(title, { y: 0, scale: 1, duration: 0.8, ease: 'power3.out' }, '-=0.45');
    this.loadingTimeline.to(subtitle, { y: 0, duration: 0.6 }, '-=0.35');
    this.loadingTimeline.to(enterButton, { y: 0, duration: 0.6, ease: 'back.out(1.2)' }, '-=0.2');
  }

  enterUniverse(
    camera: THREE.PerspectiveCamera,
    galaxy: Galaxy,
    warpField: WarpField,
    journey: CosmicJourney,
    homeWorld: HomeWorld,
    elements: ArrivalElements,
  ): void {
    if (this.phase !== 'welcome') return;

    this.enterTimeline?.kill();
    this.phase = 'entering';
    elements.enterButton.disabled = true;

    this.enterTimeline = gsap.timeline();
    this.enterTimeline.to(elements.welcomeGroup, { autoAlpha: 0, duration: 0.6, ease: 'power3.in' });
    this.enterTimeline.call(() => {
      journey.setVisibility(0, 0, 0);
      homeWorld.setOpacity(1);
      warpField.setActive(true);
      warpField.setSpeed(0.2);
    });
    this.enterTimeline.to(camera.position, { z: 2.5, duration: 3.2, ease: 'power3.in' });
    this.enterTimeline.to(camera, { fov: 72, duration: 2.2, ease: 'power3.in', onUpdate: () => camera.updateProjectionMatrix() }, '<');
    this.enterTimeline.to(warpField.points.material, { opacity: 0.85, duration: 0.55 }, '-=1.4');
    this.enterTimeline.to(warpField.points.material, { opacity: 0, duration: 0.9 });
    this.enterTimeline.to(camera, { fov: 55, duration: 1.2, ease: 'power2.out', onUpdate: () => camera.updateProjectionMatrix() });
    this.enterTimeline.call(() => {
      warpField.setActive(false);
      warpField.setSpeed(0);
      this.phase = 'home';
    });
  }
}
