import { Component, Input, OnInit, OnChanges, OnDestroy, ViewChild, ElementRef, SimpleChanges } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { gsap } from 'gsap';
import { CustomEase } from 'gsap/CustomEase';
import { filter } from 'rxjs/operators';

interface SocialLink {
  name: string;
  url: string;
  alt: string;
}

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent implements OnInit, OnChanges, OnDestroy {
  @Input() isOpen = false;
  @ViewChild('headerText', { static: true }) headerText!: ElementRef<HTMLHeadingElement>;

  private animations: gsap.core.Timeline[] = [];
  private currentRoute: string = '';

  links = [
    { url: '/', text: 'Home' },
    { url: '/publications', text: 'Publications' },
    { url: '/articles', text: 'Articles' },
    { url: '/about', text: 'About' },
    { url: '/contact', text: 'Contact' }
  ];

  contactInfo = [
    'True Bread Media',
    'Marayamuttom PO',
    'Trivandrum, 695124',
    'India',
    '',
    'truebreadmedia@gmail.com',
    ''
  ];

  socialLinks: SocialLink[] = [
    {
      name: 'Instagram',
      url: 'https://www.instagram.com/truebreadmedia/',
      alt: 'Instagram'
    },
    {
      name: 'Facebook',
      url: 'https://www.facebook.com/people/True-Bread-Media/61574408447773',
      alt: 'Facebook'
    },
    {
      name: 'YouTube',
      url: 'https://www.youtube.com/@truebreadmedia',
      alt: 'YouTube'
    }
  ];

  constructor(
    private el: ElementRef,
    private router: Router
  ) {
    gsap.registerPlugin(CustomEase);
    CustomEase.create(
      "hop",
      "M0,0 C0.354,0 0.464,0.133 0.498,0.502 0.532,0.872 0.651,1 1,1"
    );
    
    // Track current route
    this.currentRoute = this.router.url;
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.currentRoute = event.url;
      });
  }

  navigateToRoute(url: string): void {
    // Check if user is already on the same route
    if (this.currentRoute === url) {
      console.log(`🚫 Already on route ${url} - preventing navigation`);
      // Just close the menu without navigating
      this.animateMenu(false);
      // Emit the menu state change to parent
      const menuToggleEvent = new CustomEvent('menuStateChange', {
        detail: { isOpen: false }
      });
      window.dispatchEvent(menuToggleEvent);
      return;
    }

    console.log(`✅ Navigating from ${this.currentRoute} to ${url}`);
    // First trigger the closing animation
    this.animateMenu(false);

    // Wait for animation to complete before navigating
    setTimeout(() => {
      this.router.navigate([url]);
      // Emit the menu state change to parent
      const menuToggleEvent = new CustomEvent('menuStateChange', {
        detail: { isOpen: false }
      });
      window.dispatchEvent(menuToggleEvent);
    }, 1000); // Adjust timing to match your animation duration
  }


  ngOnInit(): void {
    this.initializeMenu();
    this.splitText();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen']) {
      // Add or remove menu-open class to hide/show scroll bar
      if (this.isOpen) {
        document.body.classList.add('menu-open');
        document.documentElement.classList.add('menu-open');
      } else {
        document.body.classList.remove('menu-open');
        document.documentElement.classList.remove('menu-open');
      }
      
      this.animateMenu(this.isOpen);
      // Emit menu state change to parent
      const menuToggleEvent = new CustomEvent('menuStateChange', {
        detail: { isOpen: this.isOpen }
      });
      window.dispatchEvent(menuToggleEvent);
    }
  }

  ngOnDestroy(): void {
    // Clean up all GSAP animations
    this.animations.forEach((animation: gsap.core.Timeline) => animation.kill());
  }

  private initializeMenu() {
    // Wait for elements to be available in DOM
    setTimeout(() => {
      const menu = this.el.nativeElement.querySelector('.menu');
      const links = Array.from(this.el.nativeElement.querySelectorAll('.link'));
      const socialLinks = Array.from(this.el.nativeElement.querySelectorAll('.socials p'));
      const headerSpans = Array.from(this.el.nativeElement.querySelectorAll('.header h1 span'));

      // Only set initial states if elements exist
      if (links.length) {
        gsap.set(links, { y: 30, opacity: 0 });
      }
      if (socialLinks.length) {
        gsap.set(socialLinks, { y: 30, opacity: 0 });
      }

      // Set initial state for subscribe link
      const subscribeLinks = Array.from(this.el.nativeElement.querySelectorAll('.subscribe-link-container p'));
      if (subscribeLinks.length) {
        gsap.set(subscribeLinks, { y: 30, opacity: 0 });
      }
      gsap.set('.video-wrapper', {
        clipPath: "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)"
      });
      if (headerSpans.length) {
        gsap.set(headerSpans, {
          y: 500,
          rotateY: 90,
          scale: 0.8
        });
      }
    }, 0);
  }

  private splitText(): void {
    if (!this.headerText?.nativeElement) return;

    const text = this.headerText.nativeElement.innerText;
    const splitText = text
      .split('')
      .map((char: string) => `<span>${char === ' ' ? '&nbsp;&nbsp;' : char}</span>`)
      .join('');
    this.headerText.nativeElement.innerHTML = splitText;
  }

  private setupLinkHoverAnimations(): void {
    // Wait for DOM to be ready and menu to be initialized
    setTimeout(() => {
      //console.log('Setting up airport board hover animations...');

      // Main navigation links
      const navLinks = this.el.nativeElement.querySelectorAll('.links .link a');
      //console.log('Found nav links:', navLinks.length);

      navLinks.forEach((link: HTMLElement, index: number) => {
        this.setupAirportBoardEffect(link);
      });

      // Social links
      const socialLinks = this.el.nativeElement.querySelectorAll('.socials a');
      //console.log('Found social links:', socialLinks.length);

      socialLinks.forEach((link: HTMLElement, index: number) => {
        this.setupAirportBoardEffect(link);
      });

      // Subscribe link
      const subscribeLink = this.el.nativeElement.querySelector('.subscribe-link-container .link');
      //console.log('Found subscribe link:', subscribeLink);

      if (subscribeLink) {
        this.setupAirportBoardEffect(subscribeLink);
      }

    }, 100);
  }

  private setupAirportBoardEffect(element: HTMLElement): void {
    const originalText = element.getAttribute('data-text') || element.textContent || '';
    const textSpan = element.querySelector('.text-original') as HTMLElement;
    
    if (!textSpan) return;

    // Create unique identifiers to prevent cross-contamination
    const uniqueId = Math.random().toString(36).substr(2, 9);
    
    // Split text into individual character spans with unique classes
    const splitText = originalText
      .split('')
      .map((char: string, index: number) => {
        const isSpace = char === ' ';
        return `<span class="char char-${uniqueId}" data-char="${char}" data-index="${index}" style="display: inline-block; position: relative; overflow: visible; height: auto; min-height: 1.5em; vertical-align: top;">
          <span class="char-original char-original-${uniqueId}" style="display: block; transform: translateY(0%); overflow: visible;">${isSpace ? '&nbsp;' : char}</span>
          <span class="char-hover char-hover-${uniqueId}" style="display: block; position: absolute; top: 0; left: 0; transform: translateY(100%); color: rgb(204, 234, 55); overflow: visible;">${isSpace ? '&nbsp;' : char}</span>
        </span>`;
      })
      .join('');

    textSpan.innerHTML = splitText;

    // Use the unique selectors to prevent cross-contamination
    const chars = element.querySelectorAll(`.char-${uniqueId}`);

    // Remove any existing event listeners to prevent duplicates
    const newElement = element.cloneNode(true) as HTMLElement;
    element.parentNode?.replaceChild(newElement, element);
    
    // Re-query the chars after cloning
    const updatedChars = newElement.querySelectorAll(`.char-${uniqueId}`);

    newElement.addEventListener('mouseenter', (e) => {
      e.stopPropagation(); // Prevent event bubbling
      
      // Only animate this specific element's characters
      updatedChars.forEach((char: Element, index: number) => {
        const charElement = char as HTMLElement;
        const originalSpan = charElement.querySelector(`.char-original-${uniqueId}`) as HTMLElement;
        const hoverSpan = charElement.querySelector(`.char-hover-${uniqueId}`) as HTMLElement;
        
        if (originalSpan && hoverSpan) {
          // Create rolling effect - original text rolls up, hover text rolls in from bottom
          gsap.to(originalSpan, {
            y: '-100%',
            duration: 0.6,
            delay: index * 0.03, // Stagger each character
            ease: 'power2.out'
          });
          
          gsap.to(hoverSpan, {
            y: '0%',
            duration: 0.6,
            delay: index * 0.03, // Stagger each character
            ease: 'power2.out'
          });
        }
      });

      // Also animate the container
      gsap.to(newElement, {
        x: newElement.classList.contains('link') ? 20 : 30,
        scale: newElement.classList.contains('link') ? 1.1 : 1.05,
        duration: 0.4,
        ease: 'power2.out'
      });
    });

    newElement.addEventListener('mouseleave', (e) => {
      e.stopPropagation(); // Prevent event bubbling
      
      // Reverse the rolling effect - hover text rolls down, original text rolls back
      updatedChars.forEach((char: Element, index: number) => {
        const charElement = char as HTMLElement;
        const originalSpan = charElement.querySelector(`.char-original-${uniqueId}`) as HTMLElement;
        const hoverSpan = charElement.querySelector(`.char-hover-${uniqueId}`) as HTMLElement;
        
        if (originalSpan && hoverSpan) {
          gsap.to(originalSpan, {
            y: '0%',
            duration: 0.4,
            delay: index * 0.02, // Faster reverse stagger
            ease: 'power2.out'
          });
          
          gsap.to(hoverSpan, {
            y: '100%',
            duration: 0.4,
            delay: index * 0.02, // Faster reverse stagger
            ease: 'power2.out'
          });
        }
      });

      // Reset container position
      gsap.to(newElement, {
        x: 0,
        scale: 1,
        duration: 0.4,
        ease: 'power2.out'
      });
    });
  }



  private animateMenu(isOpen: boolean) {
    const menu = this.el.nativeElement.querySelector('.menu');
    const links = this.el.nativeElement.querySelectorAll('.link');
    const socialLinks = this.el.nativeElement.querySelectorAll('.socials p');
    const headerSpans = this.el.nativeElement.querySelectorAll('.header h1 span');
    const subscribeLinks = this.el.nativeElement.querySelectorAll('.subscribe-link-container p');

    if (isOpen) {
      // Store the animation timeline
      const timeline = gsap.timeline();
      this.animations.push(timeline);

      timeline.to(menu, {
        clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
        ease: "hop",
        duration: 1.5,
        onStart: () => {
          menu.style.pointerEvents = "all";
        },
        onComplete: () => {
          // Menu is fully open - hover animations disabled for testing
          // this.setupLinkHoverAnimations();
        }
      });

      gsap.to(links, {
        y: 0,
        opacity: 1,
        stagger: 0.1,
        delay: 0.85,
        duration: 1,
        ease: "power3.out"
      });

      gsap.to(socialLinks, {
        y: 0,
        opacity: 1,
        stagger: 0.05,
        delay: 0.85,
        duration: 1,
        ease: "power3.out"
      });

      // Animate subscribe links
      gsap.to(subscribeLinks, {
        y: 0,
        opacity: 1,
        stagger: 0.05,
        delay: 0.9,
        duration: 1,
        ease: "power3.out"
      });

      gsap.to('.video-wrapper', {
        clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
        ease: "hop",
        duration: 1.5,
        delay: 0.5
      });

      gsap.to(headerSpans, {
        rotateY: 0,
        stagger: 0.05,
        delay: 0.75,
        duration: 1.5,
        ease: "power4.out"
      });

      gsap.to(headerSpans, {
        y: 0,
        scale: 1,
        stagger: 0.05,
        delay: 0.5,
        duration: 1.5,
        ease: "power4.out"
      });
    } else {
      // Reset all hover states before closing
      this.resetAllHoverStates();
      
      gsap.to(menu, {
        clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)",
        ease: "hop",
        duration: 1.5,
        onComplete: () => {
          menu.style.pointerEvents = "none";
          gsap.set(menu, {
            clipPath: "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)"
          });
          gsap.set(links, { y: 30, opacity: 0 });
          gsap.set(socialLinks, { y: 30, opacity: 0 });
          gsap.set(subscribeLinks, { y: 30, opacity: 0 });
          gsap.set('.video-wrapper', {
            clipPath: "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)"
          });
          gsap.set(headerSpans, {
            y: 500,
            rotateY: 90,
            scale: 0.8
          });
        }
      });
    }
  }

  private resetAllHoverStates(): void {
    // Reset all link hover states
    const allLinks = this.el.nativeElement.querySelectorAll('.links .link a, .socials a, .subscribe-link-container .link');
    
    allLinks.forEach((link: HTMLElement) => {
      // Reset container position and scale
      gsap.set(link, { x: 0, scale: 1 });
      
      // Reset all character animations (using broader selectors to catch all variations)
      const chars = link.querySelectorAll('[class*="char-"]');
      chars.forEach((char: Element) => {
        const charElement = char as HTMLElement;
        const originalSpan = charElement.querySelector('[class*="char-original-"]') as HTMLElement;
        const hoverSpan = charElement.querySelector('[class*="char-hover-"]') as HTMLElement;
        
        if (originalSpan && hoverSpan) {
          gsap.set(originalSpan, { y: '0%' });
          gsap.set(hoverSpan, { y: '100%' });
        }
      });
    });
  }
}