import { Component, OnInit, NgZone } from '@angular/core';
import { AnimationService } from '../../services/animation.service';
import { gsap } from 'gsap';

@Component({
  selector: 'app-preloader',
  templateUrl: './preloader.component.html',
  styleUrls: ['./preloader.component.scss']
})
export class PreloaderComponent implements OnInit {
  constructor(
    private animationService: AnimationService,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    console.log('Preloader component initialized');
    this.ngZone.runOutsideAngular(() => {
      // Initial setup
      console.log('Setting up initial GSAP states');
      gsap.set(".header h2, .header .line-wrapper:not(:last-child) h1", {
        y: "120%"
      });
      gsap.set(".line-wrapper:last-child h1", {
        y: "120%"
      });
      gsap.set(".line-wrapper:last-child h1::before", {
        width: "0"
      });

      console.log('Creating GSAP timeline');
      const tl = gsap.timeline({
        defaults: {
          ease: "power3.inOut"
        },
        onStart: () => console.log('Animation timeline started'),
        onComplete: () => console.log('Animation timeline completed')
      });

      // Animation sequence
      console.log('Starting animation sequence');
      tl.to(".header h2", {
        y: "0%",
        duration: 1,
        onStart: () => console.log('Animating header h2'),
        onComplete: () => console.log('Completed header h2 animation')
      })
      .to(".header .line-wrapper:not(:last-child) h1", {
        y: "0%",
        duration: 1.5,
        stagger: 0.3,
        onStart: () => console.log('Animating non-last line wrappers'),
        onComplete: () => console.log('Completed non-last line wrappers animation')
      }, "-=0.5")
      .to(".line-wrapper:last-child h1", {
        y: "0%",
        duration: 1.5,
        onStart: () => console.log('Animating last line wrapper'),
        onComplete: () => console.log('Completed last line wrapper animation')
      }, "-=1.2")
      .to(".line-wrapper:last-child h1::before", {
        width: "100%",
        duration: 1.5,
        ease: "power2.inOut",
        onStart: () => console.log('Animating last line wrapper before'),
        onComplete: () => console.log('Completed last line wrapper before animation')
      }, "+=0.3")
      .to(".line-wrapper:not(:last-child) h1", {
        opacity: 0,
        duration: 1,
        stagger: 0.2,
        ease: "power2.inOut",
        onStart: () => console.log('Fading out non-last line wrappers'),
        onComplete: () => console.log('Completed fading out non-last line wrappers')
      }, "+=1")
      .add(() => {
        console.log('Adding scaled class to final-line');
        const finalLine = document.querySelector('.final-line');
        if (finalLine) {
          finalLine.classList.add('scaled');
          console.log('Added scaled class successfully');
        } else {
          console.error('Could not find .final-line element');
        }
      })
      .to(".line-wrapper.final-line", {
        duration: 1.5,
        ease: "power2.inOut",
        onStart: () => console.log('Scaling final line'),
        onComplete: () => console.log('Completed scaling final line')
      })
      .to(".pre-loader-container", {
        paddingLeft: "0",
        duration: 1.5,
        ease: "power2.inOut",
        onStart: () => console.log('Adjusting pre-loader-container padding'),
        onComplete: () => console.log('Completed adjusting pre-loader-container padding')
      }, "<")
      .to(".line-wrapper.final-line h1", {
        scale: 1.1,
        fontSize: "12vw",
        duration: 1.5,
        ease: "power2.inOut",
        onStart: () => console.log('Adjusting final line font size'),
        onComplete: () => console.log('Completed adjusting final line font size')
      })
      .to({}, { duration: 1 })
      // Simply slide the preloader up
      .to(".pre-loader", {
        yPercent: -100,
        duration: 1.5,
        ease: "power2.inOut",
        onStart: () => console.log('Sliding preloader up'),
        onComplete: () => console.log('Completed sliding preloader up')
      })
      .add(() => {
        console.log('Animation complete, notifying service');
        this.ngZone.run(() => {
          this.animationService.setPreloaderSeen();
          this.animationService.notifyPreloaderComplete();
          console.log('Notified animation service of completion');
        });
      });

      // Start the timeline
      console.log('Starting timeline');
      tl.play();
    });
  }
}