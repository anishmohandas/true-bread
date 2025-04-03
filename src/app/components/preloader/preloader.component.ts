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
    this.ngZone.runOutsideAngular(() => {
      // Initial setup
      gsap.set(".header h2, .header .line-wrapper:not(:last-child) h1", { 
        y: "120%"
      });
      gsap.set(".line-wrapper:last-child h1", {
        y: "120%"
      });
      gsap.set(".line-wrapper:last-child h1::before", {
        width: "0"
      });

      const tl = gsap.timeline({
        defaults: {
          ease: "power3.inOut"
        }
      });

      // Animation sequence
      tl.to(".header h2", {
        y: "0%",
        duration: 1
      })
      .to(".header .line-wrapper:not(:last-child) h1", {
        y: "0%",
        duration: 1.5,
        stagger: 0.3
      }, "-=0.5")
      .to(".line-wrapper:last-child h1", {
        y: "0%",
        duration: 1.5
      }, "-=1.2")
      .to(".line-wrapper:last-child h1::before", {
        width: "100%",
        duration: 1.5,
        ease: "power2.inOut"
      }, "+=0.3")
      .to(".line-wrapper:not(:last-child) h1", {
        opacity: 0,
        duration: 1,
        stagger: 0.2,
        ease: "power2.inOut",
      }, "+=1")
      .add(() => {
        document.querySelector('.final-line')?.classList.add('scaled');
      })
      .to(".line-wrapper.final-line", {
        scale: 1.3,
        x: "10vw",
        duration: 1.5,
        ease: "power2.inOut"
      })
      .to(".pre-loader-container", {
        paddingLeft: "0",
        duration: 1.5,
        ease: "power2.inOut"
      }, "<")
      .to(".line-wrapper.final-line h1", {
        fontSize: "12vw",
        duration: 1.5,
        ease: "power2.inOut", 
      }, "<")
      .to({}, { duration: 1 })
      // Simply slide the preloader up
      .to(".pre-loader", {
        yPercent: -100,
        duration: 1.5,
        ease: "power2.inOut"
      })
      .add(() => {
        this.ngZone.run(() => {
          this.animationService.setPreloaderSeen();
          this.animationService.notifyPreloaderComplete();
        });
      });
    });
  }
}














