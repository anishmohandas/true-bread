import { Component, Input, OnInit, OnChanges, OnDestroy, ViewChild, ElementRef, ChangeDetectionStrategy, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import { gsap } from 'gsap';
import { CustomEase } from 'gsap/CustomEase';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MenuComponent implements OnInit, OnChanges, OnDestroy {
  @Input() isOpen = false;
  @ViewChild('headerText', { static: true }) headerText!: ElementRef<HTMLHeadingElement>;

  private animations: gsap.core.Timeline[] = [];

  links = [
    { url: '/', text: 'Home' },
    { url: '/publications', text: 'Publications' },
    { url: '/articles', text: 'Articles' },
    { url: '/about', text: 'About' },
    { url: '/contact', text: 'Contact' }
  ];

  contactInfo = [
    'True Bread Media',
    'Marayamuttom PO',
    'Trivandrum, 695124',
    'India',
    '',
    'truebreadmedia@gmail.com',
    ''
  ];

  socialLinks = [
    'Instagram',
    'Facebook',
    'X',
    '',
    ''
  ];

  constructor(
    private el: ElementRef,
    private router: Router
  ) {
    gsap.registerPlugin(CustomEase);
    CustomEase.create(
      "hop",
      "M0,0 C0.354,0 0.464,0.133 0.498,0.502 0.532,0.872 0.651,1 1,1"
    );
  }

  navigateToRoute(url: string): void {
    // First trigger the closing animation
    this.animateMenu(false);

    // Wait for animation to complete before navigating
    setTimeout(() => {
      this.router.navigate([url]);
      // Emit the menu state change to parent
      const menuToggleEvent = new CustomEvent('menuStateChange', {
        detail: { isOpen: false }
      });
      window.dispatchEvent(menuToggleEvent);
    }, 1000); // Adjust timing to match your animation duration
  }

  ngOnInit(): void {
    this.initializeMenu();
    this.splitText();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen']) {
      this.animateMenu(this.isOpen);
    }
  }

  ngOnDestroy(): void {
    // Clean up all GSAP animations
    this.animations.forEach((animation: gsap.core.Timeline) => animation.kill());
  }

  private initializeMenu() {
    // Wait for elements to be available in DOM
    setTimeout(() => {
      const menu = this.el.nativeElement.querySelector('.menu');
      const links = Array.from(this.el.nativeElement.querySelectorAll('.link'));
      const socialLinks = Array.from(this.el.nativeElement.querySelectorAll('.socials p'));
      const headerSpans = Array.from(this.el.nativeElement.querySelectorAll('.header h1 span'));

      // Only set initial states if elements exist
      if (links.length) {
        gsap.set(links, { y: 30, opacity: 0 });
      }
      if (socialLinks.length) {
        gsap.set(socialLinks, { y: 30, opacity: 0 });
      }

      // Set initial state for subscribe link
      const subscribeLinks = Array.from(this.el.nativeElement.querySelectorAll('.subscribe-link-container p'));
      if (subscribeLinks.length) {
        gsap.set(subscribeLinks, { y: 30, opacity: 0 });
      }
      gsap.set('.video-wrapper', {
        clipPath: "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)"
      });
      if (headerSpans.length) {
        gsap.set(headerSpans, {
          y: 500,
          rotateY: 90,
          scale: 0.8
        });
      }
    }, 0);
  }

  private splitText(): void {
    if (!this.headerText?.nativeElement) return;

    const text = this.headerText.nativeElement.innerText;
    const splitText = text
      .split('')
      .map((char: string) => `<span>${char === ' ' ? '&nbsp;&nbsp;' : char}</span>`)
      .join('');
    this.headerText.nativeElement.innerHTML = splitText;
  }



  private animateMenu(isOpen: boolean) {
    const menu = this.el.nativeElement.querySelector('.menu');
    const links = this.el.nativeElement.querySelectorAll('.link');
    const socialLinks = this.el.nativeElement.querySelectorAll('.socials p');
    const headerSpans = this.el.nativeElement.querySelectorAll('.header h1 span');
    const subscribeLinks = this.el.nativeElement.querySelectorAll('.subscribe-link-container p');

    if (isOpen) {
      // Store the animation timeline
      const timeline = gsap.timeline();
      this.animations.push(timeline);

      timeline.to(menu, {
        clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
        ease: "hop",
        duration: 1.5,
        onStart: () => {
          menu.style.pointerEvents = "all";
        }
      });

      gsap.to(links, {
        y: 0,
        opacity: 1,
        stagger: 0.1,
        delay: 0.85,
        duration: 1,
        ease: "power3.out"
      });

      gsap.to(socialLinks, {
        y: 0,
        opacity: 1,
        stagger: 0.05,
        delay: 0.85,
        duration: 1,
        ease: "power3.out"
      });

      // Animate subscribe links
      gsap.to(subscribeLinks, {
        y: 0,
        opacity: 1,
        stagger: 0.05,
        delay: 0.9,
        duration: 1,
        ease: "power3.out"
      });

      gsap.to('.video-wrapper', {
        clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
        ease: "hop",
        duration: 1.5,
        delay: 0.5
      });

      gsap.to(headerSpans, {
        rotateY: 0,
        stagger: 0.05,
        delay: 0.75,
        duration: 1.5,
        ease: "power4.out"
      });

      gsap.to(headerSpans, {
        y: 0,
        scale: 1,
        stagger: 0.05,
        delay: 0.5,
        duration: 1.5,
        ease: "power4.out"
      });
    } else {
      gsap.to(menu, {
        clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)",
        ease: "hop",
        duration: 1.5,
        onComplete: () => {
          menu.style.pointerEvents = "none";
          gsap.set(menu, {
            clipPath: "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)"
          });
          gsap.set(links, { y: 30, opacity: 0 });
          gsap.set(socialLinks, { y: 30, opacity: 0 });
          gsap.set('.video-wrapper', {
            clipPath: "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)"
          });
          gsap.set(headerSpans, {
            y: 500,
            rotateY: 90,
            scale: 0.8
          });
        }
      });
    }
  }
}











