import { Component, ElementRef, AfterViewInit, OnDestroy, Renderer2 } from '@angular/core';

@Component({
  standalone: false,
  selector: 'app-logo',
  template: `
    <div class="logo" #logoElement>
      <a [routerLink]="['/']">True Bread</a>
    </div>
  `,
  styleUrls: ['./logo.component.scss']
})
export class LogoComponent implements AfterViewInit, OnDestroy {
  private observer: IntersectionObserver | null = null;
  private colorObserver: MutationObserver | null = null;
  private logoElement: HTMLElement | null = null;

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  ngAfterViewInit() {
    this.logoElement = this.el.nativeElement.querySelector('.logo');

    // Set up intersection observer to detect when logo is visible
    this.setupIntersectionObserver();

    // Set up mutation observer to detect background color changes
    this.setupMutationObserver();

    // Initial color check
    this.checkBackgroundColor();
  }

  ngOnDestroy() {
    // Clean up observers
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }

    if (this.colorObserver) {
      this.colorObserver.disconnect();
      this.colorObserver = null;
    }
  }

  private setupIntersectionObserver() {
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.checkBackgroundColor();
        }
      });
    }, { threshold: 0.1 });

    if (this.logoElement) {
      this.observer.observe(this.logoElement);
    }
  }

  private setupMutationObserver() {
    this.colorObserver = new MutationObserver(() => {
      this.checkBackgroundColor();
    });

    // Observe changes to the parent elements that might affect background color
    const parentElement = this.el.nativeElement.parentElement;
    if (parentElement) {
      this.colorObserver.observe(parentElement, {
        attributes: true,
        attributeFilter: ['class', 'style']
      });
    }
  }

  private checkBackgroundColor() {
    if (!this.logoElement) return;

    // Get the background color of the element behind the logo
    const parentElement = this.logoElement.parentElement;
    if (!parentElement) return;

    const bgColor = this.getBackgroundColor(parentElement);

    // Determine if the background is dark or light
    const isDark = this.isColorDark(bgColor);

    // Set the logo color based on background brightness
    if (isDark) {
      this.renderer.setProperty(document.documentElement, 'style', '--logo-color: #ffffff');
    } else {
      this.renderer.setProperty(document.documentElement, 'style', '--logo-color: #000000');
    }
  }

  private getBackgroundColor(element: HTMLElement): string {
    const bgColor = window.getComputedStyle(element).backgroundColor;

    // If the background is transparent, check the parent element
    if (bgColor === 'rgba(0, 0, 0, 0)' || bgColor === 'transparent') {
      const parent = element.parentElement;
      if (parent) {
        return this.getBackgroundColor(parent);
      }
    }

    return bgColor;
  }

  private isColorDark(color: string): boolean {
    // Parse the color string to get RGB values
    let r, g, b;

    if (color.startsWith('rgb')) {
      const match = color.match(/\d+/g);
      if (match && match.length >= 3) {
        r = parseInt(match[0], 10);
        g = parseInt(match[1], 10);
        b = parseInt(match[2], 10);
      } else {
        return false; // Default to light if parsing fails
      }
    } else {
      // Default to light for other color formats
      return false;
    }

    // Calculate relative luminance
    // Formula: 0.299*R + 0.587*G + 0.114*B
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

    // If luminance is less than 0.5, consider it dark
    return luminance < 0.5;
  }
}