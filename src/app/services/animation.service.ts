import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { gsap } from 'gsap';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import { TextPlugin } from 'gsap/TextPlugin';

// Register GSAP plugins
gsap.registerPlugin(ScrollToPlugin, TextPlugin);

export interface AnimationConfig {
  duration?: number;
  ease?: string;
  delay?: number;
  stagger?: number;
  onComplete?: () => void;
  onStart?: () => void;
}

@Injectable({ providedIn: 'root' })
export class AnimationService {
  private masterTimeline: gsap.core.Timeline;
  private activeAnimations: Map<string, gsap.core.Tween | gsap.core.Timeline> = new Map();
  private scrollTween: gsap.core.Tween | null = null;

  // Preloader state management
  private hasSeenPreloaderSubject = new BehaviorSubject<boolean>(false);
  private preloaderCompleteSubject = new Subject<void>();

  public hasSeenPreloader$ = this.hasSeenPreloaderSubject.asObservable();
  public preloaderComplete$ = this.preloaderCompleteSubject.asObservable();

  constructor() {
    // Create master timeline for coordinated animations
    this.masterTimeline = gsap.timeline({ paused: true });
    this.setupGlobalAnimationSettings();
    this.initializePreloaderState();
  }

  private initializePreloaderState() {
    // Check if user has seen preloader before (localStorage)
    const hasSeenPreloader = localStorage.getItem('hasSeenPreloader') === 'true';
    
    // Only show preloader on home page and if user hasn't seen it
    const isHomePage = window.location.pathname === '/' || window.location.pathname === '/home';
    const shouldShowPreloader = !hasSeenPreloader && isHomePage;
    
    // Set the state - true means user has seen it (don't show), false means show it
    this.hasSeenPreloaderSubject.next(hasSeenPreloader);
  }

  private setupGlobalAnimationSettings() {
    // Set global GSAP defaults
    gsap.defaults({
      duration: 0.8,
      ease: "power2.out"
    });

    // Configure GSAP for better performance
    gsap.config({
      force3D: true,
      nullTargetWarn: false
    });
  }

  // === SCROLL ANIMATIONS ===
  
  smoothScrollTo(target: number | string | Element, config: AnimationConfig = {}): gsap.core.Tween {
    // Kill existing scroll animation
    if (this.scrollTween) {
      this.scrollTween.kill();
    }

    const defaultConfig = {
      duration: 1.2,
      ease: "power2.out",
      ...config
    };

    this.scrollTween = gsap.to(window, {
      ...defaultConfig,
      scrollTo: { y: target, autoKill: false },
      onComplete: () => {
        this.scrollTween = null;
        config.onComplete?.();
      }
    });

    return this.scrollTween;
  }

  createMomentumScroll(velocity: number, currentPosition: number): gsap.core.Tween {
    // Detect if we're on a mobile device
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    // On mobile devices, don't apply custom momentum scrolling to avoid vibration
    if (isMobile) {
      return gsap.to(window, {
        duration: 0.1, // Minimal duration for immediate stop
        scrollTo: { y: currentPosition }
      });
    }
    
    const maxScrollY = document.documentElement.scrollHeight - window.innerHeight;
    const momentumDistance = velocity * 8;
    let targetScrollY = currentPosition + momentumDistance;
    
    // Handle boundaries with bounce
    let bounceBack = false;
    if (targetScrollY < 0) {
      targetScrollY = -50;
      bounceBack = true;
    } else if (targetScrollY > maxScrollY) {
      targetScrollY = maxScrollY + 50;
      bounceBack = true;
    }

    const tween = gsap.to(window, {
      duration: 1.5,
      scrollTo: { y: targetScrollY },
      ease: "power3.out",
      onComplete: () => {
        if (bounceBack) {
          const validPosition = Math.max(0, Math.min(maxScrollY, targetScrollY));
          gsap.to(window, {
            duration: 0.6,
            scrollTo: { y: validPosition },
            ease: "elastic.out(1, 0.5)"
          });
        }
      }
    });

    this.scrollTween = tween;
    return tween;
  }

  createBounceEffect(position: number, isTop: boolean): gsap.core.Tween {
    // Detect if we're on a mobile device
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    // On mobile devices, don't apply bounce effects to avoid vibration
    if (isMobile) {
      return gsap.to(window, {
        duration: 0.1,
        scrollTo: { y: position }
      });
    }
    
    const bounceDistance = isTop ? 20 : -20;
    return gsap.to(window, {
      duration: 0.4,
      scrollTo: { y: position + bounceDistance },
      ease: "power2.out",
      yoyo: true,
      repeat: 1
    });
  }

  // === ELEMENT ANIMATIONS ===

  fadeIn(elements: string | Element | Element[], config: AnimationConfig = {}): gsap.core.Tween {
    const id = `fadeIn_${Date.now()}`;
    const tween = gsap.fromTo(elements, 
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: config.duration || 0.8,
        ease: config.ease || "power2.out",
        stagger: config.stagger || 0.1,
        delay: config.delay || 0,
        onComplete: config.onComplete,
        onStart: config.onStart
      }
    );
    
    this.activeAnimations.set(id, tween);
    return tween;
  }

  slideInFromLeft(elements: string | Element | Element[], config: AnimationConfig = {}): gsap.core.Tween {
    const id = `slideInLeft_${Date.now()}`;
    const tween = gsap.fromTo(elements,
      { x: -100, opacity: 0 },
      {
        x: 0,
        opacity: 1,
        duration: config.duration || 0.8,
        ease: config.ease || "power2.out",
        stagger: config.stagger || 0.1,
        delay: config.delay || 0,
        onComplete: config.onComplete
      }
    );

    this.activeAnimations.set(id, tween);
    return tween;
  }

  slideInFromRight(elements: string | Element | Element[], config: AnimationConfig = {}): gsap.core.Tween {
    const id = `slideInRight_${Date.now()}`;
    const tween = gsap.fromTo(elements,
      { x: 100, opacity: 0 },
      {
        x: 0,
        opacity: 1,
        duration: config.duration || 0.8,
        ease: config.ease || "power2.out",
        stagger: config.stagger || 0.1,
        delay: config.delay || 0,
        onComplete: config.onComplete
      }
    );

    this.activeAnimations.set(id, tween);
    return tween;
  }

  scaleIn(elements: string | Element | Element[], config: AnimationConfig = {}): gsap.core.Tween {
    const id = `scaleIn_${Date.now()}`;
    const tween = gsap.fromTo(elements,
      { scale: 0, opacity: 0 },
      {
        scale: 1,
        opacity: 1,
        duration: config.duration || 0.6,
        ease: config.ease || "back.out(1.7)",
        stagger: config.stagger || 0.1,
        delay: config.delay || 0,
        onComplete: config.onComplete
      }
    );

    this.activeAnimations.set(id, tween);
    return tween;
  }

  // === TEXT ANIMATIONS ===

  typeWriter(element: string | Element, text: string, config: AnimationConfig = {}): gsap.core.Tween {
    const id = `typeWriter_${Date.now()}`;
    const tween = gsap.to(element, {
      duration: config.duration || 2,
      text: text,
      ease: "none",
      delay: config.delay || 0,
      onComplete: config.onComplete
    });

    this.activeAnimations.set(id, tween);
    return tween;
  }

  // === HOVER ANIMATIONS ===

  createHoverEffect(element: string | Element, config: {
    scale?: number;
    y?: number;
    duration?: number;
    ease?: string;
  } = {}): void {
    const target = typeof element === 'string' ? document.querySelector(element) : element;
    if (!target) return;

    const hoverConfig = {
      scale: config.scale || 1.05,
      y: config.y || -5,
      duration: config.duration || 0.3,
      ease: config.ease || "power2.out"
    };

    target.addEventListener('mouseenter', () => {
      gsap.to(target, {
        scale: hoverConfig.scale,
        y: hoverConfig.y,
        duration: hoverConfig.duration,
        ease: hoverConfig.ease
      });
    });

    target.addEventListener('mouseleave', () => {
      gsap.to(target, {
        scale: 1,
        y: 0,
        duration: hoverConfig.duration,
        ease: hoverConfig.ease
      });
    });
  }

  // === SCROLL-TRIGGERED ANIMATIONS ===

  createScrollTriggerAnimation(
    elements: string | Element | Element[],
    animationType: 'fadeIn' | 'slideInLeft' | 'slideInRight' | 'scaleIn',
    config: AnimationConfig & { offset?: number } = {}
  ): () => void {
    const offset = config.offset || 100;
    const elementsArray = typeof elements === 'string' 
      ? Array.from(document.querySelectorAll(elements))
      : Array.isArray(elements) ? elements : [elements];

    const checkAnimation = () => {
      elementsArray.forEach((element: Element) => {
        const rect = element.getBoundingClientRect();
        const isVisible = rect.top < window.innerHeight - offset && rect.bottom > offset;
        
        if (isVisible && !element.classList.contains('animated')) {
          element.classList.add('animated');
          
          switch (animationType) {
            case 'fadeIn':
              this.fadeIn(element, config);
              break;
            case 'slideInLeft':
              this.slideInFromLeft(element, config);
              break;
            case 'slideInRight':
              this.slideInFromRight(element, config);
              break;
            case 'scaleIn':
              this.scaleIn(element, config);
              break;
          }
        }
      });
    };

    window.addEventListener('scroll', checkAnimation);
    checkAnimation(); // Check on initialization
    
    return checkAnimation;
  }

  // === TIMELINE MANAGEMENT ===

  createTimeline(config: AnimationConfig = {}): gsap.core.Timeline {
    return gsap.timeline({
      duration: config.duration,
      ease: config.ease,
      delay: config.delay,
      onComplete: config.onComplete,
      onStart: config.onStart
    });
  }

  // === UTILITY METHODS ===

  killAnimation(id: string): void {
    const animation = this.activeAnimations.get(id);
    if (animation) {
      animation.kill();
      this.activeAnimations.delete(id);
    }
  }

  killAllAnimations(): void {
    this.activeAnimations.forEach(animation => animation.kill());
    this.activeAnimations.clear();
    
    if (this.scrollTween) {
      this.scrollTween.kill();
      this.scrollTween = null;
    }
  }

  pauseAllAnimations(): void {
    this.activeAnimations.forEach(animation => animation.pause());
    if (this.scrollTween) {
      this.scrollTween.pause();
    }
  }

  resumeAllAnimations(): void {
    this.activeAnimations.forEach(animation => animation.resume());
    if (this.scrollTween) {
      this.scrollTween.resume();
    }
  }

  // === PERFORMANCE OPTIMIZATION ===

  setPerformanceMode(highPerformance: boolean): void {
    if (highPerformance) {
      gsap.config({
        force3D: true,
        nullTargetWarn: false
      });
    } else {
      gsap.config({
        force3D: false
      });
    }
  }

  // === PRELOADER METHODS ===

  setPreloaderSeen(): void {
    localStorage.setItem('hasSeenPreloader', 'true');
    this.hasSeenPreloaderSubject.next(true);
  }

  notifyPreloaderComplete(): void {
    this.preloaderCompleteSubject.next();
  }

  resetPreloader(): void {
    localStorage.removeItem('hasSeenPreloader');
    this.hasSeenPreloaderSubject.next(false);
  }

  // === CLEANUP ===

  destroy(): void {
    this.killAllAnimations();
    this.masterTimeline.kill();
    this.hasSeenPreloaderSubject.complete();
    this.preloaderCompleteSubject.complete();
  }
}
