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
  private scroller = {
    target: 0,
    current: 0,
    ease: 0.05,
    height: 0,
    touchStartY: 0,
    touchStartX: 0,
    isTouching: false,
    setHeight: () => {
      document.body.style.height = `${this.scroller.height}px`;
    },
    resize: () => {
      const content = this.elementRef.nativeElement.querySelector('.smooth-scroll-content');
      const footer = this.elementRef.nativeElement.querySelector('.parallax-footer');

      // Get content height
      let contentHeight = content.getBoundingClientRect().height;

      // Add extra scroll space to fully reveal the footer
      // This ensures we can scroll far enough to see the entire footer
      if (footer) {
        const footerHeight = footer.getBoundingClientRect().height;
        // Add the footer height to the total scroll height
        // This allows scrolling to fully reveal the footer
        contentHeight += footerHeight;

        // No buffer needed as it was causing a gap
        // contentHeight += 50; // Removed 50px buffer
      }

      this.scroller.height = contentHeight;
      this.scroller.setHeight();
    }
  };
  showComponents = false;
  isHomePage = false;
  isAtLastSection = false;

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
      seen => this.showComponents = seen
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

    // Wait for content to load
    setTimeout(() => {
      this.initScroller();
      if (this.isHomePage) {
        this.setupScrollListener();
      }

      // Connect scroll service to app component's resize method
      this.scrollService.resizeCallback = () => {
        this.scroller.resize();
      };
    }, 200);
  }

  private initScroller() {
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
    observer.observe(content, {
      childList: true,
      subtree: true
    });
  }

  private render = () => {
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
        // This allows us to enable pointer events on the footer
        if (scrollProgress > 0.7) {
          document.body.classList.add('footer-revealed');
        } else {
          document.body.classList.remove('footer-revealed');
        }

        // Removed scroll indicator logic
      }
    }
  };

  @HostListener('window:resize')
  onResize() {
    this.scroller.resize();
  }

  @HostListener('window:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    const SCROLL_AMOUNT = 60; // Regular scroll amount
    const PAGE_SCROLL_AMOUNT = window.innerHeight * 0.9; // 90% of viewport height

    switch (event.key) {
      case 'ArrowDown':
        window.scrollBy(0, SCROLL_AMOUNT);
        event.preventDefault();
        break;
      case 'ArrowUp':
        window.scrollBy(0, -SCROLL_AMOUNT);
        event.preventDefault();
        break;
      case 'PageDown':
        window.scrollBy(0, PAGE_SCROLL_AMOUNT);
        event.preventDefault();
        break;
      case 'PageUp':
        window.scrollBy(0, -PAGE_SCROLL_AMOUNT);
        event.preventDefault();
        break;
      case 'Home':
        window.scrollTo(0, 0);
        event.preventDefault();
        break;
      case 'End':
        window.scrollTo(0, this.scroller.height);
        event.preventDefault();
        break;
      case ' ': // Spacebar
        if (event.shiftKey) {
          window.scrollBy(0, -PAGE_SCROLL_AMOUNT);
        } else {
          window.scrollBy(0, PAGE_SCROLL_AMOUNT);
        }
        event.preventDefault();
        break;
    }
  }

  @HostListener('window:wheel', ['$event'])
  onWheel(event: WheelEvent) {
    window.scrollBy(0, event.deltaY);
    event.preventDefault();
  }

  @HostListener('touchstart', ['$event'])
  onTouchStart(event: TouchEvent) {
    if (event.touches.length === 1) {
      this.scroller.touchStartY = event.touches[0].clientY;
      this.scroller.touchStartX = event.touches[0].clientX;
      this.scroller.isTouching = true;
    }
  }

  @HostListener('touchmove', ['$event'])
  onTouchMove(event: TouchEvent) {
    if (!this.scroller.isTouching) return;

    if (event.touches.length === 1) {
      const touchY = event.touches[0].clientY;
      const touchX = event.touches[0].clientX;

      // Calculate delta Y (vertical movement)
      const deltaY = this.scroller.touchStartY - touchY;

      // Calculate delta X (horizontal movement)
      const deltaX = this.scroller.touchStartX - touchX;

      // If vertical scrolling is more significant than horizontal
      if (Math.abs(deltaY) > Math.abs(deltaX)) {
        // Scroll the page
        window.scrollBy(0, deltaY);

        // Update touch start position for continuous scrolling
        this.scroller.touchStartY = touchY;
        this.scroller.touchStartX = touchX;

        // Prevent default to avoid browser's native scrolling
        event.preventDefault();
      }
    }
  }

  @HostListener('touchend')
  onTouchEnd() {
    this.scroller.isTouching = false;
  }

  @HostListener('touchcancel')
  onTouchCancel() {
    this.scroller.isTouching = false;
  }

  // Clean navigation ball methods
  private setupScrollListener() {
    window.addEventListener('scroll', () => {
      this.checkLastSection();
    });
  }

  private checkLastSection() {
    const testimonialsElement = document.querySelector('app-testimonials');
    if (testimonialsElement) {
      const rect = testimonialsElement.getBoundingClientRect();
      const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
      this.isAtLastSection = isVisible;
    }
  }

  scrollToNextSection() {
    if (this.isAtLastSection) {
      // Use the app's scroll system to go to top - don't interfere with parallax
      this.scrollToPosition(0);
      return;
    }

    // Define sections in order
    const sections = [
      'app-latest-issue',
      'app-issue-highlights',
      'app-editors-note',
      'app-featured-articles',
      'app-subscription',
      'app-testimonials'
    ];

    // Find next section to scroll to
    const currentScroll = window.scrollY + window.innerHeight / 2;

    for (const sectionSelector of sections) {
      const element = document.querySelector(sectionSelector);
      if (element) {
        const rect = element.getBoundingClientRect();
        const elementTop = rect.top + window.scrollY;

        if (elementTop > currentScroll) {
          // Use the app's scroll system instead of native scrollIntoView
          this.scrollToPosition(elementTop);
          return;
        }
      }
    }
  }

  private scrollToPosition(targetY: number) {
    // Use the app's smooth scrolling system to avoid interfering with parallax
    const startY = window.scrollY;
    const distance = targetY - startY;
    const duration = 1000; // 1 second
    let startTime: number | null = null;

    const animateScroll = (currentTime: number) => {
      if (startTime === null) startTime = currentTime;
      const timeElapsed = currentTime - startTime;
      const progress = Math.min(timeElapsed / duration, 1);

      // Easing function for smooth animation
      const easeInOutCubic = (t: number) => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
      const easedProgress = easeInOutCubic(progress);

      const currentY = startY + (distance * easedProgress);
      window.scrollTo(0, currentY);

      if (progress < 1) {
        requestAnimationFrame(animateScroll);
      }
    };

    requestAnimationFrame(animateScroll);
  }
}