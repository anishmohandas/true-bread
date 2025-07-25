import { Component, Input, AfterViewInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { PdfImageService } from '../../services/pdf-image.service';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface HighlightItem {
  name: string;
  img: string;
}

interface CategoryItem {
  title: string;
  description: string;
  imageName: string; // Specific image filename for this category
  imageUrl?: string; // Resolved image URL
}

@Component({
  selector: 'app-issue-highlights',
  templateUrl: './issue-highlights.component.html',
  styleUrls: ['./issue-highlights.component.scss']
})
export class IssueHighlightsComponent implements AfterViewInit, OnDestroy {
  @Input() pdfId: string = 'default';
  @Input() cardCount: number = 6;

  @ViewChild('singleImageContainer', { static: false }) singleImageContainerRef!: ElementRef;

  highlightItems: HighlightItem[] = [];
  isLayoutTransitioned: boolean = false;

  categories: CategoryItem[] = [
    {
      title: "Truth & Insight",
      description: "Where timeless truths meet everyday journeys—words that stir the heart, renew the mind, and illuminate the sacred in the ordinary.",
      imageName: "TruthInsight.jpg"
    },
    {
      title: "Living Message",
      description: "Echoes of truth spoken boldly—messages that breathe life, challenge complacency, and call us deeper into the presence of God.",
      imageName: "LivingMessage.jpg"
    },
    {
      title: "Mission Focus",
      description: "Stories of faith in action—where love crosses oceans, light finds the dark places, and ordinary people become vessels of the extraordinary.",
      imageName: "MissionFocus.jpg"
    },
    {
      title: "Wings - A series",
      description: "A soaring thread from issue to issue—one voice unfolding over time, lifting hearts toward hope, healing, and holy transformation.",
      imageName: "Wings.jpg"
    },
    {
      title: "Everyday Grace",
      description: "Honest reflections on the beauty and struggles of real life through a Christian lens.Quiet reflections from the rhythm of real life—where laughter, struggle, and stillness reveal the gentle fingerprints of God.",
      imageName: "EverydayGrace.jpg"
    }
  ];

  currentCategoryIndex: number = 0;
  categoryLoopTimeline?: gsap.core.Timeline;

  constructor(private pdfImageService: PdfImageService) {}

  ngAfterViewInit() {
    // Load specific images for each category by name
    this.loadCategoryImages();

    // Initialize parallax after images are loaded
    setTimeout(() => {
      this.initializeParallax();
      // Set initial scale for first image
      this.setInitialImageScale();
    }, 100);
  }

  private loadCategoryImages() {
    // Try to load images from PDF service first
    this.pdfImageService.getPageImages(this.pdfId, 5).subscribe({
      next: (imagePaths) => {
        // Map specific images to categories by name
        this.categories.forEach((category) => {
          // Try to find matching image by name in the PDF images
          const matchingImage = imagePaths.find(path =>
            path.toLowerCase().includes(category.imageName.toLowerCase().replace('.jpg', ''))
          );

          if (matchingImage) {
            category.imageUrl = matchingImage;
          } else {
            // Fallback to assets folder organized by pdfId
            category.imageUrl = `assets/images/highlights/${this.pdfId}/${category.imageName}`;
          }
        });

        // Set initial highlight items with first category image
        this.highlightItems = [{
          name: this.categories[0].title,
          img: this.categories[0].imageUrl || 'https://picsum.photos/350/500?random=0'
        }];
      },
      error: (error) => {
        console.error('Error fetching images from PDF service:', error);
        // Fallback to assets folder organized by pdfId
        this.categories.forEach((category) => {
          category.imageUrl = `assets/images/highlights/${this.pdfId}/${category.imageName}`;
        });

        // Set initial highlight items with first category image
        this.highlightItems = [{
          name: this.categories[0].title,
          img: this.categories[0].imageUrl!
        }];
      }
    });
  }

  private initializeParallax() {
    if (!this.singleImageContainerRef) return;

    this.initializeGSAPEffects();
  }

  private initializeGSAPEffects() {
    // Text reveal animation on scroll
    this.initializeTextRevealAnimation();

    // Initialize parallax effects
    this.initializeGSAPParallax();

    // Simple entrance animation for single image (if it exists)
    if (this.highlightItems.length > 0) {
      const singleCard = document.querySelector('.highlight-card');
      if (singleCard) {
        gsap.fromTo(singleCard,
          {
            opacity: 0,
            y: 30
          },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: "power2.out"
          }
        );
      }
    }
  }

  private initializeTextRevealAnimation() {
    // Set initial state for initial content elements
    gsap.set('.main-header', {
      opacity: 0,
      y: 50
    });

    gsap.set('.description-text', {
      opacity: 0,
      y: 30
    });

    // Set initial state for category layout (hidden initially)
    gsap.set('.category-layout', {
      opacity: 0
    });

    // Set initial state for category elements
    gsap.set('.category-display', {
      opacity: 0
    });

    gsap.set('.highlight-image img', {
      opacity: 0
    });

    // Create ScrollTrigger for text reveal
    ScrollTrigger.create({
      trigger: '.text-content',
      start: 'center 70%', // Animation starts when center of text content is 70% down the viewport
      end: 'bottom 30%',
      onEnter: () => {
        this.startLayoutTransition();
      },
      onLeave: () => {
        // Optional: Fade out when scrolling past (uncomment if desired)
        // gsap.to('.main-header, .description-text', {
        //   opacity: 0.3,
        //   duration: 0.5
        // });
      },
      onEnterBack: () => {
        // Ensure layout is transitioned when scrolling back up
        if (!this.isLayoutTransitioned) {
          this.startLayoutTransition();
        }
      }
    });
  }

  private startLayoutTransition() {
    if (this.isLayoutTransitioned) return;

    // Step 1: Animate initial content reveal
    const textTimeline = gsap.timeline();

    textTimeline.to('.main-header', {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: 'power2.out'
    })
    .to('.description-text', {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: 'power2.out'
    }, '-=0.2') // Start slightly before header finishes

    // Step 2: Pause to let user read
    .to({}, { duration: 1.5 }) // Pause for 1.5s

    // Step 3: Slide initial layout completely out of viewport
    .to('.initial-layout', {
      x: '-100vw', // Slide completely out to the left
      opacity: 0,
      duration: 0.8,
      ease: 'power2.inOut'
    })

    // Step 4: After slide-out completes, start category layout
    .call(() => {
      this.startCategoryLayout();
    })

    // Step 7: Clean up transforms
    .call(() => {
      gsap.set('.text-column', { clearProps: 'transform' });
      gsap.set('.images-column', { clearProps: 'transform' });
    });

    this.isLayoutTransitioned = true;
  }

  private startCategoryLayout() {
    // Show category layout and animate first category in
    gsap.set('.category-layout', { opacity: 1 });
    gsap.set('.category-display', { opacity: 1 });

    // Animate first category text in
    gsap.fromTo('.category-title',
      { opacity: 0, y: 30, scale: 0.95 },
      { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: 'back.out(1.2)' }
    );

    gsap.fromTo('.category-description',
      { opacity: 0, y: 20 },
      {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: 'power2.out',
        delay: 0.4 // Start after title begins
      }
    );

    // Animate first category image in sync with text
    gsap.fromTo('.highlight-image img',
      { opacity: 0 },
      {
        opacity: 1,
        duration: 0.8,
        ease: 'power2.out' // Same timing as title
      }
    );

    // Start the category loop after first category displays for 3 seconds
    setTimeout(() => {
      this.startCategoryLoop();
    }, 3000);
  }

  private initializeGSAPParallax() {
    // Reset any transforms on the single image to ensure clean state
    const singleCard = document.querySelector('.highlight-card');
    if (singleCard) {
      const img = singleCard.querySelector('img');
      const imageContainer = singleCard.querySelector('.highlight-image');

      if (img) {
        gsap.set(img, { x: 0, y: 0 });
      }

      if (imageContainer) {
        gsap.set(imageContainer, { x: 0, y: 0 });
      }
    }
  }



  private startCategoryLoop() {
    if (this.categoryLoopTimeline) {
      this.categoryLoopTimeline.kill();
    }

    this.categoryLoopTimeline = gsap.timeline({ repeat: -1 });

    // Start with transition to second category (first category already held for 3s)
    this.categoryLoopTimeline!
      .call(() => {
        // Force elements to visible state right before fade-out
        gsap.set('.category-title', { opacity: 1, y: 0, scale: 1 });
        gsap.set('.category-description', { opacity: 1, y: 0 });
        gsap.set('.highlight-image img', { opacity: 1 });
      })
      .to('.category-title', {
        opacity: 0,
        y: -30,
        scale: 0.95,
        duration: 0.8, // Slower duration to make it more visible
        ease: 'power2.in'
      })
      .to('.category-description', {
        opacity: 0,
        y: -20,
        duration: 0.6, // Slower duration to make it more visible
        ease: 'power2.in'
      }, '-=0.4') // Adjusted overlap
      .to('.highlight-image img', {
        opacity: 0,
        duration: 0.8, // Same duration as title fade-out
        ease: 'power2.in'
      }, '-=0.8') // Start at same time as title fade-out
      .call(() => {
        this.currentCategoryIndex = 1; // Move to second category
        this.updateCategoryImage(1); // Update image for second category
      })
      .fromTo('.category-title',
        { opacity: 0, y: 30, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: 'back.out(1.2)' }
      )
      .fromTo('.category-description',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' },
        '-=0.4'
      )
      .fromTo('.highlight-image img',
        { opacity: 0 },
        { opacity: 1, duration: 0.8, ease: 'power2.out' },
        '-=0.8' // Start at same time as title fade-in
      );

    // Continue with the rest of the categories (2, 3, 4, then back to 0)
    for (let i = 2; i < this.categories.length; i++) {
      this.categoryLoopTimeline!
        .to({}, { duration: 3.0 }) // Hold current category for 3 seconds
        .to('.category-title', {
          opacity: 0,
          y: -30,
          scale: 0.95,
          duration: 0.8, // Consistent with first category
          ease: 'power2.in'
        })
        .to('.category-description', {
          opacity: 0,
          y: -20,
          duration: 0.6, // Consistent with first category
          ease: 'power2.in'
        }, '-=0.4') // Consistent overlap
        .to('.highlight-image img', {
          opacity: 0,
          duration: 0.8, // Same duration as title fade-out
          ease: 'power2.in'
        }, '-=0.8') // Start at same time as title fade-out
        .call(() => {
          this.currentCategoryIndex = i;
          this.updateCategoryImage(i);
        })
        .fromTo('.category-title',
          { opacity: 0, y: 30, scale: 0.95 },
          { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: 'back.out(1.2)' }
        )
        .fromTo('.category-description',
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' },
          '-=0.4'
        )
        .fromTo('.highlight-image img',
          { opacity: 0 },
          { opacity: 1, duration: 0.8, ease: 'power2.out' },
          '-=0.8' // Start at same time as title fade-in
        );
    }

    // Finally, loop back to category 0
    this.categoryLoopTimeline!
      .to({}, { duration: 3.0 }) // Hold last category for 3 seconds
      .to('.category-title', {
        opacity: 0,
        y: -30,
        scale: 0.95,
        duration: 0.8, // Consistent timing
        ease: 'power2.in'
      })
      .to('.category-description', {
        opacity: 0,
        y: -20,
        duration: 0.6, // Consistent timing
        ease: 'power2.in'
      }, '-=0.4') // Consistent overlap
      .to('.highlight-image img', {
        opacity: 0,
        duration: 0.8, // Same duration as title fade-out
        ease: 'power2.in'
      }, '-=0.8') // Start at same time as title fade-out
      .call(() => {
        this.currentCategoryIndex = 0; // Back to first category
        this.updateCategoryImage(0);
      })
      .fromTo('.category-title',
        { opacity: 0, y: 30, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: 'back.out(1.2)' }
      )
      .fromTo('.category-description',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' },
        '-=0.4'
      )
      .fromTo('.highlight-image img',
        { opacity: 0 },
        { opacity: 1, duration: 0.8, ease: 'power2.out' },
        '-=0.8' // Start at same time as title fade-in
      );
  }

  private updateCategoryImage(categoryIndex: number) {
    // Simple image update without animations (for initial setup)
    if (this.categories[categoryIndex] && this.categories[categoryIndex].imageUrl) {
      this.highlightItems = [{
        name: this.categories[categoryIndex].title,
        img: this.categories[categoryIndex].imageUrl!
      }];
    }
  }



  private setInitialImageScale() {
    // Ensure first image starts at proper scale
    setTimeout(() => {
      const firstImage = document.querySelector('.highlight-image img') as HTMLImageElement;
      if (firstImage) {
        gsap.set(firstImage, {
          scale: 1,
          opacity: 1,
          x: 0,
          y: 0,
          rotation: 0,
          transformOrigin: "center center"
        });
      }
    }, 200);
  }

  ngOnDestroy() {
    // Clean up ScrollTrigger instances
    ScrollTrigger.getAll().forEach(trigger => {
      if (trigger.trigger && trigger.trigger.closest('.issue-highlights')) {
        trigger.kill();
      }
    });

    // Clean up category loop timeline
    if (this.categoryLoopTimeline) {
      this.categoryLoopTimeline.kill();
    }
  }
}
