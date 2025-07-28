import { Component, AfterViewInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SplitType from 'split-type';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss']
})
export class AboutComponent implements AfterViewInit, OnDestroy {
  @ViewChild('aboutContainer', { static: false }) aboutContainer!: ElementRef;

  private splitTexts: SplitType[] = [];
  private animations: gsap.core.Timeline[] = [];

  constructor() {}

  ngAfterViewInit(): void {
    // Clean up any existing animations first
    this.cleanupAnimations();
    
    // Initialize animations after view is ready
    this.initializeAnimationsWithDelay();
  }

  ngOnDestroy(): void {
    this.cleanupAnimations();
  }

  ngOnInit() {
    // Scroll to top when component loads
    window.scrollTo(0, 0);    
  }
  

  private initializeAnimationsWithDelay(): void {
    // Wait for fonts to load before initializing animations
    document.fonts.ready.then(() => {
      // Use much longer delay to ensure animations are visible after menu transitions
      // Menu animations typically take 1-1.5 seconds to complete
      const delay = 1500;
      console.log(`⏱️ Using ${delay}ms delay for animation initialization to ensure visibility after menu transitions`);
      
      setTimeout(() => {
        this.initializeSplitTextAnimations();
      }, delay);
    }).catch(() => {
      // Fallback if fonts.ready fails
      setTimeout(() => {
        this.initializeSplitTextAnimations();
      }, 1800);
    });
  }


  private cleanupAnimations(): void {
    console.log('🧹 Cleaning up animations and split text instances');
    
    // Clean up animations and split text instances
    this.animations.forEach(animation => animation.kill());
    this.animations = [];
    
    this.splitTexts.forEach(split => split.revert());
    this.splitTexts = [];
    
    // Kill all ScrollTrigger instances for this component
    ScrollTrigger.getAll().forEach(trigger => {
      const triggerElement = trigger.vars.trigger as HTMLElement;
      if (triggerElement && this.aboutContainer?.nativeElement?.contains(triggerElement)) {
        trigger.kill();
      }
    });
    
    // Reset any manually created wrappers
    if (this.aboutContainer?.nativeElement) {
      const wrappers = this.aboutContainer.nativeElement.querySelectorAll('.line-wrapper');
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

  private initializeSplitTextAnimations(): void {
    console.log('🎬 Initializing split text animations for about component');
    
    if (!this.aboutContainer?.nativeElement) {
      console.error('❌ About container not found');
      return;
    }

    // Target all text elements that should have split text animation
    const textElements = this.aboutContainer.nativeElement.querySelectorAll(
      '.header, h2, h3, p, li, a'
    );

    console.log(`📝 Found ${textElements.length} text elements to animate`);
    
    // Set initial state to show elements for animation
    // This overrides the CSS hiding and prevents FOUC (Flash of Unstyled Content)
    gsap.set(textElements, { 
      opacity: 1, 
      y: 0, // Reset any translateY offset
      clearProps: 'transform' // Clear transform but keep opacity
    });

    textElements.forEach((element: HTMLElement, index: number) => {
      // Skip if element is empty or only contains whitespace
      if (!element.textContent?.trim()) {
        console.log(`⏭️ Skipping empty element at index ${index}`);
        return;
      }

      console.log(`🔄 Processing element ${index + 1}/${textElements.length}: ${element.tagName}`);

      // Create split text instance for lines
      const split = new SplitType(element, {
        types: 'lines',
        tagName: 'div',
        lineClass: 'line'
      });

      this.splitTexts.push(split);

      if (!split.lines || split.lines.length === 0) {
        console.warn(`⚠️ No lines created for element ${index}`);
        return;
      }

      console.log(`📏 Created ${split.lines.length} lines for element ${index}`);

      // Wrap each line in a container with overflow hidden
      split.lines.forEach((line: HTMLElement, lineIndex: number) => {
        const wrapper = document.createElement('div');
        wrapper.className = 'line-wrapper';
        wrapper.style.overflow = 'hidden';
        wrapper.style.display = 'block';
        
        // Insert wrapper before the line
        if (line.parentNode) {
          line.parentNode.insertBefore(wrapper, line);
          // Move line into wrapper
          wrapper.appendChild(line);
          
          // Set initial state - line is positioned below the visible area
          gsap.set(line, {
            yPercent: 100,
            display: 'block'
          });
          
          console.log(`✅ Wrapped line ${lineIndex + 1} for element ${index}`);
        }
      });

      // Create scroll-triggered animation
      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: element,
          start: 'top 85%',
          end: 'bottom 15%',
          toggleActions: 'play none none reverse',
          markers: false, // Set to true for debugging
          onEnter: () => console.log(`🎯 Animation triggered for element ${index}`),
          onLeave: () => console.log(`🚪 Animation left for element ${index}`)
        }
      });

      // Animate lines sliding up from hidden position
      timeline.to(split.lines, {
        yPercent: 0,
        duration: 0.8,
        ease: 'power2.out',
        stagger: {
          amount: 0.2,
          from: 'start'
        },
        onComplete: () => console.log(`✨ Animation completed for element ${index}`)
      });

      this.animations.push(timeline);
    });

    console.log(`🎭 Total animations created: ${this.animations.length}`);
    console.log(`📚 Total split text instances: ${this.splitTexts.length}`);
  }

  onSubscribe(event: Event) {
    event.preventDefault();
    // Add subscription logic here
  }
}
