import { Component, OnInit, AfterViewInit, OnDestroy, Input } from '@angular/core';
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
  selector: 'app-featured-articles',
  templateUrl: './featured-articles.component.html',
  styleUrls: ['./featured-articles.component.scss']
})
export class FeaturedArticlesComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() articles: Article[] = [];
  loading = true;
  error = false;
  private scrollTriggerInstance: ScrollTrigger | null = null;

  constructor(
    private articleService: ArticleService,
    private router: Router
  ) {}

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
    console.log('🚀 Initializing horizontal scroll with native scrolling');
    
    // Ensure ScrollTrigger is registered
    try {
      gsap.registerPlugin(ScrollTrigger);
      console.log('✅ ScrollTrigger registered successfully');
    } catch (error) {
      console.error('❌ Error registering ScrollTrigger:', error);
      return;
    }
    
    // Find the horizontal section
    const horizontalSection = document.querySelector('.horizontal') as HTMLElement;
    const triggerElement = document.querySelector('#horizontal-scroll') as HTMLElement;
    
    if (!horizontalSection) {
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
    const totalWidth = horizontalSection.scrollWidth;
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
      
      tl.to(horizontalSection, {
        x: -scrollDistance,
        ease: "none"
      });
      
      // Create ScrollTrigger with much slower and smoother animation
      this.scrollTriggerInstance = ScrollTrigger.create({
        trigger: triggerElement,
        start: "top top",
        end: () => `+=${scrollDistance * 5}`, // 5x longer scroll distance for much slower animation
        pin: true,
        scrub: 0.2, // Much smoother scrub value for more responsive feel
        animation: tl,
        invalidateOnRefresh: true,
        anticipatePin: 1, // Better pin performance
        refreshPriority: -1, // Lower priority for smoother performance
        onEnter: () => {
          console.log('🎯 ScrollTrigger: Entered horizontal scroll section');
          // Add smooth transition class
          horizontalSection.style.willChange = 'transform';
        },
        onLeave: () => {
          console.log('🎯 ScrollTrigger: Left horizontal scroll section');
          // Remove will-change for better performance
          horizontalSection.style.willChange = 'auto';
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
}
