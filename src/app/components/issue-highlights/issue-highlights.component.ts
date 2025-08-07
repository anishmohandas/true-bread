import { Component, Input, AfterViewInit, OnDestroy, ElementRef } from '@angular/core';
import { PdfImageService } from '../../services/pdf-image.service';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { GoogleAnalyticsService } from 'src/app/services/google-analytics.service';

gsap.registerPlugin(ScrollTrigger);

interface CategoryItem {
  title: string;
  description: string;
  imageName: string;
  imageUrl?: string;
}

@Component({
  selector: 'app-issue-highlights',
  templateUrl: './issue-highlights.component.html',
  styleUrls: ['./issue-highlights.component.scss']
})
export class IssueHighlightsComponent implements AfterViewInit, OnDestroy {
  @Input() pdfId: string = 'default';
  @Input() pdfUrl: string = 'default';
  @Input() pdfMonth: string = 'default';
  @Input() cardCount: number = 6; // Keep for backward compatibility, not used in new implementation

  categories: CategoryItem[] = [
    {
      title: "Truth & Insight",
      description: "Where timeless truths meet everyday journeys—words that stir the heart, renew the mind, and illuminate the sacred in the ordinary.",
      imageName: "TruthInsight.jpg"
    },
    {
      title: "Bible Study",
      description: "Echoes of truth spoken boldly—messages that breathe life, challenge complacency, and call us deeper into the presence of God.",
      imageName: "LivingMessage.jpg"
    },
    {
      title: "Holy Exile",
      description: "Stories of faith in action—where love crosses oceans, light finds the dark places, and ordinary people become vessels of the extraordinary.",
      imageName: "MissionFocus.jpg"
    },
    {
      title: "Wings - A series",
      description: "A soaring thread from issue to issue—one voice unfolding over time, lifting hearts toward hope, healing, and holy transformation.",
      imageName: "Wings.jpg"
    },
    {
      title: "Living Principle",
      description: "Honest reflections on the beauty and struggles of real life through a Christian lens. Quiet reflections from the rhythm of real life—where laughter, struggle, and stillness reveal the gentle fingerprints of God.",
      imageName: "EverydayGrace.jpg"
    }
  ];

  private categoryTypes = [
    "Faith • Inspiration • Truth",
    "Message • Preaching • Life",
    "Mission • Service • Action",
    "Series • Journey • Hope",
    "Grace • Life • Reflection"
  ];

  constructor(private pdfImageService: PdfImageService, 
    private googleAnalytics: GoogleAnalyticsService,
    private elementRef: ElementRef) {}

  ngAfterViewInit() {
    this.loadCategoryImages();
    // Initialize after a short delay to ensure DOM is ready
    setTimeout(() => {
      this.initializeSplitting();
      this.initializeScrollTriggers();
      // Add mobile-specific image handling
      this.handleMobileImages();
    }, 100);
  }

  onViewPDF() {
      if (this.pdfUrl) {
        // Track PDF view
        this.googleAnalytics.trackPdfView(this.pdfMonth, this.pdfId);
        window.open(this.pdfUrl, '_blank');
      } else {
        console.error('PDF URL not available for current issue');
        alert('PDF is not available for this issue. Please try again later.');
      }
  }
  


  private loadCategoryImages() {
    this.pdfImageService.getPageImages(this.pdfId, 5).subscribe({
      next: (imagePaths) => {
        this.categories.forEach((category) => {
          const matchingImage = imagePaths.find(path =>
            path.toLowerCase().includes(category.imageName.toLowerCase().replace('.jpg', ''))
          );

          if (matchingImage) {
            category.imageUrl = matchingImage;
          } else {
            category.imageUrl = `assets/images/highlights/${this.pdfId}/${category.imageName}`;
          }
        });
      },
      error: (error) => {
        console.error('Error fetching images from PDF service:', error);
        this.categories.forEach((category) => {
          category.imageUrl = `assets/images/highlights/${this.pdfId}/${category.imageName}`;
        });
      }
    });
  }

  private initializeSplitting() {
    // Manually split text into words for animation
    const h1 = this.elementRef.nativeElement.querySelector('h1[data-splitting="words"]');
    if (h1) {
      this.splitIntoWords(h1);
    }

    const h2Elements = this.elementRef.nativeElement.querySelectorAll('h2[data-splitting="words"]');
    h2Elements.forEach((h2: HTMLElement) => {
      this.splitIntoWords(h2);
    });
  }

  private splitIntoWords(element: HTMLElement) {
    const text = element.textContent || '';
    const words = text.split(' ').map(word => 
      `<span class="word" data-word="${word}">${word}</span>`
    ).join(' ');
    element.innerHTML = words;
  }

  private initializeScrollTriggers() {
    // Individual section scroll progress
    gsap.utils.toArray(".panel").forEach((section: any, index) => {
      ScrollTrigger.create({
        trigger: section,
        start: "top 80%",
        end: "center 50%",
        scrub: 0,
        onUpdate: (self) => {
          section.style.setProperty("--progress", self.progress.toString());
        }
      });
    });

    // Full page scroll progress
    ScrollTrigger.create({
      trigger: "#wrap",
      start: "top 100%",
      end: "50% 50%",
      scrub: 0,
      onUpdate: (self) => {
        document.body.style.setProperty("--progress", self.progress.toString());
      }
    });

    // Refresh ScrollTrigger after a delay to accommodate transitions
    setTimeout(() => {
      ScrollTrigger.refresh();
    }, 500);
  }

  getCategoryType(index: number): string {
    return this.categoryTypes[index] || "Faith • Inspiration";
  }

  getPlaceholderImage(index: number): string {
    return `https://picsum.photos/400/600?random=${index + 100}`;
  }

  onImageLoad(event: Event) {
    const img = event.target as HTMLImageElement;
    // Add loaded class for mobile slide-up animation
    img.classList.add('loaded');
  }

  private handleMobileImages() {
    // Check if we're on a mobile device
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
      // For mobile devices, ensure images are properly handled
      const images = this.elementRef.nativeElement.querySelectorAll('.thumb img');
      images.forEach((img: HTMLImageElement) => {
        // If image is already loaded, add the loaded class
        if (img.complete) {
          img.classList.add('loaded');
        }
      });
    }
  }

  onImageError(event: Event, index: number) {
    const img = event.target as HTMLImageElement;
    img.src = this.getPlaceholderImage(index);
    console.warn('Image failed to load, using fallback for category:', this.categories[index]?.title);
  }

  ngOnDestroy() {
    // Clean up ScrollTrigger instances
    ScrollTrigger.getAll().forEach(trigger => {
      trigger.kill();
    });
  }
}
