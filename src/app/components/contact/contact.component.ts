  
import { Component, AfterViewInit, OnDestroy, ElementRef, ViewChild, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EmailService } from '../../services/email.service';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SplitType from 'split-type';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

@Component({
  standalone: false,
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss']
})
export class ContactComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('contactContainer', { static: false }) contactContainer!: ElementRef;

  contactForm: FormGroup;
  submitting = false;
  success = false;
  error: string | null = null;

  private splitTexts: SplitType[] = [];
  private animations: gsap.core.Timeline[] = [];

  contactInfo = {
    address: [
      'True Bread Media',
      'Marayamuttom PO',
      'Trivandrum, 695124',
      'India'
    ],
    email: 'contact@thetruebread.com',
    phone: '+91 949 533 6764'
  };

  ngOnInit() {
    // Scroll to top when component loads
    window.scrollTo(0, 0);    
  }

  ngAfterViewInit(): void {
    // Clean up any existing animations first
    this.cleanupAnimations();
    
    // Initialize animations after view is ready
    this.initializeAnimationsWithDelay();
  }

  ngOnDestroy(): void {
    this.cleanupAnimations();
  }
  constructor(
    private fb: FormBuilder,
    private emailService: EmailService
  ) {
    this.contactForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      subject: ['', Validators.required],
      message: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  getErrorMessage(field: string): string {
    const control = this.contactForm.get(field);
    
    if (!control?.errors) return '';

    if (control.hasError('required')) {
      return `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
    }
    
    if (control.hasError('email')) {
      return 'Please enter a valid email address';
    }
    
    if (control.hasError('minlength')) {
      const minLength = control.errors['minlength'].requiredLength;
      return `${field.charAt(0).toUpperCase() + field.slice(1)} must be at least ${minLength} characters long`;
    }
    
    return '';
  }

  onSubmit(): void {
    if (this.contactForm.valid && !this.submitting) {
      this.submitting = true;
      this.error = null;
      
      this.emailService.sendContactEmail(this.contactForm.value)
        .subscribe({
          next: () => {
            this.success = true;
            this.contactForm.reset();
            setTimeout(() => this.success = false, 5000);
          },
          error: (error) => {
            this.error = 'Failed to send message. Please try again later.';
            console.error('Contact form submission error:', error);
          },
          complete: () => {
            this.submitting = false;
          }
        });
    }
  }

  private initializeAnimationsWithDelay(): void {
    // Wait for fonts to load before initializing animations
    document.fonts.ready.then(() => {
      // Use delay to ensure animations are visible after menu transitions
      const delay = 1500;
      console.log(`⏱️ Using ${delay}ms delay for contact animation initialization`);
      
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
    console.log('🧹 Cleaning up contact animations and split text instances');
    
    // Clean up animations and split text instances
    this.animations.forEach(animation => animation.kill());
    this.animations = [];
    
    this.splitTexts.forEach(split => split.revert());
    this.splitTexts = [];
    
    // Kill all ScrollTrigger instances for this component
    ScrollTrigger.getAll().forEach(trigger => {
      const triggerElement = trigger.vars.trigger as HTMLElement;
      if (triggerElement && this.contactContainer?.nativeElement?.contains(triggerElement)) {
        trigger.kill();
      }
    });
    
    // Reset any manually created wrappers
    if (this.contactContainer?.nativeElement) {
      const wrappers = this.contactContainer.nativeElement.querySelectorAll('.line-wrapper');
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
    console.log('🎬 Initializing split text animations for contact component');
    
    if (!this.contactContainer?.nativeElement) {
      console.error('❌ Contact container not found');
      return;
    }

    // Target only specific content text elements that should have split text animation
    // Exclude all form elements to prevent layout issues
    const textElements = this.contactContainer.nativeElement.querySelectorAll(
      'h2, h3:not(label), p.text-stone-600, address, a[href^="mailto:"], a[href^="tel:"], div.p-4'
    );

    console.log(`📝 Found ${textElements.length} text elements to animate in contact`);
    
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
        console.log(`⏭️ Skipping empty contact element at index ${index}`);
        return;
      }

      console.log(`🔄 Processing contact element ${index + 1}/${textElements.length}: ${element.tagName}`);

      // Create split text instance for lines
      const split = new SplitType(element, {
        types: 'lines',
        tagName: 'div',
        lineClass: 'line'
      });

      this.splitTexts.push(split);

      if (!split.lines || split.lines.length === 0) {
        console.warn(`⚠️ No lines created for contact element ${index}`);
        return;
      }

      console.log(`📏 Created ${split.lines.length} lines for contact element ${index}`);

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
          
          console.log(`✅ Wrapped contact line ${lineIndex + 1} for element ${index}`);
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
          onEnter: () => console.log(`🎯 Contact animation triggered for element ${index}`),
          onLeave: () => console.log(`🚪 Contact animation left for element ${index}`)
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
        onComplete: () => console.log(`✨ Contact animation completed for element ${index}`)
      });

      this.animations.push(timeline);
    });

    console.log(`🎭 Total contact animations created: ${this.animations.length}`);
    console.log(`📚 Total contact split text instances: ${this.splitTexts.length}`);

    // Animate the form after all text animations complete
    this.animateFormAfterTextAnimations();
  }

  private animateFormAfterTextAnimations(): void {
    if (!this.contactContainer?.nativeElement) return;

    const form = this.contactContainer.nativeElement.querySelector('form');
    if (!form) {
      console.warn('⚠️ Contact form not found for animation');
      return;
    }

    console.log('📝 Setting up form animation after text animations');

    // Create a timeline for the form animation
    const formTimeline = gsap.timeline({
      delay: 1.2, // Wait for text animations to complete (0.8s duration + 0.4s buffer)
      onStart: () => console.log('🎬 Starting form animation'),
      onComplete: () => console.log('✨ Form animation completed')
    });

    // Animate the form sliding up and fading in
    formTimeline.to(form, {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: 'power2.out'
    });

    this.animations.push(formTimeline);
  }
}
