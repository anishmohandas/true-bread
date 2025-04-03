import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SubscriptionService } from '../../services/subscription.service';

@Component({
  selector: 'app-subscription',
  templateUrl: './subscription.component.html',
  styleUrls: ['./subscription.component.scss']
})
export class SubscriptionComponent {
  subscriptionForm: FormGroup;
  submitting = false;
  success = false;
  error: string | null = null;

  constructor(
    private fb: FormBuilder,
    private subscriptionService: SubscriptionService
  ) {
    this.subscriptionForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]]
    });
  }

  getNameErrorMessage(): string {
    const nameControl = this.subscriptionForm.get('name');
    
    if (nameControl?.hasError('required')) {
      return 'Name is required';
    }
    
    if (nameControl?.hasError('minlength')) {
      return 'Name must be at least 2 characters long';
    }
    
    return '';
  }

  getEmailErrorMessage(): string {
    const emailControl = this.subscriptionForm.get('email');
    
    if (emailControl?.hasError('required')) {
      return 'Email is required';
    }
    
    if (emailControl?.hasError('email')) {
      return 'Please enter a valid email address';
    }
    
    return '';
  }

  onSubmit(): void {
    if (this.subscriptionForm.valid && !this.submitting) {
      this.submitting = true;
      this.error = null;
      
      const formData = this.subscriptionForm.value;
      
      this.subscriptionService.subscribe(formData)
        .subscribe({
          next: () => {
            this.success = true;
            this.subscriptionForm.reset();
            setTimeout(() => this.success = false, 5000);
          },
          error: (error) => {
            this.error = error.message;
          },
          complete: () => {
            this.submitting = false;
          }
        });
    }
  }
}




