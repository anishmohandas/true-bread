import { Injectable } from '@angular/core';
import { Router, Event, NavigationEnd } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { filter } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AnimationService {
  private hasSeenPreloader = new BehaviorSubject<boolean>(this.getStoredPreloaderState());
  hasSeenPreloader$ = this.hasSeenPreloader.asObservable();

  private preloaderComplete = new BehaviorSubject<void>(undefined);
  preloaderComplete$ = this.preloaderComplete.asObservable();

  constructor(private router: Router) {
    // Reset preloader state when navigating away from home
    this.router.events.pipe(
      filter((event: Event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      if (event.url !== '/') {
        this.setPreloaderSeen();
      }
    });
  }

  private getStoredPreloaderState(): boolean {
    return localStorage.getItem('hasSeenPreloader') === 'true';
  }

  setPreloaderSeen(): void {
    console.log('Setting preloader as seen');
    localStorage.setItem('hasSeenPreloader', 'true');
    this.hasSeenPreloader.next(true);
  }

  notifyPreloaderComplete(): void {
    console.log('Notifying preloader complete');
    this.preloaderComplete.next();
  }

  resetPreloader(): void {
    if (this.router.url === '/') {
      // Only reset the preloader if it hasn't been seen before
      if (!this.getStoredPreloaderState()) {
        this.hasSeenPreloader.next(false);
      }
    }
  }
}
