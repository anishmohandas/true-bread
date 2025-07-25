import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ScrollService {
  resizeCallback: (() => void) | null = null;

  triggerResize() {
    if (this.resizeCallback) {
      this.resizeCallback();
    }
  }
}