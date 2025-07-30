import { Injectable } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { environment } from '../../environments/environment';

declare let gtag: Function;

@Injectable({
  providedIn: 'root'
})
export class GoogleAnalyticsService {

  constructor(private router: Router) {
    this.initializeGoogleAnalytics();
    this.trackRouteChanges();
  }

  private initializeGoogleAnalytics() {
    // Check if measurement ID exists and is not a placeholder
    if (!environment.googleAnalytics?.measurementId || 
        environment.googleAnalytics.measurementId === 'G-XXXXXXXXXX' ||
        environment.googleAnalytics.measurementId.startsWith('G-XXXXXXXXXX')) {
      console.warn('Google Analytics Measurement ID not configured or is placeholder. Skipping GA initialization.');
      return;
    }

    try {
      // Load Google Analytics script
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${environment.googleAnalytics.measurementId}`;
      document.head.appendChild(script);

      // Initialize gtag
      script.onload = () => {
        try {
          (window as any).dataLayer = (window as any).dataLayer || [];
          (window as any).gtag = function() {
            (window as any).dataLayer.push(arguments);
          };
          gtag = (window as any).gtag;
          gtag('js', new Date());
          gtag('config', environment.googleAnalytics.measurementId, {
            page_title: document.title,
            page_location: window.location.href
          });
        } catch (error) {
          console.warn('Error initializing Google Analytics:', error);
        }
      };

      script.onerror = () => {
        console.warn('Failed to load Google Analytics script');
      };
    } catch (error) {
      console.warn('Error setting up Google Analytics:', error);
    }
  }

  private trackRouteChanges() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event) => {
      const navEvent = event as NavigationEnd;
      this.trackPageView(navEvent.urlAfterRedirects);
    });
  }

  // Track page views
  trackPageView(url: string) {
    if (this.isGoogleAnalyticsEnabled() && typeof gtag !== 'undefined') {
      try {
        gtag('config', environment.googleAnalytics.measurementId, {
          page_path: url,
          page_title: document.title,
          page_location: window.location.href
        });
      } catch (error) {
        console.warn('Error tracking page view:', error);
      }
    }
  }

  // Track custom events
  trackEvent(action: string, category: string, label?: string, value?: number) {
    if (this.isGoogleAnalyticsEnabled() && typeof gtag !== 'undefined') {
      try {
        gtag('event', action, {
          event_category: category,
          event_label: label,
          value: value
        });
      } catch (error) {
        console.warn('Error tracking event:', error);
      }
    }
  }

  // Helper method to check if Google Analytics is properly configured
  private isGoogleAnalyticsEnabled(): boolean {
    return !!(environment.googleAnalytics?.measurementId && 
             environment.googleAnalytics.measurementId !== 'G-XXXXXXXXXX' &&
             !environment.googleAnalytics.measurementId.startsWith('G-XXXXXXXXXX'));
  }

  // Track PDF downloads
  trackPdfDownload(pdfName: string, issueId?: string) {
    this.trackEvent('download', 'PDF', `${pdfName}${issueId ? ` - ${issueId}` : ''}`, 1);
  }

  // Track PDF views
  trackPdfView(pdfName: string, issueId?: string) {
    this.trackEvent('view', 'PDF', `${pdfName}${issueId ? ` - ${issueId}` : ''}`, 1);
  }

  // Track subscription attempts
  trackSubscription(email: string, success: boolean) {
    this.trackEvent(success ? 'subscribe_success' : 'subscribe_attempt', 'Newsletter', email, success ? 1 : 0);
  }

  // Track menu interactions
  trackMenuInteraction(menuItem: string) {
    this.trackEvent('click', 'Menu', menuItem, 1);
  }

  // Track social media clicks
  trackSocialClick(platform: string) {
    this.trackEvent('click', 'Social', platform, 1);
  }

  // Track scroll depth
  trackScrollDepth(percentage: number) {
    this.trackEvent('scroll', 'Engagement', `${percentage}%`, percentage);
  }

  // Track time on page
  trackTimeOnPage(seconds: number, page: string) {
    this.trackEvent('time_on_page', 'Engagement', page, seconds);
  }
}
