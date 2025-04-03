import { Component, OnInit, ElementRef } from '@angular/core';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface MenuItem {
  text: string;
  link: string;
}

interface SocialLink {
  icon: string;
  link: string;
  alt: string;
}

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit {
  constructor(private el: ElementRef) {}

  ngOnInit() {
    this.initFooterAnimation();
  }

  private initFooterAnimation() {
    // Get the footer content element for animation
    const footerContent = this.el.nativeElement.querySelector('.footer-content');

    // Set initial state - make content visible by default
    gsap.set(footerContent, {
      opacity: 1, // Fully visible
      y: 0 // No offset
    });

    // Log for debugging
    console.log('Footer content should be visible');
  }
  contactInfo = {
    phone: '+91 949 533 6764',
    email: 'contact@thetruebread.com'
  };

  menuItems1: MenuItem[] = [
    { text: 'About', link: '/about' },
    { text: 'Contact', link: '/contact' }
  ];

  menuItems2: MenuItem[] = [
    { text: 'Terms', link: '#' },
    { text: 'Privacy', link: '#' }
  ];

  socialLinks: SocialLink[] = [
    { icon: 'assets/images/facebook.svg', link: '#', alt: 'Facebook' },
    { icon: 'assets/images/x-social-media-white-icon.svg', link: '#', alt: 'X' },
    { icon: 'assets/images/instagram.svg', link: '#', alt: 'Instagram' }
  ];
}


