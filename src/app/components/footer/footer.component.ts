import { Component, OnInit, AfterViewInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SplitType from 'split-type';

// Force register ScrollTrigger plugin
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
  console.log('🔧 FOOTER: ScrollTrigger registered:', !!ScrollTrigger);
}

interface MenuItem {
  text: string;
  link: string;
}

interface SocialLink {
  icon: string;
  url: string;
  alt: string;
  name: string;
}

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('footerContainer', { static: false }) footerContainer!: ElementRef;
  @ViewChild('footerTitle', { static: false }) footerTitle!: ElementRef;

  private splitTexts: SplitType[] = [];
  private animations: gsap.core.Timeline[] = [];

  constructor(private el: ElementRef) {}

  ngOnInit() {
    this.initFooterAnimation();
  }

  ngAfterViewInit(): void {
    // Kill any existing ScrollTrigger instances first
    ScrollTrigger.getAll().forEach(trigger => {
      const triggerElement = trigger.vars.trigger as HTMLElement;
      if (triggerElement && triggerElement.closest && triggerElement.closest('app-footer')) {
        console.log('🗑️ Killing existing footer ScrollTrigger');
        trigger.kill();
      }
    });

    // Initialize split text animation after a delay
    setTimeout(() => {
      this.initializeSplitTextAnimation();
    }, 1000);
  }

  ngOnDestroy(): void {
    this.cleanupAnimations();
  }

  private initFooterAnimation() {
    // Get the footer content element for animation
    const footerContent = this.el.nativeElement.querySelector('.footer-content');

    // Set initial state - make content visible by default
    gsap.set(footerContent, {
      opacity: 1, // Fully visible
      y: 0 // No offset
    });

    // Log for debugging
    console.log('Footer content should be visible');
  }

  private cleanupAnimations(): void {
    console.log('🧹 Cleaning up footer animations and split text instances');
    
    // Clean up animations and split text instances
    this.animations.forEach(animation => animation.kill());
    this.animations = [];
    
    this.splitTexts.forEach(split => split.revert());
    this.splitTexts = [];
    
    // Kill all ScrollTrigger instances for this component
    ScrollTrigger.getAll().forEach(trigger => {
      const triggerElement = trigger.vars.trigger as HTMLElement;
      if (triggerElement && this.footerContainer?.nativeElement?.contains(triggerElement)) {
        trigger.kill();
      }
    });
    
    // Reset any manually created wrappers
    if (this.footerContainer?.nativeElement) {
      const wrappers = this.footerContainer.nativeElement.querySelectorAll('.line-wrapper');
      wrappers.forEach((wrapper: HTMLElement) => {
        const line = wrapper.querySelector('.line');
        if (line && wrapper.parentNode) {
          // Move the line back to its original position
          wrapper.parentNode.insertBefore(line, wrapper);
          wrapper.remove();
        }
      });
    }
  }

  private initializeSplitTextAnimation(): void {
    console.log('🎬 FOOTER: Starting stagger text animation setup');
    
    if (!this.footerTitle?.nativeElement) {
      console.error('❌ FOOTER: Footer title element not found');
      return;
    }

    const titleElement = this.footerTitle.nativeElement;
    console.log('🔍 FOOTER: Title element found:', titleElement);
    console.log('🔍 FOOTER: Title text content:', titleElement.textContent);

    // Skip if element is empty or only contains whitespace
    if (!titleElement.textContent?.trim()) {
      console.log('⏭️ FOOTER: Skipping empty footer title element');
      return;
    }

    // Ensure element is visible initially
    gsap.set(titleElement, { 
      opacity: 1, 
      y: 0,
      clearProps: 'transform'
    });

    // Create split text instance for characters to create stagger effect
    console.log('🔄 FOOTER: Creating SplitType instance for characters...');
    const split = new SplitType(titleElement, {
      types: 'chars',
      tagName: 'span',
      charClass: 'char'
    });

    this.splitTexts.push(split);

    if (!split.chars || split.chars.length === 0) {
      console.warn('⚠️ FOOTER: No characters created for footer title');
      console.log('🔍 FOOTER: Split object:', split);
      return;
    }

    console.log(`📏 FOOTER: Created ${split.chars.length} characters for footer title`);
    console.log('🔍 FOOTER: Characters array:', split.chars);

    // Set initial state for all characters - hidden and ready for stagger animation
    gsap.set(split.chars, {
      opacity: 0,
      y: 50,
      rotationX: -90,
      transformOrigin: '50% 50% -50px'
    });

    // Create a timeline for the stagger animation
    const timeline = gsap.timeline({ paused: true });
    
    // Animate characters with stagger effect
    timeline.to(split.chars, {
      opacity: 1,
      y: 0,
      rotationX: 0,
      duration: 0.8,
      ease: 'back.out(1.7)',
      stagger: {
        amount: 1.2, // Total time for all characters to animate
        from: 'start'
      },
      onStart: () => {
        console.log('🚀 FOOTER: Stagger animation started');
      },
      onComplete: () => {
        console.log('✨ FOOTER: Stagger animation completed');
      }
    });

    // Use Intersection Observer to trigger animation when footer comes into view
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          console.log('🎯 FOOTER: Element is visible - starting stagger animation');
          timeline.play();
          observer.unobserve(entry.target); // Only animate once
        }
      });
    }, {
      threshold: 0.3 // Trigger when 30% visible
    });

    observer.observe(titleElement);
    this.animations.push(timeline);

    console.log('🎭 FOOTER: Stagger text animation setup complete');
  }

  contactInfo = {
    phone: '+91 949 533 6764',
    email: 'contact@thetruebread.com'
  };

  menuItems1: MenuItem[] = [
    { text: 'About', link: '/about' },
    { text: 'Contact', link: '/contact' }
  ];

  menuItems2: MenuItem[] = [
    { text: 'Terms', link: '#' },
    { text: 'Privacy', link: '#' }
  ];

  socialLinks: SocialLink[] = [
    {
      icon: 'assets/images/facebook.svg',
      url: 'https://www.facebook.com/people/True-Bread-Media/61574408447773',
      alt: 'Facebook',
      name: 'Facebook'
    },
    {
      icon: 'assets/images/youtube.svg',
      url: 'https://www.youtube.com/@truebreadmedia',
      alt: 'YouTube',
      name: 'YouTube'
    },
    {
      icon: 'assets/images/instagram.svg',
      url: 'https://www.instagram.com/truebreadmedia/',
      alt: 'Instagram',
      name: 'Instagram'
    }
  ];
}
