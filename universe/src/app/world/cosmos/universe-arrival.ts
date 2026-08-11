import * as THREE from 'three';
import { gsap } from 'gsap';

import { Galaxy } from './galaxy';
import { WarpField } from './warp-field';

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

type UniversePhase = 'loading' | 'ready' | 'welcome' | 'entering';

export class UniverseArrival {
  private phase: UniversePhase = 'loading';
  private loadingTimeline?: gsap.core.Timeline;
  private enterTimeline?: gsap.core.Timeline;

  playLoadingSequence(
    camera: THREE.PerspectiveCamera,
    galaxy: Galaxy,
    elements: ArrivalElements,
  ): void {
    this.loadingTimeline?.kill();

    const {
      loader,
      loaderBar,
      loaderPulse,
      progress,
      status,
      readyGroup,
      ready,
      welcomeGroup,
      title,
      subtitle,
      enterButton,
    } = elements;

    this.phase = 'loading';

    gsap.set(loader, { autoAlpha: 1, scale: 1 });
    gsap.set(readyGroup, { autoAlpha: 0, y: 14 });
    gsap.set(welcomeGroup, { autoAlpha: 0, y: 28 });
    gsap.set(title, { y: 24, scale: 0.97 });
    gsap.set(subtitle, { y: 14 });
    gsap.set(enterButton, { y: 14 });

    camera.position.set(0, 0, 30);
    camera.fov = 55;
    camera.updateProjectionMatrix();

    galaxy.setOpacity(0.01);

    const state = { value: 1 };

    this.loadingTimeline = gsap.timeline();

    // 1. LOADING — the only visible UI during this phase.
    this.loadingTimeline.to(state, {
      value: 100,
      duration: 5.5,
      ease: 'power1.inOut',
      onUpdate: () => {
        const value = Math.floor(state.value);
        const percent = value / 100;

        progress.textContent = `${String(value).padStart(2, '0')}%`;
        loaderBar.style.width = `${value}%`;
        loaderPulse.style.left = `${value}%`;

        // Space is present, but never competes with the loader.
        galaxy.setOpacity(
          value < 35
            ? 0.01
            : THREE.MathUtils.lerp(0.01, 0.16, (value - 35) / 65),
        );

        camera.position.z = THREE.MathUtils.lerp(30, 27, percent);
      },
    });

    // 2. UNIVERSE READY — a distinct screen, not mixed with the welcome.
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

    this.loadingTimeline.to({}, { duration: 0.9 });

    this.loadingTimeline.to(readyGroup, {
      autoAlpha: 0,
      y: -10,
      duration: 0.45,
      ease: 'power2.in',
    });

    // 3. WELCOME — appears only after READY has completely left.
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
    elements: ArrivalElements,
  ): void {
    if (this.phase !== 'welcome') return;

    this.enterTimeline?.kill();
    this.phase = 'entering';

    const { welcomeGroup, enterButton } = elements;
    enterButton.disabled = true;

    this.enterTimeline = gsap.timeline();

    // 4. ENTER — remove the UI before the flight begins.
    this.enterTimeline.to(welcomeGroup, {
      autoAlpha: 0,
      scale: 1.05,
      duration: 0.55,
      ease: 'power3.in',
    });

    // Cinematic space transition.
    this.enterTimeline.call(() => {
      galaxy.setOpacity(0.9);
      warpField.setActive(true);
      warpField.setSpeed(0.1);
    });

    this.enterTimeline.to(warpField.points.material, {
      opacity: 0.85,
      duration: 0.6,
    });

    this.enterTimeline.to(camera, {
      fov: 95,
      duration: 3.6,
      ease: 'power3.in',
      onUpdate: () => camera.updateProjectionMatrix(),
    }, '<');

    this.enterTimeline.to(camera.position, {
      z: 0.7,
      duration: 5.5,
      ease: 'power4.in',
    }, '<');

    this.enterTimeline.to(galaxy.group.scale, {
      x: 2.2,
      y: 2.2,
      z: 2.2,
      duration: 5.5,
      ease: 'power4.in',
    }, '<');

    this.enterTimeline.call(() => {
      warpField.setSpeed(2.4);
    });

    // Leave the visitor inside the actual Three.js universe.
    this.enterTimeline.to(warpField.points.material, {
      opacity: 0,
      duration: 1.1,
    });

    this.enterTimeline.to(camera, {
      fov: 55,
      duration: 1.3,
      ease: 'power2.out',
      onUpdate: () => camera.updateProjectionMatrix(),
    }, '<');

    this.enterTimeline.call(() => {
      warpField.setActive(false);
      warpField.setSpeed(0);
    });
  }
}
