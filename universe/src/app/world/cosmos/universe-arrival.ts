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

  playLoadingSequence(camera: THREE.PerspectiveCamera, galaxy: Galaxy, elements: ArrivalElements): void {
    this.loadingTimeline?.kill();
    const { loader, loaderBar, loaderPulse, progress, status, readyGroup, welcomeGroup, title, subtitle, enterButton } = elements;

    this.phase = 'loading';
    gsap.set(loader, { autoAlpha: 1, scale: 1 });
    gsap.set(readyGroup, { autoAlpha: 0, y: 14 });
    gsap.set(welcomeGroup, { autoAlpha: 0, y: 28 });
    gsap.set(title, { y: 24, scale: 0.97 });
    gsap.set(subtitle, { y: 14 });
    gsap.set(enterButton, { y: 14 });

    camera.position.set(0, 2, 28);
    camera.fov = 55;
    camera.updateProjectionMatrix();
    galaxy.setOpacity(0.01);

    const state = { value: 1 };
    this.loadingTimeline = gsap.timeline();

    this.loadingTimeline.to(state, {
      value: 100,
      duration: 5.5,
      ease: 'power1.inOut',
      onUpdate: () => {
        const value = Math.floor(state.value);
        progress.textContent = `${String(value).padStart(2, '0')}%`;
        loaderBar.style.width = `${value}%`;
        loaderPulse.style.left = `${value}%`;
        galaxy.setOpacity(value < 35 ? 0.01 : THREE.MathUtils.lerp(0.01, 0.16, (value - 35) / 65));
      },
    });

    this.loadingTimeline.call(() => {
      this.phase = 'ready';
      status.textContent = 'UNIVERSE READY';
    });
    this.loadingTimeline.to(loader, { autoAlpha: 0, duration: 0.45, ease: 'power2.in' });
    this.loadingTimeline.to(readyGroup, { autoAlpha: 1, y: 0, duration: 0.6, ease: 'power2.out' });
    this.loadingTimeline.to({}, { duration: 0.9 });
    this.loadingTimeline.to(readyGroup, { autoAlpha: 0, y: -10, duration: 0.45, ease: 'power2.in' });
    this.loadingTimeline.call(() => { this.phase = 'welcome'; });
    this.loadingTimeline.to(welcomeGroup, { autoAlpha: 1, y: 0, duration: 0.75, ease: 'power3.out' });
    this.loadingTimeline.to(title, { y: 0, scale: 1, duration: 0.85, ease: 'power3.out' }, '-=0.45');
    this.loadingTimeline.to(subtitle, { y: 0, duration: 0.65, ease: 'power2.out' }, '-=0.45');
    this.loadingTimeline.to(enterButton, { y: 0, duration: 0.65, ease: 'back.out(1.25)' }, '-=0.3');
  }

  enterUniverse(camera: THREE.PerspectiveCamera, galaxy: Galaxy, warpField: WarpField, homeWorld: HomeWorld, elements: ArrivalElements): void {
    if (this.phase !== 'welcome') return;

    this.enterTimeline?.kill();
    this.phase = 'entering';
    elements.enterButton.disabled = true;

    this.enterTimeline = gsap.timeline();
    this.enterTimeline.to(elements.welcomeGroup, {
      autoAlpha: 0,
      scale: 1.05,
      duration: 0.55,
      ease: 'power3.in',
    });

    this.enterTimeline.call(() => {
      galaxy.setOpacity(0.9);
      warpField.setActive(true);
      warpField.setSpeed(0.1);
      homeWorld.setOpacity(0);
    });

    this.enterTimeline.to(warpField.points.material, { opacity: 0.85, duration: 0.6 });
    this.enterTimeline.to(camera, {
      fov: 88,
      duration: 3.2,
      ease: 'power3.in',
      onUpdate: () => camera.updateProjectionMatrix(),
    }, '<');
    this.enterTimeline.to(camera.position, { z: 5, duration: 4.5, ease: 'power4.in' }, '<');
    this.enterTimeline.call(() => { warpField.setSpeed(2.2); });

    this.enterTimeline.to(camera.position, { z: 13, y: 0.8, duration: 2.4, ease: 'power3.out' });
    this.enterTimeline.to(camera, {
      fov: 58,
      duration: 1.8,
      ease: 'power2.out',
      onUpdate: () => camera.updateProjectionMatrix(),
    }, '<');

    const homeState = { opacity: 0 };
    this.enterTimeline.to(homeState, {
      opacity: 1,
      duration: 2.2,
      ease: 'power2.out',
      onUpdate: () => homeWorld.setOpacity(homeState.opacity),
    }, '<');

    this.enterTimeline.to(homeWorld.group.scale, {
      x: 1,
      y: 1,
      z: 1,
      duration: 2.6,
      ease: 'power3.out',
    }, '<');

    this.enterTimeline.to(warpField.points.material, { opacity: 0, duration: 1.2 });
    this.enterTimeline.call(() => {
      warpField.setActive(false);
      warpField.setSpeed(0);
      this.phase = 'home';
    });
  }
}
