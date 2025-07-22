import { Component, OnInit, AfterViewInit, ElementRef, ViewChild, OnDestroy, Input } from '@angular/core';
import { PdfImageService } from '../../services/pdf-image.service';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Define a type for the ScrollTrigger instance
// This helps TypeScript understand the properties and methods available
interface ScrollTriggerInstance {
  isActive: boolean;
  getVelocity(): number;
  // Add other properties/methods as needed
}

@Component({
  selector: 'app-infinite-scroll-cards',
  templateUrl: './infinite-scroll-cards.component.html',
  styleUrls: ['./infinite-scroll-cards.component.scss']
})
export class InfiniteScrollCardsComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('cardsContainer') cardsContainer!: ElementRef;
  @Input() pdfId: string = 'latest-issue';
  @Input() cardCount: number = 5;
  @Input() pdfUrl?: string;

  cards: { id: number, imagePath: string, fallbackPath?: string }[] = [];
  loading: boolean = true;
  error: string | null = null;

  private scrollTween: gsap.core.Animation | null = null;
  private observer: IntersectionObserver | null = null;
  private resizeTimeout: ReturnType<typeof setTimeout> | null = null;
  private currentPanelIndex: number = 0;

  constructor(private pdfImageService: PdfImageService) {
    // Register GSAP plugins
    gsap.registerPlugin(ScrollTrigger);
  }

  ngOnInit(): void {
    this.loadImages();
  }

  /**
   * Handle image loading errors by trying fallback paths
   * @param card The card with the image that failed to load
   */
  handleImageError(card: { id: number, imagePath: string, fallbackPath?: string }): void {
    console.log(`Image failed to load: ${card.imagePath}`);

    // If we have a fallback path, try it
    if (card.fallbackPath) {
      // Fix the URL if it's using the wrong host
      let fixedPath = card.fallbackPath;
      if (fixedPath.includes('localhost:4200/api')) {
        fixedPath = fixedPath.replace('localhost:4200/api', 'localhost:3000/api');
        console.log(`Fixed fallback URL: ${fixedPath}`);
      }

      console.log(`Trying fallback: ${fixedPath}`);
      card.imagePath = fixedPath;
      return;
    }

    // If the image is a JPG, try PNG or SVG as fallbacks
    if (card.imagePath.toLowerCase().endsWith('.jpg')) {
      // First, fix the URL if it's using the wrong host
      let fixedPath = card.imagePath;
      if (fixedPath.includes('localhost:4200/api')) {
        fixedPath = fixedPath.replace('localhost:4200/api', 'localhost:3000/api');
        console.log(`Fixed URL: ${fixedPath}`);
      }

      // Try PNG instead of JPG
      const pngPath = fixedPath.replace(/\.jpg$/i, '.png');
      console.log(`Trying PNG fallback: ${pngPath}`);
      card.imagePath = pngPath;
      return;
    }

    // If the image is a PNG, try SVG
    if (card.imagePath.toLowerCase().endsWith('.png')) {
      // First, fix the URL if it's using the wrong host
      let fixedPath = card.imagePath;
      if (fixedPath.includes('localhost:4200/api')) {
        fixedPath = fixedPath.replace('localhost:4200/api', 'localhost:3000/api');
        console.log(`Fixed URL: ${fixedPath}`);
      }

      // Then try SVG instead of PNG
      const svgPath = fixedPath.replace(/\.png$/i, '.svg');
      console.log(`Trying SVG fallback: ${svgPath}`);
      card.imagePath = svgPath;
      return;
    }

    // If all else fails, use a static placeholder from the assets directory
    const staticPath = `/assets/images/pdf-pages/page_${card.id}.jpg`;
    console.log(`Using static placeholder from assets: ${staticPath}`);
    card.imagePath = staticPath;
  }

  ngAfterViewInit(): void {
    // Set up intersection observer to detect when component is in view
    this.setupIntersectionObserver();

    // Initialize the infinite scroll with a slight delay to ensure DOM is ready
    if (!this.loading && !this.error && this.cards.length > 0) {
      setTimeout(() => {
        this.initInfiniteScroll();
      }, 200);
    }

    // Add window resize listener to reposition panels when window size changes
    window.addEventListener('resize', this.handleResize.bind(this));

    // Add keyboard event listener to handle arrow keys
    window.addEventListener('keydown', this.handleKeyDown.bind(this));
  }

  /**
   * Handle window resize events
   */
  private handleResize(): void {
    // Debounce resize events
    if (this.resizeTimeout) {
      clearTimeout(this.resizeTimeout);
    }

    this.resizeTimeout = setTimeout(() => {
      // Get the panels
      const panels = this.cardsContainer?.nativeElement.querySelectorAll('.panel');
      if (panels && panels.length) {
        // Reposition the panels
        this.positionPanels(panels);
        // Update the current positions
        if (this.currentPanelIndex !== undefined) {
          this.updatePanelPositions(panels, this.currentPanelIndex);
        }
      }
    }, 200);
  }

  ngOnDestroy(): void {
    // Clean up GSAP animations and observers
    if (this.scrollTween) {
      this.scrollTween.kill();
    }

    // Kill all ScrollTrigger instances to prevent memory leaks
    ScrollTrigger.getAll().forEach(trigger => {
      trigger.kill();
    });

    // Disconnect the IntersectionObserver
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }

    // Clear any pending resize timeout
    if (this.resizeTimeout) {
      clearTimeout(this.resizeTimeout);
      this.resizeTimeout = null;
    }

    // Remove event listeners
    window.removeEventListener('resize', this.handleResize.bind(this));
    window.removeEventListener('keydown', this.handleKeyDown.bind(this));
  }

  // Made public so it can be called from the template
  loadImages(): void {
    this.loading = true;

    console.log('Loading images for PDF ID:', this.pdfId);
    console.log('PDF URL:', this.pdfUrl);

    // Fix the PDF URL if it's using the wrong host
    let fixedPdfUrl = this.pdfUrl;
    if (fixedPdfUrl && fixedPdfUrl.includes('localhost:4200/api')) {
      fixedPdfUrl = fixedPdfUrl.replace('localhost:4200/api', 'localhost:3000/api');
      console.log(`Fixed PDF URL: ${fixedPdfUrl}`);
    }

    // Use the PDF URL if available, otherwise use the PDF ID
    this.pdfImageService.getPageImages(this.pdfId, this.cardCount, fixedPdfUrl)
      .subscribe({
        next: (imagePaths) => {
          // Create card objects with fallback handling for image errors
          const originalCards = imagePaths.map((path, index) => {
            // Fix the path if it's using the wrong host
            let fixedPath = path;
            if (fixedPath.includes('localhost:4200/api')) {
              fixedPath = fixedPath.replace('localhost:4200/api', 'localhost:3000/api');
              console.log(`Fixed image path: ${fixedPath}`);
            }

            // Extract the file extension
            const isPng = fixedPath.toLowerCase().endsWith('.png');

            // Create a fallback path (switch between PNG and SVG)
            let fallbackPath = fixedPath;
            if (isPng) {
              // If it's a PNG, create an SVG fallback by changing the extension
              fallbackPath = fixedPath.replace(/\.png$/i, '.svg');
            }

            return {
              id: index + 1,
              imagePath: fixedPath,
              fallbackPath: fallbackPath
            };
          });

          // We need at least 5 cards for the carousel effect
          // If we have fewer, duplicate them until we have at least 5
          let cardsToUse = [...originalCards];
          while (cardsToUse.length < 5) {
            cardsToUse = [...cardsToUse, ...originalCards];
          }

          // Duplicate cards for infinite scrolling effect
          // We need to duplicate them to create a seamless loop
          this.cards = [...cardsToUse, ...cardsToUse];

          this.loading = false;

          // Initialize the scroll after a short delay to ensure DOM is updated
          setTimeout(() => {
            this.initInfiniteScroll();
          }, 300); // Increased delay for better reliability
        },
        error: (err) => {
          console.error('Error loading PDF images:', err);
          this.error = 'Failed to load preview images. Please try again later.';
          this.loading = false;
        }
      });
  }

  private setupIntersectionObserver(): void {
    this.observer = new IntersectionObserver((entries) => {
      // If component is in view, make sure the animation is playing
      if (entries[0].isIntersecting && this.scrollTween) {
        // Play the animation if it exists and is paused
        if (this.scrollTween.paused()) {
          this.scrollTween.play();
        }
      }
    }, { threshold: 0.1 });

    // Start observing the cards container
    if (this.cardsContainer) {
      this.observer.observe(this.cardsContainer.nativeElement);
    }
  }

  private initInfiniteScroll(): void {
    const container = this.cardsContainer.nativeElement;
    const panels = container.querySelectorAll('.panel');

    if (!panels.length) return;

    // Position the panels for the 3D carousel effect
    this.positionPanels(panels);

    // Set initial panel positions
    this.updatePanelPositions(panels, 0);

    // Create a simple infinite scroll animation
    const tl = gsap.timeline({
      repeat: -1,
      paused: true,
      defaults: { ease: "power1.inOut" }
    });

    // Duration for each panel transition
    const duration = 0.8;
    const pauseDuration = 1.5;

    // Create the animation to rotate through panels
    tl.to({}, { duration: pauseDuration }); // Initial pause

    // Loop through each panel and create the animation sequence
    // We'll animate 5 panels at a time in a carousel style
    const totalPanels = Math.min(panels.length, 10); // Limit to 10 panels for better performance

    for (let i = 0; i < totalPanels; i++) {
      // Move to the next panel
      tl.to({}, {
        duration: duration,
        onStart: () => {
          // Update panel positions and z-index
          this.currentPanelIndex = i;
          this.updatePanelPositions(panels, i);
        }
      });

      // Pause at each panel
      tl.to({}, { duration: pauseDuration });
    }

    // Create the scroll trigger to control animation speed
    ScrollTrigger.create({
      trigger: container.parentElement,
      start: "top bottom",
      end: "bottom top",
      onEnter: () => {
        // Start playing when the element enters the viewport
        tl.play();
      },
      onUpdate: (self: ScrollTriggerInstance) => {
        // Only adjust speed when in view
        if (self.isActive) {
          // Calculate the direction and speed based on scroll velocity
          const scrollDirection = self.getVelocity() >= 0 ? 1 : -1;
          const scrollSpeed = Math.min(Math.abs(self.getVelocity() / 2000), 3) || 1;

          // Set the animation direction and speed
          tl.timeScale(scrollDirection * scrollSpeed);
        }
      },
      onLeave: () => {
        // Pause when leaving the viewport
        tl.pause();
      }
    });

    // Start the animation immediately
    tl.play();

    // Store the timeline for cleanup
    this.scrollTween = tl;
  }

  /**
   * Position the panels for the 3D carousel effect
   * @param panels The panel elements
   */
  private positionPanels(panels: NodeListOf<Element>): void {
    const panelWidth = 300; // Width of each panel (matches CSS)
    const spacing = 40; // Spacing between panels (further reduced to bring cards closer)
    const containerWidth = this.cardsContainer.nativeElement.offsetWidth || window.innerWidth;
    const centerX = containerWidth / 2; // Center of the container
    const centerPanel = 2; // Index of the center panel (0-based)

    // Position each panel
    Array.from(panels).forEach((panel, i) => {
      const panelEl = panel as HTMLElement;

      // Calculate position based on index
      // Center panel at index 2, others positioned relative to it
      const position = (i - centerPanel) * (panelWidth + spacing);

      // Set initial position - ensure center panel is exactly centered
      gsap.set(panelEl, {
        x: centerX - (panelWidth / 2) + position, // Position horizontally
        left: 0,
        zIndex: i === centerPanel ? 10 : (i === centerPanel - 1 || i === centerPanel + 1) ? 5 : 0 // Set z-index based on position
      });
    });
  }

  /**
   * Update panel positions for the carousel effect
   * @param panels The panel elements
   * @param currentIndex The current active index
   */
  private updatePanelPositions(panels: NodeListOf<Element>, currentIndex: number): void {
    const totalPanels = panels.length;
    const panelWidth = 300; // Width of each panel (matches CSS)
    const spacing = 40; // Spacing between panels (further reduced to bring cards closer)
    const containerWidth = this.cardsContainer.nativeElement.offsetWidth || window.innerWidth;
    const centerX = containerWidth / 2; // Center of the container

    // Loop through all panels and update their positions
    Array.from(panels).forEach((panel, i) => {
      const panelEl = panel as HTMLElement;

      // Calculate the relative position (-2, -1, 0, 1, 2) where 0 is the center
      let relativePos = ((i - currentIndex) % totalPanels + totalPanels) % totalPanels;
      if (relativePos > totalPanels / 2) relativePos -= totalPanels;

      // Calculate horizontal position
      const position = relativePos * (panelWidth + spacing);

      // Remove active class from all panels
      panelEl.classList.remove('active-panel');

      // Apply different styles based on position
      if (relativePos === 0) {
        // Center panel - ensure it's exactly centered
        gsap.to(panelEl, {
          x: centerX - (panelWidth / 2), // Exact center position
          scale: 1,
          z: 0,
          opacity: 1,
          zIndex: 10,
          duration: 0.5
        });

        // Add active class to center panel
        panelEl.classList.add('active-panel');
      } else if (relativePos === 1 || relativePos === -1) {
        // Adjacent panels
        gsap.to(panelEl, {
          x: centerX - (panelWidth / 2) + position, // Offset from center
          scale: 0.85, // Increased scale to make panels appear closer
          z: -50, // Reduced z-distance to make panels appear closer
          opacity: 0.85, // Increased opacity for better visibility
          zIndex: 5,
          duration: 0.5
        });
      } else if (relativePos === 2 || relativePos === -2) {
        // Outer panels
        gsap.to(panelEl, {
          x: centerX - (panelWidth / 2) + position, // Offset from center
          scale: 0.7, // Increased scale to make panels appear closer
          z: -100, // Reduced z-distance to make panels appear closer
          opacity: 0.7, // Increased opacity for better visibility
          zIndex: 0,
          duration: 0.5
        });
      } else {
        // Far panels (hide them)
        gsap.to(panelEl, {
          x: centerX - (panelWidth / 2) + position, // Offset from center
          scale: 0.4,
          z: -300,
          opacity: 0,
          zIndex: 0,
          duration: 0.5
        });
      }
    });
  }



  /**
   * Handle keyboard events to ensure infinite scroll continues
   * @param event The keyboard event
   */
  private handleKeyDown(event: KeyboardEvent): void {
    // Only handle arrow keys
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight' ||
        event.key === 'ArrowUp' || event.key === 'ArrowDown') {

      // Prevent default scrolling behavior
      event.preventDefault();

      // Ensure the animation is playing
      if (this.scrollTween && this.scrollTween.paused()) {
        console.log('Resuming animation after arrow key press');
        this.scrollTween.play();
      }

      // Manually advance to next/previous panel if needed
      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
        this.goToNextPanel();
      } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
        this.goToPreviousPanel();
      }
    }
  }

  /**
   * Go to the next panel
   */
  private goToNextPanel(): void {
    if (!this.scrollTween) return;

    // Calculate the next panel index
    const nextIndex = (this.currentPanelIndex + 1) % this.cards.length;

    // Update panel positions
    const panels = this.cardsContainer?.nativeElement.querySelectorAll('.panel');
    if (panels && panels.length) {
      this.currentPanelIndex = nextIndex;
      this.updatePanelPositions(panels, nextIndex);
    }
  }

  /**
   * Go to the previous panel
   */
  private goToPreviousPanel(): void {
    if (!this.scrollTween) return;

    // Calculate the previous panel index
    const prevIndex = (this.currentPanelIndex - 1 + this.cards.length) % this.cards.length;

    // Update panel positions
    const panels = this.cardsContainer?.nativeElement.querySelectorAll('.panel');
    if (panels && panels.length) {
      this.currentPanelIndex = prevIndex;
      this.updatePanelPositions(panels, prevIndex);
    }
  }
}
