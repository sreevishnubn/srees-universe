import { gsap } from 'gsap';
import { CameraManager } from '../camera/camera-manager';

export interface IntroElements {
  overlay: HTMLElement;
  status: HTMLElement;
  title: HTMLElement;
  subtitle: HTMLElement;
  enterButton: HTMLElement;
}

export class IntroSequence {
  play(
    cameraManager: CameraManager,
    elements: IntroElements,
  ): gsap.core.Timeline {
    const { camera } = cameraManager;

    gsap.set(elements.overlay, {
      opacity: 1,
    });

    gsap.set(elements.status, {
      opacity: 0,
      y: 10,
    });

    gsap.set(elements.title, {
      opacity: 0,
      y: 35,
      scale: 0.96,
    });

    gsap.set(elements.subtitle, {
      opacity: 0,
      y: 18,
    });

    gsap.set(elements.enterButton, {
      opacity: 0,
      y: 14,
      scale: 0.96,
    });

    camera.position.set(0, 2.4, 11);
    camera.lookAt(0, 0, 0);

    const timeline = gsap.timeline({
      defaults: {
        ease: 'power3.out',
      },
    });

    timeline
      .to(elements.status, {
        opacity: 1,
        y: 0,
        duration: 0.8,
      })
      .to(
        elements.status,
        {
          opacity: 0.55,
          duration: 1.2,
        },
        '+=0.4',
      )
      .to(
        camera.position,
        {
          z: 7.5,
          y: 2,
          duration: 3.5,
          ease: 'power2.inOut',
        },
        '-=1',
      )
      .to(
        elements.title,
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 1.4,
        },
        '-=2',
      )
      .to(
        elements.subtitle,
        {
          opacity: 1,
          y: 0,
          duration: 1,
        },
        '-=0.7',
      )
      .to(
        elements.enterButton,
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.8,
          ease: 'back.out(1.4)',
        },
        '-=0.4',
      );

    return timeline;
  }
}