import { Component, OnInit, ElementRef, HostListener } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { AnimationService } from './services/animation.service';
import { ScrollService } from './services/scroll.service'; // <-- import the service
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
      //let contentHeight = content.getBoundingClientRect().height;
      
      this.scroller.height = contentHeight;
      this.scroller.setHeight();

      console.log('Content height:', content.getBoundingClientRect().height);
      if (footer) {
        console.log('Footer height:', footer.getBoundingClientRect().height);
      }

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

  constructor(
    private elementRef: ElementRef,
    private router: Router,
    private animationService: AnimationService,
    private scrollService: ScrollService // <-- inject the service
  ) {
    router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  }

  ngOnInit() {
    // Track preloader state
    this.animationService.hasSeenPreloader$.subscribe(
      seen => this.showComponents = seen
    );

    // Reset preloader on navigation
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.animationService.resetPreloader();
    });

    // Wait for content to load
    setTimeout(() => {
      this.initScroller();
    }, 200);

    this.scrollService.resizeCallback = this.scroller.resize;
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
}



