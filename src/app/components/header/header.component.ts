import { Component, OnInit, OnDestroy, NgZone, ViewChild, ElementRef } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { AnimationService } from '../../services/animation.service';
import { gsap } from 'gsap';

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
    private ngZone: NgZone
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
    console.log('Header component initialized');
    this.animationService.hasSeenPreloader$.subscribe(seen => {
      console.log('Preloader seen:', seen);
      this.showNav = seen;
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
  }

  private handleScroll(): void {
    if (this.isMenuOpen) {
      console.log('Menu is open, not hiding nav');
      return;
    }

    const currentScrollPosition = window.pageYOffset;
    
    // Check if we've scrolled past threshold
    if (Math.abs(currentScrollPosition - this.lastScrollPosition) < this.scrollThreshold) {
      console.log('Below threshold, not hiding nav');
      return;
    }

    console.log('Hiding nav, current scroll:', currentScrollPosition);
    this.isNavVisible = false;
    this.lastScrollPosition = currentScrollPosition;

    // Clear existing timeout
    if (this.scrollTimeout) {
      clearTimeout(this.scrollTimeout);
    }

    // Show nav after user stops scrolling
    this.scrollTimeout = setTimeout(() => {
      this.ngZone.run(() => {
        console.log('Showing nav after timeout');
        this.isNavVisible = true;
      });
    }, 1000);
  }

  onLogoClick() {
    this.router.navigate(['/']);
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
    
    // If you need to trigger any animations or other side effects,
    // you can do so here
    
    console.log('Menu toggled:', this.isMenuOpen);
  }

  onHamburgerClick(event: Event) {
    console.log('Hamburger clicked - Event type:', event.type);
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

















