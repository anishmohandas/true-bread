import { Component, OnInit, OnDestroy, NgZone, ViewChild, ElementRef } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { AnimationService } from '../../services/animation.service';
import { ScrollTrackerService } from '../../services/scroll-tracker.service';

interface MenuItem {
  text: string;
  link: string;
}

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {
  @ViewChild('hamburger') hamburgerRef!: ElementRef;
  isMenuOpen = false;
  showNav = true;
  isNavVisible = true;
  private lastScrollPosition = 0;
  private scrollThreshold = 50; // Minimum scroll amount before hiding/showing
  private scrollTimeout: any;
  private routerSubscription: Subscription;
  private inLatestIssueSectionSubscription: Subscription | null = null;
  private pastLatestIssueSectionSubscription: Subscription | null = null;
  public inLatestIssueSection = false;
  public pastLatestIssueSection = false;

  menuItems: MenuItem[] = [
    { text: 'Home', link: '/' },
    { text: 'Publications', link: '/publications' },
    { text: 'Articles', link: '/articles' },
    { text: 'About', link: '/about' },
    { text: 'Contact', link: '/contact' }
  ];

  socialLinks = [
    {
      icon: 'assets/images/facebook.svg',
      link: 'https://facebook.com/truebread',
      alt: 'Facebook'
    },
    {
      icon: 'assets/images/twitter.svg',
      link: 'https://twitter.com/truebread',
      alt: 'Twitter'
    },
    {
      icon: 'assets/images/instagram.svg',
      link: 'https://instagram.com/truebread',
      alt: 'Instagram'
    }
  ];

  constructor(
    private router: Router,
    private animationService: AnimationService,
    private ngZone: NgZone,
    private scrollTrackerService: ScrollTrackerService
  ) {
    // Subscribe to router events
    this.routerSubscription = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      // Close menu when navigation ends
      if (this.isMenuOpen) {
        this.isMenuOpen = false;
        // Dispatch event to notify other components
        const menuToggleEvent = new CustomEvent('menuStateChange', {
          detail: { isOpen: false }
        });
        window.dispatchEvent(menuToggleEvent);
      }
    });
  }

  ngOnInit() {
    //console.log('Header component initialized');
    this.animationService.hasSeenPreloader$.subscribe(seen => {
      //console.log('Preloader seen:', seen);
      this.showNav = seen;
    });

    // Subscribe to latest issue section state
    this.inLatestIssueSectionSubscription = this.scrollTrackerService.inLatestIssueSection$.subscribe(inSection => {
      //console.log('Header received inLatestIssueSection update:', inSection);
      this.inLatestIssueSection = inSection;
      this.updateHeaderVisibility();
    });

    // Subscribe to past latest issue section state
    this.pastLatestIssueSectionSubscription = this.scrollTrackerService.pastLatestIssueSection$.subscribe(pastSection => {
      //console.log('Header received pastLatestIssueSection update:', pastSection);
      this.pastLatestIssueSection = pastSection;
      this.updateHeaderVisibility();
    });

    // Add scroll event listener
    window.addEventListener('scroll', this.handleScroll.bind(this));
  }

  ngOnDestroy() {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
    if (this.scrollTimeout) {
      clearTimeout(this.scrollTimeout);
    }
    if (this.inLatestIssueSectionSubscription) {
      this.inLatestIssueSectionSubscription.unsubscribe();
    }
    if (this.pastLatestIssueSectionSubscription) {
      this.pastLatestIssueSectionSubscription.unsubscribe();
    }
  }

  /**
   * Update the header visibility based on scroll position and latest issue section state
   */
  private updateHeaderVisibility(): void {
    //console.log('Updating header visibility. In latest issue:', this.inLatestIssueSection, 'Past latest issue:', this.pastLatestIssueSection);

    // If we're in the latest issue section, hide the header
    if (this.inLatestIssueSection) {
      //console.log('In latest issue section - hiding header');
      this.isNavVisible = false;

      // Force the header to be hidden
      const headerContainer = document.querySelector('.header-container') as HTMLElement;
      if (headerContainer) {
        headerContainer.classList.add('nav-hidden');
        headerContainer.classList.remove('animate-drop-down');
      }
    }
    // If we've scrolled past the latest issue section, show the header with animation
    else if (this.pastLatestIssueSection) {
     // console.log('Past latest issue section - showing header with animation');
      this.ngZone.run(() => {
        this.isNavVisible = true;

        // Add animation class for smooth drop-down effect
        const headerContainer = document.querySelector('.header-container') as HTMLElement;
        if (headerContainer) {
          headerContainer.classList.remove('nav-hidden');
          headerContainer.classList.add('animate-drop-down');
        }
      });
    }
    // Otherwise, use the default scroll behavior
    else {
      //console.log('Not in or past latest issue section - using default behavior');
      // Default behavior is handled by handleScroll method
    }
  }

  private handleScroll(): void {
    // If we're in the latest issue section or the menu is open, don't change visibility
    if (this.isMenuOpen || this.inLatestIssueSection) {
      //console.log('Menu open or in latest issue section - not changing visibility in handleScroll');
      return;
    }

    // If we've scrolled past the latest issue section, let updateHeaderVisibility handle it
    if (this.pastLatestIssueSection) {
      //console.log('Past latest issue section - letting updateHeaderVisibility handle it');
      return;
    }

    const currentScrollPosition = window.pageYOffset;

    // Check if we've scrolled past threshold
    if (Math.abs(currentScrollPosition - this.lastScrollPosition) < this.scrollThreshold) {
      return;
    }

    // Hide header when scrolling down, show when scrolling up
    const scrollingDown = currentScrollPosition > this.lastScrollPosition;
    this.isNavVisible = !scrollingDown;
    this.lastScrollPosition = currentScrollPosition;

    // Apply the nav-hidden class directly to ensure it works
    const headerContainer = document.querySelector('.header-container') as HTMLElement;
    if (headerContainer) {
      if (!this.isNavVisible) {
        headerContainer.classList.add('nav-hidden');
      } else {
        headerContainer.classList.remove('nav-hidden');
      }
    }

    // Clear existing timeout
    if (this.scrollTimeout) {
      clearTimeout(this.scrollTimeout);
    }

    // Show nav after user stops scrolling
    if (!this.isNavVisible) {
      this.scrollTimeout = setTimeout(() => {
        this.ngZone.run(() => {
          //console.log('Showing nav after timeout');
          this.isNavVisible = true;

          // Remove the nav-hidden class
          if (headerContainer) {
            headerContainer.classList.remove('nav-hidden');
          }
        });
      }, 1000);
    }
  }

  onLogoClick() {
    this.router.navigate(['/']);
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;

    // If you need to trigger any animations or other side effects,
    // you can do so here

    //console.log('Menu toggled:', this.isMenuOpen);
  }

  onHamburgerClick(event: Event) {
    //console.log('Hamburger clicked - Event type:', event.type);
    event.preventDefault();
    event.stopPropagation();

    // Prevent double-firing of events
    if (event.type === 'click' || event.type === 'touchend') {
      this.toggleMenu();
    }
  }


  onMenuToggle(isOpen: boolean) {
    this.isMenuOpen = isOpen;
  }

  // toggleMenu() {
  //   this.isMenuOpen = !this.isMenuOpen;

  //   const megaMenu = document.querySelector('.mega-menu') as HTMLElement;
  //   const menuContent = document.querySelector('.menu-content') as HTMLElement;
  //   const hamburger = this.hamburgerRef.nativeElement;
  //   const menuItems = document.querySelectorAll('.menu-item');
  //   const headerContainer = document.querySelector('.header-container') as HTMLElement;

  //   if (!megaMenu || !menuContent || !headerContainer) {
  //     console.error('Required elements not found');
  //     return;
  //   }

  //   hamburger.classList.toggle('active');

  //   if (this.isMenuOpen) {
  //     // Opening animation
  //     gsap.set(megaMenu, {
  //       visibility: 'visible',
  //       y: '100%'
  //     });

  //     const tl = gsap.timeline({
  //       defaults: { ease: 'power3.inOut' }
  //     });

  //     tl.to(megaMenu, {
  //       y: '0%',
  //       duration: 1.5
  //     })
  //     .to(menuContent, {
  //       opacity: 1,
  //       duration: 0.5
  //     }, '-=0.3')
  //     .to(menuItems, {
  //       opacity: 1,
  //       y: 0,
  //       stagger: 0.1,
  //       duration: 0.5
  //     }, '-=0.3');

  //     document.body.style.overflow = 'hidden';
  //   } else {
  //     // Closing animation
  //     headerContainer.style.backgroundColor = 'rgba(255, 255, 255, 0.98)';
  //     const tl = gsap.timeline({
  //       defaults: { ease: 'power3.inOut' },
  //       onComplete: () => {
  //         gsap.set(megaMenu, { visibility: 'hidden' });
  //       }
  //     });

  //     tl.to(menuItems, {
  //       opacity: 0,
  //       y: 20,
  //       stagger: 0.05,
  //       duration: 0.3
  //     })
  //     .to(menuContent, {
  //       opacity: 0,
  //       duration: 0.3
  //     }, '-=0.2')
  //     .to(megaMenu, {
  //       y: '100%',
  //       duration: 0.8
  //     }, '-=0.2');

  //     document.body.style.overflow = '';
  //   }
  // }
}

















