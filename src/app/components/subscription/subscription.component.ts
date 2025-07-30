import { Component, AfterViewInit, ElementRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SubscriptionService } from '../../services/subscription.service';

// Declare GSAP and MorphSVGPlugin from global scope (loaded via CDN)
declare const gsap: any;
declare const MorphSVGPlugin: any;

@Component({
  selector: 'app-subscription',
  templateUrl: './subscription.component.html',
  styleUrls: ['./subscription.component.scss'],
  encapsulation: ViewEncapsulation.Emulated // Ensure styles are properly scoped
})
export class SubscriptionComponent implements AfterViewInit {
  @ViewChild('heroSection', { static: false }) heroSection!: ElementRef;
  @ViewChild('messageOutline', { static: false }) messageOutline!: ElementRef;
  @ViewChild('messageFlap', { static: false }) messageFlap!: ElementRef;
  @ViewChild('popGroup', { static: false }) popGroup!: ElementRef;

  subscriptionForm: FormGroup;
  submitting = false;
  success = false;
  error: string | null = null;

  private messageFlapPath = 'M242.1,265.7l52.4,52.3l51.1-52.3';
  private messageOutlinePath = 'M345.6,331.6H242.1v-65.9h103.5V331.6z';
  private tickOutlinePath = 'M328.8,298.5c0,18.8-15.2,34-34,34s-34-15.2-34-34s15.2-34,34-34S328.8,279.7,328.8,298.5z';
  private tickPath = 'M279.3,298.5l12.3,12.8l22.8-22.5';

  constructor(
    private fb: FormBuilder,
    private subscriptionService: SubscriptionService
  ) {
    this.subscriptionForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]]
    });
  }

  ngAfterViewInit() {
    // Add a small delay to ensure ViewChild elements are ready and GSAP is loaded
    setTimeout(() => {
      this.initializeGSAP();
    }, 200);
  }

  ngOnInit() {
    // Scroll to top when component loads
    window.scrollTo(0, 0);    
  }

  private initializeGSAP() {
    try {
      // Register MorphSVG plugin
      if (typeof MorphSVGPlugin !== 'undefined') {
        gsap.registerPlugin(MorphSVGPlugin);
      }

      // Set initial state - Issue Highlights style
      if (this.heroSection?.nativeElement) {
        gsap.set(this.heroSection.nativeElement, {
          backgroundColor: '#eeece5' // Issue highlights background
        });
      }

      // Set SVG container position and scale - keep it contained within hero-image
      const container = this.heroSection?.nativeElement.querySelector('.hero-image .container');
      if (container) {
        gsap.set(container, {
          position: 'relative', // Changed from absolute to relative
          // Remove positioning that causes it to escape
        });
      }

      const svg = this.heroSection?.nativeElement.querySelector('svg');
      if (svg) {
        gsap.set(svg, {
          visibility: 'visible',
          scale: 1.5
        });
      }

      // Set initial pop group state
      if (this.popGroup?.nativeElement) {
        const popLines = this.popGroup.nativeElement.querySelectorAll('line');
        gsap.set(popLines, {
          opacity: 0,
          scale: 0
        });
      }

      // Store original paths for morphing back
      if (this.messageFlap?.nativeElement) {
        this.messageFlapPath = this.messageFlap.nativeElement.getAttribute('d') || this.messageFlapPath;
      }
      if (this.messageOutline?.nativeElement) {
        this.messageOutlinePath = this.messageOutline.nativeElement.getAttribute('d') || this.messageOutlinePath;
      }

    } catch (error) {
      console.error('GSAP initialization error:', error);
    }
  }

  private animateSuccess() {
    try {
      // Set default ease like CodePen
      gsap.defaults({ ease: "elastic.out(1, 0.82)" });
      
      const tl = gsap.timeline({ paused: false });
      
      if (this.popGroup?.nativeElement) {
        const popLines = this.popGroup.nativeElement.querySelectorAll('line');

        // Exact CodePen animation sequence
        tl.to('#messageOutline', 1, {
          morphSVG: { shape: '#tickOutline' }
        })
        .to('#messageFlap', 0.4, {
          morphSVG: { shape: '#tick' },
          ease: 'power3.out',
          delay: 0.2
        }, '-=1')
        .to(this.heroSection.nativeElement, 1, {
          backgroundColor: '#f0ede4' // Very subtle variation of starting beige color (#eeece5)
        }, '-=1')
        .call(() => this.pop(), [], '-=0.5');
      }
    } catch (error) {
      console.error('Animation error:', error);
      // Fallback: just change background color
      if (this.heroSection?.nativeElement) {
        gsap.to(this.heroSection.nativeElement, {
          duration: 1,
          backgroundColor: '#3AB54A'
        });
      }
    }
  }

  private pop() {
    const popLines = this.popGroup?.nativeElement.querySelectorAll('line');
    if (!popLines) return;

    // Create pop timeline using scale and opacity instead of drawSVG
    const popTl = gsap.timeline({ paused: true });
    
    popTl.set(popLines, {
      opacity: 1,
      scale: 1
    })
    .staggerFromTo(popLines, 0.3, 
      { scale: 0, opacity: 0 },
      { scale: 1.2, opacity: 1, ease: 'back.out(1.7)' },
      0.1
    )
    .staggerTo(popLines, 0.5, {
      scale: 0,
      opacity: 0,
      ease: 'power2.in'
    }, 0.05, '-=0.2');
    
    popTl.timeScale(1);
    popTl.play(0);
  }

  getNameErrorMessage(): string {
    const nameControl = this.subscriptionForm.get('name');
    
    if (nameControl?.hasError('required')) {
      return 'Name is required';
    }
    
    if (nameControl?.hasError('minlength')) {
      return 'Name must be at least 2 characters long';
    }
    
    return '';
  }

  getEmailErrorMessage(): string {
    const emailControl = this.subscriptionForm.get('email');
    
    if (emailControl?.hasError('required')) {
      return 'Email is required';
    }
    
    if (emailControl?.hasError('email')) {
      return 'Please enter a valid email address';
    }
    
    return '';
  }

  onSubmit(): void {
    if (this.subscriptionForm.valid && !this.submitting) {
      this.submitting = true;
      this.error = null;
      
      const formData = this.subscriptionForm.value;
      
      this.subscriptionService.subscribe(formData)
        .subscribe({
          next: () => {
            this.success = true;
            this.subscriptionForm.reset();
            this.animateSuccess(); // Trigger GSAP animation
            setTimeout(() => this.success = false, 5000);
            this.error = null;
          },
          error: (error) => {
            this.error = error.message || 'An error occurred. Please try again.';
            this.submitting = false;
          },
          complete: () => {
            this.submitting = false;
          }
        });
    }
  }
}
