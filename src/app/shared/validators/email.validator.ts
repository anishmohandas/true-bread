import { AbstractControl, ValidationErrors } from '@angular/forms';
import { validateEmail } from '../../../../shared/validators';

export function emailValidator(control: AbstractControl): ValidationErrors | null {
  const result = validateEmail(control.value);
  return result.isValid ? null : { invalidEmail: result.error };
}