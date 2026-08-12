import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { UniverseEngine } from './core/engine/universe-engine';
import { ArrivalElements, UniverseArrival } from './world/cosmos/universe-arrival';

@Component({ selector: 'app-root', templateUrl: './app.html', styleUrl: './app.scss' })
export class App implements AfterViewInit, OnDestroy {
  @ViewChild('universeCanvas', { static: true }) private readonly canvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('loader', { static: true }) private readonly loader!: ElementRef<HTMLElement>;
  @ViewChild('loaderBar', { static: true }) private readonly loaderBar!: ElementRef<HTMLElement>;
  @ViewChild('loaderPulse', { static: true }) private readonly loaderPulse!: ElementRef<HTMLElement>;
  @ViewChild('progress', { static: true }) private readonly progress!: ElementRef<HTMLElement>;
  @ViewChild('status', { static: true }) private readonly status!: ElementRef<HTMLElement>;
  @ViewChild('readyGroup', { static: true }) private readonly readyGroup!: ElementRef<HTMLElement>;
  @ViewChild('ready', { static: true }) private readonly ready!: ElementRef<HTMLElement>;
  @ViewChild('welcomeGroup', { static: true }) private readonly welcomeGroup!: ElementRef<HTMLElement>;
  @ViewChild('title', { static: true }) private readonly title!: ElementRef<HTMLElement>;
  @ViewChild('subtitle', { static: true }) private readonly subtitle!: ElementRef<HTMLElement>;
  @ViewChild('enterButton', { static: true }) private readonly enterButton!: ElementRef<HTMLButtonElement>;
  @ViewChild('smokeTransition', { static: true }) private readonly smokeTransition!: ElementRef<HTMLElement>;

  private engine?: UniverseEngine;
  private readonly arrival = new UniverseArrival();

  ngAfterViewInit(): void {
    this.engine = new UniverseEngine(this.canvas.nativeElement);
    this.engine.start();
    this.arrival.playLoadingSequence(this.engine.cameraManager.camera, this.engine.galaxy, this.engine.cosmicJourney, this.engine.homeWorld, this.loadingElements);
    this.enterButton.nativeElement.addEventListener('click', this.handleEnter);
  }

  ngOnDestroy(): void {
    this.enterButton.nativeElement.removeEventListener('click', this.handleEnter);
    this.engine?.dispose();
  }

  private get loadingElements(): ArrivalElements {
    return {
      loader: this.loader.nativeElement,
      loaderBar: this.loaderBar.nativeElement,
      loaderPulse: this.loaderPulse.nativeElement,
      progress: this.progress.nativeElement,
      status: this.status.nativeElement,
      readyGroup: this.readyGroup.nativeElement,
      ready: this.ready.nativeElement,
      welcomeGroup: this.welcomeGroup.nativeElement,
      title: this.title.nativeElement,
      subtitle: this.subtitle.nativeElement,
      enterButton: this.enterButton.nativeElement,
      smokeTransition: this.smokeTransition.nativeElement,
    };
  }

  private handleEnter = (): void => {
    if (!this.engine) return;
    this.arrival.enterUniverse(this.engine.cameraManager.camera, this.engine.galaxy, this.engine.warpField, this.engine.cosmicJourney, this.engine.homeWorld, this.loadingElements);
  };
}
