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

type UniversePhase = 'loading' | 'race' | 'welcome' | 'entering' | 'home';

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
    gsap.set(welcomeGroup, { autoAlpha: 0, y: 24 });
    gsap.set([title, subtitle, enterButton], { y: 24 });

    camera.position.set(0, 1.1, 15);
    camera.rotation.set(0, 0, 0);
    camera.lookAt(0, 0, -12);
    camera.fov = 48;
    camera.updateProjectionMatrix();

    galaxy.setOpacity(0);
    journey.setOpacity(0);
    homeWorld.setOpacity(0);

    const state = { value: 100 };
    this.loadingTimeline = gsap.timeline();

    this.loadingTimeline.to(state, {
      value: 0,
      duration: 4.8,
      ease: 'none',
      onUpdate: () => {
        const value = Math.ceil(state.value);
        progress.textContent = `${String(value).padStart(2, '0')}%`;
        loaderBar.style.width = `${value}%`;
        loaderPulse.style.left = `${value}%`;
      },
    });

    // The black screen remains the visual base. Only the race world fades in after loading.
    this.loadingTimeline.call(() => {
      this.phase = 'race';
      status.textContent = 'RACE INITIALIZED';
      journey.setOpacity(1);
    });

    this.loadingTimeline.to(loader, { autoAlpha: 0, duration: 0.45 });
    this.loadingTimeline.to(camera.position, {
      z: 5.8,
      duration: 2.8,
      ease: 'power3.out',
    }, '<');

    // Let the cars approach the viewer before revealing the welcome layer.
    this.loadingTimeline.to({}, { duration: 3.7 });

    this.loadingTimeline.call(() => {
      this.phase = 'welcome';
      status.textContent = "WELCOME TO SREE'S EARTH";
    });

    this.loadingTimeline.to(welcomeGroup, {
      autoAlpha: 1,
      y: 0,
      duration: 0.85,
      ease: 'power3.out',
    });
    this.loadingTimeline.to(title, { y: 0, duration: 0.65, ease: 'power3.out' }, '-=0.48');
    this.loadingTimeline.to(subtitle, { y: 0, duration: 0.55, ease: 'power2.out' }, '-=0.34');
    this.loadingTimeline.to(enterButton, { y: 0, duration: 0.65, ease: 'back.out(1.2)' }, '-=0.22');
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
    this.enterTimeline.to(elements.welcomeGroup, { autoAlpha: 0, duration: 0.55, ease: 'power3.in' });
    this.enterTimeline.call(() => {
      journey.setOpacity(0);
      homeWorld.setOpacity(1);
      warpField.setActive(true);
      warpField.setSpeed(0.2);
    });
    this.enterTimeline.to(camera.position, { z: 1.8, duration: 2.8, ease: 'power3.in' });
    this.enterTimeline.to(camera, {
      fov: 68,
      duration: 2.1,
      ease: 'power3.in',
      onUpdate: () => camera.updateProjectionMatrix(),
    }, '<');
    this.enterTimeline.to(warpField.points.material, { opacity: 0.8, duration: 0.5 }, '-=1.2');
    this.enterTimeline.to(warpField.points.material, { opacity: 0, duration: 0.8 });
    this.enterTimeline.to(camera, {
      fov: 55,
      duration: 1.0,
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
