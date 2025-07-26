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
    if (!environment.googleAnalytics.measurementId) {
      console.warn('Google Analytics Measurement ID not found in environment');
      return;
    }

    // Load Google Analytics script
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${environment.googleAnalytics.measurementId}`;
    document.head.appendChild(script);

    // Initialize gtag
    script.onload = () => {
      (window as any).dataLayer = (window as any).dataLayer || [];
      gtag = function() {
        (window as any).dataLayer.push(arguments);
      };
      gtag('js', new Date());
      gtag('config', environment.googleAnalytics.measurementId, {
        page_title: document.title,
        page_location: window.location.href
      });
    };
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
    if (typeof gtag !== 'undefined') {
      gtag('config', environment.googleAnalytics.measurementId, {
        page_path: url,
        page_title: document.title,
        page_location: window.location.href
      });
    }
  }

  // Track custom events
  trackEvent(action: string, category: string, label?: string, value?: number) {
    if (typeof gtag !== 'undefined') {
      gtag('event', action, {
        event_category: category,
        event_label: label,
        value: value
      });
    }
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
