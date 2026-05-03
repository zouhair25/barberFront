import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink,ReactiveFormsModule],
  templateUrl: './register.component.html',
})
export class RegisterComponent {
  role: 'USER' | 'BARBER' = 'USER';
  loading = signal(false);
  error = signal('');
  userForm : FormGroup |any;
  constructor(private auth: AuthService, private router: Router, private fb: FormBuilder) {}

  register() {
    
    this.loading.set(true);
    this.error.set('');
    this.userForm?.patchValue({role:this.role})
    this.auth.register(this.userForm.value).subscribe({
      next: res => {
        this.loading.set(false);
        if (res.role === 'BARBER') this.router.navigate(['/barber/register-complete']);
        //else this.router.navigate(['/']);
      },
      error: err => {
        this.loading.set(false);
        this.error.set(err.error?.message || 'Erreur lors de l\'inscription');
      }
    });
  }

  ngOnInit(): void {
    this.userForm = this.fb.group({
      firstName: ['',[Validators.required,Validators.minLength(2)]],
      lastName: ['',[Validators.required,Validators.minLength(2)]],
      email: ['',[Validators.required,Validators.email]],
      password: ['',[Validators.required,Validators.minLength(6)]],
      phone: ['',[Validators.required,Validators.pattern(/^[0-9]{8,15}$/)]],
      role: [''],
    })
    
  }
}
