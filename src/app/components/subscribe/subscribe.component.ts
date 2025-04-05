import { Component, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-subscribe',
  templateUrl: './subscribe.component.html',
  styleUrls: ['./subscribe.component.scss'],
  encapsulation: ViewEncapsulation.None // This allows us to style child components
})
export class SubscribeComponent {
  // This component will simply host the subscription component
}
