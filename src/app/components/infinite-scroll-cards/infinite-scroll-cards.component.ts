import { Component, AfterViewInit, ElementRef, ViewChild, NgZone, OnDestroy, Input } from '@angular/core';
import { PdfImageService } from '../../services/pdf-image.service';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

@Component({
  standalone: false,
  selector: 'app-infinite-scroll-cards',
  templateUrl: './infinite-scroll-cards.component.html',
  styleUrls: ['./infinite-scroll-cards.component.scss']
})
export class InfiniteScrollCardsComponent implements AfterViewInit, OnDestroy {
  @ViewChild('spotlight') spotlightRef!: ElementRef;
  @ViewChild('titlesContainer') titlesContainerRef!: ElementRef;
  @ViewChild('imagesContainer') imagesContainerRef!: ElementRef;
  @ViewChild('spotlightHeader') spotlightHeaderRef!: ElementRef;
  @ViewChild('titlesContainerElement') titlesContainerElementRef!: ElementRef;
  @ViewChild('bgImg') bgImgRef!: ElementRef;

  @Input() pdfId: string = 'latest-issue';
  @Input() cardCount: number = 5;

  spotlightItems: { name: string, img: string }[] = [];
  private lenis: any;
  private scrollTrigger: any;
  private animationFrameId: any;
  private currentActiveIndex = 0;
  private imagesLoaded = 0;

  constructor(private ngZone: NgZone, private pdfImageService: PdfImageService) {}

  ngAfterViewInit() {
    // Fetch images from PdfImageService
    this.pdfImageService.getPageImages(this.pdfId, this.cardCount).subscribe(imagePaths => {
      // Use page numbers as names for demo; replace with real names if available
      this.spotlightItems = imagePaths.map((img, idx) => ({
        name: `Page ${idx + 1}`,
        img
      }));
      // Wait for Angular to render the DOM
      setTimeout(() => {
        if (this.spotlightItems.length === 0) return;
        this.imagesLoaded = 0;
      }, 100); // Increased delay for better DOM readiness
    });
  }

  onImageLoad() {
    this.imagesLoaded++;
    if (this.imagesLoaded === this.spotlightItems.length) {
      this.ngZone.runOutsideAngular(() => {
        this.initLenis();
        this.initGsapSpotlight();
      });
    }
  }

  ngOnDestroy() {
    if (this.scrollTrigger) this.scrollTrigger.kill();
    if (this.lenis) this.lenis.destroy();
    if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
    ScrollTrigger.getAll().forEach(trigger => trigger.kill());
  }

  private initLenis() {
    this.lenis = new Lenis();
    this.lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => this.lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  private initGsapSpotlight() {
    const config = {
      gap: 0.07, /* Adjusted to 0.06 for better spacing - not too tight, not too far */
      speed: 0.3,
      arcRadius: 500,
    };

    const titlesContainer = this.titlesContainerRef.nativeElement;
    const imagesContainer = this.imagesContainerRef.nativeElement;
    const spotlightHeader = this.spotlightHeaderRef.nativeElement;
    const titlesContainerElement = this.titlesContainerElementRef.nativeElement;
    const bgImg = this.bgImgRef.nativeElement;
    // No more intro text elements
    const imageElements = Array.from(imagesContainer.querySelectorAll('.spotlight-img')) as HTMLElement[];
    const titleElements = Array.from(titlesContainer.querySelectorAll('h1')) as HTMLElement[];
    const mainSection = this.spotlightRef.nativeElement.querySelector('.spotlight-main-section');

    // Get the new line elements
    const lineTop = this.spotlightRef.nativeElement.querySelector('.spotlight-line-top') as HTMLElement;
    const lineBottom = this.spotlightRef.nativeElement.querySelector('.spotlight-line-bottom') as HTMLElement;

    const containerWidth = 400; /* Fixed width instead of viewport-based */
    const containerHeight = Math.max(window.innerHeight, 600); /* Use actual container height */
    const arcStartX = containerWidth - 150;
    const arcStartY = -150; /* Start higher for more space */
    const arcEndY = containerHeight + 150; /* End lower for more space */
    const arcControlPointX = arcStartX + (config.arcRadius * 0.5); /* Smaller arc */
    const arcControlPointY = containerHeight / 2;

    function getBezierPosition(t: number) {
      const x =
        (1 - t) * (1 - t) * arcStartX +
        2 * (1 - t) * t * arcControlPointX +
        t * t * arcStartX;
      const y =
        (1 - t) * (1 - t) * arcStartY +
        2 * (1 - t) * t * arcControlPointY +
        t * t * arcEndY;
      return { x, y };
    }

    function getImgProgressState(index: number, overallProgress: number) {
      const startTime = index * config.gap;
      const endTime = startTime + config.speed;
      if (overallProgress < startTime) return -1;
      if (overallProgress > endTime) return 2;
      return (overallProgress - startTime) / config.speed;
    }

    // Initialize all elements to their starting states
    imageElements.forEach((img: HTMLElement) => gsap.set(img, { opacity: 0 }));

    // Set initial states for proper visibility
    gsap.set(this.spotlightRef.nativeElement, { opacity: 1, visibility: 'visible' });
    gsap.set(mainSection, { opacity: 1 }); // Main section always visible

    // Set background image initial state (visible)
    gsap.set(bgImg, { scale: 1 }); // Background always visible
    gsap.set(bgImg.querySelector('img'), { scale: 1 });

    // Set main section elements initial state (hidden)
    titleElements.forEach((title: HTMLElement, index: number) => {
      title.style.opacity = index === 0 ? "1" : "0.25";
    });

    spotlightHeader.style.opacity = "0";
    gsap.set(lineTop, { opacity: 0 });
    gsap.set(lineBottom, { opacity: 0 });

    this.scrollTrigger = ScrollTrigger.create({
      trigger: this.spotlightRef.nativeElement, /* Target the entire spotlight section */
      start: "top 80%", /* Start when section comes into view */
      end: "bottom 20%", /* End when section leaves view */
      pin: false, /* Disable pinning to avoid position jumps */
      pinSpacing: false,
      scrub: 1, /* Slower scrub for more controlled animation */
      invalidateOnRefresh: true,
      onUpdate: (self: any) => {
        const progress = self.progress;

        if (progress <= 0.05) {
          // Phase 1: Initial state - hide spotlight elements
          imageElements.forEach((img: HTMLElement) => {
            gsap.set(img, { opacity: 0 });
          });
          gsap.set(spotlightHeader, { opacity: 0 });
          gsap.set(lineTop, { opacity: 0 });
          gsap.set(lineBottom, { opacity: 0 });

        } else if (progress > 0.05 && progress <= 0.15) {
          // Phase 2: Quick transition - show Discover text and lines together
          const transitionProgress = (progress - 0.05) / 0.1; // Quick transition

          // Synchronize Discover text and clip-path lines animation
          gsap.set(spotlightHeader, {
            opacity: transitionProgress
          });
          gsap.set(lineTop, { opacity: transitionProgress });
          gsap.set(lineBottom, { opacity: transitionProgress });

        } else if (progress > 0.15 && progress <= 0.95) {
          // Phase 3: Main spotlight animation - scroll through content

          // Keep all spotlight elements visible throughout scrolling
          gsap.set(spotlightHeader, { opacity: 1 });
          gsap.set(lineTop, { opacity: 1 });
          gsap.set(lineBottom, { opacity: 1 });

          // Extended title scrolling animation - use most of the scroll range
          const switchProgress = (progress - 0.15) / 0.8; // Use 80% of scroll for content
          const containerHeight = Math.max(window.innerHeight, 600);
          const titlesContainerHeight = titlesContainer.scrollHeight || 500;
          const startPosition = containerHeight;
          const targetPosition = -titlesContainerHeight;
          const totalDistance = startPosition - targetPosition;
          const currentY = startPosition - switchProgress * totalDistance;

          gsap.set(titlesContainer, {
            y: currentY
          });

          imageElements.forEach((img: HTMLElement, index: number) => {
            const imageProgress = getImgProgressState(index, switchProgress);

            if (imageProgress < 0 || imageProgress > 1) {
              gsap.to(img, { opacity: 0, duration: 0.1, ease: "none" });
            } else {
              const pos = getBezierPosition(imageProgress);
              gsap.to(img, {
                x: pos.x - 100,
                y: pos.y - 75,
                opacity: 1,
                duration: 0.1,
                ease: "none"
              });
            }
          });

          const viewportMiddle = containerHeight / 2;
          let closestIndex = 0;
          let closestDistance = Infinity;

          titleElements.forEach((title: HTMLElement, index: number) => {
            const titleRect = title.getBoundingClientRect();
            const titleCenter = titleRect.top + titleRect.height / 2;
            const distanceFromCenter = Math.abs(titleCenter - viewportMiddle);

            if (distanceFromCenter < closestDistance) {
              closestDistance = distanceFromCenter;
              closestIndex = index;
            }
          });

          if (closestIndex !== this.currentActiveIndex) {
            if (titleElements[this.currentActiveIndex]) {
              gsap.to(titleElements[this.currentActiveIndex], {
                opacity: 0.25,
                duration: 0.2,
                ease: "power2.out"
              });
            }
            gsap.to(titleElements[closestIndex], {
              opacity: 1,
              duration: 0.2,
              ease: "power2.out"
            });

            // Background image is now static - no dynamic updates
            this.currentActiveIndex = closestIndex;
          }
        } else if (progress > 0.95) {
          spotlightHeader.style.opacity = "0";
          gsap.set(lineTop, { opacity: 0 });
          gsap.set(lineBottom, { opacity: 0 });
        }
      },
    });
  }
}
