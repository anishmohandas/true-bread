import { Component, OnInit, ElementRef, HostListener } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { AnimationService } from './services/animation.service';
import { ScrollService } from './services/scroll.service';
import { GoogleAnalyticsService } from './services/google-analytics.service';
import { filter } from 'rxjs/operators';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  // CUSTOM SCROLLING DISABLED - Using native browser scrolling
  // This fixes ScrollTrigger conflicts and horizontal scroll issues
  private customScrollingEnabled = false;
  
  private scroller = {
    target: 0,
    current: 0,
    ease: 0.05,
    height: 0,
    touchStartY: 0,
    touchStartX: 0,
    isTouching: false,
    setHeight: () => {
      // Only set body height if custom scrolling is enabled
      if (this.customScrollingEnabled) {
        document.body.style.height = `${this.scroller.height}px`;
      } else {
        // Reset body height to auto for native scrolling
        document.body.style.height = 'auto';
      }
    },
    resize: () => {
      if (!this.customScrollingEnabled) return;
      
      const content = this.elementRef.nativeElement.querySelector('.smooth-scroll-content');
      const footer = this.elementRef.nativeElement.querySelector('.parallax-footer');

      // Get content height
      let contentHeight = content.getBoundingClientRect().height;

      // Add extra scroll space to fully reveal the footer
      if (footer) {
        const footerHeight = footer.getBoundingClientRect().height;
        contentHeight += footerHeight;
      }

      this.scroller.height = contentHeight;
      this.scroller.setHeight();
    }
  };
  showComponents = false;
  isHomePage = false;
  isAtLastSection = false;
  isMenuOpen = false;

  constructor(
    private elementRef: ElementRef,
    private router: Router,
    private animationService: AnimationService,
    private scrollService: ScrollService,
    private googleAnalytics: GoogleAnalyticsService
  ) {}

  ngOnInit() {
    // Track preloader state
    this.animationService.hasSeenPreloader$.subscribe(
      seen => {
        this.showComponents = seen;
        // Add CSS class to host element, body, and html when components are loaded
        if (seen) {
          this.elementRef.nativeElement.classList.add('components-loaded');
          document.body.classList.add('components-loaded');
          document.documentElement.classList.add('components-loaded');
        } else {
          this.elementRef.nativeElement.classList.remove('components-loaded');
          document.body.classList.remove('components-loaded');
          document.documentElement.classList.remove('components-loaded');
        }
      }
    );

    // Reset preloader on navigation and detect home page
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event) => {
      this.animationService.resetPreloader();
      const navEvent = event as NavigationEnd;
      this.isHomePage = navEvent.url === '/' || navEvent.url === '/home';
    });

    // Initial check for home page
    this.isHomePage = this.router.url === '/' || this.router.url === '/home';

    // Listen for menu state changes
    window.addEventListener('menuStateChange', (event: any) => {
      this.isMenuOpen = event.detail.isOpen;
    });

    // Wait for content to load
    setTimeout(() => {
      this.initNativeScrolling();
      if (this.isHomePage) {
        this.setupScrollListener();
      }

      // Connect scroll service - but disable resize callback since we're using native scrolling
      this.scrollService.resizeCallback = null;
    }, 200);
  }

  private initNativeScrolling() {
    console.log('🔧 Initializing native scrolling (custom scrolling disabled)');
    
    // Reset body and html to allow native scrolling
    document.body.style.height = 'auto';
    document.body.style.overflow = 'auto';
    document.documentElement.style.overflow = 'auto';
    
    // Remove any transform from smooth-scroll-content
    const content = this.elementRef.nativeElement.querySelector('.smooth-scroll-content');
    if (content) {
      gsap.set(content, { y: 0, clearProps: 'transform' });
    }
    
    console.log('✅ Native scrolling enabled');
  }

  // Disabled custom scroller methods - keeping for potential future use
  private initScroller() {
    if (!this.customScrollingEnabled) return;
    
    this.scroller.resize();
    this.render();

    // Update on resize
    window.addEventListener('resize', () => {
      this.scroller.resize();
    });

    // Observe content changes
    const observer = new MutationObserver(() => {
      this.scroller.resize();
    });

    const content = this.elementRef.nativeElement.querySelector('.smooth-scroll-content');
    if (content) {
      observer.observe(content, {
        childList: true,
        subtree: true
      });
    }
  }

  private render = () => {
    if (!this.customScrollingEnabled) return;
    
    // Use requestAnimationFrame at the start to ensure smooth animation
    requestAnimationFrame(this.render);

    this.scroller.target = window.scrollY;
    this.scroller.current = gsap.utils.interpolate(
      this.scroller.current,
      this.scroller.target,
      this.scroller.ease
    );

    const content = this.elementRef.nativeElement.querySelector('.smooth-scroll-content');

    if (content) {
      // Use GSAP's set method with force3D for better performance
      gsap.set(content, {
        y: -this.scroller.current,
        force3D: true
      });

      // Apply parallax effect to footer
      const footer = this.elementRef.nativeElement.querySelector('.parallax-footer');
      if (footer) {
        // Calculate how much of the footer is revealed
        const scrollableHeight = this.scroller.height - window.innerHeight;
        const scrollProgress = this.scroller.current / scrollableHeight;

        // Add a class to the body when the footer is sufficiently revealed
        if (scrollProgress > 0.7) {
          document.body.classList.add('footer-revealed');
        } else {
          document.body.classList.remove('footer-revealed');
        }
      }
    }
  };

  @HostListener('window:resize')
  onResize() {
    if (this.customScrollingEnabled) {
      this.scroller.resize();
    }
  }

  // Disabled custom scroll event handlers - using native scrolling
  @HostListener('window:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    // Allow native keyboard scrolling
    return;
  }

  @HostListener('window:wheel', ['$event'])
  onWheel(event: WheelEvent) {
    // Allow native wheel scrolling
    return;
  }

  @HostListener('touchstart', ['$event'])
  onTouchStart(event: TouchEvent) {
    // Allow native touch scrolling
    return;
  }

  @HostListener('touchmove', ['$event'])
  onTouchMove(event: TouchEvent) {
    // Allow native touch scrolling
    return;
  }

  @HostListener('touchend')
  onTouchEnd() {
    // Allow native touch scrolling
    return;
  }

  @HostListener('touchcancel')
  onTouchCancel() {
    // Allow native touch scrolling
    return;
  }

  // Clean navigation ball methods - updated for native scrolling
  private setupScrollListener() {
    window.addEventListener('scroll', () => {
      this.checkLastSection();
    });
  }

  private checkLastSection() {
    // Check if user has scrolled to the footer area
    const footerElement = document.querySelector('app-footer');
    if (footerElement) {
      const rect = footerElement.getBoundingClientRect();
      // Consider user at last section when footer is visible or when near bottom of page
      const isFooterVisible = rect.top < window.innerHeight;
      const isNearBottom = (window.innerHeight + window.scrollY) >= (document.documentElement.scrollHeight - 100);
      this.isAtLastSection = isFooterVisible || isNearBottom;
    } else {
      // Fallback: check if user is near the bottom of the page
      const isNearBottom = (window.innerHeight + window.scrollY) >= (document.documentElement.scrollHeight - 100);
      this.isAtLastSection = isNearBottom;
    }
  }

  scrollToNextSection() {
    if (this.isAtLastSection) {
      // Scroll to top using native scrolling
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // Define sections in order - removed app-testimonials since it's commented out
    const sections = [
      'app-latest-issue',
      'app-issue-highlights',
      'app-editors-note',
      'app-featured-articles',
      'app-subscription'
    ];

    // Find next section to scroll to
    const currentScroll = window.scrollY + window.innerHeight / 2;

    for (const sectionSelector of sections) {
      const element = document.querySelector(sectionSelector);
      if (element) {
        const rect = element.getBoundingClientRect();
        const elementTop = rect.top + window.scrollY;

        if (elementTop > currentScroll) {
          // Use native smooth scrolling
          window.scrollTo({ top: elementTop, behavior: 'smooth' });
          return;
        }
      }
    }

    // If no next section found, scroll to footer
    const footerElement = document.querySelector('app-footer');
    if (footerElement) {
      const rect = footerElement.getBoundingClientRect();
      const elementTop = rect.top + window.scrollY;
      window.scrollTo({ top: elementTop, behavior: 'smooth' });
    }
  }

  // Removed custom scrollToPosition method - using native scrolling
}
