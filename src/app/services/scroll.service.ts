import { Injectable } from '@angular/core';
import { AnimationService } from './animation.service';

@Injectable({ providedIn: 'root' })
export class ScrollService {
  resizeCallback: (() => void) | null = null;
  
  private isScrolling = false;
  private scrollTimeout: any;
  private bounceElements: HTMLElement[] = [];
  private scrollIndicators: HTMLElement[] = [];

  constructor(private animationService: AnimationService) {
    this.initSmoothScrolling();
    this.setupScrollFeedback();
  }

  triggerResize() {
    if (this.resizeCallback) {
      this.resizeCallback();
    }
  }

  private initSmoothScrolling() {
    // Disable native smooth scrolling to implement custom momentum
    const style = document.createElement('style');
    style.textContent = `
      html {
        scroll-behavior: auto;
      }
      
      /* Custom scrollbar */
      ::-webkit-scrollbar {
        width: 8px;
      }
      
      ::-webkit-scrollbar-track {
        background: rgba(0, 0, 0, 0.1);
        border-radius: 4px;
      }
      
      ::-webkit-scrollbar-thumb {
        background: linear-gradient(45deg, #1b1b1c, #333);
        border-radius: 4px;
        transition: all 0.3s ease;
      }
      
      ::-webkit-scrollbar-thumb:hover {
        background: linear-gradient(45deg, #333, #555);
        transform: scale(1.1);
      }
    `;
    document.head.appendChild(style);
    
    // Initialize momentum scrolling
    this.initMomentumScrolling();
  }

  private initMomentumScrolling() {
    let velocity = 0;
    let lastScrollY = window.pageYOffset;
    let lastTime = Date.now();
    let isAnimating = false;
    let currentTween: gsap.core.Tween | null = null;
    let wheelTimeout: any;
    let accumulatedDelta = 0;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      
      // Kill any existing momentum animation
      if (currentTween) {
        currentTween.kill();
        currentTween = null;
      }

      // Accumulate wheel delta for smoother scrolling
      accumulatedDelta += e.deltaY;
      
      // Clear existing timeout
      clearTimeout(wheelTimeout);
      
      // Set timeout to apply momentum after wheel stops
      wheelTimeout = setTimeout(() => {
        // Calculate momentum based on accumulated delta
        const currentScrollY = window.pageYOffset;
        const maxScrollY = document.documentElement.scrollHeight - window.innerHeight;
        
        // Create momentum effect - scroll continues for ~1 second after stopping
        const momentumDistance = accumulatedDelta * 0.5; // Reduce momentum strength
        let targetScrollY = currentScrollY + momentumDistance;
        
        // Clamp to boundaries
        targetScrollY = Math.max(0, Math.min(maxScrollY, targetScrollY));
        
        // Apply momentum scrolling with AnimationService
        currentTween = this.animationService.smoothScrollTo(targetScrollY, {
          duration: 1.0, // 1 second momentum continuation
          ease: "power2.out",
          onComplete: () => {
            // Add subtle bounce effect at boundaries
            if (targetScrollY <= 0 || targetScrollY >= maxScrollY) {
              this.animationService.createBounceEffect(targetScrollY, targetScrollY <= 0);
            }
          }
        });
        
        // Reset accumulated delta
        accumulatedDelta = 0;
      }, 100); // Wait 100ms after wheel stops to apply momentum

      // Immediate scroll response (smaller amount for responsiveness)
      const currentScrollY = window.pageYOffset;
      const maxScrollY = document.documentElement.scrollHeight - window.innerHeight;
      const immediateScroll = e.deltaY * 0.8; // Immediate scroll amount
      let immediateTarget = currentScrollY + immediateScroll;
      
      // Clamp immediate scroll
      immediateTarget = Math.max(0, Math.min(maxScrollY, immediateTarget));
      
      // Apply immediate scroll
      window.scrollTo(0, immediateTarget);
    };

    const handleTouchStart = (e: TouchEvent) => {
      lastScrollY = window.pageYOffset;
      lastTime = Date.now();
      velocity = 0;
      
      // Kill any existing animation
      if (currentTween) {
        currentTween.kill();
        currentTween = null;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      const currentTime = Date.now();
      const currentScrollY = window.pageYOffset;
      const deltaTime = currentTime - lastTime;
      const deltaY = currentScrollY - lastScrollY;
      
      if (deltaTime > 0) {
        velocity = (deltaY / deltaTime) * 16; // Convert to pixels per frame
      }
      
      lastScrollY = currentScrollY;
      lastTime = currentTime;
    };

    const handleTouchEnd = () => {
      // Apply momentum using AnimationService after touch ends
      if (Math.abs(velocity) > 2) {
        const currentScrollY = window.pageYOffset;
        currentTween = this.animationService.createMomentumScroll(velocity, currentScrollY);
      }
    };

    // Add event listeners
    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });
  }

  private setupScrollFeedback() {
    // Scroll feedback setup - indicators removed
  }

  private showScrollFeedback() {
    if (!this.isScrolling) {
      this.isScrolling = true;
      // Just track scrolling state without bounce effects
    }
  }

  private hideScrollFeedback() {
    this.isScrolling = false;
  }


  // Enhanced smooth scroll to section
  scrollToSection(selector: string, offset: number = 0) {
    const element = document.querySelector(selector) as HTMLElement;
    if (!element) return;

    const rect = element.getBoundingClientRect();
    const targetPosition = rect.top + window.pageYOffset - offset;

    // Use AnimationService for coordinated scrolling
    this.animationService.smoothScrollTo(targetPosition, {
      duration: 1.2,
      ease: "power2.out"
    });
  }

  private addBounceEffect(element: HTMLElement) {
    element.classList.add('scroll-bounce');
    setTimeout(() => {
      element.classList.remove('scroll-bounce');
    }, 600);
  }

  private addScrollCompleteBounce() {
    // Create a temporary bounce indicator
    const bounceIndicator = document.createElement('div');
    bounceIndicator.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      width: 40px;
      height: 40px;
      background: linear-gradient(45deg, #1b1b1c, #e6f03a);
      border-radius: 50%;
      z-index: 1003;
      animation: bounceComplete 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
      pointer-events: none;
    `;

    const style = document.createElement('style');
    style.textContent = `
      @keyframes bounceComplete {
        0% { transform: scale(0) rotate(0deg); opacity: 0; }
        50% { transform: scale(1.2) rotate(180deg); opacity: 1; }
        100% { transform: scale(0) rotate(360deg); opacity: 0; }
      }
    `;
    document.head.appendChild(style);

    document.body.appendChild(bounceIndicator);

    setTimeout(() => {
      document.body.removeChild(bounceIndicator);
      document.head.removeChild(style);
    }, 600);
  }

  // Add scroll-triggered animations
  addScrollAnimation(selector: string, animationClass: string, offset: number = 100) {
    const elements = document.querySelectorAll(selector);
    
    const checkAnimation = () => {
      elements.forEach((element: any) => {
        const rect = element.getBoundingClientRect();
        const isVisible = rect.top < window.innerHeight - offset && rect.bottom > offset;
        
        if (isVisible && !element.classList.contains(animationClass)) {
          element.classList.add(animationClass);
        }
      });
    };

    window.addEventListener('scroll', checkAnimation);
    checkAnimation(); // Check on initialization
    
    return checkAnimation;
  }

  // Cleanup method
  destroy() {
    // Remove created elements
    const elementsToRemove = [
      '.scroll-progress',
      '.scroll-indicator'
    ];

    elementsToRemove.forEach(selector => {
      const element = document.querySelector(selector);
      if (element) {
        element.remove();
      }
    });
  }
}
