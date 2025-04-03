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
  showContent = false;
  showPreloader = false;
  isHomePage = true;

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
    // Only fetch articles if we're on the home page
    if (this.isHomePage) {
      this.articleService.getFeaturedArticles().subscribe(
        articles => this.featuredArticles = articles
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
    }
  }

  ngAfterViewInit() {
    if (this.isHomePage) {
      this.animationService.preloaderComplete$.subscribe(() => {
        if (!this.hasAnimated) {
          this.initVerseAnimation();
        }
      });
    }
  }

  private initVerseAnimation() {
    if (this.hasAnimated) return;
    this.hasAnimated = true;
    
    console.log('Starting verse animation');
    
    const verseLines = gsap.utils.toArray<HTMLElement>('.verse-line');
    const verseReference = document.querySelector('.verse-reference') as HTMLElement;

    console.log('Found verse lines:', verseLines.length);
    console.log('Found verse reference:', verseReference);

    // Set initial state explicitly with GSAP
    gsap.set([...verseLines, verseReference], {
      opacity: 0,
      y: 50
    });

    const tl = gsap.timeline({
      defaults: {
        ease: "power4.out",
        duration: 1
      }
    });

    verseLines.forEach((line, index) => {
      console.log(`Animating line ${index}`);
      tl.to(line, {
        opacity: 1,
        y: 0,
        duration: 1,
        onStart: () => console.log(`Animation started for line ${index}`),
        onComplete: () => console.log(`Animation completed for line ${index}`)
      }, index * 0.3);
    });

    if (verseReference) {
      tl.to(verseReference, {
        opacity: 1,
        y: 0,
        duration: 1,
        onStart: () => console.log('Reference animation started'),
        onComplete: () => console.log('Reference animation completed')
      }, "-=0.5");
    }
  }

  
}







