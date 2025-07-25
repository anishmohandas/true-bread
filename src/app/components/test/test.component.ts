import { Component } from '@angular/core';

@Component({
  selector: 'app-test',
  template: `
    <div style="background: red; color: white; padding: 20px; margin: 20px;">
      <h1>TEST COMPONENT IS WORKING!</h1>
      <p>If you can see this, the router-outlet is working.</p>
    </div>
  `,
  styles: []
})
export class TestComponent {
  constructor() {
    console.log('🧪 TEST COMPONENT LOADED!');
  }
}
