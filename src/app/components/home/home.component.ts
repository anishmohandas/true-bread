import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Router, NavigationEnd, Event } from '@angular/router';
import { filter } from 'rxjs/operators';
import { gsap } from 'gsap';
import { AnimationService } from '../../services/animation.service';
import { ArticleService } from '../../services/article.service';
import { Article } from '../../shared/interfaces/article.interface';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, AfterViewInit {
  private hasAnimated = false;
  featuredArticles: Article[] = [];
  showContent = true; // Set to true by default to show content immediately
  showPreloader = false;
  isHomePage = true;
  isAtLastSection = false; // Track if we're at the last section

  constructor(
    private animationService: AnimationService,
    private articleService: ArticleService,
    private router: Router
  ) {
    // Listen to route changes
    this.router.events.pipe(
      filter((event: Event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event) => {
      this.isHomePage = event.url === '/';
    });
  }

  ngOnInit() {
    //console.log('🏠 Home component ngOnInit called');
    //console.log('🏠 isHomePage:', this.isHomePage);
    //console.log('🏠 showContent:', this.showContent);

    // Only fetch articles if we're on the home page
    if (this.isHomePage) {
      //console.log('🏠 Fetching featured articles...');
      this.articleService.getFeaturedArticles().subscribe(
        articles => {
         // console.log('🏠 Featured articles received:', articles);
          this.featuredArticles = articles;
        }
      );

      // Check if preloader should be shown
      this.animationService.hasSeenPreloader$.subscribe(
        seen => this.showPreloader = !seen
      );

      // Listen for preloader completion
      this.animationService.preloaderComplete$.subscribe(() => {
        setTimeout(() => {
          this.showContent = true;
        }, 1000);
      });

      // Setup scroll listener for navigation ball
      this.setupScrollListener();
    }
  }

  ngAfterViewInit() {
    if (this.isHomePage) {
      this.animationService.preloaderComplete$.subscribe(() => {
        if (!this.hasAnimated) {
          //this.initVerseAnimation();
        }
      });
    }
  }

  
  // Old method removed - using new clean implementation below

  // Clean navigation ball methods
  private setupScrollListener() {
    window.addEventListener('scroll', () => {
      this.checkLastSection();
    });
  }

  private checkLastSection() {
    const testimonialsElement = document.querySelector('app-testimonials');
    if (testimonialsElement) {
      const rect = testimonialsElement.getBoundingClientRect();
      const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
      this.isAtLastSection = isVisible;
    }
  }

  scrollToNextSection() {
    if (this.isAtLastSection) {
      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // Define sections in order
    const sections = [
      'app-latest-issue',
      'app-issue-highlights',
      'app-editors-note',
      'app-featured-articles',
      'app-subscription',
      'app-testimonials'
    ];

    // Find next section to scroll to
    const currentScroll = window.scrollY + window.innerHeight / 2;

    for (const sectionSelector of sections) {
      const element = document.querySelector(sectionSelector);
      if (element) {
        const rect = element.getBoundingClientRect();
        const elementTop = rect.top + window.scrollY;

        if (elementTop > currentScroll) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          return;
        }
      }
    }
  }


}







