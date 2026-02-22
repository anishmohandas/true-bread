import { Component, OnInit, AfterViewInit, OnDestroy, Input, ElementRef, Renderer2, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Article } from '../../shared/interfaces/article.interface';
import { ArticleService } from '../../services/article.service';

// Register ScrollTrigger plugin
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

@Component({
  standalone: false,
  selector: 'app-featured-articles',
  templateUrl: './featured-articles.component.html',
  styleUrls: ['./featured-articles.component.scss']
})
export class FeaturedArticlesComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() articles: Article[] = [];
  loading = true;
  error = false;
  private scrollTriggerInstance: ScrollTrigger | null = null;
  private touchStartX = 0;
  private touchStartY = 0;
  private currentTranslateX = 0;
  private maxTranslateX = 0;
  private isDragging = false;
  private isMobile = false;
  private isTablet = false;
  private momentumVelocity = 0;
  private momentumAnimationFrame: number | null = null;
  private horizontalSection: HTMLElement | null = null;
  private startX = 0;
  private currentX = 0;
  private startTime = 0;
  private observer: IntersectionObserver | null = null;

  constructor(
    private articleService: ArticleService,
    private router: Router,
    private elementRef: ElementRef,
    private renderer: Renderer2
  ) {
    this.isMobile = window.innerWidth <= 768;
    this.isTablet = window.innerWidth > 768 && window.innerWidth <= 1024;
  }
  
  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    // Update device detection on resize
    const wasMobile = this.isMobile;
    const wasTablet = this.isTablet;
    
    this.isMobile = window.innerWidth <= 768;
    this.isTablet = window.innerWidth > 768 && window.innerWidth <= 1024;
    
    // Only reinitialize if device type changed
    if ((wasMobile !== this.isMobile) || (wasTablet !== this.isTablet)) {
      // Reinitialize horizontal scroll if needed
      if (this.horizontalSection) {
        // Clear existing scroll triggers
        if (this.scrollTriggerInstance) {
          this.scrollTriggerInstance.kill();
          this.scrollTriggerInstance = null;
        }
        
        // Reinitialize with new device settings
        setTimeout(() => {
          this.initializeHorizontalScroll();
        }, 100);
      }
    }
  }

  ngOnInit() {
    if (!this.articles?.length) {
      this.loadFeaturedArticles();
    } else {
      this.loading = false;
    }
  }

  ngAfterViewInit() {
    // Wait for DOM to be ready and ensure native scrolling is active
    setTimeout(() => {
      this.initializeHorizontalScroll();
    }, 1000); // Increased timeout to ensure app component has initialized native scrolling
  }

  ngOnDestroy() {
    // Clean up ScrollTrigger instances
    if (this.scrollTriggerInstance) {
      this.scrollTriggerInstance.kill();
    }
    ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    
    // Remove test button if it exists
    const testButton = document.getElementById('horizontal-test-button');
    if (testButton) {
      testButton.remove();
    }
    
    // Clean up event listeners
    this.cleanupEventListeners();
    
    // Disconnect observer
    if (this.observer) {
      this.observer.disconnect();
    }
    
    // Cancel animation frame
    if (this.momentumAnimationFrame) {
      cancelAnimationFrame(this.momentumAnimationFrame);
    }
  }

  private loadFeaturedArticles() {
    this.loading = true;
    this.error = false;
    
    this.articleService.getFeaturedArticles().subscribe({
      next: (articles) => {
        if (!articles?.length) {
          this.error = true;
          this.loading = false;
          return;
        }
        
        this.articles = articles
          .filter((article): article is Article => 
            article !== null && 
            article !== undefined && 
            typeof article === 'object'
          )
          .map(article => this.transformArticle(article));
        
        this.loading = false;
        
        // Re-initialize horizontal scroll after articles are loaded
        setTimeout(() => {
          this.initializeHorizontalScroll();
        }, 100);
      },
      error: (error) => {
        console.error('Error fetching featured articles:', error);
        this.error = true;
        this.loading = false;
      }
    });
  }

  private transformArticle(article: Article): Article {
    const base = {
      id: article.id || '',
      title: 'Untitled Article',
      author: 'Unknown Author',
      category: 'Uncategorized',
      altText: 'Article image',
      imageUrl: '/assets/images/placeholder.jpg',
      content: article.content || '',
      excerpt: article.excerpt || '',
      publishDate: article.publishDate || new Date().toISOString(),
      readTime: article.readTime || 0,
      language: article.language || 'en' as const,
      tags: article.tags || []
    };

    if (article.language === 'ml') {
      return {
        ...base,
        ...article,
        title: article.titleMl || article.title || base.title,
        author: article.authorMl || article.author || base.author,
        category: article.categoryMl || article.category || base.category,
        altText: article.altTextMl || article.altText || base.altText,
        imageUrl: article.imageUrl || base.imageUrl
      };
    }

    return {
      ...base,
      ...article,
      title: article.title || base.title,
      author: article.author || base.author,
      category: article.category || base.category,
      altText: article.altText || base.altText,
      imageUrl: article.imageUrl || base.imageUrl
    };
  }

  navigateToArticle(articleId: string) {
    this.router.navigate(['/articles', articleId]);
  }

  handleImageError(event: Event) {
    if (event?.target) {
      const img = event.target as HTMLImageElement;
      img.src = '/assets/images/placeholder.jpg';
    }
  }

  private initializeHorizontalScroll() {
    console.log('🚀 Initializing horizontal scroll with mobile-first optimization');
    
    // Find the horizontal section
    this.horizontalSection = document.querySelector('.horizontal') as HTMLElement;
    const triggerElement = document.querySelector('#horizontal-scroll') as HTMLElement;
    
    if (!this.horizontalSection) {
      console.error('❌ Horizontal section (.horizontal) not found');
      return;
    }
    
    if (!triggerElement) {
      console.error('❌ Trigger element (#horizontal-scroll) not found');
      return;
    }

    console.log('✅ Elements found successfully');
    
    // Calculate scroll distance
    const containerWidth = window.innerWidth;
    const totalWidth = this.horizontalSection.scrollWidth;
    const scrollDistance = totalWidth - containerWidth;
    
    console.log('📐 Scroll calculations:');
    console.log('- Container width:', containerWidth);
    console.log('- Total width:', totalWidth);
    console.log('- Scroll distance:', scrollDistance);
    
    // Only proceed if there's content to scroll
    if (scrollDistance <= 0) {
      console.log('⚠️ No horizontal scrolling needed - content fits in viewport');
      return;
    }
    
    // Mobile-first approach: Use native scrolling for mobile devices
    if (this.isMobile) {
      console.log('📱 Mobile device detected - using native CSS scroll-snap');
      this.setupNativeScrolling();
      this.setupIntersectionObserver();
      return;
    }
    
    // Tablet approach: Hybrid with reduced animations
    if (this.isTablet) {
      console.log('📱 Tablet device detected - using hybrid approach');
      this.setupTabletScrolling(scrollDistance);
      this.setupIntersectionObserver();
      return;
    }
    
    // Desktop approach: Full GSAP ScrollTrigger
    console.log('🖥️ Desktop device detected - using GSAP ScrollTrigger');
    this.setupDesktopScrolling(scrollDistance, triggerElement);
    this.setupIntersectionObserver();
  }
  
  private setupNativeScrolling() {
    if (!this.horizontalSection) return;
    
    // Add CSS classes for native scrolling
    this.renderer.addClass(this.horizontalSection, 'native-scroll');
    this.renderer.setStyle(this.horizontalSection, 'scroll-snap-type', 'x mandatory');
    this.renderer.setStyle(this.horizontalSection, 'overflow-x', 'scroll');
    this.renderer.setStyle(this.horizontalSection, 'scroll-behavior', 'smooth');
    
    // Add scroll-snap-align to each slide
    const slides = this.horizontalSection.querySelectorAll('.slide');
    slides.forEach(slide => {
      this.renderer.setStyle(slide, 'scroll-snap-align', 'start');
    });
    
    // Add momentum scrolling for better feel
    this.renderer.setStyle(this.horizontalSection, '-webkit-overflow-scrolling', 'touch');
    
    // Add visual indicators for swipeable content
    this.addSwipeIndicators();
    
    // Add touch event listeners for enhanced gestures
    this.addTouchListeners();
  }
  
  private setupTabletScrolling(scrollDistance: number) {
    if (!this.horizontalSection) return;
    
    // Use reduced GSAP ScrollTrigger for tablet
    try {
      gsap.registerPlugin(ScrollTrigger);
      
      // Kill any existing ScrollTrigger instances for this element
      ScrollTrigger.getAll().forEach(trigger => {
        if (trigger.trigger === this.horizontalSection) {
          trigger.kill();
        }
      });
      
      // Create the animation timeline with reduced intensity
      const tl = gsap.timeline();
      
      tl.to(this.horizontalSection, {
        x: -scrollDistance,
        ease: "none"
      });
      
      // Create ScrollTrigger with reduced scroll distance multiplier
      this.scrollTriggerInstance = ScrollTrigger.create({
        trigger: this.horizontalSection,
        start: "top top",
        end: () => `+=${scrollDistance * 3}`, // 3x multiplier for tablet
        pin: true,
        scrub: 0.4, // Reduced scrub for better performance
        animation: tl,
        invalidateOnRefresh: true,
        anticipatePin: 0.5,
        refreshPriority: -1,
        onEnter: () => {
          console.log('🎯 Tablet ScrollTrigger: Entered horizontal scroll section');
          // Add smooth transition class
          if (this.horizontalSection) {
            this.horizontalSection.style.willChange = 'transform';
          }
        },
        onLeave: () => {
          console.log('🎯 Tablet ScrollTrigger: Left horizontal scroll section');
          // Remove will-change for better performance
          if (this.horizontalSection) {
            this.horizontalSection.style.willChange = 'auto';
          }
        }
      });
      
      console.log('✅ Tablet horizontal scroll ScrollTrigger created successfully');
      ScrollTrigger.refresh();
    } catch (error) {
      console.error('❌ Error creating tablet ScrollTrigger:', error);
      // Fallback to native scrolling
      this.setupNativeScrolling();
    }
  }
  
  private setupDesktopScrolling(scrollDistance: number, triggerElement: HTMLElement) {
    // Ensure ScrollTrigger is registered
    try {
      gsap.registerPlugin(ScrollTrigger);
      console.log('✅ ScrollTrigger registered successfully');
    } catch (error) {
      console.error('❌ Error registering ScrollTrigger:', error);
      return;
    }
    
    // Create the horizontal scroll animation with ScrollTrigger
    try {
      // Kill any existing ScrollTrigger instances for this element
      ScrollTrigger.getAll().forEach(trigger => {
        if (trigger.trigger === triggerElement) {
          trigger.kill();
        }
      });
      
      // Create the animation timeline
      const tl = gsap.timeline();
      
      tl.to(this.horizontalSection, {
        x: -scrollDistance,
        ease: "none"
      });
      
      // Create ScrollTrigger with reduced scroll distance multiplier (2x instead of 5x)
      this.scrollTriggerInstance = ScrollTrigger.create({
        trigger: triggerElement,
        start: "top top",
        end: () => `+=${scrollDistance * 2}`, // 2x longer scroll distance for much slower animation (reduced from 5x)
        pin: true,
        scrub: 0.2, // Much smoother scrub value for more responsive feel
        animation: tl,
        invalidateOnRefresh: true,
        anticipatePin: 1, // Better pin performance
        refreshPriority: -1, // Lower priority for smoother performance
        onEnter: () => {
          console.log('🎯 ScrollTrigger: Entered horizontal scroll section');
          // Add smooth transition class
          if (this.horizontalSection) {
            this.horizontalSection.style.willChange = 'transform';
          }
        },
        onLeave: () => {
          console.log('🎯 ScrollTrigger: Left horizontal scroll section');
          // Remove will-change for better performance
          if (this.horizontalSection) {
            this.horizontalSection.style.willChange = 'auto';
          }
        },
        onUpdate: (self) => {
          console.log(`📊 ScrollTrigger Progress: ${Math.round(self.progress * 100)}%`);
        },
        onRefresh: () => {
          console.log('🔄 ScrollTrigger: Refreshed');
        }
      });
      
      console.log('✅ Horizontal scroll ScrollTrigger created successfully');
      
      // Refresh ScrollTrigger to ensure proper calculations
      ScrollTrigger.refresh();
      
    } catch (error) {
      console.error('❌ Error creating ScrollTrigger:', error);
    }
  }
  
  private addSwipeIndicators() {
    if (!this.horizontalSection) return;
    
    // Add visual indicator for swipeable content
    const indicator = document.createElement('div');
    indicator.className = 'swipe-indicator';
    indicator.innerHTML = `
      <div class="swipe-hint">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
    `;
    
    this.horizontalSection.parentElement?.appendChild(indicator);
  }
  
  private setupIntersectionObserver() {
    // Create intersection observer for lazy loading
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Add a class to trigger animations when element is in view
          entry.target.classList.add('in-view');
        }
      });
    }, {
      root: null,
      rootMargin: '0px',
      threshold: 0.1
    });
    
    // Observe each slide
    if (this.horizontalSection) {
      const slides = this.horizontalSection.querySelectorAll('.slide');
      slides.forEach(slide => {
        this.observer?.observe(slide);
      });
    }
  }
  
  private addTouchListeners() {
    if (!this.horizontalSection) return;
    
    // Add touch event listeners for enhanced gestures to the entire scrollable area
    this.horizontalSection.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: true });
    this.horizontalSection.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
    this.horizontalSection.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: true });
    
    // Add mouse event listeners for drag support to the entire scrollable area
    this.horizontalSection.addEventListener('mousedown', this.handleMouseDown.bind(this));
    this.horizontalSection.addEventListener('mousemove', this.handleMouseMove.bind(this));
    this.horizontalSection.addEventListener('mouseup', this.handleMouseUp.bind(this));
    this.horizontalSection.addEventListener('mouseleave', this.handleMouseUp.bind(this));
    
    // Ensure all child elements can be used for swipe gestures
    const allElements = this.horizontalSection.querySelectorAll('*');
    allElements.forEach(element => {
      element.addEventListener('touchstart', (e) => {
        // Allow touch events to bubble up to the parent for swipe handling
        e.stopPropagation();
      }, { passive: true });
      
      element.addEventListener('touchmove', (e) => {
        // Allow touch events to bubble up to the parent for swipe handling
        e.stopPropagation();
      }, { passive: true });
      
      element.addEventListener('touchend', (e) => {
        // Allow touch events to bubble up to the parent for swipe handling
        e.stopPropagation();
      }, { passive: true });
    });
  }
  
  private cleanupEventListeners() {
    if (!this.horizontalSection) return;
    
    this.horizontalSection.removeEventListener('touchstart', this.handleTouchStart.bind(this));
    this.horizontalSection.removeEventListener('touchmove', this.handleTouchMove.bind(this));
    this.horizontalSection.removeEventListener('touchend', this.handleTouchEnd.bind(this));
    
    this.horizontalSection.removeEventListener('mousedown', this.handleMouseDown.bind(this));
    this.horizontalSection.removeEventListener('mousemove', this.handleMouseMove.bind(this));
    this.horizontalSection.removeEventListener('mouseup', this.handleMouseUp.bind(this));
    this.horizontalSection.removeEventListener('mouseleave', this.handleMouseUp.bind(this));
  }
  
  private handleTouchStart(event: TouchEvent) {
    if (!this.horizontalSection) return;
    
    this.startX = event.touches[0].clientX;
    this.startTime = Date.now();
    this.currentX = this.horizontalSection.scrollLeft;
    this.isDragging = true;
    
    // Cancel any ongoing momentum animation
    if (this.momentumAnimationFrame) {
      cancelAnimationFrame(this.momentumAnimationFrame);
    }
  }
  
  private handleTouchMove(event: TouchEvent) {
    if (!this.isDragging || !this.horizontalSection) return;
    
    const touchX = event.touches[0].clientX;
    const deltaX = this.startX - touchX;
    
    // Prevent vertical scrolling when horizontal scrolling is intended
    if (Math.abs(deltaX) > 5) {
      event.preventDefault();
    }
    
    // Apply horizontal scroll
    this.horizontalSection.scrollLeft = this.currentX + deltaX;
  }
  
  private handleTouchEnd(event: TouchEvent) {
    if (!this.isDragging || !this.horizontalSection) return;
    
    this.isDragging = false;
    const endTime = Date.now();
    const deltaX = this.startX - event.changedTouches[0].clientX;
    const deltaTime = endTime - this.startTime;
    
    // Calculate velocity for momentum scrolling
    this.momentumVelocity = deltaX / deltaTime;
    
    // Apply momentum if velocity is significant
    if (Math.abs(this.momentumVelocity) > 0.1) {
      this.applyMomentumScroll();
    }
  }
  
  private handleMouseDown(event: MouseEvent) {
    if (!this.horizontalSection) return;
    
    this.startX = event.clientX;
    this.startTime = Date.now();
    this.currentX = this.horizontalSection.scrollLeft;
    this.isDragging = true;
    
    // Cancel any ongoing momentum animation
    if (this.momentumAnimationFrame) {
      cancelAnimationFrame(this.momentumAnimationFrame);
    }
    
    event.preventDefault();
  }
  
  private handleMouseMove(event: MouseEvent) {
    if (!this.isDragging || !this.horizontalSection) return;
    
    const mouseX = event.clientX;
    const deltaX = this.startX - mouseX;
    
    // Apply horizontal scroll
    this.horizontalSection.scrollLeft = this.currentX + deltaX;
  }
  
  private handleMouseUp(event: MouseEvent) {
    if (!this.isDragging || !this.horizontalSection) return;
    
    this.isDragging = false;
    const endTime = Date.now();
    const deltaX = this.startX - event.clientX;
    const deltaTime = endTime - this.startTime;
    
    // Calculate velocity for momentum scrolling
    this.momentumVelocity = deltaX / deltaTime;
    
    // Apply momentum if velocity is significant
    if (Math.abs(this.momentumVelocity) > 0.1) {
      this.applyMomentumScroll();
    }
  }
  
  private applyMomentumScroll() {
    if (!this.horizontalSection) return;
    
    const applyMomentum = () => {
      // Apply momentum effect with better smoothing
      const momentumEffect = this.momentumVelocity * 15;
      this.horizontalSection!.scrollLeft += momentumEffect;
      
      // Reduce velocity for deceleration effect with better easing
      this.momentumVelocity *= 0.92;
      
      // Continue animation if velocity is still significant
      if (Math.abs(this.momentumVelocity) > 0.05) {
        this.momentumAnimationFrame = requestAnimationFrame(applyMomentum);
      } else {
        // Ensure we stop the animation
        if (this.momentumAnimationFrame) {
          cancelAnimationFrame(this.momentumAnimationFrame);
          this.momentumAnimationFrame = null;
        }
      }
    };
    
    this.momentumAnimationFrame = requestAnimationFrame(applyMomentum);
  }
}
