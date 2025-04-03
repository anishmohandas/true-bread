import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EmailService } from '../../services/email.service';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss']
})
export class ContactComponent {
  contactForm: FormGroup;
  submitting = false;
  success = false;
  error: string | null = null;

  contactInfo = {
    address: [
      'True Bread Media',
      'Marayamuttom PO',
      'Trivandrum, 695124',
      'India'
    ],
    email: 'truebreadmedia@gmail.com',
    phone: '+1-543-123-4567'
  };

  constructor(
    private fb: FormBuilder,
    private emailService: EmailService
  ) {
    this.contactForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      subject: ['', Validators.required],
      message: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  getErrorMessage(field: string): string {
    const control = this.contactForm.get(field);
    
    if (!control?.errors) return '';

    if (control.hasError('required')) {
      return `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
    }
    
    if (control.hasError('email')) {
      return 'Please enter a valid email address';
    }
    
    if (control.hasError('minlength')) {
      const minLength = control.errors['minlength'].requiredLength;
      return `${field.charAt(0).toUpperCase() + field.slice(1)} must be at least ${minLength} characters long`;
    }
    
    return '';
  }

  onSubmit(): void {
    if (this.contactForm.valid && !this.submitting) {
      this.submitting = true;
      this.error = null;
      
      this.emailService.sendContactEmail(this.contactForm.value)
        .subscribe({
          next: () => {
            this.success = true;
            this.contactForm.reset();
            setTimeout(() => this.success = false, 5000);
          },
          error: (error) => {
            this.error = 'Failed to send message. Please try again later.';
            console.error('Contact form submission error:', error);
          },
          complete: () => {
            this.submitting = false;
          }
        });
    }
  }
}
