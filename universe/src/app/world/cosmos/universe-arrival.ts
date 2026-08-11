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
  welcomeGroup: HTMLElement;
  ready: HTMLElement;
  title: HTMLElement;
  subtitle: HTMLElement;
  enterButton: HTMLButtonElement;
}

type UniversePhase =
  | 'loading'
  | 'ready'
  | 'welcome'
  | 'entering';

export class UniverseArrival {
  private phase: UniversePhase =
    'loading';

  playLoadingSequence(
    camera: THREE.PerspectiveCamera,
    galaxy: Galaxy,
    elements: ArrivalElements,
  ): void {
    const {
      loader,
      loaderBar,
      loaderPulse,
      progress,
      status,
      welcomeGroup,
      ready,
      title,
      subtitle,
      enterButton,
    } = elements;

    this.phase = 'loading';

    /*
     * Start completely clean.
     */
    gsap.set(loader, {
      opacity: 1,
      scale: 1,
    });

    gsap.set(welcomeGroup, {
      opacity: 0,
      y: 22,
    });

    gsap.set(ready, {
      opacity: 0,
      y: 10,
    });

    gsap.set(title, {
      opacity: 0,
      y: 25,
      scale: 0.96,
    });

    gsap.set(subtitle, {
      opacity: 0,
      y: 15,
    });

    gsap.set(enterButton, {
      opacity: 0,
      y: 15,
    });

    /*
     * Initial camera position.
     */
    camera.position.set(
      0,
      0,
      30,
    );

    camera.fov = 55;
    camera.updateProjectionMatrix();

    /*
     * IMPORTANT:
     * The galaxy is essentially hidden
     * while the loading screen is running.
     */
    galaxy.setOpacity(0.015);

    const state = {
      value: 1,
    };

    const timeline =
      gsap.timeline();

    /*
     * --------------------------------
     * PHASE 1
     * LOADING
     * --------------------------------
     */
    timeline.to(state, {
      value: 100,

      duration: 6,

      ease: 'power2.inOut',

      onUpdate: () => {
        const value =
          Math.floor(state.value);

        progress.textContent =
          `${String(value).padStart(
            2,
            '0',
          )}%`;

        loaderBar.style.width =
          `${value}%`;

        loaderPulse.style.left =
          `${value}%`;

        /*
         * Galaxy slowly begins appearing,
         * but stays secondary to the loader.
         */
        let galaxyOpacity =
          0.015;

        if (value > 25) {
          galaxyOpacity =
            THREE.MathUtils.lerp(
              0.015,
              0.18,
              (value - 25) / 35,
            );
        }

        if (value > 60) {
          galaxyOpacity =
            THREE.MathUtils.lerp(
              0.18,
              0.52,
              (value - 60) / 40,
            );
        }

        galaxy.setOpacity(
          galaxyOpacity,
        );
      },
    });

    /*
     * --------------------------------
     * PHASE 2
     * READY
     * --------------------------------
     */

    timeline.call(() => {
      this.phase = 'ready';
      status.textContent =
        'UNIVERSE READY';
    });

    timeline.to(
      loader,
      {
        opacity: 0,
        scale: 1.04,
        duration: 0.7,
        ease: 'power3.inOut',
      },
    );

    /*
     * Small intentional pause.
     *
     * This is important.
     */
    timeline.to({}, {
      duration: 0.8,
    });

    /*
     * --------------------------------
     * PHASE 3
     * WELCOME
     * --------------------------------
     */

    timeline.call(() => {
      this.phase = 'welcome';
    });

    timeline.to(
      welcomeGroup,
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power3.out',
      },
    );

    timeline.to(
      ready,
      {
        opacity: 1,
        y: 0,
        duration: 0.6,
      },
      '-=0.45',
    );

    timeline.to(
      title,
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 1.1,
        ease: 'power3.out',
      },
      '-=0.35',
    );

    timeline.to(
      subtitle,
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
      },
      '-=0.55',
    );

    timeline.to(
      enterButton,
      {
        opacity: 1,
        y: 0,
        duration: 0.75,
        ease: 'back.out(1.25)',
      },
      '-=0.3',
    );
  }

  enterUniverse(
    camera: THREE.PerspectiveCamera,
    galaxy: Galaxy,
    warpField: WarpField,
    elements: ArrivalElements,
  ): void {
    if (
      this.phase !== 'welcome'
    ) {
      return;
    }

    this.phase = 'entering';

    const {
      welcomeGroup,
      enterButton,
    } = elements;

    enterButton.disabled = true;

    const timeline =
      gsap.timeline();

    /*
     * --------------------------------
     * EXIT WELCOME
     * --------------------------------
     */

    timeline.to(
      welcomeGroup,
      {
        opacity: 0,
        scale: 1.04,
        duration: 0.65,
        ease: 'power3.in',
      },
    );

    /*
     * --------------------------------
     * ENTER SPACE
     * --------------------------------
     */

    timeline.call(() => {
      warpField.setActive(true);
      warpField.setSpeed(0.12);
    });

    timeline.to(
      warpField.points.material,
      {
        opacity: 0.75,
        duration: 0.7,
      },
    );

    /*
     * FOV expansion creates the
     * sensation of acceleration.
     */
    timeline.to(
      camera,
      {
        fov: 92,
        duration: 2.2,
        ease: 'power2.in',
        onUpdate: () => {
          camera.updateProjectionMatrix();
        },
      },
      '<',
    );

    /*
     * Camera actually enters the galaxy.
     */
    timeline.to(
      camera.position,
      {
        z: 0.8,
        duration: 4.8,
        ease: 'power4.in',
      },
      '<',
    );

    /*
     * Increase galaxy scale as we
     * approach it.
     */
    timeline.to(
      galaxy.group.scale,
      {
        x: 2,
        y: 2,
        z: 2,

        duration: 4.8,

        ease: 'power4.in',
      },
      '<',
    );

    /*
     * Accelerate the star field.
     */
    timeline.call(() => {
      warpField.setSpeed(2.1);
    });

    /*
     * --------------------------------
     * ARRIVAL PAUSE
     * --------------------------------
     */

    timeline.to(
      warpField.points.material,
      {
        opacity: 0,
        duration: 1.2,
      },
    );

    timeline.to(
      camera,
      {
        fov: 55,
        duration: 1.4,
        ease: 'power2.out',
        onUpdate: () => {
          camera.updateProjectionMatrix();
        },
      },
      '<',
    );

    timeline.call(() => {
      warpField.setActive(false);
      warpField.setSpeed(0);

      this.phase = 'entering';
    });
  }
}