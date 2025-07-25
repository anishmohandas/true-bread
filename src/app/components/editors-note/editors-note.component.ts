import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

@Component({
  selector: 'app-editors-note',
  templateUrl: './editors-note.component.html',
  styleUrls: ['./editors-note.component.scss']
})
export class EditorsNoteComponent implements OnInit, AfterViewInit, OnDestroy {

  constructor() {}

  ngOnInit() {
    console.log('📝 Editor\'s Note component ngOnInit called');
  }

  ngAfterViewInit() {
    console.log('📝 Editor\'s Note component initialized');
    this.initializeAnimations();
  }

  ngOnDestroy() {
    // Clean up ScrollTrigger instances
    ScrollTrigger.getAll().forEach(trigger => {
      if (trigger.vars.trigger &&
          typeof trigger.vars.trigger !== 'string' &&
          trigger.vars.trigger instanceof Element &&
          trigger.vars.trigger.closest('.editors-note')) {
        trigger.kill();
      }
    });
  }

  private initializeAnimations() {
    // Set initial states
    gsap.set('.editors-note .fade-in-element', {
      opacity: 0,
      y: 50
    });

    gsap.set('.editors-note .slide-in-left', {
      opacity: 0,
      x: -100
    });

    gsap.set('.editors-note .slide-in-right', {
      opacity: 0,
      x: 100
    });

    gsap.set('.editors-note .editor-image', {
      opacity: 0,
      scale: 0.8
    });

    gsap.set('.editors-note .editor-info', {
      opacity: 0,
      y: 30
    });

    // Create ScrollTrigger animation
    this.animateContent();
  }

  private animateContent() {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: '.editors-note',
        start: 'top 80%',
        end: 'bottom 20%',
        toggleActions: 'play none none reverse'
      }
    });

    // Animate header
    tl.to('.editors-note .page-title', {
      opacity: 1,
      y: 0,
      duration: 1,
      ease: 'power2.out'
    })

    // Animate editor profile
    .to('.editors-note .editor-image', {
      opacity: 1,
      scale: 1,
      duration: 0.8,
      ease: 'back.out(1.7)'
    }, '-=0.5')

    .to('.editors-note .editor-info', {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: 'power2.out',
      stagger: 0.2
    }, '-=0.6')

    // Animate content sections
    .to('.editors-note .fade-in-element', {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: 'power2.out',
      stagger: 0.3
    }, '-=0.4')

    // Animate section dividers
    .to('.editors-note .slide-in-left', {
      opacity: 1,
      x: 0,
      duration: 0.8,
      ease: 'power2.out'
    }, '-=0.6')

    .to('.editors-note .slide-in-right', {
      opacity: 1,
      x: 0,
      duration: 0.8,
      ease: 'power2.out'
    }, '-=0.4');
  }

  onImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    img.src = 'assets/images/default-editor.jpg';
  }
}