import { Component, OnInit, ElementRef, HostListener } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { AnimationService } from './services/animation.service';
import { ScrollService } from './services/scroll.service';
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
      
      this.scroller.height = contentHeight;
      this.scroller.setHeight();

      console.log('Content height:', content.getBoundingClientRect().height);
      if (footer) {
        console.log('Footer height:', footer.getBoundingClientRect().height);
      }

      // Add extra scroll space to fully reveal the footer
      if (footer) {
        const footerHeight = footer.getBoundingClientRect().height;
        // Add the footer height to the total scroll height
        this.scroller.height = contentHeight + footerHeight;
        this.scroller.setHeight();
      }

      console.log(this.scroller);

      this.scroller.height = contentHeight;
      this.scroller.setHeight();
    }
  };
  showComponents = true;

  constructor(
    private elementRef: ElementRef,
    private router: Router,
    private animationService: AnimationService,
    private scrollService: ScrollService
  ) {
    this.scrollService.setScroller(this.scroller);
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
      // Reset scroll position on navigation
      this.scroller.target = 0;
      this.scroller.current = 0;
      window.scrollTo(0, 0);
    });

    // Initialize smooth scrolling
    this.initSmoothScrolling();
  }

  private initSmoothScrolling() {
    // Set up smooth scrolling
    const update = () => {
      if (!this.scroller.isTouching) {
        this.scroller.current += (this.scroller.target - this.scroller.current) * this.scroller.ease;
        
        const content = this.elementRef.nativeElement.querySelector('.smooth-scroll-content');
        if (content) {
          gsap.set(content, {
            y: -this.scroller.current
          });
        }
      }
      requestAnimationFrame(update);
    };
    update();

    // Handle scroll events
    this.handleScrollEvents();
  }

  private handleScrollEvents() {
    let ticking = false;

    const updateScroll = () => {
      this.scroller.target = window.pageYOffset;
      ticking = false;
    };

    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(updateScroll);
        ticking = true;
      }
    });
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.scroller.resize();
  }

  // Touch event handlers
  onTouchStart(event: TouchEvent) {
    this.scroller.isTouching = true;
    this.scroller.touchStartY = event.touches[0].clientY;
    this.scroller.touchStartX = event.touches[0].clientX;
  }

  onTouchMove(event: TouchEvent) {
    if (!this.scroller.isTouching) return;

    const touchY = event.touches[0].clientY;
    const touchX = event.touches[0].clientX;
    const deltaY = this.scroller.touchStartY - touchY;
    const deltaX = this.scroller.touchStartX - touchX;

    // Only handle vertical scrolling if it's more significant than horizontal
    if (Math.abs(deltaY) > Math.abs(deltaX)) {
      event.preventDefault();
      this.scroller.target += deltaY * 2; // Multiply for faster scrolling
      this.scroller.target = Math.max(0, Math.min(this.scroller.target, this.scroller.height - window.innerHeight));
    }

    this.scroller.touchStartY = touchY;
    this.scroller.touchStartX = touchX;
  }

  onTouchEnd() {
    this.scroller.isTouching = false;
  }

  onTouchCancel() {
    this.scroller.isTouching = false;
  }
}
