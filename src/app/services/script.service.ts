import { Injectable } from '@angular/core';
import { Observable, forkJoin, from } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ScriptService {
  private scripts: any = {};

  load(scripts: string[]): Observable<any[]> {
    const observables = scripts.map(script => this.loadScript(script));
    return forkJoin(observables);
  }

  private loadScript(name: string): Observable<any> {
    return new Observable(observer => {
      // Return cached script if already loaded
      if (this.scripts[name]?.loaded) {
        observer.next(this.scripts[name]);
        observer.complete();
        return;
      }

      // Create script element and set attributes
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = name;
      script.async = false;

      // Create observable for script loading
      this.scripts[name] = {
        loaded: false,
        observer: observer
      };

      // Script event listeners
      script.onload = () => {
        this.scripts[name].loaded = true;
        observer.next(this.scripts[name]);
        observer.complete();
      };

      script.onerror = (error: any) => {
        observer.error(`Could not load script ${name}`);
      };

      // Add script to document
      document.getElementsByTagName('head')[0].appendChild(script);
    });
  }
}