import { Component, Output, EventEmitter, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';

@Component({
  standalone: false,
  selector: 'app-menu-toggle',
  templateUrl: './menu-toggle.component.html',
  styleUrls: ['./menu-toggle.component.scss']
})
export class MenuToggleComponent implements OnInit, OnDestroy {
  @Output() menuToggled = new EventEmitter<boolean>();
  isOpen = false;

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    window.addEventListener('menuStateChange', this.handleMenuStateChange.bind(this));
  }

  ngOnDestroy() {
    window.removeEventListener('menuStateChange', this.handleMenuStateChange.bind(this));
  }

  private handleMenuStateChange(event: any) {
    if (event.detail) {
      this.isOpen = event.detail.isOpen;
      this.cdr.detectChanges();
    }
  }

  toggleMenu() {
    this.isOpen = !this.isOpen;
    this.menuToggled.emit(this.isOpen);
  }
}





