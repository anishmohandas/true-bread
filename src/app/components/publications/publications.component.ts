import { Component, OnInit, AfterViewInit, OnDestroy, HostListener, ElementRef, ViewChild } from '@angular/core';
import { Publication } from '../../shared/interfaces/publication.interface';
import { PublicationsService } from '../../services/publications.service';
import { ScrollService } from 'src/app/services/scroll.service';
import { GoogleAnalyticsService } from '../../services/google-analytics.service';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import SplitType from 'split-type';

// HoverBtn class from CodePen
class HoverBtn {
  btn: HTMLElement;
  txt: HTMLElement;
  hoverTxt: HTMLElement;
  split1: any;
  split2: any;
  numChars1: number;
  numChars2: number;

  constructor(el: HTMLElement) {
    this.bindAll();

    this.btn = el;
    this.txt = this.btn.querySelector(".js-button__text") as HTMLElement;
    this.hoverTxt = this.btn.querySelector(".js-button__hover") as HTMLElement;
    this.split1 = new SplitText(this.txt, {type:"chars, words"});
    this.split2 = new SplitText(this.hoverTxt, {type:"chars, words"});
    this.numChars1 = this.split1.chars.length;
    this.numChars2 = this.split2.chars.length;

    this.addListeners();

    for(var i = 0; i < this.numChars2; i++){
      gsap.set(this.split2.chars[i], {
        y: 30 * Math.random()
      });
    }
  }

  bindAll() {
    const methods = ['mouseIn', 'mouseOut'];

    for (let i = 0; i < methods.length; i++) {
      const fn = methods[i];
      (this as any)[fn] = (this as any)[fn].bind(this);
    }
  }

  mouseIn() {
    for (var i = 0; i < this.numChars1; i++) {
      gsap.to(this.split1.chars[i], {
        duration: 0.5,
        y: -30 * Math.random(),
        delay: 0.01
      });
    }
    gsap.to(this.split2.chars, {
      duration: 0.5,
      y: 0,
      stagger: 0.01
    });
  }

  mouseOut() {
    gsap.to(this.split1.chars, {
      duration: 0.5,
      y: 0,
      stagger: 0.01
    });
    for (var i = 0; i < this.numChars2; i++) {
      gsap.to(this.split2.chars[i], {
        duration: 0.5,
        y: 30 * Math.random(),
        delay: 0.01
      });
    }
  }

  addListeners() {
    this.btn.addEventListener("mouseenter", this.mouseIn.bind(this));
    this.btn.addEventListener("mouseleave", this.mouseOut.bind(this));
  }
}

@Component({
  selector: 'app-publications',
  templateUrl: './publications.component.html',
  styleUrls: ['./publications.component.scss']
})
export class PublicationsComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('publicationsContainer', { static: false }) publicationsContainer!: ElementRef;
  
  publications: Publication[] = [];
  loading = true;
  error = false;
  selectedYear: number | null = null;
  years: number[] = [];
  
  private splitTexts: SplitType[] = [];
  private animations: gsap.core.Timeline[] = [];
  private scrollTriggerInstances: ScrollTrigger[] = [];

  constructor(
    private publicationsService: PublicationsService,
    private scrollService: ScrollService,
    private elementRef: ElementRef,
    private googleAnalytics: GoogleAnalyticsService
  ) {}

  ngOnInit() {
    // Scroll to top when component loads
    window.scrollTo(0, 0);

    // Wait for the scroll system to be ready before loading content
    setTimeout(() => {
      this.initializeComponent();
    }, 300);
  }

  private initializeComponent() {
    this.publicationsService.getAllPublications().subscribe({
      next: (publications) => {
        this.publications = publications;
        this.years = [...new Set(publications.map(pub => pub.year))].sort((a, b) => b - a);
        this.loading = false;

        // Multiple resize triggers to ensure proper height calculation
        this.triggerScrollResize();
      },
      error: (error) => {
        console.error('Error fetching publications:', error);
        this.error = true;
        this.loading = false;
      }
    });
  }

  private triggerScrollResize() {
    // Immediate resize
    this.scrollService.triggerResize();

    // Resize after DOM updates
    setTimeout(() => {
      this.scrollService.triggerResize();
    }, 100);

    // Resize after images load
    setTimeout(() => {
      this.scrollService.triggerResize();
    }, 500);

    // Final resize to ensure everything is calculated
    setTimeout(() => {
      this.scrollService.triggerResize();
    }, 1000);
  }

  ngAfterViewInit() {
    // Clean up any existing animations first
    this.cleanupAnimations();
    
    // Initialize animations after view is ready
    this.initializeAnimationsWithDelay();
  }

  ngOnDestroy() {
    this.cleanupAnimations();
  }

  private initializeAnimationsWithDelay(): void {
    // Register GSAP plugins first
    try {
      gsap.registerPlugin(ScrollTrigger);
    } catch (error) {
      console.error('Error registering GSAP plugins:', error);
    }

    // Wait for fonts to load before initializing animations
    document.fonts.ready.then(() => {
      const delay = 1500;
      setTimeout(() => {
        this.initializeSplitTextAnimations();
        this.initializeButtonAnimations();
      }, delay);
    }).catch(() => {
      setTimeout(() => {
        this.initializeSplitTextAnimations();
        this.initializeButtonAnimations();
      }, 1800);
    });
  }

  private cleanupAnimations(): void {
    // Clean up animations and split text instances
    this.animations.forEach(animation => animation.kill());
    this.animations = [];
    
    this.splitTexts.forEach(split => split.revert());
    this.splitTexts = [];
    
    // Kill all ScrollTrigger instances for this component
    ScrollTrigger.getAll().forEach(trigger => {
      const triggerElement = trigger.vars.trigger as HTMLElement;
      if (triggerElement && this.publicationsContainer?.nativeElement?.contains(triggerElement)) {
        trigger.kill();
      }
    });
    
    // Reset any manually created wrappers
    if (this.publicationsContainer?.nativeElement) {
      // Clean up text line wrappers
      const lineWrappers = this.publicationsContainer.nativeElement.querySelectorAll('.line-wrapper');
      lineWrappers.forEach((wrapper: HTMLElement) => {
        const line = wrapper.querySelector('.line');
        if (line && wrapper.parentNode) {
          wrapper.parentNode.insertBefore(line, wrapper);
          wrapper.remove();
        }
      });

      // Clean up image reveal containers
      const imageRevealContainers = this.publicationsContainer.nativeElement.querySelectorAll('.image-reveal-container');
      imageRevealContainers.forEach((container: HTMLElement) => {
        const imageWrapper = container.querySelector('.image-wrapper');
        if (imageWrapper && container.parentNode) {
          container.parentNode.insertBefore(imageWrapper, container);
          container.remove();
        }
      });
    }
  }

  private initializeSplitTextAnimations(): void {
    if (!this.publicationsContainer?.nativeElement) {
      return;
    }

    // Target all text elements that should have split text animation
    const textElements = this.publicationsContainer.nativeElement.querySelectorAll(
      'h1, h2, h3, h4, p, .publication-title, .publication-description, .publication-meta span, .action-buttons .button, .publication-highlights h4, .publication-highlights li'
    );
    
    // Set initial state to show elements for animation
    gsap.set(textElements, { 
      opacity: 1, 
      y: 0,
      clearProps: 'transform'
    });

    textElements.forEach((element: HTMLElement, index: number) => {
      // Skip if element is empty or only contains whitespace
      if (!element.textContent?.trim()) {
        return;
      }

      // Create split text instance for lines
      const split = new SplitType(element, {
        types: 'lines',
        tagName: 'div',
        lineClass: 'line'
      });

      this.splitTexts.push(split);

      if (!split.lines || split.lines.length === 0) {
        return;
      }

      // Wrap each line in a container with overflow hidden
      split.lines.forEach((line: HTMLElement) => {
        const wrapper = document.createElement('div');
        wrapper.className = 'line-wrapper';
        wrapper.style.overflow = 'hidden';
        wrapper.style.display = 'block';
        
        // Insert wrapper before the line
        if (line.parentNode) {
          line.parentNode.insertBefore(wrapper, line);
          wrapper.appendChild(line);
          
          // Set initial state - line is positioned below the visible area
          gsap.set(line, {
            yPercent: 100,
            display: 'block'
          });
        }
      });

      // Create scroll-triggered animation using ScrollTrigger.create()
      const trigger = ScrollTrigger.create({
        trigger: element,
        start: 'top 85%',
        end: 'bottom 15%',
        toggleActions: 'play none none reverse',
        markers: false,
        onEnter: () => {
          // Animate lines sliding up from hidden position
          gsap.to(split.lines, {
            yPercent: 0,
            duration: 0.8,
            ease: 'power1.out', // Smoother easing to match image animation
            force3D: true, // Enable hardware acceleration
            stagger: {
              amount: 0.2,
              from: 'start'
            }
          });
        },
        onLeave: () => {
          // Optional: animate out when leaving
          gsap.to(split.lines, {
            yPercent: 100,
            duration: 0.6,
            ease: 'power1.in',
            force3D: true,
            stagger: {
              amount: 0.1,
              from: 'end'
            }
          });
        },
        onEnterBack: () => {
          // Animate back in when scrolling back up
          gsap.to(split.lines, {
            yPercent: 0,
            duration: 0.8,
            ease: 'power1.out',
            force3D: true,
            stagger: {
              amount: 0.2,
              from: 'start'
            }
          });
        },
        onLeaveBack: () => {
          // Animate out when leaving back
          gsap.to(split.lines, {
            yPercent: 100,
            duration: 0.6,
            ease: 'power1.in',
            force3D: true,
            stagger: {
              amount: 0.1,
              from: 'end'
            }
          });
        }
      });

      // Store the ScrollTrigger instance for cleanup
      this.scrollTriggerInstances.push(trigger);
    });

    // Initialize scroll reveal animations
    this.initializeScrollReveal();
  }

  private animateFrom(elem: HTMLElement, direction: number = 1) {
    let x = 0;
    let y = direction * 100;
    
    if (elem.classList.contains("gs_reveal_fromLeft")) {
      x = -100;
      y = 0;
    } else if (elem.classList.contains("gs_reveal_fromRight")) {
      x = 100;
      y = 0;
    }
    
    gsap.fromTo(elem, 
      { x, y, autoAlpha: 0 },
      {
        duration: 1.25,
        x: 0,
        y: 0,
        autoAlpha: 1,
        ease: "expo.out",
        overwrite: "auto",
        force3D: true
      }
    );
  }

  private hide(elem: HTMLElement) {
    gsap.set(elem, { autoAlpha: 0 });
  }

  private initializeScrollReveal(): void {
    if (!this.publicationsContainer?.nativeElement) return;

    // Target all reveal elements
    const revealElements = this.publicationsContainer.nativeElement.querySelectorAll('.gs_reveal');
    
    revealElements.forEach((elem: HTMLElement) => {
      this.hide(elem); // Ensure element is hidden initially
      
      const trigger = ScrollTrigger.create({
        trigger: elem,
        onEnter: () => this.animateFrom(elem),
        onEnterBack: () => this.animateFrom(elem, -1),
        onLeave: () => this.hide(elem),
        onLeaveBack: () => this.hide(elem)
      });
      
      this.scrollTriggerInstances.push(trigger);
    });
  }

  private initializeButtonAnimations() {
    // Initialize HoverBtn for each button
    const buttons = this.elementRef.nativeElement.querySelectorAll('.js-button');
    buttons.forEach((button: HTMLElement) => {
      new HoverBtn(button);
    });
  }

  get filteredPublications(): Publication[] {
    if (!this.selectedYear) return this.publications;
    return this.publications.filter(pub => pub.year === this.selectedYear);
  }

  // Calculate volume number based on year (2025 = Volume 1)
  getVolumeNumber(year: number): number {
    if (!year) return 1;
    return year - 2025 + 1;
  }

  // Calculate issue number within the volume (resets to 1 after every 12 issues)
  getIssueNumber(issueNumber: number): number {
    if (!issueNumber) return 1;
    // Calculate issue number within the volume (1-12)
    const issueInVolume = ((issueNumber - 1) % 12) + 1;
    return issueInVolume;
  }

  filterByYear(year: number | null) {
    this.selectedYear = year;

    // Trigger resize after filter change to ensure proper height calculation
    setTimeout(() => {
      this.scrollService.triggerResize();
      // Reinitialize animations after filter change
      this.reinitializeAnimations();
    }, 100);
  }

  private reinitializeAnimations() {
    // Clean up existing animations
    this.cleanupAnimations();

    // Reinitialize animations after DOM updates
    setTimeout(() => {
      this.initializeSplitTextAnimations(); // This now includes image animations
      this.initializeButtonAnimations();
      try {
        ScrollTrigger.refresh();
      } catch (error) {
        console.error('Error refreshing ScrollTrigger:', error);
      }
    }, 200);
  }

  onViewPDF(pdfUrl: string) {
    if (!pdfUrl) {
      console.error('PDF URL not available');
      alert('PDF is not available for this publication. Please try again later.');
      return;
    }

    // Find the publication to get its details for tracking
    const publication = this.publications.find(pub => pub.pdfUrl === pdfUrl);
    if (publication) {
      this.googleAnalytics.trackPdfView(publication.title, publication.id);
    }
    
    try {
      window.open(pdfUrl, '_blank');
    } catch (error) {
      console.error('Error opening PDF:', error);
      alert('Unable to open PDF. Please check if pop-ups are blocked.');
    }
  }

  onDownloadPDF(publication: Publication) {
    if (!publication.pdfUrl) {
      console.error('PDF URL not available for publication:', publication.title);
      alert('PDF is not available for this publication. Please try again later.');
      return;
    }

    // Track PDF download
    this.googleAnalytics.trackPdfDownload(publication.title, publication.id);

    try {
      const link = document.createElement('a');
      link.href = publication.pdfUrl;
      link.download = `${publication.title}.pdf`;
      link.target = '_blank'; // Add target blank for better compatibility
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      // Fallback to opening in new tab
      try {
        window.open(publication.pdfUrl, '_blank');
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError);
        alert('Unable to download PDF. Please try again or check if pop-ups are blocked.');
      }
    }
  }

  onImageLoad() {
    // Trigger resize when each image loads
    this.scrollService.triggerResize();

    // Additional resize after a short delay to ensure layout is stable
    setTimeout(() => {
      this.scrollService.triggerResize();
    }, 50);
  }

  @HostListener('window:resize', ['$event'])
  onWindowResize() {
    // Trigger resize when window size changes
    this.scrollService.triggerResize();
  }
}
